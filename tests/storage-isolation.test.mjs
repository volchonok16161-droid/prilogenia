import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");

function count(source, token) {
  return source.split(token).length - 1;
}

test("the scope helper rejects invalid IDs and never stacks a second user suffix", () => {
  const start = html.indexOf("function __tmhApplyUserStorageScope(uid) {");
  assert.notEqual(start, -1);
  const end = html.indexOf("\n}\n", start);
  assert.notEqual(end, -1);
  const helper = html.slice(start, end + 2);
  const context = { window: {}, LS_KEY: "checklist_tt_v1" };
  runInNewContext(helper, context);

  context.__tmhApplyUserStorageScope("11111111-1111-4111-8111-111111111111");
  assert.equal(context.LS_KEY, "checklist_tt_v1::user:11111111-1111-4111-8111-111111111111");
  context.__tmhApplyUserStorageScope("22222222-2222-4222-8222-222222222222");
  assert.equal(context.LS_KEY, "checklist_tt_v1::user:22222222-2222-4222-8222-222222222222");
  assert.throws(() => context.__tmhApplyUserStorageScope("not-a-uuid"), /UUID пользователя Supabase/);
});

test("all five checklist runtimes bind storage to the authenticated Supabase UUID", () => {
  assert.equal(count(html, "function __tmhApplyUserStorageScope"), 5);
  assert.equal(count(html, "__tmhApplyUserStorageScope(identity.user.id)"), 5);
  assert.equal(count(html, "__tmhApplyUserStorageScope(result.user.id)"), 5);
});

test("every checklist runtime blocks writes before login and after logout", () => {
  assert.equal(count(html, "function saveState(silent)"), 5);
  assert.equal(count(html, "if(!window.__TMH_STORAGE_UID||window.__TMH_STORAGE_LOCKED)return false;"), 5);
  assert.equal(count(html, "function showContinueDialogOrStart"), 5);
});

test("photo storage derives record keys and restore prefixes from scoped LS_KEY", () => {
  assert.equal(count(html, "function __psCollect()"), 4);
  assert.equal(count(html, "LS_KEY+'::'+iid+'::'+k"), 4);
  assert.equal(count(html, "var prefix=LS_KEY+'::';"), 4);
  assert.equal(count(html, "function __psFlagKey()"), 4);
  assert.equal(count(html, "return LS_KEY+'__photos_idb';"), 4);
  assert.match(html, /function photoDbKey/);
  assert.match(html, /idbPutPhoto\(namespace,iid,photoKey,dataUrl\)/);
});

test("logout waits for pending IndexedDB photo migration and writes", () => {
  assert.equal(
    count(html, "if (typeof _photoMigrationPromise !== 'undefined' && _photoMigrationPromise) await _photoMigrationPromise;"),
    5,
  );
  assert.equal(
    count(html, "if (typeof _photoWriteChain !== 'undefined' && _photoWriteChain) await _photoWriteChain;"),
    5,
  );
  assert.equal(count(html, "let _photoWriteChain=Promise.resolve();"), 1);
  assert.equal(count(html, "_photoWriteChain=_photoWriteChain.then(function()"), 1);
});

test("all checklist runtimes react to auth changes in other tabs", () => {
  assert.equal(count(html, "function __tmhInstallAuthWatcher(api)"), 5);
  assert.equal(count(html, "__tmhInstallAuthWatcher(api);"), 5);
  assert.equal(count(html, "event === 'SIGNED_OUT'"), 5);
  assert.equal(count(html, "event === 'SIGNED_IN'"), 5);
});

test("the browser auth client validates the server identity and profile role", () => {
  assert.match(auth, /client\.auth\.getUser\(\)/);
  assert.match(auth, /\.from\("profiles"\)/);
  assert.match(auth, /\.eq\("id", user\.id\)/);
  assert.match(auth, /new Set\(\["employee", "admin", "developer"\]\)/);
  assert.match(auth, /const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_/);
  assert.doesNotMatch(auth, /const\s+SUPABASE_SERVICE_ROLE_KEY\s*=/i);
});

test("legacy storage namespaces remain present and are not migrated implicitly", () => {
  for (const key of [
    "checklist_tt_v1",
    "checklist_msud_v1",
    "checklist_hydro_v1",
    "checklist_2es5k_v1",
    "checklist_housings_v4",
  ]) assert.ok(html.includes(key), `missing legacy key: ${key}`);
  assert.match(html, /LS_KEY = base \+ '::user:' \+ uid/);
});

test("switching account UUIDs produces isolated local namespaces for all checklist types", () => {
  const bases = [
    "checklist_tt_v1",
    "checklist_msud_v1",
    "checklist_hydro_v1",
    "checklist_2es5k_v1",
    "checklist_housings_v4",
  ];
  const users = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
  ];
  for (const base of bases) {
    const context = { window: {}, LS_KEY: base };
    const start = html.indexOf("function __tmhApplyUserStorageScope(uid) {");
    const end = html.indexOf("\n}\n", start);
    runInNewContext(html.slice(start, end + 2), context);
    context.__tmhApplyUserStorageScope(users[0]);
    const accountAKey = context.LS_KEY;
    context.__tmhApplyUserStorageScope(users[1]);
    const accountBKey = context.LS_KEY;
    assert.notEqual(accountAKey, accountBKey, base + " must not share storage between users");
    assert.equal(accountAKey, base + "::user:" + users[0]);
    assert.equal(accountBKey, base + "::user:" + users[1]);
  }
});

test("logout locks checklist writes before signing out and keeps data on disk", () => {
  const start = html.indexOf("async function doLogout() {");
  assert.notEqual(start, -1);
  const end = html.indexOf("\n}\n", start);
  assert.notEqual(end, -1);
  const logout = html.slice(start, end + 2);
  assert.ok(logout.indexOf("window.__TMH_STORAGE_LOCKED = true") < logout.indexOf("api.signOut()"));
  assert.match(logout, /if \(result && result\.error\)[\s\S]*?window\.__TMH_STORAGE_LOCKED = false/);
  assert.match(logout, /localStorage\.removeItem\('checklist_user'\)/);
  assert.doesNotMatch(logout, /localStorage\.clear\(|indexedDB\.deleteDatabase\(|removeItem\(LS_KEY/);
});

test("account switching triggers reload before a different user's checklist can write", () => {
  const start = html.indexOf("function __tmhInstallAuthWatcher(api) {");
  assert.notEqual(start, -1);
  const end = html.indexOf("\n}\n", start);
  const watcher = html.slice(start, end + 2);
  assert.match(watcher, /event === 'SIGNED_OUT'[\s\S]*?__TMH_STORAGE_LOCKED = true[\s\S]*?__TMH_STORAGE_UID = null[\s\S]*?location\.reload\(\)/);
  assert.match(watcher, /event === 'SIGNED_IN'[\s\S]*?activeUid && activeUid !== session\.user\.id[\s\S]*?__TMH_STORAGE_LOCKED = true[\s\S]*?location\.reload\(\)/);

  let onChange;
  let reloads = 0;
  const context = { window: { location: { reload() { reloads += 1; } } } };
  runInNewContext(watcher, context);
  context.__tmhInstallAuthWatcher({ onAuthStateChange(callback) { onChange = callback; } });

  // No scope yet: do not reload; checkAuth() will establish the user's scope.
  onChange("SIGNED_IN", { user: { id: "11111111-1111-4111-8111-111111111111" } });
  assert.equal(reloads, 0);
  assert.equal(context.window.__TMH_STORAGE_LOCKED, undefined);

  // A known account mismatch must still lock and reload.
  context.window.__TMH_STORAGE_UID = "22222222-2222-4222-8222-222222222222";
  onChange("SIGNED_IN", { user: { id: "11111111-1111-4111-8111-111111111111" } });
  assert.equal(reloads, 1);
  assert.equal(context.window.__TMH_STORAGE_LOCKED, true);
});
