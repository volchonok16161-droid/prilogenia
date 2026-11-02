import test from "node:test";
import assert from "node:assert/strict";
import { createChecklistCloudBackup } from "../prototype/supabase-cloud-backup.js";

const USER = "11111111-1111-4111-8111-111111111111";
const ROW = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function makeHarness({ reference = null, updateError = null } = {}) {
  const values = new Map();
  if (reference) values.set("checklist::user:" + USER + "::cloud-ref", JSON.stringify(reference));
  const calls = [];
  const storage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
  const row = { id: ROW, revision: reference ? reference.revision + 1 : 1 };
  const cloudApi = {
    async create(input) { calls.push({ action: "create", input }); return row; },
    async update(input) {
      calls.push({ action: "update", input });
      if (updateError) throw updateError;
      return row;
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
  assert.deepEqual(JSON.parse(h.values.get("checklist::user:" + USER + "::cloud-ref")), {
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
  assert.equal(JSON.parse(h.values.get("checklist::user:" + USER + "::cloud-ref")).revision, 5);
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
  assert.equal(JSON.parse(h.values.get("checklist::user:" + USER + "::cloud-ref")).revision, 4);
});

test("an invalid saved cloud reference does not silently create a duplicate", async () => {
  const h = makeHarness();
  h.values.set("checklist::user:" + USER + "::cloud-ref", "{broken");
  await assert.rejects(h.backup.saveCurrent(), (error) => error.code === "INVALID_CLOUD_REFERENCE");
  assert.equal(h.calls.length, 0);
});
