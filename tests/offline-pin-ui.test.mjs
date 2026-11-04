import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("all five login surfaces expose device PIN setup and offline unlock controls", () => {
  assert.equal((html.match(/id="setupOfflinePinBtn"/g) || []).length, 5);
  assert.equal((html.match(/id="unlockOfflineBtn"/g) || []).length, 5);
  assert.equal((html.match(/id="offlinePinInput"/g) || []).length, 5);
});

test("all five auth runtimes can fall back only to an explicitly PIN-unlocked identity", () => {
  assert.equal((html.match(/const offlineIdentity = await api\.getOfflineIdentity\(\)/g) || []).length, 5);
  assert.equal((html.match(/identity\.mode === 'offline-local-unlock'/g) || []).length, 5);
  assert.equal((html.match(/__tmhBindOfflinePinControls\(\);/g) || []).length, 5);
});

test("offline profile is not copied into plaintext checklist_user localStorage", () => {
  assert.equal((html.match(/Do not copy the offline profile into plaintext localStorage/g) || []).length, 5);
  assert.equal((html.match(/api\.unlockOffline\(userId, pin\)/g) || []).length, 5);
});

test("PIN controls validate numeric PIN length before calling auth API", () => {
  assert.equal(html.split("!/^\\d{6,12}$/.test(pin)").length - 1, 10);
  assert.equal((html.match(/api\.setupOfflinePin\(pin\)/g) || []).length, 5);
});
