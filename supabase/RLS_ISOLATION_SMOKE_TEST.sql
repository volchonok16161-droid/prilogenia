-- TEMPLATE ONLY: RLS isolation smoke test for a newly created, isolated TEST Supabase project.
-- This file was previously tied to Auth IDs in the Production project. Those IDs
-- have been removed. The UUIDs below are deliberately non-existent placeholders.
-- Do NOT run this template in Production or until a separate test project exists.
--
-- Before any execution:
--   1. Verify the project ref in the Supabase Dashboard URL is NOT
--      fecigiwjtbtabnsfsdym (Production).
--   2. Create two disposable Auth users in that separate test project.
--   3. Replace both placeholder UUIDs below with those test users' Auth UUIDs.
--   4. Review the target database and confirm no employee/customer data is present.
-- This SQL cannot independently identify the Supabase project it is connected to.
-- All fixture rows are wrapped in a transaction and rolled back on normal completion.
--
-- Expected:
--   A sees exactly 1 checklist (its own marker), never B's.
--   A cannot insert a checklist owned by B (RLS error).
--   A cannot change ownership of its own row to B (RLS error).
--   A cannot delete B's row (0 rows affected; B row remains).
--   authenticated has no UPDATE privilege on profiles.
--
-- Do not execute until the separate test backend has been provisioned and reviewed.

begin;

-- Test-only fixture rows. SQL Editor runs this as the database owner.
insert into public.checklists
  (id, owner_id, title, equipment_type, payload, revision)
values
  ('a1000000-0000-4000-8000-000000000001',
   '00000000-0000-4000-8000-00000000000a',
   'RLS TEST A - TEMP', 'test', '{"marker":"EMPLOYEE_A_ONLY"}'::jsonb, 1),
  ('b1000000-0000-4000-8000-000000000002',
   '00000000-0000-4000-8000-00000000000b',
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
  '00000000-0000-4000-8000-00000000000a', true);
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);

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
--   select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000000a',true);
--   insert into public.checklists(owner_id,title)
--   values ('00000000-0000-4000-8000-00000000000b','MUST FAIL');
--   rollback;
--
-- A must NOT be able to transfer its own row to B:
--   begin;
--   set local role authenticated;
--   select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-00000000000a',true);
--   update public.checklists
--   set owner_id='00000000-0000-4000-8000-00000000000b'
--   where id='a1000000-0000-4000-8000-000000000001';
--   rollback;
