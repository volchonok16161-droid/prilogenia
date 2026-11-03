import test from "node:test";
import assert from "node:assert/strict";
import { createChecklistCloudBackup } from "../prototype/supabase-cloud-backup.js";

const USER = "11111111-1111-4111-8111-111111111111";
const ROW = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function makeHarness({ reference = null, updateError = null } = {}) {
  const values = new Map();
  if (reference) values.set("checklist_complex::user:" + USER + "::cloud-ref", JSON.stringify(reference));
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
  const result = await h.backup.saveCurrent();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].action, "create");
  assert.equal(h.calls[0].input.payload.state.values.item1.status, "ok");
  assert.equal("front_photo" in h.calls[0].input.payload.state.values.item1, false);
  assert.equal(result.photosExcluded, 1);
  assert.equal(result.created, true);
  assert.deepEqual(JSON.parse(h.values.get("checklist_complex::user:" + USER + "::cloud-ref")), {
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
  assert.equal(JSON.parse(h.values.get("checklist_complex::user:" + USER + "::cloud-ref")).revision, 5);
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
  assert.equal(JSON.parse(h.values.get("checklist_complex::user:" + USER + "::cloud-ref")).revision, 4);
});

test("an invalid saved cloud reference does not silently create a duplicate", async () => {
  const h = makeHarness();
  h.values.set("checklist_complex::user:" + USER + "::cloud-ref", "{broken");
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
  assert.deepEqual(JSON.parse(h.values.get("checklist_complex::user:" + USER + "::cloud-ref")), {
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
  assert.equal(h.values.has("checklist_complex::user:" + USER + "::cloud-ref"), false);
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
  assert.equal(h.values.has("checklist_complex::user:" + USER + "::cloud-ref"), false);
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

test("cloud save calculates completion and deviation stats", async () => {
  const h = makeHarness();
  h.state.values = {
    a: { status: "Да" },
    b: { status: "Нет" },
    c: { status: "" },
    d: { status: null },
  };
  const result = await h.backup.saveCurrent();
  assert.deepEqual(result.checklistStats, {
    total: 4, answered: 2, completionPercent: 50, deviations: 1,
  });
  assert.deepEqual(h.calls[0].input.payload.stats, result.checklistStats);
});
