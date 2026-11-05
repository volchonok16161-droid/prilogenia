import test from "node:test";
import assert from "node:assert/strict";
import { createChecklistCloudBackup } from "../prototype/supabase-cloud-backup.js";

const USER = "11111111-1111-4111-8111-111111111111";
const ROW = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const LOCAL = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const refKey = "checklist_complex::user:" + USER + "::cloud-ref::" + LOCAL;

function makeHarness({ reference = null, updateError = null } = {}) {
  const values = new Map();
  if (reference) values.set(refKey, JSON.stringify(reference));
  const calls = [];
  const storage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
  let currentRevision = reference?.revision ?? 0;
  const cloudApi = {
    async create(input) {
      calls.push({ action: "create", input });
      currentRevision = 1;
      return { id: ROW, revision: currentRevision };
    },
    async get(id) {
      return { id, revision: currentRevision, payload: { photos: [] } };
    },
    async update(input) {
      calls.push({ action: "update", input });
      if (updateError) throw updateError;
      if (input.expectedRevision !== currentRevision) {
        throw Object.assign(new Error("conflict"), { code: "REVISION_CONFLICT" });
      }
      currentRevision += 1;
      return { id: ROW, revision: currentRevision };
    },
  };
  const authApi = {
    async getCurrentIdentity() { return { user: { id: USER }, profile: { role: "employee" }, error: null }; },
  };
  const state = {
    __cloudChecklistId: LOCAL,
    general: { type: "ВЛ80", number: "123", notes: "ok" },
    values: { item1: { status: "ok", front_photo: "data:image/jpeg;base64,AAAA" } },
  };
  const backup = createChecklistCloudBackup({
    authApi,
    storage,
    getState: () => state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    cloudApi,
  });
  return { backup, calls, values, state };
}

test("explicit backup creates a cloud record and excludes local photos", async () => {
  const h = makeHarness();
  // A legacy mode-wide reference must not be reused for this checklist instance.
  h.values.set("checklist_complex::user:" + USER + "::cloud-ref", JSON.stringify({ id: ROW, revision: 99 }));
  const result = await h.backup.saveCurrent();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].action, "create");
  assert.equal(h.calls[0].input.payload.state.values.item1.status, "ok");
  assert.equal("__cloudChecklistId" in h.calls[0].input.payload.state, false);
  assert.equal("front_photo" in h.calls[0].input.payload.state.values.item1, false);
  assert.equal(result.photosExcluded, 1);
  assert.equal(result.created, true);
  assert.deepEqual(JSON.parse(h.values.get(refKey)), {
    id: ROW, revision: 1,
  });
  assert.equal(h.state.values.item1.front_photo, "data:image/jpeg;base64,AAAA");
});

test("next explicit backup updates the same cloud row with compare-and-swap revision", async () => {
  const h = makeHarness({ reference: { id: ROW, revision: 4 } });
  const result = await h.backup.saveCurrent();
  assert.equal(h.calls[0].action, "update");
  assert.equal(h.calls[0].input.id, ROW);
  assert.equal(h.calls[0].input.expectedRevision, 4);
  assert.equal(result.created, false);
  assert.equal(JSON.parse(h.values.get(refKey)).revision, 5);
});

test("a mismatched local namespace is rejected before cloud writes", async () => {
  const h = makeHarness();
  const bad = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem() { return null; }, setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:22222222-2222-4222-8222-222222222222",
    cloudApi: { async create() { throw new Error("must not run"); } },
  });
  await assert.rejects(bad.saveCurrent(), (error) => error.code === "STORAGE_SCOPE_MISMATCH");
});

test("a stale cloud revision is surfaced and the local reference is not advanced", async () => {
  const conflict = Object.assign(new Error("conflict"), { code: "REVISION_CONFLICT" });
  const h = makeHarness({ reference: { id: ROW, revision: 4 }, updateError: conflict });
  await assert.rejects(h.backup.saveCurrent(), (error) => error.code === "REVISION_CONFLICT");
  assert.equal(JSON.parse(h.values.get(refKey)).revision, 4);
});

test("an invalid saved cloud reference does not silently create a duplicate", async () => {
  const h = makeHarness();
  h.values.set(refKey, "{broken");
  await assert.rejects(h.backup.saveCurrent(), (error) => error.code === "INVALID_CLOUD_REFERENCE");
  assert.equal(h.calls.length, 0);
});


test("create followed by a second explicit save updates the same row", async () => {
  const h = makeHarness();
  const first = await h.backup.saveCurrent();
  const second = await h.backup.saveCurrent();
  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.deepEqual(h.calls.map((call) => call.action), ["create", "update"]);
  assert.equal(h.calls[1].input.id, ROW);
  assert.equal(h.calls[1].input.expectedRevision, 1);
  assert.deepEqual(JSON.parse(h.values.get(refKey)), {
    id: ROW,
    revision: 2,
  });
});

test("a failed first cloud create does not store a reference or pretend success", async () => {
  const h = makeHarness();
  h.backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: {
      getItem: (key) => h.values.get(key) ?? null,
      setItem: (key, value) => h.values.set(key, String(value)),
    },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    cloudApi: {
      async create() { throw Object.assign(new Error("offline"), { code: "CLOUD_REQUEST_FAILED" }); },
      async update() { throw new Error("must not update"); },
    },
  });
  await assert.rejects(h.backup.saveCurrent(), (error) => error.code === "CLOUD_REQUEST_FAILED");
  assert.equal(h.values.has(refKey), false);
});

test("photo exclusion recurses through nested objects and arrays without mutating local state", async () => {
  const h = makeHarness();
  h.state.values.nested = [
    { side_photo: "data:image/jpeg;base64,BBBB", status: "ok" },
    { child: { detail_photo: "local-photo", note: "kept" } },
  ];
  const result = await h.backup.saveCurrent();
  const nested = h.calls[0].input.payload.state.values.nested;
  assert.equal("side_photo" in nested[0], false);
  assert.equal("detail_photo" in nested[1].child, false);
  assert.equal(nested[1].child.note, "kept");
  assert.equal(result.photosExcluded, 3);
  assert.equal(h.state.values.nested[0].side_photo, "data:image/jpeg;base64,BBBB");
  assert.equal(h.state.values.nested[1].child.detail_photo, "local-photo");
});


test("createSnapshot creates a separate immutable cloud copy without changing the current reference", async () => {
  const h = makeHarness();
  const snapshot = await h.backup.createSnapshot({ label: "Before restore" });
  assert.equal(snapshot.row.id, ROW);
  assert.equal(snapshot.photosExcluded, 1);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].action, "create");
  assert.match(h.calls[0].input.title, /^Before restore/);
  assert.equal("front_photo" in h.calls[0].input.payload.state.values.item1, false);
  assert.equal(h.values.has(refKey), false);
  assert.equal(h.state.values.item1.front_photo, "data:image/jpeg;base64,AAAA");
});


test("photo manifest is uploaded for the exact next cloud revision and stored with the payload", async () => {
  const h = makeHarness();
  const calls = [];
  const photoSync = {
    async uploadState(input) {
      calls.push(["upload", input.checklistId, input.revision]);
      return { manifest: [{ itemId: "item1", field: "front_photo", path: "private/path", contentType: "image/jpeg" }], uploaded: 1 };
    },
    async removeManifest(manifest) { calls.push(["remove", manifest.length]); },
  };
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem() { return null; }, setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    photoSync,
    idFactory: () => ROW,
    cloudApi: {
      async create(input) {
        calls.push(["create", input.id, input.payload.photos.length]);
        return { id: input.id, revision: 1 };
      },
    },
  });
  const result = await backup.saveCurrent();
  assert.deepEqual(calls, [["upload", ROW, 1], ["create", ROW, 1]]);
  assert.equal(result.photosUploaded, 1);
});

test("photo uploads are rolled back when the cloud revision write fails", async () => {
  const h = makeHarness();
  const calls = [];
  const manifest = [{ itemId: "item1", field: "front_photo", path: "private/path", contentType: "image/jpeg" }];
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem() { return JSON.stringify({ id: ROW, revision: 4 }); }, setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    photoSync: {
      async uploadState(input) { calls.push(["upload", input.revision]); return { manifest, uploaded: 1 }; },
      async removeManifest(input) { calls.push(["remove", input.length]); },
    },
    cloudApi: {
      async update() { calls.push(["update"]); throw Object.assign(new Error("conflict"), { code: "REVISION_CONFLICT" }); },
    },
  });
  await assert.rejects(backup.saveCurrent(), (error) => error.code === "REVISION_CONFLICT");
  assert.deepEqual(calls, [["upload", 5], ["update"], ["remove", 1]]);
});


test("new local checklist in the same mode gets its own cloud row and does not reuse the previous reference", async () => {
  const values = new Map();
  const calls = [];
  const userStorageKey = "checklist_complex::user:" + USER;
  const states = [
    { general: { type: "ВЛ80", number: "old" }, values: {} },
    { general: { type: "ВЛ80", number: "new" }, values: {} },
  ];
  let activeState = states[0];
  let identityIndex = 0;
  let persistedIdentities = 0;
  const identities = [
    "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  ];
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: {
      getItem(key) { return values.get(key) ?? null; },
      setItem(key, value) { values.set(key, String(value)); },
    },
    getState: () => activeState,
    getMode: () => "complex",
    getStorageKey: () => userStorageKey,
    identityFactory: () => identities[identityIndex++],
    persistState: () => { persistedIdentities += 1; return true; },
    cloudApi: {
      async create(input) {
        calls.push({ action: "create", id: input.id, title: input.title });
        return { id: input.id, revision: 1 };
      },
      async update(input) {
        calls.push({ action: "update", id: input.id, expectedRevision: input.expectedRevision });
        return { id: input.id, revision: input.expectedRevision + 1 };
      },
    },
  });

  const first = await backup.saveCurrent();
  activeState = states[1];
  const second = await backup.saveCurrent();
  const secondAgain = await backup.saveCurrent();

  assert.equal(first.created, true);
  assert.equal(second.created, true);
  assert.equal(secondAgain.created, false);
  assert.deepEqual(calls.map((call) => call.action), ["create", "create", "update"]);
  assert.notEqual(calls[0].id, calls[1].id);
  assert.equal(calls[2].id, calls[1].id);
  assert.equal(calls[2].expectedRevision, 1);
  assert.equal(persistedIdentities, 2, "each newly identified local checklist is persisted before cloud writes");
});

test("cloud save calculates completion and deviations from configured field ok-values", async () => {
  const h = makeHarness();
  h.state.values = {
    "rt130|section-1": { f1: "Да", f2: "Нет", f3: "", f4: "Не требуется", ignored: "Нет" },
    "other|section-1": { f1: "Нет" },
  };
  h.backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: (key) => h.values.get(key) ?? null, setItem: (key, value) => h.values.set(key, String(value)) },
    getState: () => h.state,
    getMode: () => "housings",
    getStorageKey: () => "checklist_complex::user:" + USER,
    getChecklistType: () => "КМБ",
    getChecklistDefinitions: () => [{ id: "rt130", instances: [{ id: "rt130|section-1" }, { id: "rt130|section-2" }], fields: [
      { key: "f1", type: "select", ok: ["Да"], calc: true },
      { key: "f2", type: "select", ok: ["Да"], calc: true },
      { key: "f3", type: "select", ok: ["Да"], calc: true },
      { key: "f4", type: "select", ok: ["Да"], calc: true },
      { key: "meta", type: "text", ok: [], calc: false },
    ] }],
    cloudApi: {
      async create(input) { h.calls.push({ action: "create", input }); return { id: ROW, revision: 1 }; },
    },
  });
  const result = await h.backup.saveCurrent();
  assert.deepEqual(result.checklistStats, {
    total: 8, answered: 3, completionPercent: 38, deviations: 1,
  });
  assert.deepEqual(h.calls[0].input.payload.stats, result.checklistStats);
  assert.equal(h.calls[0].input.payload.checklistType, "КМБ");
});


test("cloud backup prefers authoritative runtime checklist stats over generic field heuristics", async () => {
  const h = makeHarness();
  h.backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: (key) => h.values.get(key) ?? null, setItem: (key, value) => h.values.set(key, String(value)) },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    getChecklistDefinitions: () => [{ id: "legacy", fields: [{ key: "x", ok: ["Да"] }], instances: [{ id: "legacy|one" }] }],
    getChecklistStats: () => ({
      totalInstances: 7,
      okInstances: 3,
      badInstances: 2,
      allFieldsCount: 9,
      filledFieldsCount: 5,
      filledGeneral: 4,
      totalFields: 15,
      filledTotal: 9,
      percent: 60,
    }),
    cloudApi: {
      async create(input) { h.calls.push({ action: "create", input }); return { id: ROW, revision: 1 }; },
    },
  });

  await h.backup.saveCurrent();
  const stats = h.calls[0].input.payload.stats;
  assert.equal(stats.completionPercent, 60);
  assert.equal(stats.deviations, 2);
  assert.equal(stats.totalInstances, 7);
  assert.equal(stats.okInstances, 3);
  assert.equal(stats.badInstances, 2);
  assert.equal(stats.total, 15);
  assert.equal(stats.answered, 9);
  assert.equal(stats.filledGeneral, 4);
});

test("old revision photos are removed only after a successful CAS update", async () => {
  const h = makeHarness({ reference: { id: ROW, revision: 4 } });
  const oldManifest = [{ itemId: "item1", field: "front_photo", path: USER + "/" + ROW + "/4/cccccccc-cccc-4ccc-8ccc-cccccccccccc", contentType: "image/jpeg" }];
  const calls = [];
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: () => JSON.stringify({ id: ROW, revision: 4 }), setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    photoSync: {
      async uploadState() { calls.push("upload"); return { manifest: [], uploaded: 0 }; },
      async removeManifest(manifest) { calls.push("remove"); assert.deepEqual(manifest, oldManifest); return manifest.length; },
    },
    cloudApi: {
      async get(id) { calls.push("get"); return { id, revision: 4, payload: { photos: oldManifest } }; },
      async update(input) { calls.push("update"); assert.equal(input.expectedRevision, 4); return { id: ROW, revision: 5 }; },
    },
  });
  const result = await backup.saveCurrent();
  assert.deepEqual(calls, ["upload", "get", "update", "remove"]);
  assert.deepEqual(result.photosCleanup, { removed: 1, warning: false });
});

test("failed CAS update leaves the previous revision photos untouched", async () => {
  const h = makeHarness({ reference: { id: ROW, revision: 4 } });
  const calls = [];
  const oldManifest = [{ itemId: "item1", field: "front_photo", path: USER + "/" + ROW + "/4/cccccccc-cccc-4ccc-8ccc-cccccccccccc", contentType: "image/jpeg" }];
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: () => JSON.stringify({ id: ROW, revision: 4 }), setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    photoSync: {
      async uploadState() { return { manifest: [], uploaded: 0 }; },
      async removeManifest() { calls.push("remove"); },
    },
    cloudApi: {
      async get(id) { return { id, revision: 4, payload: { photos: oldManifest } }; },
      async update() { calls.push("update"); throw Object.assign(new Error("conflict"), { code: "REVISION_CONFLICT" }); },
    },
  });
  await assert.rejects(backup.saveCurrent(), (error) => error.code === "REVISION_CONFLICT");
  assert.deepEqual(calls, ["update"]);
});

test("old photo cleanup failure does not undo a committed save", async () => {
  const h = makeHarness({ reference: { id: ROW, revision: 4 } });
  const oldManifest = [{ itemId: "item1", field: "front_photo", path: USER + "/" + ROW + "/4/cccccccc-cccc-4ccc-8ccc-cccccccccccc", contentType: "image/jpeg" }];
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: () => JSON.stringify({ id: ROW, revision: 4 }), setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    photoSync: {
      async uploadState() { return { manifest: [], uploaded: 0 }; },
      async removeManifest() { throw new Error("storage unavailable"); },
    },
    cloudApi: {
      async get(id) { return { id, revision: 4, payload: { photos: oldManifest } }; },
      async update() { return { id: ROW, revision: 5 }; },
    },
  });
  const result = await backup.saveCurrent();
  assert.equal(result.row.revision, 5);
  assert.deepEqual(result.photosCleanup, { removed: 0, warning: true });
  // The mocked storage intentionally does not persist the reference; successful row revision is enough.
});

test("cleanup skips manifests with paths outside the saved checklist", async () => {
  const h = makeHarness({ reference: { id: ROW, revision: 4 } });
  let removed = false;
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: () => JSON.stringify({ id: ROW, revision: 4 }), setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    photoSync: {
      async uploadState() { return { manifest: [], uploaded: 0 }; },
      async removeManifest() { removed = true; },
    },
    cloudApi: {
      async get(id) { return { id, revision: 4, payload: { photos: [
        { itemId: "item1", field: "front_photo", path: USER + "/dddddddd-dddd-4ddd-8ddd-dddddddddddd/4/cccccccc-cccc-4ccc-8ccc-cccccccccccc" },
      ] } }; },
      async update() { return { id: ROW, revision: 5 }; },
    },
  });
  const result = await backup.saveCurrent();
  assert.equal(removed, false);
  assert.deepEqual(result.photosCleanup, { removed: 0, warning: false });
});


test("cleanup skips a photo manifest from a different cloud revision", async () => {
  const h = makeHarness({ reference: { id: ROW, revision: 4 } });
  let removed = false;
  const staleManifest = [{
    itemId: "item1", field: "front_photo",
    path: USER + "/" + ROW + "/3/cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    contentType: "image/jpeg",
  }];
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: () => JSON.stringify({ id: ROW, revision: 4 }), setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    photoSync: {
      async uploadState() { return { manifest: [], uploaded: 0 }; },
      async removeManifest() { removed = true; },
    },
    cloudApi: {
      async get(id) { return { id, revision: 4, payload: { photos: staleManifest } }; },
      async update() { return { id: ROW, revision: 5 }; },
    },
  });
  const result = await backup.saveCurrent();
  assert.equal(removed, false);
  assert.deepEqual(result.photosCleanup, { removed: 0, warning: false });
});


test("cleanup is all-or-nothing when a previous revision manifest mixes owned and foreign paths", async () => {
  const h = makeHarness({ reference: { id: ROW, revision: 4 } });
  let removed = false;
  const mixedManifest = [
    { itemId: "item1", field: "front_photo", path: USER + "/" + ROW + "/4/cccccccc-cccc-4ccc-8ccc-cccccccccccc" },
    { itemId: "item2", field: "front_photo", path: USER + "/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee/4/ffffffff-ffff-4fff-8fff-ffffffffffff" },
  ];
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: () => JSON.stringify({ id: ROW, revision: 4 }), setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    photoSync: {
      async uploadState() { return { manifest: [], uploaded: 0 }; },
      async removeManifest() { removed = true; },
    },
    cloudApi: {
      async get(id) { return { id, revision: 4, payload: { photos: mixedManifest } }; },
      async update() { return { id: ROW, revision: 5 }; },
    },
  });
  const result = await backup.saveCurrent();
  assert.equal(removed, false, "must not partially clean a mixed manifest");
  assert.deepEqual(result.photosCleanup, { removed: 0, warning: false });
});


test("cleanup skips malformed paths even when owner, checklist and revision prefixes match", async () => {
  const h = makeHarness({ reference: { id: ROW, revision: 4 } });
  let removed = false;
  const malformedManifest = [{
    itemId: "item1", field: "front_photo",
    path: USER + "/" + ROW + "/4/not-a-uuid/extra",
    contentType: "image/jpeg",
  }];
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: () => JSON.stringify({ id: ROW, revision: 4 }), setItem() {} },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    photoSync: {
      async uploadState() { return { manifest: [], uploaded: 0 }; },
      async removeManifest() { removed = true; },
    },
    cloudApi: {
      async get(id) { return { id, revision: 4, payload: { photos: malformedManifest } }; },
      async update() { return { id: ROW, revision: 5 }; },
    },
  });
  const result = await backup.saveCurrent();
  assert.equal(removed, false);
  assert.deepEqual(result.photosCleanup, { removed: 0, warning: false });
});


test("createSnapshot reuses an identical prior safety copy instead of creating duplicates", async () => {
  const h = makeHarness();
  const rows = [];
  const calls = [];
  const backup = createChecklistCloudBackup({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storage: { getItem: (key) => h.values.get(key) ?? null, setItem: (key, value) => h.values.set(key, String(value)) },
    getState: () => h.state,
    getMode: () => "complex",
    getStorageKey: () => "checklist_complex::user:" + USER,
    idFactory: () => ROW,
    cloudApi: {
      async list() { return rows; },
      async create(input) {
        calls.push(input);
        const row = { id: input.id, title: input.title, equipment_type: input.equipmentType, payload: input.payload, revision: 1 };
        rows.push(row);
        return row;
      },
    },
  });
  const first = await backup.createSnapshot({ label: "Автокопия перед восстановлением" });
  const second = await backup.createSnapshot({ label: "Автокопия перед восстановлением" });
  assert.equal(calls.length, 1);
  assert.equal(first.row.id, second.row.id);
  assert.equal(second.reused, true);
  assert.equal(second.photosUploaded, 0);
});
