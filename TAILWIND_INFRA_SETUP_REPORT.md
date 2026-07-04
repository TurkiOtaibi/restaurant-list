# Tailwind Infrastructure Setup Report

## Executive Summary

Added Tailwind CSS infrastructure to the frontend only. This is Phase 1 from `UI_STACK_MIGRATION_FEASIBILITY.md`: setup only, with no component migration, no shadcn, no Base UI, no route changes, and no product behavior changes.

The existing `frontend/app/globals.css` design tokens and custom `ds-*` CSS remain intact. Tailwind is wired through the official Tailwind v4 PostCSS plugin and imported before the existing CSS so current application styles continue to win in the cascade.

## Current Stack Verified

Evidence inspected:

- `frontend/package.json`
- `frontend/app/globals.css`
- `frontend/next.config.ts`
- `frontend/tsconfig.json`
- frontend app structure under `frontend/app`

Verified stack:

- Next.js `^15.3.0`
- React `^19.0.0`
- TypeScript `^5.8.0`
- App Router under `frontend/app`
- Existing plain CSS design tokens in `frontend/app/globals.css`
- No prior Tailwind config
- No prior PostCSS config
- No shadcn setup
- No Base UI setup

## Packages Added

Added frontend dev dependencies:

- `tailwindcss`
- `@tailwindcss/postcss`

`postcss` was not added as a direct dependency because the repo already has an `overrides.postcss` pin. Attempting to add `postcss` directly caused an npm override conflict. The Tailwind PostCSS integration works through `@tailwindcss/postcss`, and the build passed.

No shadcn packages were installed.

No Base UI packages were installed.

## Config Files Added / Changed

Added:

- `frontend/postcss.config.mjs`

Changed:

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/app/globals.css`

No Tailwind component migration files were added.

No `components.json` was added.

## globals.css Impact

Added only:

```css
@import "tailwindcss";
```

at the top of `frontend/app/globals.css`.

All existing tokens, app shell rules, RTL behavior, safe-area behavior, custom components, and page styles remain in place below the import.

Tailwind utilities are now available, but no application screen was converted to Tailwind classes.

## Confirmation: No UI Migration Happened

Confirmed:

- No components migrated to Tailwind.
- No shadcn components added.
- No Base UI components added.
- No backend files changed.
- No routes changed.
- No auth/session code changed.
- No API contracts changed.
- No database/migration files changed.
- Existing `globals.css` tokens remain.

## Quality Gate Results

Frontend:

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 52 passed

Backend / repository regression:

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

Backend pytest emitted existing deprecation warnings in `backend/app/modules/places/image_service.py` for deprecated Starlette/FastAPI status constants. No backend code was changed.

## Remaining Risks

- Tailwind Preflight is now present through `@import "tailwindcss"`. Existing CSS currently overrides the app's active surfaces, and full E2E passed, but future UI changes must account for Tailwind base styles.
- The repo still has a large `globals.css`; this setup does not solve CSS organization.
- Tailwind utilities are available but unused. Future PRs should migrate one low-risk primitive at a time.
- shadcn and Base UI are not installed yet, by design.

## Next Recommended Phase

Phase 2 should add shadcn configuration only, without importing or replacing production UI components.

Recommended next steps:

1. Add `components.json` with paths that do not collide with existing PascalCase UI primitives.
2. Add a `cn` utility only if needed, while preserving existing `cx`.
3. Do not install Base UI until the shadcn config path is settled.
4. Do not migrate `Dialog`, `ActionMenu`, `RatingControl`, `AppNav`, `PlaceCard`, or page-level layouts in Phase 2.
