-- Enforce the same 512 KiB payload ceiling at the database boundary.
-- The preflight reports only aggregate metadata; it never exposes checklist content.
do $$
declare
  oversized_count bigint;
  largest_payload_bytes bigint;
begin
  select count(*), coalesce(max(octet_length(payload::text)), 0)
    into oversized_count, largest_payload_bytes
  from public.checklists
  where octet_length(payload::text) > 524288;

  if oversized_count > 0 then
    raise exception
      'Cannot add checklists_payload_max_512kb: % existing row(s) exceed 524288 bytes (largest: % bytes). Review and remediate them before retrying.',
      oversized_count, largest_payload_bytes;
  end if;
end;
$$;

alter table public.checklists
  add constraint checklists_payload_max_512kb
  check (octet_length(payload::text) <= 524288)
  not valid;

alter table public.checklists
  validate constraint checklists_payload_max_512kb;
