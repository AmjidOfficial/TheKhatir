# Khatir Property & Development Platform

Khatir is being built as a Peshawar-first real estate and property-development SaaS platform. The long-term product brings property search, developer projects, construction workflows, lead management, events, advertising, SEO publishing and business operations into one secure workspace.

**Production status: in development.** The public website is a foundation. SaaS authentication and workspace screens are being implemented, and the database migration is still under review. Do not treat this repository as production-ready until the release gates below pass.

## Product areas

### Public marketplace
- Property discovery for sale and rent
- Developer and construction project profiles
- Area guides, editorial content and SEO landing pages
- Events and site visits
- Verified business profiles and clearly labelled sponsored placements

### Business workspace
- Individual account and business workspace onboarding
- Property listing drafts, editing, review submission and archive
- Lead CRM with pipeline stages and activity notes
- Project, event, advertising and SEO content workspaces
- Role-aware navigation and tenant-scoped data access

### SaaS administration (partially implemented / gated)
- Initial platform moderation centre for business workspaces, properties, projects, events, advertising and SEO content
- Team invitations, role management and branch permissions
- Media/document storage, notifications and audit review
- Subscription plans, usage limits, invoices and payment integrations
- Investor reporting, construction milestones, project inventory and customer portals

The product blueprint defines the broader requirements: [SaaS product blueprint](docs/SAAS_PRODUCT_BLUEPRINT.md).

## Technology

- React, TypeScript and Vite
- Tailwind CSS and shadcn/ui
- React Router
- Supabase Auth and PostgreSQL with Row Level Security
- Netlify deployment previews

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Before enabling authentication, create or select the **dedicated Khatir Supabase project** and configure the following environment variables in a local `.env` file and the Netlify site settings:

```bash
VITE_SUPABASE_URL=https://YOUR-KHATIR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use only the publishable/anon key in browser code. **Never put a Supabase service-role key, database password, payment secret, or private API key in a `VITE_*` variable or commit it to Git.**

If the variables are missing, the login and workspace screens show a setup message instead of creating fake users or metrics.

## Database and security

The proposed schema is in [the SaaS database foundation migration](supabase/migrations/20261011000000_saas_core_foundation.sql). Read [the rollout and security checklist](docs/SAAS_DATABASE_FOUNDATION.md) before applying it.

Important:
1. Confirm the correct Khatir Supabase project first. Do not apply this migration to the unrelated N-LINK360 project.
2. Apply to a dedicated staging database before production.
3. Test row-level security with at least two businesses and multiple roles.
4. Bootstrap the first platform administrator through a trusted, audited process. Never let users assign themselves platform roles.
5. Configure Storage buckets and object-level policies before uploading property photos or private documents.
6. Public lead submissions and event registrations must use validated server-side/Edge Function endpoints with rate limits and spam protection.
7. Generate TypeScript database types from the actually applied schema.
8. Do not enable paid ads or subscriptions until plans, quotas, payment webhooks, refunds and reconciliation are tested.

The marketplace views are intended to expose only approved public fields. Keep base tables private and review every change to public views.

## Quality checks

Run before opening a pull request:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

The repository CI workflow runs typecheck, lint and production build on Node.js 22.

## Release gates

- [ ] Dedicated Khatir Supabase project confirmed and environment variables set
- [ ] Database migration reviewed, applied to staging and validated
- [ ] Tenant isolation and role permissions pass automated tests
- [ ] Auth, password reset, workspace creation and property CRUD tested end-to-end
- [ ] Lead CRM, event, project, ad and SEO workflows tested with real database records
- [ ] Storage, public enquiry endpoints, rate limits and privacy controls implemented
- [ ] Platform admin bootstrap, moderation queue and audit review tested
- [ ] Mobile accessibility, performance, backups, monitoring and restore procedures checked
- [ ] Legal, privacy, property verification and sponsored-content policies reviewed
- [ ] Production deployment and rollback plan approved

## Repository strategy

This repository, `AmjidOfficial/TheKhatir`, is the intended final repository. The tree-level comparison and retirement plan are recorded in [Repository Consolidation](docs/REPOSITORY_CONSOLIDATION.md). The old repository includes a duplicate nested build output and an unsafe legacy deploy workflow, so it should not be copied wholesale. Keep the old repository available until the final deployment, rollback and backup checks are complete.
