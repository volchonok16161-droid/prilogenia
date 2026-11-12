import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
const checklistHtml = await readFile(new URL("../prototype/checklist/index.html", import.meta.url), "utf8");
const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");

test("PWA manifest has explicit install identity, root scope and checklist launch URL", () => {
  assert.equal(manifest.id, "/prototype/checklist/");
  assert.equal(manifest.start_url, "/prototype/checklist/?source=pwa");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
});

test("PWA manifest declares valid-sized same-origin PNG icons for any and maskable", () => {
  for (const size of [192, 512]) {
    assert.ok(manifest.icons.some(icon => icon.sizes === size + "x" + size && icon.purpose === "any" && icon.type === "image/png" && icon.src === "/icon-" + size + ".png"));
    assert.ok(manifest.icons.some(icon => icon.sizes === size + "x" + size && icon.purpose === "maskable" && icon.type === "image/png" && icon.src === "/icon-maskable-" + size + ".png"));
  }
});

test("checklist entry loads root manifest and registers root-scope service worker", () => {
  assert.match(checklistHtml, /<link rel="manifest" href="\/manifest\.json">/);
  assert.match(checklistHtml, /navigator\.serviceWorker\.register\("\/sw\.js",\{scope:"\/"\}\)/);
  assert.match(sw, /checklist-cache-v115/);
});
