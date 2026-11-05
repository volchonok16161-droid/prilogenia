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
  assert.match(auth, /before any upload/);
});



test("device vault enrollment verifies the encrypted identity before marking the vault active", () => {
  const start = auth.indexOf("async function activateDeviceVault(identity)");
  const end = auth.indexOf("\nasync function resolveLoginEmail", start);
  const body = auth.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.match(body, /setMeta\("offline:identity:" \+ setup\.userId, encryptedIdentity\)/);
  assert.match(body, /getMeta\("offline:identity:" \+ setup\.userId\)/);
  assert.match(body, /session\.unlockDeviceKey\(setup\.userId\)/);
  assert.ok(body.indexOf("verifiedIdentity") < body.indexOf("activeOfflineVault ="));
  assert.doesNotMatch(body, /if \(activeOfflineVault && activeOfflineUserId/);
});


test("encrypted local checklist snapshot is committed before cloud queue work", () => {
  const start = auth.indexOf("async function saveOfflineChecklist(id, snapshot)");
  const end = auth.indexOf("\nasync function migrateLegacyChecklist", start);
  const body = auth.slice(start, end);
  assert.ok(start >= 0 && end > start);
  const localWrite = body.indexOf("database.putRecord(");
  const cloudQueue = body.indexOf("store.saveChecklist(");
  assert.ok(localWrite >= 0 && cloudQueue > localWrite);
  assert.match(body, /catch \(syncError\)/);
  assert.match(body, /syncDeferred: true/);
  assert.match(body, /saved: true, encrypted: true, queued: false/);
});
