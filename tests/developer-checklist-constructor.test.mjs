import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

test("developer constructor is visible to developer and admin roles only", async () => {
  const source = await readFile(resolve(ROOT, "index.html"), "utf8");
  assert.match(source, /function isDev\(\)\{try\{var u=JSON\.parse\(localStorage\.getItem\('checklist_user'\)\|\|'null'\);return !!\(u&&\(u\.dev===true\|\|u\.profileRole==='developer'\|\|u\.profileRole==='admin'\|\|u\.role==='admin'\)\);/);
  assert.match(source, /function refreshFab\(\)\{\$\('devFab'\)\.style\.display=isDev\(\)\?'block':'none';\}/);
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
