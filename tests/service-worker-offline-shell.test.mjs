import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");

test("offline cache version is advanced when the app shell changes", () => {
  assert.match(sw, /checklist-cache-v116/);
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
  assert.ok(sw.includes("const REQUIRED_APP_SHELL = ["));
  assert.ok(sw.includes("Promise.allSettled"));
  assert.match(sw, /failedOptional/);
  assert.ok(sw.includes("__offline-cache-report.json"));
});


test("same-origin cache is restricted to the explicit app shell and clean checklist route", () => {
  assert.match(sw, /const APP_SHELL_PATHS = new Set\(/);
  assert.match(sw, /APP_SHELL_PATHS\.add\(new URL\('\.\/prototype\/checklist\/'/);
  assert.match(sw, /isSameOrigin && !APP_SHELL_PATHS\.has\(url\.pathname\)/);
  assert.match(sw, /const cacheRequest = isChecklistRoute[\s\S]*new Request\(url\.origin \+ url\.pathname\)/);
  assert.match(sw, /caches\.match\(cacheRequest\)/);
  assert.match(sw, /cache\.put\(cacheRequest, resp\)/);
});

test("dynamic same-origin endpoints are not admitted to the service-worker cache", () => {
  assert.match(sw, /Same-origin API, персональные данные и произвольные динамические ответы/);
  assert.match(sw, /!APP_SHELL_PATHS\.has\(url\.pathname\)/);
});


test("versioned allowlisted app assets use their canonical offline cache key", () => {
  assert.match(sw, /isSameOrigin && !APP_SHELL_PATHS\.has\(url\.pathname\)/);
  assert.match(sw, /isSameOrigin\s*\?\s*new Request\(url\.origin \+ url\.pathname\)/);
  assert.match(sw, /new Request\(url\.origin \+ url\.pathname\)/);
});
