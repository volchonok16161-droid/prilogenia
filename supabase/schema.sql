-- Supabase prototype schema. Review before applying to any project.
-- Each checklist belongs to exactly one authenticated user.
-- Do not place service_role keys in browser code.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'employee' check (role in ('developer', 'admin', 'employee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Новый чек-лист',
  equipment_type text not null default '',
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checklists_owner_updated_idx
  on public.checklists (owner_id, updated_at desc);

alter table public.profiles enable row level security;
alter table public.checklists enable row level security;

-- A user can read only their own profile. Profile role is intentionally not
-- client-writable: account/role provisioning must happen in a trusted server function.
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "checklists_select_owner" on public.checklists;
create policy "checklists_select_owner"
  on public.checklists for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "checklists_insert_owner" on public.checklists;
create policy "checklists_insert_owner"
  on public.checklists for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "checklists_update_owner" on public.checklists;
create policy "checklists_update_owner"
  on public.checklists for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "checklists_delete_owner" on public.checklists;
create policy "checklists_delete_owner"
  on public.checklists for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Intentionally no client INSERT/UPDATE/DELETE policy on profiles.
-- Never trust a role value supplied by the browser.
-- Provision profiles and create Auth users through a trusted Edge Function
-- using the server-side service_role secret, or a similarly protected backend.
-- The service_role secret must never be embedded in HTML/JS or committed to Git.


-- Database-side protection for checklist ownership and revision ordering.
-- Enforce immutable ownership and monotonic revisions for checklist rows.
-- Apply only after reviewing the migration against the target Supabase project.

create or replace function public.enforce_checklist_revision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.revision := 1;
    new.updated_at := coalesce(new.created_at, pg_catalog.now());
    return new;
  end if;

  if new.owner_id is distinct from old.owner_id then
    raise exception 'checklist owner_id is immutable'
      using errcode = '42501';
  end if;

  if new.revision is distinct from old.revision + 1 then
    raise exception 'checklist revision must increase by exactly one'
      using errcode = '22023';
  end if;

  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists checklists_revision_guard on public.checklists;
create trigger checklists_revision_guard
before insert or update on public.checklists
for each row execute function public.enforce_checklist_revision();
