import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");

function count(source, token) {
  return source.split(token).length - 1;
}

test("all five checklist runtimes bind storage to the authenticated Supabase UUID", () => {
  assert.equal(count(html, "function __tmhApplyUserStorageScope"), 5);
  assert.equal(count(html, "__tmhApplyUserStorageScope(identity.user.id)"), 5);
  assert.equal(count(html, "__tmhApplyUserStorageScope(result.user.id)"), 5);
});

test("every checklist runtime blocks writes before login and after logout", () => {
  assert.equal(count(html, "function saveState(silent)"), 5);
  assert.equal(
    count(html, "if(!window.__TMH_STORAGE_UID||window.__TMH_STORAGE_LOCKED)return false;"),
    5,
  );
  assert.equal(count(html, "function showContinueDialogOrStart"), 5);
});

test("photo storage derives record keys and its restore prefix from the scoped LS_KEY", () => {
  assert.equal(count(html, "function __psCollect()"), 4);
  assert.equal(count(html, "LS_KEY+'::'+iid+'::'+k"), 4);
  assert.equal(count(html, "var prefix=LS_KEY+'::';"), 4);
  assert.equal(count(html, "function __psFlagKey()"), 4);
  assert.equal(count(html, "return LS_KEY+'__photos_idb';"), 4);
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
  assert.doesNotMatch(auth, /service_role/i);
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
