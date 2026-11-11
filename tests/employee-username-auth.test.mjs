import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");
const login = await readFile(new URL("../employee-login.html", import.meta.url), "utf8");
const admin = await readFile(new URL("../supabase/functions/account-admin/index.ts", import.meta.url), "utf8");

test("employee usernames are normalized and deterministically mapped to internal Auth identities", () => {
  assert.match(auth, /String\(identifier \|\| ""\)\.trim\(\)\.normalize\("NFC"\)\.toLowerCase\(\)/);
  assert.match(auth, /crypto\.subtle\.digest\("SHA-256", new TextEncoder\(\)\.encode\(normalized\)\)/);
  assert.match(auth, /return "u" \+ hash\.slice\(0, 63\) \+ "@accounts\.invalid"/);
  assert.match(auth, /\["цгиспл-карасук", "cgspl-karasuk@accounts\.invalid"\]/);
  assert.match(auth, /\["цгиспл-тимашевск", "cgspl-timashevsk@accounts\.invalid"\]/);
  assert.match(admin, /"цгиспл-карасук": "cgspl-karasuk@accounts\.invalid"/);
  assert.match(admin, /"цгиспл-тимашевск": "cgspl-timashevsk@accounts\.invalid"/);
  assert.match(admin, /crypto\.subtle\.digest\("SHA-256", new TextEncoder\(\)\.encode\(normalizedUsername\)\)/);
  assert.match(admin, /email = "u" \+ hash\.slice\(0, 63\) \+ "@accounts\.invalid"/);
  assert.doesNotMatch(auth, /USERNAME_EMAILS/);
});

test("employee provisioning remains behind server-side admin authorization", () => {
  assert.match(admin, /authClient\.auth\.getUser\(token\)/);
  assert.match(admin, /!\["developer", "admin"\]\.includes\(actor\.role\)/);
  assert.match(admin, /body\.action === "create_named_employee"/);
  assert.match(admin, /admin\.auth\.admin\.createUser\(/);
  assert.match(admin, /email_confirm: true/);
  assert.match(admin, /role: "employee"/);
  assert.match(admin, /rollbackProvisionedUser\(inviteData\.user\.id, reservation\.reservationId\)/);
  assert.match(admin, /const rollbackProvisionedUser = async \(userId: string, reservationId: string\) =>/);
  assert.match(admin, /admin\.auth\.admin\.deleteUser\(userId\)/);
});

test("the login UI sends credentials only to Auth and exposes the provisioning form only to admins", () => {
  assert.match(login, /window\.TMHAuth\.signIn\(\$\("login"\)\.value, \$\("password"\)\.value\)/);
  assert.match(login, /\["admin", "developer"\]\.includes\(identity\?\.profile\?\.role\)/);
  assert.match(login, /action: "create_named_employee"/);
  assert.match(login, /autocomplete="current-password"/);
});
