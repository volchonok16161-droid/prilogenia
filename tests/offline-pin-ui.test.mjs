import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("five login surfaces expose offline PIN unlock controls", () => {
  assert.equal((html.match(/id="setupOfflinePinBtn"/g) || []).length, 0);
  assert.equal((html.match(/id="unlockOfflineBtn"/g) || []).length, 5);
  assert.equal((html.match(/id="offlinePinInput"/g) || []).length, 5);
});

test("auth runtimes prefer explicitly PIN-unlocked identity", () => {
  assert.ok((html.match(/let identity = await api\.getOfflineIdentity\(\)/g) || []).length >= 5);
  assert.ok((html.match(/identity = await api\.getCurrentIdentity\(\)/g) || []).length >= 5);
  assert.ok((html.match(/identity\.mode === 'offline-local-unlock'/g) || []).length >= 5);
  assert.equal((html.match(/window\.__TMH_OFFLINE_MODE = identity\.mode === 'offline-local-unlock'/g) || []).length, 5);
  assert.ok((html.match(/__tmhBindOfflinePinControls\(\);/g) || []).length >= 5);
});

test("offline profile is not copied into plaintext checklist_user localStorage", () => {
  assert.equal((html.match(/Do not copy the offline profile into plaintext localStorage/g) || []).length, 5);
  assert.equal((html.match(/api\.unlockOffline\(userId, pin\)/g) || []).length, 6);
});

test("PIN controls validate numeric PIN length before calling auth API", () => {
  assert.equal(html.split("!/^\\d{6,12}$/.test(pin)").length - 1, 5);
  assert.equal((html.match(/api\.setupOfflinePin\(offlinePin\)/g) || []).length, 5);
});

test("PIN enrollment is offered only after successful online login", () => {
  assert.equal((html.match(/Настроить офлайн-вход по PIN для этого устройства/g) || []).length, 5);
  assert.equal((html.match(/api\.setupOfflinePin\(offlinePin\)/g) || []).length, 5);
});
