import test from "node:test";
import assert from "node:assert/strict";
import { mapOfflineChecklistOperation, createOfflineChecklistOperationMapper } from "../prototype/offline-cloud-mapper.js";
import { buildOfflineCloudEnvelope } from "../prototype/offline-checklist-schema.js";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const state = { general: { type: "2ЭС5К", number: "746" }, values: { item: { checked: true, comment: "OK" } }, selectedSections: ["A"], changeLog: [] };

test("maps an explicit versioned checklist envelope to create", () => {
  const value = buildOfflineCloudEnvelope({ mode: "complex", state, cloudId: ID });
  const result = mapOfflineChecklistOperation({ entityId: ID, operation: "create" }, value);
  assert.equal(result.method, "create");
  assert.deepEqual(result.input.payload.state, state);
  assert.equal(result.input.payload.mode, "complex");
});

test("maps update only with the last confirmed cloud revision", () => {
  const value = buildOfflineCloudEnvelope({ mode: "tt", state, cloudId: ID, expectedRevision: 7 });
  const result = mapOfflineChecklistOperation({ entityId: ID, operation: "update" }, value);
  assert.equal(result.method, "update");
  assert.equal(result.input.expectedRevision, 7);
});

test("maps delete to the cloud remove operation without requiring a local snapshot", () => {
  assert.deepEqual(mapOfflineChecklistOperation({ entityId: ID, operation: "delete" }, null), { method: "remove", id: ID });
});

test("fails closed for legacy snapshots without a cloud envelope", () => {
  assert.throws(() => mapOfflineChecklistOperation({ entityId: ID, operation: "update" }, { title: "legacy" }), e => e.code === "INVALID_OFFLINE_CLOUD_SNAPSHOT");
});

test("rejects mismatched ids, unknown operations and unconfirmed revisions", () => {
  const value = buildOfflineCloudEnvelope({ mode: "tt", state, cloudId: ID });
  assert.throws(() => mapOfflineChecklistOperation({ entityId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", operation: "create" }, value), /не совпадает/);
  assert.throws(() => mapOfflineChecklistOperation({ entityId: ID, operation: "update" }, value), /revision/);
  assert.throws(() => mapOfflineChecklistOperation({ entityId: ID, operation: "photo-upload" }, value), /not a checklist CRUD/);
});

test("photo mapper uploads inline photos to private Storage and stores a manifest", async () => {
  const stateWithPhoto = structuredClone(state);
  stateWithPhoto.values.item.photo_photo = "data:image/jpeg;base64,AA==";
  const uploaded = [];
  const mapper = createOfflineChecklistOperationMapper({
    photoSync: {
      async uploadState(args) {
        uploaded.push(args);
        return { uploaded: 1, manifest: [{ itemId: "item", field: "photo_photo", path: "user/checklist/1/photo", contentType: "image/jpeg" }] };
      },
      async removeManifest(manifest) { uploaded.push({ removed: manifest }); },
    },
  });
  const envelope = buildOfflineCloudEnvelope({ mode: "tt", state: stateWithPhoto, cloudId: ID });
  const request = await mapper({ entityId: ID, operation: "create" }, envelope);
  assert.equal(uploaded.length, 1);
  assert.equal(uploaded[0].revision, 1);
  assert.equal(request.input.payload.photoManifest.length, 1);
  assert.equal(request.input.payload.state.values.item.photo_photo, undefined);
  assert.equal(stateWithPhoto.values.item.photo_photo, "data:image/jpeg;base64,AA==");
  await request.rollback();
  assert.equal(uploaded.length, 2);
});

test("update schedules only superseded photo objects for cleanup", async () => {
  const previous = { photoManifest: [
    { itemId: "item", field: "old_photo", path: "old-object" },
    { itemId: "item", field: "same_photo", path: "kept-object" },
  ] };
  const mapper = createOfflineChecklistOperationMapper({
    photoSync: {
      async uploadState() {
        return { uploaded: 1, manifest: [{ itemId: "item", field: "same_photo", path: "kept-object", contentType: "image/jpeg" }] };
      },
      async removeManifest() {},
    },
  });
  const value = buildOfflineCloudEnvelope({ mode: "tt", state, cloudId: ID, expectedRevision: 4 });
  const request = await mapper({ entityId: ID, operation: "update" }, value, previous);
  assert.deepEqual(request.cleanupManifest.map((entry) => entry.path), ["old-object"]);
});

test("delete carries the last confirmed photo manifest for post-delete cleanup", () => {
  const manifest = [{ itemId: "item", field: "photo_photo", path: "old-object" }];
  const request = mapOfflineChecklistOperation(
    { entityId: ID, operation: "delete" }, null, { photoManifest: manifest },
  );
  assert.deepEqual(request.cleanupManifest, manifest);
});
