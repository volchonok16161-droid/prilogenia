-- Restore the database RPCs required by the deployed account-admin Edge Function.
-- The reservation table is private and cannot be accessed through the Data API.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.employee_slot_reservations (
  id uuid primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  constraint employee_slot_reservations_expiry_check check (expires_at > created_at)
);

alter table private.employee_slot_reservations enable row level security;
revoke all on private.employee_slot_reservations from public, anon, authenticated, service_role;

create index if not exists employee_slot_reservations_expires_at_idx
  on private.employee_slot_reservations (expires_at);

create or replace function public.is_auth_session_active_for_user(
  p_session_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from auth.sessions s
    where s.id = p_session_id
      and s.user_id = p_user_id
      and (s.not_after is null or s.not_after > now())
  );
$$;

create or replace function public.revoke_auth_sessions_for_user(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  deleted_count integer;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  delete from auth.sessions
  where user_id = p_user_id;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

create or replace function public.reserve_employee_slot(p_reservation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  employee_count integer;
  reservation_count integer;
begin
  if p_reservation_id is null then
    raise exception 'p_reservation_id is required';
  end if;

  -- Serialize all capacity checks so concurrent account creation cannot
  -- reserve the same final slot more than once.
  perform pg_advisory_xact_lock(731202611121530::bigint);

  delete from private.employee_slot_reservations
  where expires_at <= now();

  if exists (
    select 1 from private.employee_slot_reservations
    where id = p_reservation_id
  ) then
    return true;
  end if;

  select count(*)::integer
    into employee_count
  from public.profiles
  where role = 'employee';

  select count(*)::integer
    into reservation_count
  from private.employee_slot_reservations
  where expires_at > now();

  if employee_count + reservation_count >= 15 then
    return false;
  end if;

  insert into private.employee_slot_reservations (id)
  values (p_reservation_id);

  return true;
end;
$$;

create or replace function public.release_employee_slot(p_reservation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  deleted_count integer;
begin
  if p_reservation_id is null then
    return false;
  end if;

  delete from private.employee_slot_reservations
  where id = p_reservation_id;

  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

revoke all on function public.is_auth_session_active_for_user(uuid, uuid) from public, anon, authenticated;
revoke all on function public.revoke_auth_sessions_for_user(uuid) from public, anon, authenticated;
revoke all on function public.reserve_employee_slot(uuid) from public, anon, authenticated;
revoke all on function public.release_employee_slot(uuid) from public, anon, authenticated;

grant execute on function public.is_auth_session_active_for_user(uuid, uuid) to service_role;
grant execute on function public.revoke_auth_sessions_for_user(uuid) to service_role;
grant execute on function public.reserve_employee_slot(uuid) to service_role;
grant execute on function public.release_employee_slot(uuid) to service_role;
