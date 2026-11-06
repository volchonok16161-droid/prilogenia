import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const main = await readFile(new URL("../index.html", import.meta.url), "utf8");
const embeddedPaths = [
  "../prototype/embedded/complex.js",
  "../prototype/embedded/tt.js",
  "../prototype/embedded/bi.js",
  "../prototype/embedded/hydro.js",
];

test("the parent publishes one verified auth context after successful login and session checks", () => {
  assert.match(main, /window\.__TMH_AUTH_CONTEXT = Object\.freeze\(\{ userId: uid, role: profileRole/);
  assert.match(main, /window\.__TMH_AUTH_CONTEXT = Object\.freeze\(\{ userId: identity\.user\.id, role: identity\.profile\.role/);
  assert.match(main, /__tmhApplyUserStorageScope\(result\.user\.id, result\.profile\.role\);[\s\S]{0,500}window\.__TMH_AUTH_CONTEXT = Object\.freeze\(\{ userId: result\.user\.id, role: role, offlineMode: false \}\)/);
  assert.match(main, /tmh:auth-ready/);
  assert.match(main, /window\.__TMH_AUTH_CONTEXT = null/);
});

for (const path of embeddedPaths) {
  test(path + " reuses parent authentication and never opens a second login modal", async () => {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(source, /function __tmhIsEmbeddedRuntime\(\)/);
    assert.match(source, /window\.parent\.__TMH_AUTH_CONTEXT/);
    assert.match(source, /__tmhApplyUserStorageScope\(sharedAuth\.userId\)/);
    assert.match(source, /return true;/);
    assert.match(source, /function __tmhShowLoginModal\(\)[\s\S]*?window\.parent\.document\.getElementById\('loginModal'\)/);
    assert.match(source, /__tmhShowLoginModal\(\)/);
  });
}

test("the native cloud backup context is available for native save, restore and Excel export", () => {
  assert.match(main, /window\.__TMH_GET_NATIVE_CLOUD_BACKUP_CONTEXT=function\(\)/);
  assert.match(main, /window\.__TMH_SAVE_CLOUD_BACKUP_CONTEXT = async function\(context\)/);
  assert.match(main, /__saveCloud\(__getContext\(\)\)/);
});
