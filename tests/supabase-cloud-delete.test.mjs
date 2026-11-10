import test from "node:test";
import assert from "node:assert/strict";
import { deleteCloudChecklist } from "../prototype/supabase-cloud-delete.js";

const USER = "11111111-1111-4111-8111-111111111111";
const ROW = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function harness({
  currentUser = USER,
  read = { data: { id: ROW, payload: { photos: [{ path: "photo" }] } }, error: null },
  deleted = { data: { id: ROW }, error: null },
  cleanupError = null,
} = {}) {
  const calls = [];
  const queryResults = [read, deleted];
  let action = "select";
  const client = {
    from(table) {
      assert.equal(table, "checklists");
      return {
        select(columns) { calls.push(["select", columns]); return this; },
        delete() { action = "delete"; calls.push(["delete"]); return this; },
        eq(column, value) { calls.push(["eq", column, value]); return this; },
        async maybeSingle() {
          calls.push(["maybeSingle", action]);
          return queryResults.shift() ?? { data: null, error: null };
        },
      };
    },
  };
  const authApi = {
    client,
    async getCurrentIdentity() {
      calls.push(["identity"]);
      return { user: currentUser ? { id: currentUser } : null, error: null };
    },
  };
  const photoCalls = [];
  const photoSyncFactory = () => ({
    async removeManifest(manifest) {
      photoCalls.push(["removeManifest", manifest]);
      if (cleanupError) throw cleanupError;
      return manifest.length;
    },
  });
  return { authApi, calls, photoCalls, photoSyncFactory };
}

test("deletes only after checking the current identity and owner-scoped row, then removes photos", async () => {
  const h = harness();
  const result = await deleteCloudChecklist({
    authApi: h.authApi, checklistId: ROW, expectedUserId: USER,
    photoSyncFactory: h.photoSyncFactory,
  });
  assert.deepEqual(result, { id: ROW, photosRemoved: 1, photoCleanupWarning: false });
  assert.deepEqual(h.calls.filter((x) => x[0] === "eq"), [
    ["eq", "id", ROW], ["eq", "owner_id", USER],
    ["eq", "id", ROW], ["eq", "owner_id", USER],
  ]);
  assert.equal(h.calls.findIndex((x) => x[0] === "delete") > h.calls.findIndex((x) => x[0] === "maybeSingle"), true);
  assert.equal(h.photoCalls.length, 1);
});

test("rejects a changed user session before reading or deleting a checklist", async () => {
  const h = harness({ currentUser: "22222222-2222-4222-8222-222222222222" });
  await assert.rejects(
    deleteCloudChecklist({ authApi: h.authApi, checklistId: ROW, expectedUserId: USER, photoSyncFactory: h.photoSyncFactory }),
    /Сеанс пользователя изменился/,
  );
  assert.equal(h.calls.filter((x) => x[0] === "maybeSingle").length, 0);
  assert.equal(h.photoCalls.length, 0);
});

test("does not delete or remove photos when the owner-scoped row is absent", async () => {
  const h = harness({ read: { data: null, error: null } });
  await assert.rejects(
    deleteCloudChecklist({ authApi: h.authApi, checklistId: ROW, expectedUserId: USER, photoSyncFactory: h.photoSyncFactory }),
    /не найден/,
  );
  assert.equal(h.calls.some((x) => x[0] === "delete"), false);
  assert.equal(h.photoCalls.length, 0);
});

test("does not remove photos when the database delete fails", async () => {
  const h = harness({ deleted: { data: null, error: new Error("database unavailable") } });
  await assert.rejects(
    deleteCloudChecklist({ authApi: h.authApi, checklistId: ROW, expectedUserId: USER, photoSyncFactory: h.photoSyncFactory }),
    /database unavailable/,
  );
  assert.equal(h.photoCalls.length, 0);
});

test("reports photo cleanup failure without pretending that the database delete failed", async () => {
  const h = harness({ cleanupError: new Error("storage unavailable") });
  const result = await deleteCloudChecklist({
    authApi: h.authApi, checklistId: ROW, expectedUserId: USER,
    photoSyncFactory: h.photoSyncFactory,
  });
  assert.deepEqual(result, { id: ROW, photosRemoved: 0, photoCleanupWarning: true });
  assert.equal(h.calls.some((x) => x[0] === "delete"), true);
});

test("supports the legacy photoManifest property for existing cloud rows", async () => {
  const legacyPhoto = { itemId: "item1", field: "front_photo", path: "legacy/path", contentType: "image/jpeg" };
  const h = harness({
    read: { data: { id: ROW, payload: { photoManifest: [legacyPhoto] } }, error: null },
  });
  const result = await deleteCloudChecklist({
    authApi: h.authApi, checklistId: ROW, expectedUserId: USER,
    photoSyncFactory: h.photoSyncFactory,
  });
  assert.equal(result.photosRemoved, 1);
  assert.deepEqual(h.photoCalls[0], ["removeManifest", [legacyPhoto]]);
});

test("does not initialize photo storage when a checklist has no photos", async () => {
  const h = harness({ read: { data: { id: ROW, payload: { photos: [] } }, error: null } });
  const result = await deleteCloudChecklist({
    authApi: h.authApi, checklistId: ROW, expectedUserId: USER,
    photoSyncFactory: () => { throw new Error("storage should not be initialized"); },
  });
  assert.deepEqual(result, { id: ROW, photosRemoved: 0, photoCleanupWarning: false });
  assert.equal(h.photoCalls.length, 0);
});
