// Supabase checklist data layer.
// This module deliberately does not import or migrate local checklist data.
// The owner is always derived from the currently verified Supabase identity.

const TABLE = "checklists";
const COLUMNS = "id, owner_id, title, equipment_type, payload, revision, created_at, updated_at";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_PAYLOAD_BYTES = 512 * 1024;
const INLINE_IMAGE_RE = /^data:image\/(?:png|jpe?g|webp|gif);base64,/i;

export class CloudSyncError extends Error {
  constructor(code, message, cause) {
    super(message);
    this.name = "CloudSyncError";
    this.code = code;
    if (cause !== undefined) this.cause = cause;
  }
}

function fail(code, message, cause) {
  throw new CloudSyncError(code, message, cause);
}

function validateUuid(value, field = "id") {
  if (typeof value !== "string" || !UUID_RE.test(value)) {
    fail("INVALID_INPUT", `Некорректный UUID: ${field}`);
  }
  return value;
}

function validateText(value, field, maxLength, fallback = "") {
  const text = value == null ? fallback : String(value).trim();
  if (text.length > maxLength) {
    fail("INVALID_INPUT", `Поле ${field} превышает ${maxLength} символов`);
  }
  return text;
}

function inspectPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("INVALID_INPUT", "payload должен быть JSON-объектом");
  }

  let json;
  try {
    json = JSON.stringify(value);
  } catch (error) {
    fail("INVALID_INPUT", "payload не удалось сериализовать в JSON", error);
  }

  if (json === undefined) fail("INVALID_INPUT", "payload не является JSON-объектом");
  if (new TextEncoder().encode(json).byteLength > MAX_PAYLOAD_BYTES) {
    fail("PAYLOAD_TOO_LARGE", "Размер данных чек-листа превышает 512 КБ");
  }

  const scan = (item) => {
    if (typeof item === "string") return INLINE_IMAGE_RE.test(item);
    if (Array.isArray(item)) return item.some(scan);
    if (item && typeof item === "object") return Object.values(item).some(scan);
    return false;
  };
  if (scan(value)) {
    fail("INLINE_PHOTO_UNSUPPORTED", "Фотографии нужно хранить отдельно в Supabase Storage");
  }

  return value;
}

function unwrap(result, operation) {
  if (result?.error) {
    fail("CLOUD_REQUEST_FAILED", `Ошибка Supabase при операции: ${operation}`, result.error);
  }
  return result?.data;
}

export function createCloudSync(authApi) {
  if (!authApi?.client?.from || typeof authApi.getCurrentIdentity !== "function") {
    fail("INVALID_CLIENT", "Не передан действующий клиент TMHAuth");
  }

  async function getOwnerId() {
    const identity = await authApi.getCurrentIdentity();
    if (identity?.error || !identity?.user?.id) {
      fail("AUTH_REQUIRED", "Для облачной синхронизации необходимо войти в аккаунт", identity?.error);
    }
    return validateUuid(identity.user.id, "Supabase user.id");
  }

  async function list() {
    const ownerId = await getOwnerId();
    const result = await authApi.client
      .from(TABLE)
      .select(COLUMNS)
      .eq("owner_id", ownerId)
      .order("updated_at", { ascending: false });

    return unwrap(result, "list") || [];
  }

  async function get(id) {
    const ownerId = await getOwnerId();
    validateUuid(id);
    const result = await authApi.client
      .from(TABLE)
      .select(COLUMNS)
      .eq("id", id)
      .eq("owner_id", ownerId)
      .maybeSingle();

    const row = unwrap(result, "get");
    if (!row) fail("NOT_FOUND", "Чек-лист не найден или недоступен");
    return row;
  }

  async function create(input = {}) {
    const ownerId = await getOwnerId();
    const row = {
      owner_id: ownerId,
      title: validateText(input.title, "title", 200, "Новый чек-лист"),
      equipment_type: validateText(input.equipmentType, "equipment_type", 120),
      payload: inspectPayload(input.payload ?? {}),
    };

    const result = await authApi.client
      .from(TABLE)
      .insert(row)
      .select(COLUMNS)
      .single();

    return unwrap(result, "create");
  }

  async function update(input = {}) {
    const ownerId = await getOwnerId();
    const id = validateUuid(input.id);
    const revision = Number(input.expectedRevision);
    if (!Number.isSafeInteger(revision) || revision < 1) {
      fail("INVALID_INPUT", "Для обновления требуется положительная expectedRevision");
    }

    const changes = {
      title: validateText(input.title, "title", 200, "Новый чек-лист"),
      equipment_type: validateText(input.equipmentType, "equipment_type", 120),
      payload: inspectPayload(input.payload ?? {}),
      revision: revision + 1,
      updated_at: new Date().toISOString(),
    };

    const result = await authApi.client
      .from(TABLE)
      .update(changes)
      .eq("id", id)
      .eq("owner_id", ownerId)
      .eq("revision", revision)
      .select(COLUMNS)
      .maybeSingle();

    const row = unwrap(result, "update");
    if (!row) {
      fail("REVISION_CONFLICT", "Чек-лист изменён или удалён в другой сессии. Сначала загрузите актуальную версию.");
    }
    return row;
  }

  async function remove(id) {
    const ownerId = await getOwnerId();
    validateUuid(id);
    const result = await authApi.client
      .from(TABLE)
      .delete()
      .eq("id", id)
      .eq("owner_id", ownerId)
      .select("id")
      .maybeSingle();

    const row = unwrap(result, "delete");
    if (!row) fail("NOT_FOUND", "Чек-лист не найден или недоступен");
    return true;
  }

  return Object.freeze({ list, get, create, update, remove });
}
