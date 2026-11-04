# Khatir Property Consultant & Builders — Responsive QA Plan

## Universal brand rule
Use the exact public brand name **Khatir Property Consultant & Builders** in the navigation logo, footer, browser title, metadata, Open Graph/Twitter cards, structured data, PWA manifest, email templates and workspace sign-in. Use **Khatir Property** only where a short label is required.

## Header and logo
- Use the horizontal brand artwork in the public navigation, not the monogram alone.
- Keep the logo proportional with a constrained width and auto height.
- Keep the header compact and account for iOS/Android safe areas.
- At narrow widths, show the logo, sign-in action and menu without clipping.
- Keep the full navigation in the desktop layout and an accessible expandable menu on smaller screens.
- Keep the hero heading below the fixed header.

## Responsive layout
- Mobile first. Base layout uses single-column flex/grid; expand to two columns at tablet and multi-column layouts at desktop.
- Test at 320, 360, 375, 390, 414, 768, 1024, 1280 and 1440 CSS pixels.
- Test portrait and landscape, browser zoom, keyboard focus, long labels, Urdu/RTL content, and safe-area insets.
- No horizontal page scroll. Tables and wide data views must scroll inside their own container.
- Buttons and fields should have at least 44px touch targets.
- Respect reduced-motion settings and avoid fixed UI covering headings or forms.

## Marketing and discovery
- One canonical URL per public page; unique title and description.
- Open Graph and Twitter metadata with a branded, crawlable share image.
- JSON-LD for the real business and appropriate property/project/article pages. Do not add fake ratings, stock, approvals or business claims.
- Add useful area and society pages only when they contain real, unique information.
- AEO: answer common buyer questions clearly, add visible FAQs where useful, and use matching FAQ/article structured data only when the same answers are visible on the page.
- Keep private workspace, account, lead and customer pages noindex.
- Generate sitemap entries only for canonical public pages; keep robots.txt from blocking resources needed to render pages.
- Track consented lead source, campaign, landing page and property reference. Add spam protection, validation and clear privacy consent before public forms are enabled.

## SaaS release gates
- Authentication and password recovery must use the dedicated Khatir Supabase project.
- Users can edit/archive their own posts; tenant admins can manage their own business workspace; platform admins moderate across tenants.
- Enforce every permission in PostgreSQL RLS, not only in the UI.
- Do not expose private customer or owner data through public views.
- Test two separate tenant accounts to prove data isolation.
- Apply database migrations only to the approved Khatir project, never the N-LINK360 project.
- Do not claim production-ready until storage, public lead endpoints, audit logs, moderation, backups, monitoring and restore tests pass.

## Browser/device test matrix
| Viewport | Primary checks |
| --- | --- |
| 320–360 | Logo + login + menu fit; no horizontal scroll; form fields fit |
| 375–430 | Header, hero, property cards, footer and floating WhatsApp do not overlap |
| 768 | Tablet navigation and two-column content |
| 1024–1280 | Desktop navigation, card grids, dashboard tables |
| 1440+ | Max-width containers, balanced whitespace, no stretched text lines |
| Landscape | Header does not consume the screen; menu remains scrollable |

## Manual QA still required
Run real-device checks on Android Chrome and iOS Safari, plus current desktop Chrome, Firefox, Safari and Edge. Automated build success alone does not prove real-device responsiveness.
