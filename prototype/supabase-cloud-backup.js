import { createCloudSync } from "./supabase-cloud-sync.js";

function cloneWithoutPhotos(value, stats = { removed: 0 }) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneWithoutPhotos(item, stats));
  }
  if (!value || typeof value !== "object") return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === "__cloudChecklistId") continue;
    if (/_photo$/i.test(key)) {
      if (item) stats.removed += 1;
      continue;
    }
    result[key] = cloneWithoutPhotos(item, stats);
  }
  return result;
}

function stableJson(value) {
  if (Array.isArray(value)) return "[" + value.map(stableJson).join(",") + "]";
  if (!value || typeof value !== "object") return JSON.stringify(value);
  return "{" + Object.keys(value).sort().map((key) =>
    JSON.stringify(key) + ":" + stableJson(value[key])
  ).join(",") + "}";
}

function calculateChecklistStats(state, definitions = []) {
  const counters = { total: 0, answered: 0, deviations: 0 };
  for (const equipment of definitions || []) {
    if (!equipment || typeof equipment.id !== "string") continue;
    const fields = Array.isArray(equipment.fields) ? equipment.fields : [];
    const instances = Array.isArray(equipment.instances) && equipment.instances.length
      ? equipment.instances
      : Object.keys(state.values ?? {})
          .filter((id) => id.startsWith(equipment.id + "|"))
          .map((id) => ({ id }));
    const seenInstances = new Set();
    for (const instance of instances) {
      const instanceId = instance.id || [equipment.id, instance.section].join("|");
      if (seenInstances.has(instanceId)) continue;
      seenInstances.add(instanceId);
      const values = state.values?.[instanceId] ?? {};
      for (const field of (Array.isArray(instance.fields) ? instance.fields : fields)) {
        if (!field || field.calc === false) continue;
        if ((field.type === "select" || Array.isArray(field.options)) && Array.isArray(field.ok) && field.ok.length === 0) continue;
        counters.total += 1;
        const raw = values[field.key];
        if (raw === null || raw === undefined || String(raw).trim() === "") continue;
        counters.answered += 1;
        if (String(raw).trim().toLowerCase() === "не требуется") continue;
        if (Array.isArray(field.ok) && field.ok.length > 0 &&
            !field.ok.some((accepted) => String(accepted).trim().toLowerCase() === String(raw).trim().toLowerCase())) {
          counters.deviations += 1;
        }
      }
    }
  }
  return Object.freeze({
    total: counters.total,
    answered: counters.answered,
    completionPercent: counters.total ? Math.round(counters.answered / counters.total * 100) : 0,
    deviations: counters.deviations,
  });
}

export function createChecklistCloudBackup({
  authApi,
  storage = globalThis.localStorage,
  getState,
  getMode,
  getStorageKey,
  getChecklistDefinitions = () => [],
  getChecklistStats = () => null,
  getChecklistType = () => "",
  cloudApi: injectedCloudApi,
  photoSync,
  idFactory = () => crypto.randomUUID(),
  identityFactory = () => crypto.randomUUID(),
  persistState = () => true,
} = {}) {
  if (!authApi || !storage || typeof getState !== "function" ||
      typeof getMode !== "function" || typeof getStorageKey !== "function") {
    throw new Error("Для облачной копии нужны Auth, storage и функции доступа к состоянию");
  }

  const cloud = injectedCloudApi || createCloudSync(authApi);

  async function saveCurrent() {
    const identity = await authApi.getCurrentIdentity();
    const userId = identity?.user?.id;
    if (identity?.error || !userId) {
      const error = new Error("Сначала войдите в аккаунт Supabase");
      error.code = "AUTH_REQUIRED";
      throw error;
    }

    const storageKey = getStorageKey();
    if (typeof storageKey !== "string" ||
        !storageKey.endsWith("::user:" + userId)) {
      const error = new Error("Локальное хранилище не соответствует текущему аккаунту");
      error.code = "STORAGE_SCOPE_MISMATCH";
      throw error;
    }

    const state = getState();
    if (!state || typeof state !== "object" || Array.isArray(state)) {
      throw new Error("Нет данных чек-листа для облачной копии");
    }

    // Cloud references are scoped to one local checklist instance, not the whole mode/account.
    let localChecklistId = state.__cloudChecklistId;
    if (typeof localChecklistId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(localChecklistId)) {
      localChecklistId = identityFactory();
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(localChecklistId)) {
        const error = new Error("Не удалось создать идентификатор локального чек-листа");
        error.code = "INVALID_CHECKLIST_IDENTITY";
        throw error;
      }
      try { state.__cloudChecklistId = localChecklistId; }
      catch {
        const error = new Error("Не удалось сохранить идентификатор локального чек-листа");
        error.code = "CHECKLIST_IDENTITY_UNAVAILABLE";
        throw error;
      }
      if (persistState() === false) {
        const error = new Error("Не удалось сохранить идентификатор чек-листа локально");
        error.code = "CHECKLIST_IDENTITY_UNAVAILABLE";
        throw error;
      }
    }

    const refKey = storageKey + "::cloud-ref::" + localChecklistId;
    let reference = null;
    const stored = storage.getItem(refKey);
    if (stored) {
      try {
        reference = JSON.parse(stored);
      } catch {
        const error = new Error("Повреждена локальная ссылка на облачную запись. Не создаю дубликат автоматически.");
        error.code = "INVALID_CLOUD_REFERENCE";
        throw error;
      }
      if (!reference?.id || !Number.isSafeInteger(reference?.revision) || reference.revision < 1) {
        const error = new Error("Локальная ссылка на облачную запись неполная. Не создаю дубликат автоматически.");
        error.code = "INVALID_CLOUD_REFERENCE";
        throw error;
      }
    }

    const stats = { removed: 0 };
    const mode = String(getMode() || "unknown");
    const modeLabels = { complex: "Комплексный чек-лист", housings: "КМБ", tt: "ТТ", bi: "БИ", hydro: "Гидродемпферы" };
    const checklistType = String(getChecklistType() || modeLabels[mode] || mode).slice(0, 120);
    const checklistId = reference?.id || idFactory();
    const nextRevision = reference ? reference.revision + 1 : 1;
    let manifest = [];
    let uploaded = false;
    if (photoSync) {
      const result = await photoSync.uploadState({ state, checklistId, revision: nextRevision });
      manifest = result.manifest;
      uploaded = manifest.length > 0;
    }
    const authoritativeStats = getChecklistStats();
    const checklistStats = authoritativeStats && Number.isFinite(Number(authoritativeStats.percent))
      ? Object.freeze({
          total: Number(authoritativeStats.totalFields) || 0,
          answered: Number(authoritativeStats.filledTotal) || 0,
          completionPercent: Math.max(0, Math.min(100, Math.floor(Number(authoritativeStats.percent)))),
          deviations: Math.max(0, Number(authoritativeStats.badInstances) || 0),
          totalInstances: Number(authoritativeStats.totalInstances) || 0,
          okInstances: Number(authoritativeStats.okInstances) || 0,
          badInstances: Number(authoritativeStats.badInstances) || 0,
          allFieldsCount: Number(authoritativeStats.allFieldsCount) || 0,
          filledFieldsCount: Number(authoritativeStats.filledFieldsCount) || 0,
          filledGeneral: Number(authoritativeStats.filledGeneral) || 0,
          totalFields: Number(authoritativeStats.totalFields) || 0,
          filledTotal: Number(authoritativeStats.filledTotal) || 0,
        })
      : calculateChecklistStats(state, getChecklistDefinitions());
    const payload = {
      mode,
      checklistType,
      state: cloneWithoutPhotos(state, stats),
      photos: manifest,
      stats: checklistStats,
    };
    const title = [
      "Чек-лист",
      state.general?.type || getMode(),
      state.general?.number || "",
    ].filter(Boolean).join(" — ").slice(0, 200);
    const equipmentType = String(state.general?.type || "").slice(0, 120);

    // Read the exact previous revision's manifest before attempting the CAS write.
    // Cleanup is best-effort: inability to inspect old metadata must never block saving.
    let previousManifest = null;
    if (reference && photoSync && typeof cloud.get === "function") {
      try {
        const previousRow = await cloud.get(reference.id);
        const oldPhotos = previousRow?.revision === reference.revision &&
          Array.isArray(previousRow?.payload?.photos)
          ? previousRow.payload.photos
          : null;
        const isUuid = (value) => typeof value === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
        const belongsToChecklist = isUuid(reference.id) && oldPhotos && oldPhotos.every((entry) => {
          if (!entry || typeof entry.path !== "string" ||
              typeof entry.itemId !== "string" || typeof entry.field !== "string" ||
              !entry.itemId || !entry.field) return false;
          const parts = entry.path.split("/");
          const isNewPath = parts.length === 4 && isUuid(parts[3]);
          const encodedItemId = encodeURIComponent(entry.itemId);
          const fieldPrefix = encodeURIComponent(entry.field) + "-";
          const isLegacyPath = parts.length === 5 &&
            parts[3] === encodedItemId && parts[4].startsWith(fieldPrefix) &&
            isUuid(parts[4].slice(fieldPrefix.length));
          // Validate the full owner/checklist/revision path before any deletion.
          // A malformed or mixed manifest is left untouched as a whole.
          return parts[0] === userId && parts[1] === reference.id &&
            parts[2] === String(reference.revision) && (isNewPath || isLegacyPath);
        });
        if (belongsToChecklist && oldPhotos.length) previousManifest = oldPhotos;
      } catch {
        previousManifest = null;
      }
    }

    let row;
    try {
      row = reference
        ? await cloud.update({
            id: reference.id,
            expectedRevision: reference.revision,
            title,
            equipmentType,
            payload,
          })
        : await cloud.create({ id: checklistId, title, equipmentType, payload });
    } catch (error) {
      if (uploaded) {
        try { await photoSync.removeManifest(manifest); }
        catch (cleanupError) { error.cleanupError = cleanupError; }
      }
      throw error;
    }

    storage.setItem(refKey, JSON.stringify({ id: row.id, revision: row.revision }));
    let photosCleanup = Object.freeze({ removed: 0, warning: false });
    if (previousManifest?.length) {
      try {
        const removed = await photoSync.removeManifest(previousManifest);
        photosCleanup = Object.freeze({ removed: Number(removed) || 0, warning: false });
      } catch {
        // The new revision is already committed; report cleanup trouble without failing the save.
        photosCleanup = Object.freeze({ removed: 0, warning: true });
      }
    }
    return Object.freeze({ row, photosExcluded: stats.removed, photosUploaded: manifest.length, checklistStats, created: !reference, photosCleanup });
  }

  async function createSnapshot({ label = "Перед восстановлением из облака" } = {}) {
    const identity = await authApi.getCurrentIdentity();
    const userId = identity?.user?.id;
    if (identity?.error || !userId) {
      const error = new Error("Сначала войдите в аккаунт Supabase");
      error.code = "AUTH_REQUIRED";
      throw error;
    }

    const storageKey = getStorageKey();
    if (typeof storageKey !== "string" ||
        !storageKey.endsWith("::user:" + userId)) {
      const error = new Error("Локальное хранилище не соответствует текущему аккаунту");
      error.code = "STORAGE_SCOPE_MISMATCH";
      throw error;
    }

    const state = getState();
    if (!state || typeof state !== "object" || Array.isArray(state)) {
      throw new Error("Нет данных чек-листа для резервной копии");
    }

    const stats = { removed: 0 };
    const mode = String(getMode() || "unknown");
    const snapshotState = cloneWithoutPhotos(state, stats);
    const title = [label, state.general?.type || mode, state.general?.number || ""]
      .filter(Boolean).join(" — ").slice(0, 200);

    // Reuse an identical safety snapshot instead of creating another cloud row
    // every time the same restore is opened/retried. If listing fails, preserve
    // the original safety behavior and create a fresh snapshot.
    // A photo-free state signature cannot prove that two snapshots contain the
    // same photos. Never reuse a deduplicated snapshot when local photos exist:
    // upload a fresh manifest so the pre-restore safety copy protects them too.
    if (stats.removed === 0 && typeof cloud.list === "function") {
      try {
        const existingRows = await cloud.list();
        const stateSignature = stableJson(snapshotState);
        const duplicate = existingRows.find((candidate) =>
          candidate?.title === title &&
          candidate?.equipment_type === mode &&
          candidate?.payload?.mode === mode &&
          candidate?.payload?.state &&
          stableJson(candidate.payload.state) === stateSignature
        );
        if (duplicate) {
          return Object.freeze({
            row: duplicate, photosExcluded: stats.removed,
            photosUploaded: 0, reused: true,
          });
        }
      } catch {
        // A transient list failure must not prevent creation of a safety copy.
      }
    }

    const checklistId = idFactory();
    let manifest = [];
    if (photoSync) {
      const result = await photoSync.uploadState({ state, checklistId, revision: 1 });
      manifest = result.manifest;
    }
    const payload = { mode, state: snapshotState, photos: manifest };
    let row;
    try {
      row = await cloud.create({
        id: checklistId,
        title,
        equipmentType: mode.slice(0, 120),
        payload,
      });
    } catch (error) {
      if (manifest.length) {
        try { await photoSync.removeManifest(manifest); }
        catch (cleanupError) { error.cleanupError = cleanupError; }
      }
      throw error;
    }
    return Object.freeze({ row, photosExcluded: stats.removed, photosUploaded: manifest.length });
  }

  return Object.freeze({ saveCurrent, createSnapshot });
}
