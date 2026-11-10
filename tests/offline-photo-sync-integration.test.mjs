import test from "node:test";
import assert from "node:assert/strict";
import { buildOfflineCloudEnvelope } from "../prototype/offline-checklist-schema.js";
import { createOfflineChecklistOperationMapper } from "../prototype/offline-cloud-mapper.js";
import { createOfflineSyncRunner } from "../prototype/offline-sync-runner.js";

const UID = "11111111-1111-4111-8111-111111111111";
const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PHOTO_PATH = UID + "/" + ID + "/1/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ENCRYPTED = Object.freeze({ version: 1, iv: "local-iv", ciphertext: "local-ciphertext" });

function fixture({ identity = true, cloudError = null, operation = "create" } = {}) {
  const state = {
    general: { type: "ТТ", number: "746" },
    values: { item1: { checked: true, comment: "Проверено", front_photo: "data:image/jpeg;base64,AQID" } },
    selectedSections: ["Секция 1"],
    changeLog: [{ action: "checked" }],
  };
  const envelope = buildOfflineCloudEnvelope({ mode: "tt", state, cloudId: ID, ...(operation === "update" ? { expectedRevision: 4 } : {}) });
  const queue = [{ opId: "op-1", userId: UID, entityId: ID, operation, encrypted: ENCRYPTED, status: "pending", attempts: 0 }];
  const calls = [];
  const conflicts = [];
  const uploads = [];
  const removed = [];
  let cloudState = operation === "update" ? { revision: 4 } : null;
  const manifest = [{ itemId: "item1", field: "front_photo", path: PHOTO_PATH, contentType: "image/jpeg" }];
  const database = {
    async listPending(userId) { return queue.filter(row => row.userId === userId && row.status === "pending").map(row => ({ ...row })); },
    async claimQueueOperation(opId, userId, claimId, _at, leaseUntil) {
      const row = queue.find(item => item.opId === opId && item.userId === userId && item.status === "pending");
      if (!row) return false;
      Object.assign(row, { status: "processing", leaseClaimId: claimId, leaseUntil });
      return true;
    },
    async updateQueueOperation(opId, userId, changes, claimId) {
      const row = queue.find(item => item.opId === opId && item.userId === userId);
      if (!row || row.leaseClaimId !== claimId) return false;
      Object.assign(row, changes); return true;
    },
    async getCloudState() { return cloudState; },
    async markSynced(opId, userId, revision, claimId, nextState) {
      const index = queue.findIndex(row => row.opId === opId && row.userId === userId && row.leaseClaimId === claimId);
      if (index < 0) return false;
      queue.splice(index, 1);
      cloudState = nextState === null ? null : nextState || cloudState;
      return { opId, revision };
    },
    async saveConflict(conflict) { conflicts.push(conflict); },
  };
  const authApi = {
    async getCurrentIdentity() {
      return identity
        ? { user: { id: UID }, profile: { id: UID, role: "employee" }, error: null }
        : { user: { id: UID }, profile: null, error: null };
    },
  };
  const vault = {
    async decrypt(encrypted) { assert.equal(encrypted, ENCRYPTED); return structuredClone(envelope); },
    async encrypt(value) { return { version: 1, iv: "remote-iv", ciphertext: JSON.stringify(value) }; },
  };
  const photoSync = {
    async uploadState(args) {
      uploads.push(structuredClone(args));
      return { uploaded: manifest.length, manifest };
    },
    async removeManifest(value) { removed.push(structuredClone(value)); return value.length; },
  };
  const cloudSync = {
    async create(input) {
      calls.push(["create", structuredClone(input)]);
      if (cloudError) throw cloudError;
      return { id: ID, revision: 1 };
    },
    async update(input) { calls.push(["update", structuredClone(input)]); if (cloudError) throw cloudError; return { id: ID, revision: 2 }; },
    async remove(id) { calls.push(["remove", id]); return true; },
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
  const mapOperation = createOfflineChecklistOperationMapper({ photoSync });
  const runner = createOfflineSyncRunner({
    authApi, database, vault, cloudSync, mapOperation,
    isOnline: () => true,
    now: () => "2026-11-04T12:00:00.000Z",
    claimIdFactory: () => "claim-1",
  });
  return { runner, queue, calls, conflicts, uploads, removed, state, get cloudState() { return cloudState; } };
}

test("photo upload and checklist create form one successful offline sync transaction", async () => {
  const f = fixture();
  const result = await f.runner.syncPending({ userId: UID });
  assert.equal(result.synced, 1);
  assert.equal(f.queue.length, 0);
  assert.equal(f.uploads.length, 1);
  assert.equal(f.uploads[0].checklistId, ID);
  assert.equal(f.uploads[0].revision, 1);
  assert.equal(f.calls[0][0], "create");
  assert.equal(f.calls[0][1].payload.state.values.item1.front_photo, undefined);
  assert.deepEqual(f.calls[0][1].payload.photoManifest, [{
    itemId: "item1", field: "front_photo", path: PHOTO_PATH, contentType: "image/jpeg",
  }]);
  assert.equal(f.cloudState.revision, 1);
  assert.deepEqual(f.cloudState.photoManifest, f.calls[0][1].payload.photoManifest);
  assert.deepEqual(f.state.values.item1.front_photo, "data:image/jpeg;base64,AQID");
  assert.equal(f.removed.length, 0);
});

test("cloud write conflict rolls back uploaded photos and retains encrypted local data", async () => {
  const conflict = Object.assign(new Error("revision conflict"), { code: "REVISION_CONFLICT" });
  const f = fixture({ cloudError: conflict, operation: "update" });
  const result = await f.runner.syncPending({ userId: UID });
  assert.equal(result.conflicts, 1);
  assert.equal(f.queue[0].status, "conflict");
  assert.equal(f.queue[0].encrypted, ENCRYPTED);
  assert.equal(f.conflicts.length, 1);
  assert.equal(f.conflicts[0].localEncrypted, ENCRYPTED);
  assert.deepEqual(f.removed, [[{
    itemId: "item1", field: "front_photo", path: PHOTO_PATH, contentType: "image/jpeg",
  }]]);
});

test("transient cloud failure rolls back uploads but leaves encrypted operation retryable", async () => {
  const f = fixture({ cloudError: new Error("network unavailable") });
  const result = await f.runner.syncPending({ userId: UID });
  assert.equal(result.failed, 1);
  assert.equal(f.queue[0].status, "pending");
  assert.equal(f.queue[0].encrypted, ENCRYPTED);
  assert.equal(f.queue[0].lastError, "network unavailable");
  assert.equal(f.removed.length, 1);
  assert.equal(f.conflicts.length, 0);
});

test("local-only identity is rejected before any photo reaches Storage", async () => {
  const f = fixture({ identity: false });
  await assert.rejects(f.runner.syncPending({ userId: UID }), error => error.code === "AUTH_REQUIRED");
  assert.equal(f.uploads.length, 0);
  assert.equal(f.calls.length, 0);
  assert.equal(f.removed.length, 0);
});
