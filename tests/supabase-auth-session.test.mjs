import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");

test("temporary profile lookup errors preserve the authenticated session", () => {
  assert.match(source, /reason: "profile_query_failed"/);
  assert.match(source, /if \(result\.reason === "profile_not_authorized"\)/);
  assert.match(source, /return \{ user: data\.user, profile: null, error: result\.error \}/);
  assert.match(source, /signIn succeeded; preserve the session/);
});

test("confirmed missing or disallowed profiles are still denied", () => {
  assert.match(source, /reason: "profile_not_authorized"/);
  assert.match(source, /await supabase\.auth\.signOut\(\{ scope: "local" \}\)/);
  assert.match(source, /ALLOWED_ROLES\.has\(data\.role\)/);
});

test("auth client continues to persist and refresh sessions", () => {
  assert.match(source, /persistSession: true/);
  assert.match(source, /autoRefreshToken: true/);
  assert.match(source, /storageKey: STORAGE_KEY/);
});

test("session restore and sign-in retry transient profile reads once", () => {
  assert.match(source, /async function getProfileWithRetry\(user, attempts = 2\)/);
  assert.match(source, /await getProfileWithRetry\(data\.user\)/);
  assert.match(source, /attempt \+ 1 >= attempts/);
  assert.match(source, /setTimeout\(resolve, 400\)/);
  assert.equal((source.match(/getProfileWithRetry\(data\.user\)/g) || []).length, 2);
});


test("cabinet identity uses device-bound offline identity only after verified local vault unlock", () => {
  assert.match(source, /async function getCabinetIdentity\(\)/);
  assert.match(source, /const offline = await getCachedOfflineIdentity\(online\?\.error\)/);
  assert.match(source, /offline\.supabaseAuthenticated === false/);
  assert.match(source, /isOfflineVaultUnlocked\(\)/);
  assert.match(source, /getCabinetIdentity,/);
});


test("cabinet avoids loading remote Supabase ESM when browser reports offline", () => {
  assert.match(source, /if \(globalThis\.navigator\?\.onLine === false\)/);
  assert.match(source, /getCachedOfflineIdentity\(new TypeError\("offline"\)\)/);
  assert.match(source, /Нет сети и не найдено разблокированное локальное хранилище/);
});
