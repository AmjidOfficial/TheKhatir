# Khatir Real Estate & Builders

The production codebase for the Khatir property and development platform.

**Primary website:** https://khatir.netlify.app  
**Primary repository:** https://github.com/AmjidOfficial/TheKhatir  
**Business focus:** Peshawar, Khyber Pakhtunkhwa, Pakistan

## Product vision

Build a trusted, mobile-first property platform for buying, selling, renting, property consultancy, construction, and development projects. The experience should combine the ease of a property search portal with the local knowledge and personal service of Khatir.

## Current technology

- React 18, TypeScript, and Vite
- Tailwind CSS and shadcn/ui
- React Router
- Supabase client package is present; production database integration and policies still require verification
- Netlify deployment with SPA redirects

## Run locally

Requirements: a supported Node.js LTS release and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set the public Supabase project URL and publishable/anon key in `.env.local` only if the relevant Supabase project is configured. Never put a Supabase service-role key or other server secret in a `VITE_*` variable.

## Available scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — lint checks
- `npm run preview` — preview the built app

## Production principles

1. Do not publish invented properties, prices, client counts, returns, approvals, or availability as facts.
2. Clearly label demo/sample content and replace it with approved, current inventory before launch.
3. Confirm ownership, authority approvals, listing status, price, and last-updated date with the responsible team.
4. Treat enquiries and customer data as private. Enforce access in the database, not only in the UI.
5. Keep credentials out of Git. Use environment variables and platform secret settings.
6. Test mobile layouts, keyboard navigation, forms, page refresh/deep links, and error states before release.
7. Keep this repository as the single source of truth. Review changes in branches/PRs and verify the production build before deploying.

## Project plan

See [docs/PROJECT_AUDIT_AND_ROADMAP.md](docs/PROJECT_AUDIT_AND_ROADMAP.md) for the audit findings and launch blockers. See [docs/SAAS_PRODUCT_BLUEPRINT.md](docs/SAAS_PRODUCT_BLUEPRINT.md) for the target multi-tenant SaaS scope, roles, CRM, advertising, events, developer/builders workspace, security requirements, and release gates.
