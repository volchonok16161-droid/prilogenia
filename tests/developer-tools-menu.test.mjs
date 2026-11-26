import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

test("developer menu exposes all three existing tools from one entry point", async () => {
  const source = await readFile(resolve(ROOT, "index.html"), "utf8");
  const menuStart = source.indexOf("var menu=h('div',{id:'devMenu'");
  const menuEnd = source.indexOf("document.body.appendChild(menu)", menuStart);
  assert.ok(menuStart >= 0 && menuEnd > menuStart);
  const menu = source.slice(menuStart, menuEnd);
  assert.match(menu, /Конструктор оборудования/);
  assert.match(menu, /Конструктор чек-листов/);
  assert.match(menu, /Справочник \(Excel\)/);
  assert.match(menu, /window\.__XL_PANEL_V1__\.open\(\)/);
  assert.match(menu, /st\.view='eq';open\(\)/);
  assert.match(menu, /st\.view='ck';open\(\)/);
});

test("developer tools menu trusts the verified auth context and only shows for developer/admin", async () => {
  const source = await readFile(resolve(ROOT, "index.html"), "utf8");
  assert.match(source, /window\.__TMH_AUTH_CONTEXT/);
  assert.match(source, /\['developer','admin'\]\.indexOf\(ctx\.role\)>=0/);
  assert.match(source, /u\.profileRole==='developer'\|\|u\.profileRole==='admin'/);
  assert.match(source, /function refreshFab\(\)\{var allowed=isDev\(\)/);
  assert.match(source, /if\(!allowed\)\{menu\.style\.display='none'/);
});

test("developer tools menu exposes accessible expanded state", async () => {
  const source = await readFile(resolve(ROOT, "index.html"), "utf8");
  assert.match(source, /setAttribute\('aria-haspopup','menu'\)/);
  assert.match(source, /setAttribute\('aria-expanded',String\(show\)\)/);
});
