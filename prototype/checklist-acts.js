// Private act attachments, scoped to an authenticated owner and an existing checklist.
const BUCKET = "checklist-acts";
const MIME = new Set(["application/pdf", "image/jpeg", "image/png"]);
const MAX_SIZE = 20 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function listChecklistActs(api, ownerId) {
  if (!UUID.test(ownerId)) throw new Error("Некорректный пользователь");
  const { data, error } = await api.client.from("checklist_acts")
    .select("id,checklist_id,storage_path,file_name,mime_type,file_size,uploaded_at")
    .eq("owner_id", ownerId).order("uploaded_at", { ascending: false });
  if (error) throw error;
  const latest = new Map();
  for (const row of data || []) if (UUID.test(row.checklist_id) && !latest.has(row.checklist_id)) latest.set(row.checklist_id, row);
  return latest;
}

export async function uploadChecklistAct(api, { ownerId, checklistId, file }) {
  if (!UUID.test(ownerId) || !UUID.test(checklistId)) throw new Error("Недопустимый идентификатор");
  if (!file || !MIME.has(file.type) || file.size < 1 || file.size > MAX_SIZE)
    throw new Error("Допустимы PDF, JPG и PNG размером до 20 МБ");
  const identity = await api.getCurrentIdentity();
  if (identity?.error || identity?.user?.id !== ownerId) throw new Error("Сеанс изменился. Повторите вход.");
  const { data: check, error: checkError } = await api.client.from("checklists")
    .select("id").eq("id", checklistId).eq("owner_id", ownerId).single();
  if (checkError || !check) throw new Error("Чек-лист не найден в вашем аккаунте");
  const extension = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
  const path = ownerId + "/" + checklistId + "/" + crypto.randomUUID() + "." + extension;
  const bucket = api.client.storage.from(BUCKET);
  const uploaded = await bucket.upload(path, file, { contentType: file.type, upsert: false });
  if (uploaded.error) throw uploaded.error;
  try {
    const again = await api.getCurrentIdentity();
    if (again?.error || again?.user?.id !== ownerId) throw new Error("Сеанс пользователя изменился");
    const saved = await api.client.from("checklist_acts").insert({
      owner_id: ownerId, checklist_id: checklistId, storage_path: path,
      file_name: String(file.name || "Акт." + extension).slice(0, 240),
      mime_type: file.type, file_size: file.size
    }).select("id,checklist_id,storage_path,file_name,mime_type,file_size,uploaded_at").single();
    if (saved.error || !saved.data) throw saved.error || new Error("Не удалось зарегистрировать акт");
    return saved.data;
  } catch (error) {
    try { await bucket.remove([path]); } catch {}
    throw error;
  }
}

export async function getChecklistActLink(api, row) {
  if (!row || typeof row.storage_path !== "string") throw new Error("Акт не найден");
  const result = await api.client.storage.from(BUCKET).createSignedUrl(row.storage_path, 60);
  if (result.error || !result.data?.signedUrl) throw result.error || new Error("Не удалось открыть акт");
  return result.data.signedUrl;
}
