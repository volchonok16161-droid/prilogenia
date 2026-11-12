-- Storage schema is intentionally not exposed through PostgREST.
-- Query owned objects through a narrowly scoped, service-role-only RPC.
create or replace function public.admin_list_storage_objects_for_user(p_user_id uuid)
returns table(id uuid, bucket_id text, name text)
language sql
stable
security definer
set search_path = pg_catalog, storage
as $$
  select o.id, o.bucket_id, o.name
  from storage.objects o
  where o.owner_id = p_user_id
  order by o.bucket_id, o.name;
$$;

revoke all on function public.admin_list_storage_objects_for_user(uuid) from public, anon, authenticated;
grant execute on function public.admin_list_storage_objects_for_user(uuid) to service_role;
