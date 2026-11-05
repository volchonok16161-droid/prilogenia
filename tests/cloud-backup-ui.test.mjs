import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = (await readFile(new URL("../index.html", import.meta.url), "utf8")) + (await Promise.all([
  "../prototype/embedded/tt.js",
  "../prototype/embedded/bi.js",
  "../prototype/embedded/hydro.js",
  "../prototype/embedded/complex.js",
].map((path) => readFile(new URL(path, import.meta.url), "utf8")))).join("\n");

function count(source, token) {
  return source.split(token).length - 1;
}

test("the explicit cloud backup button is injected into embedded checklist footbars", () => {
  assert.equal(count(html, "function __tmhAttachCloudBackup(source, mode)"), 1);
  assert.match(html, /id="tmhCloudBackupBtn" type="button">☁️ Сохранить в облако/);
  assert.match(html, /source\.replace\(footbar,footbar\+/);
  assert.match(html, /const source=await getEmbeddedSource\(mode\);[\s\S]*?window\.__tmhAttachCloudBackup\(source,mode\)/);
});

test("the embedded bridge exposes live checklist state and the scoped storage key", () => {
  assert.match(html, /window\.__TMH_GET_CLOUD_BACKUP_CONTEXT=function\(\)/);
  assert.match(html, /state:STATE,stats:\(typeof computeStats===.function.\?computeStats\(\):null\),persistState:/);
  assert.match(html, /state:STATE,stats:\(typeof computeStats===.function.\?computeStats\(\):null\),persistState:/);
  assert.match(html, /getStorageKey:function\(\)\{return getContext\(\)\.storageKey;\}/);
  assert.match(html, /authApi:api/);
});

test("cloud backup is explicit and never runs automatically during checklist startup", () => {
  assert.match(html, /button\.addEventListener\('click',async function\(\)/);
  assert.ok(html.includes("window.confirm('Сохранить текущий чек-лист и фотографии в приватное облако?"));
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
  assert.match(html, /window\.confirm\('Сохранить текущий чек-лист и фотографии в приватное облако\?/);
  assert.match(html, /import \{ createChecklistCloudBackup \} from '\.\/prototype\/supabase-cloud-backup\.js'/);
});


test("all embedded modes pass their active mode into the backup bridge", () => {
  assert.equal(count(html, "window.__tmhAttachCloudBackup(source,mode)"), 1);
  assert.match(html, /await getEmbeddedSource\(mode\)/);
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
  assert.match(html, /localStorage\.setItem\(LS_KEY\+'::cloud-ref::'\+STATE\.__cloudChecklistId,JSON\.stringify\(\{id:metadata\.id,revision:metadata\.revision\}\)\)/);
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
  assert.match(bridge, /localStorage\.setItem\(LS_KEY\+'::cloud-ref::'\+STATE\.__cloudChecklistId/);
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


test("native and embedded cloud save/restore wire the private photo Storage adapter", () => {
  assert.match(html, /import \{ createChecklistPhotoSync \} from '\.\/prototype\/supabase-cloud-photos\.js'/);
  assert.equal(count(html, "createChecklistPhotoSync({authApi:api})"), 4);
  assert.equal(count(html, "hydrateState:async function(state,metadata,manifest)"), 2);
  assert.match(html, /photoSync,/);
  assert.match(html, /photoSync\.restoreState/);
  assert.match(html, /фотографий: '\+result\.photosUploaded/);
});


test("cloud photo actions fail closed when IndexedDB photo hydration or its queue fails", () => {
  assert.equal(count(html, "await __psEnsureCloudReady();"), 9);
  assert.equal(count(html, "__PS.restoreFailed=true;"), 4);
  assert.match(html, /if\(__PS\.restoreFailed\)throw new Error\('Не удалось прочитать фотографии из IndexedDB/);
  assert.match(html, /if\(ok===false\)throw new Error\('Не удалось завершить очередь фотографий IndexedDB/);
  assert.equal(count(html, "await __psReady();if(__PS.chain)await __PS.chain;"), 0);
});

test("the embedded bridge escapes alert newlines before assigning the generated srcdoc", () => {
  const start = html.indexOf("function __tmhAttachCloudBackup(source, mode)");
  const end = html.indexOf("function getEmbeddedSource(mode)", start);
  const bridge = html.slice(start, end);
  assert.ok(
    bridge.includes("else window.alert(message+'\\\\nЗагружено фотографий: '+result.photosUploaded);"),
    "the nested srcdoc script must receive a literal \\n escape, not a raw line break",
  );
});

test("generated srcdoc scripts are syntactically valid in every embedded mode", () => {
  const start = html.indexOf("function __tmhAttachCloudBackup(source, mode)");
  const end = html.indexOf("\n\nwindow.__tmhAttachCloudBackup", start);
  assert.notEqual(start, -1, "embedded bridge function must exist");
  assert.notEqual(end, -1, "embedded bridge function must have a clear end");

  const attach = new Function(html.slice(start, end) + ";return __tmhAttachCloudBackup;")();
  for (const mode of ["tt", "bi", "hydro"]) {
    const generated = attach('<div class="footbar"></div></body>')
      .replaceAll("<\\/script>", "</script>");
    const scripts = [...generated.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
    assert.equal(scripts.length, 2, mode + " must produce both bridge scripts");

    for (const [, attributes, source] of scripts) {
      const parseable = source.replace(/^\s*import\s+.*?;\s*$/gm, "");
      assert.doesNotThrow(
        () => new Function(parseable),
        mode + " generated script must parse (" + attributes.trim() + ")",
      );
    }
  }
});
