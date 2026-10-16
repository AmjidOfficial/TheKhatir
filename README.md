# Khater Property Consultant & Builders

The canonical repository for the Khater property consultancy, real-estate, construction and developer SaaS platform.

**Primary website:** https://khatir.netlify.app  
**Canonical repository:** https://github.com/AmjidOfficial/TheKhatir  
**Legacy source repository:** https://github.com/AmjidOfficial/Khatir  
**Initial market:** Peshawar, Khyber Pakhtunkhwa, Pakistan  
**Confirmed Supabase project reference:** `vpjslrrfgmvkurohplzq`

## Product vision

Build a trusted, mobile-first, multi-tenant SaaS platform for property seekers, agents, real-estate businesses, investors, developers, builders and platform administrators. It combines a public property marketplace with secure business workspaces, lead CRM, project and construction operations, advertising, events, SEO publishing and SaaS administration.

## Current technology

- React 18, TypeScript and Vite
- Tailwind CSS and shadcn/ui
- React Router
- Supabase client package, with database schema and production access still requiring verification
- Netlify deployment with SPA redirects

## Local development

Requires a supported Node.js LTS release and npm.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the approved Khatir Supabase project. These are browser-side configuration values. Never place a Supabase service-role key, secret key or provider secret in a `VITE_*` variable or commit it to Git.

The Supabase CLI project reference is set in `supabase/config.toml`. Before running database commands, confirm that your authenticated CLI account can access project `vpjslrrfgmvkurohplzq`. Do not target another project by assumption.

## Available scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — lint checks
- `npm run preview` — preview the built app

## Production rules

1. Do not publish invented properties, prices, approvals, returns, reviews, user counts or availability as facts.
2. Clearly label sample content and replace it with business-approved inventory before launch.
3. Confirm ownership, authority approvals, listing status, price, contact details and last-updated date with the responsible team.
4. Protect enquiries and personal information with database-enforced Row Level Security (RLS), not only UI checks.
5. Never expose service-role keys or provider secrets in frontend code or Git.
6. Test mobile layouts, keyboard access, forms, direct-route refreshes, error states and tenant isolation before release.
7. Keep this repository as the single source of truth. Review changes in branches and pull requests, back up the legacy repository, and verify production builds before deployment.

## Product documents

- [Project audit and roadmap](docs/PROJECT_AUDIT_AND_ROADMAP.md)
- [SaaS product blueprint](docs/SAAS_PRODUCT_BLUEPRINT.md)

These documents describe the target architecture and acceptance gates. They are not a claim that every module is implemented. A feature is complete only after it works with real persisted data and passes its tests.
