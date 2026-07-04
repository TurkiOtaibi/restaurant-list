# Base UI Phase 3 Candidate Audit

## 1. Executive Summary

The safest high-value Base UI Phase 3 candidate is **Checkbox**, scoped to one existing checkbox-like multi-select surface rather than a broad component migration.

The best target is the profile favorites picker inside `ProfileArchivePage`, where rated places are currently selected with `button` elements using `aria-pressed`. This is functionally a multi-select checklist. A Base UI Checkbox pilot there would improve semantic accuracy and screen reader expectations without introducing portal, z-index, iOS Safari overlay, or bottom-navigation risk.

Do not migrate Dialog, Menu, Popover, or Tabs in Phase 3. Dialog and Menu are production-critical custom primitives. Popover introduces portal/layering risk too early. Tabs do not have a clear current product surface.

Final recommendation: **Base UI Checkbox, single-surface pilot only**.

## 2. Current Base UI Adoption Status

Current stack and policy state:

- Tailwind infrastructure is present.
- shadcn infrastructure is present.
- `@base-ui/react` is installed.
- Base UI Tooltip pilot has shipped.
- Base UI Switch pilot has shipped.
- `BASE_UI_LAYERING_POLICY.md` exists and documents portal, z-index, bottom-navigation, iOS Safari, RTL, accessibility, screenshot, rollback, and future migration rules.
- `DESIGN_SYSTEM_DECISION_RECORD.md` exists and documents gradual Tailwind + shadcn + Base UI adoption.
- Radix remains absent and must not be introduced.

Observed active app usage:

- Checkbox: no native checkbox component is active, but the profile favorites picker is checkbox-like multi-select UI using `aria-pressed` buttons.
- Tabs: no active app tabs found; only test fixture usage of `role="tablist"`.
- Popover: no active popover primitive found.
- Menu: `ActionMenu` is active in profile, place detail, and list detail actions.
- Dialog: `ResponsiveDialog`, `Modal`, and `BottomSheet` are active across list creation/edit/delete, add-place, save-to-list, rating, place creation, image management, profile editing, and favorites editing.

## 3. Candidate Comparison Table

| Candidate | Current usage in app | User value | Accessibility improvement | RTL risk | iOS Safari / mobile risk | Portal / z-index risk | E2E coverage impact | Regression risk | Implementation complexity | Recommended priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Checkbox | No native checkbox, but profile favorites picker has multi-select button behavior in `ProfileArchivePage` | High for selection clarity in favorites editing | High: changes checkbox-like choices from pressed buttons to actual checkbox semantics | Low if labels remain Arabic and layout uses existing row styles | Low: no portal, no overlay, no bottom-nav interaction | None | Medium: update existing favorites picker tests to assert checkbox role/name/state | Low-Medium due mutation-adjacent dialog, but save behavior can remain unchanged | Low-Medium | 1 |
| Tabs | No active product tabs; test fixture only | Low-Medium unless mapped to category segmentation, which may change interaction model | Medium if replacing a true tab pattern, but no clear target exists | Medium: tabs need RTL arrow-key and visual order review | Medium: segmented controls are prominent on mobile | None if non-portal | Medium: would require new keyboard/selection coverage | Medium because likely touches places category filtering | Medium | 2 |
| Popover | No active popover primitive found | Medium for future compact controls | Medium-High, but only if replacing an existing popover-like surface | Medium | High: mobile placement, collision, touch behavior | High: portal/layering policy applies | High: open-state, collision, keyboard, outside-click tests required | High before another overlay pilot | Medium-High | 4 |
| Menu | Active custom `ActionMenu` in profile/place/list actions | High, but on critical destructive/edit/logout actions | High if Base UI Menu improves roving focus and menu semantics | Medium | High: small-screen action menus and touch/outside-click behavior | Medium-High | High: profile/logout, place image actions, list edit/delete tests | High due critical actions and destructive flows | High | 5 |
| Dialog | Active custom `ResponsiveDialog`, `Modal`, `BottomSheet` across core mutation flows | Very high eventually | Very high if focus trap/restore behavior improves | High | Very high: bottom sheet, safe-area, keyboard, scroll lock | Very high | Very high: all dialog flows need broad retesting | Very high | Very high | 6 |

## 4. Risk Ranking

Lowest to highest migration risk:

1. Checkbox
2. Tabs
3. Popover
4. Menu
5. Dialog

Dialog and Menu have high eventual value, but they should not be early Phase 3 work because they carry significant focus, portal, destructive-action, mobile, and regression risk.

## 5. Recommended Next Component

Recommended component: **Base UI Checkbox**

Recommended target: **profile favorites picker item selection** in `frontend/src/features/profile/ProfileArchivePage.tsx`.

Reasoning:

- The current UI is already a multi-select list.
- The current implementation uses `button` with `aria-pressed`, which works but is less semantically direct than checkbox controls for selecting multiple independent items.
- Checkbox requires no portal, no z-index changes, and no bottom-navigation interaction.
- It can be introduced in exactly one surface.
- Existing E2E coverage already exercises searching, selecting up to four favorites, blocking the fifth item, reordering, and saving.
- The migration can preserve the same state array, save API, selection limit, Arabic copy, and visual row structure.

## 6. Components To Avoid For Now

Avoid these in Phase 3:

- **Dialog**: too broad; active across many mutation flows and mobile bottom-sheet behavior.
- **Menu**: active in critical profile/logout, place, and list actions; destructive behavior and keyboard semantics need dedicated PR.
- **Popover**: not currently used; introduces portal/collision behavior without a strong immediate product target.

Defer **Tabs** unless a specific product surface is approved. There is no clear active tab component today. Recasting category segmentation as tabs may subtly change keyboard and semantic behavior, so it should not precede Checkbox.

## 7. Required Acceptance Criteria For Checkbox

For a Phase 3 Checkbox pilot:

- Use exactly one Base UI primitive family: Checkbox.
- Apply it to exactly one surface.
- Preserve the existing favorites picker behavior:
  - search still filters rated places
  - selecting up to four favorites works
  - selecting a fifth is blocked with the existing Arabic message
  - unselecting works
  - reorder up/down still works
  - save still calls the same profile favorites API
  - no full page navigation
- Do not change backend/API/auth/database behavior.
- Do not introduce Radix.
- Keep Arabic labels visible.
- Each checkbox must have an accessible Arabic name derived from the visible place name/action label.
- Checked state must be programmatically exposed.
- Keyboard operation must work with Space.
- Focus state must remain visible.
- Touch target should be at least 44px where practical.
- No horizontal overflow at 320, 390, and 430 mobile widths.

## 8. Required Screenshots

Store screenshots under:

`docs/qa-execution/base-ui-checkbox-pilot/screenshots/`

Required evidence:

- profile page default at 390x844
- favorites picker open at 390x844
- favorites picker open at 320x568
- checked item state
- focused checkbox state
- fifth-selection blocked message
- RTL/no-horizontal-overflow evidence at 390x844

If visual output changes materially, capture before/after screenshots for the picker.

## 9. Required Tests

Focused E2E:

- favorites picker opens
- checkbox controls are discoverable by role/name
- Space toggles a checkbox
- checked state updates
- search still filters candidates
- selecting four items works
- fifth selection remains blocked
- unchecking a selected item works
- save updates the strip in place

Regression E2E:

- `profile-phase-1.spec.ts` favorites picker flow remains green
- no wishlist/likes/followers/histogram/Reviews/قريبًا/جربته regressions
- full `npm run test:e2e` remains green

Standard gates:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`
- `python -m ruff format --check .`
- `python -m ruff check .`
- `python -m mypy app tests`
- `python -m pytest -q`

## 10. Rollback Strategy

Rollback should be a single PR revert:

1. Restore the favorites picker item from Base UI Checkbox back to the existing button/`aria-pressed` implementation.
2. Remove the focused Checkbox E2E assertions.
3. Keep Base UI infrastructure installed because Tooltip and Switch pilots already depend on it.
4. Run full gates.
5. Verify profile favorites picker manually or by focused E2E.

No backend rollback should be needed because the proposed migration is frontend-only and contract-preserving.

## 11. Final Recommendation

Proceed with **Base UI Checkbox** as Phase 3.

Recommended scope:

- one PR
- one component family
- one UI surface
- profile favorites picker only
- no product behavior change
- no broad design refresh
- no Dialog/Menu/Popover/Tabs migration
- no Radix

Implementation is safe to start if the PR is explicitly constrained to the favorites picker selection control and includes the accessibility, screenshot, and E2E acceptance criteria above.
