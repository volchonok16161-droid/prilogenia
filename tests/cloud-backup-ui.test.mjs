import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

function count(source, token) {
  return source.split(token).length - 1;
}

test("the explicit cloud backup button is injected into embedded checklist footbars", () => {
  assert.equal(count(html, "function __tmhAttachCloudBackup(source, mode)"), 1);
  assert.match(html, /id="tmhCloudBackupBtn" type="button">☁️ Сохранить в облако/);
  assert.match(html, /source\.replace\(footbar,footbar\+/);
  assert.equal(count(html, "frame.srcdoc=__tmhAttachCloudBackup(getEmbeddedSource(mode),mode);"), 2);
});

test("the embedded bridge exposes live checklist state and the scoped storage key", () => {
  assert.match(html, /window\.__TMH_GET_CLOUD_BACKUP_CONTEXT=function\(\)/);
  assert.ok(html.includes("return {state:STATE,mode:${JSON.stringify(mode||((typeof MODE==='undefined')?'unknown':MODE))},storageKey:LS_KEY};"));
  assert.match(html, /getStorageKey:function\(\)\{return getContext\(\)\.storageKey;\}/);
  assert.match(html, /authApi:api/);
});

test("cloud backup is explicit and never runs automatically during checklist startup", () => {
  assert.match(html, /button\.addEventListener\('click',async function\(\)/);
  assert.ok(html.includes("window.confirm('Сохранить текущий чек-лист в облако?"));
  assert.match(html, /const result=await backup\.saveCurrent\(\)/);
  assert.equal(count(html, "backup.saveCurrent()"), 2, "native and embedded checklists each have one explicit save handler");
  assert.match(html, /button\.disabled=true/);
  assert.match(html, /button\.disabled=false/);
});

test("the injected bridge closes both scripts safely inside the parent template", () => {
  const start = html.indexOf("function __tmhAttachCloudBackup(source, mode)");
  const end = html.indexOf("function getEmbeddedSource(mode)", start);
  const bridge = html.slice(start, end);
  assert.equal(count(bridge, "<\\/script>"), 2);
  assert.equal(count(bridge, "type=\"module\""), 1);
  assert.match(bridge, /createChecklistCloudBackup/);
  assert.match(bridge, /prototype\/supabase-cloud-backup\.js/);
  assert.match(bridge, /mode:\$\{JSON\.stringify\(mode\|\|\(\(typeof MODE==='undefined'\)\?'unknown':MODE\)\)\}/);

});


test("the primary checklist screen exposes its own explicit cloud backup action", () => {
  assert.match(html, /id="tmhNativeCloudBackupBtn" type="button">☁️ Сохранить в облако/);
  assert.match(html, /window\.__TMH_GET_NATIVE_CLOUD_BACKUP_CONTEXT=function\(\)/);
  assert.match(html, /const button=document\.getElementById\('tmhNativeCloudBackupBtn'\)/);
  assert.match(html, /window\.confirm\('Сохранить текущий чек-лист в облако\?/);
  assert.match(html, /import \{ createChecklistCloudBackup \} from '\.\/prototype\/supabase-cloud-backup\.js'/);
});


test("all embedded modes pass their active mode into the backup bridge", () => {
  assert.equal(count(html, "__tmhAttachCloudBackup(getEmbeddedSource(mode),mode)"), 2);
  for (const mode of ["complex", "housings", "tt", "bi", "hydro"]) {
    assert.ok(html.includes(mode + ":'"), "mode name is registered: " + mode);
  }
});


test("native checklist offers explicit restore and snapshots local state before overwrite", () => {
  assert.match(html, /id="tmhNativeCloudRestoreBtn" type="button">☁️ Восстановить из облака/);
  assert.match(html, /createChecklistCloudRestore/);
  assert.match(html, /beforeApply:async function\(\)\{await backup\.createSnapshot/);
  assert.match(html, /Фотографии с этого устройства сохранятся/);
  assert.match(html, /applyState:async function\(incoming,metadata\)/);
  assert.match(html, /_photo\$\/i\.test\(key\)/);
  assert.match(html, /await __PS\.chain/);
});

test("restored native checklist is linked to the restored cloud row revision", () => {
  assert.match(html, /applyState:async function\(incoming,metadata\)/);
  assert.match(html, /localStorage\.setItem\(LS_KEY\+'::cloud-ref',JSON\.stringify\(\{id:metadata\.id,revision:metadata\.revision\}\)\)/);
});


test("embedded TT, BI and hydro checklists expose a mode-isolated cloud restore action", () => {
  const start = html.indexOf("function __tmhAttachCloudBackup(source, mode)");
  const end = html.indexOf("function getEmbeddedSource(mode)", start);
  const bridge = html.slice(start, end);
  assert.match(bridge, /id="tmhCloudRestoreBtn" type="button">☁️ Восстановить из облака/);
  assert.match(bridge, /import \{ createChecklistCloudRestore \} from '\.\/prototype\/supabase-cloud-restore\.js'/);
  assert.match(bridge, /items\.filter\(function\(item\)\{return item\.mode===context\.mode;\}\)/);
  assert.match(bridge, /beforeApply:async function\(\)\{await backup\.createSnapshot/);
  assert.match(bridge, /applyState:context\.applyState/);
  assert.match(bridge, /localStorage\.setItem\(LS_KEY\+'::cloud-ref'/);
  assert.match(bridge, /_photo\$\/i\.test\(key\)/);
  assert.match(bridge, /window\.parent&&window\.parent\.TMHAuth/);
  assert.match(bridge, /Восстановить «'\+selected\.title/);
});

test("embedded restore is attached to the iframe document and keeps the parent auth session", () => {
  const start = html.indexOf("function __tmhAttachCloudBackup(source, mode)");
  const end = html.indexOf("function getEmbeddedSource(mode)", start);
  const bridge = html.slice(start, end);
  assert.match(bridge, /id="tmhCloudRestoreBtn"/);
  assert.match(bridge, /const api=window\.parent&&window\.parent\.TMHAuth/);
  assert.match(bridge, /createChecklistCloudRestore\(/);
  assert.match(bridge, /restore\.restore\(selected\.id\)/);
});
