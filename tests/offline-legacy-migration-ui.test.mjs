import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");
const ui = await readFile(new URL("../prototype/offline-legacy-migration-ui.js", import.meta.url), "utf8");
const store = await readFile(new URL("../prototype/offline-checklist-store.js", import.meta.url), "utf8");
const db = await readFile(new URL("../prototype/offline-vault-db.js", import.meta.url), "utf8");
const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");

test("legacy migration is exposed only through the unlocked owner-scoped vault", () => {
  assert.match(auth, /async function migrateLegacyChecklist\(storageId, snapshot, confirmed = false\)/);
  assert.match(auth, /getChecklistMode\(storageId\)/);
  assert.match(auth, /store\.migrateLegacySnapshot\(/);
  assert.match(auth, /migrateLegacyChecklist,/);
  assert.match(auth, /activeOfflineVault \|\| !activeOfflineUserId/);
});

test("legacy migration stores an encrypted snapshot without queuing cloud work", () => {
  assert.match(store, /async function migrateLegacySnapshot/);
  assert.match(store, /confirmed !== true/);
  assert.match(store, /await vault\.encrypt\(legacyValue\)/);
  assert.match(store, /database\.putRecordIfAbsent/);
  assert.doesNotMatch(store.slice(store.indexOf("async function migrateLegacySnapshot"), store.indexOf("return Object.freeze")), /putRecordAndEnqueue|putRecordAndCoalesceQueue/);
  assert.match(db, /async function putRecordIfAbsent/);
  assert.match(db, /records\.add\(/);
  assert.match(db, /putRecordIfAbsent,/);
});

test("UI requires an explicit confirmation and leaves legacy storage untouched", () => {
  assert.match(ui, /window\.parent !== window/);
  assert.match(ui, /__TMH_GET_NATIVE_CLOUD_BACKUP_CONTEXT/);
  assert.match(ui, /__TMH_GET_CLOUD_BACKUP_CONTEXT/);
  assert.match(ui, /window\.confirm\(/);
  assert.match(ui, /api\.migrateLegacyChecklist\(context\.storageKey, snapshot, true\)/);
  assert.match(ui, /Облачная отправка НЕ включится/);
  assert.match(ui, /Исходная запись и фотографии останутся на месте/);
  assert.doesNotMatch(ui, /localStorage\.(removeItem|clear|setItem)/);
});

test("legacy migration service remains available but its UI is not loaded for employees", () => {
  assert.match(auth, /async function migrateLegacyChecklist/);
  assert.doesNotMatch(auth, /offline-legacy-migration-ui\.js/);
  assert.match(sw, /checklist-cache-v44/);
  assert.doesNotMatch(sw, /offline-legacy-migration-ui\.js/);
});
