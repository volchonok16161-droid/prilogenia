import test from "node:test";
import assert from "node:assert/strict";
import { mapOfflineChecklistOperation } from "../prototype/offline-cloud-mapper.js";
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
