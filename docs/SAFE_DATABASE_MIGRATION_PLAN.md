# TheKhatir: Safe Database Migration Plan

**Status:** Draft for owner approval. No application schema migration has been applied.
**Canonical repository:** `AmjidOfficial/TheKhatir`
**Target Supabase project:** `vpjslrrfgmvkurohplzq`
**Production changes allowed by this plan:** None until explicit approval.

## Current verified state

- Supabase `public` schema returned no application tables.
- Supabase migration history contains a migration recorded as version `20261016102522`, named `restrict_rls_auto_enable_rpc_execution`.
- The matching repository migration file currently uses a different version prefix: `20261016000000_restrict_rls_auto_enable_rpc.sql`. Reconcile this history before using `supabase db push`; do not blindly push migrations.
- The core SaaS SQL draft defines 13 tables: user_profiles, tenants, tenant_memberships, properties, projects, leads, lead_activities, tasks, events, event_registrations, ad_campaigns, content_pages, audit_logs.
- The draft enables RLS on all 13 tables and defines tenant-aware policies, helper functions, triggers and public marketplace views.
- Generated application TypeScript types are still empty. Regenerate them only after the schema is approved and applied.
- The draft does not configure Storage buckets or Storage object policies. Listing images, identity/property documents and project files need a separate, reviewed storage migration.
- No billable Supabase staging branch has been created.

## Non-negotiable safeguards

1. Do not delete `AmjidOfficial/Khatir`; retain it as an archive until consolidation and deployment are verified.
2. Do not apply the SaaS schema directly to production before a local dry run and explicit owner approval.
3. Do not use the inactive N-LINK360 project. Confirm every CLI command targets `vpjslrrfgmvkurohplzq`.
4. Never put a service-role key, database password or other secret in Git, browser variables, issues or chat. Browser configuration must use the project's publishable/anon key only.
5. Take a verified database backup/export before production DDL, and record a tested restore path. If there is no valuable existing data, still preserve the current schema and migration history.
6. Do not seed fake listings or fake users in production.
7. Keep production schema changes additive where possible. No destructive changes without a separate reviewed migration and explicit approval.

## Proposed no-cost validation path

### Phase A — local validation, no Supabase branch

1. Install/use the Supabase CLI and local Docker-based Supabase stack on a developer machine.
2. Create a clean local database and apply the reviewed migration files in order.
3. Resolve SQL syntax errors, foreign-key order, trigger ordering, grants and migration-history discrepancies.
4. Run schema linting and generate a table/relationship inventory.
5. Test the migration twice: clean install and repeat/idempotency behavior where supported.
6. Keep local credentials in ignored environment files only.

If Docker/CLI is not available, review the migration in SQL editor without executing it, then obtain owner approval for a controlled project execution. Do not treat static review as a successful dry run.

### Phase B — mandatory security tests

Use two normal test users in two separate tenants, plus a platform administrator. Verify:

- User A cannot read, update, delete, assign, or infer private records belonging to Tenant B.
- Tenant owners cannot grant themselves platform-admin roles or promote an unrelated user to owner/admin.
- A newly registered user receives only a normal profile and no privileged role.
- New properties/projects cannot bypass verification or publish-state controls.
- Public marketplace views return only approved, published, unexpired records and never expose private leads, audit logs, personal documents or internal moderation data.
- Lead and event registration access follows the intended privacy rules.
- Audit logs are append-only for tenant users.
- SECURITY DEFINER functions have a fixed safe search_path, minimal execution grants, and no untrusted dynamic SQL.
- Public/anonymous requests cannot call privileged administrative routines.
- Referential integrity prevents cross-tenant links between leads, properties, projects, events and campaigns.

Any failed isolation test blocks production.

### Phase C — production preflight

1. Confirm the target project ID and environment variables in deployment settings.
2. Export the current schema and any data; confirm backup availability and restore instructions.
3. Reconcile the remote migration version `20261016102522` with the repository filename mismatch before running the CLI.
4. Review Supabase security and performance advisors.
5. Obtain owner approval for the exact migration file/checksum and deployment window.
6. Apply the migration once, through the chosen controlled path, and save the output.
7. Immediately verify the 13 expected tables, RLS status, policies, triggers, views and grants.
8. Run the tenant-isolation smoke tests before connecting production UI flows.

## Scope gaps to address before calling the schema complete

- **Storage:** approved buckets and per-tenant object policies; separate private document storage from public listing media.
- **Authentication:** sign-up/sign-in/reset/verification flows and profile bootstrap behavior.
- **RBAC:** documented role-to-action matrix; branch/team scope; least-privilege admin actions.
- **Billing:** subscription plans, entitlements, usage limits, invoices/payment-provider state and webhook verification.
- **Operations:** notifications, saved properties, contact/visit records, construction milestones, project inventory/units, moderation queues, support tickets and data retention.
- **Privacy:** consent, contact data retention, account deletion/export, rate limits and anti-spam controls for public lead/event forms.
- **Quality:** migration tests, RLS tests, end-to-end tests, monitoring, error reporting and backup/restore drill.

## Approval gate

Before production schema deployment, the owner must approve:
- the final reviewed migration files;
- the backup/restore plan;
- the migration-history reconciliation;
- the RLS test results;
- and the production deployment window.

Until then, the existing production schema remains unchanged except for the already-recorded RPC permission restriction.
