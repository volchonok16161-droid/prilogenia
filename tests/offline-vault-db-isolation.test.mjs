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
  assert.match(source, /async function markSynced\(opId, userId, serverRevision, expectedLeaseClaimId, cloudState = undefined, cleanupJob = null\)/);
  assert.match(source, /STORES\.QUEUE, STORES\.META/);
  assert.match(source, /photoManifest: cloudState\.photoManifest \|\| \[\]/);
});

test("photo cleanup job is committed atomically with cloud acknowledgement", () => {
  assert.match(source, /async function markSynced\([\s\S]*?cleanupJob = null\)/);
  assert.match(source, /photoCleanupKey\(userId, cleanupJob\.cleanupId\)/);
  assert.match(source, /status: "pending", attempts: 0/);
  assert.match(source, /async function listPhotoCleanups/);
  assert.match(source, /async function claimPhotoCleanup/);
  assert.match(source, /async function updatePhotoCleanup/);
  assert.match(source, /async function completePhotoCleanup/);
});


test("failed atomic IndexedDB writes abort and drain the transaction completion promise", () => {
  assert.match(source, /catch \(error\) \{[\s\S]*?try \{ tx\.abort\(\); \} catch \{\}[\s\S]*?try \{ await done; \} catch \{\}[\s\S]*?throw error;/);
  assert.match(source, /await requestResult\(onlyIfAbsent \? records\.add\(record\) : records\.put\(record\)\);[\s\S]*?await requestResult\(tx\.objectStore\(STORES\.QUEUE\)\.add/);
  assert.match(source, /await requestResult\(queue\.add\(/);
});


test("device identity initialization uses an atomic metadata get-or-create", () => {
  assert.match(source, /async function getOrCreateMeta\(key, createValue\)/);
  assert.match(source, /const existing = await requestResult\(store\.get\(key\)\)/);
  assert.match(source, /await requestResult\(store\.add\(\{ key, value \}\)\)/);
  assert.match(source, /getOrCreateMeta, getCloudState/);
});
