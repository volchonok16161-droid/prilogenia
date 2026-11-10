import test from "node:test";
import assert from "node:assert/strict";
import { buildOfflineCloudEnvelope } from "../prototype/offline-checklist-schema.js";
import { mapOfflineChecklistOperation } from "../prototype/offline-cloud-mapper.js";
import { createOfflineSyncRunner } from "../prototype/offline-sync-runner.js";

const UID = "11111111-1111-4111-8111-111111111111";
const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const STATE = { general: { type: "2ЭС5К", number: "746" }, values: { motor: { checked: true, comment: "Проверено" } }, selectedSections: ["Секция 1"], changeLog: [] };

function fixture({ mode = "hydro", operation = "create", identity = true, identityUserId = UID, cloudError = null, online = true } = {}) {
  const encrypted = { version: 1, iv: "iv", ciphertext: "opaque" };
  const envelope = buildOfflineCloudEnvelope({
    mode, state: STATE, cloudId: ID,
    ...(operation === "update" ? { expectedRevision: 4 } : {}),
  });
  const queue = [{ opId: "op-1", userId: UID, entityId: ID, operation, encrypted, status: "pending", attempts: 0 }];
  const conflicts = [], calls = [];
  let cloudState = null;
  const database = {
    async listPending(uid) { return queue.filter(row => row.userId === uid && row.status === "pending").map(row => ({ ...row })); },
    async claimQueueOperation(opId, uid, claimId, _at, until) {
      const row = queue.find(item => item.opId === opId && item.userId === uid && item.status === "pending");
      if (!row) return false;
      Object.assign(row, { status: "processing", leaseClaimId: claimId, leaseUntil: until }); return true;
    },
    async updateQueueOperation(opId, uid, changes, claimId) {
      const row = queue.find(item => item.opId === opId && item.userId === uid);
      if (!row || row.leaseClaimId !== claimId) return false;
      Object.assign(row, changes); return true;
    },
    async getCloudState(uid, entityId) { return uid === UID && entityId === ID ? cloudState : null; },
    async markSynced(opId, uid, _revision, claimId, nextCloudState) {
      const i = queue.findIndex(row => row.opId === opId && row.userId === uid && row.leaseClaimId === claimId);
      if (i < 0) return false;
      queue.splice(i, 1);
      cloudState = nextCloudState === null ? null : (nextCloudState || cloudState);
      return { opId, serverRevision: _revision ?? null };
    },
    async saveConflict(value) { conflicts.push(value); },
  };
  const authApi = { async getCurrentIdentity() { return identity ? { user: { id: identityUserId }, profile: { id: identityUserId, role: "employee" }, error: null } : { user: { id: UID }, profile: null, error: null }; } };
  const vault = {
    async decrypt() { return envelope; },
    async encrypt(value) { return { version: 1, iv: "remote", ciphertext: JSON.stringify(value) }; },
  };
  const cloudSync = {
    async create(input) { calls.push(["create", input]); if (cloudError) throw cloudError; return { id: ID, revision: 1 }; },
    async update(input) { calls.push(["update", input]); if (cloudError) throw cloudError; return { id: ID, revision: 5 }; },
    async remove(id) { calls.push(["remove", id]); if (cloudError) throw cloudError; return true; },
    async get(id) {
      calls.push(["get", id]);
      if (operation === "create") {
        const error = new Error("not found");
        error.code = "NOT_FOUND";
        throw error;
      }
      return { id, revision: 5, payload: { remote: true } };
    },
  };
  const runner = createOfflineSyncRunner({
    authApi, database, vault, cloudSync,
    mapOperation: async (op, value) => mapOfflineChecklistOperation(op, value),
    isOnline: () => online,
    now: () => "2026-11-04T12:00:00.000Z",
    claimIdFactory: () => "claim-1",
  });
  return { runner, queue, conflicts, calls, envelope, get cloudState() { return cloudState; } };
}

test("create sync sends a full schema-versioned snapshot for a supported mode", async () => {
  const f = fixture({ mode: "complex" });
  const result = await f.runner.syncPending({ userId: UID });
  assert.equal(result.synced, 1);
  assert.equal(f.queue.length, 0);
  assert.equal(f.cloudState.revision, 1);
  const createCall = f.calls.find(([method]) => method === "create");
  assert.ok(createCall, "cloud create should follow the owner-scoped NOT_FOUND probe");
  assert.deepEqual(createCall[1].payload.state, STATE);
  assert.equal(createCall[1].payload.schemaVersion, 1);
});

test("update sync uses an explicit last-confirmed revision", async () => {
  const f = fixture({ mode: "bi", operation: "update" });
  const result = await f.runner.syncPending({ userId: UID });
  assert.equal(result.synced, 1);
  assert.equal(f.calls[0][0], "update");
  assert.equal(f.calls[0][1].expectedRevision, 4);
  assert.equal(f.cloudState.revision, 5);
});

test("auth failure prevents every cloud write and leaves the queue intact", async () => {
  const f = fixture({ identity: false });
  await assert.rejects(f.runner.syncPending({ userId: UID }), error => error.code === "AUTH_REQUIRED");
  assert.equal(f.calls.length, 0);
  assert.equal(f.queue.length, 1);
});

test("network failure preserves the encrypted queue item", async () => {
  const f = fixture({ cloudError: new Error("network unavailable") });
  const result = await f.runner.syncPending({ userId: UID });
  assert.equal(result.failed, 1);
  assert.equal(f.queue[0].status, "pending");
  assert.equal(f.queue[0].encrypted.ciphertext, "opaque");
});

test("revision conflict stores both encrypted copies and stops automatic retry", async () => {
  const conflict = new Error("stale revision"); conflict.code = "REVISION_CONFLICT";
  const f = fixture({ operation: "update", cloudError: conflict });
  const result = await f.runner.syncPending({ userId: UID });
  assert.equal(result.conflicts, 1);
  assert.equal(f.queue[0].status, "conflict");
  assert.equal(f.conflicts.length, 1);
  assert.equal(f.conflicts[0].localEncrypted.ciphertext, "opaque");
  assert.equal(f.conflicts[0].remoteEncrypted.version, 1);
});

test("all five mode adapters produce cloud envelopes without dropping checklist fields", async () => {
  for (const mode of ["complex", "housings", "tt", "bi", "hydro"]) {
    const f = fixture({ mode });
    const result = await f.runner.syncPending({ userId: UID });
    assert.equal(result.synced, 1, mode);
    const createCall = f.calls.find(([method]) => method === "create");
    assert.ok(createCall, "cloud create should follow the owner-scoped NOT_FOUND probe: " + mode);
    assert.deepEqual(createCall[1].payload.state, STATE, mode);
  }
});

test("successful create stores server revision and photo manifest before queue acknowledgement", async () => {
  const f = fixture();
  const result = await f.runner.syncPending({ userId: UID });
  assert.equal(result.synced, 1);
  assert.equal(f.cloudState.revision, 1);
  assert.deepEqual(f.cloudState.photoManifest, []);
});

test("another signed-in account cannot drain the previous account's offline queue", async () => {
  const otherUserId = "22222222-2222-4222-8222-222222222222";
  const f = fixture({ identityUserId: otherUserId });
  await assert.rejects(f.runner.syncPending({ userId: UID }), error => error.code === "AUTH_REQUIRED");
  assert.equal(f.calls.length, 0);
  assert.equal(f.queue.length, 1);
  assert.equal(f.queue[0].userId, UID);
  assert.equal(f.queue[0].encrypted.ciphertext, "opaque");
});
