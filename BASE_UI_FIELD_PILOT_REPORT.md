# Base UI Field/Input Pilot Report

## Why Field/Input Was Chosen

Base UI Field/Input was selected because Wave 1 needed a low-risk form primitive pilot that does not touch auth, mutations, route state, or shared form infrastructure. The profile favorites picker search field is a local, non-submitting filter field with existing E2E coverage and a simple rollback path.

## Target Surface

- `frontend/src/features/profile/ProfileArchivePage.tsx`
- Surface: profile favorites picker search field.
- Stable control id preserved: `favorite-search`.
- Existing Arabic label and placeholder were preserved.

## Files Changed

- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `frontend/tests/e2e/profile-phase-1.spec.ts`
- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
- `docs/qa-execution/base-ui-field-pilot/screenshots/favorites-picker-390x844-after.png`
- `docs/qa-execution/base-ui-field-pilot/screenshots/favorites-picker-search-focused-390x844-after.png`
- `docs/qa-execution/base-ui-field-pilot/screenshots/favorites-picker-filtered-results-390x844-after.png`
- `docs/qa-execution/base-ui-field-pilot/screenshots/favorites-picker-320x568-after.png`
- `BASE_UI_FIELD_PILOT_REPORT.md`

## Behavior Parity Notes

- The shared `TextInput` primitive was not migrated globally.
- Only the favorites picker search field now uses Base UI `Field` and `Input`.
- Search remains controlled by the existing local `query` state.
- Typing still filters the local rated-place candidates.
- Reopening the picker resets the search value.
- Checkbox selection, max-4 blocking, reordering, and saving remain unchanged.
- No backend, API, auth, database, routing, or product behavior changed.

## Accessibility Notes

- The search input keeps the same visible Arabic label.
- Base UI `Field.Label` is associated with Base UI `Input`.
- The input remains discoverable by its Arabic accessible name in E2E.
- Focus state uses the existing `.ds-field input` styling.
- The dialog `initialFocusSelector="#favorite-search"` selector remains stable.

## RTL / Mobile Notes

- Existing `.ds-field` styles and dark theme tokens remain in use.
- The field stays inside the existing RTL `ResponsiveDialog` layout.
- Screenshots were captured at 390x844 and 320x568.
- No horizontal overflow or picker layout drift was observed in screenshot capture.

## Screenshots

- `docs/qa-execution/base-ui-field-pilot/screenshots/favorites-picker-390x844-after.png`
- `docs/qa-execution/base-ui-field-pilot/screenshots/favorites-picker-search-focused-390x844-after.png`
- `docs/qa-execution/base-ui-field-pilot/screenshots/favorites-picker-filtered-results-390x844-after.png`
- `docs/qa-execution/base-ui-field-pilot/screenshots/favorites-picker-320x568-after.png`

## Tests Updated

- `frontend/tests/e2e/profile-phase-1.spec.ts`
  - Added reset coverage for the favorites search field after closing and reopening the picker.
  - Existing Arabic accessible-label search coverage remains.
  - Existing checkbox, max-4, reorder, and save assertions remain.
- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
  - Added `@base-ui/react/field` and `@base-ui/react/input` to the reviewed Base UI allow-list.
  - Radix absence check remains unchanged.

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

- This pilot proves Base UI Field/Input compatibility for one local search field only.
- It does not approve a global `TextInput`, `TextArea`, or form migration.
- Mutation forms, auth forms, and route-query search fields still require dedicated audits before migration.

## Recommended Next Base UI Candidate

Run the planned Wave 2 implementation only after review: a single low-risk Fieldset/Radio or equivalent form-control pilot, if the already merged audit still identifies an isolated target with no product behavior change.
