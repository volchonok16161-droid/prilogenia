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

test("embedded checklist header exposes the role menu and cabinet navigation", () => {
  const iframeBar = html.split('<div id="iframeBar">')[1]?.split('<iframe id="embeddedFrame"')[0] || "";
  assert.match(iframeBar, /id="iframeAccountMenuToggle"/);
  assert.match(iframeBar, /id="iframeAccountMenu" hidden/);
  assert.match(iframeBar, /id="iframeAccountCabinetLink" href="\.\/account\.html"/);
  assert.match(iframeBar, /id="iframeLogoutConfirmBtn"/);
  assert.match(html, /iframeName\)iframeName\.textContent=name\.textContent/);
  assert.match(html, /iframeLogoutConfirmBtn\)iframeLogoutConfirmBtn\.onclick=doLogout/);
  assert.ok(html.includes('id="accountCabinetLink" href="./account.html"'));
});
