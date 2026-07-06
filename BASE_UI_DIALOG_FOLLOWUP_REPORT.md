# Base UI Dialog Follow-Up Report

## Purpose

This follow-up completes the non-blocking Base UI Dialog Wave 1 review items before Wave 2:

- Harden/test the desktop close-button path.
- Expand desktop focus-trap and focus-restoration coverage.

This is not a new dialog migration.

## Scope

Target surface:

- `CreateListDialog` on `/lists/new`

No additional dialogs were migrated.

No Base UI Drawer was introduced.

No Radix dependency was introduced.

## Files Changed

- `frontend/src/components/ui/Dialog.tsx`
- `frontend/tests/e2e/base-ui-dialog-followup.spec.ts`
- `BASE_UI_DIALOG_FOLLOWUP_REPORT.md`

## Implementation Fix

The focused close-button test exposed that the Base UI desktop dialog close button did not expose the expected Arabic accessible name.

Minimal fix:

- `BaseUIDialogHeader` default `closeLabel` was corrected to `إغلاق`.

This aligns the Base UI desktop dialog close button with the existing custom dialog close button and does not change visible UI or product behavior.

## Tests Added

Added:

- `frontend/tests/e2e/base-ui-dialog-followup.spec.ts`

Coverage:

- Close button has accessible name `إغلاق`.
- Mouse click closes the dialog.
- Enter activates the close button.
- Space activates the close button.
- Closing returns safely to `/lists?focus=create-list`.
- Focus returns to the create-list link on `/lists`.
- Focus enters the dialog on open.
- Tab remains trapped inside the desktop dialog.
- Shift+Tab remains trapped inside the desktop dialog.
- Escape closes the dialog.
- Dialog portal cleanup occurs after close.
- Desktop uses the Base UI Dialog surface.
- Desktop does not render the mobile BottomSheet.
- No horizontal overflow is present.

## Focus-Trap Verification

The new E2E test loops through forward and reverse keyboard navigation while asserting the active element remains inside the dialog.

Verified:

- Initial focus lands on `اسم القائمة`.
- `Tab` does not escape behind the dialog.
- `Shift+Tab` does not escape behind the dialog.
- `Escape` closes the dialog.
- Focus returns safely to the `/lists` create-list affordance.

## Close Button Verification

Verified:

- Close button accessible name is `إغلاق`.
- Click closes.
- Enter closes.
- Space closes.
- Route after close is `/lists?focus=create-list`.
- Dialog root is removed after close.

## Accessibility Notes

- The Base UI Dialog desktop path now exposes the same Arabic close accessible name as the existing custom dialog path.
- The tests verify role/name access to the dialog and close button.
- The tests verify keyboard-only close and focus containment.

## Screenshots

No screenshots were updated because the implementation fix changes only the close button accessible name, not visual presentation.

## Quality Gate Results

Frontend:

- `npx playwright test tests/e2e/base-ui-dialog-followup.spec.ts`: PASS, 2 passed
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 68 passed

Backend:

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

## Dependency Policy

- Radix dependency added: no
- Base UI Drawer used: no
- New Base UI primitives added: no

## Wave 2 Readiness

Recommendation:

- Wave 2 can begin after this PR passes full gates and review.

Remaining requirement for Wave 2:

- Keep each additional dialog migration small and surface-specific.
- Preserve mobile BottomSheet behavior.
- Do not introduce Base UI Drawer.
- Keep adding direct desktop focus and close-path coverage per migrated dialog family.
