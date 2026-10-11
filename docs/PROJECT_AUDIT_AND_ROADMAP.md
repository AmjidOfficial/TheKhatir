# Khatir: Project Audit and Delivery Roadmap

**Purpose:** Build a trustworthy, production-ready property and developers platform with Peshawar as the initial market.

## Repository consolidation

- `AmjidOfficial/TheKhatir` is the canonical repository.
- `AmjidOfficial/Khatir` was reviewed for reusable work.
- The repositories share the main site, company configuration, and many components. TheKhatir already contains the stronger property-search experience, individual property detail routes, sample-listing warnings, a confirmed Facebook URL, and a deployment setup that does not use the old `/Khatir/` base path.
- Do not copy the old repository's older `vite.config.ts`, `src/App.tsx`, hero metrics, or placeholder social URLs over the canonical versions.
- Before removing the old repository, preserve an archive/backup and confirm the canonical repository contains all required assets and history. Repository deletion is not part of this code commit.

## Current audit findings

### Confirmed from source inspection

1. The app is built with React, TypeScript, Vite, Tailwind, and shadcn/ui.
2. The property collection and blog content are currently represented in local source data. A live, managed property inventory has not been confirmed.
3. The Supabase client package and client initialization exist, but the generated database types contain no application tables. This is not evidence of a complete production data model.
4. The Supabase client expects `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. An example environment file is included; each deployment still needs the correct project values.
5. The repository's `supabase/config.toml` references project ID `drzkvcpymitfflhlpogj`, but the connected Supabase account currently exposes only a different project, `N-LINK360` (`nigvxsjrvkmynwduvemy`), which is marked inactive. Access to the Khatir project could not be verified. Do not connect Khatir to N-LINK360 by assumption; confirm the intended Supabase project and grant access before database changes.
6. The blog newsletter controls were not connected to a subscription service. The page now directs visitors to WhatsApp instead of pretending to subscribe them.
7. Listing details must distinguish verified live inventory from sample content. Never treat sample prices or descriptions as current offers.
8. Contact, ownership, approval, and listing information must be verified with the business before public launch.
9. Netlify SPA redirects and sitemap/robots files exist. Confirm the production domain, canonical URLs, sitemap routes, and deep-link refresh behavior after deployment.
10. The package scripts include build and lint, but no test script was found in `package.json`.

### Not yet verified

- Khatir Supabase schema, migrations, Row Level Security (RLS), storage policies, and authentication roles
- Whether production environment variables are set correctly
- Whether every property, blog, contact, and admin flow works end-to-end
- Build, lint, accessibility, mobile, performance, and SEO results in CI
- Backup/restore procedure and monitoring
- Legal permissions for listing photos, logos, project brochures, and customer testimonials

## Required product scope

### Public website

- Responsive homepage with clear search and calls to action
- Property search with location, type, sale/rent, price, size, bedrooms, and availability filters
- Property details with gallery, map/location, amenities, price, size, listing status, reference ID, last-updated date, and enquiry options
- Project/developer pages with location, phases, approved inventory, facilities, payment plan, brochures, and clear disclaimers
- Consultancy, buying, selling, rental, construction, and development services
- About, contact, blog/guides, FAQs, privacy policy, and terms
- WhatsApp/call/email actions that use verified business contact details
- SEO metadata, structured data, canonical URLs, sitemap, social preview images, and useful 404 page

### Property operations

- Admin login with role-based permissions
- Create, edit, publish, pause, mark sold/rented, and archive listings
- Upload multiple photos and documents with safe file type/size limits
- Store listing source, verification status, verification date, owner/agent contact, price, location, status, and audit timestamps
- Lead inbox with source, property reference, assigned staff, notes, status, follow-up date, and response time
- Duplicate detection and listing-expiry reminders
- Change history for price, availability, and verification
- CSV import/export with validation and a dry-run preview

### Trust and security

- Database-enforced Row Level Security for every private table
- Public users can read only approved, published listings and public content
- Only authorised staff can create/update listings; only admins can manage staff and roles
- Enquiries and personal contact details must not be publicly readable
- Never expose service-role keys or secrets in frontend code or Git
- Validate input on both client and server/database layers; rate-limit public forms where possible
- Collect only necessary personal data and publish a clear privacy policy
- Provide clear wording that customers must independently confirm ownership, approvals, transfer conditions, taxes, and legal status

## Delivery order

### P0 — Protect and stabilise

- Keep `TheKhatir` as the only active codebase.
- Set up protected branches, pull requests, and automated build/lint checks.
- Confirm Netlify build settings and environment variables.
- Confirm access to the correct Khatir Supabase project before enabling database-backed features.
- Inspect Supabase schema, RLS, storage policies, and authentication before enabling any admin features.
- Replace or visibly mark all sample properties and unverified claims.
- Verify contact details and social URLs with the business owner.

### P1 — Complete the core property journey

- Define the property, project, media, and enquiry data model.
- Add database migrations and RLS policies.
- Connect listing/search/detail pages to approved live data.
- Build a secure admin listing workflow.
- Build a working enquiry form and lead inbox; keep WhatsApp/call actions as alternatives.
- Add loading, empty, validation, failure, and retry states.

### P2 — Quality and launch

- Add automated tests for search filters, property details, forms, and access policies.
- Run production build, lint, accessibility, mobile, and performance checks.
- Verify SEO metadata, canonical URLs, sitemap, and structured data.
- Test direct URL refreshes on Netlify.
- Configure backups, error monitoring, and a rollback procedure.
- Complete a pre-launch review with the business owner.

### P3 — Growth features

- Saved searches and favourites
- Compare properties
- Map-based search
- Urdu and English content
- CRM integrations and lead attribution
- Market guides and area pages based on accurate, sourced information
- Analytics dashboards for enquiries, response time, listing freshness, and conversion

## Launch acceptance criteria

Do not call the platform production-ready until:

- A real listing can be created, reviewed, published, updated, and unpublished through an authorised workflow.
- Search and detail pages read from the approved data source.
- Unpublished or private listings cannot be accessed through public APIs.
- Enquiries are saved safely and visible only to authorised staff.
- No fake/sample listings or unsupported business claims are presented as real.
- Build and lint pass; key user journeys and mobile layouts are tested.
- Contact details, domain, canonical URLs, and sitemap are verified.
- Backup and recovery steps are documented.

## Operating rule

Prioritise correctness, trust, and security over adding flashy features. AI recommendations, valuation estimates, or investment returns must not be presented as verified facts without reliable data, clear methodology, and appropriate disclaimers.
