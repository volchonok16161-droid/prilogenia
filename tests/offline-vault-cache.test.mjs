import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../sw.js", import.meta.url), "utf8");

test("offline vault modules are part of the app shell cache", () => {
  assert.match(source, /checklist-cache-v39/);
  assert.match(source, /\.\/prototype\/offline-vault-crypto\.js/);
  assert.match(source, /\.\/prototype\/offline-vault-db\.js/);
  assert.match(source, /\.\/prototype\/offline-sync-runner\.js/);
  assert.match(source, /\.\/prototype\/offline-sync-coordinator\.js/);
  assert.match(source, /\.\/prototype\/offline-checklist-schema\.js/);
  assert.match(source, /\.\/prototype\/supabase-auth\.js/);
  assert.match(source, /\.\/prototype\/supabase-cloud-sync\.js/);
  assert.match(source, /\.\/prototype\/supabase-cloud-photos\.js/);
});

test("service worker keeps GET-only cache behavior and does not cache auth writes", () => {
  assert.match(source, /if \(req\.method !== 'GET'\) return/);
  assert.match(source, /const APP_SHELL = \[/);
});

test("Supabase ESM entry and versioned package modules are cached for offline startup", () => {
  assert.match(source, /https:\/\/esm\.sh\/\@supabase\/supabase-js\@2\.118\.0/);
  assert.match(source, /url\.origin === 'https:\/\/esm\.sh'/);
  assert.match(source, /url\.pathname\.startsWith\('\/@supabase\/'\)/);
  assert.match(source, /cache\.put\(url, resp\)/);
});
