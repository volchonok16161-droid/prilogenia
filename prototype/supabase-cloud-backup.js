import { createCloudSync } from "./supabase-cloud-sync.js";

function cloneWithoutPhotos(value, stats = { removed: 0 }) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneWithoutPhotos(item, stats));
  }
  if (!value || typeof value !== "object") return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (/_photo$/i.test(key)) {
      if (item) stats.removed += 1;
      continue;
    }
    result[key] = cloneWithoutPhotos(item, stats);
  }
  return result;
}

export function createChecklistCloudBackup({
  authApi,
  storage = globalThis.localStorage,
  getState,
  getMode,
  getStorageKey,
  cloudApi: injectedCloudApi,
  photoSync,
  idFactory = () => crypto.randomUUID(),
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

    const refKey = storageKey + "::cloud-ref";
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
    const checklistId = reference?.id || idFactory();
    const nextRevision = reference ? reference.revision + 1 : 1;
    let manifest = [];
    let uploaded = false;
    if (photoSync) {
      const result = await photoSync.uploadState({ state, checklistId, revision: nextRevision });
      manifest = result.manifest;
      uploaded = manifest.length > 0;
    }
    const payload = {
      mode,
      state: cloneWithoutPhotos(state, stats),
      photos: manifest,
    };
    const title = [
      "Чек-лист",
      state.general?.type || getMode(),
      state.general?.number || "",
    ].filter(Boolean).join(" — ").slice(0, 200);
    const equipmentType = mode.slice(0, 120);

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
    return Object.freeze({ row, photosExcluded: stats.removed, photosUploaded: manifest.length, created: !reference });
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
