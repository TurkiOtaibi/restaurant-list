# Base UI Dialog Wave 1 Report

## Approved Strategy

Strategy A was applied for Wave 1:

- Desktop: Base UI Dialog.
- Mobile: existing custom BottomSheet.
- `ResponsiveDialog` remains the orchestration component.
- No Base UI Drawer.
- No Radix.
- No product behavior change.

## Target Migrated

Wave 1 migrated only:

- `CreateListDialog` on `/lists/new`

No other dialog, menu, drawer, popover, select, combobox, rating, profile, favorite, image, or destructive confirmation surface was migrated.

## Why Only Wave 1

`CreateListDialog` is the safest eligible desktop Dialog pilot:

- Non-destructive.
- Isolated route-mounted surface.
- Existing dialog contract coverage already exists.
- Mobile can retain the proven custom BottomSheet.
- Rollback is small and contained.

Remaining dialogs are intentionally deferred because they involve destructive actions, dense mobile flows, file upload, rating accessibility, favorites editing, or profile mutations.

## Files Changed

- `frontend/src/components/ui/Dialog.tsx`
- `frontend/src/features/lists/CreateListDialog.tsx`
- `frontend/tests/e2e/base-ui-dialog-wave-1.spec.ts`
- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
- `docs/qa-execution/base-ui-dialog-wave-1/screenshots/create-list-dialog-desktop-open.png`
- `docs/qa-execution/base-ui-dialog-wave-1/screenshots/create-list-dialog-bottom-sheet-390x844-open.png`
- `docs/qa-execution/base-ui-dialog-wave-1/screenshots/create-list-dialog-bottom-sheet-320x568-open.png`
- `BASE_UI_DIALOG_WAVE_1_REPORT.md`

## Desktop Base UI Dialog Behavior

`ResponsiveDialog` now accepts an optional backward-compatible `desktopPresentation` prop.

`CreateListDialog` passes:

```tsx
desktopPresentation="base-ui"
```

On desktop, that renders a Base UI Dialog-backed surface while preserving:

- existing `.ds-modal` styling
- title
- accessible dialog name
- initial focus selector
- validation
- submit behavior
- cancel behavior
- close behavior
- Escape behavior
- unsaved-change confirmation
- focus containment
- body-level portal marker used by existing tests

Pointer dismissal is disabled to preserve the current behavior: backdrop/outside click is not used as a close path.

## Mobile BottomSheet Preservation

Mobile behavior is unchanged:

- `ResponsiveDialog` still selects the existing custom `BottomSheet` below 768px.
- No Base UI Drawer was introduced.
- The BottomSheet grabber remains visible.
- Existing safe-area padding and mobile sheet styles remain in `globals.css`.

## Accessibility Notes

Verified by E2E:

- Desktop dialog is exposed by role/name.
- Initial focus lands on `اسم القائمة`.
- Validation remains visible and associated with the field behavior.
- Mobile BottomSheet remains exposed as a dialog.
- Existing `responsive-dialog-contract.spec.ts` still passes.

## RTL / Mobile Notes

Verified by E2E:

- Arabic labels remain unchanged.
- No horizontal overflow at desktop, 390x844, or 320x568.
- Mobile 390x844 and 320x568 still render the custom BottomSheet.
- BottomSheet safe-area behavior remains governed by existing CSS.

## Screenshots

- `docs/qa-execution/base-ui-dialog-wave-1/screenshots/create-list-dialog-desktop-open.png`
- `docs/qa-execution/base-ui-dialog-wave-1/screenshots/create-list-dialog-bottom-sheet-390x844-open.png`
- `docs/qa-execution/base-ui-dialog-wave-1/screenshots/create-list-dialog-bottom-sheet-320x568-open.png`

## Tests Updated

Added:

- `frontend/tests/e2e/base-ui-dialog-wave-1.spec.ts`

Updated:

- `frontend/tests/e2e/ui-dependency-policy.spec.ts`

Coverage added:

- desktop CreateListDialog uses Base UI Dialog
- desktop accessible dialog name
- desktop initial focus
- desktop validation
- desktop submit behavior
- desktop no-horizontal-overflow check
- mobile 390x844 keeps custom BottomSheet
- mobile 390x844 validation/cancel behavior
- mobile 320x568 keeps custom BottomSheet
- mobile 320x568 submit behavior
- no Radix dependency policy remains enforced
- Base UI Drawer remains disallowed by dependency-policy omission

## Quality Gate Results

Frontend:

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 66 passed

Backend:

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

## Dependency Policy

- Radix dependency added: no
- Base UI Drawer used: no
- Base UI Dialog used: yes, desktop presentation only for `CreateListDialog`

## Remaining Rollout Waves

Wave 2:

- Remaining low-risk list dialogs after Wave 1 review.

Wave 3:

- Place-related non-destructive dialogs.

Wave 4:

- Rating, favorites, and profile dialogs after focused audit.

Wave 5:

- Destructive alert dialogs only after confirmation behavior is proven equivalent.

Base UI Drawer remains deferred.

## Remaining Risks

- Base UI Dialog is currently piloted on one desktop surface only.
- Future waves must avoid broad `ResponsiveDialog` rewrites.
- Mobile BottomSheet must remain protected until a dedicated Drawer audit proves parity.
- Future dialog migrations need screenshot-backed RTL/mobile/accessibility review.
