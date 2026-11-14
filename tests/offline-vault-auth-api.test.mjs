import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");

test("Email and password remain the only interactive Supabase sign-in", () => {
  assert.match(auth, /async function signIn\(email, password\)/);
  assert.match(auth, /supabase\.auth\.signInWithPassword\(/);
  assert.match(auth, /email: normalizedEmail/);
  assert.match(auth, /password: String\(password\)/);
  assert.doesNotMatch(auth, /setupOfflinePin|unlockOffline|hasOfflineSetup/);
});

test("device vault enrollment requires a verified online identity and profile", () => {
  const start = auth.indexOf("async function activateDeviceVault(identity)");
  const end = auth.indexOf("\nasync function resolveLoginEmail", start);
  const body = auth.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.match(body, /setupDeviceKeyAfterVerifiedOnlineLogin\(identity\)/);
  assert.match(body, /session\.unlockDeviceKey\(setup\.userId\)/);
  assert.match(body, /verifiedIdentity/);
  assert.ok(body.indexOf("verifiedIdentity") < body.indexOf("activeOfflineVault ="));
});

test("cloud sync rechecks online identity and local checklist data is committed before queue work", () => {
  assert.match(auth, /offline:cloud-sync-enabled:/);
  assert.match(auth, /database\.putRecord\(/);
  assert.match(auth, /store\.saveChecklist\(/);
  assert.match(auth, /catch \(syncError\)/);
  assert.match(auth, /syncDeferred: true/);
  assert.match(auth, /async function enableOfflineCloudSync\(\)/);
  assert.match(auth, /await getCurrentIdentity\(\)/);
});

test("cached device identity is recovered only for network failures and explicit logout blocks it", () => {
  assert.match(auth, /async function getCachedOfflineIdentity\(cause\)/);
  assert.match(auth, /if \(offlineLogoutRequested\) return null/);
  assert.match(auth, /offline:logout-requested", true/);
  assert.match(auth, /tmh-offline-logout-requested/);
  assert.match(auth, /offline:logout-requested", false/);
  assert.match(auth, /session\.unlockDeviceKey\(userId\)/);
  assert.match(auth, /offline:identity:/);
  assert.match(auth, /globalThis\.__TMH_CONNECTION_MODE === "offline"/);
  assert.match(auth, /parent\?\.__TMH_CONNECTION_MODE === "offline"/);
});

test("network exceptions from Supabase sign-in are returned for the app's offline recovery path", () => {
  const start = auth.indexOf("async function signIn(email, password)");
  const end = auth.indexOf("\nasync function getCachedOfflineIdentity", start);
  const body = auth.slice(start, end);
  assert.match(body, /catch \(authError\)/);
  assert.match(body, /error = authError/);
});
