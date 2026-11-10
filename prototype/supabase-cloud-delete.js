import { createChecklistPhotoSync } from "./supabase-cloud-photos.js";

export async function deleteCloudChecklist({
  authApi,
  checklistId,
  expectedUserId,
  photoSyncFactory = createChecklistPhotoSync,
} = {}) {
  if (!authApi?.getCurrentIdentity || !authApi?.client?.from) {
    throw new Error("Не передан клиент Supabase для удаления чек-листа.");
  }
  if (typeof checklistId !== "string" || !checklistId.trim() ||
      typeof expectedUserId !== "string" || !expectedUserId.trim()) {
    throw new Error("Некорректные данные для удаления чек-листа.");
  }

  const identity = await authApi.getCurrentIdentity();
  if (identity?.error) throw identity.error;
  if (identity?.user?.id !== expectedUserId) {
    throw new Error("Сеанс пользователя изменился. Обновите кабинет и войдите снова.");
  }

  const { data: currentRow, error: readError } = await authApi.client
    .from("checklists")
    .select("id,payload")
    .eq("id", checklistId)
    .eq("owner_id", expectedUserId)
    .maybeSingle();
  if (readError) throw readError;
  if (!currentRow?.id) throw new Error("Чек-лист не найден или уже удалён.");

  const photos = Array.isArray(currentRow.payload?.photos)
    ? currentRow.payload.photos
    : (Array.isArray(currentRow.payload?.photoManifest) ? currentRow.payload.photoManifest : []);

  const { data: deleted, error: deleteError } = await authApi.client
    .from("checklists")
    .delete()
    .eq("id", checklistId)
    .eq("owner_id", expectedUserId)
    .select("id")
    .maybeSingle();
  if (deleteError) throw deleteError;
  if (!deleted?.id) throw new Error("Чек-лист не удалён: запись не найдена или нет прав.");

  let photosRemoved = 0;
  let photoCleanupWarning = false;
  if (photos.length) {
    try {
      const photoSync = photoSyncFactory({ authApi });
      photosRemoved = await photoSync.removeManifest(photos);
    } catch (error) {
      photoCleanupWarning = true;
      console.warn("Deleted checklist photos could not be cleaned up", error);
    }
  }

  return Object.freeze({
    id: deleted.id,
    photosRemoved: Number(photosRemoved) || 0,
    photoCleanupWarning,
  });
}
