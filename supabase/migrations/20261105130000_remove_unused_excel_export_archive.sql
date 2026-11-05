-- The dedicated Excel file archive was superseded by the existing checklist cloud backup flow.
-- Remove only the empty bucket/table created by the immediately preceding migration.
do $$
begin
  if exists (select 1 from storage.objects where bucket_id = 'checklist-exports') then
    raise exception 'Refusing to remove checklist-exports: bucket contains files';
  end if;
  if exists (select 1 from public.checklist_exports) then
    raise exception 'Refusing to remove checklist_exports: metadata rows exist';
  end if;
end $$;

drop policy if exists checklist_exports_storage_select_own on storage.objects;
drop policy if exists checklist_exports_storage_insert_own on storage.objects;
drop policy if exists checklist_exports_storage_delete_own on storage.objects;
drop table if exists public.checklist_exports;
delete from storage.buckets where id = 'checklist-exports';
