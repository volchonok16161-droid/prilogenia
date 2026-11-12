import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
const checklistHtml = await readFile(new URL("../prototype/checklist/index.html", import.meta.url), "utf8");
const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

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

test("declared PWA icon files are real PNGs with their declared dimensions", async () => {
  for (const icon of manifest.icons) {
    const file = await readFile(new URL("../" + icon.src.slice(1), import.meta.url));
    assert.deepEqual(file.subarray(0, 8), pngSignature, icon.src + " must have a PNG signature");
    assert.equal(file.readUInt32BE(16), Number(icon.sizes.split("x")[0]), icon.src + " width");
    assert.equal(file.readUInt32BE(20), Number(icon.sizes.split("x")[1]), icon.src + " height");
  }
});

test("checklist entry loads root manifest and registers root-scope service worker", () => {
  assert.match(checklistHtml, /<link rel="manifest" href="\/manifest\.json">/);
  assert.match(checklistHtml, /navigator\.serviceWorker\.register\("\/sw\.js",\{scope:"\/"\}\)/);
  assert.match(sw, /checklist-cache-v116/);
});

test("service worker maps the clean checklist URL to its own offline entry point", () => {
  assert.match(sw, /APP_SHELL_PATHS\.add\(new URL\('\.\/prototype\/checklist\/'/);
  assert.match(sw, /url\.pathname === '\/prototype\/checklist\/' \|\| url\.pathname === '\/prototype\/checklist'/);
  assert.match(sw, /caches\.match\('\.\/prototype\/checklist\/index\.html'\)/);
});
