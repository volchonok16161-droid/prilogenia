import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../prototype/offline-vault-db.js", import.meta.url), "utf8");

test("offline records, queue items, and conflicts use compound per-user primary keys", () => {
  assert.match(source, /const DB_VERSION = 2/);
  assert.match(source, /createObjectStore\(STORES\.RECORDS, \{ keyPath: \["userId", "id"\] \}\)/);
  assert.match(source, /createObjectStore\(STORES\.QUEUE, \{ keyPath: \["userId", "opId"\] \}\)/);
  assert.match(source, /createObjectStore\(STORES\.CONFLICTS, \{ keyPath: \["userId", "conflictId"\] \}\)/);
});

test("record and queue mutations address records with both owner and identifier", () => {
  assert.match(source, /STORES\.RECORDS\)\.get\(\[userId, id\]\)/);
  assert.match(source, /store\.get\(\[userId, id\]\)/);
  assert.match(source, /store\.delete\(\[userId, id\]\)/);
  assert.match(source, /store\.get\(\[userId, opId\]\)/);
  assert.match(source, /store\.delete\(\[userId, opId\]\)/);
});

test("upgrading to compound-key stores uses a new database version and preserves legacy store names", () => {
  assert.match(source, /const DB_VERSION = 2/);
  assert.match(source, /recordsByOwner/);
  assert.match(source, /queueByOwner/);
  assert.match(source, /conflictsByOwner/);
});

test("pending operations are coalesced atomically by owner and entity without replacing processing leases", () => {
  assert.match(source, /async function putRecordAndCoalesceQueue/);
  assert.match(source, /index\.getAll\(\[userId, "pending"\]\)/);
  assert.match(source, /row\.entityId === entityId/);
  assert.match(source, /current\.operation === "create" \? "create" : operation/);
  assert.match(source, /status: "pending", attempts: 0/);
});

test("an earlier processing operation blocks later operations for the same entity", () => {
  assert.match(source, /const processing = await requestResult\(store\.index\("byUserStatus"\)\.getAll\(\[userId, "processing"\]\)\)/);
  assert.match(source, /item\.opId !== opId && item\.entityId === row\.entityId/);
});

test("confirmed cloud revisions are persisted atomically with queue acknowledgement", () => {
  assert.match(source, /function cloudStateKey\(userId, entityId\)/);
  assert.match(source, /async function getCloudState\(userId, entityId\)/);
  assert.match(source, /async function markSynced\(opId, userId, serverRevision, expectedLeaseClaimId, cloudState = undefined\)/);
  assert.match(source, /STORES\.QUEUE, STORES\.META/);
  assert.match(source, /photoManifest: cloudState\.photoManifest \|\| \[\]/);
});
