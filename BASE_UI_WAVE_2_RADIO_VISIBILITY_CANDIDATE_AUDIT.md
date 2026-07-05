# Base UI Wave 2 Radio/Visibility Candidate Audit

## 1. Executive Summary

Wave 2 should evaluate `VisibilitySelector` as the next small Base UI form-control migration after Wave 0 and Wave 1 are complete. The current selector is already accessible because it uses native `fieldset`, `legend`, `label`, and `input type="radio"`. A Base UI migration is plausible, but the value is incremental rather than urgent.

Recommended Wave 2 target:

- `frontend/src/features/lists/VisibilitySelector.tsx`

Recommended primitive:

- Base UI `Radio` + `RadioGroup`, with explicit group labeling.

Implementation should not start until:

1. Wave 0 dependency/policy verification is approved and merged.
2. Wave 1 Field/Input pilot is approved, merged, and released without regression.

## 2. Current Visibility Selector Behavior

Current file:

- `frontend/src/features/lists/VisibilitySelector.tsx`

Current implementation:

- Native `<fieldset className="ds-visibility">`
- Native `<legend>`
- Native radio inputs with shared `name`
- Labels wrap each radio and visible option label
- Controlled `value`
- `onChange(option.value)` callback
- Optional `disabled`

Current options:

- `private`
- `public`

Current label source:

- `frontend/src/lib/listVisibility.ts`

## 3. Current Usage Inventory

| Surface | File | Behavior | Risk | Notes |
| --- | --- | --- | --- | --- |
| Create list dialog | `frontend/src/features/lists/CreateListDialog.tsx` | Creates a new list with selected visibility | Medium | Mutation flow and unsaved-change logic. |
| Edit list dialog | `frontend/src/features/lists/EditListDialog.tsx` | Updates list visibility; name field hidden for system lists | Medium-High | Must preserve system-list visibility edit behavior. |

Important product rule:

- System lists cannot be renamed/deleted, but visibility changes remain allowed.

## 4. Base UI Docs Evidence

Official Base UI docs reviewed:

- Radio: https://base-ui.com/react/components/radio
- Fieldset: https://base-ui.com/react/components/fieldset
- Forms handbook: https://base-ui.com/react/handbook/forms

Relevant findings:

- Base UI Radio is placed within Radio Group.
- Radio groups must have an accessible name.
- The docs show `Radio.Root` and `Radio.Indicator`.
- Fieldset provides a native `fieldset` wrapper and legend styling support.

Audit implication:

- A migration must explicitly preserve group labeling. Do not assume the visual legend automatically labels the `RadioGroup` role.
- Keeping native `fieldset`/`legend` may be safer than replacing the whole structure.

## 5. Candidate Comparison

| Candidate | User value | Accessibility value | RTL risk | Product risk | Implementation risk | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| `VisibilitySelector` shared component | Medium | Medium | Low | Medium | Medium | Recommended Wave 2 target after Wave 1. |
| Create list visibility only | Low | Medium | Low | Medium | Medium | Too narrow; shared component is small enough. |
| Edit list visibility only | Medium | Medium | Low | Medium-High | Medium | Avoid single-surface drift. |
| Places subtype filter radios | Medium | Medium | Medium | High | High | Defer; bottom-sheet/mobile filter behavior. |
| Any Menu radio item pattern | Low | Medium | Medium | High | High | Defer; Menu migration not approved. |

## 6. Recommended Wave 2 Target

Target:

- `VisibilitySelector`

Recommended implementation shape:

- Preserve the `VisibilitySelector` public props:
  - `disabled`
  - `legend`
  - `name`
  - `onChange`
  - `value`
- Use Base UI `RadioGroup` and `Radio`.
- Keep current Arabic labels from `LIST_VISIBILITY_OPTIONS`.
- Keep existing `ds-visibility*` class hooks unless a minimal new class is required.
- Preserve submitted values: `private` and `public`.
- Preserve the current default value behavior in create/edit dialogs.
- Do not migrate `ResponsiveDialog`.
- Do not migrate `TextInput`.
- Do not migrate form submission.

## 7. Acceptance Criteria

Wave 2 must prove:

- Create-list default remains private.
- Selecting public/private updates local state.
- Creating a list sends the same `visibility` value as before.
- Editing a normal list visibility still works.
- Editing a system list visibility still works.
- System-list name remains hidden and rename/delete protection remains unchanged.
- Radio group has an accessible group name from the Arabic legend.
- Each radio has an accessible name:
  - `خاصة`
  - `عامة`
- Arrow-key radio navigation works.
- Space/Enter selection works where applicable.
- Focus state remains visible.
- RTL layout remains unchanged.
- No Radix dependency.
- Base UI import policy is intentionally updated for `radio` / `radio-group`.

## 8. Required E2E Tests

Add or update focused E2E coverage for:

- Create list dialog shows visibility group.
- Default selected radio is private.
- Selecting public changes selected state.
- Edit list dialog shows current visibility.
- System list edit dialog still hides rename/delete affordances and keeps visibility editable.
- Radio group accessible name is the Arabic legend.
- Radio accessible names are `خاصة` and `عامة`.
- Keyboard navigation changes selection as expected.
- No Radix dependency.
- Base UI import policy includes only reviewed primitives.

Do not weaken existing list, wishlist, system-list, or public-list tests.

## 9. Required Screenshots

Save screenshots under:

`docs/qa-execution/base-ui-radio-visibility-pilot/screenshots/`

Required:

- create-list visibility selector 390x844 after
- edit-list visibility selector 390x844 after
- system-list visibility selector 390x844 after
- focused radio state 390x844 after
- create-list visibility selector 320x568 after

## 10. RTL / Arabic Checklist

Verify:

- Arabic legend remains visible.
- Option labels remain Arabic.
- RTL grid alignment remains unchanged.
- Focus ring is visible in dark theme.
- No horizontal overflow at 320px and 390px.
- Public/private badges elsewhere are unaffected.

## 11. Accessibility Checklist

Verify:

- The radio group has an accessible group name.
- Every radio has an accessible name.
- Selected state is exposed.
- Disabled behavior works if used.
- Arrow-key behavior is correct.
- Native form semantics or equivalent Base UI semantics are preserved.
- No nested-group ambiguity is introduced by combining `fieldset` and `radiogroup` incorrectly.

## 12. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Accessible group labeling regresses | High | Add E2E `getByRole(\"radiogroup\", { name })` or equivalent. |
| Native fieldset semantics are lost | Medium | Prefer preserving `fieldset`/`legend` or prove Base UI labeling parity. |
| System-list visibility editing breaks | High | Add explicit E2E coverage for system-list edit dialog. |
| Form value changes from `private`/`public` | High | Assert values and API payload behavior. |
| Keyboard radio behavior differs from native | Medium | Add keyboard navigation E2E. |
| CSS `:has(input:checked)` no longer applies | Medium | Update styling minimally and screenshot checked/focus states. |

## 13. Rollback Strategy

Rollback is simple if Wave 2 is isolated:

1. Restore `VisibilitySelector.tsx` to native radio inputs.
2. Remove Base UI radio imports if no longer used.
3. Restore the Base UI dependency-policy allow-list if radio imports are removed.
4. Re-run frontend and backend gates.

No backend, API, auth, database, or product data rollback is required.

## 14. Production Smoke Requirements

Production smoke should avoid unnecessary data mutation.

Preferred:

- Verify list edit visibility on an approved smoke-owned list only.
- If no smoke-owned list exists, do not create one unless mutation-capable smoke is explicitly approved.
- If a temporary list is created, delete it before final verdict.

Required smoke if mutation is approved:

- Login with approved smoke account.
- Create private list.
- Edit visibility to public.
- Edit visibility back to private.
- Confirm system wishlist visibility edit still works if reachable.
- Cleanup temporary list.

## 15. Final Recommendation

Proceed with Wave 2 only after Wave 0 and Wave 1 are approved, merged, and released.

Recommended Wave 2 component:

- Base UI Radio/RadioGroup pilot.

Recommended target surface:

- Shared `VisibilitySelector`.

Risk level:

- Medium.

Implementation safe to start now:

- No.

Implementation safe after Wave 0 and Wave 1:

- Yes, if limited to `VisibilitySelector` and the acceptance criteria above.
