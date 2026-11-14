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
| Atomic employee capacity | New Git migration `20261111120000_atomic_employee_capacity.sql` adds private short-lived reservations and service-role RPCs | Migration is not applied; no reservation table/RPC is present in the inspected live schema | Branch Edge Function now depends on these RPCs; deploying the function before the migration would break employee creation, invitation and promotion |
| account-admin Edge Function | Branch source uses a two-login allowlist for named accounts; lists and changes access only for `employee`; has no `set_employee_role` action | Deployed v4 uses normalized username-to-SHA-256 synthetic emails; lists `employee` and `assistant`; adds developer-only `set_employee_role`; allows access changes for both roles | Login compatibility, role visibility and role-management behavior differ in both directions; deploying either copy changes live behavior |

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

The complete source comparison was performed read-only on 2026-11-11. The deployed `account-admin` v4 differs from the branch in these concrete ways:

- **Named login provisioning:** branch source originally accepted only two named accounts. The branch now maps arbitrary normalized usernames to SHA-256 synthetic emails while preserving the two legacy mappings; this was aligned in commit `21e1dd6`. Deployed v4 still uses a hard-coded map. A deployment in either direction changes which logins can be provisioned; do not switch without checking existing Auth users and login resolution.
- **Employee listing:** branch source now lists `employee` and `assistant` after commit `e20dd5a`; deployed v4 also includes both.
- **Role changes:** branch source now implements `set_employee_role`, restricted to a developer and transitions between `employee` and `assistant`; this was aligned with the cabinet in commit `e20dd5a`. Deployed v4 also supports this action.
- **Access suspension:** branch source now permits changes for `employee` and `assistant`; deployed v4 permits both.
- **Employee cap:** the branch now uses a new atomic reservation RPC for create/invite and assistant-to-employee promotion (migration `20261111120000_atomic_employee_capacity.sql`). The RPC serializes quota checks with a transaction-scoped advisory lock, counts active employees plus unexpired reservations, and caps the sum at 15. Reservations expire after 10 minutes as a crash safety net and are released on normal success/error paths. The migration is staged in Git only and has not been applied. The deployed Edge Function remains on its previous non-atomic count-then-write behavior. Do not deploy the branch Edge Function until the migration is reconciled, reviewed and applied in an approved environment.
- **Account deletion:** branch source now includes a developer-only `delete_employee` action. It refuses deletion for users with cloud checklists or Storage objects, bans the target, rechecks both data stores, then calls Auth `deleteUser`. This code is not deployed. Supabase documents that existing JWTs can remain valid until expiry after Auth deletion; banning prevents new sign-ins/refreshes but is not an immediate JWT revocation mechanism.
- **Shared behavior:** both versions verify the bearer token with `auth.getUser`, require actor role `admin` or `developer` for entry, use the service-role key only server-side, and attempt to delete a newly-created Auth user if profile upsert fails.

The existing `tests/employee-username-auth.test.mjs` checks the **Git branch source** and the login UI. It does not execute the deployed v4 source and cannot establish live parity. Before any deployment:

- Compare the complete deployed source with the branch source and document every behavioral difference.
- Verify authentication, actor role checks, tenant/account scoping, employee limit enforcement, and race behavior.
- Review and apply the staged atomic-capacity migration in a disposable Supabase project, then run real concurrent create/invite/promotion tests at 14, 15 and 16 employees. The current repository test checks source/migration structure only and does not prove database concurrency behavior.
- Decide whether immediate revocation of existing JWTs is required for account deletion. If it is, add and test an explicit server-side session revocation/check strategy; do not claim hard-delete immediately invalidates already-issued JWTs.
- Review the new deletion path in an isolated Supabase project, including the Storage `owner_id` catalog/API behavior, FK cascade behavior, and error/rollback paths.
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

1. The deployed `account-admin` v4 has not been updated to the current branch behavior; branch source contains new developer-only deletion and aligned role/listing/login behavior.
2. The branch Edge Function now depends on the staged atomic-capacity migration; until it is applied in a compatible environment, the branch function must not be deployed. The live deployed function remains non-atomic.
3. The new delete action is code-only and not deployed; active JWT expiry behavior and live Storage ownership query need isolated verification.
4. The migration ledger and live schema are not fully aligned; the 512 KiB payload constraint is present in Git but was not found in the live database catalog.
5. Supabase Security Advisor reports leaked-password protection disabled. This is a configuration finding; changing it may affect authentication and requires a separate approved change.

## Explicitly out of scope

- Applying or repairing migrations;
- changing RLS, grants, constraints, triggers, buckets or Storage objects;
- deploying Edge Functions;
- changing Auth/password settings;
- deleting, rewriting, or bulk-exporting user data;
- Production deployment or branch merges.

This plan is complete only when each discrepancy has an evidence-backed disposition, a reviewed change set, a tested rollback, and separate owner approval for any live write.
