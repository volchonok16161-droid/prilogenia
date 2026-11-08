import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../prototype/checklist/index.html", import.meta.url), "utf8");
const runtime = await readFile(new URL("../prototype/checklist-runtime.js", import.meta.url), "utf8");
const risk = await readFile(new URL("../prototype/checklist-risk-core.js", import.meta.url), "utf8");
const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const templates = await Promise.all(
  ["tt", "bi", "hydro", "complex"].map((mode) =>
    readFile(new URL("../prototype/embedded/" + mode + ".js", import.meta.url), "utf8")
  )
);

test("the unified checklist has a top-level document entry and no nested browsing context", () => {
  assert.match(html, /prototype\/checklist-runtime\.js/);
  assert.doesNotMatch(html, /<iframe\b/i);
  assert.doesNotMatch(runtime, /createElement\(["']iframe|\.srcdoc\s*=/i);
  assert.match(runtime, /document\.open\(\)[\s\S]*document\.write\(source\)[\s\S]*document\.close\(\)/);
});

test("all five built-in modes share one top-level runtime and one mode switcher", () => {
  for (const mode of ["complex", "housings", "tt", "bi", "hydro"]) assert.ok(runtime.includes(mode), "runtime registers " + mode);
  assert.match(runtime, /tmhUnifiedModeSelect/);
  assert.match(runtime, /<base href=\"\/\">/);
  assert.match(runtime, /account\.html/);
  assert.match(runtime, /checklist_mode_v2/);
});

test("the unified runtime keeps auth, risk registry, NB514 compatibility and cloud backup integration", () => {
  assert.match(runtime, /supabase-auth\.js/);
  assert.match(runtime, /await import\("\.\/embedded\/tt\.js"\)/);
  assert.match(runtime, /await import\("\.\/embedded\/bi\.js"\)/);
  assert.match(runtime, /await import\("\.\/embedded\/hydro\.js"\)/);
  assert.match(runtime, /checklist-risk-core\.js/);
  assert.match(runtime, /applyRegistry\(source, mode\)/);
  assert.match(runtime, /NB514_OLD_JS/);
  assert.match(runtime, /__tmhAttachCloudBackup\(source, mode\)/);
  assert.match(runtime, /__TMH_SAVE_CLOUD_BACKUP_CONTEXT/);
  assert.match(risk, /window\.__RISK_CORE__/);
  assert.match(risk, /function ready\(ms\)/);
});

test("the unified route is included in the offline app shell", () => {
  assert.match(sw, /checklist-cache-v80/);
  assert.match(sw, /\.\/prototype\/checklist\/index\.html/);
  assert.match(sw, /\.\/prototype\/checklist-runtime\.js/);
  assert.match(sw, /\.\/prototype\/checklist-risk-core\.js/);
});


test("all runtime templates are standalone documents without iframe elements", () => {
  for (const template of templates) {
    assert.equal((template.match(/<iframe\b/gi) || []).length, 0);
    assert.ok(template.includes("<body"), "template has a body");
    assert.ok(template.includes("</html>"), "template closes its document");
    const executableTemplate = template.replace("export default ", "return ");
    assert.doesNotThrow(() => new Function(executableTemplate));
  }
});

test("the unified route is a required offline entry and offline navigation stays on that route", () => {
  assert.ok(sw.includes("'./prototype/checklist/index.html'"));
  assert.ok(sw.includes("const REQUIRED_APP_SHELL = ['./', './index.html', './prototype/checklist/index.html'];"));
  assert.ok(sw.includes("url.pathname === '/prototype/checklist/'"));
  assert.ok(sw.includes("caches.match('./prototype/checklist/index.html')"));
});

test("the runtime and extracted risk registry are syntactically valid JavaScript modules", () => {
  const executableRuntime = runtime.replace(/^import .*;\s*$/gm, "");
  assert.doesNotThrow(() => new Function(executableRuntime));
  assert.doesNotThrow(() => new Function(risk));
});
