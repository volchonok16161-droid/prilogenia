import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");

test("PIN enrollment rechecks live Supabase identity and server profile", () => {
  assert.match(auth, /async function setupOfflinePin\(pin\)/);
  assert.match(auth, /const identity = await getCurrentIdentity\(\)/);
  assert.match(auth, /identity\?\.user \|\| !identity\?\.profile \|\| identity\.error/);
  assert.match(auth, /setupAfterVerifiedOnlineLogin\(identity, pin\)/);
});

test("offline unlock API remains separate from Supabase sign-in", () => {
  assert.match(auth, /async function unlockOffline\(userId, pin\)/);
  assert.match(auth, /offlineVault\.session\.unlockOffline\(userId, pin\)/);
  assert.match(auth, /  setupOfflinePin,/);
  assert.match(auth, /  unlockOffline,/);
  assert.match(auth, /  hasOfflineSetup,/);
});

test("cloud sync is opt-in and existing local snapshots are not queued automatically", () => {
  assert.match(auth, /offline:cloud-sync-enabled:/);
  assert.match(auth, /cloudEnabled !== true/);
  assert.match(auth, /database\.putRecord\(/);
  assert.match(auth, /queued: false, status: "local-only"/);
  assert.match(auth, /async function enableOfflineCloudSync\(\)/);
  assert.match(auth, /await getCurrentIdentity\(\)/);
  assert.match(auth, /enableOfflineCloudSync,/);
});

test("PIN unlock does not wait indefinitely for the online session probe", () => {
  assert.match(auth, /async function getCurrentIdentityForOfflineUnlock\(timeoutMs = 1800\)/);
  assert.match(auth, /Promise\.race\(\[/);
  assert.match(auth, /timer = setTimeout\(/);
  assert.match(auth, /finally \{[\s\S]*?clearTimeout\(timer\)/);
  assert.match(auth, /const candidate = await getCurrentIdentityForOfflineUnlock\(\)/);
  assert.match(auth, /sync runner will perform its own fresh server-side check/);
});
