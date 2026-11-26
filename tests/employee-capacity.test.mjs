import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const admin = await readFile(new URL("../supabase/functions/account-admin/index.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/20261111120000_atomic_employee_capacity.sql", import.meta.url), "utf8");

test("employee capacity migration creates a private reservation table", () => {
  assert.match(migration, /create table if not exists public\.employee_capacity_reservations/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on table public\.employee_capacity_reservations from public, anon, authenticated/);
  assert.match(migration, /grant all on table public\.employee_capacity_reservations to service_role/);
});

test("employee capacity reservations serialize quota checks and enforce the cap", () => {
  assert.match(migration, /pg_advisory_xact_lock\(hashtext\('public\.employee_capacity_reservations'\)\)/);
  assert.match(migration, /employee_count \+ reservation_count >= 15/);
  assert.match(migration, /expires_at timestamptz not null default \(now\(\) \+ interval '10 minutes'\)/);
  assert.match(migration, /delete from public\.employee_capacity_reservations\s+where expires_at <= now\(\)/);
  assert.match(migration, /\(auth\.jwt\(\) ->> 'role'\) IS DISTINCT FROM 'service_role'/);
});

test("create, invite and assistant promotion reserve capacity before writing", () => {
  const create = admin.indexOf('if (body.action === "create_named_employee")');
  const invite = admin.indexOf('if (body.action === "invite_employee")');
  const role = admin.indexOf('if (body.action === "set_employee_role")');
  assert.ok(create >= 0 && invite > create && role > invite);
  for (const [start, end] of [[create, invite], [invite, role], [role, admin.indexOf('if (body.action === "delete_employee")')]]) {
    const block = admin.slice(start, end);
    assert.match(block, /reserveEmployeeSlot\(\)/);
    assert.match(block, /Достигнут лимит в 15 сотрудников/);
  }
  assert.match(admin, /if \(role === "employee"\) \{\s*const reservation = await reserveEmployeeSlot\(\)/);
});

test("capacity reservations are released on success and handled failures", () => {
  assert.match(admin, /releaseEmployeeSlot\(reservation\.reservationId\)/);
  assert.match(admin, /releaseEmployeeSlot\(reservationId\)/);
  assert.match(admin, /releaseError/);
  assert.match(admin, /освобождение резервации не подтвердилось/);
});

test("employee username validation rejects actual whitespace", () => {
  assert.match(admin, /normalizedUsername\.includes\("@"\) \|\| \/\\s\/\.test\(username\)/);
  assert.doesNotMatch(admin, /\/\\\\s\/\.test\(username\)/);
});
