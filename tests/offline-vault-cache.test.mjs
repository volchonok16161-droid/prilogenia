import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../sw.js", import.meta.url), "utf8");
test("offline modules and demo photo store are in app shell cache", () => {
  for (const path of ["offline-vault-crypto.js","offline-vault-db.js","offline-sync-runner.js","offline-sync-coordinator.js","offline-checklist-schema.js","supabase-auth.js","supabase-cloud-sync.js","supabase-cloud-photos.js","offline-five-mode-demo.html","offline-demo-photo-store.js"]) {
    assert.match(source, new RegExp(path.replaceAll(".", "\\.")));
  }
  assert.doesNotMatch(source, /offline-legacy-migration-ui\.js/);
  assert.match(source, /checklist-cache-v44/);
});
test("service worker caches GET only and excludes auth writes", () => {
  assert.match(source, /if \(req\.method !== 'GET'\) return/);
  assert.match(source, /const APP_SHELL = \[/);
});
test("Supabase ESM and versioned modules are cached for offline startup", () => {
  assert.match(source, /https:\/\/esm\.sh\/\@supabase\/supabase-js\@2\.118\.0/);
  assert.match(source, /url\.origin === 'https:\/\/esm\.sh'/);
  assert.match(source, /url\.pathname\.startsWith\('\/@supabase\/'\)/);
  assert.match(source, /cache\.put\(url, resp\)/);
});
