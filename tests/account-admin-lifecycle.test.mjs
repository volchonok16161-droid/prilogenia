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
