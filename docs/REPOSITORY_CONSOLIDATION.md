# Legacy Repository Consolidation

## Decision

`AmjidOfficial/TheKhatir` is the canonical repository. Do not overwrite its source with the older `AmjidOfficial/Khatir` repository wholesale.

## Tree-level comparison

A GitHub tree comparison of both default branches found:

- 119 shared non-generated file paths
- 27 shared paths with different file contents
- 1 old-only root file: `.github/workflows/deploy.yml`
- 7 final-only root files, including the CI workflow, Netlify configuration, redirects, product blueprint, database rollout guide and `PropertyDetail.tsx`
- The old repository also contains a nested `khatir-realestate-website/` directory with a second copy of the app, built/minified assets and duplicated static files.

## What was retained or improved

- The main source assets and React application already exist at the root of TheKhatir; the nested compiled copy is not a better source of truth.
- The current property data marks illustrative inventory as `SAMPLE ONLY`, rather than implying those listings are live and verified.
- The current hero and blog UI remove misleading metrics or non-functional actions found in older versions.
- Current company/social configuration and public SEO files were kept as the basis and reviewed rather than blindly replaced.
- The old `llms.txt` content was carried forward in a safer form at `public/llms.txt`. Unsupported claims such as verified live inventory and an unconfirmed founding date were removed.

## What should not be copied

The old `.github/workflows/deploy.yml` is malformed and includes a bypass for TypeScript checks, uses Node.js 20, and deploys a GitHub Pages base path. The final repository uses Netlify configuration and a CI workflow, so copying the old workflow could break or misdirect deployment.

Do not merge the old `khatir-realestate-website/` build output into the source. Minified JavaScript/CSS and duplicated public files are generated artifacts, not maintainable source.

## Deletion / retirement rule

The old repository has **not** been deleted. Keep it intact until all of the following are complete:

1. A release tag and backup of TheKhatir exist.
2. The correct Khatir Supabase project is connected and verified.
3. Production build, authentication, RLS isolation, property CRUD and lead CRM pass end-to-end tests.
4. Netlify production domain and rollback are verified.
5. The business owner approves the final cutover.

After that, archive the old repository first if possible, keep a backup, and delete it only after a final explicit review. This preserves rollback and avoids losing any unrecognised business content.
