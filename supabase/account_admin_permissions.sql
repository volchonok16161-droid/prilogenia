-- Permissions required by the trusted account-admin Edge Function.
-- This does not grant these operations to authenticated browser users.
grant select, insert, update on table public.profiles to service_role;
