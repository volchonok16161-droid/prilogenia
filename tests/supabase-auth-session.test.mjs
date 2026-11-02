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
  assert.match(source, /await client\.auth\.signOut\(\{ scope: "local" \}\)/);
  assert.match(source, /ALLOWED_ROLES\.has\(data\.role\)/);
});

test("auth client continues to persist and refresh sessions", () => {
  assert.match(source, /persistSession: true/);
  assert.match(source, /autoRefreshToken: true/);
  assert.match(source, /storageKey: STORAGE_KEY/);
});
