import test from "node:test";
import assert from "node:assert/strict";
import { createOfflineChecklistStore } from "../prototype/offline-checklist-store.js";

const USER = "11111111-1111-4111-8111-111111111111";

test("a transient IndexedDB write failure does not poison a later explicit retry", async () => {
  const records = new Map();
  const queue = [];
  let writeAttempts = 0;
  const database = {
    async putRecordAndEnqueue(value) {
      writeAttempts += 1;
      if (writeAttempts === 1) throw new Error("temporary IndexedDB failure");
      records.set(value.id, {
        id: value.id, userId: value.userId, kind: value.kind,
        encrypted: value.encrypted, updatedAt: value.updatedAt,
      });
      queue.push(value);
      return { id: value.id, opId: value.opId };
    },
    async getRecord(id, userId) {
      const row = records.get(id);
      return row?.userId === userId ? row : null;
    },
    async listRecords(userId) {
      return [...records.values()].filter(row => row.userId === userId);
    },
    async listPending(userId) {
      return queue.filter(row => row.userId === userId && row.status === "pending");
    },
    async listConflicts() { return []; },
  };
  const vault = {
    async encrypt(value) {
      return { version: 1, iv: "test-iv", ciphertext: JSON.stringify(value) };
    },
    async decrypt(value) { return JSON.parse(value.ciphertext); },
  };
  const store = createOfflineChecklistStore({
    database, vault, userId: USER, idFactory: () => "retry-op",
    now: () => "2026-11-05T00:00:00.000Z",
  });
  const input = { id: "checklist-retry", value: { revision: 2 } };

  await assert.rejects(store.saveChecklist(input), /temporary IndexedDB failure/);
  assert.equal(records.size, 0);
  assert.equal(queue.length, 0);

  const result = await store.saveChecklist(input);
  assert.equal(result.status, "pending-sync");
  assert.equal(writeAttempts, 2);
  assert.equal(queue.length, 1);
  assert.deepEqual((await store.readChecklist(input.id)).value, input.value);
});
