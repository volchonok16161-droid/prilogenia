import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../prototype/offline-checklist-runtime.js", import.meta.url), "utf8");

test("runtime composes cloud, photo, encrypted local store, runner and coordinator", () => {
  for (const moduleName of [
    "supabase-cloud-sync.js", "supabase-cloud-photos.js", "offline-vault-db.js",
    "offline-checklist-store.js", "offline-cloud-mapper.js", "offline-sync-runner.js",
    "offline-sync-coordinator.js",
  ]) assert.match(source, new RegExp(moduleName.replaceAll(".", "\\.")));
  assert.match(source, /createOfflineChecklistOperationMapper\(\{ photoSync \}\)/);
  assert.match(source, /createOfflineSyncRunner\(/);
  assert.match(source, /createOfflineSyncCoordinator\(/);
});

test("runtime requires a verified account UUID and unlocked encrypted vault", () => {
  assert.match(source, /A verified account UUID is required/);
  assert.match(source, /Unlock the device vault/);
  assert.match(source, /unlockedVault\.encrypt/);
  assert.match(source, /unlockedVault\.decrypt/);
});

test("sync start checks server profile and never starts from a local PIN alone", () => {
  assert.match(source, /authApi\.getCurrentIdentity\(\)/);
  assert.match(source, /identity\?\.profile\?\.id !== identity\?\.user\?\.id/);
  assert.match(source, /Online sign-in and an enabled employee profile are required/);
  assert.match(source, /return coordinator\.start\(\)/);
});

test("runtime does not automatically migrate legacy localStorage or launch sync at construction", () => {
  assert.doesNotMatch(source, /localStorage\.getItem/);
  assert.doesNotMatch(source, /\.start\(\);\s*$/m);
  assert.match(source, /start\(\)\s*\{/);
});
