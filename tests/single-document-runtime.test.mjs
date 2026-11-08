import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../prototype/checklist/index.html", import.meta.url), "utf8");
const rootHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const runtime = await readFile(new URL("../prototype/checklist-runtime.js", import.meta.url), "utf8");
const risk = await readFile(new URL("../prototype/checklist-risk-core.js", import.meta.url), "utf8");
const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const standalonePatchesSource = await readFile(new URL("../prototype/standalone-patches.js", import.meta.url), "utf8");
const standalonePatches = JSON.parse(standalonePatchesSource.replace(/^export const STANDALONE_PATCHES = /, "").trim().replace(/;$/, ""));
const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
const account = await readFile(new URL("../account.html", import.meta.url), "utf8");
const employeeLogin = await readFile(new URL("../employee-login.html", import.meta.url), "utf8");
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
  assert.match(sw, /checklist-cache-v83/);
  assert.match(sw, /\.\/prototype\/checklist\/index\.html/);
  assert.match(sw, /\.\/prototype\/checklist-runtime\.js/);
  assert.match(sw, /\.\/prototype\/standalone-patches\.js/);
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


test("root entry, account, employee login and installed PWA open the unified checklist route", () => {
  assert.match(rootHtml, /location\.pathname==="\/"\|\|location\.pathname\.endsWith\("\/index\.html"\)/);
  assert.match(rootHtml, /location\.replace\("\.\/prototype\/checklist\/"\+location\.search\+location\.hash\)/);
  assert.equal(manifest.start_url, "./prototype/checklist/");
  assert.match(account, /href="\.\/prototype\/checklist\//);
  assert.match(employeeLogin, /href="\.\/prototype\/checklist\//);
  assert.match(employeeLogin, /location\.replace\("\.\/prototype\/checklist\/"\)/);
});

test("standalone cloud restore uses its own auth context and hydrates local state before applying remote data", () => {
  assert.ok(runtime.includes("source.replaceAll") && runtime.includes("window.parent"));
  assert.match(runtime, /const parentWindow=window;/);
  assert.match(runtime, /await startApp\(false\)[\s\S]*__TMH_GET_CLOUD_BACKUP_CONTEXT[\s\S]*button\.click\(\)/);
  assert.match(runtime, /window\.__TMH_SAVE_CLOUD_BACKUP_CONTEXT\(getContext\(\)\)/);
});


test("standalone runtime restores the legacy feature patches and includes them in offline cache", () => {
  const expected = [
    "__UNIVERSAL_PATCH_V2__", "__ORDER_CTOR_V4__", "__ROUTE_FIX_V1__",
    "__ROUTE_REGROUP_V2__", "__MFG_REF_PHOTOS_V5__", "__OKNOK_EXAMPLES_V1__",
    "__ACT_PRINT_V5__", "__EXPORT_PHOTO_GUARD_V2__", "__ADMIN_NO_LIMITS_V1__",
    "__MULTI_JSON_FIX_V5__"
  ];
  assert.deepEqual(standalonePatches.map((patch) => patch.id), expected);
  for (const patch of standalonePatches) {
    assert.ok(patch.code.length > 100, patch.id + " has executable code");
    assert.doesNotThrow(() => new Function(patch.code), patch.id + " parses");
  }
  assert.ok(runtime.includes("source.replaceAll") && runtime.includes("window.parent"));
  assert.match(runtime, /STANDALONE_PATCHES\.map/);
  assert.ok(runtime.includes("migratedPatches + \"</body>\""));
  assert.ok(runtime.includes("source.lastIndexOf(\"</body>\")"));
  assert.ok(runtime.includes("source.lastIndexOf(\"</head>\""));
  assert.ok(sw.includes("'./prototype/standalone-patches.js'"));
});

test("the runtime and extracted risk registry are syntactically valid JavaScript modules", () => {
  const executableRuntime = runtime.replace(/^import .*;\s*$/gm, "");
  assert.doesNotThrow(() => new Function(executableRuntime));
  assert.doesNotThrow(() => new Function(risk));
});
