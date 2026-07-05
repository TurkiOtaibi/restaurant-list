# Base UI Tabs Pilot Report

## Why Tabs Was Chosen

Base UI Tabs was selected for Phase 4 because the Places type selector is isolated, non-portaled, and already behaves like a segmented tab control. It has low z-index, bottom-navigation, and mobile Safari risk compared with Dialog, Menu, Popover, Select, or Combobox.

## Exact Target Surface

Only the Places type segmented control in `frontend/src/features/places/PlaceLibraryPage.tsx` was migrated:

- `المطاعم`
- `المقاهي`
- `الآيس كريم`

No other surface or primitive was migrated.

## Files Changed

- `frontend/src/features/places/PlaceLibraryPage.tsx`
- `frontend/tests/e2e/places-acceptance-harness.spec.ts`
- `frontend/tests/e2e/support/places-acceptance-harness.ts`
- `docs/qa-execution/base-ui-tabs-pilot/screenshots/places-tabs-390x844-after.png`
- `docs/qa-execution/base-ui-tabs-pilot/screenshots/places-tabs-320x568-after.png`
- `docs/qa-execution/base-ui-tabs-pilot/screenshots/places-tabs-selected-state-390x844-after.png`
- `docs/qa-execution/base-ui-tabs-pilot/screenshots/places-tabs-focused-390x844-after.png`
- `BASE_UI_TABS_PILOT_REPORT.md`

## Behavior Parity Notes

- Existing place type values are unchanged.
- Existing URL query behavior is preserved.
- Existing filtering behavior is preserved.
- Existing search query preservation is covered by E2E.
- Browser history still uses replace-style behavior for type changes.
- Existing visual styling is preserved by reusing the current button classes and selected-state class.
- No product behavior, routing model, backend contract, or business rule changed.
- Review cleanup removed duplicate per-tab selection handlers. `Tabs.Root onValueChange` is now the single canonical path that updates selected type, URL query, and filtering state.

The pilot intentionally keeps the existing Places results region unchanged instead of restructuring it into Base UI tab panels. This keeps the migration limited to selector semantics and avoids changing loading, empty, or list rendering behavior.

## URL / Query Behavior Verification

E2E coverage verifies:

- Default selected tab matches the active query type.
- Clicking `المقاهي` updates `type=cafe`.
- Clicking `الآيس كريم` updates `type=ice_cream`.
- Existing `q` query value is preserved.
- Direct link `/places?type=cafe&q=...` selects the cafe tab.
- Keyboard arrow navigation changes the selected tab and updates the URL.

## Accessibility Notes

- The control now exposes a `tablist` named `نوع المكان`.
- Each option exposes a `tab` role with its Arabic accessible name.
- Selected state uses `aria-selected`.
- Keyboard focus remains visible through the existing focus styling.
- Arrow-key navigation is covered by E2E.
- No tooltip, dialog, menu, popover, or portal behavior was introduced.

## RTL / Mobile Notes

- `dir="rtl"` is set on the Tabs root.
- Arabic labels are unchanged.
- Existing mobile-first spacing and segmented-control styling are preserved.
- Screenshots were captured at 390x844 and 320x568.
- No horizontal overflow was observed in the captured mobile states.

## Screenshots

- `docs/qa-execution/base-ui-tabs-pilot/screenshots/places-tabs-390x844-after.png`
- `docs/qa-execution/base-ui-tabs-pilot/screenshots/places-tabs-320x568-after.png`
- `docs/qa-execution/base-ui-tabs-pilot/screenshots/places-tabs-selected-state-390x844-after.png`
- `docs/qa-execution/base-ui-tabs-pilot/screenshots/places-tabs-focused-390x844-after.png`

Review cleanup replaced the focused-state screenshot with keyboard-driven focus evidence so the focus ring/state is visually clearer.

## Tests Updated

- Added E2E coverage for Base UI tab semantics, accessible Arabic tab names, selected state, click behavior, URL/query preservation, direct-link behavior, and keyboard arrow navigation.
- Tightened the Places acceptance harness readiness check so list tests wait for real list/empty content instead of returning while the loading skeleton is still visible.

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 55 passed
- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

## Radix Dependency Added

No. No Radix dependency was added.

## Remaining Risks

- This pilot uses Base UI Tabs only for the selector and keeps the results region outside Base UI panels to preserve existing behavior. A future broader Tabs migration should reassess panel semantics only if a target surface naturally owns tab panels.
- Keyboard activation now follows tab behavior for the type selector, so future changes should keep URL updates and focus behavior covered by E2E.

## Recommended Next Base UI Candidate

Continue with another isolated, non-portaled primitive or defer to a focused Popover audit. Dialog, Menu, Select, and Combobox should remain deferred until a dedicated overlay/mobile Safari review is completed.
