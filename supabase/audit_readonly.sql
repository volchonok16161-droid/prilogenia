-- READ-ONLY audit queries for a Supabase TEST project.
-- These statements inspect metadata only. They do not create, alter, or delete anything.
-- Run in Supabase SQL Editor, then review/copy the results. Do not share passwords, tokens, or API keys.

-- 1) RLS enabled/forced status for public tables.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;

-- 2) Policies currently defined in public schema.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as check_expression
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3) Table privileges granted to common Supabase roles.
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated', 'service_role', 'postgres')
order by table_name, grantee, privilege_type;

-- 4) Column definitions for the proposed/current profile and checklist tables.
select
  table_name,
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'checklists')
order by table_name, ordinal_position;

-- 5) Triggers on public tables, to find profile provisioning or unexpected write hooks.
select
  event_object_table as table_name,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;

-- 6) Functions in public schema that use SECURITY DEFINER.
-- Review each result's definition and ownership before trusting it.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_userbyid(p.proowner) as function_owner,
  p.prosecdef as security_definer,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.proconfig as function_settings
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef
order by p.proname;
