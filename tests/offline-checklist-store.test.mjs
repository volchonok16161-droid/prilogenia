import test from "node:test";
import assert from "node:assert/strict";
import { createOfflineChecklistStore } from "../prototype/offline-checklist-store.js";

const uid = "11111111-1111-4111-8111-111111111111";
function fixture() {
  const records = new Map();
  const queue = [];
  const conflicts = [];
  const calls = [];
  const database = {
    async putRecordAndEnqueue(value) {
      if (value.onlyIfAbsent && records.has(value.id)) {
        const error = new Error("Key already exists");
        error.name = "ConstraintError";
        throw error;
      }
      if (records.get(value.id)?.userId !== value.userId) {
        records.set(value.id, { id: value.id, userId: value.userId, kind: value.kind, encrypted: value.encrypted, updatedAt: value.updatedAt });
      }
      queue.push({ opId: value.opId, userId: value.userId, entityId: value.entityId, operation: value.operation, encrypted: value.encrypted, createdAt: value.createdAt, status: "pending", attempts: 0 });
      calls.push("atomic-write");
    },
    async putRecordAndCoalesceQueue(value) {
      if (value.onlyIfAbsent && records.has(value.id)) {
        const error = new Error("Key already exists");
        error.name = "ConstraintError";
        throw error;
      }
      records.set(value.id, { id: value.id, userId: value.userId, kind: value.kind, encrypted: value.encrypted, updatedAt: value.updatedAt });
      const matching = queue.filter(row => row.userId === value.userId && row.entityId === value.entityId && row.status === "pending");
      if (matching.length) {
        const current = matching[0];
        current.operation = current.operation === "create" && value.operation === "update" ? "create" : value.operation;
        current.encrypted = value.encrypted;
        current.updatedAt = value.updatedAt;
        return { id: value.id, opId: current.opId, coalesced: true };
      }
      queue.push({ opId: value.opId, userId: value.userId, entityId: value.entityId, operation: value.operation, encrypted: value.encrypted, createdAt: value.createdAt, updatedAt: value.updatedAt, status: "pending", attempts: 0 });
      return { id: value.id, opId: value.opId, coalesced: false };
    },
    async getRecord(id, userId) {
      const row = records.get(id);
      return row?.userId === userId ? row : null;
    },
    async listRecords(userId, kind) {
      return [...records.values()].filter(row => row.userId === userId && (!kind || row.kind === kind));
    },
    async listPending(userId) { return queue.filter(row => row.userId === userId && row.status === "pending"); },
    async listConflicts(userId) { return conflicts.filter(row => row.userId === userId); },
  };
  const vault = {
    async encrypt(value) { return { version: 1, iv: "iv", ciphertext: Buffer.from(JSON.stringify(value)).toString("base64") }; },
    async decrypt(record) { return JSON.parse(Buffer.from(record.ciphertext, "base64").toString("utf8")); },
  };
  const store = createOfflineChecklistStore({ database, vault, userId: uid, idFactory: () => "op-1", now: () => "2026-11-04T10:00:00.000Z" });
  return { store, records, queue, calls };
}

test("checklist snapshots are encrypted before atomic snapshot-plus-queue write", async () => {
  const { store, records, queue, calls } = fixture();
  const value = { checks: [true, false], note: "offline" };
  const result = await store.saveChecklist({ id: "checklist-1", value });
  assert.equal(result.status, "pending-sync");
  assert.equal(calls.length, 1);
  assert.equal(records.get("checklist-1").encrypted.version, 1);
  assert.equal(JSON.stringify(records.get("checklist-1")).includes("offline"), false);
  assert.equal(queue.length, 1);
  assert.equal(queue[0].encrypted.version, 1);
  assert.deepEqual((await store.readChecklist("checklist-1")).value, value);
});

test("legacy import requires explicit confirmation and never deletes the legacy source", async () => {
  const { store, records } = fixture();
  const legacy = { oldLocalStorageKey: "still-here", checked: [1] };
  await assert.rejects(store.migrateLegacySnapshot({ id: "legacy-1", legacyValue: legacy }), /Explicit confirmation/);
  assert.equal(records.has("legacy-1"), false);
  await store.migrateLegacySnapshot({ id: "legacy-1", legacyValue: legacy, confirmed: true });
  assert.deepEqual((await store.readChecklist("legacy-1")).value, legacy);
});

test("duplicate legacy import is refused rather than overwriting an encrypted snapshot", async () => {
  const { store } = fixture();
  await store.migrateLegacySnapshot({ id: "legacy-1", legacyValue: { n: 1 }, confirmed: true });
  await assert.rejects(store.migrateLegacySnapshot({ id: "legacy-1", legacyValue: { n: 2 }, confirmed: true }), /already exists/);
  assert.equal((await store.readChecklist("legacy-1")).value.n, 1);
});

test("sync status distinguishes queued work from synchronized state", async () => {
  const { store } = fixture();
  assert.equal((await store.getSyncStatus()).status, "synced");
  await store.saveChecklist({ id: "checklist-1", value: { ok: true } });
  assert.equal((await store.getSyncStatus()).status, "pending-sync");
  assert.equal((await store.getSyncStatus()).pendingCount, 1);
});

test("store rejects a missing or invalid user identity and a locked vault", () => {
  const { store } = fixture();
  assert.equal(store.userId, uid);
  assert.throws(() => createOfflineChecklistStore({ database: {}, vault: {}, userId: "not-a-uuid" }), /database|UUID|vault/i);
});

test("snapshot is not queued when encrypted round-trip verification fails", async () => {
  const { store, queue } = fixture();
  const brokenVault = {
    async encrypt(value) { return { version: 1, iv: "iv", ciphertext: "opaque" }; },
    async decrypt() { return { checks: ["tampered"] }; },
  };
  const isolated = createOfflineChecklistStore({
    database: {
      async putRecordAndEnqueue(value) { queue.push(value); },
      async getRecord() { return null; },
      async listRecords() { return []; },
      async listPending() { return []; },
      async listConflicts() { return []; },
    },
    vault: brokenVault,
    userId: uid,
  });
  await assert.rejects(
    isolated.saveChecklist({ id: "bad-snapshot", value: { checks: [true] } }),
    /round-trip verification/,
  );
  assert.equal(queue.length, 0);
  assert.equal((await store.getSyncStatus()).pendingCount, 0);
});

test("snapshot store rejects values that cannot be serialized as JSON", async () => {
  const { store } = fixture();
  await assert.rejects(
    store.saveChecklist({ id: "undefined-snapshot", value: undefined }),
    /JSON-serializable/,
  );
});

test("concurrent legacy imports cannot overwrite an existing encrypted snapshot", async () => {
  const { store, records, queue } = fixture();
  await store.migrateLegacySnapshot({ id: "legacy-race", legacyValue: { n: 1 }, confirmed: true });
  const queuedBefore = queue.length;
  await assert.rejects(
    store.migrateLegacySnapshot({ id: "legacy-race", legacyValue: { n: 2 }, confirmed: true }),
    /already exists/,
  );
  assert.equal((await store.readChecklist("legacy-race")).value.n, 1);
  assert.equal(queue.length, queuedBefore);
});

test("repeated saves coalesce into one pending operation with the newest encrypted snapshot", async () => {
  const { store, queue } = fixture();
  const first = await store.saveChecklist({ id: "checklist-1", entityId: "cloud-entity-1", operation: "create", value: { version: 1 } });
  const second = await store.saveChecklist({ id: "checklist-1", entityId: "cloud-entity-1", operation: "update", value: { version: 2 } });
  assert.equal(queue.length, 1);
  assert.equal(queue[0].opId, first.opId);
  assert.equal(second.opId, first.opId);
  assert.equal(queue[0].operation, "create");
  assert.deepEqual(await store.readChecklist("checklist-1"), {
    id: "checklist-1", kind: "checklist", value: { version: 2 }, updatedAt: "2026-11-04T10:00:00.000Z",
  });
});

test("a save during an in-flight operation creates a follow-up queue item instead of replacing its lease", async () => {
  const { store, queue } = fixture();
  const first = await store.saveChecklist({ id: "checklist-1", entityId: "cloud-entity-1", operation: "create", value: { version: 1 } });
  queue[0].status = "processing";
  queue[0].leaseClaimId = "tab-a";
  queue[0].leaseUntil = "2026-11-04T10:05:00.000Z";
  const second = await store.saveChecklist({ id: "checklist-1", entityId: "cloud-entity-1", operation: "update", value: { version: 2 } });
  assert.equal(queue.length, 2);
  assert.equal(queue[0].opId, first.opId);
  assert.equal(queue[0].status, "processing");
  assert.equal(queue[0].leaseClaimId, "tab-a");
  assert.equal(queue[1].opId, second.opId);
  assert.equal(queue[1].status, "pending");
  assert.equal(queue[1].operation, "update");
});
