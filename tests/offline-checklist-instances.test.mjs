import test from "node:test";
import assert from "node:assert/strict";
import { createOfflineChecklistInstances } from "../prototype/offline-checklist-instances.js";

const UID = "11111111-1111-4111-8111-111111111111";
const IDS = [
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
];
const CLOUD = [
  "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
];
const state = number => ({ general: { type: "2ТЭ116", number }, values: { inspection: { checked: true } } });

function fixture() {
  const records = new Map();
  const meta = new Map();
  const queue = [];
  let idIndex = 0, cloudIndex = 0;
  const database = {
    async putRecord(row) { records.set(row.id, row); },
    async getRecord(id, userId) { const row = records.get(id); return row?.userId === userId ? row : null; },
    async listRecords(userId, kind) { return [...records.values()].filter(row => row.userId === userId && row.kind === kind); },
    async getMeta(key) { return meta.get(key) ?? null; },
    async setMeta(key, value) { meta.set(key, value); },
    async getCloudState() { return null; },
    async listPending() { return []; },
  };
  const vault = {
    async encrypt(value) { return { version: 1, iv: "iv", ciphertext: JSON.stringify(value) }; },
    async decrypt(value) { return JSON.parse(value.ciphertext); },
  };
  const store = {
    async saveChecklist(value) {
      queue.push(value);
      const encrypted = await vault.encrypt(value.value);
      await database.putRecord({ id: value.id, userId: UID, kind: value.kind, encrypted, updatedAt: "2026-11-05T10:00:00.000Z" });
      return { id: value.id, opId: "op-" + queue.length };
    },
  };
  const instances = createOfflineChecklistInstances({
    database, vault, store, userId: UID,
    idFactory: () => IDS[idIndex++],
    cloudIdFactory: () => CLOUD[cloudIndex++],
    now: () => "2026-11-05T10:00:00.000Z",
  });
  return { instances, records, queue, meta, database, vault };
}

test("two checklists of the same mode get independent local and cloud identities", async () => {
  const f = fixture();
  const first = await f.instances.create("complex", state("123"));
  const second = await f.instances.create("complex", state("456"));
  assert.notEqual(first.instanceId, second.instanceId);
  assert.notEqual(first.cloudId, second.cloudId);
  assert.equal(f.records.size, 2);
  assert.equal(f.queue.length, 0);
  assert.equal((await f.instances.load(first.instanceId)).state.general.number, "123");
  assert.equal((await f.instances.load(second.instanceId)).state.general.number, "456");
  assert.equal((await f.instances.list()).length, 2);
});

test("autosave updates only the selected instance and coalesces against its cloud id", async () => {
  const f = fixture();
  const first = await f.instances.create("hydro", state("101"));
  const second = await f.instances.create("hydro", state("202"));
  await f.instances.save(first.instanceId, "hydro", state("103"));
  assert.equal((await f.instances.load(first.instanceId)).state.general.number, "103");
  assert.equal((await f.instances.load(second.instanceId)).state.general.number, "202");
  assert.equal(f.queue.length, 0);
  assert.equal(f.records.size, 2);
});

test("saving an existing instance retains its cloud entity identity", async () => {
  const f = fixture();
  f.meta.set("offline:cloud-sync-enabled:" + UID, true);
  const first = await f.instances.create("tt", state("11"));
  const second = await f.instances.create("tt", state("22"));
  await f.instances.save(first.instanceId, "tt", state("12"));
  assert.equal(f.queue.length, 3);
  assert.equal(f.queue[0].entityId, f.queue[2].entityId);
  assert.notEqual(f.queue[0].entityId, f.queue[1].entityId);
  assert.equal(f.queue[2].operation, "create");
  assert.equal((await f.instances.load(first.instanceId)).state.general.number, "12");
  assert.equal((await f.instances.load(second.instanceId)).state.general.number, "22");
});

test("instance cannot be overwritten by another mode", async () => {
  const f = fixture();
  const first = await f.instances.create("bi", state("1"));
  await assert.rejects(f.instances.save(first.instanceId, "hydro", state("2")), /mode cannot be changed/);
});

test("cloud queue keeps a separate entity for every instance when sync is enabled", async () => {
  const f = fixture();
  f.meta.set("offline:cloud-sync-enabled:" + UID, true);
  const first = await f.instances.create("tt", state("11"));
  const second = await f.instances.create("tt", state("22"));
  assert.equal(f.queue.length, 2);
  assert.notEqual(f.queue[0].entityId, f.queue[1].entityId);
  assert.equal(f.queue[0].operation, "create");
  assert.equal(f.queue[1].operation, "create");
});

test("concurrent autosaves are serialized so an older encryption cannot overwrite a newer snapshot", async () => {
  const f = fixture();
  const first = await f.instances.create("complex", state("100"));
  const encrypt = f.vault.encrypt.bind(f.vault);
  let releaseOlder;
  let olderStarted;
  const started = new Promise(resolve => { olderStarted = resolve; });
  let encryptCalls = 0;
  f.vault.encrypt = async value => {
    encryptCalls += 1;
    if (encryptCalls === 2) {
      olderStarted();
      await new Promise(resolve => { releaseOlder = resolve; });
    }
    return encrypt(value);
  };

  const olderSave = f.instances.save(first.instanceId, "complex", state("101"));
  await started;
  const newerSave = f.instances.save(first.instanceId, "complex", state("102"));
  await Promise.resolve();
  assert.equal(encryptCalls, 2, "newer save waits behind the in-flight older save");

  releaseOlder();
  await Promise.all([olderSave, newerSave]);
  assert.equal((await f.instances.load(first.instanceId)).state.general.number, "102");
});
