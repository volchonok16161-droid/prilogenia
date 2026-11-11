# Supabase drift reconciliation plan

Status: investigation only. This document does not authorize or perform database, Storage, Auth, or Edge Function changes.

## Scope and safety boundary

Target code branch: `feat/cloud-checklist-progress`.

The live Supabase project was inspected read-only. Do not run migrations, edit policies, deploy Edge Functions, change Auth settings, or modify/delete user data as part of this reconciliation until the project owner explicitly approves a reviewed change plan. Do not use Production data for destructive tests.

## Observed drift

The read-only audit found the following differences between the Git branch and the live project:

| Area | Git branch | Live project / migration history | Risk |
|---|---|---|---|
| Checklist revision guard | Migration file `20261102093000_checklist_revision_guard.sql` exists in Git | Revision trigger and function exist in the database, but the migration is not listed in migration history | The database may contain a manually-applied or otherwise untracked schema change |
| Checklist payload limit | Migration `20261104105400_checklists_payload_max_512kb.sql` exists in Git | No matching 512 KiB constraint was found in the inspected catalog | Application and database may enforce different payload limits |
| Private photo storage | Corresponding migration is absent from Git | Migration history includes `20261102144000_private_checklist_photo_storage`; private bucket and owner-scoped object policies exist | Historical source is not reproducible from this branch |
| Assistant role | Corresponding migration is absent from Git | Migration history includes `20261105111339_add_assistant_profile_role`; live role constraint includes `assistant` | Fresh environment setup may not reproduce the live role set |
| Excel export archive | Git contains create and subsequent removal migrations | Live private `checklist-exports` bucket exists; `checklist_exports` table is absent | Bucket lifecycle and any remaining objects need explicit review |
| account-admin Edge Function | Branch source uses normalized username-to-email mapping and supports assistant listing | Deployed v4 source uses a hard-coded named-account map and lists employees only | Deployed behavior does not match reviewed source; redeployment could change account provisioning behavior |

These are observations, not proof of when or how each live object was created. The migration history is not a complete substitute for a schema diff.

## Required reconciliation sequence

### 1. Freeze and capture a baseline

- Record the exact Git branch head and deployed Edge Function versions.
- Export the migration history and a schema-only snapshot of relevant objects.
- Capture definitions for tables, constraints, indexes, triggers, functions, RLS policies, Storage buckets and object policies.
- Record bucket object counts and aggregate sizes without downloading or changing objects.
- Record Edge Function configuration and source revisions; never include secrets in artifacts.
- Confirm a restorable backup/PITR point before any future write operation.

### 2. Produce a canonical schema diff

Compare the live catalog against the intended schema represented by the branch and migration files. Explicitly include:

- `profiles` columns, role constraint, grants and RLS policies;
- `checklists` columns, payload constraints, revision trigger/function, FK and RLS policies;
- Storage bucket privacy, MIME/size limits and all object policies;
- indexes and function execution privileges.

Do not infer that a migration is safe to replay merely because its filename is absent from migration history. Check every object and its definition first.

### 3. Resolve each migration discrepancy separately

- **Revision guard:** verify the live function and trigger definitions byte-for-byte or semantically against the Git migration. If equivalent, plan a history reconciliation only after confirming the supported Supabase procedure; do not recreate the trigger blindly.
- **512 KiB payload limit:** inspect the largest existing payloads and application serialization behavior. Decide whether the intended limit is compatible with all existing records before proposing a constraint. If any row violates it, prepare a non-destructive remediation proposal first.
- **Photo storage:** recover the exact historical migration source or reconstruct a reviewed migration from the live definitions. Preserve all existing objects and owner-scoped access.
- **Assistant role:** recover the original migration or prepare a reviewed equivalent. Verify every role-dependent UI and Edge Function path before rollout.
- **Excel export archive:** confirm whether the bucket contains objects, whether any deployed client references it, and whether retention requirements apply. Do not delete the bucket or its objects as part of drift cleanup.

### 4. Reconcile Edge Function source separately

The deployed `account-admin` v4 does not match the branch source. Before any deployment:

- Compare the complete deployed source with the branch source and document every behavioral difference.
- Verify authentication, actor role checks, tenant/account scoping, employee limit enforcement, and race behavior.
- Add tests for concurrent employee creation at the account limit; a preflight count followed by user creation is not an atomic limit.
- Verify invite redirect behavior and the supported account-login mapping.
- Review CORS and JWT verification together; a wildcard CORS header alone is not an authorization boundary.
- Run isolated tests against a disposable Supabase project.
- Obtain explicit approval for the exact function version and rollout window.

No Edge Function deployment is authorized by this document.

### 5. Validate before and after any approved rollout

Use disposable accounts and synthetic checklist records only. Verify:

- cross-account reads and writes are denied;
- users can access only their own Storage object paths;
- all supported roles have the intended permissions;
- existing checklist revisions continue to increment exactly once;
- oversized payload handling is explicit and does not silently discard data;
- offline queue retries remain idempotent;
- account switching and logout do not expose the previous user's local data;
- existing photo objects remain readable by their owner.

Capture before/after schema snapshots, test output, function versions and rollback steps.

## Current blockers

1. The deployed `account-admin` implementation differs from the branch source.
2. The migration ledger and live schema are not fully aligned.
3. The 512 KiB payload constraint is present in Git but was not found in the live database catalog.
4. Supabase Security Advisor reports leaked-password protection disabled. This is a configuration finding; changing it may affect authentication and requires a separate approved change.

## Explicitly out of scope

- Applying or repairing migrations;
- changing RLS, grants, constraints, triggers, buckets or Storage objects;
- deploying Edge Functions;
- changing Auth/password settings;
- deleting, rewriting, or bulk-exporting user data;
- Production deployment or branch merges.

This plan is complete only when each discrepancy has an evidence-backed disposition, a reviewed change set, a tested rollback, and separate owner approval for any live write.
