import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");

test("large embedded checklist modes are loaded only when selected", async () => {
  assert.doesNotMatch(index, /const EMBED_(?:TT|BI|HYDRO)_HTML=/);
  assert.match(index, /import\('\.\/prototype\/embedded\/tt\.js'\)/);
  assert.match(index, /import\('\.\/prototype\/embedded\/bi\.js'\)/);
  assert.match(index, /import\('\.\/prototype\/embedded\/hydro\.js'\)/);
  const [tt, bi, hydro] = await Promise.all([
    import("../prototype/embedded/tt.js"),
    import("../prototype/embedded/bi.js"),
    import("../prototype/embedded/hydro.js"),
  ]);
  for (const module of [tt, bi, hydro]) {
    assert.equal(typeof module.default, "string");
    assert.match(module.default, /<!DOCTYPE html>/i);
    assert.match(module.default, /<\/html>/i);
  }
});

test("lazy checklist templates are precached for offline use", () => {
  for (const path of ["prototype/embedded/tt.js", "prototype/embedded/bi.js", "prototype/embedded/hydro.js"]) {
    assert.ok(sw.includes(path), path + " must be in the app shell cache");
  }
});
