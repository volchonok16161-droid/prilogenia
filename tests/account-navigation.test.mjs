import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("main authenticated user menu exposes role-based cabinet navigation inside the exit dropdown", () => {
  const userMenu = html.match(/<div class="user-info" id="userInfo"[\s\S]*?<\/div>\s*<\/div>/)?.[0];
  assert.ok(userMenu, "main user menu exists");
  assert.match(userMenu, /id="logoutBtn"/);
  assert.match(userMenu, /id="accountMenu"/);
  assert.match(userMenu, /id="accountCabinetLink"/);
  assert.match(userMenu, /href="\.\/account\.html"/);
  assert.match(userMenu, /id="logoutConfirmBtn"/);
});

test("cabinet navigation is separate from checklist save behavior", () => {
  assert.match(html, /id="accountCabinetLink" href="\.\/account\.html"/);
  assert.match(html, /id="tmhNativeCloudBackupBtn"/);
  assert.match(html, /id="btnSave"/);
});


test("authenticated checklist header uses the profile display name", () => {
  assert.match(html, /displayName: identity\.profile\.display_name \|\| ''/);
  assert.match(html, /displayName: result\.profile\.display_name \|\| ''/);
  assert.match(html, /profile\.displayName\s*\|\|/);
});

test("embedded checklist header provides direct navigation to the personal cabinet", () => {
  const iframeBar = html.split('<div id="iframeBar">')[1]?.split("</div>")[0] || "";
  assert.match(iframeBar, /id="iframeAccountCabinetLink" href="\.\/account\.html"/);
  assert.match(iframeBar, /Личный кабинет/);
  assert.ok(html.includes('id="accountCabinetLink" href="./account.html"'));
});
