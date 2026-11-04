import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { createOfflineVaultCrypto } from "../prototype/offline-vault-crypto.js";

const userA = "11111111-1111-4111-8111-111111111111";
const userB = "22222222-2222-4222-8222-222222222222";
const deviceA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const deviceB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const vault = createOfflineVaultCrypto({ cryptoImpl: webcrypto });

test("PIN descriptor is salted and never stores the PIN", async () => {
  const first = await vault.createDescriptor({ pin: "123456", userId: userA, deviceId: deviceA });
  const second = await vault.createDescriptor({ pin: "123456", userId: userA, deviceId: deviceA });
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.verifier.ciphertext, second.verifier.ciphertext);
  assert.equal(JSON.stringify(first).includes("123456"), false);
  assert.equal(first.iterations, 310000);
  assert.equal(first.cipher, "AES-256-GCM");
});

test("PIN unlock encrypts and decrypts JSON", async () => {
  const descriptor = await vault.createDescriptor({ pin: "804216", userId: userA, deviceId: deviceA });
  const session = await vault.unlock({ pin: "804216", descriptor, userId: userA, deviceId: deviceA });
  const source = { checklist: "tt", checked: [1, 3], note: "локально" };
  const encrypted = await session.encrypt(source);
  assert.equal(JSON.stringify(encrypted).includes("локально"), false);
  assert.deepEqual(await session.decrypt(encrypted), source);
});

test("wrong PIN, another user, and another device are rejected", async () => {
  const descriptor = await vault.createDescriptor({ pin: "123456", userId: userA, deviceId: deviceA });
  await assert.rejects(vault.unlock({ pin: "654321", descriptor, userId: userA, deviceId: deviceA }));
  await assert.rejects(vault.unlock({ pin: "123456", descriptor, userId: userB, deviceId: deviceA }));
  await assert.rejects(vault.unlock({ pin: "123456", descriptor, userId: userA, deviceId: deviceB }));
});

test("AES-GCM detects tampering and account/device substitution", async () => {
  const descriptor = await vault.createDescriptor({ pin: "123456", userId: userA, deviceId: deviceA });
  const session = await vault.unlock({ pin: "123456", descriptor, userId: userA, deviceId: deviceA });
  const record = await session.encrypt({ value: "private" });
  const changed = { ...record, ciphertext: record.ciphertext.slice(0, -1) + (record.ciphertext.endsWith("A") ? "B" : "A") };
  await assert.rejects(session.decrypt(changed));
});

test("PIN and PBKDF2 configuration are validated", async () => {
  await assert.rejects(vault.createDescriptor({ pin: "1234", userId: userA, deviceId: deviceA }), /PIN/);
  assert.throws(() => createOfflineVaultCrypto({ cryptoImpl: webcrypto, iterations: 1000 }), /iterations/);
  await assert.rejects(vault.createDescriptor({ pin: "123456", userId: "not-a-uuid", deviceId: deviceA }), /userId/);
});
