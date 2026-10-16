# TheKhatir schema static review addendum

Date: 2026-10-16
Status: source review only. No local SQL execution or production schema deployment has occurred.

## Finding fixed in development branch

The core migration defined public.validate_tenant_relationships() but did not attach it to the tables it was meant to protect. Five BEFORE INSERT OR UPDATE triggers were added on the development branch for:
- leads
- tasks
- lead_activities
- event_registrations
- ad_campaigns

Commit: 3ad8f5851c8004a202d3e39fd6870de78d5e46e4

## Required tests before production

1. Reject a lead linked to a property or project from a different tenant.
2. Reject a task linked to another tenant's lead, property, or project.
3. Reject a lead activity linked to a lead from another tenant.
4. Reject an event registration whose event and tenant do not match.
5. Reject changing an event registration's event or user identity.
6. Reject an advertising campaign linked to another tenant's property, project, or event.

## Release blockers

- Supabase remote migration version is 20261016102522, while the repository file uses 20261016000000. Compare exact SQL and reconcile this history before CLI deployment. Do not blindly rename or mark migrations applied.
- The migration has not been run locally or in production. SQL syntax, triggers, RLS, and application flows remain unverified.
- Public marketplace views run with view-owner privileges by design. Test their exact returned columns and ensure only approved, published records are exposed.
- Storage buckets and object policies are not included. Public listing images and private identity/property documents need separate reviewed policies.
- Generate TypeScript database types only after the final schema has been applied and verified.

No Supabase staging branch was created. No application tables were deployed to production.
