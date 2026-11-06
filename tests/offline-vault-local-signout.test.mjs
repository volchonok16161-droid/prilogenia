import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");

test("offline sign-out clears only the local PIN identity and vault without network", () => {
  assert.match(auth, /if \(activeOfflineIdentity\) \{[\s\S]*?activeOfflineVault = null;[\s\S]*?activeOfflineUserId = null;[\s\S]*?return \{ error: null, offline: true \};/);
  assert.match(auth, /const \{ error \} = await client\.auth\.signOut\(\)/);
});

test("explicit logout blocks cached device-key identity recovery until fresh sign-in or PIN unlock", () => {
  assert.match(auth, /let offlineLogoutRequested = false;/);
  assert.match(auth, /async function signOut\(\) \{\s*offlineLogoutRequested = true;/);
  assert.match(auth, /async function getCachedOfflineIdentity\(cause\) \{[\s\S]{0,220}if \(offlineLogoutRequested\) return null;/);
  assert.match(auth, /async function signIn\(email, password\) \{\s*offlineLogoutRequested = false;/);
  assert.match(auth, /async function unlockOffline\(userId, pin\) \{\s*offlineLogoutRequested = false;/);
});
