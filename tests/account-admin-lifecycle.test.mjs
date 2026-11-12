import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const admin = await readFile(new URL("../supabase/functions/account-admin/index.ts", import.meta.url), "utf8");
const cabinet = await readFile(new URL("../account.html", import.meta.url), "utf8");

test("only developers can delete employee and assistant accounts", () => {
  assert.match(admin, /body\.action === "delete_employee"/);
  assert.match(admin, /actor\.role !== "developer"/);
  assert.match(admin, /userId === authData\.user\.id/);
  assert.match(admin, /!\["employee", "assistant"\]\.includes\(target\.role\)/);
});

test("deletion requires explicit supported mode and revokes sessions", () => {
  assert.match(admin, /mode !== "transfer" && mode !== "permanent"/);
  assert.match(admin, /revoke_auth_sessions_for_user/);
  assert.match(admin, /ban_duration: "876000h"/);
  assert.match(admin, /admin\.auth\.admin\.deleteUser\(userId\)/);
});

test("transfer mode archives Storage objects and reassigns checklist ownership", () => {
  assert.match(admin, /__developer_archive/);
  assert.match(admin, /admin\.storage\.from\(bucket\)\.copy\(sourcePath, archivePath\)/);
  assert.match(admin, /owner_id: authData\.user\.id/);
  assert.match(admin, /transferred_checklists/);
  assert.match(admin, /transferred_files/);
});

test("permanent mode removes Storage objects and cloud checklists", () => {
  assert.match(admin, /mode === "permanent"/);
  assert.match(admin, /admin\.storage\.from\(bucket\)\.remove\(paths\)/);
  assert.match(admin, /admin\.from\("checklists"\)\.delete\(\)\.eq\("owner_id", userId\)/);
  assert.match(admin, /deleted_checklists/);
  assert.match(admin, /deleted_files/);
});

test("developer UI offers two choices with strong confirmation", () => {
  assert.match(cabinet, /modeChoice === "TRANSFER" \|\| modeChoice === "DELETE"/);
  assert.match(cabinet, /mode: mode/);
  assert.match(cabinet, /confirmation !== \(mode === "transfer" \? "TRANSFER" : "DELETE"\)/);
});

test("developer UI verifies server-confirmed deletion and refreshed employee list", () => {
  assert.match(cabinet, /deleteResult\?\.deleted !== true/);
  assert.match(cabinet, /deleteResult\?\.user_id !== employee\.id/);
  assert.match(cabinet, /stillListed/);
});

test("offline device data warning remains visible in developer cabinet", () => {
  assert.match(cabinet, /Сервер не может проверить несинхронизированные данные на устройствах/);
});
