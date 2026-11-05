import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");

test("large embedded checklist modes are loaded only when selected", async () => {
  assert.doesNotMatch(index, /const EMBED_(?:TT|BI|HYDRO|CHECKLIST)_HTML=/);
  assert.match(index, /import\('\.\/prototype\/embedded\/tt\.js'\)/);
  assert.match(index, /import\('\.\/prototype\/embedded\/bi\.js'\)/);
  assert.match(index, /import\('\.\/prototype\/embedded\/hydro\.js'\)/);
  assert.match(index, /import\('\.\/prototype\/embedded\/complex\.js'\)/);
  const [tt, bi, hydro, complex] = await Promise.all([
    import("../prototype/embedded/tt.js"),
    import("../prototype/embedded/bi.js"),
    import("../prototype/embedded/hydro.js"),
    import("../prototype/embedded/complex.js"),
  ]);
  for (const module of [tt, bi, hydro, complex]) {
    assert.equal(typeof module.default, "string");
    assert.match(module.default, /<!DOCTYPE html>/i);
    assert.match(module.default, /<\/html>/i);
  }
});

test("lazy checklist templates are precached for offline use", () => {
  for (const path of ["prototype/embedded/tt.js", "prototype/embedded/bi.js", "prototype/embedded/hydro.js", "prototype/embedded/complex.js"]) {
    assert.ok(sw.includes(path), path + " must be in the app shell cache");
  }
});


test("embedded checklist opening is idempotent and ignores stale async loads", () => {
  assert.match(index, /window\.__TMH_EMBED_OPEN_SEQ/);
  assert.match(index, /window\.__TMH_ACTIVE_EMBEDDED_MODE===mode/);
  assert.match(index, /if\(openSeq!==window\.__TMH_EMBED_OPEN_SEQ\)return;/);
  assert.match(index, /function hideEmbeddedApp\(\)\{window\.__TMH_EMBED_OPEN_SEQ\+\+/);
});

test("main application initializes its theme controls only once", () => {
  assert.doesNotMatch(index, /initThemeSwitch\(\);\s*initThemeSwitch\(\);/);
});
