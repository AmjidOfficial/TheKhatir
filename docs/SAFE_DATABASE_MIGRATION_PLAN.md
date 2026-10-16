# TheKhatir safe database migration plan

Status: draft. Owner approval is required before applying the 13-table SaaS foundation to the live project.

Canonical repository: AmjidOfficial/TheKhatir
Target Supabase project: vpjslrrfgmvkurohplzq
Production schema changes performed: none
Billable Supabase staging branch: none

## Verified remote state

- The Supabase public schema currently has no application tables.
- Remote migration history includes version 20261016102522, named restrict_rls_auto_enable_rpc_execution.
- A matching repository file now exists at supabase/migrations/20261016102522_restrict_rls_auto_enable_rpc_execution.sql. Its conditional execution supports clean local environments where the project-managed function does not exist.
- The SaaS core migration is supabase/migrations/20261011000000_saas_core_foundation.sql and defines 13 application tables.
- Source-level checks passed for required tables, RLS declarations, policies, five tenant relationship triggers, helper grants, public base-table restrictions and curated-view grants.
- Source-level checks are not a PostgreSQL execution test. The migration has not been run locally or deployed to production.

## No-cost validation path

1. Keep production unchanged and retain AmjidOfficial/Khatir as a backup.
2. Install Docker Desktop and the Supabase CLI on a developer machine, if available, and use the local Supabase stack. This avoids creating a billable cloud branch.
3. Verify the CLI version and command options with supabase --version and supabase --help.
4. Start with a clean local database and apply migrations in timestamp order.
5. Fix any SQL syntax, dependency ordering, grants, trigger or migration-history errors. Repeat the clean install from zero.
6. Generate database types from the locally applied schema and review the diff.
7. Run tenant-isolation tests using at least two users in two separate businesses, plus an admin test account.
8. Run application typecheck, lint, migration static check, build, and end-to-end smoke tests.

If Docker/CLI cannot be used, do not call the migration tested. A static review alone is not a substitute for executing PostgreSQL SQL.

## Mandatory security tests

- A user in Business A cannot read, update, delete or assign Business B records.
- A business owner cannot assign themselves a platform role or create another platform admin.
- A tenant manager cannot move a membership or linked record between tenants.
- The five relationship triggers reject cross-tenant links for leads, tasks, lead activities, event registrations and advertising campaigns.
- New properties, projects, events, content and ads cannot bypass review/publishing rules.
- Anonymous users can read only the curated public views and only approved, published, unexpired content.
- Public views do not reveal private phone numbers, identity documents, leads, audit records, moderation fields or private project files.
- Audit records cannot be changed or deleted by ordinary tenant members.
- Storage access is tenant-scoped; public listing photos and private identity/property documents use separate policies.
- Signup creates only a normal user. The first platform administrator is bootstrapped through a trusted, audited process.

Any failed test blocks production.

## Production preflight

1. Confirm the target project ID is vpjslrrfgmvkurohplzq and the deployment environment uses that same project.
2. Export the current schema and data where relevant. Verify that the backup can be restored.
3. Confirm local and remote migration histories match. Never use migration repair or mark a migration applied based on filename alone.
4. Review Supabase security and performance advisors.
5. Review the exact migration diff and checksum.
6. Obtain explicit owner approval for the production change.
7. Apply migrations through the selected controlled method, save logs, and immediately verify tables, indexes, RLS, policies, triggers, functions, views and grants.
8. Run the tenant-isolation smoke tests against production with controlled test accounts before enabling public write workflows.

## Rollback and recovery

- Take a verified backup/export before DDL.
- Prefer additive schema changes. Do not drop tables or columns in this rollout.
- Keep a written rollback plan for application deployment and environment configuration.
- For data corruption, restore from the verified backup into a separate recovery environment first and reconcile writes before any production restore.
- Do not delete the legacy repository until code, data and deployment migration are verified.

## Approval gate

No production schema migration is authorized by this document. Approval is required after the local SQL execution, security tests, backup verification and deployment review are complete.
