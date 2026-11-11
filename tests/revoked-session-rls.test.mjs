import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../supabase/migrations/20261111160000_revoked_session_rls_guard.sql", import.meta.url), "utf8");
const admin = await readFile(new URL("../supabase/functions/account-admin/index.ts", import.meta.url), "utf8");

test("RLS session guard binds JWT session_id to the same live auth user session", () => {
  assert.match(migration, /auth\.jwt\(\) ->> 'session_id'/);
  assert.match(migration, /auth\.jwt\(\) ->> 'sub'/);
  assert.match(migration, /s\.id = \(auth\.jwt\(\) ->> 'session_id'\)::uuid/);
  assert.match(migration, /s\.user_id = \(auth\.jwt\(\) ->> 'sub'\)::uuid/);
  assert.match(migration, /s\.not_after is null or s\.not_after > pg_catalog\.now\(\)/);
});

test("all checklist and profile owner policies require an active Auth session", () => {
  for (const name of ["checklists_select_owner", "checklists_insert_owner", "checklists_update_owner", "checklists_delete_owner", "profiles_select_self", "profiles_update_self"]) {
    assert.ok(migration.includes("drop policy if exists " + name));
  }
  assert.ok((migration.match(/public\.auth_session_is_active\(\)/g) || []).length >= 14);
});

test("photo Storage policies reject requests from revoked sessions", () => {
  for (const name of ["Checklist photos: owner read", "Checklist photos: owner insert", "Checklist photos: owner update", "Checklist photos: owner delete"]) {
    assert.ok(migration.includes('drop policy if exists "' + name + '"'));
  }
  assert.ok((migration.match(/public\.auth_session_is_active\(\)/g) || []).length >= 14);
});

test("admin Edge Function validates caller session id before privileged actions", () => {
  assert.match(admin, /let sessionId: string \| null = null/);
  assert.match(admin, /payload\.session_id === "string"/);
  assert.match(admin, /is_auth_session_active_for_user/);
  assert.match(admin, /if \(activeSession !== true\)/);
  assert.match(admin, /AUTH_SESSION_REVOKED/);
});

test("account deletion revokes all sessions before deleting Auth identity", () => {
  const start = admin.indexOf('if (body.action === "delete_employee")');
  const end = admin.indexOf('if (body.action === "set_employee_access")', start);
  const block = admin.slice(start, end);
  assert.match(block, /revoke_auth_sessions_for_user/);
  assert.ok(block.indexOf("revoke_auth_sessions_for_user") < block.indexOf("deleteUser(userId)"));
  assert.match(block, /Не удалось отозвать сессии аккаунта/);
  assert.match(block, /revoked_sessions: revokedSessionCount/);
});

test("private Excel export metadata and objects also require active sessions", () => {
  for (const name of ["checklist_exports_select_own", "checklist_exports_insert_own", "checklist_exports_delete_own", "checklist_exports_storage_select_own", "checklist_exports_storage_insert_own", "checklist_exports_storage_delete_own"]) {
    assert.ok(migration.includes(name));
  }
});

test("service-only session revocation removes every refresh session for the target account", () => {
  assert.match(migration, /function public\.revoke_auth_sessions_for_user\(p_user_id uuid\)/);
  assert.match(migration, /delete from auth\.sessions where user_id = p_user_id/);
  assert.match(migration, /grant execute on function public\.revoke_auth_sessions_for_user\(uuid\) to service_role/);
});

test("non-production staging is explicit in the migration itself", () => {
  assert.match(migration, /ONLY in a separate isolated Supabase test project/);
  assert.match(migration, /does not invalidate a JWT cryptographically/);
});
