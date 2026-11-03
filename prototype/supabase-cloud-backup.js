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
    const checklistStats = calculateChecklistStats(state, getChecklistDefinitions());
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
    return Object.freeze({ row, photosExcluded: stats.removed, photosUploaded: manifest.length, checklistStats, created: !reference });
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
    const checklistId = idFactory();
    let manifest = [];
    if (photoSync) {
      const result = await photoSync.uploadState({ state, checklistId, revision: 1 });
      manifest = result.manifest;
    }
    const payload = { mode, state: cloneWithoutPhotos(state, stats), photos: manifest };
    const title = [label, state.general?.type || mode, state.general?.number || ""]
      .filter(Boolean).join(" — ").slice(0, 200);
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
