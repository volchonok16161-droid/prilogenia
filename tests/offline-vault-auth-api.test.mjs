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
