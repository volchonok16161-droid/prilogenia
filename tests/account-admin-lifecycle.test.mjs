import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const admin = await readFile(new URL("../supabase/functions/account-admin/index.ts", import.meta.url), "utf8");
const cabinet = await readFile(new URL("../account.html", import.meta.url), "utf8");

test("only developers can permanently delete accounts", () => {
  assert.match(admin, /body\.action === "delete_employee"/);
  assert.match(admin, /actor\.role !== "developer"/);
  assert.match(admin, /Удалять аккаунты может только разработчик/);
  assert.match(admin, /userId === authData\.user\.id/);
  assert.match(admin, /Нельзя удалить собственную учётную запись/);
});

test("account deletion is limited to employee and assistant profiles", () => {
  assert.match(admin, /!\["employee", "assistant"\]\.includes\(target\.role\)/);
  assert.match(admin, /Удалять можно только аккаунты сотрудников и помощников/);
});

test("account deletion fails closed when cloud checklists or Storage objects exist", () => {
  assert.match(admin, /\.from\("checklists"\)[\s\S]*?\.eq\("owner_id", userId\)/);
  assert.match(admin, /\.schema\("storage"\)[\s\S]*?\.from\("objects"\)[\s\S]*?\.eq\("owner_id", userId\)/);
  assert.match(admin, /Удаление запрещено: у аккаунта есть облачные чек-листы/);
  assert.match(admin, /Удаление запрещено: у аккаунта остались файлы/);
  assert.match(admin, /if \(checklistError\)/);
  assert.match(admin, /if \(storageError\)/);
});

test("account deletion blocks access and rechecks ownership before Auth deletion", () => {
  assert.match(admin, /updateUserById\(userId, \{\s*ban_duration: "876000h"/);
  assert.match(admin, /finalChecklistCount/);
  assert.match(admin, /finalStorageCount/);
  assert.match(admin, /admin\.auth\.admin\.deleteUser\(userId\)/);
  assert.match(admin, /ban_duration: "none"/);
  assert.match(admin, /восстановление доступа не удалось/);
  assert.match(admin, /восстановить доступ автоматически не удалось/);
});

test("only developer UI shows a deliberate two-step account deletion action", () => {
  assert.match(cabinet, /identity\?\.profile\?\.role === "developer" && \["employee", "assistant"\]\.includes\(employee\.role\)/);
  assert.match(cabinet, /deleteButton\.textContent = "Удалить аккаунт"/);
  assert.match(cabinet, /window\.prompt\([\s\S]*?Для подтверждения введите DELETE:/);
  assert.match(cabinet, /confirmation !== "DELETE"/);
  assert.match(cabinet, /action: "delete_employee", user_id: employee\.id/);
  assert.doesNotMatch(cabinet, /action: "delete_employee"[\s\S]{0,100}service_role/i);
});

test("developer role management and assistant listing are backed by server authorization", () => {
  assert.match(admin, /\.in\("role", \["employee", "assistant"\]\)/);
  assert.match(admin, /body\.action === "set_employee_role"/);
  assert.match(admin, /actor\.role !== "developer"/);
  assert.match(admin, /role !== "employee" && role !== "assistant"/);
  assert.match(cabinet, /action: "set_employee_role"/);
  assert.match(cabinet, /Назначить помощником/);
});

test("failed employee provisioning checks Auth rollback before releasing reserved capacity", () => {
  assert.match(admin, /const rollbackProvisionedUser = async \(userId: string, reservationId: string\)/);
  assert.match(admin, /const \{ error: deleteError \} = await admin\.auth\.admin\.deleteUser\(userId\)/);
  assert.match(admin, /if \(deleteError\) return \{ deleted: false, error: deleteError \}/);
  assert.match(admin, /if \(profileError\) \{\s*const rollback = await rollbackProvisionedUser\(created\.user\.id, reservation\.reservationId\)/);
  assert.match(admin, /if \(!rollback\.deleted\) \{[\s\S]*?Резерв места сохранён до автоматического истечения/);
  assert.match(admin, /if \(profileError\) \{\s*\/\/ Do not silently orphan[\s\S]*?rollbackProvisionedUser\(inviteData\.user\.id, reservation\.reservationId\)/);
});

test("account deletion warns that device-local unsynced data must be saved first", () => {
  assert.match(cabinet, /Сервер не может проверить несинхронизированные данные на устройствах/);
  assert.match(cabinet, /не гарантирует мгновенную недействительность уже выданных access token/);
});


test("developer UI requires explicit positive delete confirmation and verifies returned deletion result", () => {
  assert.match(cabinet, /const deleteResult = await callAdmin\(api, \{ action: "delete_employee", user_id: employee\.id \}\)/);
  assert.match(cabinet, /deleteResult\?\.deleted !== true/);
  assert.match(cabinet, /deleteResult\?\.user_id !== employee\.id/);
  assert.match(cabinet, /Аккаунт не удалён: сервер не подтвердил удаление/);
});
