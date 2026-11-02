import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../account.html", import.meta.url), "utf8");

test("account cabinet uses the shared Supabase Auth module", () => {
  assert.match(html, /prototype\/supabase-auth\.js/);
  assert.match(html, /await window\.TMHAuthReady/);
  assert.match(html, /getCurrentIdentity\(\)/);
  assert.match(html, /location\.replace\("\.\/index\.html"\)/);
});

test("account cabinet loads only the signed-in user's cloud checklists", () => {
  assert.match(html, /\.from\("checklists"\)/);
  assert.match(html, /\.eq\("owner_id", user\.id\)/);
  assert.match(html, /\.select\("id,title,equipment_type,revision,created_at,updated_at"\)/);
  assert.match(html, /\.limit\(50\)/);
});

test("account cabinet renders database content as text, not injected HTML", () => {
  assert.match(html, /title\.textContent = row\.title/);
  assert.match(html, /meta\.textContent =/);
  assert.match(html, /info\.append\(title, meta\)/);
  assert.doesNotMatch(html, /innerHTML\s*=/);
});

test("account cabinet exposes a real Supabase sign-out action", () => {
  assert.match(html, /window\.TMHAuth\.signOut\(\)/);
  assert.match(html, /location\.replace\("\.\/index\.html"\)/);
});

test("account cabinet is read-only and contains no demo identity or fake counters", () => {
  assert.doesNotMatch(html, /Иван Петров|12\s*<\/div>|демонстрационные сведения/i);
  assert.doesNotMatch(html, /\.insert\(|\.upsert\(|\.delete\(/);
  assert.doesNotMatch(html, /\.from\("checklists"\)[^;]*\.(?:insert|update|upsert|delete)\(/);
  assert.match(html, /Облачных копий пока нет/);
});

test("employee management panel is shown only for admin and developer roles", () => {
  assert.match(html, /id="adminPanel"[^>]*class="panel hidden"/);
  assert.match(html, /\["developer", "admin"\]\.includes\(profile\.role\)/);
  assert.match(html, /adminPanel"\)\.classList\.toggle\("hidden", !canManageEmployees\)/);
});

test("employee management uses the secured account-admin function and supports list/access actions", () => {
  assert.match(html, /functions\.invoke\("account-admin", \{ body \}\)/);
  assert.match(html, /action: "list_employees"/);
  assert.match(html, /action: "set_employee_access"/);
  assert.match(html, /window\.confirm\(/);
  assert.match(html, /employee\.suspended \? "Восстановить" : "Заблокировать"/);
  assert.doesNotMatch(html, /action: "invite_employee"/);
});

test("employee data is rendered as text, not HTML", () => {
  assert.match(html, /name\.textContent = employee\.display_name/);
  assert.match(html, /meta\.textContent = employee\.id/);
  assert.doesNotMatch(html, /employeeList[\s\S]*?innerHTML\s*=/);
});

test("account cabinet can refresh its profile and checklist list without signing out", () => {
  assert.match(html, /id="refreshBtn"/);
  assert.match(html, /await loadCabinet\(\)/);
  assert.match(html, /identity\?\.error/);
  assert.match(html, /Не удалось обновить данные кабинета/);
});

test("profile editor updates only the current user's display_name", () => {
  assert.match(html, /id="profileForm"/);
  assert.match(html, /maxlength="80"/);
  assert.match(html, /\.from\("profiles"\)/);
  assert.match(html, /\.update\(\{ display_name: displayName \}\)/);
  assert.match(html, /\.eq\("id", identity\.user\.id\)/);
  assert.match(html, /\.select\("id,display_name,role,updated_at"\)/);
  assert.doesNotMatch(html, /\.update\(\{[^}]*role\s*:/);
});

test("password change uses Supabase Auth and never writes password into profile", () => {
  assert.match(html, /id="passwordForm"/);
  assert.match(html, /id="newPassword"[^>]*minlength="8"/);
  assert.match(html, /id="confirmPassword"[^>]*minlength="8"/);
  assert.match(html, /password !== confirmation/);
  assert.match(html, /api\.client\.auth\.updateUser\(\{ password \}\)/);
  assert.match(html, /newPassword"\)\.value = ""/);
  assert.match(html, /confirmPassword"\)\.value = ""/);
  assert.doesNotMatch(html, /\.from\("profiles"\)[\s\S]*?password\s*:/);
});

test("profile shows live email confirmation, registration and last sign-in metadata", () => {
  assert.match(html, /id="emailStatus"/);
  assert.match(html, /id="createdAt"/);
  assert.match(html, /id="lastSignIn"/);
  assert.match(html, /const emailConfirmed = Boolean\(user\.email_confirmed_at\)/);
  assert.match(html, /formatDate\(user\.created_at\)/);
  assert.match(html, /formatDate\(user\.last_sign_in_at\)/);
  assert.doesNotMatch(html, /<strong>Авторизован<\/strong>/);
});

test("unconfirmed email exposes resend action and confirmed email hides it", () => {
  assert.match(html, /id="resendConfirmBtn"/);
  assert.match(html, /const emailConfirmed = Boolean\(user\.email_confirmed_at\)/);
  assert.match(html, /classList\.toggle\("hidden", emailConfirmed\)/);
});

test("email confirmation resend uses Supabase Auth signup flow and rate-limits repeats", () => {
  assert.match(html, /api\.client\.auth\.resend\(\{[\s\S]*?type: "signup",[\s\S]*?email: identity\.user\.email/);
  assert.match(html, /confirmResendUntil = Date\.now\(\) \+ 60000/);
  assert.match(html, /Повторная отправка будет доступна через/);
  assert.match(html, /Письмо отправлено\. Проверьте входящие и папку «Спам»\./);
  assert.match(html, /identity\.user\.email_confirmed_at/);
});

test("email confirmation resend explicitly returns to the current cabinet page", () => {
  assert.match(html, /options:\s*\{[\s\S]*?emailRedirectTo:\s*`\$\{location\.origin\}\$\{location\.pathname\}`/);
});

test("email confirmation callback refreshes profile status without a manual reload", () => {
  assert.match(html, /onAuthStateChange\(\(event, session\) => \{/);
  assert.match(html, /\["SIGNED_IN", "USER_UPDATED", "TOKEN_REFRESHED"\]\.includes\(event\)/);
  assert.match(html, /session\.user\.email_confirmed_at/);
  assert.match(html, /Адрес электронной почты успешно подтверждён\./);
  assert.match(html, /classList\.toggle\("hidden", confirmed\)/);
});

test("initial profile render clears stale confirmation status and hides resend after confirmation", () => {
  assert.match(html, /const emailConfirmed = Boolean\(user\.email_confirmed_at\)/);
  assert.match(html, /emailConfirmStatus"\)\.textContent = emailConfirmed \? "Адрес электронной почты подтверждён\."/);
});
