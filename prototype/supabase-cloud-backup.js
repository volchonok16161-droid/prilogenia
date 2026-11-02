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

    const stats = { removed: 0 };
    const payload = {
      mode: String(getMode() || "unknown"),
      state: cloneWithoutPhotos(state, stats),
    };
    const title = [
      "Чек-лист",
      state.general?.type || getMode(),
      state.general?.number || "",
    ].filter(Boolean).join(" — ").slice(0, 200);
    const equipmentType = String(getMode() || "unknown").slice(0, 120);
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

    const row = reference
      ? await cloud.update({
          id: reference.id,
          expectedRevision: reference.revision,
          title,
          equipmentType,
          payload,
        })
      : await cloud.create({ title, equipmentType, payload });

    storage.setItem(refKey, JSON.stringify({ id: row.id, revision: row.revision }));
    return Object.freeze({ row, photosExcluded: stats.removed, created: !reference });
  }

  return Object.freeze({ saveCurrent });
}
