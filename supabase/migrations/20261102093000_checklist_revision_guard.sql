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
