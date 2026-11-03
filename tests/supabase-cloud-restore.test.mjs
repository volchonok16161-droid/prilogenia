import test from "node:test";
import assert from "node:assert/strict";
import { createChecklistCloudRestore } from "../prototype/supabase-cloud-restore.js";

const USER = "11111111-1111-4111-8111-111111111111";
const ROW = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function harness({ payload = { mode: "complex", state: { general: { number: "42" } } }, mode = "complex", identity = { user: { id: USER }, error: null } } = {}) {
  const calls = [];
  let applied = null;
  const row = { id: ROW, owner_id: USER, title: "Чек-лист — 42", equipment_type: "complex", payload, revision: 3, updated_at: "2026-11-02T10:00:00Z" };
  const cloudApi = {
    async list() { calls.push("list"); return [row]; },
    async get(id) { calls.push(["get", id]); return row; },
  };
  const restore = createChecklistCloudRestore({
    authApi: { async getCurrentIdentity() { return identity; } },
    cloudApi,
    getMode: () => mode,
    async applyState(state, metadata) { applied = { state, metadata }; },
  });
  return { restore, calls, get applied() { return applied; }, row };
}

test("listAvailable exposes safe metadata only, not payload", async () => {
  const h = harness();
  const [item] = await h.restore.listAvailable();
  assert.equal(item.id, ROW);
  assert.equal(item.revision, 3);
  assert.equal(item.mode, "complex");
  assert.equal("payload" in item, false);
  assert.deepEqual(h.calls, ["list"]);
});

test("restore fetches a record and applies a cloned state only through explicit callback", async () => {
  const h = harness();
  const result = await h.restore.restore(ROW);
  assert.deepEqual(h.calls, [["get", ROW]]);
  assert.deepEqual(h.applied.state, h.row.payload.state);
  assert.notEqual(h.applied.state, h.row.payload.state);
  assert.equal(h.applied.metadata.revision, 3);
  assert.equal(result.id, ROW);
});

test("restore refuses a different checklist mode without applying state", async () => {
  const h = harness({ mode: "hydro" });
  await assert.rejects(h.restore.restore(ROW), (error) => error.code === "MODE_MISMATCH");
  assert.equal(h.applied, null);
});

test("restore rejects malformed payload without applying state", async () => {
  const h = harness({ payload: { mode: "complex", state: [] } });
  await assert.rejects(h.restore.restore(ROW), (error) => error.code === "INVALID_CLOUD_PAYLOAD");
  assert.equal(h.applied, null);
});

test("restore requires an authenticated session before cloud access", async () => {
  const h = harness({ identity: { user: null, error: null } });
  await assert.rejects(h.restore.restore(ROW), (error) => error.code === "AUTH_REQUIRED");
  assert.deepEqual(h.calls, []);
  assert.equal(h.applied, null);
});


test("restore creates a safety snapshot before applying incoming state", async () => {
  const calls = [];
  const h = harness();
  const restore = createChecklistCloudRestore({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    cloudApi: { async list() { return [h.row]; }, async get(id) { calls.push("get"); return h.row; } },
    getMode: () => "complex",
    getCurrentState: () => ({ general: { number: "old" } }),
    async beforeApply(meta) { calls.push(["snapshot", meta.revision]); },
    async applyState() { calls.push("apply"); },
  });
  await restore.restore(ROW);
  assert.deepEqual(calls, ["get", ["snapshot", 3], "apply"]);
});

test("failed safety snapshot aborts restore before local state can be overwritten", async () => {
  let applied = false;
  const h = harness();
  const restore = createChecklistCloudRestore({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    cloudApi: { async list() { return [h.row]; }, async get() { return h.row; } },
    getMode: () => "complex",
    async beforeApply() { throw new Error("snapshot failed"); },
    async applyState() { applied = true; },
  });
  await assert.rejects(restore.restore(ROW), /snapshot failed/);
  assert.equal(applied, false);
});


test("restore hydrates private photo manifest before applying the checklist state", async () => {
  const h = harness({
    payload: {
      mode: "complex",
      state: { values: { item1: { status: "ok" } } },
      photos: [{ itemId: "item1", field: "front_photo", path: "private/path", contentType: "image/jpeg" }],
    },
  });
  const calls = [];
  const restore = createChecklistCloudRestore({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    cloudApi: { async get() { return h.row; }, async list() { return [h.row]; } },
    getMode: () => "complex",
    async beforeApply() { calls.push("snapshot"); },
    async hydrateState(state, metadata, manifest) {
      calls.push(["hydrate", metadata.id, manifest.length]);
      state.values.item1.front_photo = "data:image/jpeg;base64,AQID";
      return state;
    },
    async applyState(state) { calls.push(["apply", state.values.item1.front_photo]); },
  });
  await restore.restore(ROW);
  assert.deepEqual(calls, [
    ["hydrate", ROW, 1],
    "snapshot",
    ["apply", "data:image/jpeg;base64,AQID"],
  ]);
});

test("legacy cloud records without a photo manifest restore with an empty manifest", async () => {
  const h = harness();
  let hydrated;
  const restore = createChecklistCloudRestore({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    cloudApi: { async get() { return h.row; }, async list() { return [h.row]; } },
    getMode: () => "complex",
    async hydrateState(state, metadata, manifest) { hydrated = manifest; return state; },
    async applyState() {},
  });
  await restore.restore(ROW);
  assert.deepEqual(hydrated, []);
});


test("restoring an identical state skips redundant safety snapshots", async () => {
  const h = harness();
  let snapshots = 0;
  const restore = createChecklistCloudRestore({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    cloudApi: { async get() { return h.row; }, async list() { return [h.row]; } },
    getMode: () => "complex",
    getCurrentState: () => ({ general: { number: "42" }, __cloudChecklistId: "local-only-id" }),
    async beforeApply() { snapshots += 1; },
    async applyState() {},
  });
  await restore.restore(ROW);
  assert.equal(snapshots, 0);
});

test("photo hydration failure happens before a safety snapshot is created", async () => {
  const h = harness();
  let snapshots = 0;
  const restore = createChecklistCloudRestore({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    cloudApi: { async get() { return h.row; }, async list() { return [h.row]; } },
    getMode: () => "complex",
    getCurrentState: () => ({ general: { number: "old" } }),
    async hydrateState() { throw new Error("photo restore failed"); },
    async beforeApply() { snapshots += 1; },
    async applyState() {},
  });
  await assert.rejects(restore.restore(ROW), /photo restore failed/);
  assert.equal(snapshots, 0);
});
