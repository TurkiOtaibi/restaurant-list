# Base UI Wave 1 Field/Form Candidate Audit

## 1. Executive Summary

Wave 1 should not start with a global replacement of `Field`, `TextInput`, `TextArea`, auth forms, or mutation dialogs. The safest next Base UI step is a single-field pilot that proves Base UI Field/Input can preserve the existing local field contract without changing validation, submission, or product behavior.

Recommended Wave 1 target:

- Pilot Base UI Field/Input on the profile favorites picker search field only.

Why:

- It is already inside an existing dialog and is non-submitting search/filter UI.
- It does not change API payloads.
- It does not change auth/session behavior.
- It has existing E2E coverage through the profile favorites picker flow.
- It can be rolled back by restoring a single `TextInput` usage.

Do not migrate auth, create/edit list, create place, edit profile, or rating fields first.

## 2. Current Field/Form Stack

Current shared primitives:

- `frontend/src/components/ui/Input.tsx`
  - `Field`
  - `TextInput`
  - `TextArea`
- `frontend/src/components/ui/SearchField.tsx`
- `frontend/src/features/lists/VisibilitySelector.tsx`

Current behavior:

- `Field` renders a wrapping `<label>`.
- `TextInput` and `TextArea` use native controls.
- Helper and error descriptions are wired through `aria-describedby`.
- Error state sets `aria-invalid`.
- Field-level errors render with `role="alert"`.
- `SearchField` uses native `type="search"` with `role="searchbox"`, a clear button, optional scope text, and result-count status.
- `VisibilitySelector` uses native `fieldset`, `legend`, and radio inputs.

## 3. Base UI Docs Evidence

Official Base UI docs reviewed:

- Field: https://base-ui.com/react/components/field
- Input: https://base-ui.com/react/components/input
- Form: https://base-ui.com/react/components/form
- Fieldset: https://base-ui.com/react/components/fieldset

Relevant findings:

- Base UI Field provides `Field.Root`, `Field.Label`, `Field.Control`, `Field.Description`, and `Field.Error`.
- Base UI Input is a native input element that works with Field.
- Base UI Form provides consolidated validation and submission behavior.
- Base UI Fieldset provides stylable native fieldset/legend structure.

Implication:

- `Field` and `Input` are plausible Wave 1 candidates.
- `Form` is not recommended for Wave 1 because the app already owns validation/submission logic in page and dialog components.
- `Fieldset` is better aligned with a later `VisibilitySelector` wave, not the first field pilot.

## 4. Current Usage Inventory

| Surface | File | Current controls | Risk | Notes |
| --- | --- | --- | --- | --- |
| Login form | `frontend/app/login/page.tsx` | `TextInput` email/password | High | Auth/session path. Do not pilot first. |
| Register form | `frontend/app/register/page.tsx` | multiple `TextInput` fields | High | Auth/session and validation path. Do not pilot first. |
| Create list dialog | `frontend/src/features/lists/CreateListDialog.tsx` | `TextInput`, `VisibilitySelector` | Medium-High | Mutates list data. Dialog involved. |
| Edit list dialog | `frontend/src/features/lists/EditListDialog.tsx` | `TextInput`, `VisibilitySelector` | Medium-High | Mutates list data and system-list rules. |
| Create place dialog | `frontend/src/features/places/CreatePlaceDialog.tsx` | `TextInput`, custom field usage | High | Core place creation flow. |
| Edit profile dialog | `frontend/src/features/profile/ProfileArchivePage.tsx` | `TextInput`, `TextArea` | High | Mutates profile identity. |
| Favorites picker search | `frontend/src/features/profile/ProfileArchivePage.tsx` | `TextInput` search field | Low-Medium | Non-submitting filter inside picker. Best Wave 1 target. |
| Rate place dialog | `frontend/src/features/places/RatePlaceDialog.tsx` | `TextArea`, `RatingControl` | High | Rating behavior and EDR-002 adjacent. |
| Add place to list dialog | `frontend/src/features/lists/AddPlaceDialog.tsx` | `SearchField` | Medium-High | Search inside mutation dialog. |
| Places library search | `frontend/src/features/places/PlaceLibraryPage.tsx` | `SearchField` | Medium | URL/query behavior. Do not pilot Field first here. |
| Visibility selector | `frontend/src/features/lists/VisibilitySelector.tsx` | native radios | Medium | Better as later Fieldset/Radio wave. |

## 5. Candidate Comparison

| Candidate | User value | Accessibility value | RTL risk | Product risk | Implementation risk | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| Favorites picker search field | Medium | Medium | Low | Low | Low-Medium | Recommended |
| Places library search field | Medium | Medium | Low | Medium | Medium | Defer; URL/query behavior raises risk. |
| Login email field | Low | Medium | Low | High | Medium | Defer; auth path. |
| Register display name/email field | Low | Medium | Low | High | Medium | Defer; auth path. |
| Edit profile display name | Medium | Medium | Low | High | Medium | Defer; profile mutation path. |
| Create list name | Medium | Medium | Low | Medium-High | Medium | Defer; list mutation path. |
| VisibilitySelector | Medium | Medium | Low | Medium | Medium | Wave 2 candidate, not Wave 1. |
| TextArea fields | Low | Medium | Low | High | Medium | Defer; usually tied to profile/rating mutations. |

## 6. Recommended Wave 1 Target

Target:

- Favorites picker search field in `EditFavoritesDialog` inside `frontend/src/features/profile/ProfileArchivePage.tsx`.

Current usage:

- `TextInput`
- `id="favorite-search"`
- Arabic label: search in rated places
- controlled `query` state
- filters local rated-place candidates only

Recommended implementation shape:

- Add a small wrapper such as `BaseTextInput` or `BaseFieldTextInput` only if needed.
- Use Base UI `Field` and `Input`.
- Use it exactly once for `favorite-search`.
- Do not replace the shared `TextInput` globally.
- Do not migrate `TextArea`.
- Do not migrate `Form`.
- Do not migrate `ResponsiveDialog`.

## 7. Acceptance Criteria

Wave 1 must prove:

- The search input keeps the same visible Arabic label.
- The input has the same accessible name.
- The `id="favorite-search"` remains stable unless tests are updated for an equivalent selector.
- Typing filters the picker candidates exactly as before.
- Clearing/reopening the dialog resets query exactly as before.
- Selected count behavior is unchanged.
- Max-4 blocked behavior is unchanged.
- Save behavior is unchanged.
- No API request changes.
- No dialog behavior changes.
- No Radix dependency.
- Base UI imports remain intentionally updated in `ui-dependency-policy.spec.ts`.

## 8. Required E2E Tests

Update or add focused coverage for:

- Favorites picker opens.
- Search input is found by Arabic accessible name.
- Typing in the search field filters candidates.
- Clearing/reopening resets search.
- Checkbox selection still works after filtering.
- Max-4 rule still blocks the 5th selection.
- Save updates favorites strip in place.
- No Radix dependency.
- Base UI import policy includes only reviewed primitives.

Do not weaken existing profile favorites tests.

## 9. Required Screenshots

Save screenshots under:

`docs/qa-execution/base-ui-field-pilot/screenshots/`

Required:

- favorites picker 390x844 after
- favorites picker search focused 390x844 after
- favorites picker filtered-results state 390x844 after
- favorites picker 320x568 after

Before screenshot is useful but not required if the visual diff is intentionally negligible.

## 10. RTL / Arabic Checklist

Verify:

- Arabic label remains visible and readable.
- Search placeholder remains Arabic.
- RTL layout is unchanged.
- Input text alignment remains natural for Arabic and mixed names.
- No horizontal overflow at 320px and 390px.
- Focus ring is visible in dark theme.

## 11. Accessibility Checklist

Verify:

- Field label is correctly associated with the input.
- Input has an accessible name from the Arabic label.
- Focus state remains visible.
- Keyboard typing and selection flow works.
- Screen-reader semantics do not regress from native input behavior.
- The dialog initial focus still lands on the search input.

## 12. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Base UI Field changes generated DOM enough to affect CSS | Medium | Use existing classes and screenshot the dialog. |
| Controlled input behavior changes | Medium | E2E typing/filtering test. |
| Dialog initial focus selector breaks | Medium | Preserve `favorite-search` id and test picker open focus. |
| Import policy blocks new primitive | Low | Update policy test intentionally in the Wave 1 PR. |
| Broader shared `TextInput` migration slips in | High | Limit PR to one usage and one wrapper if needed. |

## 13. Rollback Strategy

Rollback is simple:

1. Restore the `favorite-search` control to existing `TextInput`.
2. Remove any new Base Field/Input wrapper if unused.
3. Restore the dependency policy allow-list if no new Base UI import remains.
4. Re-run frontend and backend gates.

No backend, API, database, or auth rollback is required.

## 14. Production Smoke Requirements

Because the target is inside the profile favorites picker:

- Use approved smoke account only.
- Prefer read-only verification if the account already has rated places.
- If favorites picker is unreachable due no ratings, do not create data unless mutation-capable smoke is explicitly approved.
- Verify `/profile` loads.
- Open favorites editor if available.
- Type in search field.
- Confirm no dialog/mobile regression.
- Do not save changes unless explicitly approved and cleanup is documented.

## 15. Final Recommendation

Proceed with Wave 1 only after Wave 0 is approved and merged.

Recommended Wave 1 component:

- Base UI Field/Input pilot.

Recommended target surface:

- Profile favorites picker search field.

Risk level:

- Low-Medium.

Implementation safe to start now:

- Not until Wave 0 is approved and merged.

Implementation safe after Wave 0:

- Yes, if limited to the exact target and acceptance criteria above.
