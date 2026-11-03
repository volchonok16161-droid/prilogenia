const BUCKET = "checklist-photos";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/]+=*)$/i;

function fail(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  if (cause !== undefined) error.cause = cause;
  throw error;
}

function uuid(value, label) {
  if (typeof value !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    fail("INVALID_INPUT", "Некорректный " + label);
  }
  return value.toLowerCase();
}

function segment(value, label) {
  const text = String(value ?? "");
  if (!text || text.length > 160 || text === "." || text === ".." || /[\\/\\\\\u0000-\u001f]/.test(text)) {
    fail("INVALID_INPUT", "Некорректный идентификатор: " + label);
  }
  return encodeURIComponent(text);
}

function decodeBase64(base64) {
  let binary;
  try { binary = atob(base64); }
  catch (error) { fail("INVALID_PHOTO", "Фотография повреждена (Base64)", error); }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  if (!bytes.byteLength || bytes.byteLength > MAX_FILE_BYTES) {
    fail("PHOTO_SIZE_LIMIT", "Размер фотографии должен быть от 1 байта до 10 МБ");
  }
  return bytes;
}

function encodeBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function collectPhotos(state) {
  const output = [];
  const values = state?.values;
  if (!values || typeof values !== "object" || Array.isArray(values)) return output;
  for (const [itemId, item] of Object.entries(values)) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    for (const [field, dataUrl] of Object.entries(item)) {
      if (/_photo$/i.test(field) && typeof dataUrl === "string" && dataUrl.startsWith("data:")) {
        output.push({ itemId, field, dataUrl });
      }
    }
  }
  return output;
}

function setPhoto(state, itemId, field, dataUrl) {
  const target = state?.values?.[itemId];
  if (!target || typeof target !== "object" || Array.isArray(target) || !/_photo$/i.test(field)) {
    fail("INVALID_MANIFEST", "Манифест фотографии не соответствует структуре чек-листа");
  }
  target[field] = dataUrl;
}

async function getUserId(authApi) {
  const identity = await authApi?.getCurrentIdentity?.();
  if (identity?.error || !identity?.user?.id) {
    fail("AUTH_REQUIRED", "Для синхронизации фотографий необходимо войти в аккаунт", identity?.error);
  }
  return uuid(identity.user.id, "Supabase user.id");
}

function storageError(result, operation) {
  if (result?.error) {
    const cause = result.error;
    const detail = String(cause?.message || cause?.error || cause || "неизвестная ошибка")
      .replace(/[\r\n\t]+/g, " ").replace(/\\[rnt]/g, " ")
      .slice(0, 240);
    const code = cause?.code ? " (код: " + String(cause.code).slice(0, 80) + ")" : "";
    const status = cause?.statusCode ? " (HTTP " + String(cause.statusCode).slice(0, 16) + ")" : "";
    fail("STORAGE_REQUEST_FAILED", "Supabase Storage: " + operation + " — " + detail + code + status, cause);
  }
  return result?.data;
}

export function createChecklistPhotoSync({
  authApi,
  storageApi = authApi?.client?.storage,
  idFactory = () => crypto.randomUUID(),
} = {}) {
  if (!storageApi?.from || typeof idFactory !== "function") {
    fail("INVALID_CLIENT", "Не передан клиент Supabase Storage");
  }

  async function uploadState({ state, checklistId, revision } = {}) {
    const userId = await getUserId(authApi);
    const rowId = uuid(checklistId, "checklistId");
    if (!Number.isSafeInteger(revision) || revision < 1) fail("INVALID_INPUT", "revision должна быть положительным целым числом");
    if (!state || typeof state !== "object" || Array.isArray(state)) fail("INVALID_INPUT", "Нет состояния чек-листа");

    const photos = collectPhotos(state);
    const manifest = [];
    try {
      for (const photo of photos) {
        const match = DATA_URL_RE.exec(photo.dataUrl);
        if (!match) fail("INVALID_PHOTO", "Поддерживаются только фотографии JPEG, PNG и WebP");
        const contentType = match[1].toLowerCase();
        if (!ALLOWED_TYPES.has(contentType)) fail("INVALID_PHOTO", "Формат фотографии не поддерживается");
        const bytes = decodeBase64(match[2]);
        const fileId = uuid(idFactory(), "photo id");
        // Storage keys contain only UUIDs and a numeric revision. Checklist item
        // identifiers and field names may contain arbitrary localized text.
        const path = [userId, rowId, String(revision), fileId].join("/");
        const result = await storageApi.from(BUCKET).upload(path, new Blob([bytes], { type: contentType }), {
          contentType,
          upsert: false,
          cacheControl: "31536000",
        });
        storageError(result, "загрузка фотографии");
        manifest.push(Object.freeze({
          itemId: photo.itemId,
          field: photo.field,
          path,
          contentType,
        }));
      }
    } catch (error) {
      if (manifest.length) {
        try { await removeManifest(manifest); }
        catch (cleanupError) { error.cleanupError = cleanupError; }
      }
      throw error;
    }
    return Object.freeze({ manifest: Object.freeze(manifest), uploaded: manifest.length });
  }

  async function removeManifest(manifest = []) {
    if (!Array.isArray(manifest)) fail("INVALID_MANIFEST", "Некорректный список фотографий для очистки");
    if (!manifest.length) return 0;
    const userId = await getUserId(authApi);
    const paths = manifest.map((entry) => {
      if (!entry || typeof entry.path !== "string") fail("INVALID_MANIFEST", "Некорректный путь фотографии");
      const parts = entry.path.split("/");
      const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      if (parts[0] !== userId || !isUuid(parts[1]) ||
          !/^[1-9][0-9]*$/.test(parts[2]) ||
          typeof entry.itemId !== "string" || typeof entry.field !== "string") {
        fail("INVALID_MANIFEST", "Нельзя удалить файл вне папки текущего пользователя");
      }
      const validNewPath = parts.length === 4 && isUuid(parts[3]);
      const fieldPrefix = segment(entry.field, "photo field") + "-";
      const validLegacyPath = parts.length === 5 &&
        parts[3] === segment(entry.itemId, "itemId") &&
        parts[4].startsWith(fieldPrefix) && isUuid(parts[4].slice(fieldPrefix.length));
      if (!validNewPath && !validLegacyPath) {
        fail("INVALID_MANIFEST", "Путь файла не соответствует манифесту фотографии");
      }
      return entry.path;
    });
    const result = await storageApi.from(BUCKET).remove(paths);
    storageError(result, "очистка незавершённой загрузки");
    return paths.length;
  }

  async function restoreState({ state, checklistId, manifest } = {}) {
    const userId = await getUserId(authApi);
    const rowId = uuid(checklistId, "checklistId");
    if (!state || typeof state !== "object" || Array.isArray(state) || !Array.isArray(manifest)) {
      fail("INVALID_MANIFEST", "Некорректные данные восстановления фотографий");
    }

    const restored = structuredClone(state);
    for (const entry of manifest) {
      if (!entry || typeof entry.path !== "string" ||
          typeof entry.itemId !== "string" || typeof entry.field !== "string" ||
          !ALLOWED_TYPES.has(entry.contentType)) {
        fail("INVALID_MANIFEST", "Некорректная запись фотографии в манифесте");
      }
      const parts = entry.path.split("/");
      const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      const validNewPath = parts.length === 4 && isUuid(parts[3]);
      const expectedFieldPrefix = segment(entry.field, "photo field") + "-";
      const validLegacyPath = parts.length === 5 &&
        parts[3] === segment(entry.itemId, "itemId") &&
        parts[4].startsWith(expectedFieldPrefix) &&
        isUuid(parts[4].slice(expectedFieldPrefix.length));
      if (parts[0] !== userId || parts[1] !== rowId ||
          !/^[1-9][0-9]*$/.test(parts[2]) || (!validNewPath && !validLegacyPath)) {
        fail("INVALID_MANIFEST", "Путь фотографии не принадлежит текущему пользователю и чек-листу");
      }
      const result = await storageApi.from(BUCKET).download(entry.path);
      const blob = storageError(result, "загрузка фотографии");
      if (!blob || typeof blob.arrayBuffer !== "function") fail("INVALID_PHOTO", "Supabase Storage вернул некорректный файл");
      const bytes = new Uint8Array(await blob.arrayBuffer());
      if (!bytes.byteLength || bytes.byteLength > MAX_FILE_BYTES) fail("PHOTO_SIZE_LIMIT", "Размер фотографии превышает 10 МБ");
      const dataUrl = "data:" + entry.contentType + ";base64," + encodeBase64(bytes);
      setPhoto(restored, entry.itemId, entry.field, dataUrl);
    }
    return Object.freeze({ state: restored, restored: manifest.length });
  }

  return Object.freeze({ uploadState, restoreState, removeManifest });
}
