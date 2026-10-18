# SaaS schema review addendum

Date: 2026-10-16
Status: static source review only. The core migration has NOT been executed against a database and the application schema has NOT been deployed to production.

## Changes now included in the SaaS implementation branch

- Added five BEFORE INSERT OR UPDATE triggers that attach public.validate_tenant_relationships() to leads, tasks, lead activities, event registrations, and advertising campaigns.
- Restricted the four tenant authorization helper RPCs to the authenticated role. Anonymous visitors use the allow-listed marketplace views and do not need these helper functions.
- Added scripts/validate-saas-migration.mjs and npm run test:saas-migration; CI now includes this static guard.
- Added a repository migration file named 20261016102522_restrict_rls_auto_enable_rpc_execution.sql to match the version already recorded by the remote Supabase project. The file is conditional so a clean local environment without that project-managed function can still apply the migration sequence.
- Updated the repository's Supabase project reference to the owner-confirmed project vpjslrrfgmvkurohplzq.
- Added a PWA manifest, scalable SVG icon, cautious offline app-shell/static-asset service worker, and production-only registration. API/backend traffic and non-GET requests are excluded from the cache.
- Standardized the central company name to Khatir Property Consultant & Builders.

## Static checks completed during source review

The migration was inspected programmatically and these source-level assertions passed:

- All 13 expected core tables are present.
- RLS is explicitly enabled on all 13 tables.
- Each core table has at least one explicit policy.
- All five tenant relationship triggers are present.
- All four authorization helper grants target authenticated; none target anon.
- Anonymous access to base tenant tables is revoked.
- The curated marketplace views have explicit read grants.
- SECURITY DEFINER functions use a fixed search_path.

These checks do not parse or execute PostgreSQL SQL. They do not prove that RLS policies behave correctly for real users, that triggers execute successfully, or that the application can complete end-to-end workflows.

## Still blocking production

1. Execute the migration against a clean local PostgreSQL/Supabase environment when a free local runtime is available.
2. Run tenant-isolation tests with two separate businesses and users with different roles.
3. Review all role escalation paths, especially membership invitations and platform-admin bootstrap.
4. Add and test Storage buckets and object policies for public property photos versus private documents.
5. Add validated, rate-limited server-side endpoints for public enquiries and event registration.
6. Generate TypeScript database types from the verified applied schema.
7. Regenerate and verify the package lockfile, then switch CI from npm install to npm ci.
8. Verify PWA installation and offline/update behavior on supported browsers. Add raster 192px/512px and iOS icon assets if required by the final installability audit.
9. Confirm deployment environment variables and canonical domain; do not expose secrets in frontend variables.
10. Reconcile migration history using the matching 20261016102522 file before any CLI push. Take and verify a backup/export before production DDL.

## Production safety

- No billable Supabase staging branch was created.
- No core application tables were created in the live Supabase project.
- Do not merge this draft or apply the core migration to production until the SQL execution, security tests, deployment checks, and owner approval are complete.
- Keep AmjidOfficial/Khatir as a backup until consolidation and release verification are complete.
