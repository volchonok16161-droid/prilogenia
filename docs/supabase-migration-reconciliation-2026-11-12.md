# Supabase migration reconciliation — 2026-11-12

This document records a read-only comparison of the repository migration directory and the connected Supabase project `fecigiwjtbtabnsfsdym`. It is not an instruction to mutate the live project.

## Observed live migration history

The connected project reports these versions:

- `20261102110411 profiles_self_update_display_name`
- `20261102144000 private_checklist_photo_storage`
- `20261105111339 add_assistant_profile_role`
- `20261105193809 private_checklist_excel_exports`
- `20261105195733 remove_unused_excel_export_archive`
- `20261112123238 restore_admin_session_and_employee_capacity_rpcs`
- `20261112131019 grant_service_role_checklist_admin_access`
- `20261112131715 add_admin_storage_objects_rpc`

## Repository files and discrepancies

The working branch contains, among others:

- `20261102093000_checklist_revision_guard.sql`
- `20261102110411_profiles_self_update_display_name.sql`
- `20261104105400_checklists_payload_max_512kb.sql`
- `20261105193809_private_checklist_excel_exports.sql`
- `20261105195733_remove_unused_excel_export_archive.sql`
- `20261111120000_atomic_employee_capacity.sql`
- `20261111160000_revoked_session_rls_guard.sql`
- `20261112153000_restore_admin_session_and_employee_capacity_rpcs.sql`
- `20261112161000_grant_service_role_checklist_admin_access.sql`
- `20261112163000_add_admin_storage_objects_rpc.sql`

The following require explicit reconciliation before any migration push:

1. Live migration history includes `private_checklist_photo_storage` and `add_assistant_profile_role`, but matching migration files were not present in the inspected working-branch directory listing.
2. Live history has later versions for the three administrative migrations than the repository filenames. The live SQL definitions and object grants were inspected separately; version/name differences must not be resolved by blindly replaying DDL.
3. Repository migrations `20261111120000_atomic_employee_capacity.sql` and `20261111160000_revoked_session_rls_guard.sql` are staged in Git but are not represented as applied migrations in the live history. They must not be pushed without a dedicated isolated Supabase test environment and a full policy/role regression matrix.
4. Repository migrations `20261102093000_checklist_revision_guard.sql` and `20261104105400_checklists_payload_max_512kb.sql` were not reported in the live migration history. The live revision trigger and checklists schema are present, but their provenance/version record requires reconciliation.

## Read-only live checks

On 2026-11-12 the connected project was inspected without modifying data:

- `public.checklists` has `id, owner_id, title, equipment_type, payload, revision, created_at, updated_at`.
- RLS is enabled on `public.checklists`; owner-scoped SELECT/INSERT/UPDATE/DELETE policies are present.
- `checklists_revision_guard` is active. Its live function resets revision to 1 on INSERT, requires exactly +1 on UPDATE, and sets `updated_at` using database time.
- `checklist-photos` exists as a private bucket with a 10 MiB limit and JPEG/PNG/WebP MIME restrictions. Four owner-scoped Storage policies are present.
- The service-role-only administrative RPCs for listing Storage objects, checking active Auth sessions, revoking sessions, and employee-slot reservations exist.
- `private.employee_slot_reservations` has RLS enabled and no client policies; no grants to API roles were observed. This is an intentional deny-by-default private table, not a reason to add permissive policies.
- Security Advisor reports leaked-password protection disabled. This is an Auth configuration item requiring a separate decision; it was not changed.

## Safe next steps

1. Recover missing historical migration files from their original reviewed sources or reconstruct them from a verified schema snapshot and peer review.
2. Compare each repository migration to live object definitions and grants.
3. Reconcile migration history in a controlled maintenance procedure only after confirming that each DDL change is already present or can be applied safely.
4. Run all new migrations first in an isolated test project; do not create a paid Supabase Branch.
5. Keep Production data and Edge Functions unchanged until separately authorized.

No migration was applied and no migration-history row was modified during this audit.

## Published Edge Function comparison

The connected project reports `account-admin` ACTIVE at version 6. Its retrieved deployed source does not match the current branch source: the deployed deletion query selects only `id, title, equipment_type, payload, created_at`, while the branch additionally selects `revision` and `updated_at` and now contains retry-safe archive logic. No Edge Function deployment was performed because this function is active in the connected Supabase project and the project was explicitly kept unchanged. The branch source and tests must be reviewed and deployed only under a separate explicit Production/Edge Function release authorization.
