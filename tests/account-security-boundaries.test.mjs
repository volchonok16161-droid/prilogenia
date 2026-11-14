import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../supabase/migrations/20261102110411_profiles_self_update_display_name.sql", import.meta.url), "utf8");
const adminFunction = await readFile(new URL("../supabase/functions/account-admin/index.ts", import.meta.url), "utf8");

test("authenticated users can update only their own display_name, never role", () => {
  assert.match(migration, /revoke update on table public\.profiles from authenticated/i);
  assert.match(migration, /grant update\s*\(display_name\)\s*on table public\.profiles to authenticated/i);
  assert.doesNotMatch(migration, /grant update\s*\([^)]*\brole\b/i);
  assert.match(migration, /using\s*\(\(select auth\.uid\(\)\) = id\)/i);
  assert.match(migration, /with check\s*\(\(select auth\.uid\(\)\) = id\)/i);
});

test("account administration requires a valid JWT and a trusted developer/admin profile role", () => {
  assert.match(adminFunction, /authClient\.auth\.getUser\(token\)/);
  assert.match(adminFunction, /\["developer", "admin"\]\.includes\(actor\.role\)/);
  assert.match(adminFunction, /Недостаточно прав/);
});

test("employee access changes cannot target another role", () => {
  assert.match(adminFunction, /!\["employee", "assistant"\]\.includes\(target\.role\)/);
  assert.match(adminFunction, /admin\.auth\.admin\.updateUserById\(userId/);
});
