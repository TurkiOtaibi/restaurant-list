# ResponsiveDialog Confirm-Close Follow-Up Report

## Purpose

This follow-up closes one remaining gap from the ResponsiveDialog contract test pass: unsaved-change confirm-close behavior.

This is a tests/report-only step. It does not migrate to Base UI Dialog or Drawer.

## Contract Interpretation

`RESPONSIVEDIALOG_ACCESSIBILITY_CONTRACT.md` requires close attempts with unsaved changes to show confirmation UI, keep the dialog open when canceled, and close through the original close path when confirmed.

## Surface Tested

| Surface | File | Reason |
| --- | --- | --- |
| Create list route-mounted dialog | `frontend/app/lists/new/page.tsx` via `CreateListDialog` | It uses `ResponsiveDialog`, `hasUnsavedChanges`, `confirmCloseMessage`, route-mounted open behavior, and a non-destructive mocked E2E path. |

## Tests Added

Updated:

- `frontend/tests/e2e/responsive-dialog-contract.spec.ts`

Added coverage:

- `/lists/new` opens the route-mounted create-list dialog for an authenticated mocked session.
- Initial focus lands on the list name field.
- Entering an unsaved list name makes Escape show the confirm-close notice.
- The confirm-close notice stays inside the dialog and uses alert semantics.
- Cancel keeps the dialog open and preserves the unsaved input value.
- Confirm closes the dialog through the existing close route.
- Dialog portal cleanup and body scroll-lock cleanup still happen after confirm close.

## Behavior Preservation

The test is mock-backed and does not submit the create-list form. No list is created. No API contract, route behavior, backend behavior, or product behavior is changed.

## Base UI Migration Status

- Base UI Dialog used: no.
- Base UI Drawer used: no.
- Base UI Menu changes: no.
- Radix dependency added: no.

## Remaining Dialog Migration Risks

- `alertdialog` delete-list behavior still needs a separate destructive-flow test plan.
- Mobile geometry screenshots for this specific confirm-close state were not added in this follow-up.
- A future Base UI Dialog pilot still requires a separate approval and must target exactly one dialog surface.

## Quality Gate Results

- Focused E2E: `npx playwright test tests/e2e/responsive-dialog-contract.spec.ts` - PASS, 3 passed.
- Backend format: `python -m ruff format --check .` - PASS, 79 files already formatted.
- Backend lint: `python -m ruff check .` - PASS.
- Backend typecheck: `python -m mypy app tests` - PASS.
- Backend tests: `python -m pytest -q` - PASS, 78 passed, 1 skipped.
- Frontend lint: `npm run lint` - PASS.
- Frontend typecheck: `npm run typecheck` - PASS.
- Frontend build: `npm run build` - PASS.
- Full E2E: `npm run test:e2e` - PASS, 62 passed.

## Recommendation

This follow-up makes future Dialog migration safer, but it does not authorize a Base UI Dialog or ResponsiveDialog migration. Continue to defer implementation until a single low-risk dialog pilot is explicitly approved.
