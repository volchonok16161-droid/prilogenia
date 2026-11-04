import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const html = await readFile(new URL("../prototype/offline-five-mode-demo.html", import.meta.url), "utf8");

test("five-mode demo is isolated from production accounts and uses a separate IndexedDB", () => {
  assert.match(html, /tmh-offline-five-mode-demo-v1/);
  assert.match(html, /Не подключается к Supabase/);
  assert.match(html, /demo-checklist:/);
  assert.match(html, /createOfflineVaultDatabase/);
  assert.match(html, /createOfflineVaultCrypto/);
});

test("demo exercises actual AES-GCM encrypt/decrypt and persistent save/load", () => {
  assert.match(html, /cryptoVault\.createDescriptor/);
  assert.match(html, /cryptoVault\.unlock/);
  assert.match(html, /vault\.encrypt\(value\)/);
  assert.match(html, /vault\.decrypt\(encrypted\)/);
  assert.match(html, /db\.putRecord/);
  assert.match(html, /db\.getRecord/);
});

test("demo provides five checklist modes and photo input without touching legacy storage", () => {
  for (const mode of ["complex","housings","tt","bi","hydro"]) assert.match(html, new RegExp(mode));
  assert.match(html, /type="file" accept="image\/jpeg,image\/png,image\/webp"/);
  assert.doesNotMatch(html, /localStorage/);
});
