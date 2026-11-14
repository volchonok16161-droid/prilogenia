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
  assert.match(html, /storageKey:LS_KEY/);
  assert.match(html, /authApi:api/);
});

test("cloud backup is explicit and never runs automatically during checklist startup", () => {
  assert.match(html, /button\.addEventListener\('click',async function\(\)/);
  assert.ok(html.includes("window.confirm('Сохранить текущий чек-лист и фотографии в приватное облако?"));
  assert.match(html, /return backup\.saveCurrent\(\)/);
  assert.equal(count(html, "backup.saveCurrent()"), 1, "native and embedded save actions share one backup implementation");
  assert.match(html, /button\.disabled=true/);
  assert.match(html, /button\.disabled=false/);
});

test("the injected bridge closes both scripts safely inside the parent template", () => {
  const start = html.indexOf("function __tmhAttachCloudBackup(source, mode)");
  const end = html.indexOf("function getEmbeddedSource(mode)", start);
  const bridge = html.slice(start, end);
  assert.equal(count(bridge, "<\\/script>"), 2);
  assert.equal(count(bridge, "type=\"module\""), 1);
  assert.match(bridge, /window\.parent\.__TMH_SAVE_CLOUD_BACKUP_CONTEXT\(getContext\(\)\)/);
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
  assert.equal(count(html, "createChecklistPhotoSync({ authApi: api })"), 1);
  assert.equal(count(html, "hydrateState:async function(state,metadata,manifest)"), 2);
  assert.match(html, /photoSync,/);
  assert.match(html, /photoSync\.restoreState/);
  assert.match(html, /фотографий: '\+result\.photosUploaded/);
});


test("cloud photo actions fail closed when IndexedDB photo hydration or its queue fails", () => {
  assert.equal(count(html, "await __psEnsureCloudReady();"), 13);
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


test("native cloud restore persists every restored and preserved photo to IndexedDB before replacing live state", () => {
  assert.match(html, /function idbPutPhotosBatch\(namespace,photos\)/);
  assert.match(html, /await idbPutPhotosBatch\(LS_KEY,photosToPersist\)/);
  assert.match(html, /await _photoMigrationPromise/);
  assert.match(html, /await _photoWriteChain/);
  assert.match(html, /await __tmhOfflineSaveChain/);
  const start = html.indexOf("applyState:async function(incoming,metadata)");
  const end = html.indexOf("buildEquipment(STATE.general", start);
  const apply = html.slice(start, end);
  assert.ok(apply.indexOf("await idbPutPhotosBatch") < apply.indexOf("STATE=next"));
  assert.ok(apply.indexOf("await __tmhOfflineSaveChain") < apply.indexOf("localStorage.setItem(LS_KEY+'::cloud-ref::'"));
});


test("embedded restore waits for encrypted offline persistence before advancing the cloud revision", () => {
  const start = html.indexOf("function __tmhAttachCloudBackup(source, mode)");
  const end = html.indexOf("function getEmbeddedSource(mode)", start);
  const bridge = html.slice(start, end);
  assert.match(bridge, /await __tmhOfflineSaveChain/);
  assert.match(bridge, /__tmhOfflineSaveError/);
  const refWrite = bridge.indexOf("localStorage.setItem(LS_KEY+'::cloud-ref::'+STATE.__cloudChecklistId");
  assert.ok(refWrite > bridge.indexOf("await __tmhOfflineSaveChain"));
});


test("native cloud restore rolls back checklist, photos and cloud revision pointer if durable persistence fails", () => {
  assert.match(html, /function idbRollbackPhotosBatch\(namespace,previousPhotos,attemptedPhotos\)/);
  assert.match(html, /var current=STATE\|\|\{\},previousState=structuredClone\(current\),previousLocal=localStorage\.getItem\(LS_KEY\)/);
  assert.match(html, /var previousCloudRef=previousCloudRefKey\?localStorage\.getItem\(previousCloudRefKey\):null/);
  assert.match(html, /await idbRollbackPhotosBatch\(LS_KEY,previousPhotos,attemptedPhotos\)/);
  assert.match(html, /if\(previousLocal===null\)localStorage\.removeItem\(LS_KEY\);else localStorage\.setItem\(LS_KEY,previousLocal\)/);
  assert.match(html, /if\(previousCloudRefKey\)localStorage\.removeItem\(previousCloudRefKey\)/);
  assert.match(html, /if\(previousCloudRefKey&&previousCloudRef!==null\)localStorage\.setItem\(previousCloudRefKey,previousCloudRef\)/);
  const start = html.indexOf("applyState:async function(incoming,metadata)");
  const end = html.indexOf("/* ===== Хранилище фото", start);
  const apply = html.slice(start, end);
  assert.ok(apply.indexOf("await idbPutPhotosBatch") < apply.indexOf("STATE=next"));
  assert.ok(apply.indexOf("catch(restoreError)") > apply.indexOf("localStorage.setItem(LS_KEY+'::cloud-ref::'"));
  assert.ok(apply.indexOf("await idbRollbackPhotosBatch") > apply.indexOf("catch(restoreError)"));
});


test("embedded restore waits for IndexedDB photo writes and rolls back local state on persistence failure", () => {
  const start = html.indexOf("function __tmhAttachCloudBackup(source, mode)");
  const end = html.indexOf("window.__tmhAttachCloudBackup", start);
  const bridge = html.slice(start, end);
  assert.match(bridge, /var current=STATE\|\|\{\},previousState=structuredClone\(current\),previousLocal=localStorage\.getItem\(LS_KEY\)/);
  assert.match(bridge, /var photoSaveResult=await __PS\.chain/);
  assert.match(bridge, /catch\(restoreError\)/);
  assert.match(bridge, /STATE=previousState/);
  assert.match(bridge, /var rollbackSaved=saveState\(true\)/);
  assert.match(bridge, /Не удалось восстановить фотографии IndexedDB/);
});


test("failed native and embedded restores remove the attempted cloud reference before restoring the prior pointer", () => {
  assert.match(html, /attemptedCloudRefKey=LS_KEY\+'::cloud-ref::'\+next\.__cloudChecklistId/);
  assert.match(html, /if\(attemptedCloudRefKey&&attemptedCloudRefKey!==previousCloudRefKey\)localStorage\.removeItem\(attemptedCloudRefKey\)/);
  const bridgeStart = html.indexOf("function __tmhAttachCloudBackup(source, mode)");
  const bridgeEnd = html.indexOf("window.__tmhAttachCloudBackup", bridgeStart);
  const bridge = html.slice(bridgeStart, bridgeEnd);
  assert.match(bridge, /attemptedCloudRefKey=LS_KEY\+'::cloud-ref::'\+next\.__cloudChecklistId/);
  assert.match(bridge, /if\(attemptedCloudRefKey&&attemptedCloudRefKey!==previousCloudRefKey\)localStorage\.removeItem\(attemptedCloudRefKey\)/);
});
