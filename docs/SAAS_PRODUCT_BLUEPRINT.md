# TheKhatir SaaS Product Blueprint

**Canonical repository:** `AmjidOfficial/TheKhatir`  
**Initial market:** Peshawar and Khyber Pakhtunkhwa, Pakistan  
**Product direction:** Multi-tenant property marketplace, real-estate CRM, developer/construction workspace, and advertising platform.

This document defines the target product and delivery order. It is not a claim that every feature is already implemented. Each module must be built, tested, and connected to real services before being marked complete.

## 1. Product principles

1. Trust before traffic: no invented listings, approvals, prices, returns, reviews, users, or business statistics.
2. One canonical codebase: TheKhatir is the active repository. Preserve Khatir as a backup until consolidation is verified.
3. Multi-tenant by design: every business-owned record belongs to a tenant and is protected at the database layer.
4. Role-based access: the UI hides unavailable actions, but database policies are the actual security boundary.
5. Mobile-first: field agents, property owners, customers, and builders must be able to complete core tasks on a phone.
6. Useful free access and paid upgrades: subscription limits and promoted placement must be clear and fair.
7. Accessible and fast: keyboard support, readable contrast, responsive layouts, compressed images, useful loading/error states.
8. Measurable delivery: each release has acceptance criteria, tests, and a rollback path.

## 2. Audiences and workspaces

### Public visitors and property seekers
- Search, filter, sort, and view sale/rent properties, plots, houses, apartments, commercial units, projects, and construction services.
- View listing details, image galleries, location, amenities, price/area, availability, reference ID, last verification/update date, and contact options.
- Save favourites and searches after sign-in; compare properties; share a listing; report suspicious or stale listings.
- Submit an enquiry without being forced to create an account. Show a privacy notice and confirmation.
- View area guides, project information, events, FAQs, and useful articles.

### Individual agents and property owners
- Personal dashboard for listings, enquiries, follow-ups, visits, profile, verification status, and performance.
- Create drafts, preview, submit for review, publish where permitted, pause, mark sold/rented, renew, and archive listings.
- Manage photos and documents with file type/size limits.
- Manage leads assigned to them and maintain notes without seeing another business's private data.

### Real-estate agencies and property businesses
- Dedicated tenant workspace with business profile, logo, branches, team members, roles, listings, projects, lead inbox, activities, reports, and subscription.
- Invite staff, assign leads, distribute enquiries, configure working hours and response expectations.
- Publish business updates, open-house events, launches, promotions, and SEO-friendly area/project content.
- Track listing quality, response time, lead sources, view-to-enquiry conversion, staff activity, and expiring inventory.

### Developers and builders
- Developer profile and project portfolio.
- Project phases, locations, unit/plot inventory, floor plans, amenities, facilities, construction updates, galleries, brochures, payment-plan documents, and project FAQs.
- Enquiries, site-visit bookings, booking interest, and authorised sales-team assignments.
- Construction service profiles, service areas, project portfolio, capabilities, and quote requests.
- Optional progress milestones and approved public updates. Do not publish claims about approvals, completion, possession, returns, or availability without evidence and a review trail.

### Investors
- Investor profile and preferences, saved opportunities, project watchlist, enquiries, meeting/site-visit requests, and document access when authorised.
- Clearly sourced project facts and financial information with dates, assumptions, risks, and disclaimers.
- No guaranteed returns, unsupported valuations, or personalised financial advice.

### Platform administration
- Platform-wide dashboard and operational queues.
- Manage tenants, users, roles, categories, locations, listing moderation, reported content, verification workflows, subscriptions, ad products, events, content, support tickets, audit logs, and platform settings.
- Suspend accounts or listings with a recorded reason; support appeals and restore access when approved.
- View aggregate platform metrics without unnecessary exposure to private customer data.

## 3. Roles and permission model

Use permissions, not only hard-coded role names. Suggested initial roles:

- **Platform owner / super admin:** platform configuration, tenant administration, security settings, billing configuration, and audited break-glass access.
- **Platform operations admin:** moderation, verification queues, support, events, content, and approved operational reports.
- **Tenant owner:** full control of their own business workspace, staff, plan, listings, projects, campaigns, and reports.
- **Tenant admin / branch manager:** team and workspace management within assigned tenant/branch scope.
- **Sales manager:** lead distribution, team pipeline, follow-up quality, visits, and sales reports.
- **Agent / sales representative:** assigned leads, own activities, permitted listings, and follow-ups.
- **Listing editor / marketer:** property content, images, SEO metadata, campaigns, events, and drafts within assigned scope.
- **Developer / builder manager:** own developer profile, projects, inventory, progress updates, and assigned enquiries.
- **Finance / subscription manager:** invoices, plan status, payment records, and permitted financial reports. No access to unrelated private leads by default.
- **Property owner / landlord:** own listings and enquiries explicitly shared with them.
- **Investor:** own preferences, saved items, and authorised project information.
- **Registered customer:** own profile, favourites, searches, enquiries, and bookings.
- **Public visitor:** published public content and public listing fields only.

For every role, define actions such as `read`, `create`, `update`, `publish`, `approve`, `assign`, `export`, and `delete` separately. Use least privilege and tenant/branch/record scope. High-risk actions require re-authentication or a second approval where appropriate.

## 4. Public marketplace and content

### Property inventory
Support configurable listing types: house, plot, apartment, commercial, shop, office, warehouse, agricultural/land, room, and other approved categories. Support sale, rent, lease, and project inventory.

Minimum fields:
- Unique reference code, tenant, creator, owner/agent, listing type, intent, title, description, and publication state.
- Country, province, city, locality/society, block/sector, address/location point where appropriate.
- Price and currency, negotiability, rent period, area value/unit, bedrooms, bathrooms, floor, parking, facilities, and relevant category attributes.
- Media gallery, cover image, optional floor plan/document attachments, image alt text, and media rights/source.
- Verification state, verification method, verified-by, verified-at, expiry date, last availability confirmation, and public disclaimer.
- Created/updated timestamps, moderation history, and status-change history.

Search must combine text and structured filters: location, category, sale/rent, min/max price, area range/unit, beds/baths, features, developer, verified status, and freshness. Use pagination, stable sorting, useful empty states, and URL-addressable filters. Do not expose unpublished listings through public queries or direct detail URLs.

### Developer and project pages
- Developer/business profile, project overview, exact location, project type, phase/block, facilities, unit types, floor plans, approved inventory, price list with last-updated date, brochures, construction updates, and enquiry/site-visit actions.
- Every claim about approval, NOC, authority, possession, payment plan, or available units needs a source, status, date, and reviewer.
- Expired prices and inventory must be flagged and re-confirmed.

### Editorial content and SEO
- Articles, area guides, FAQs, developer pages, project pages, event pages, and landing pages with draft/review/publish/schedule/unpublish states.
- Editable title tag, meta description, canonical URL, social image, slug, index/noindex choice, and structured data appropriate to the page.
- XML sitemap generated from published canonical pages; robots rules; breadcrumbs; useful 404; redirects when slugs change.
- SEO score is an editorial checklist, not a guarantee of ranking. Validate titles, descriptions, headings, internal links, image alt text, page speed, mobile usability, structured data, and factual sourcing.
- Prevent thin, duplicated, spammy, or automatically generated doorway pages from being published.
- Keep a content revision history and author/reviewer fields.

## 5. Advertising, featured listings, and events

### Advertising products
- Featured property, promoted project, promoted developer profile, sponsored search placement, home-page promotion, area-page placement, and clearly labelled sponsored article/event.
- Campaign fields: tenant, campaign name, product, budget or fixed price, start/end dates, target location/category, creative assets, destination, status, approval, impression/click/enquiry counts, and invoice/payment status.
- Clearly label paid or sponsored placements. Do not silently mix sponsored ranking with organic relevance.
- Define plan quotas, ad eligibility, moderation rules, refund/cancellation rules, and campaign reporting before taking payment.
- Add frequency caps, creative review, link validation, abuse reporting, and an audit trail for campaign changes.
- Do not implement payment collection until a supported provider, settlement flow, webhook verification, refunds, and local compliance are confirmed.

### Events and activities
- Create and manage property expos, open houses, project launches, site visits, investor sessions, construction showcases, and webinars.
- Fields: title, organiser/tenant, event type, start/end with timezone, venue or online URL, description, image, registration capacity, registration form, contact, publication state, and approval.
- Registration list is private and visible only to authorised organisers. Add confirmation and cancellation handling.
- Support draft, scheduled, published, cancelled, completed, and archived states.
- Public event pages need indexable URLs, metadata, event schema when valid, calendar links, and clear registration status.

### Promotions and plans
- Free, starter, professional, agency, developer, and enterprise plans can be evaluated after costs and demand are validated.
- Enforce quotas server-side: active listings, team seats, branches, media storage, campaigns, leads, exports, and report access.
- Subscription states: trial, active, past due, grace period, suspended, cancelled, expired.
- Provide billing history, invoices/receipts, plan comparison, usage meter, renewal reminders, and clear downgrade behaviour.
- Avoid locking a tenant's own data when a plan expires; restrict paid actions while preserving read/export access according to published terms.

## 6. CRM and lead operations

- Capture leads from listing enquiries, WhatsApp/call clicks where measurable, event registrations, contact forms, ads, referrals, and manual entry.
- Store source, campaign, listing/project, contact preferences, consent where required, assigned tenant/team/user, status, priority, created time, last response, next follow-up, and conversion outcome.
- Pipeline stages configurable by tenant, with safe defaults: New, Contacted, Qualified, Visit Planned, Visited, Negotiation, Won, Lost, Unreachable.
- Deduplicate cautiously using normalised contact details and tenant scope; allow authorised merge with history preserved.
- Activity timeline: calls, messages, notes, meetings, site visits, status changes, reassignment, and reminders.
- Task queue, overdue follow-ups, calendar views, saved filters, bulk assignment, CSV import/export with preview and validation.
- Lead routing rules by location, property, availability, team capacity, campaign, and working hours. Log every automated assignment.
- Response-time and conversion reports by source, listing, staff member, branch, and period.
- Customer consent, access, correction, export, and deletion workflows must follow the published privacy policy and applicable law.
- Never expose lead lists or contact details in public APIs, client-side bundles, analytics events, or unprotected storage.

## 7. Construction and project operations

- Construction services catalogue, contractor profiles, capability/coverage areas, portfolio, quote requests, and authorised customer conversations.
- Project workspace with milestones, planned vs actual dates, progress notes, media, issues/risks, responsible staff, and approvals.
- Optional client portal to see approved updates, documents, payment milestones, and communication.
- Keep commercial contract values, private drawings, personal information, and internal risk notes restricted by project membership.
- Track document version, uploader, reviewer, visibility, and retention policy.

## 8. Admin, audit, and support

- Review queues for new listings, edits, business verification, developer projects, ads, events, and reported content.
- Moderation actions: approve, request changes, reject, unpublish, suspend, restore, with reason and actor.
- Tenant onboarding and verification, staff invitations, role assignment, plan changes, usage, billing support, and account closure.
- Support tickets with priority, owner, status, private notes, response SLA, and user-visible replies.
- Immutable or append-only audit events for sign-in/security events, role changes, listing publication, price/status changes, data export, billing, and admin actions.
- Avoid storing secrets, full payment details, or unnecessary personal data in logs.
- Platform analytics should be aggregated and access controlled.

## 9. Suggested data domains

Create reviewed migrations before building production screens. Initial domain groups:
- Identity: profiles, tenant memberships, invitations, role definitions, permission grants, branches.
- Business: tenants, business profiles, verification documents, branches, service areas.
- Marketplace: properties, property attributes, media, locations, amenities, property status history, verification records.
- Development: developers, projects, phases, units/inventory, project media, progress updates, documents.
- CRM: leads, lead assignments, lead activities, tasks, visits, contact preferences, lead sources.
- Marketing: campaigns, ad placements, campaign metrics, events, registrations, content pages, articles, SEO metadata.
- SaaS: plans, features, tenant subscriptions, usage counters, invoices, payment attempts, webhook events.
- Governance: moderation cases, reports, support tickets, audit events, notification preferences, system settings.

Every tenant-owned table should have a tenant identifier and explicit ownership/scope rules. Use foreign keys, unique constraints, indexes, check constraints, timestamps, and soft-delete/archive fields where appropriate. Decide which data is globally shared versus tenant-owned before creating migrations. Generate TypeScript database types from the approved schema.

## 10. Security and reliability baseline

- Confirm the correct dedicated Khatir Supabase project and account access before database work. Never reuse another business's project by assumption.
- Enable RLS on all exposed tables. Write and test policies for anonymous, authenticated, tenant member, branch member, and platform admin access.
- Use the publishable/anon key in the browser only; never expose service-role or provider secrets in `VITE_*` variables or Git.
- Keep sensitive operations in trusted server-side functions with authentication, authorization, input validation, rate limiting, and audit logging.
- Validate uploads by content type, size, storage path, and access policy. Do not trust filename extensions alone.
- Add spam protection, request throttling, safe error messages, secure redirects, and server-side validation.
- Back up the database and media; test restore and document recovery objectives.
- Add monitoring for build/deploy failures, runtime errors, database failures, suspicious sign-ins, and failed background jobs.
- Add dependency scanning, secret scanning, branch protection, reviewed pull requests, and a lockfile-based reproducible install.
- Test accessibility, responsive behaviour, keyboard navigation, forms, direct-route refreshes, slow networks, and error recovery.

## 11. Notifications and integrations

- In-app notifications and optional email for lead assignment, follow-up due, listing approval/rejection, listing expiry, campaign status, event registration, subscription state, and support replies.
- WhatsApp/call links as user-initiated contact options. Automated messaging only after a compliant provider, templates, consent, and delivery handling are configured.
- Email provider, maps/geocoding, analytics, payment gateway, CRM export, calendar, and messaging integrations must be configured with server-side secrets and verified webhooks where applicable.
- Use queues/retries for reliable background work; do not rely on a browser tab to complete critical operations.

## 12. Release plan and acceptance gates

### Gate 0 — Consolidate and protect
- Keep TheKhatir canonical; compare both repository trees and preserve any genuinely unique assets/configuration.
- Create a durable backup/archive of Khatir before any deletion.
- Verify deployment settings, environment variables, domains, repository connections, branch protection, and CI.
- Fix dependency-lock mismatch; use `npm ci` only after the lockfile is regenerated and committed.
- Confirm the correct Khatir Supabase project and access. Do not connect production until ownership is clear.

### Gate 1 — Real property marketplace
- Approved live listings power search and detail pages.
- Secure admin workflow creates, reviews, publishes, updates, and unpublishes listings.
- Enquiries are saved and visible only to authorised staff.
- Sample data is removed or clearly labelled; all public business contact details are verified.
- Search, direct detail links, mobile layouts, SEO metadata, and failure states pass tests.

### Gate 2 — Business workspaces and CRM
- Tenant onboarding, memberships, permissions, staff invitations, lead inbox, assignments, activities, follow-ups, and reporting work end to end.
- Automated tests prove one tenant cannot read or change another tenant's records.

### Gate 3 — Developers, builders, content, events
- Project pages, construction updates, events, registration, editorial publishing, SEO controls, and moderation work end to end.

### Gate 4 — Paid SaaS and advertising
- Plan entitlements, usage quotas, campaign moderation, sponsored labels, billing records, payment integration, webhook security, cancellations, and refund processes are tested before real money is accepted.

### Gate 5 — Scale and optimisation
- Performance budgets, monitoring, backups/restore drills, accessibility checks, analytics, saved searches, map search, Urdu/English, and carefully governed AI assistance.

## 13. Launch checklist

A feature is complete only when:
- It works with real persisted data, not just local arrays or demo buttons.
- Loading, empty, validation, permission-denied, network-failure, and success states exist.
- Permissions are enforced by the backend/database and covered by tests.
- It works on mobile and desktop and is keyboard accessible.
- Data ownership, retention, privacy, and audit needs are documented.
- It has logs/metrics appropriate to its risk and a rollback plan.
- Product, legal, pricing, and verification claims are approved by the business owner.

## 14. Immediate next actions

1. Finish the old-to-canonical repository comparison and create a backup before deleting anything.
2. Verify the production site, Netlify project, environment variables, and intended Supabase project.
3. Repair the lockfile and make CI reproducible.
4. Audit every public page for sample content, broken actions, SEO, accessibility, and mobile behaviour.
5. Design and review the tenant-aware database schema and RLS tests.
6. Build the secure listing admin and enquiry/lead workflow before expanding into billing or advanced AI.
