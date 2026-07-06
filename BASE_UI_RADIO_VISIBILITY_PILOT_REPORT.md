# Base UI Radio Visibility Pilot Report

## Why Radio/RadioGroup Was Chosen

Wave 2 selected the list visibility selector because it is a small, shared form-control surface with clear radio semantics and no overlay, portal, z-index, or bottom-navigation risk. The current native implementation was already accessible, so this pilot is intentionally incremental and verifies Base UI Radio/RadioGroup compatibility without changing list behavior.

## Target Surface

- `frontend/src/features/lists/VisibilitySelector.tsx`
- Shared by:
  - `frontend/src/features/lists/CreateListDialog.tsx`
  - `frontend/src/features/lists/EditListDialog.tsx`

## Files Changed

- `frontend/src/features/lists/VisibilitySelector.tsx`
- `frontend/app/globals.css`
- `frontend/tests/e2e/sprint3-real.spec.ts`
- `frontend/tests/e2e/wishlist-phase-5.spec.ts`
- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/create-list-visibility-390x844-after.png`
- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/edit-list-visibility-390x844-after.png`
- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/system-list-visibility-390x844-after.png`
- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/focused-radio-390x844-after.png`
- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/create-list-visibility-320x568-after.png`
- `BASE_UI_RADIO_VISIBILITY_PILOT_REPORT.md`

## Behavior Parity Notes

- `VisibilitySelector` public props are preserved:
  - `disabled`
  - `legend`
  - `name`
  - `onChange`
  - `value`
- Submitted values remain `private` and `public`.
- Create-list default remains private.
- Selecting public/private still updates local state.
- Existing create-list and edit-list save flows remain unchanged.
- System-list visibility remains editable while name editing remains hidden.
- No backend, API, auth, database, route, or product behavior changed.

## Accessibility Notes

- Base UI `RadioGroup` is labelled by the visible Arabic `legend`.
- Each Base UI `Radio.Root` remains associated with the visible Arabic option label through the wrapping label.
- E2E covers the `radiogroup` accessible name and both radio accessible names.
- E2E covers selected state and keyboard ArrowDown selection.
- Focus remains visible through `.ds-visibility__option:focus-within`.

## RTL / Mobile Notes

- Existing `ds-visibility` class hooks and layout remain in use.
- Arabic legend and labels remain visible.
- RTL alignment remains unchanged.
- Screenshots were captured at 390x844 and 320x568.
- No horizontal overflow or mobile bottom-sheet layout regression was observed in screenshot capture.

## Screenshots

- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/create-list-visibility-390x844-after.png`
- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/edit-list-visibility-390x844-after.png`
- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/system-list-visibility-390x844-after.png`
- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/focused-radio-390x844-after.png`
- `docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/create-list-visibility-320x568-after.png`

## Tests Updated

- `frontend/tests/e2e/sprint3-real.spec.ts`
  - Verifies create-list default private selected state.
  - Verifies selecting public before create.
  - Verifies edit-list public selected state.
  - Verifies selecting private before save.
- `frontend/tests/e2e/wishlist-phase-5.spec.ts`
  - Verifies system-list edit dialog exposes a labelled radio group.
  - Verifies private/public radio accessible names.
  - Verifies ArrowDown keyboard selection.
  - Verifies saving visibility still updates the system list.
- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
  - Adds reviewed allow-list entries for `@base-ui/react/radio` and `@base-ui/react/radio-group`.
  - Keeps Radix absence coverage.

## Focused Verification

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npx playwright test tests/e2e/wishlist-phase-5.spec.ts tests/e2e/sprint3-real.spec.ts tests/e2e/ui-dependency-policy.spec.ts`: PASS, 10 passed

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 61 passed
- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

## Radix Dependency Added

No.

## Remaining Risks

- This pilot proves Base UI Radio/RadioGroup only for list visibility controls.
- It does not approve radio-like controls inside menus, filters, bottom sheets, or other higher-risk surfaces.
- Future form migrations still need one-surface PRs with screenshots and E2E coverage.

## Recommended Next Base UI Candidate

Proceed to Wave 3 only after this PR is reviewed, merged, and verified. Based on the existing plan, Wave 3 should remain an audit-led feedback/status primitive decision, not a broad component rewrite.
