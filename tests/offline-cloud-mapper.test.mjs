import test from "node:test";
import assert from "node:assert/strict";
import { mapOfflineChecklistOperation } from "../prototype/offline-cloud-mapper.js";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const base = { id: ID, title: "Смена", equipmentType: "TT", payload: { checks: [] } };

test("maps an explicit cloud envelope to create", () => {
  const result = mapOfflineChecklistOperation(
    { entityId: ID, operation: "create" }, { cloud: base },
  );
  assert.equal(result.method, "create");
  assert.deepEqual(result.input, base);
});

test("maps update with the last confirmed server revision", () => {
  const result = mapOfflineChecklistOperation(
    { entityId: ID, operation: "update" },
    { cloud: { ...base, expectedRevision: 7 } },
  );
  assert.equal(result.method, "update");
  assert.equal(result.input.expectedRevision, 7);
});

test("maps queued delete to the cloud remove operation", () => {
  assert.deepEqual(
    mapOfflineChecklistOperation({ entityId: ID, operation: "delete" }, null),
    { method: "remove", id: ID },
  );
});

test("fails closed when legacy snapshots have no explicit cloud envelope", () => {
  assert.throws(
    () => mapOfflineChecklistOperation({ entityId: ID, operation: "update" }, { title: "legacy" }),
    (error) => error.code === "INVALID_OFFLINE_CLOUD_SNAPSHOT",
  );
});

test("rejects entity id mismatch rather than updating another checklist", () => {
  assert.throws(
    () => mapOfflineChecklistOperation(
      { entityId: ID, operation: "create" },
      { cloud: { ...base, id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" } },
    ),
    /match the queued entity id/,
  );
});

test("rejects update without a confirmed revision", () => {
  assert.throws(
    () => mapOfflineChecklistOperation(
      { entityId: ID, operation: "update" }, { cloud: base },
    ),
    /last confirmed positive cloud revision/,
  );
});

test("does not misroute photo or unknown operations as checklist updates", () => {
  assert.throws(
    () => mapOfflineChecklistOperation({ entityId: ID, operation: "photo-upload" }, { cloud: base }),
    /not a checklist CRUD operation/,
  );
});
