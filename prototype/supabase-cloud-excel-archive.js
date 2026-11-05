const BUCKET = "checklist-exports";
const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  if (cause !== undefined) error.cause = cause;
  throw error;
}

function safeFileName(value) {
  const name = String(value || "checklist.xlsx")
    .replace(/[\\/\\:*?"<>|\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  return (name || "checklist").toLowerCase().endsWith(".xlsx") ? name : name + ".xlsx";
}

function checkResult(result, operation) {
  if (result?.error) {
    const cause = result.error;
    fail("EXCEL_CLOUD_FAILED", "Облачный архив Excel: " + operation + " — " +
      String(cause.message || cause.error || "неизвестная ошибка").slice(0, 220), cause);
  }
  return result?.data;
}

export function createChecklistExcelArchive({
  authApi,
  storageApi = authApi?.client?.storage,
  database = authApi?.client,
  idFactory = () => globalThis.crypto.randomUUID(),
  maxFileBytes = MAX_FILE_BYTES,
} = {}) {
  if (!storageApi?.from || !database?.from || typeof authApi?.getCurrentIdentity !== "function") {
    fail("INVALID_CLIENT", "Для архива Excel не настроен клиент Supabase");
  }

  async function currentUserId() {
    const identity = await authApi.getCurrentIdentity();
    const userId = identity?.user?.id;
    if (identity?.error || !UUID_RE.test(String(userId || ""))) {
      fail("AUTH_REQUIRED", "Войдите в аккаунт, чтобы автоматически сохранить Excel в облако", identity?.error);
    }
    return userId.toLowerCase();
  }

  async function save({
    blob, fileName, mode, checklistType = "", checklistNumber = "", checklistDate = "",
  } = {}) {
    const userId = await currentUserId();
    if (!(blob instanceof Blob) || blob.size < 1) fail("INVALID_EXPORT", "Файл Excel пуст или повреждён");
    if (blob.size > maxFileBytes) fail("EXPORT_SIZE_LIMIT", "Файл Excel превышает лимит облачного архива " + Math.floor(maxFileBytes / 1024 / 1024) + " МБ");
    if (blob.type && blob.type !== MIME) fail("INVALID_EXPORT_TYPE", "В облачный архив можно сохранять только файлы Excel .xlsx");
    const normalizedName = safeFileName(fileName);
    const normalizedMode = String(mode || "unknown").slice(0, 40);
    const exportId = idFactory();
    if (!UUID_RE.test(String(exportId || ""))) fail("INVALID_ID", "Не удалось создать идентификатор Excel-файла");
    const path = userId + "/" + exportId.toLowerCase() + "/" + normalizedName;
    const uploaded = await storageApi.from(BUCKET).upload(path, blob, {
      contentType: MIME,
      upsert: false,
      cacheControl: "31536000",
    });
    checkResult(uploaded, "загрузка файла");

    const metadata = {
      owner_id: userId,
      storage_path: path,
      file_name: normalizedName,
      mode: normalizedMode,
      checklist_type: String(checklistType || "").slice(0, 120),
      checklist_number: String(checklistNumber || "").slice(0, 80),
      checklist_date: String(checklistDate || "").slice(0, 32),
      file_size: blob.size,
    };
    const inserted = await database.from("checklist_exports").insert(metadata).select(
      "id,storage_path,file_name,mode,checklist_type,checklist_number,checklist_date,file_size,created_at"
    ).single();
    const row = checkResult(inserted, "сохранение сведений о файле");
    return Object.freeze(row);
  }

  async function list({ mode, limit = 50 } = {}) {
    await currentUserId();
    let query = database.from("checklist_exports")
      .select("id,storage_path,file_name,mode,checklist_type,checklist_number,checklist_date,file_size,created_at")
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(100, Number(limit) || 50)));
    if (mode) query = query.eq("mode", String(mode).slice(0, 40));
    const result = await query;
    return Object.freeze((checkResult(result, "загрузка списка") || []).map((row) => Object.freeze(row)));
  }

  async function download(exportId) {
    const userId = await currentUserId();
    if (!UUID_RE.test(String(exportId || ""))) fail("INVALID_ID", "Некорректный идентификатор Excel-файла");
    const result = await database.from("checklist_exports")
      .select("id,storage_path,file_name")
      .eq("id", exportId)
      .maybeSingle();
    const row = checkResult(result, "поиск файла");
    if (!row) fail("EXPORT_NOT_FOUND", "Файл Excel не найден в вашем облачном архиве");
    if (typeof row.storage_path !== "string" || !row.storage_path.startsWith(userId + "/")) {
      fail("INVALID_STORAGE_PATH", "Файл находится вне папки текущего пользователя");
    }
    const downloaded = await storageApi.from(BUCKET).download(row.storage_path);
    const file = checkResult(downloaded, "скачивание файла");
    if (!(file instanceof Blob) || file.size < 1) fail("EXPORT_NOT_FOUND", "Облачный файл пуст или недоступен");
    return Object.freeze({ blob: file, fileName: safeFileName(row.file_name) });
  }

  return Object.freeze({ save, list, download });
}
