import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createCloudSync, CloudSyncError } from "../prototype/supabase-cloud-sync.js";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";
const ROW_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function mockClient(responses = []) {
  const calls = [];
  return {
    calls,
    from(table) {
      const call = { table, filters: [], action: null, values: null };
      calls.push(call);
      const builder = {
        select(columns) { call.columns = columns; return builder; },
        eq(column, value) { call.filters.push([column, value]); return builder; },
        order(column, options) { call.order = [column, options]; return builder; },
        insert(values) { call.action = "insert"; call.values = values; return builder; },
        update(values) { call.action = "update"; call.values = values; return builder; },
        delete() { call.action = "delete"; return builder; },
        single() { return Promise.resolve(responses.shift() ?? { data: null, error: null }); },
        maybeSingle() { return Promise.resolve(responses.shift() ?? { data: null, error: null }); },
        then(resolve, reject) { return Promise.resolve(responses.shift() ?? { data: [], error: null }).then(resolve, reject); },
      };
      return builder;
    },
  };
}

function makeSync({ user = USER_A, responses = [] } = {}) {
  const client = mockClient(responses);
  const authApi = {
    client,
    async getCurrentIdentity() {
      return user ? { user: { id: user }, profile: { role: "employee" }, error: null } : { user: null, profile: null, error: null };
    },
  };
  return { sync: createCloudSync(authApi), client };
}

test("list scopes the query to the verified Supabase user", async () => {
  const { sync, client } = makeSync({ responses: [{ data: [], error: null }] });
  assert.deepEqual(await sync.list(), []);
  assert.deepEqual(client.calls[0].filters, [["owner_id", USER_A]]);
});

test("create derives owner_id from the session, not caller input", async () => {
  const row = { id: ROW_ID, owner_id: USER_A, revision: 1 };
  const { sync, client } = makeSync({ responses: [{ data: row, error: null }] });
  await sync.create({ ownerId: USER_B, title: "Тест", equipmentType: "TT", payload: { status: "ok" } });
  assert.equal(client.calls[0].values.owner_id, USER_A);
  assert.equal(client.calls[0].values.owner_id === USER_B, false);
});

test("update uses revision compare-and-swap and owner filter", async () => {
  const row = { id: ROW_ID, owner_id: USER_A, revision: 8 };
  const { sync, client } = makeSync({ responses: [{ data: row, error: null }] });
  await sync.update({ id: ROW_ID, expectedRevision: 7, title: "Обновлён", equipmentType: "TT", payload: {} });
  assert.deepEqual(client.calls[0].filters, [
    ["id", ROW_ID],
    ["owner_id", USER_A],
    ["revision", 7],
  ]);
  assert.equal(client.calls[0].values.revision, 8);
});

test("stale revision is reported as a conflict, never silently overwritten", async () => {
  const { sync } = makeSync({ responses: [{ data: null, error: null }] });
  await assert.rejects(
    sync.update({ id: ROW_ID, expectedRevision: 1, title: "X", equipmentType: "TT", payload: {} }),
    (error) => error instanceof CloudSyncError && error.code === "REVISION_CONFLICT",
  );
});

test("delete scopes by both record id and verified owner", async () => {
  const { sync, client } = makeSync({ responses: [{ data: { id: ROW_ID }, error: null }] });
  assert.equal(await sync.remove(ROW_ID), true);
  assert.deepEqual(client.calls[0].filters, [["id", ROW_ID], ["owner_id", USER_A]]);
});

test("unauthenticated calls are rejected before querying the database", async () => {
  const { sync, client } = makeSync({ user: null });
  await assert.rejects(sync.list(), (error) => error.code === "AUTH_REQUIRED");
  assert.equal(client.calls.length, 0);
});

test("invalid UUIDs and inline base64 photos are rejected before upload", async () => {
  const { sync, client } = makeSync();
  await assert.rejects(sync.update({ id: "not-a-uuid", expectedRevision: 1, payload: {} }), (error) => error.code === "INVALID_INPUT");
  await assert.rejects(sync.create({ payload: { photo: "data:image/png;base64,AAAA" } }), (error) => error.code === "INLINE_PHOTO_UNSUPPORTED");
  assert.equal(client.calls.length, 0);
});

test("Supabase errors are surfaced without pretending a write succeeded", async () => {
  const { sync } = makeSync({ responses: [{ data: null, error: { message: "denied" } }] });
  await assert.rejects(sync.create({ payload: {} }), (error) => error.code === "CLOUD_REQUEST_FAILED");
});


test("database migration makes checklist ownership immutable and revision monotonic", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/20261102093000_checklist_revision_guard.sql", import.meta.url),
    "utf8",
  );
  assert.match(sql, /new\.owner_id is distinct from old\.owner_id/);
  assert.match(sql, /new\.revision is distinct from old\.revision \+ 1/);
  assert.match(sql, /new\.updated_at := pg_catalog\.now\(\)/);
  assert.match(sql, /before insert or update on public\.checklists/i);
  assert.match(sql, /for each row execute function public\.enforce_checklist_revision\(\)/i);
});

test("get scopes cloud record lookup to id and verified owner", async () => {
  const row = { id: ROW_ID, owner_id: USER_A, revision: 2 };
  const { sync, client } = makeSync({ responses: [{ data: row, error: null }] });
  assert.equal(await sync.get(ROW_ID), row);
  assert.deepEqual(client.calls[0].filters, [["id", ROW_ID], ["owner_id", USER_A]]);
});

test("get reports inaccessible or missing records without exposing other owners", async () => {
  const { sync } = makeSync({ responses: [{ data: null, error: null }] });
  await assert.rejects(sync.get(ROW_ID), (error) => error.code === "NOT_FOUND");
});
