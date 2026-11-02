import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../prototype/account-password-recovery.html", import.meta.url), "utf8");

test("recovery request uses Supabase resetPasswordForEmail with the deployed redirect", () => {
  assert.match(html, /resetPasswordForEmail\(\$\("email"\)\.value\.trim\(\),\{redirectTo:REDIRECT_URL\}\)/);
  assert.match(html, /const REDIRECT_URL="https:\/\/prilogenia-password-recovery\.onrender\.com\/"|const REDIRECT_URL = "https:\/\/prilogenia-password-recovery\.onrender\.com\/" /);
  assert.match(html, /Если аккаунт с таким email существует, письмо отправлено/);
});

test("recovery flow detects Supabase recovery session and validates new password", () => {
  assert.match(html, /event==="PASSWORD_RECOVERY"/);
  assert.match(html, /detectSessionInUrl:true/);
  assert.match(html, /flowType:"pkce"/);
  assert.match(html, /p\.length<8/);
  assert.match(html, /p!==c/);
  assert.match(html, /client\.auth\.updateUser\(\{password:p\}\)/);
});

test("successful password recovery signs out and never stores password locally", () => {
  assert.match(html, /await client\.auth\.signOut\(\)/);
  assert.match(html, /Пароль успешно изменён/);
  assert.doesNotMatch(html, /localStorage\.(?:setItem|clear)/);
  assert.doesNotMatch(html, /\.from\("profiles"\)[\s\S]*?password/);
});

test("recovery UI exposes accessible feedback and disables submit while processing", () => {
  assert.match(html, /id="msg" class="msg"/);
  assert.match(html, /\$\("requestBtn"\)\.disabled=true/);
  assert.match(html, /\$\("saveBtn"\)\.disabled=true/);
  assert.match(html, /classList\.toggle\("err",err\)/);
});
