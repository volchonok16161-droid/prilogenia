-- Private archive for generated Excel checklist exports.
-- Apply this migration to the Supabase project before enabling cloud export uploads.
create table if not exists public.checklist_exports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mode text not null,
  checklist_type text not null default '',
  checklist_number text not null default '',
  checklist_date text not null default '',
  file_size bigint not null check (file_size > 0 and file_size <= 52428800),
  created_at timestamptz not null default now()
);

create index if not exists checklist_exports_owner_created_idx
  on public.checklist_exports (owner_id, created_at desc);

alter table public.checklist_exports enable row level security;

drop policy if exists checklist_exports_select_own on public.checklist_exports;
create policy checklist_exports_select_own
  on public.checklist_exports for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists checklist_exports_insert_own on public.checklist_exports;
create policy checklist_exports_insert_own
  on public.checklist_exports for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists checklist_exports_delete_own on public.checklist_exports;
create policy checklist_exports_delete_own
  on public.checklist_exports for delete to authenticated
  using (owner_id = (select auth.uid()));

grant select, insert, delete on public.checklist_exports to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'checklist-exports',
  'checklist-exports',
  false,
  52428800,
  array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists checklist_exports_storage_select_own on storage.objects;
create policy checklist_exports_storage_select_own
  on storage.objects for select to authenticated
  using (
    bucket_id = 'checklist-exports'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists checklist_exports_storage_insert_own on storage.objects;
create policy checklist_exports_storage_insert_own
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'checklist-exports'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists checklist_exports_storage_delete_own on storage.objects;
create policy checklist_exports_storage_delete_own
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'checklist-exports'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
