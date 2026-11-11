import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");

test("offline cache version is advanced when the app shell changes", () => {
  assert.match(sw, /checklist-cache-v110/);
});

test("offline shell includes all five checklist runtimes and encrypted vault/sync modules", () => {
  for (const path of [
    "./prototype/embedded/tt.js",
    "./prototype/embedded/bi.js",
    "./prototype/embedded/hydro.js",
    "./prototype/embedded/complex.js",
    "./prototype/offline-vault-crypto.js",
    "./prototype/offline-vault-db.js",
    "./prototype/offline-vault-session.js",
    "./prototype/offline-checklist-store.js",
    "./prototype/offline-sync-runner.js",
    "./prototype/offline-sync-coordinator.js",
    "./prototype/offline-cloud-mapper.js",
    "./prototype/offline-checklist-schema.js",
    "./prototype/supabase-auth.js",
    "./prototype/supabase-cloud-photos.js",
    "./prototype/supabase-cloud-restore.js",
  ]) assert.ok(sw.includes("'" + path + "'"), "app shell missing " + path);
});

test("cache install fails only for required entry pages and reports optional misses", () => {
  assert.match(sw, /REQUIRED_APP_SHELL = \\[\\s*['"]\\.\\/['"],\\s*['"]\\.\\/index\\.html['"],\\s*['"]\\.\\/prototype\\/checklist\\/index\\.html['"]\\s*\\]/);
  assert.match(sw, /Promise\\.allSettled\\(\\s*OPTIONAL_APP_SHELL/);
  assert.match(sw, /failedOptional/);
  assert.match(sw, /__offline-cache-report\\.json/);
});
