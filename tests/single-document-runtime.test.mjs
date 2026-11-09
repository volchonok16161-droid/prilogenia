import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../prototype/checklist/index.html", import.meta.url), "utf8");
const rootHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const runtime = await readFile(new URL("../prototype/checklist-runtime.js", import.meta.url), "utf8");
const risk = await readFile(new URL("../prototype/checklist-risk-core.js", import.meta.url), "utf8");
const riskViewer = await readFile(new URL("../prototype/checklist-risk-viewer.js", import.meta.url), "utf8");
const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");
const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const standalonePatchesSource = await readFile(new URL("../prototype/standalone-patches.js", import.meta.url), "utf8");
const standalonePatches = JSON.parse(standalonePatchesSource.replace(/^export const STANDALONE_PATCHES = /, "").trim().replace(/;$/, ""));
const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
const account = await readFile(new URL("../account.html", import.meta.url), "utf8");
const employeeLogin = await readFile(new URL("../employee-login.html", import.meta.url), "utf8");
const examples = JSON.parse(await readFile(new URL("../examples.json", import.meta.url), "utf8"));
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
  assert.doesNotMatch(runtime, /tmhUnifiedModeSelect/);
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


test("offline checklist boot does not statically depend on the remote Supabase SDK", () => {
  assert.ok(!auth.startsWith('import { createClient } from "https://esm.sh/'));
  assert.ok(auth.includes('import("https://esm.sh/@supabase/supabase-js@2.118.0")'));
  assert.ok(auth.includes("function subscribeAuthState(callback)"));
  assert.ok(auth.includes("get client() { return client; }"));
  assert.ok(auth.includes("getClient() { return getSupabaseClient(); }"));
});



test("unified header uses the native main-style mode modal without an inner checklist frame", () => {
  assert.match(runtime, /id="modePickerBtn"/);
  assert.match(runtime, /id="modeSelectModal"/);
  assert.match(runtime, /data-tmh-mode=/);
  assert.match(runtime, /location\.replace\(target\)/);
  assert.match(runtime, /await __PS\.chain/);
  assert.match(runtime, /modal\.style\.display="flex"/);
  assert.match(runtime, /Зона риска/);
  assert.match(runtime, /Инструкция/);
  assert.match(runtime, /id="tmhRiskOpenBtn"/);
  assert.match(runtime, /id="riskOverlay"/);
  assert.match(runtime, /checklist-risk-viewer\.js/);
  assert.doesNotMatch(runtime, /href="\/zona_riska\.xlsx" download=/);
  assert.match(riskViewer, /window.__TMH_ACTIVE_MODE__/);
  assert.match(riskViewer, /__TMH_GET_CLOUD_BACKUP_CONTEXT/);
  assert.doesNotMatch(riskViewer, /embeddedFrame/);
  assert.ok(runtime.includes('href="/instruction.html"'));
  assert.ok(runtime.includes("})();<" + String.fromCharCode(92) + "/script>"), "injected route script closes with a real script tag");
  assert.match(runtime, /<button class="logout-btn"[^>]*>/);
  assert.ok(runtime.includes('href="/account.html">Личный кабинет</a>$1'));
  assert.ok(runtime.includes('if (userInfoPattern.test(source)) source = source.replace(userInfoPattern, chrome + "$1")'));
  assert.match(runtime, /#tmhUnifiedModeSwitch\{display:flex/);
  assert.match(runtime, /id="tmhCompactControlStrip"/);
  assert.match(runtime, /insertBefore\(theme,risk\|\|null\)/);
  assert.match(runtime, /insertBefore\(route,risk\|\|null\)/);
  assert.match(runtime, /#tmhUnifiedModeSwitch #themeSwitch/);
  assert.match(runtime, /#tmhUnifiedModeSwitch #btnRouteView/);
  assert.doesNotMatch(runtime, /tmhUnifiedModeSelect/);
  assert.match(runtime, /grid-template-rows:auto auto auto auto/);
  assert.ok(runtime.includes("__tmhAttachFooterLayout(source)"), "standalone runtime mounts the unified footer layout");
  assert.match(runtime, /tmh-footer-main/);
  assert.match(runtime, /tmh-footer-unfilled/);
  assert.match(runtime, /tmh-footer-more/);
  assert.match(runtime, /Сохранить в облако/);
  assert.match(runtime, /Акт на подпись/);
  assert.match(runtime, /Ещё действия/);
  assert.ok(runtime.includes("})();<" + String.fromCharCode(92) + "/script>"), "footer layout script closes its injected script element");
  assert.match(runtime, /id="tmhCloudBackupBtn"/);
  assert.match(runtime, /id="tmhCloudRestoreBtn"/);
  assert.ok(runtime.includes("source.replace(footbar,footbar+"));
  assert.ok(runtime.includes('source.indexOf(\'id="tmhCloudBackupBtn"\')!==-1'));
  for (const template of templates) {
    assert.match(template, /class="footbar"/);
    for (const id of ["btnSave", "btnSaveHtml", "btnExportJson", "btnImportJson", "btnFindUnfilled", "btnReset"]) {
      assert.ok(template.includes('id="' + id + '"'), "footer includes " + id);
    }
    assert.ok(template.includes('id="btnExport"') || template.includes('id="btnExportWithPhotos"'), "footer includes spreadsheet export");
    assert.match(template, /\.footbar\s*\{/);
    assert.match(template, /\.footbar\s+\.btn/);
  }
  assert.doesNotMatch(runtime, /tmhActSignBtn|Формирование акта на подпись пока не подключено/);
  assert.match(standalonePatches.find((patch) => patch.id === "__ACT_PRINT_V5__").code, /actPrintBtnV5/);
  assert.match(standalonePatches.find((patch) => patch.id === "__ACT_PRINT_V5__").code, /function makeAct\(\)/);
});
test("responsive footer injector produces valid HTML and executable JavaScript", () => {
  const start = runtime.indexOf("function __tmhAttachFooterLayout(source){");
  const end = runtime.indexOf("\n\nconst MODE_LABELS", start);
  assert.ok(start >= 0 && end > start, "footer injector function is present");
  const attach = new Function(runtime.slice(start, end) + "; return __tmhAttachFooterLayout;")();
  const sample = '<!doctype html><html><head><script>const headDecoy = "</head>";</script></head><body><div class="footbar"><button id="btnFindUnfilled"></button></div><script>const bodyDecoy = "</body>";</script></body></html>';
  const output = attach(sample);
  assert.match(output, /tmhFooterLayoutStyles/);
  assert.match(output, /tmhFooterLayoutScript/);
  assert.match(output, /tmh-footer-main/);
  assert.ok(output.indexOf("tmhFooterLayoutStyles") > output.indexOf("const headDecoy"), "styles must be inserted before the real closing head tag");
  assert.ok(output.indexOf("tmhFooterLayoutScript") > output.indexOf("const bodyDecoy"), "footer script must be inserted before the real closing body tag");
  assert.ok(output.indexOf("tmhFooterLayoutScript") < output.lastIndexOf("</body>"));
  const scriptStart = output.indexOf('<script id="tmhFooterLayoutScript">') + '<script id="tmhFooterLayoutScript">'.length;
  const scriptEnd = output.indexOf("</script>", scriptStart);
  assert.ok(scriptEnd > scriptStart, "footer script is closed");
  assert.doesNotThrow(() => new Function(output.slice(scriptStart, scriptEnd)), "footer mover script is valid JavaScript");
  const script = output.slice(scriptStart, scriptEnd);
  assert.match(script, /tmhCloudBackupBtn/);
  assert.match(script, /actPrintBtnV5/);
  assert.match(script, /btnFindUnfilled/);
  assert.match(script, /tmhCloudRestoreBtn/);
  assert.match(script, /MutationObserver/);
});

test("generated mode-switch script parses before the button can be used", () => {
  const start = runtime.indexOf("  const routeScript = [");
  assert.ok(start >= 0, "mode-switch script source is present");
  const arrayStart = runtime.indexOf("[", start);
  const joinStart = runtime.indexOf("].join", arrayStart);
  const expressionEnd = runtime.indexOf(";", joinStart);
  const expression = runtime.slice(arrayStart, expressionEnd);
  const generated = new Function("mode", "return " + expression)("complex");
  const body = generated.slice(generated.indexOf("<script>") + 8, generated.lastIndexOf("</script>"));
  assert.doesNotThrow(() => new Function(body), "injected mode-switch script must be valid JavaScript");
  assert.match(body, /switchButton\.addEventListener\("click",openModeDialog\)/);
  assert.match(body, /catch\(error\)/);
});

test("compact toolbar mover script parses and keeps all controls in one strip", () => {
  const start = runtime.indexOf("const compactStripScript = ");
  assert.ok(start >= 0, "compact toolbar script is injected");
  const expressionStart = start + "const compactStripScript = ".length;
  const expressionEnd = runtime.indexOf(";\n  const compactStripClose", expressionStart);
  assert.ok(expressionEnd > expressionStart, "compact toolbar script expression is complete");
  const expression = runtime.slice(expressionStart, expressionEnd);
  const markup = new Function("mode", "return " + expression)("complex");
  const body = markup.slice(markup.indexOf(">") + 1, markup.lastIndexOf("<"));
  assert.doesNotThrow(() => new Function(body), "compact toolbar mover must be valid JavaScript");
  assert.match(body, /insertBefore\(theme,risk\|\|null\)/);
  assert.match(body, /insertBefore\(route,risk\|\|null\)/);
  assert.match(body, /insertBefore\(bar,userInfo\)/, "toolbar must be placed immediately before the account/logout row");
  assert.match(body, /MutationObserver/);
});

test("Service Worker parses as valid JavaScript before registration", () => {
  assert.doesNotThrow(() => new Function(sw));
  assert.match(sw, /\.catch\(async \(\) => \{/);
});

test("the unified route is included in the offline app shell", () => {
  assert.match(sw, /checklist-cache-v102/);
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
  assert.ok(runtime.includes('patch.code.replaceAll("window.parent", "window")'));
  assert.match(runtime, /const parentWindow=window;/);
  assert.match(runtime, /await startApp\(false\)[\s\S]*__TMH_GET_CLOUD_BACKUP_CONTEXT[\s\S]*restoreButton\.click\(\)/);
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
  assert.match(standalonePatches.find((patch) => patch.id === "__OKNOK_EXAMPLES_V1__").code, /new URL\(p, document\.baseURI\)/);
});


test("all reference example photos exist in the offline app shell", () => {
  const paths = [...new Set(Object.values(examples.items).flatMap((item) => Object.values(item)))];
  for (const path of paths) {
    assert.ok(sw.includes("'./" + (path.startsWith("/") ? path.slice(1) : path) + "'"), "offline shell caches " + path);
  }
});

test("the runtime and extracted risk registry are syntactically valid JavaScript modules", () => {
  const executableRuntime = runtime.replace(/^import .*;\s*$/gm, "");
  assert.doesNotThrow(() => new Function(executableRuntime));
  assert.doesNotThrow(() => new Function(risk));
});
