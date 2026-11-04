import test from "node:test";
import assert from "node:assert/strict";
import { createOfflineVaultSession } from "../prototype/offline-vault-session.js";

function fakeDatabase() {
  const values = new Map();
  return {
    async getMeta(key) { return values.get(key) ?? null; },
    async setMeta(key, value) { values.set(key, structuredClone(value)); return value; },
  };
}
const identity = {
  user: { id: "11111111-1111-4111-8111-111111111111" },
  profile: { id: "11111111-1111-4111-8111-111111111111", role: "employee" },
};
const descriptor = { version: 1 };
function fakeCryptoVault() {
  return {
    async createDescriptor({ pin, userId, deviceId }) {
      return { ...descriptor, pinForTest: pin, userId, deviceId };
    },
    async unlock({ pin, descriptor: saved, userId, deviceId }) {
      if (saved.userId !== userId || saved.deviceId !== deviceId) throw new Error("Offline vault belongs to another account or device");
      if (pin !== saved.pinForTest) throw new Error("Invalid PIN");
      return { async encrypt(value) { return value; } };
    },
  };
}
function makeSession({ now = () => 100000, deviceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" } = {}) {
  return createOfflineVaultSession({
    database: fakeDatabase(),
    cryptoVault: fakeCryptoVault(),
    cryptoImpl: { randomUUID: () => deviceId },
    now,
  });
}

test("PIN enrollment requires matching online user and authorized profile", async () => {
  const session = makeSession();
  await assert.rejects(session.setupAfterVerifiedOnlineLogin({ ...identity, profile: { ...identity.profile, id: "22222222-2222-4222-8222-222222222222" } }, "123456"));
  await assert.rejects(session.setupAfterVerifiedOnlineLogin({ ...identity, profile: { ...identity.profile, role: "unknown" } }, "123456"));
});

test("offline setup is per-account and cannot silently overwrite an existing PIN", async () => {
  const session = makeSession();
  await session.setupAfterVerifiedOnlineLogin(identity, "123456");
  assert.equal(await session.hasOfflineSetup(identity.user.id), true);
  await assert.rejects(session.setupAfterVerifiedOnlineLogin(identity, "654321"), /already configured/);
});

test("offline PIN unlock is explicitly not a Supabase authenticated session", async () => {
  const session = makeSession();
  await session.setupAfterVerifiedOnlineLogin(identity, "123456");
  const result = await session.unlockOffline(identity.user.id, "123456");
  assert.equal(result.mode, "offline-local-unlock");
  assert.equal(result.supabaseAuthenticated, false);
  assert.equal(result.userId, identity.user.id);
});

test("persistent exponential retry delay starts after five failed attempts", async () => {
  let current = 100000;
  const session = makeSession({ now: () => current });
  await session.setupAfterVerifiedOnlineLogin(identity, "123456");
  for (let i = 0; i < 5; i++) await assert.rejects(session.unlockOffline(identity.user.id, "999999"));
  await assert.rejects(session.unlockOffline(identity.user.id, "123456"), /Try again in 1 seconds/);
  current += 1000;
  assert.equal((await session.unlockOffline(identity.user.id, "123456")).supabaseAuthenticated, false);
});

test("device identity mismatch prevents offline unlock", async () => {
  const db = fakeDatabase();
  const crypto = fakeCryptoVault();
  const first = createOfflineVaultSession({
    database: db, cryptoVault: crypto,
    cryptoImpl: { randomUUID: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
  });
  await first.setupAfterVerifiedOnlineLogin(identity, "123456");
  const secondDb = fakeDatabase();
  const savedDescriptor = await db.getMeta("offline:descriptor:" + identity.user.id);
  await secondDb.setMeta("offline:descriptor:" + identity.user.id, savedDescriptor);
  const second = createOfflineVaultSession({
    database: secondDb, cryptoVault: crypto,
    cryptoImpl: { randomUUID: () => "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" },
  });
  await assert.rejects(second.unlockOffline(identity.user.id, "123456"), /another account or device/);
});
