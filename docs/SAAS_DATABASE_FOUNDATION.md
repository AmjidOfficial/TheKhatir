# SaaS Database Foundation

**Status:** Proposed migration on branch `feat/saas-core-database-foundation`. It has not been applied to any Supabase project.

## Included in this first database layer

- User profiles and platform roles
- Multi-tenant business accounts and memberships
- Property listings with moderation and verification states
- Developer projects with approval status
- Leads, lead activities, follow-up tasks
- Events and private event registrations
- Advertising campaigns with moderation and scheduling
- SEO/editorial content pages
- Append-only audit log records
- Tenant-aware relationship checks, indexes, update timestamps, and RLS policies
- Public marketplace views that expose only approved public fields

## Critical rollout rules

1. Confirm access to the dedicated Khatir Supabase project before running migrations. The project ID in `supabase/config.toml` is `drzkvcpymitfflhlpogj`; do not substitute another business project.
2. Apply first in a new staging project or a confirmed empty Khatir project. Review the migration with a database engineer before production.
3. Configure and test RLS with at least two tenants and users in different roles. Verify tenant A cannot read or change tenant B's private records.
4. The browser must not create public leads or registrations directly. Implement a server-side/Edge Function endpoint with validation, rate limiting, spam protection, and consent handling.
5. Only platform moderation should verify properties/projects, approve campaigns, and publish events/content. Confirm the initial super-admin bootstrap procedure before enabling admin workflows.
6. Generate `src/integrations/supabase/types.ts` from the actual applied schema. The current generated type file has no application tables.
7. Configure private/public Storage buckets and object policies separately before allowing uploads. This migration does not create Storage buckets.
8. No billing or payment gateway is enabled here. Do not charge for advertising until plans, quotas, invoices, refunds, payment webhooks, and reconciliation are implemented and tested.

## Public data contract

Public pages should query these allow-listed views rather than select full base-table rows:

- `marketplace_businesses`
- `marketplace_properties`
- `marketplace_projects`
- `marketplace_events`
- `marketplace_content`
- `marketplace_ad_placements`

The marketplace views are intentionally curated, security-barrier views with fixed public filters and an allow-list of columns. They use the view owner's permissions by design, so their SQL must stay restrictive and must never include private fields. Anonymous clients receive no access to the base tables. Keep the public filters restrictive and add automated tests before adding more columns.

## Still required before production

- A trusted super-admin bootstrap and recovery process
- Edge Functions for public enquiries, event registration, invitations, and notifications
- Storage buckets, file validation, upload limits, and object-level policies
- Subscription plans, entitlements, quotas, usage counters, invoices, and payment-provider integration
- Branch-level access scopes, invitations, support tickets, saved searches, favourites, and comparison
- Project phases and inventory units, construction milestones, quotations, and client document permissions
- Automated RLS integration tests, build/lint, accessibility, mobile, and performance checks
- Backup/restore test, error monitoring, deployment environment verification, and privacy/legal review

A schema file in GitHub is not the same as a deployed or tested backend. The dashboard/login UI now has a real Supabase auth path and refuses to show fake accounts or metrics, but it remains unavailable until the approved project is configured and the schema is applied. Mark features complete only after the migration is applied to the correct project and end-to-end tests pass.
