import test from "node:test";
import assert from "node:assert/strict";
import { OFFLINE_CHECKLIST_MODES, buildOfflineCloudEnvelope } from "../prototype/offline-checklist-schema.js";
import { createOfflineChecklistOperationMapper } from "../prototype/offline-cloud-mapper.js";
import { createOfflineSyncRunner } from "../prototype/offline-sync-runner.js";
import { createChecklistPhotoSync } from "../prototype/supabase-cloud-photos.js";
import { createChecklistCloudRestore } from "../prototype/supabase-cloud-restore.js";

const USER = "11111111-1111-4111-8111-111111111111";
const IDS = {
  complex: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  housings: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  tt: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  bi: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  hydro: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
};

function makeState(mode) {
  return {
    general: { type: "2ЭС5К", number: "746", date: "2026-11-04", depot: "ТЧЭ-10" },
    values: {
      "секция №1|узел": {
        checked: true,
        comment: "Проверено после ремонта",
        front_photo: "data:image/jpeg;base64,AQID",
      },
    },
    selectedSections: ["Секция №1"],
    selected: ["узел"],
    changeLog: [{ at: "2026-11-04T10:00:00.000Z", text: "Осмотрено" }],
    modeSpecific: { mode, retained: ["field-a", "field-b"] },
  };
}

function createPipeline(mode) {
  const id = IDS[mode];
  const originalState = makeState(mode);
  const envelope = buildOfflineCloudEnvelope({ mode, state: originalState, cloudId: id });
  const encrypted = { version: 1, iv: "encrypted-iv", ciphertext: "encrypted-checklist-snapshot" };
  const queue = [{
    opId: "operation-" + mode, userId: USER, entityId: id,
    operation: "create", encrypted, status: "pending", attempts: 0,
  }];
  const records = new Map([[id, encrypted]]);
  const cloudRows = new Map();
  const files = new Map();
  let photoCounter = 0;
  const storageApi = {
    from(bucket) {
      assert.equal(bucket, "checklist-photos");
      return {
        async upload(path, blob) {
          if (files.has(path)) return { data: null, error: new Error("duplicate object") };
          files.set(path, blob);
          return { data: { path }, error: null };
        },
        async download(path) {
          const blob = files.get(path);
          return blob ? { data: blob, error: null } : { data: null, error: new Error("missing object") };
        },
        async remove(paths) {
          for (const path of paths) files.delete(path);
          return { data: paths.map(name => ({ name })), error: null };
        },
      };
    },
  };
  const authApi = {
    client: { storage: storageApi },
    async getCurrentIdentity() {
      return { user: { id: USER }, profile: { id: USER, role: "employee" }, error: null };
    },
  };
  const photos = createChecklistPhotoSync({
    authApi,
    idFactory: () => {
      photoCounter += 1;
      return photoCounter === 1
        ? "f1111111-1111-4111-8111-111111111111"
        : "f2222222-2222-4222-8222-222222222222";
    },
  });
  const database = {
    async listPending(userId) {
      return queue.filter(row => row.userId === userId && row.status === "pending").map(row => ({ ...row }));
    },
    async claimQueueOperation(opId, userId, claimId, _now, leaseUntil) {
      const row = queue.find(item => item.opId === opId && item.userId === userId && item.status === "pending");
      if (!row) return false;
      Object.assign(row, { status: "processing", leaseClaimId: claimId, leaseUntil });
      return true;
    },
    async updateQueueOperation(opId, userId, changes, claimId) {
      const row = queue.find(item => item.opId === opId && item.userId === userId);
      if (!row || row.leaseClaimId !== claimId) return false;
      Object.assign(row, changes);
      return true;
    },
    async getCloudState() { return null; },
    async markSynced(opId, userId, revision, claimId, state) {
      const index = queue.findIndex(row => row.opId === opId && row.userId === userId && row.leaseClaimId === claimId);
      if (index < 0) return false;
      queue.splice(index, 1);
      return { opId, revision, state };
    },
    async saveConflict() { throw new Error("No conflict expected in the success path"); },
  };
  const vault = {
    async decrypt(value) {
      assert.deepEqual(value, encrypted);
      return structuredClone(envelope);
    },
    async encrypt(value) { return { version: 1, iv: "remote-iv", ciphertext: JSON.stringify(value) }; },
  };
  const cloudSync = {
    async create(input) {
      const row = {
        id: input.id,
        title: input.title,
        equipment_type: input.equipmentType,
        payload: structuredClone(input.payload),
        revision: 1,
        updated_at: "2026-11-04T12:00:00.000Z",
      };
      cloudRows.set(id, row);
      return { id, revision: 1 };
    },
    async update(input) {
      const row = cloudRows.get(input.id);
      if (!row || row.revision !== input.expectedRevision) {
        throw Object.assign(new Error("revision conflict"), { code: "REVISION_CONFLICT" });
      }
      Object.assign(row, { payload: structuredClone(input.payload), revision: row.revision + 1 });
      return { id, revision: row.revision };
    },
    async remove(rowId) { cloudRows.delete(rowId); return true; },
    async get(rowId) {
      const row = cloudRows.get(rowId);
      return row ? structuredClone(row) : null;
    },
  };
  const runner = createOfflineSyncRunner({
    authApi, database, vault, cloudSync,
    mapOperation: createOfflineChecklistOperationMapper({ photoSync: photos }),
    isOnline: () => true,
    now: () => "2026-11-04T12:00:00.000Z",
    claimIdFactory: () => "claim-" + mode,
  });
  return { id, mode, originalState, encrypted, queue, records, files, cloudRows, authApi, photos, runner };
}

for (const [mode, label] of Object.entries(OFFLINE_CHECKLIST_MODES)) {
  test(`full offline create, photo upload and restore after a fresh runtime: ${mode} (${label})`, async () => {
    const p = createPipeline(mode);
    const before = structuredClone(p.originalState);

    // A reconnect drains the encrypted queue and uploads the photo before the row.
    const sync = await p.runner.syncPending({ userId: USER });
    assert.equal(sync.status, "synced");
    assert.equal(sync.synced, 1);
    assert.equal(p.queue.length, 0);
    assert.equal(p.records.get(p.id), p.encrypted, "local encrypted snapshot remains available after sync");
    assert.equal(p.files.size, 1);

    const cloudRow = p.cloudRows.get(p.id);
    assert.equal(cloudRow.payload.mode, mode);
    assert.deepEqual(cloudRow.payload.state.general, before.general);
    assert.deepEqual(cloudRow.payload.state.selectedSections, before.selectedSections);
    assert.deepEqual(cloudRow.payload.state.selected, before.selected);
    assert.deepEqual(cloudRow.payload.state.changeLog, before.changeLog);
    assert.deepEqual(cloudRow.payload.state.modeSpecific, before.modeSpecific);
    assert.equal(cloudRow.payload.state.values["секция №1|узел"].front_photo, undefined);
    assert.equal(cloudRow.payload.state.values["секция №1|узел"].comment, "Проверено после ремонта");
    assert.equal(cloudRow.payload.photoManifest.length, 1);

    // Simulate closing the browser and opening a new runtime after online login.
    let restoredState = null;
    let safetyCopies = 0;
    const makeRestore = (getCurrentState) => createChecklistCloudRestore({
      authApi: p.authApi,
      cloudApi: { async get(rowId) { return structuredClone(p.cloudRows.get(rowId)); }, async list() { return [...p.cloudRows.values()]; } },
      getMode: () => mode,
      getCurrentState,
      async hydrateState(state, metadata, manifest) {
        const hydrated = await p.photos.restoreState({ state, checklistId: metadata.id, manifest });
        return hydrated.state;
      },
      async beforeApply() { safetyCopies += 1; },
      async applyState(state) { restoredState = structuredClone(state); },
    });

    await makeRestore(() => null).restore(p.id);
    assert.deepEqual(restoredState, before, "all checklist fields and the photo must be restored exactly");
    assert.equal(safetyCopies, 1);
    assert.equal(restoredState.values["секция №1|узел"].front_photo, "data:image/jpeg;base64,AQID");

    // Reopening the same restored checklist after another reload must not
    // create an unnecessary backup or alter the recovered data.
    const afterFirstRestore = structuredClone(restoredState);
    await makeRestore(() => afterFirstRestore).restore(p.id);
    assert.equal(safetyCopies, 1);
    assert.deepEqual(restoredState, before);
  });
}
