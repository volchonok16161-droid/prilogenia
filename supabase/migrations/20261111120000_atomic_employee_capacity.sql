-- Serialize employee-capacity changes across account creation, invitations and role promotion.
-- This migration is intentionally staged in Git only; reconcile migration history before applying.
create table if not exists public.employee_capacity_reservations (
  id uuid primary key,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz not null default now()
);

alter table public.employee_capacity_reservations enable row level security;
revoke all on table public.employee_capacity_reservations from public, anon, authenticated;
grant all on table public.employee_capacity_reservations to service_role;

create or replace function public.reserve_employee_slot(p_reservation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  employee_count integer;
  reservation_count integer;
begin
  if auth.role() <> 'service_role' then
    raise insufficient_privilege using message = 'service_role is required';
  end if;

  if p_reservation_id is null then
    raise invalid_parameter_value using message = 'reservation id is required';
  end if;

  -- A transaction-scoped advisory lock makes the count-and-reserve operation atomic.
  perform pg_advisory_xact_lock(hashtext('public.employee_capacity_reservations'));

  delete from public.employee_capacity_reservations
  where expires_at <= now();

  if exists (
    select 1 from public.employee_capacity_reservations
    where id = p_reservation_id and expires_at > now()
  ) then
    return true;
  end if;

  select count(*) into employee_count
  from public.profiles
  where role = 'employee';

  select count(*) into reservation_count
  from public.employee_capacity_reservations
  where expires_at > now();

  if employee_count + reservation_count >= 15 then
    return false;
  end if;

  insert into public.employee_capacity_reservations (id)
  values (p_reservation_id);

  return true;
end;
$$;

create or replace function public.release_employee_slot(p_reservation_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
begin
  if auth.role() <> 'service_role' then
    raise insufficient_privilege using message = 'service_role is required';
  end if;

  delete from public.employee_capacity_reservations
  where id = p_reservation_id;
end;
$$;

revoke all on function public.reserve_employee_slot(uuid) from public, anon, authenticated;
revoke all on function public.release_employee_slot(uuid) from public, anon, authenticated;
grant execute on function public.reserve_employee_slot(uuid) to service_role;
grant execute on function public.release_employee_slot(uuid) to service_role;
