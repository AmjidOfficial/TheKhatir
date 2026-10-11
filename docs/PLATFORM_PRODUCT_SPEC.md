# Khatir Platform: Product Blueprint and Acceptance Plan

**Canonical repository:** `AmjidOfficial/TheKhatir`  
**Initial market:** Peshawar, Khyber Pakhtunkhwa, Pakistan  
**Primary goal:** One trustworthy platform for property customers, agents, administrators, developers/builders, and investors.

This document defines the product that must be built. It is not a claim that all features already exist.

## 1. Product principles

1. **Truth before promotion.** Never invent live listings, ownership checks, NOC/approval status, prices, client counts, project returns, or construction progress.
2. **One source of truth.** Property, project, unit, enquiry, lead, and customer records must live in a managed database, not scattered frontend arrays or spreadsheets.
3. **Mobile-first.** Every customer and staff journey must work on a phone, with clear buttons, readable forms, and fast pages.
4. **Least privilege.** Enforce roles in the database and server-side functions. Hiding a button in the UI is not access control.
5. **Human accountability.** Every listing, project approval, lead assignment, price change, and status change needs an owner and a timestamp.
6. **No premature AI.** Add AI only after reliable data, permission controls, audit trails, and human review are in place.
7. **One canonical codebase.** All new work belongs in `TheKhatir`. Do not copy old files over stronger canonical fixes.

## 2. User types and access

| Role | Main responsibilities | Access boundary |
|---|---|---|
| Super Admin | System configuration, roles, security, all business records | Full access, audited |
| Business Admin | Staff, listings, projects, leads, reports, approvals | Business-wide access |
| Sales Agent / Property Consultant | Assigned leads, customer communication, visits, offers | Assigned leads and permitted listings |
| Listing Manager | Property data, media, price/status updates, verification workflow | Listings and review queues |
| Developer / Builder | Their own projects, phases, units, documents, progress updates | Only their organisation/projects |
| Investor | Opportunities, published project documents, own enquiries and saved items | Public/approved investment information and own records |
| Customer / Buyer / Tenant | Search, favourites, enquiries, viewing requests, own profile | Public published listings and own records |
| Content Editor | Pages, guides, FAQs, approved media | Content only; no private CRM data |

Create an organisation/team layer if the business later supports multiple offices, partner agencies, or external developers. Do not assume every developer or investor belongs to the Khatir staff team.

## 3. Public property platform

### Search and discovery
- Search by keyword, city/area/society, property type, purpose (sale/rent), price range, land/covered area, beds/baths, and availability.
- Add sorting, pagination, clear filters, useful empty states, and a mobile-friendly filter drawer.
- Later: map search, saved searches, comparison, Urdu/English content, and alerts.
- Property cards must show price, area, location, reference ID, listing status, and whether details are sample or verified.

### Property detail
- Gallery with safe image loading, property reference, price and price-update date, area/unit, type, purpose, location, features, description, availability, and last verified date.
- Enquiry, WhatsApp, call, and viewing-request actions.
- Clearly label unknown or unverified information. Never imply legal verification just because a listing is published.
- Related listings must be real records from the approved database.

### Developer and project pages
- Developer profile, project location, phase, approved inventory, unit/plot types, amenities, brochure/floor plans, payment schedule, construction progress, and enquiry form.
- Show the source and date of any approval/permit information. Allow “not yet verified” rather than forcing a false positive.
- Keep project sales status distinct from construction status and regulatory approval status.

## 4. Lead management CRM

Every enquiry from the website, phone call, WhatsApp conversation, social media, walk-in, referral, campaign, or manual entry should be recorded as a lead when the customer consents and staff have enough information.

### Lead record
- Unique lead number, created/updated timestamps, customer name, phone/email (as provided), preferred contact channel, consent/source, campaign, interest type, property/project reference, location, budget range, timeline, notes, priority, assigned owner/team, next follow-up date, and current stage.
- Deduplicate carefully using normalised phone/email and staff review. Never silently merge different people.
- Keep sensitive customer details private. Do not publish customer contact details or expose them in listing APIs.

### Pipeline stages
`New → Contact Attempted → Contacted → Qualified → Visit Scheduled → Visited → Offer/Negotiation → Won`
and explicit outcomes `Lost`, `Not Qualified`, `Duplicate`, or `Do Not Contact`.

Stages must be configurable by an authorised admin. Store loss reason and next action when relevant.

### Daily workbench
- My leads, unassigned leads, overdue follow-ups, today’s tasks, upcoming visits, stale leads, and recent changes.
- Assign/reassign leads with an audit record.
- Log calls, WhatsApp messages, meetings, notes, visits, offers, and next steps.
- Reminders and notifications must identify the lead, owner, due time, and action.
- Lead source attribution and response-time metrics must be available without fabricating results.

### CRM reporting
- Leads by source/campaign, stage, agent, property/project, date range, and outcome.
- First-response time, overdue follow-ups, visit conversion, win/loss reasons, and pipeline value only where an actual value is recorded.
- Export permissions must be restricted and exports audited.

## 5. Construction and development operations

- Developer/company profile and assigned team.
- Project → phase/block → building/plot/unit hierarchy.
- Unit inventory, unit code, type, floor/plot size, asking price, availability, hold/reservation status, and sale/rental status.
- Payment schedules and receipts should not be treated as accounting records until a proper financial module and controls exist.
- Construction milestones, planned vs actual dates, progress evidence/photos, budget categories, approved budget, committed cost, actual cost, variation approvals, contractor/vendor, and issue log.
- Documents with version, uploader, access level, date, and review status.
- Change approvals for price, availability, construction progress, and project documents.
- Public pages show only explicitly approved fields. Internal budget and contractor details remain private.

## 6. Investor experience

- Investor profile and preferences, with appropriate privacy and consent.
- Published opportunities with project overview, location, developer, unit/investment type, minimum commitment if genuinely defined, payment schedule, fees/costs, risks, document pack, approval/verification state, and contact route.
- Investor can save an opportunity, ask questions, request a meeting, and see their own enquiries.
- Never promise guaranteed returns. If a projected return is ever shown, disclose assumptions, source, time period, risks, and that it is an estimate rather than a guarantee.
- Restrict confidential documents to approved users and record access where needed.

## 7. Customer experience

- Optional customer account; browsing should not require login.
- Favourites and saved searches.
- Enquiry history and viewing requests.
- Notification preferences and consent.
- Customers can request correction/deletion of personal data, subject to lawful business-record retention.
- No public exposure of customer lists, enquiries, or saved properties.

## 8. Administration and governance

- Secure staff sign-in and invitation/approval workflow.
- Role and permission management, with no self-assigned admin privileges.
- Listing review queue, project review queue, lead assignment rules, duplicate review, and content approval.
- Activity/audit log for logins where available, role changes, listing edits, price/status changes, exports, approvals, and data deletion.
- Business settings for contact details, service areas, property types, lead stages, sources, notification rules, and legal pages.
- Dashboard numbers must be calculated from real database records and show the reporting period.
- CSV import must validate rows and offer a dry-run preview before writing records.

## 9. Core data model (proposed, subject to inspection of the real database)

- `profiles`, `organisations`, `organisation_memberships`, `role_permissions`
- `properties`, `property_media`, `property_documents`, `property_status_history`
- `developers`, `projects`, `project_phases`, `project_units`, `project_documents`, `construction_milestones`
- `customers`, `leads`, `lead_activities`, `lead_assignments`, `tasks`, `visits`, `offers`
- `saved_properties`, `saved_searches`, `enquiries`, `notifications`
- `investment_opportunities`, `investor_interests`
- `content_pages`, `audit_events`, `import_jobs`

Use UUID primary keys, foreign keys, appropriate unique constraints, indexes for common filters, created/updated timestamps, and soft-archive/status fields where recovery is important. Avoid copying personally identifiable data into logs.

## 10. Security and reliability gates

- Inspect the actual Supabase project before creating migrations. Confirm project reference, existing tables, auth setup, backups, and environment variables.
- Enable RLS on every table exposed through the Data API.
- Public anonymous users may only read explicitly published public records and submit validated enquiries through a tightly scoped path.
- Staff access must be checked against trusted role/membership records, not user-editable metadata.
- Leads, customer contacts, offers, internal notes, investor documents, budgets, and audit records are private by default.
- Do not expose Supabase service-role/secret keys in browser code or `VITE_*` variables.
- Use file size/type limits, private storage buckets for sensitive documents, and signed access where needed.
- Add rate limiting/abuse protection to public forms; validate on both client and server/database.
- Add error states, monitoring, backup/restore instructions, dependency checks, and a rollback plan.
- Test RLS with anonymous, customer, agent, listing manager, developer, investor, admin, and super-admin contexts.

## 11. Urgent delivery sequence

### Phase 0 — Consolidate and protect
- Keep `TheKhatir` canonical.
- Compare old and final repositories; preserve useful content/assets without restoring outdated routing, canonical URLs, placeholders, or weaker search.
- Keep the old repository until a backup and release verification are complete.
- Fix lockfile/CI reproducibility, environment hygiene, domain metadata, and deployment checks.

### Phase 1 — Launch-ready public experience
- Confirm all contact details and replace sample inventory with real approved listings, or visibly keep it marked as sample.
- Finish responsive search, property details, enquiry/viewing flow, and clear loading/error/empty states.
- Ensure all CTA buttons work and every listing has a unique reference.

### Phase 2 — Real database and lead CRM
- Confirm the intended Khatir Supabase project and its access.
- Create reviewed migrations, RLS policies, storage policies, and typed data access.
- Implement staff authentication, lead capture, lead assignment, activities, follow-ups, and admin listing review.
- Test all role boundaries before using real customer data.

### Phase 3 — Developers, construction, and investors
- Build project/phase/unit inventory, construction milestones, approved document access, investor opportunities, and scoped dashboards.
- Add reporting after the underlying records are reliable.

### Phase 4 — Quality and launch
- Run clean install, lint, production build, automated tests, accessibility checks, mobile checks, direct-route refresh tests, SEO checks, and role/RLS tests.
- Verify Netlify environment variables and production domain.
- Perform a manual end-to-end test from property search through lead assignment and follow-up.
- Document backups, incident response, and rollback.

## 12. Definition of done

The project is not production-ready merely because the homepage looks polished. A release is ready only when:
- The public website uses the intended canonical domain and direct links refresh correctly.
- Every public property is real and approved or visibly labelled as sample.
- Staff can securely create/review/publish listings.
- Enquiries create private, trackable leads with ownership, stages, activities, and next follow-up.
- Each role can only access records it is authorised to access.
- Developer, project, unit, and investor information has clear approval and visibility rules.
- Core journeys pass on desktop and mobile; build/lint/tests pass.
- Backups, recovery, monitoring, privacy notice, and release rollback are documented.

## 13. Old repository retirement checklist

Do not delete `AmjidOfficial/Khatir` until all of these are true:
1. Compare full file inventory and identify every old-only file, image, useful copy, configuration, and commit that matters.
2. Copy useful assets/content into `TheKhatir` and verify links and imports.
3. Keep canonical fixes from `TheKhatir`, including the root router and canonical domain.
4. Confirm the final repo builds, deploys, and serves direct property/blog routes.
5. Create and verify a downloadable archive or Git bundle of the old repo and record its commit SHA.
6. Confirm no live deployment, automation, integration, or external link still depends on the old repository.
7. Prefer archiving the old repo first. Delete only after the owner explicitly confirms the backup and retirement.

