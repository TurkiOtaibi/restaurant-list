# ResponsiveDialog Contract Test Report

## Executive Summary

Added focused E2E coverage for the existing `ResponsiveDialog` accessibility foundation without changing production implementation code. The tests use the profile edit dialog as a safe representative surface because it is non-destructive, mock-backed, and already built on `ResponsiveDialog`.

## Scope

- Tests only.
- No Base UI Dialog or Drawer migration.
- No Radix dependency.
- No backend, API, auth, database, route, or product behavior changes.

## Surface Tested

| Surface | File | Reason |
| --- | --- | --- |
| Profile edit dialog | `frontend/src/features/profile/ProfileArchivePage.tsx` | Safe, non-destructive `ResponsiveDialog` usage with accessible title, initial focus target, form controls, close affordance, and profile state that can be mocked locally. |

## Tests Added

File:

- `frontend/tests/e2e/responsive-dialog-contract.spec.ts`

Coverage:

- Dialog exposes an accessible name from its title.
- Initial focus moves to the configured profile name field.
- Dialog portal root is created.
- Body scroll is locked while open.
- Background body children are isolated with `inert` and `aria-hidden`.
- Keyboard Tab focus remains inside the dialog.
- Escape closes the dialog.
- Focus returns to the opener after close.
- Portal root, scroll lock, and background isolation are cleaned up after close.
- Close button preserves existing profile edit behavior and does not save unsaved text.

## Behavior Preservation

The tests do not submit profile edits, do not execute destructive actions, and do not rely on production data. They assert current behavior only.

## Known Gaps

- Unsaved-change confirmation is not covered here because the selected profile edit surface does not currently pass `hasUnsavedChanges` to `ResponsiveDialog`.
- `alertdialog` role behavior is not covered in this follow-up because list deletion is a destructive surface and should have its own isolated test plan.
- Mobile geometry screenshots were not added in this test-only step; existing responsive layout tests continue to cover dialog fit on narrow viewports.

## Quality Gate Results

- Focused E2E: `npx playwright test tests/e2e/responsive-dialog-contract.spec.ts` — PASS, 2 passed.
- Frontend lint: `npm run lint` — PASS.
- Frontend typecheck: `npm run typecheck` — PASS.
- Frontend build: `npm run build` — PASS.
- Full E2E: `npm run test:e2e` — PASS, 60 passed.
- Backend format: `python -m ruff format --check .` — PASS, 79 files already formatted.
- Backend lint: `python -m ruff check .` — PASS.
- Backend typecheck: `python -m mypy app tests` — PASS.
- Backend tests: `python -m pytest -q` — PASS, 78 passed, 1 skipped.

## Dependency Policy

- Radix dependency added: no.
- Base UI Dialog used: no.
- Base UI Drawer used: no.

## Recommendation

This coverage makes a future Base UI Dialog audit safer, but it does not authorize a Dialog or ResponsiveDialog migration. A future migration still needs a dedicated audit, screenshots, mobile Safari verification, and full release gates.
