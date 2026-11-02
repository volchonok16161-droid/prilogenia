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

function collectPhotos(value, itemId = null, output = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPhotos(item, itemId ?? String(index), output));
    return output;
  }
  if (!value || typeof value !== "object") return output;

  for (const [key, item] of Object.entries(value)) {
    if (/_photo$/i.test(key) && typeof item === "string" && item.startsWith("data:")) {
      output.push({ itemId: itemId ?? "root", field: key, dataUrl: item });
    } else if (item && typeof item === "object") {
      collectPhotos(item, itemId ?? key, output);
    }
  }
  return output;
}

function setPhoto(state, itemId, field, dataUrl) {
  const target = state?.values?.[itemId];
  if (!target || typeof target !== "object" || !/_photo$/i.test(field)) {
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
  if (result?.error) fail("STORAGE_REQUEST_FAILED", "Supabase Storage: " + operation, result.error);
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
    for (const photo of photos) {
      const match = DATA_URL_RE.exec(photo.dataUrl);
      if (!match) fail("INVALID_PHOTO", "Поддерживаются только фотографии JPEG, PNG и WebP");
      const contentType = match[1].toLowerCase();
      if (!ALLOWED_TYPES.has(contentType)) fail("INVALID_PHOTO", "Формат фотографии не поддерживается");
      const bytes = decodeBase64(match[2]);
      const fileId = uuid(idFactory(), "photo id");
      const path = [
        userId,
        rowId,
        String(revision),
        segment(photo.itemId, "itemId"),
        segment(photo.field, "photo field") + "-" + fileId,
      ].join("/");
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
    return Object.freeze({ manifest: Object.freeze(manifest), uploaded: manifest.length });
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
      const prefix = userId + "/" + rowId + "/";
      if (!entry.path.startsWith(prefix) || entry.path.includes("..") || entry.path.includes("\\\\")) {
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

  return Object.freeze({ uploadState, restoreState });
}
