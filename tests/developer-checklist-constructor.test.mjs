import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

test("developer constructor is visible to developer and admin roles only", async () => {
  const source = await readFile(resolve(ROOT, "index.html"), "utf8");
  assert.match(source, /function isDev\(\)/);
  assert.match(source, /window\.__TMH_AUTH_CONTEXT/);
  assert.match(source, /\['developer','admin'\]\.indexOf\(ctx\.role\)>=0/);
  assert.match(source, /u\.profileRole==='developer'\|\|u\.profileRole==='admin'/);
  assert.match(source, /function refreshFab\(\)\{var allowed=isDev\(\)/);
  assert.match(source, /if\(!allowed\)\{menu\.style\.display='none'/);
});

test("constructor publishing defaults to and is pinned to the development branch", async () => {
  const source = await readFile(resolve(ROOT, "index.html"), "utf8");
  assert.match(source, /branch:'feat\/cloud-checklist-progress',path:'oborudovanie\.json'/);
  assert.match(source, /d\.branch='feat\/cloud-checklist-progress'/);
  assert.match(source, /Публикация в main запрещена/);
});

test("legacy checklist definitions imported from main are editable constructor records", async () => {
  const data = JSON.parse(await readFile(resolve(ROOT, "oborudovanie.json"), "utf8"));
  const ids = new Set(data.equipment.map(item => item.id));
  const checklistTitles = new Set(data.checklists.map(item => item.title));
  assert.ok(checklistTitles.has("Чек-лист проверки автосцепного оборудования РТ-130"));
  assert.ok(checklistTitles.has("Чек-лист проверки БЦВ"));
  assert.ok(checklistTitles.has("Осмотр МК-9 при выявлении отгара/приваривания силовых контактов"));
  for (const checklist of data.checklists) {
    assert.ok(Array.isArray(checklist.equipment) && checklist.equipment.length > 0);
    for (const equipmentId of checklist.equipment) assert.ok(ids.has(equipmentId), checklist.title + " must reference existing equipment " + equipmentId);
  }
});


test("constructor supports assigning custom equipment to all five checklist modes", async () => {
  const core = await readFile(resolve(ROOT, "prototype/checklist-risk-core.js"), "utf8");
  const editor = await readFile(resolve(ROOT, "prototype/developer-tools-runtime.js"), "utf8");
  for (const mode of ["complex", "housings", "tt", "bi", "hydro"]) {
    assert.ok(core.includes("'" + mode + "'"), "core should allow " + mode);
    assert.ok(editor.includes("['" + mode + "',"), "editor should expose " + mode);
  }
  assert.match(core, /out\.push\(\{id:id,title:title,checklists:modes/);
  assert.match(editor, /it\.checklists=assigned\.slice\(\)/);
});

test("all five embedded checklist engines receive constructor equipment without replacing built-in equipment", async () => {
  const files = {
    complex: await readFile(resolve(ROOT, "prototype/embedded/complex.js"), "utf8"),
    tt: await readFile(resolve(ROOT, "prototype/embedded/tt.js"), "utf8"),
    bi: await readFile(resolve(ROOT, "prototype/embedded/bi.js"), "utf8"),
    hydro: await readFile(resolve(ROOT, "prototype/embedded/hydro.js"), "utf8")
  };
  assert.match(files.complex, /CUSTOM_EQUIPMENT/);
  assert.match(files.complex, /ce\.checklists\.indexOf\(activeMode\)/);
  assert.match(files.complex, /checklists\.indexOf\(activeMode\)/);
  assert.match(files.tt, /item\.checklists&&item\.checklists\.indexOf\('tt'\)/);
  assert.match(files.bi, /item\.checklists&&item\.checklists\.indexOf\('bi'\)/);
  assert.match(files.hydro, /item\.checklists&&item\.checklists\.indexOf\('hydro'\)/);
  assert.match(files.bi, /eq\.custom && field\.type==='text'/);
  assert.match(files.hydro, /if\(eq\.custom\)/);
  for (const [mode, source] of Object.entries(files)) {
    assert.match(source, /CUSTOM_EQUIPMENT/, mode + " must receive custom equipment payload");
  }
});


test("housings mode keeps its built-in checklist and exposes assigned custom equipment", async () => {
  const complex = await readFile(resolve(ROOT, "prototype/embedded/complex.js"), "utf8");
  assert.match(complex, /if\(!type\)return r;/);
  assert.doesNotMatch(complex, /if\(!type\|\|\(typeof MODE!=='undefined'&&MODE==='housings'\)\)return r/);
  assert.match(complex, /const custom=EQUIPMENT\.filter\(e=>e\.custom\)/);
  assert.match(complex, /addHousingChip\(base,true\);custom\.forEach/);
});

test("TT and BI custom equipment preserve layout blocks as separate saved instances", async () => {
  const tt = await readFile(resolve(ROOT, "prototype/embedded/tt.js"), "utf8");
  const bi = await readFile(resolve(ROOT, "prototype/embedded/bi.js"), "utf8");
  for (const [mode, source] of [["TT", tt], ["BI", bi]]) {
    assert.match(source, /selectedBlocks\.forEach\(function\(block\)/, mode + " must expand configured layout blocks");
    assert.match(source, /eq&&eq\.custom\?\((?:instance|inst)\.block\|\|''\):''/, mode + " should distinguish custom instances");
    assert.match(source, /eq\.custom && .*instance\.block|eq\.custom && .*inst\.block/, mode + " should show the configured block label");
    assert.match(source, /fl\.explain/, mode + " should retain field explanations");
    assert.match(source, /field\.calc === false/, mode + " should respect fields excluded from deviation calculation");
  }
});

test("hydro custom equipment uses configured blocks and honours field normal values and calculation flags", async () => {
  const hydro = await readFile(resolve(ROOT, "prototype/embedded/hydro.js"), "utf8");
  assert.match(hydro, /Array\.isArray\(layout\.blocks\)&&layout\.blocks\.length\?layout\.blocks\.slice\(\):allowedBlocks\.slice\(\)/);
  assert.match(hydro, /ALL_POSSIBLE_TYPES\.push\(block\)/);
  assert.match(hydro, /if\(Array\.isArray\(STATE\.selected\).*STATE\.selected\.push\(item\.id\)/);
  assert.match(hydro, /fl\.calc!==false/);
  assert.match(hydro, /fl\.ok\.indexOf\(v\)<0/);
  assert.match(hydro, /field\.hint\|\|field\.explain/);
});
