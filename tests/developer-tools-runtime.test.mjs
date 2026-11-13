import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

test("standalone checklist runtime imports and mounts the existing developer tools fragment", async () => {
  const runtime = await readFile(resolve(ROOT, "prototype/checklist-runtime.js"), "utf8");
  const tools = await readFile(resolve(ROOT, "prototype/developer-tools-runtime.js"), "utf8");
  assert.match(runtime, /import \{ attachDeveloperTools \} from "\.\/developer-tools-runtime\.js"/);
  assert.match(runtime, /source = attachDeveloperTools\(source\)/);
  assert.match(tools, /export function attachDeveloperTools\(source\)/);
  assert.match(tools, /id=\\?"devFab\\?"/);
  assert.match(tools, /id=\\?"devOverlay\\?"/);
});

test("standalone developer tools fragment contains all established constructors and Excel editor", async () => {
  const tools = await readFile(resolve(ROOT, "prototype/developer-tools-runtime.js"), "utf8");
  assert.match(tools, /Конструктор оборудования/);
  assert.match(tools, /Конструктор чек-листов/);
  assert.match(tools, /Справочник \(zona_riska\.xlsx\)/);
  assert.match(tools, /__XL_PANEL_V1__/);
  assert.match(tools, /__DEV_PANEL_V1__/);
});

test("developer tools remain role-gated in the standalone route", async () => {
  const tools = await readFile(resolve(ROOT, "prototype/developer-tools-runtime.js"), "utf8");
  assert.match(tools, /window\.__TMH_AUTH_CONTEXT/);
  assert.match(tools, /ctx\.role/);
  assert.match(tools, /u\.profileRole==='developer'\|\|u\.profileRole==='admin'/);
  assert.match(tools, /function refreshFab\(\)/);
});


test("developer tools runtime is included in service-worker precache and gets a new cache version", async () => {
  const sw = await readFile(resolve(ROOT, "sw.js"), "utf8");
  const entry = await readFile(resolve(ROOT, "prototype/checklist/index.html"), "utf8");
  assert.match(sw, /checklist-cache-v\d+/);
  assert.match(sw, /\.\/prototype\/developer-tools-runtime\.js/);
  assert.match(entry, /prototype\/checklist-runtime\.js\?v=boot110/);
});

test("editable built-in equipment labels are wired into all existing checklist modes", async () => {
  const core=await readFile(resolve(ROOT,"prototype/checklist-risk-core.js"),"utf8");
  const dev=await readFile(resolve(ROOT,"prototype/developer-tools-runtime.js"),"utf8");
  assert.match(core,/function cleanBuiltinOverrides/);
  assert.match(core,/function applyBuiltinOverrides/);
  assert.match(dev,/builtinOverrides:c\.builtinOverrides/);
  for (const mode of ["complex","tt","bi","hydro"]) {
    const source=await readFile(resolve(ROOT,"prototype/embedded",mode+".js"),"utf8");
    assert.match(source,/applyBuiltinOverrides/);
  }
  const sw=await readFile(resolve(ROOT,"sw.js"),"utf8");
  assert.match(sw,/checklist-cache-v124/);
});

test("developer can choose built-in checklist operations without typing field IDs", async () => {
  const ui=await readFile(resolve(ROOT,"prototype/developer-tools-runtime.js"),"utf8");
  assert.match(ui,/builtinFieldCatalog/);
  assert.match(ui,/builtinPick/);
  assert.match(ui,/Выберите операцию/);
  for (const key of ["techi_steklo","zashchita_disks","zavodskoy_nomer"])assert.ok(ui.includes(key),key);
});
