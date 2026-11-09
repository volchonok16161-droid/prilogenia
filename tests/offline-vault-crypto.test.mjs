import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { createOfflineVaultCrypto } from "../prototype/offline-vault-crypto.js";

const userA = "11111111-1111-4111-8111-111111111111";
const userB = "22222222-2222-4222-8222-222222222222";
const deviceA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const deviceB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const cryptoVault = createOfflineVaultCrypto({ cryptoImpl: webcrypto });

test("device keys are non-extractable AES-GCM keys", async () => {
  const key = await cryptoVault.createDeviceKey();
  assert.equal(key.type, "secret");
  assert.equal(key.algorithm.name, "AES-GCM");
  assert.equal(key.extractable, false);
  assert.deepEqual([...key.usages].sort(), ["decrypt", "encrypt"]);
});

test("device key encrypts and decrypts JSON and binary data", async () => {
  const key = await cryptoVault.createDeviceKey();
  const vault = cryptoVault.unlockWithDeviceKey({ key, userId: userA, deviceId: deviceA });
  const source = { checklist: "tt", checked: [1, 3], note: "локально" };
  const encrypted = await vault.encrypt(source);
  assert.equal(JSON.stringify(encrypted).includes("локально"), false);
  assert.deepEqual(await vault.decrypt(encrypted), source);
  const bytes = new Uint8Array([0, 1, 2, 255, 128, 64]);
  const encryptedBytes = await vault.encryptBytes(bytes);
  assert.deepEqual(await vault.decryptBytes(encryptedBytes), bytes);
});

test("device key and authenticated data are bound to one account and device", async () => {
  const key = await cryptoVault.createDeviceKey();
  const vault = cryptoVault.unlockWithDeviceKey({ key, userId: userA, deviceId: deviceA });
  const record = await vault.encrypt({ private: true });
  const otherUser = cryptoVault.unlockWithDeviceKey({ key, userId: userB, deviceId: deviceA });
  const otherDevice = cryptoVault.unlockWithDeviceKey({ key, userId: userA, deviceId: deviceB });
  await assert.rejects(otherUser.decrypt(record));
  await assert.rejects(otherDevice.decrypt(record));
  await assert.rejects(vault.decrypt({ ...record, ciphertext: "AA" }));
});

test("invalid or exportable encryption keys and invalid identities are rejected", async () => {
  const key = await cryptoVault.createDeviceKey();
  assert.throws(() => cryptoVault.unlockWithDeviceKey({ key: {}, userId: userA, deviceId: deviceA }), /Invalid device encryption key/);
  assert.throws(() => cryptoVault.unlockWithDeviceKey({ key, userId: "not-a-uuid", deviceId: deviceA }), /userId/);
  assert.throws(() => cryptoVault.unlockWithDeviceKey({ key, userId: userA, deviceId: "not-a-uuid" }), /deviceId/);
});
