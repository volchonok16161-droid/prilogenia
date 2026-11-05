import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("main authenticated header links to the account cabinet", () => {
  const userMenu = html.match(/<div class="user-info" id="userInfo"[\\s\\S]*?<\\/div>/)?.[0];
  assert.ok(userMenu, "main user menu exists");
  assert.match(userMenu, /id="accountCabinetLink" href="\\.\\/account\\.html"/);
});
test("cabinet navigation is separate from checklist save behavior", () => {
  assert.match(html, /id="accountCabinetLink" href="\.\/account\.html"/);
  assert.match(html, /id="tmhNativeCloudBackupBtn"/);
  assert.match(html, /id="btnSave"/);
});


test("authenticated identity is saved with the profile display name", () => {
  assert.match(html, /displayName: identity\\.profile\\.display_name \\|\\| ''/);
  assert.match(html, /displayName: result\\.profile\\.display_name \\|\\| ''/);
  assert.match(html, /saved\\.profileRole\\|\\|''/);
});
test("embedded checklist header links to the account cabinet", () => {
  const iframeBar = html.split('<div id="iframeBar">')[1]?.split('<iframe id="embeddedFrame"')[0] || "";
  assert.match(iframeBar, /id="iframeAccountCabinetLink" href="\\.\\/account\\.html"/);
});

