# shadcn Pilot Report

## Executive Summary

Phase 2 of the UI stack migration added a minimal shadcn/ui pilot to the existing Next.js, React, TypeScript, and Tailwind v4 frontend.

The pilot is intentionally narrow:

- shadcn/ui configuration was added.
- One shadcn component was added: `Separator`.
- The component is used once on `/profile` as a decorative, non-interactive section divider.
- No Base UI package was installed.
- No dialog, sheet, menu, popover, select, command, form, navigation, ActionMenu, or ResponsiveDialog migration was performed.
- No backend, API, auth, database, route, or product behavior was changed.

## Current Stack Verified

- Framework: Next.js 15
- UI runtime: React 19
- Language: TypeScript
- Styling: existing `frontend/app/globals.css` design tokens plus Tailwind v4 infrastructure
- Existing UI primitives: custom components under `frontend/src/components/ui`

## What Was Installed

Runtime dependencies added:

- `clsx`
- `tailwind-merge`
- `radix-ui`

No Base UI dependency was added.

The generated default shadcn Button and layout/font changes from the preset were reverted because this pilot must not migrate existing primitives or alter typography/layout.

## Files Changed

- `frontend/components.json`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/src/lib/utils.ts`
- `frontend/src/components/ui/separator.tsx`
- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `SHADCN_PILOT_REPORT.md`

## Component Added

Component:

- `Separator`

Location:

- `frontend/src/components/ui/separator.tsx`

The component is Radix-backed through the shadcn CLI's Radix base selection. It was customized to use the app's existing premium border token via `var(--color-premium-border)` so it does not require global shadcn theme overrides.

## Where It Was Used

Used once:

- `frontend/src/features/profile/ProfileArchivePage.tsx`

Placement:

- Between `ProfileStats` and `FavoritePlacesStrip`.

## Why This Location Is Low Risk

- The separator is decorative and non-interactive.
- It does not affect form submission, routing, auth, API calls, menus, dialogs, or state transitions.
- It is inside an already-rendered profile section stack.
- It uses existing dark theme tokens.
- It preserves RTL because it has no directional content.

## No Base UI Installed

Confirmed:

- `@base-ui-components/react` is not installed.
- No Base UI component was added.
- No Base UI migration was performed.

## Behavior Preservation

No product behavior changed.

The pilot does not:

- Replace existing design-system primitives.
- Modify backend code.
- Modify API contracts.
- Modify auth/session behavior.
- Modify database or migrations.
- Change routes.
- Change navigation.
- Migrate existing Dialog, Sheet, Menu, ActionMenu, or ResponsiveDialog components.

## Quality Gate Results

Frontend:

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 52 passed

Backend:

- `python -m ruff format --check .`: PASS, 79 files already formatted
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS, no issues in 66 source files
- `python -m pytest -q`: PASS, 78 passed, 1 skipped, 4 warnings

## Remaining Risks

- shadcn's current CLI can generate extra default files depending on preset; future additions must inspect and revert unintended output before commit.
- The current shadcn Separator uses the `radix-ui` package, which is acceptable for this pilot but should not be treated as a broader Radix migration.
- Future shadcn components may require more global token integration; those should be piloted one at a time with screenshots.

## Recommendation For Next shadcn Component

Next low-risk candidate:

- `Badge`, added as a standalone shadcn component only if it can coexist without replacing the existing app `Badge`.

Avoid next:

- Dialog
- Sheet
- Menu
- Popover
- Select
- Command
- Form
- Navigation
- ActionMenu
- ResponsiveDialog
