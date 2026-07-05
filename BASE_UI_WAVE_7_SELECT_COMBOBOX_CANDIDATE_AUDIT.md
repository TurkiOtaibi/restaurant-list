# Base UI Wave 7 Select / Combobox Candidate Audit

## 1. Executive Summary

Wave 7 should not implement Base UI Select or Combobox yet.

The repository has a few native `<select>` controls in place creation and several search fields, but it does not currently have a clear low-risk custom select or true combobox that needs replacement. Existing search controls are plain searchboxes with submit/results behavior, not suggestion-list comboboxes. Existing subtype filtering is a mobile bottom-sheet radio-like filter, not a select. The safest decision is to keep these controls custom/native until a concrete product need justifies the additional overlay, keyboard, and mobile risk.

Final recommendation:

- Do not implement Base UI Select yet.
- Do not implement Base UI Combobox yet.
- Keep native selects and `SearchField` custom for now.
- Revisit Select only after Field/Form and Radio/Visibility waves are merged and released.
- Revisit Combobox only if a real autocomplete/suggestion product requirement is approved.

Implementation safe to start now:

- No.

## 2. Current Base UI Adoption Status

Released Base UI primitives:

| Primitive | Current location | Status |
| --- | --- | --- |
| Tooltip | `frontend/src/components/ui/BaseTooltip.tsx` | Released |
| Switch | `frontend/src/components/ui/BaseSwitchPilot.tsx` | Released pilot |
| Checkbox | `frontend/src/features/profile/ProfileArchivePage.tsx` favorites picker | Released pilot |
| Tabs | `frontend/src/features/places/PlaceLibraryPage.tsx` places type control | Released pilot |

Audited / queued:

- Wave 0 dependency and policy verification
- Wave 1 Field/Form audit
- Wave 2 Radio/Visibility audit
- Wave 3 Feedback audit
- Wave 4 Popover audit
- Wave 5 Menu audit
- Wave 6 Dialog/ResponsiveDialog audit

Policy:

- Radix must remain absent.
- Select/Combobox must not be mixed with Dialog, Menu, Popover, or Field/Form migration.
- No product behavior changes are allowed during a primitive migration.

## 3. Evidence Reviewed

Repository evidence:

- `frontend/src/components/ui/SearchField.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/features/lists/VisibilitySelector.tsx`
- `frontend/src/features/places/CreatePlaceDialog.tsx`
- `frontend/src/features/places/PlaceLibraryPage.tsx`
- `frontend/src/features/lists/AddPlaceDialog.tsx`
- `frontend/tests/e2e/sprint3-real.spec.ts`
- `frontend/tests/e2e/places-acceptance-harness.spec.ts`

Official Base UI docs reviewed:

- Select: https://base-ui.com/react/components/select
- Combobox: https://base-ui.com/react/components/combobox
- Autocomplete: https://base-ui.com/react/components/autocomplete

Relevant docs implications:

- Base UI Select is for choosing a predefined value from a dropdown menu.
- Base UI Combobox is for an input combined with a list of predefined selectable items.
- Base UI Autocomplete is for an input with a filtered suggestion list.
- These primitives add popup/listbox behavior and keyboard expectations beyond a plain searchbox or native select.

## 4. Current Select / Search / Combobox-Like Inventory

| Surface | File | Current implementation | Behavior | Product risk | Base UI candidate |
| --- | --- | --- | --- | --- | --- |
| Place type in create-place dialog | `frontend/src/features/places/CreatePlaceDialog.tsx` | Native `<select>` | Choose restaurant/cafe/ice cream | Medium | Select later, not now. |
| Place subtype in create-place dialog | `frontend/src/features/places/CreatePlaceDialog.tsx` | Native `<select>` | Choose subtype after type | Medium | Select later, not now. |
| Place library search | `frontend/src/features/places/PlaceLibraryPage.tsx` | `SearchField` + submit button | Search by text, submit-driven | Low-Medium | Not Combobox. Keep custom. |
| Add-place-to-list dialog search | `frontend/src/features/lists/AddPlaceDialog.tsx` | `SearchField` + results list | Search existing places, then click result buttons | High | Possible future Combobox/Autocomplete only after dialog audit. |
| Places subtype filter | `frontend/src/features/places/PlaceLibraryPage.tsx` | `BottomSheet` + radio-like buttons | Essential mobile filter | High | Not Select now. Defer to dialog/filter audit. |
| List visibility selector | `frontend/src/features/lists/VisibilitySelector.tsx` | Native radio fieldset | Private/public choice | Medium | Radio wave already covers this. Not Select. |
| Profile favorites picker search | `frontend/src/features/profile/ProfileArchivePage.tsx` | Inline search within dialog | Filters rated places before checkbox selection | Medium-High | Field/Form target, not Combobox. |

## 5. Select Candidate Analysis

### Create Place Type Select

Evidence:

- `CreatePlaceDialog` uses a native select for `place-type`.
- Changing type clears subtype state.
- Subtype fields appear conditionally based on the selected type.

Assessment:

- Native select is stable and accessible.
- Base UI Select would add popup positioning and keyboard behavior.
- The dialog is route-mounted and mutation-heavy.
- The type selection affects conditional subtype fields, validation, and submitted payload.

Decision:

- Defer.
- Do not migrate before Dialog and Field/Form contracts are settled.

### Create Place Subtype Selects

Evidence:

- `SubtypeField` renders native select controls.
- E2E uses `selectOption("burger")` for restaurant subtype.

Assessment:

- Native select is sufficient.
- Base UI Select could improve custom styling consistency, but value is not urgent.
- Migration would require rewriting existing select-option tests and validating every subtype option.

Decision:

- Defer.
- Candidate only after Field/Form and Dialog migration readiness.

### Places Subtype Filter

Evidence:

- Place library subtype filtering uses a trigger with `aria-haspopup="dialog"` and a `BottomSheet`.
- Options use `role="radiogroup"` / `role="radio"` buttons.

Assessment:

- This is an essential mobile filter, not a simple select.
- It already belongs to the dialog/bottom-sheet risk area.
- A Base UI Select would alter mobile interaction and filter behavior.

Decision:

- Do not migrate to Select.
- Defer to a future filter-specific audit.

## 6. Combobox / Autocomplete Candidate Analysis

### Place Library Search

Evidence:

- Uses `SearchField`.
- Search is submitted through a form button.
- It reports result count via `role="status"`.

Assessment:

- This is a searchbox, not a combobox.
- There is no predefined suggestion list.
- Converting to Combobox would change the product model from submit search to suggestion selection.

Decision:

- Keep custom.
- Do not migrate to Combobox.

### Add Place To List Dialog Search

Evidence:

- Uses `SearchField`.
- Search filters/loads results inside `ResponsiveDialog`.
- User selects a result from a list after searching.

Assessment:

- This is the closest future Combobox/Autocomplete candidate.
- It is inside a dialog.
- It mutates list membership.
- It relies on API search behavior and loading/empty/error states.
- It requires Dialog migration readiness and careful keyboard testing.

Decision:

- Defer.
- Audit later only after Dialog/ResponsiveDialog contract hardening.

### Profile Favorites Picker Search

Evidence:

- Search filters rated places inside the edit favorites dialog.
- Selection is already migrated to Base UI Checkbox.

Assessment:

- This is a Field/Form candidate, not a Combobox candidate.
- It filters an already visible local list rather than selecting from a popup/listbox.
- Converting to Combobox would change interaction expectations.

Decision:

- Keep as future Field/Form or SearchField work.
- Do not migrate to Combobox.

## 7. Candidate Comparison Table

| Candidate | User value | Accessibility value | RTL/mobile risk | Portal/listbox risk | Product risk | Complexity | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Create place type select | Low-Medium | Low-Medium | Medium | Medium | Medium | Medium | Defer. |
| Create place subtype select | Low-Medium | Low-Medium | Medium | Medium | Medium | Medium | Defer. |
| Place library search to Combobox | Low | Negative/unclear | Medium | High | High | High | Do not do. |
| Add-place dialog search to Combobox | Medium | Medium | High | High | High | High | Audit later. |
| Profile favorites search to Combobox | Low | Low | Medium | High | Medium | High | Do not do. |
| Places subtype filter to Select | Low | Low | High | High | High | High | Do not do. |

## 8. Risk Ranking

| Rank | Candidate | Risk | Reason |
| --- | --- | --- | --- |
| 1 | Keep native create-place selects | Low | Current native controls are accessible and tested. |
| 2 | Future Base UI Select for create-place subtype only | Medium | Possible but tied to create-place dialog and validation. |
| 3 | Future Base UI Select for place type | Medium-High | Changes conditional form behavior. |
| 4 | Add-place dialog Combobox/Autocomplete | High | Dialog, async search/results, mutation flow. |
| 5 | Places subtype filter to Select | High | Essential mobile bottom-sheet filter. |
| 6 | SearchField-to-Combobox global migration | Very high | Product behavior change, broad surface. |

## 9. Recommended Decision

Recommended decision:

DO NOT IMPLEMENT SELECT OR COMBOBOX YET

Reason:

- Native selects are currently adequate and lower risk.
- Search fields are not comboboxes.
- The closest Combobox target is inside a dialog and mutation flow.
- The current migration queue still needs earlier waves reviewed/merged.

## 10. Components Explicitly Deferred

Deferred:

- Base UI Select for create-place type/subtype.
- Base UI Combobox for add-place dialog search.
- Base UI Autocomplete for search surfaces.
- Places subtype filter migration.
- Any global `SearchField` replacement.
- Any global native select replacement.

## 11. Acceptance Criteria For A Future Select Pilot

A future Select pilot may proceed only if:

- Wave 0 is merged.
- Field/Form and Dialog contract risks are settled for the target surface.
- The target is one select only or one small shared select wrapper used in one route.
- Native values remain exactly the same.
- Validation behavior remains exactly the same.
- Conditional subtype fields behave exactly the same.
- Arabic labels and option labels remain unchanged.
- Keyboard selection works.
- Escape/outside-click behavior works.
- RTL placement works.
- No horizontal overflow at 320px and 390px.
- No Radix dependency.
- No product behavior change.

## 12. Acceptance Criteria For A Future Combobox / Autocomplete Pilot

A future Combobox/Autocomplete pilot may proceed only if:

- Product explicitly approves suggestion-list selection behavior.
- The selected target already has a list of selectable suggestions.
- The pilot is one surface only.
- It does not change API contracts.
- It does not change search semantics.
- Loading, empty, and error states remain.
- Keyboard navigation is fully tested.
- Screen reader announcement behavior is tested.
- Dialog interaction is safe if the target is inside a dialog.
- No Radix dependency.
- No product behavior change.

## 13. Required E2E Tests For A Future Select Pilot

Required:

- control has Arabic accessible name.
- current default selected value is correct.
- changing selection updates local state.
- submitted payload values are unchanged.
- conditional subtype field behavior is unchanged.
- keyboard selection works.
- Escape/outside-click closes popup if using custom popup.
- no horizontal overflow.
- no Radix dependency.
- existing create-place tests still pass.

## 14. Required E2E Tests For A Future Combobox Pilot

Required:

- input has Arabic accessible name.
- suggestions/listbox has correct semantics.
- typing filters results.
- ArrowDown / ArrowUp moves active option.
- Enter selects expected option.
- Escape closes suggestions.
- clear behavior remains.
- result count/status behavior remains or is intentionally replaced with equivalent announcement.
- loading/empty/error states remain.
- no API contract changes.
- no Radix dependency.
- no product behavior change.

## 15. Required Screenshots

For future Select pilot:

- target select closed state 390x844.
- target select open state 390x844.
- target select focused state 390x844.
- target select open state 320x568.
- RTL placement evidence.

For future Combobox pilot:

- input empty state.
- suggestions open state.
- keyboard-focused option state.
- empty results state.
- 320x568 mobile state.
- no bottom-nav collision if applicable.

Save under a target-specific folder:

- `docs/qa-execution/base-ui-select-pilot/screenshots/`
- or `docs/qa-execution/base-ui-combobox-pilot/screenshots/`

## 16. Accessibility Checklist

Verify:

- Arabic accessible name.
- selected value is announced.
- active option is announced.
- listbox/option semantics are correct if applicable.
- keyboard operation matches user expectations.
- focus returns safely.
- disabled/error states remain.
- helper/error text associations remain.
- screen reader announcements are not duplicated.

## 17. RTL / Mobile Checklist

Verify:

- Arabic text direction.
- option popup aligns naturally in RTL.
- no clipping at 320px.
- no horizontal overflow at 320px, 390px, and 430px.
- popup/listbox does not collide with bottom navigation.
- iOS Safari visual viewport behavior is tested or documented.
- touch targets remain at least 44px where practical.

## 18. Layering / Portal Checklist

Future Select/Combobox work must verify:

- z-index follows `BASE_UI_LAYERING_POLICY.md`.
- popup does not appear beneath dialogs.
- popup does not cover bottom navigation unexpectedly.
- popup closes on outside click.
- popup cleanup works on unmount.
- nested dialog behavior is safe if used inside `ResponsiveDialog`.

## 19. Rollback Strategy

For this audit:

- remove `BASE_UI_WAVE_7_SELECT_COMBOBOX_CANDIDATE_AUDIT.md`.

For future implementation:

1. Restore native select or custom `SearchField`.
2. Remove any unused Base UI Select/Combobox wrapper.
3. Remove select/combobox imports from dependency policy allow-list if no longer used.
4. Keep `@base-ui/react` because released primitives still require it.
5. Re-run full gates.

No backend, API, auth, or database rollback should be required if the pilot preserves behavior.

## 20. Production Smoke Requirements

For this audit:

- no production smoke required.

For future Select pilot:

- prefer local/E2E verification.
- production mutation requires approved smoke account and cleanup.
- if create-place flow is used, temporary data must be removed or documented.

For future Combobox pilot:

- prefer read-only search if possible.
- if selecting an item mutates data, use approved smoke account and cleanup.
- if cleanup cannot be completed, release verdict must be NOT RELEASED.

## 21. Final Recommendation

Final recommendation:

DO NOT IMPLEMENT SELECT OR COMBOBOX YET

Recommended next action:

- Continue earlier staged waves.
- Do not revisit Select until Field/Form and Dialog readiness are stronger.
- Do not revisit Combobox until product explicitly needs suggestion-list selection behavior.

Risk level:

- Select: Medium.
- Combobox: High.

Implementation safe to start:

- No.

