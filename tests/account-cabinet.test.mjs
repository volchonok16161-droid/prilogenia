import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../account.html", import.meta.url), "utf8");
const deleteHelper = await readFile(new URL("../prototype/supabase-cloud-delete.js", import.meta.url), "utf8");

test("account cabinet uses the shared Supabase Auth module", () => {
  assert.match(html, /prototype\/supabase-auth\.js/);
  assert.match(html, /await window\.TMHAuthReady/);
  assert.match(html, /getCurrentIdentity\(\)/);
  assert.match(html, /location\.replace\("\.\/prototype\/checklist\/"\)/);
});

test("account cabinet loads only the signed-in user's cloud checklists", () => {
  assert.match(html, /\.from\("checklists"\)/);
  assert.match(html, /\.eq\("owner_id", user\.id\)/);
  assert.match(html, /\.select\("id,title,equipment_type,revision,created_at,updated_at,mode:payload->>mode,checklist_type:payload->>checklistType,stats:payload->stats,archive:payload->__tmhArchive"\)/);
  assert.match(html, /const pageSize = 500/);
  assert.match(html, /\.range\(offset, offset \+ pageSize - 1\)/);
  assert.doesNotMatch(html, /\.limit\(50\)/);
});

test("account cabinet renders database content as text, not injected HTML", () => {
  assert.match(html, /title\.textContent = row\.title/);
  assert.match(html, /meta\.textContent =/);
  assert.match(html, /info\.append\(title, category, status, meta\)/);
  assert.doesNotMatch(html, /innerHTML\s*=/);
});

test("account cabinet exposes a real Supabase sign-out action", () => {
  assert.match(html, /window\.TMHAuth\.signOut\(\)/);
  assert.match(html, /location\.replace\("\.\/prototype\/checklist\/"\)/);
});

test("account cabinet allows deleting only the selected cloud checklist owned by the current user", () => {
  assert.match(html, /remove\.textContent = "Удалить"/);
  assert.match(html, /window\.confirm\("Удалить облачный чек-лист/);
  assert.match(html, /deleteCloudChecklist\(\{[\s\S]*?checklistId: row\.id,[\s\S]*?expectedUserId: user\.id/);
  assert.match(deleteHelper, /\.from\("checklists"\)[\s\S]*?\.delete\(\)[\s\S]*?\.eq\("id", checklistId\)[\s\S]*?\.eq\("owner_id", expectedUserId\)/);
  assert.match(deleteHelper, /\.select\("id"\)[\s\S]*?\.maybeSingle\(\)/);
  assert.match(deleteHelper, /if \(!deleted\?\.id\) throw new Error/);
  assert.match(html, /await loadCabinet\(\)/);
  assert.match(html, /Локальные данные и фотографии на устройстве не будут затронуты/);
  assert.match(html, /локальные данные и фотографии на устройстве не изменяются/);
  assert.doesNotMatch(html, /Иван Петров|12\s*<\/div>|демонстрационные сведения/i);
  assert.doesNotMatch(html, /\.insert\(|\.upsert\(/);
  assert.match(html, /Облачных копий пока нет/);
});

test("employee management panel is shown only for admin and developer roles", () => {
  assert.match(html, /<section class="panel hidden" id="adminPanel"/);
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

test("account cabinet displays saved checklist completion and deviation metrics", () => {
  assert.match(html, /stats:payload->stats/);
  assert.match(html, /Заполнение: /);
  assert.match(html, /Несоответствия: /);
  assert.match(html, /progress-fill/);
  assert.match(html, /checklist_type:payload->>checklistType/);
  assert.match(html, /row\.checklist_type \|\| categoryByMode\[row\.mode\]/);
});

test("account cabinet invalidates stale loads and clears prior-account content on auth changes", () => {
  assert.match(html, /let cabinetLoadSequence = 0/);
  assert.match(html, /const requestId = \+\+cabinetLoadSequence/);
  assert.match(html, /requestId !== cabinetLoadSequence/);
  assert.match(html, /function clearCabinet\(\)/);
  assert.match(html, /if \(event === "SIGNED_OUT"\)/);
  assert.match(html, /activeCabinetUserId !== session\.user\.id/);
  assert.match(html, /latestIdentity\?\.user\?\.id !== user\.id/);
  assert.match(html, /\$\("checklists"\)\.replaceChildren\(\)/);
});

test("checklist views link to the account cabinet; sign-out is available inside the cabinet", async () => {
  const main = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(main, /<a class="logout-btn btn account-cabinet-btn" id="accountCabinetLink" href="\.\/account\.html">/);
  assert.match(main, /<a class="btn iframe-account-cabinet-btn" id="iframeAccountCabinetLink" href="\.\/account\.html">/);
  assert.match(html, /<button class="btn secondary" id="logoutBtn" type="button">Выйти<\/button>/);
  assert.match(html, /window\.TMHAuth\.signOut\(\)/);
});

test("account cabinet list and actions adapt to narrow screens", () => {
  assert.match(html, /@media\(max-width:620px\)/);
  assert.match(html, /\.top>\.actions\{width:100%/);
  assert.match(html, /\.item\{display:grid;grid-template-columns:37px minmax\(0,1fr\)/);
  assert.match(html, /\.item>div:last-child \.btn\{flex:1 1 110px/);
});


test("account cabinet opens the selected encrypted local checklist in its matching form", () => {
  assert.match(html, /api\.activateDeviceVault\(identity\)/);
  assert.match(html, /api\.listOfflineChecklistInstances\(\)/);
  assert.match(html, /open\.href = "\.\/prototype\/checklist\/\?mode=" \+ encodeURIComponent\(entry\.mode\) \+ "&openLocalChecklist=" \+ encodeURIComponent\(entry\.instanceId\)/);
  assert.match(html, /open\.textContent = "Открыть"/);
});


test("cabinet uses the verified device-unlocked identity fallback and has an offline-only render path", () => {
  assert.match(html, /getCabinetIdentity\(\)/);
  assert.match(html, /identity\?\.offline === true/);
  assert.match(html, /renderOfflineCabinet\(api, identity, requestId\)/);
  assert.match(html, /listOfflineChecklistInstances\(\)/);
  assert.match(html, /Облачная история временно недоступна без интернета/);
  assert.match(html, /Изменение профиля, пароля, управление сотрудниками и облачная история требуют подключения/);
  assert.match(html, /Офлайн · локально/);
});

test("cabinet inherits the checklist TMH, light and dark theme preference without separate controls", () => {
  assert.match(html, /checklist_theme_v1/);
  assert.match(html, /setAttribute\("data-theme",a\.includes\(v\)\?v:"tmh"\)/);
  assert.match(html, /window\.addEventListener\("storage"/);
  assert.doesNotMatch(html, /data-theme-value="(tmh|standard|dark)"/);
  assert.doesNotMatch(html, /class="theme-switch"/);
});

test("offline cabinet hides cloud-only profile, password and employee administration controls", () => {
  assert.match(html, /\$\("profileForm"\)\.classList\.add\("hidden"\)/);
  assert.match(html, /\$\("securityPanel"\)\.classList\.add\("hidden"\)/);
  assert.match(html, /\$\("adminPanel"\)\.classList\.add\("hidden"\)/);
});


test("cabinet inherits the checklist theme without exposing a theme picker", () => {
  assert.match(html, /var k="checklist_theme_v1"[\s\S]*?localStorage\.getItem\(k\)/);
  assert.match(html, /addEventListener\("storage"/);
  assert.doesNotMatch(html, /data-theme-value="(tmh|standard|dark)"/);
  assert.doesNotMatch(html, /class="theme-switch"/);
});


test("developer cabinet identifies transferred employee archive copies and preserves source metadata in the label", () => {
  assert.match(html, /archive:payload->__tmhArchive/);
  assert.match(html, /row\.archive\?\.sourceChecklistId && row\.archive\?\.sourceOwnerId/);
  assert.match(html, /Архив сотрудника · исходная ревизия/);
  assert.match(html, /formatDate\(row\.archive\.sourceUpdatedAt\)/);
});
