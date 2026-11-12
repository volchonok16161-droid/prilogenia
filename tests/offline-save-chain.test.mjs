import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = (await readFile(new URL("../index.html", import.meta.url), "utf8")) + (await Promise.all([
  "../prototype/embedded/tt.js",
  "../prototype/embedded/bi.js",
  "../prototype/embedded/hydro.js",
  "../prototype/embedded/complex.js",
].map((path) => readFile(new URL(path, import.meta.url), "utf8")))).join("\n");

function occurrences(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

test("all five checklist runtimes retain encrypted offline save failures", () => {
  assert.equal(occurrences(html, /var __tmhOfflineSaveError = null;/g), 5);
  assert.equal(occurrences(html, /__tmhOfflineSaveError = null;\s*return api\.saveOfflineChecklist\(LS_KEY, snapshot\);/g), 10);
  assert.equal(occurrences(html, /__tmhOfflineSaveError = error;\s*console\.error\('Encrypted offline save failed', error\);/g), 10);
});

test("logout waits for the offline save chain and refuses to sign out after a failed write", () => {
  assert.equal(occurrences(html, /await __tmhOfflineSaveChain;\s*if \(typeof __tmhOfflineSaveError !== 'undefined' && __tmhOfflineSaveError\)/g), 5);
  assert.equal(occurrences(html, /window\.__TMH_STORAGE_LOCKED = false;\s*showToast\('Не удалось сохранить изменения на устройстве\. Выход отменён — повторите попытку\.'\);\s*return;/g), 5);
});

test("the existing pending-write unload guard remains in every checklist runtime", () => {
  assert.equal(occurrences(html, /var __tmhOfflinePendingWrites = 0;\s*var __tmhOfflineSaveError = null;/g), 5);
  assert.equal(occurrences(html, /window\.addEventListener\('beforeunload'/g), 10);
});

test("offline saves synchronously persist the account-scoped local snapshot before encrypted IndexedDB writes", () => {
  for (const path of ["prototype/embedded/complex.js","prototype/embedded/tt.js","prototype/embedded/bi.js","prototype/embedded/hydro.js"]) {
    // Source-level acceptance: the offline branch must invoke the original
    // synchronous localStorage saver before enqueueing asynchronous encryption.
  }
  assert.equal(occurrences(html, /var legacySaved = __tmhOriginalSaveState\\.apply\\(this, arguments\);/g), 4);
  assert.equal(occurrences(html, /if \\(legacySaved === false\\) return false;/g), 4);
});
