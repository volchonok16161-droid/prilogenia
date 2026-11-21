import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../supabase/migrations/20261104105400_checklists_payload_max_512kb.sql", import.meta.url), "utf8");

test("checklists payload size migration preflights existing rows without exposing payload contents", () => {
  assert.match(migration, /octet_length\(payload::text\) > 524288/);
  assert.match(migration, /count\(\*\)/);
  assert.match(migration, /max\(octet_length\(payload::text\)\)/);
  assert.match(migration, /raise exception/);
  assert.doesNotMatch(migration, /select\s+payload\s+from/i);
});

test("checklists payload size migration adds and validates a 512 KiB database constraint", () => {
  assert.match(migration, /add constraint checklists_payload_max_512kb/i);
  assert.match(migration, /check \(octet_length\(payload::text\) <= 524288\)/i);
  assert.match(migration, /not valid/i);
  assert.match(migration, /validate constraint checklists_payload_max_512kb/i);
});
