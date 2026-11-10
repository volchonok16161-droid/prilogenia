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
  assert.match(auth, /offline:logout-requested", true/);
  assert.match(auth, /tmh-offline-logout-requested/);
  assert.match(auth, /client\.auth\.signOut\(\{ scope: "local" \}\)/);
  assert.match(auth, /async function signIn\(email, password\)/);
  assert.match(auth, /offline:logout-requested", false/);
  assert.match(auth, /offline:logout-requested", true/);
  assert.doesNotMatch(auth, /unlockOffline|setupOfflinePin/);
});

test("cross-tab Supabase account changes immediately lock the previous local vault", () => {
  assert.match(auth, /function clearActiveOfflineContext\(\)/);
  assert.match(auth, /function handleCrossTabAuthState\(event, session\)/);
  assert.match(auth, /client\.auth\.onAuthStateChange\(handleCrossTabAuthState\)/);
  assert.match(auth, /nextUserId !== activeOfflineUserId/);
  assert.match(auth, /clearActiveOfflineContext\(\)/);
  assert.match(auth, /online\.user\.id\.toLowerCase\(\) !== offlineUserId\.toLowerCase\(\)/);
});

test("offline account selection follows the persisted Supabase session, not a stale UI cache", () => {
  assert.match(auth, /function getPersistedAuthUserId\(\)/);
  assert.match(auth, /const userId = getPersistedAuthUserId\(\)/);
  assert.doesNotMatch(auth, /let userId = cached\?\.authUid/);
  assert.doesNotMatch(auth, /userId = await offlineVault\.database\.getMeta\("offline:last-user-id"\)/);
});
