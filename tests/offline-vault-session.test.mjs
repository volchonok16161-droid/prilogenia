import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { createOfflineVaultCrypto } from "../prototype/offline-vault-crypto.js";
import { createOfflineVaultSession } from "../prototype/offline-vault-session.js";

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER_USER = "22222222-2222-4222-8222-222222222222";
const DEVICE_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const DEVICE_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const identity = {
  user: { id: USER, email: "employee@example.test" },
  profile: { id: USER, role: "employee" },
};

function makeDatabase() {
  const values = new Map();
  return {
    values,
    async getMeta(key) { return values.get(key) ?? null; },
    async setMeta(key, value) { if (value == null) values.delete(key); else values.set(key, value); return value; },
  };
}
function makeSession(database, deviceId = DEVICE_A) {
  return createOfflineVaultSession({
    database,
    cryptoVault: createOfflineVaultCrypto({ cryptoImpl: webcrypto }),
    cryptoImpl: { randomUUID: () => deviceId },
  });
}

test("device key enrollment requires a matching authorized Supabase identity", async () => {
  const session = makeSession(makeDatabase());
  await assert.rejects(session.setupDeviceKeyAfterVerifiedOnlineLogin({
    ...identity, profile: { ...identity.profile, id: OTHER_USER },
  }), /verified online Supabase identity/);
  await assert.rejects(session.setupDeviceKeyAfterVerifiedOnlineLogin({
    ...identity, profile: { ...identity.profile, role: "unknown" },
  }), /verified online Supabase identity/);
});

test("verified login creates a persistent per-account device key", async () => {
  const database = makeDatabase();
  const first = makeSession(database);
  const setup = await first.setupDeviceKeyAfterVerifiedOnlineLogin(identity);
  assert.equal(setup.userId, USER);
  assert.equal(setup.mode, "device-key");
  assert.equal(setup.configured, true);
  const secret = { checklist: "tt", checked: [true, false] };
  const encrypted = await setup.vault.encrypt(secret);
  const secondRuntime = makeSession(database);
  const unlocked = await secondRuntime.unlockDeviceKey(USER);
  assert.deepEqual(await unlocked.vault.decrypt(encrypted), secret);
  assert.equal(database.values.has("offline:device-key:" + USER), true);
});

test("another account and another device cannot open this account's local data", async () => {
  const database = makeDatabase();
  const first = makeSession(database);
  const setup = await first.setupDeviceKeyAfterVerifiedOnlineLogin(identity);
  await assert.rejects(first.unlockDeviceKey(OTHER_USER), /not configured/);
  const secondDatabase = makeDatabase();
  await secondDatabase.setMeta("offline:device-key:" + USER, database.values.get("offline:device-key:" + USER));
  const secondDevice = makeSession(secondDatabase, DEVICE_B);
  const other = await secondDevice.unlockDeviceKey(USER);
  const encrypted = await setup.vault.encrypt({ private: true });
  await assert.rejects(other.vault.decrypt(encrypted));
});

test("assistant role is supported but malformed account IDs are rejected", async () => {
  const session = makeSession(makeDatabase());
  const assistant = { ...identity, profile: { ...identity.profile, role: "assistant" } };
  assert.equal((await session.setupDeviceKeyAfterVerifiedOnlineLogin(assistant)).mode, "device-key");
  await assert.rejects(session.unlockDeviceKey("invalid"), /valid account UUID/);
});

test("two accounts on one device have separate encryption keys and cannot decrypt each other's snapshots", async () => {
  const database = makeDatabase();
  const accountA = makeSession(database, DEVICE_A);
  const accountB = makeSession(database, DEVICE_A);
  const setupA = await accountA.setupDeviceKeyAfterVerifiedOnlineLogin(identity);
  const otherIdentity = {
    user: { id: OTHER_USER, email: "other@example.test" },
    profile: { id: OTHER_USER, role: "employee" },
  };
  const setupB = await accountB.setupDeviceKeyAfterVerifiedOnlineLogin(otherIdentity);
  const encryptedA = await setupA.vault.encrypt({ checklist: "private A" });
  const encryptedB = await setupB.vault.encrypt({ checklist: "private B" });
  assert.deepEqual(await setupA.vault.decrypt(encryptedA), { checklist: "private A" });
  assert.deepEqual(await setupB.vault.decrypt(encryptedB), { checklist: "private B" });
  await assert.rejects(setupB.vault.decrypt(encryptedA));
  await assert.rejects(setupA.vault.decrypt(encryptedB));
  assert.equal(database.values.has("offline:device-key:" + USER), true);
  assert.equal(database.values.has("offline:device-key:" + OTHER_USER), true);
});
