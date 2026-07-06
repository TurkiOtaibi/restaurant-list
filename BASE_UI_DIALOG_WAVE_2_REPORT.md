# Base UI Dialog Wave 2 Report

## Approved Strategy

Strategy A continues:

- Desktop: Base UI Dialog.
- Mobile: existing custom BottomSheet.
- `ResponsiveDialog` remains the orchestration component.
- No Base UI Drawer.
- No Radix.
- No product behavior change.

## Target Migrated

Wave 2 migrates only:

- `EditListDialog` on list detail pages.

No delete, add-place, place, rating, profile, favorites, image, menu, select, combobox, or drawer surface was migrated.

## Why This Target

`EditListDialog` is the next smallest eligible list dialog after the released `CreateListDialog` pilot:

- It is a list-owned dialog surface.
- It is non-destructive.
- It already uses `ResponsiveDialog`.
- The mobile BottomSheet can remain unchanged.
- It shares the same dialog accessibility contract as Wave 1.

Deferred from this wave:

- `DeleteListDialog`, because it is destructive `alertdialog` behavior.
- `AddPlaceDialog`, because it is a denser search and mutation surface.

## Files Changed

- `frontend/src/features/lists/EditListDialog.tsx`
- `frontend/tests/e2e/base-ui-dialog-wave-2.spec.ts`
- `docs/qa-execution/base-ui-dialog-wave-2/screenshots/edit-list-dialog-desktop-open.png`
- `docs/qa-execution/base-ui-dialog-wave-2/screenshots/edit-list-dialog-bottom-sheet-390x844-open.png`
- `docs/qa-execution/base-ui-dialog-wave-2/screenshots/edit-list-dialog-bottom-sheet-320x568-open.png`
- `BASE_UI_DIALOG_WAVE_2_REPORT.md`

## Desktop Base UI Dialog Behavior

`EditListDialog` now passes:

```tsx
desktopPresentation="base-ui"
```

On desktop, it renders through the Base UI Dialog-backed `ResponsiveDialog` path while preserving:

- existing `.ds-modal` styling
- title and accessible name
- initial focus on the list name field for normal lists
- validation
- submit behavior
- cancel behavior
- close behavior
- Escape behavior
- unsaved-change confirmation behavior
- focus containment
- portal cleanup

## Mobile BottomSheet Preservation

Mobile behavior is unchanged:

- `ResponsiveDialog` still chooses the custom BottomSheet under 768px.
- No Base UI Drawer was introduced.
- Existing grabber, safe-area, and mobile sheet styling remain in place.

## Behavior Parity Notes

Preserved:

- normal list rename behavior
- visibility selector behavior
- system-list name field hiding behavior
- save/cancel semantics
- validation for an empty normal-list name
- no backend or API contract changes

## Accessibility Notes

The new E2E coverage verifies:

- desktop dialog role/name
- Base UI Dialog surface marker on desktop
- name field initial focus
- keyboard focus remains inside the dialog
- mobile still exposes the existing BottomSheet dialog
- no horizontal overflow

## RTL / Mobile Notes

Arabic labels and RTL layout are unchanged. Screenshots cover:

- desktop dialog open state
- 390x844 mobile BottomSheet
- 320x568 mobile BottomSheet

## Screenshots

- `docs/qa-execution/base-ui-dialog-wave-2/screenshots/edit-list-dialog-desktop-open.png`
- `docs/qa-execution/base-ui-dialog-wave-2/screenshots/edit-list-dialog-bottom-sheet-390x844-open.png`
- `docs/qa-execution/base-ui-dialog-wave-2/screenshots/edit-list-dialog-bottom-sheet-320x568-open.png`

## Tests Updated

Added:

- `frontend/tests/e2e/base-ui-dialog-wave-2.spec.ts`

Coverage:

- desktop `EditListDialog` uses Base UI Dialog
- desktop accessible dialog name
- desktop initial focus
- desktop validation
- desktop submit behavior
- desktop focus containment
- mobile 390x844 keeps custom BottomSheet
- mobile 390x844 validation/cancel behavior
- mobile 320x568 keeps custom BottomSheet
- mobile 320x568 submit behavior
- no horizontal overflow

## Quality Gate Results

Frontend:

- `npm exec playwright test tests/e2e/base-ui-dialog-wave-2.spec.ts`: PASS, 3 passed
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 71 passed

Backend:

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

Notes:

- One full E2E attempt hit a local Next.js web-server out-of-memory failure after 70 passing tests.
- A later full E2E rerun completed cleanly with 71 passed.

## Dependency Policy

- Radix dependency added: no
- Base UI Drawer used: no
- Base UI Dialog used: yes, desktop presentation only for `EditListDialog`

## Remaining Rollout Waves

Wave 3 candidates:

- Place-related non-destructive dialogs after focused audit.
- `AddPlaceDialog` only after search/dialog interaction risk is explicitly reviewed.

Still deferred:

- destructive `DeleteListDialog` / alertdialog
- rating dialogs
- profile/favorites dialogs
- image upload dialogs
- Base UI Drawer

## Remaining Risks

- This is still a hybrid desktop/mobile dialog strategy.
- Future waves must keep each dialog migration surface-specific.
- Destructive alert dialogs still require a separate confirmation-behavior audit.
