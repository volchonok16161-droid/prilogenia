import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("main authenticated user menu links to the personal cabinet", () => {
  const userMenu = html.match(/<div class="user-info" id="userInfo"[\s\S]*?<\/div>/)?.[0];
  assert.ok(userMenu, "main user menu exists");
  assert.match(userMenu, /id="accountCabinetLink"/);
  assert.match(userMenu, /href="\.\/account\.html"/);
  assert.match(userMenu, /id="logoutBtn"/);
});

test("cabinet link is navigation only and does not alter checklist save behavior", () => {
  assert.match(html, /id="accountCabinetLink" href="\.\/account\.html"/);
  assert.match(html, /id="tmhNativeCloudBackupBtn"/);
  assert.match(html, /id="btnSave"/);
});


test("authenticated checklist header uses the profile display name", () => {
  assert.match(html, /displayName: identity\.profile\.display_name \|\| ''/);
  assert.match(html, /displayName: result\.profile\.display_name \|\| ''/);
  assert.match(html, /checklist_user'\)\|\|'\{\}'\)\.displayName/);
});

test("embedded checklist does not duplicate the cabinet link in a separate bar", () => {
  const iframeBar = html.split('<div id="iframeBar">')[1]?.split("</div>")[0] || "";
  assert.equal(iframeBar.includes("account.html"), false);
  assert.ok(html.includes('id="accountCabinetLink" href="./account.html"'));
});
