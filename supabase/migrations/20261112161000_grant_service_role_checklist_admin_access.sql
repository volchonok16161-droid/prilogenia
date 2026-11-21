-- The account-admin Edge Function uses the Supabase service role to
-- archive or permanently remove employee-owned checklists. RLS remains
-- enabled and browser roles receive no additional privileges.
grant select, insert, update, delete on table public.checklists to service_role;
