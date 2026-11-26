import test from "node:test";
import assert from "node:assert/strict";
import { buildOfflineCloudEnvelope, validateOfflineCloudEnvelope, OFFLINE_CHECKLIST_MODES } from "../prototype/offline-checklist-schema.js";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const state = {
  general: { type: "2ЭС5К", number: "746", date: "2026-11-04", depot: "ТЧЭ-10" },
  values: { motor: { inspected: true, note: "Осмотрен" } },
  selectedSections: ["Секция 1"], selected: [], changeLog: [{ at: "2026-11-04", text: "Проверка" }],
};

test("all five built-in modes retain the complete state in a versioned envelope", () => {
  for (const mode of Object.keys(OFFLINE_CHECKLIST_MODES)) {
    const envelope = buildOfflineCloudEnvelope({ mode, state, cloudId: ID });
    const cloud = validateOfflineCloudEnvelope(envelope, ID);
    assert.equal(cloud.equipmentType, mode);
    assert.equal(cloud.payload.schemaVersion, 1);
    assert.deepEqual(cloud.payload.state, state);
    assert.equal(cloud.title.includes("746"), true);
  }
});

test("update envelope carries only a confirmed positive cloud revision", () => {
  const value = buildOfflineCloudEnvelope({ mode: "tt", state, cloudId: ID, expectedRevision: 9 });
  assert.equal(value.cloud.expectedRevision, 9);
  assert.throws(() => buildOfflineCloudEnvelope({ mode: "tt", state, cloudId: ID, expectedRevision: 0 }), /ревизия/i);
});

test("rejects unknown mode, malformed state and mismatched entity id", () => {
  assert.throws(() => buildOfflineCloudEnvelope({ mode: "other", state, cloudId: ID }), e => e.code === "UNSUPPORTED_CHECKLIST_MODE");
  assert.throws(() => buildOfflineCloudEnvelope({ mode: "tt", state: { values: {} }, cloudId: ID }), /general и values/);
  const value = buildOfflineCloudEnvelope({ mode: "tt", state, cloudId: ID });
  assert.throws(() => validateOfflineCloudEnvelope(value, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"), /не совпадает/);
});

test("does not mutate the live runtime state", () => {
  const before = JSON.stringify(state);
  buildOfflineCloudEnvelope({ mode: "complex", state, cloudId: ID });
  assert.equal(JSON.stringify(state), before);
});
