import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = (await readFile(new URL("../index.html", import.meta.url), "utf8")) + (await Promise.all([
  "../prototype/embedded/tt.js",
  "../prototype/embedded/bi.js",
  "../prototype/embedded/hydro.js",
  "../prototype/embedded/complex.js",
].map((path) => readFile(new URL(path, import.meta.url), "utf8")))).join("\n");
const crypto = await readFile(new URL("../prototype/offline-vault-crypto.js", import.meta.url), "utf8");
const session = await readFile(new URL("../prototype/offline-vault-session.js", import.meta.url), "utf8");
const auth = await readFile(new URL("../prototype/supabase-auth.js", import.meta.url), "utf8");
const runner = await readFile(new URL("../prototype/offline-sync-runner.js", import.meta.url), "utf8");

test("offline UI uses device-bound unlock and exposes no PIN enrollment or entry fields", () => {
  assert.equal((html.match(/id="unlockOfflineBtn"/g) || []).length, 0);
  assert.equal((html.match(/id="offlinePinInput"/g) || []).length, 0);
  assert.equal((html.match(/id="setupOfflinePinBtn"/g) || []).length, 0);
  assert.match(session, /setupDeviceKeyAfterVerifiedOnlineLogin/);
  assert.match(session, /unlockDeviceKey/);
});

test("device encryption keys are non-extractable AES-GCM keys", () => {
  assert.match(crypto, /generateKey\(\{ name: "AES-GCM", length: 256 \}, false, \["encrypt", "decrypt"\]\)/);
  assert.match(crypto, /key\.extractable !== false/);
  assert.match(crypto, /key\.algorithm\?\.name !== "AES-GCM"/);
});

test("offline identity never authorizes cloud sync without a verified online session", () => {
  assert.match(auth, /setupDeviceKeyAfterVerifiedOnlineLogin/);
  assert.match(auth, /unlockDeviceKey/);
  assert.match(session, /supabaseAuthenticated: false/);
  assert.match(auth, /getCurrentIdentity\(\)/);
  assert.match(runner, /действующая сессия и разрешённый профиль сотрудника/);
  assert.match(runner, /assertVerifiedIdentity\(await authApi\.getCurrentIdentity\(\), uid\)/);
  assert.equal((html.match(/window\.__TMH_OFFLINE_MODE = identity\.mode === 'offline-local-unlock'/g) || []).length, 5);
});
