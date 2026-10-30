-- RLS isolation smoke test for the TEST Supabase project only.
-- Uses the two existing test employee Auth IDs created for project fecigiwjtbtabnsfsdym.
-- All fixture rows are rolled back. Do not run against production.
--
-- Expected:
--   A sees exactly 1 checklist (its own marker), never B's.
--   A cannot insert a checklist owned by B (RLS error).
--   A cannot change ownership of its own row to B (RLS error).
--   A cannot delete B's row (0 rows affected; B row remains).
--   authenticated has no UPDATE privilege on profiles.
--
-- Run the whole script in Supabase SQL Editor. If a deliberate RLS violation
-- aborts execution, that is an expected security rejection. In that case run
-- the remaining test sections separately, or use the result of the failing
-- statement as confirmation of the relevant negative test.

begin;

-- Test-only fixture rows. SQL Editor runs this as the database owner.
insert into public.checklists
  (id, owner_id, title, equipment_type, payload, revision)
values
  ('a1000000-0000-4000-8000-000000000001',
   '779a5cfa-d01d-4c5f-845b-cd1a066dcfc4',
   'RLS TEST A - TEMP', 'test', '{"marker":"EMPLOYEE_A_ONLY"}'::jsonb, 1),
  ('b1000000-0000-4000-8000-000000000002',
   '7b66bb74-5d53-4847-be4b-0f100671f797',
   'RLS TEST B - TEMP', 'test', '{"marker":"EMPLOYEE_B_ONLY"}'::jsonb, 1)
on conflict (id) do update
set owner_id = excluded.owner_id,
    title = excluded.title,
    equipment_type = excluded.equipment_type,
    payload = excluded.payload,
    revision = excluded.revision;

-- Switch to the authenticated database role and emulate Employee A's JWT subject.
set local role authenticated;
select set_config('request.jwt.claim.sub',
  '779a5cfa-d01d-4c5f-845b-cd1a066dcfc4', true);
select set_config('request.jwt.claims',
  '{"sub":"779a5cfa-d01d-4c5f-845b-cd1a066dcfc4","role":"authenticated"}', true);

-- TEST 1: should return only A's marker; B's row must not appear.
select id, owner_id, payload
from public.checklists
where id in (
  'a1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000002'
)
order by id;

-- TEST 2: should report false (authenticated cannot update profiles/roles).
select
  has_table_privilege('authenticated', 'public.profiles', 'UPDATE')
    as authenticated_can_update_profiles;

-- TEST 3: should affect 0 rows (RLS hides B's row from A).
delete from public.checklists
where id = 'b1000000-0000-4000-8000-000000000002'
returning id, owner_id;

-- Return to owner for fixture verification, then roll back all test rows.
reset role;
select id, owner_id, payload
from public.checklists
where id in (
  'a1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000002'
)
order by id;

rollback;

-- Separate negative tests (run one at a time inside a transaction):
--
-- A must NOT be able to insert a row for B:
--   begin;
--   set local role authenticated;
--   select set_config('request.jwt.claim.sub','779a5cfa-d01d-4c5f-845b-cd1a066dcfc4',true);
--   insert into public.checklists(owner_id,title)
--   values ('7b66bb74-5d53-4847-be4b-0f100671f797','MUST FAIL');
--   rollback;
--
-- A must NOT be able to transfer its own row to B:
--   begin;
--   set local role authenticated;
--   select set_config('request.jwt.claim.sub','779a5cfa-d01d-4c5f-845b-cd1a066dcfc4',true);
--   update public.checklists
--   set owner_id='7b66bb74-5d53-4847-be4b-0f100671f797'
--   where id='a1000000-0000-4000-8000-000000000001';
--   rollback;
