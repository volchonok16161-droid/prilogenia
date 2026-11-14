-- Reject revoked or deleted Supabase sessions at the RLS boundary.
-- Stage in Git only. Apply and validate ONLY in a separate isolated Supabase test project.
-- This does not invalidate a JWT cryptographically; it makes RLS policies consult auth.sessions.
-- Keep this migration out of Production until the full policy matrix passes in isolation.

create or replace function public.auth_session_is_active()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, auth
as $$
  select coalesce(
    (auth.jwt() ->> 'session_id') is not null
    and (auth.jwt() ->> 'sub') is not null
    and exists (
      select 1
      from auth.sessions s
      where s.id = (auth.jwt() ->> 'session_id')::uuid
        and s.user_id = (auth.jwt() ->> 'sub')::uuid
        and (s.not_after is null or s.not_after > pg_catalog.now())
    ),
    false
  );
$$;

revoke all on function public.auth_session_is_active() from public, anon;
grant execute on function public.auth_session_is_active() to authenticated;

-- Service-role-only variant for Edge Functions, which receive the caller's
-- verified session_id but use a separate service-role client for database access.
create or replace function public.is_auth_session_active_for_user(
  p_session_id uuid,
  p_user_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, auth
as $$
begin
  if (auth.jwt() ->> 'role') is distinct from 'service_role' then
    raise insufficient_privilege using message = 'service_role is required';
  end if;
  if p_session_id is null or p_user_id is null then
    return false;
  end if;
  return exists (
    select 1
    from auth.sessions s
    where s.id = p_session_id
      and s.user_id = p_user_id
      and (s.not_after is null or s.not_after > pg_catalog.now())
  );
end;
$$;

revoke all on function public.is_auth_session_active_for_user(uuid, uuid) from public, anon, authenticated;
grant execute on function public.is_auth_session_active_for_user(uuid, uuid) to service_role;

-- Current live policies were read-only inspected on 2026-11-11.
drop policy if exists checklists_select_owner on public.checklists;
create policy checklists_select_owner on public.checklists
  for select to authenticated
  using (owner_id = (select auth.uid()) and (select public.auth_session_is_active()));

drop policy if exists checklists_insert_owner on public.checklists;
create policy checklists_insert_owner on public.checklists
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and (select public.auth_session_is_active()));

drop policy if exists checklists_update_owner on public.checklists;
create policy checklists_update_owner on public.checklists
  for update to authenticated
  using (owner_id = (select auth.uid()) and (select public.auth_session_is_active()))
  with check (owner_id = (select auth.uid()) and (select public.auth_session_is_active()));

drop policy if exists checklists_delete_owner on public.checklists;
create policy checklists_delete_owner on public.checklists
  for delete to authenticated
  using (owner_id = (select auth.uid()) and (select public.auth_session_is_active()));

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) and (select public.auth_session_is_active()));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id and (select public.auth_session_is_active()))
  with check ((select auth.uid()) = id and (select public.auth_session_is_active()));

drop policy if exists "Checklist photos: owner read" on storage.objects;
create policy "Checklist photos: owner read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'checklist-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.auth_session_is_active())
  );

drop policy if exists "Checklist photos: owner insert" on storage.objects;
create policy "Checklist photos: owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'checklist-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.auth_session_is_active())
  );

drop policy if exists "Checklist photos: owner update" on storage.objects;
create policy "Checklist photos: owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'checklist-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.auth_session_is_active())
  )
  with check (
    bucket_id = 'checklist-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.auth_session_is_active())
  );

drop policy if exists "Checklist photos: owner delete" on storage.objects;
create policy "Checklist photos: owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'checklist-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.auth_session_is_active())
  );

-- Optional export metadata exists only in environments where its earlier
-- migration has been applied. Update policies without requiring the table.
do $$
begin
  if to_regclass('public.checklist_exports') is not null then
    execute 'drop policy if exists checklist_exports_select_own on public.checklist_exports';
    execute 'create policy checklist_exports_select_own on public.checklist_exports for select to authenticated using (owner_id = (select auth.uid()) and (select public.auth_session_is_active()))';
    execute 'drop policy if exists checklist_exports_insert_own on public.checklist_exports';
    execute 'create policy checklist_exports_insert_own on public.checklist_exports for insert to authenticated with check (owner_id = (select auth.uid()) and (select public.auth_session_is_active()))';
    execute 'drop policy if exists checklist_exports_delete_own on public.checklist_exports';
    execute 'create policy checklist_exports_delete_own on public.checklist_exports for delete to authenticated using (owner_id = (select auth.uid()) and (select public.auth_session_is_active()))';
  end if;
end;
$$;

-- Revoke every refresh session for a user. Existing access JWTs are then
-- rejected by auth_session_is_active() at RLS-protected resources.
create or replace function public.revoke_auth_sessions_for_user(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  removed_count integer;
begin
  if (auth.jwt() ->> 'role') is distinct from 'service_role' then
    raise insufficient_privilege using message = 'service_role is required';
  end if;
  if p_user_id is null then
    raise invalid_parameter_value using message = 'user id is required';
  end if;
  delete from auth.sessions where user_id = p_user_id;
  get diagnostics removed_count = row_count;
  return removed_count;
end;
$$;

revoke all on function public.revoke_auth_sessions_for_user(uuid) from public, anon, authenticated;
grant execute on function public.revoke_auth_sessions_for_user(uuid) to service_role;

-- Protect private Excel export objects as well, when that bucket/policies exist.
do $$
begin
  if exists (select 1 from storage.buckets where id = 'checklist-exports') then
    execute 'drop policy if exists checklist_exports_storage_select_own on storage.objects';
    execute 'create policy checklist_exports_storage_select_own on storage.objects for select to authenticated using (bucket_id = ''checklist-exports'' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.auth_session_is_active()))';
    execute 'drop policy if exists checklist_exports_storage_insert_own on storage.objects';
    execute 'create policy checklist_exports_storage_insert_own on storage.objects for insert to authenticated with check (bucket_id = ''checklist-exports'' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.auth_session_is_active()))';
    execute 'drop policy if exists checklist_exports_storage_delete_own on storage.objects';
    execute 'create policy checklist_exports_storage_delete_own on storage.objects for delete to authenticated using (bucket_id = ''checklist-exports'' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.auth_session_is_active()))';
  end if;
end;
$$;
