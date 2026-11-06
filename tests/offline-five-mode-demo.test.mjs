import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const html=await readFile(new URL("../prototype/offline-five-mode-demo.html",import.meta.url),"utf8");
const photoStore=await readFile(new URL("../prototype/offline-demo-photo-store.js",import.meta.url),"utf8");
test("demo is isolated from production accounts and uses separate IndexedDB stores",()=>{
 assert.match(html,/tmh-offline-five-mode-demo-v1/);assert.match(html,/Не подключается к Supabase/);
 assert.match(html,/createOfflineVaultDatabase/);assert.match(html,/createOfflineDemoPhotoStore/);
 assert.match(photoStore,/tmh-offline-demo-photos-v1/);assert.match(photoStore,/createObjectStore\("photos"/);
});
test("checklist and photo payloads are encrypted independently and persist across reload",()=>{
 assert.match(html,/vault\.encrypt\(value\)/);assert.match(html,/vault\.decrypt\(row\.encrypted\)/);
 assert.match(html,/vault\.encrypt\(\{data:photoData/);assert.match(html,/vault\.decrypt\(p\.encrypted\)/);
 assert.match(html,/photos\.put/);assert.match(html,/photos\.get/);assert.match(html,/db\.putRecord/);assert.match(html,/db\.getRecord/);
});
test("demo supports five modes, file validation, and visible photo restore",()=>{
 for(const mode of ["complex","housings","tt","bi","hydro"])assert.match(html,new RegExp(mode));
 assert.match(html,/image\/jpeg,image\/png,image\/webp/);assert.match(html,/showPhoto\(photoData\)/);assert.doesNotMatch(html,/localStorage/);
});
