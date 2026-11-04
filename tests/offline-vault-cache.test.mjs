import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../sw.js", import.meta.url), "utf8");

test("offline vault modules are part of the app shell cache", () => {
  assert.match(source, /checklist-cache-v22/);
  assert.match(source, /\.\/prototype\/offline-vault-crypto\.js/);
  assert.match(source, /\.\/prototype\/offline-vault-db\.js/);
});

test("service worker keeps GET-only cache behavior and does not cache auth writes", () => {
  assert.match(source, /if \(req\.method !== "GET"\) return/);
  assert.match(source, /const APP_SHELL = \[/);
});
