# shadcn Pilot Report

## Executive Summary

Phase 2 of the UI stack migration adds a minimal shadcn/ui infrastructure pilot to the existing Next.js, React, TypeScript, and Tailwind v4 frontend.

The approved product direction is:

- Preferred: shadcn + Base UI
- Not preferred: shadcn + Radix

The initial `Separator` pilot pulled in `radix-ui`, so it was removed. This revised pilot keeps only shadcn configuration and the standard class-name utility needed for future shadcn components.

No shadcn component is currently rendered in the app.

## Current Stack Verified

- Framework: Next.js 15
- UI runtime: React 19
- Language: TypeScript
- Styling: existing `frontend/app/globals.css` design tokens plus Tailwind v4 infrastructure
- Existing UI primitives: custom components under `frontend/src/components/ui`

## What Was Installed

Runtime dependencies retained:

- `clsx`
- `tailwind-merge`

These are justified by the shadcn-compatible `cn` utility in `frontend/src/lib/utils.ts`.

Removed:

- `radix-ui`

Not installed:

- `@base-ui-components/react`
- shadcn CLI package as a runtime dependency
- Base UI component packages

## Files Changed

- `frontend/components.json`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/src/lib/utils.ts`
- `SHADCN_PILOT_REPORT.md`

## shadcn Configuration

`frontend/components.json` is present and configured for the Base UI direction with:

- `style: "base-nova"`
- `rtl: true`
- aliases matching the existing `@/*` import setup

This keeps the project ready for a future Base UI-backed shadcn component pilot without committing Radix.

## Component Added

None.

The Radix-backed `Separator` component was removed because the preferred stack is shadcn + Base UI and Radix is not approved for this pilot.

## UI Usage

None.

No application screen renders a shadcn component in this revised pilot.

## Why This Is Low Risk

- There is no visible UI change.
- There is no component migration.
- Existing CSS tokens and `globals.css` remain intact.
- Existing custom components remain the active design system.
- The change does not affect routing, auth, API calls, forms, menus, dialogs, or state transitions.

## No Base UI Installed Yet

Confirmed:

- `@base-ui-components/react` is not installed.
- No Base UI component was added.
- No Base UI migration was performed.

This is intentional. A future Base UI pilot should add one approved Base UI-backed shadcn component after confirming the generated component does not introduce Radix.

## No Radix Installed

Confirmed:

- `radix-ui` is not installed.
- No Radix-backed shadcn component remains.
- No application code imports Radix.

## Behavior Preservation

No product behavior changed.

The pilot does not:

- Replace existing design-system primitives.
- Add visible UI.
- Modify backend code.
- Modify API contracts.
- Modify auth/session behavior.
- Modify database or migrations.
- Change routes.
- Change navigation.
- Migrate Dialog, Sheet, Menu, ActionMenu, ResponsiveDialog, forms, or navigation.

## Quality Gate Results

Frontend:

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 52 passed

Backend:

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

## Remaining Risks

- shadcn CLI presets can generate extra files depending on selected base and preset; future additions must inspect and revert unintended output before commit.
- Future Base UI-backed component additions may require `@base-ui-components/react`; that should be introduced only with an explicitly approved component pilot.
- Future components may require token integration and screenshot evidence.

## Recommendation For Next shadcn Component

Next pilot should be a Base UI-backed, low-risk presentational component only after confirming the generated code and dependency tree do not include Radix.

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
