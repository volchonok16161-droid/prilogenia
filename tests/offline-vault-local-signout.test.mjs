import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");

test("offline sign-out clears the active local identity and vault without network", () => {
  assert.match(auth, /if \(activeOfflineIdentity\) \{[\s\S]*?activeOfflineVault = null;[\s\S]*?activeOfflineUserId = null;[\s\S]*?return \{ error: null, offline: true \};/);
  assert.match(auth, /const supabase = await getSupabaseClient\(\);[\s\S]*?const \{ error \} = await supabase\.auth\.signOut\(\)/);
});

test("explicit logout blocks automatic device-key recovery until fresh online sign-in", () => {
  assert.match(auth, /let offlineLogoutRequested = false;/);
  assert.match(auth, /async function signOut\(\) \{\s*offlineLogoutRequested = true;/);
  assert.match(auth, /if \(offlineLogoutRequested\) return null/);
  assert.match(auth, /async function signIn\(email, password\)/);
  assert.match(auth, /offline:logout-requested", false/);
  assert.match(auth, /offline:logout-requested", true/);
  assert.doesNotMatch(auth, /unlockOffline|setupOfflinePin/);
});
