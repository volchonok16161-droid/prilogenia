import test from "node:test";
import assert from "node:assert/strict";
import { createChecklistPhotoSync } from "../prototype/supabase-cloud-photos.js";

const USER = "11111111-1111-4111-8111-111111111111";
const ROW = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PHOTO = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function harness({ userId = USER } = {}) {
  const files = new Map();
  const calls = [];
  const removed = [];
  const storageApi = {
    from(bucket) {
      assert.equal(bucket, "checklist-photos");
      return {
        async upload(path, blob, options) {
          calls.push({ action: "upload", path, options });
          if (files.has(path)) return { data: null, error: new Error("duplicate") };
          files.set(path, blob);
          return { data: { path }, error: null };
        },
        async download(path) {
          calls.push({ action: "download", path });
          const blob = files.get(path);
          return blob
            ? { data: blob, error: null }
            : { data: null, error: new Error("not found") };
        },
        async remove(paths) {
          removed.push(...paths);
          paths.forEach((path) => files.delete(path));
          calls.push({ action: "remove", paths });
          return { data: paths.map((name) => ({ name })), error: null };
        },
      };
    },
  };
  const sync = createChecklistPhotoSync({
    authApi: {
      async getCurrentIdentity() {
        return { user: userId ? { id: userId } : null, error: null };
      },
    },
    storageApi,
    idFactory: () => PHOTO,
  });
  return { sync, files, calls, removed };
}

test("uploads checklist photos to private user/checklist/revision paths and returns a manifest", async () => {
  const h = harness();
  const state = { general: { type: "TT" }, values: { item1: {
    front_photo: "data:image/jpeg;base64,AQID",
    status: "ok",
  } } };
  const result = await h.sync.uploadState({ state, checklistId: ROW, revision: 4 });
  assert.equal(result.uploaded, 1);
  assert.equal(result.manifest.length, 1);
  assert.equal(result.manifest[0].itemId, "item1");
  assert.equal(result.manifest[0].field, "front_photo");
  assert.match(result.manifest[0].path, new RegExp("^" + USER + "/" + ROW + "/4/item1/front_photo-"));
  assert.equal(h.files.size, 1);
  assert.deepEqual([...new Uint8Array(await [...h.files.values()][0].arrayBuffer())], [1, 2, 3]);
  assert.equal(state.values.item1.front_photo, "data:image/jpeg;base64,AQID");
  assert.equal(h.calls[0].options.upsert, false);
});

test("restores a photo into a cloned checklist without mutating the original state", async () => {
  const h = harness();
  const state = { values: { item1: { status: "ok" } } };
  const uploaded = await h.sync.uploadState({
    state: { values: { item1: { front_photo: "data:image/png;base64,BAUG" } } },
    checklistId: ROW,
    revision: 2,
  });
  const result = await h.sync.restoreState({
    state,
    checklistId: ROW,
    manifest: uploaded.manifest,
  });
  assert.equal(result.restored, 1);
  assert.equal(result.state.values.item1.front_photo, "data:image/png;base64,BAUG");
  assert.equal(state.values.item1.front_photo, undefined);
});

test("rejects a manifest path outside the current user's checklist before download", async () => {
  const h = harness();
  await assert.rejects(
    h.sync.restoreState({
      state: { values: { item1: {} } },
      checklistId: ROW,
      manifest: [{
        itemId: "item1",
        field: "front_photo",
        path: "22222222-2222-4222-8222-222222222222/" + ROW + "/1/item1/front_photo-" + PHOTO,
        contentType: "image/jpeg",
      }],
    }),
    (error) => error.code === "INVALID_MANIFEST",
  );
  assert.equal(h.calls.length, 0);
});

test("rejects unsupported image types and oversized data before uploading", async () => {
  const h = harness();
  await assert.rejects(
    h.sync.uploadState({
      state: { values: { item1: { front_photo: "data:image/svg+xml;base64,PHN2Zz4=" } } },
      checklistId: ROW,
      revision: 1,
    }),
    (error) => error.code === "INVALID_PHOTO",
  );
  const large = "A".repeat(14 * 1024 * 1024);
  await assert.rejects(
    h.sync.uploadState({
      state: { values: { item1: { front_photo: "data:image/jpeg;base64," + large } } },
      checklistId: ROW,
      revision: 1,
    }),
    (error) => error.code === "PHOTO_SIZE_LIMIT",
  );
  assert.equal(h.files.size, 0);
});

test("requires an authenticated Supabase identity", async () => {
  const h = harness({ userId: null });
  await assert.rejects(
    h.sync.uploadState({
      state: { values: {} },
      checklistId: ROW,
      revision: 1,
    }),
    (error) => error.code === "AUTH_REQUIRED",
  );
});


test("removes only validated objects under the authenticated user's checklist folder", async () => {
  const h = harness();
  const uploaded = await h.sync.uploadState({
    state: { values: { item1: { front_photo: "data:image/jpeg;base64,AQID" } } },
    checklistId: ROW,
    revision: 1,
  });
  assert.equal(await h.sync.removeManifest(uploaded.manifest), 1);
  assert.equal(h.files.size, 0);
  assert.equal(h.removed.length, 1);
  await assert.rejects(
    h.sync.removeManifest([{
      path: "22222222-2222-4222-8222-222222222222/" + ROW + "/1/item1/front_photo-" + PHOTO,
    }]),
    (error) => error.code === "INVALID_MANIFEST",
  );
});

test("partial photo upload failure removes files already uploaded in the same batch", async () => {
  const files = new Map();
  const calls = [];
  let count = 0;
  const storageApi = {
    from() {
      return {
        async upload(path, blob) {
          count += 1;
          if (count === 2) return { data: null, error: new Error("second upload failed") };
          files.set(path, blob);
          return { data: { path }, error: null };
        },
        async remove(paths) {
          calls.push(["remove", paths.length]);
          paths.forEach((path) => files.delete(path));
          return { data: [], error: null };
        },
      };
    },
  };
  const sync = createChecklistPhotoSync({
    authApi: { async getCurrentIdentity() { return { user: { id: USER }, error: null }; } },
    storageApi,
    idFactory: () => PHOTO,
  });
  await assert.rejects(
    sync.uploadState({
      state: { values: { item1: {
        front_photo: "data:image/jpeg;base64,AQID",
        rear_photo: "data:image/jpeg;base64,BAUG",
      } } },
      checklistId: ROW,
      revision: 2,
    }),
    (error) => error.code === "STORAGE_REQUEST_FAILED",
  );
  assert.equal(files.size, 0);
  assert.deepEqual(calls, [["remove", 1]]);
});
