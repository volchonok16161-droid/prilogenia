import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("complex checklist marks local PIN sessions separately from Supabase sessions", () => {
  assert.equal((html.match(/window\.__TMH_OFFLINE_MODE = identity\.mode === 'offline-local-unlock'/g) || []).length, 1);
});

test("all five checklist runtimes save full snapshots through the encrypted vault during offline use", () => {
  assert.equal((html.match(/var __tmhOriginalSaveState = saveState/g) || []).length, 5);
  assert.equal((html.match(/api\.saveOfflineChecklist\(LS_KEY, snapshot\)/g) || []).length, 10);
  assert.match(html, /Сохранено в зашифрованном офлайн-хранилище/);
  assert.match(html, /await __tmhOfflineSaveChain/);
});

test("complex checklist restores encrypted snapshots before falling back to legacy local state", () => {
  assert.equal((html.match(/await api\.hasOfflineChecklist\(LS_KEY\)/g) || []).length, 2);
  assert.equal((html.match(/await api\.loadOfflineChecklist\(LS_KEY\)/g) || []).length, 1);
  assert.match(html, /let restoredEncrypted = false/);
  assert.match(html, /if \(!restoredEncrypted\)[\s\S]*?loadState\(\)/);
});

test("offline snapshot persistence is scoped to the authenticated storage owner", () => {
  assert.match(html, /if \(!window\.__TMH_STORAGE_UID \|\| window\.__TMH_STORAGE_LOCKED \|\| !STATE \|\| !STATE\.general\) return false/);
  assert.match(html, /window\.__TMH_OFFLINE_MODE/);
});
