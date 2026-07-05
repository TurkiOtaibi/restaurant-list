# Base UI Wave 4 Popover Candidate Audit

## 1. Executive Summary

Wave 4 should not implement a Base UI Popover yet.

The current app does not have a safe, non-critical Popover target. The only clearly supplementary help surface is already handled by the released Base UI Tooltip wrapper. The remaining popover-like candidates are either action menus, responsive dialogs, or mobile-essential filters. Migrating any of those to Popover would violate the Base UI master plan's risk controls.

Final decision:

- Recommendation: DO NOT IMPLEMENT POPOVER YET
- Recommended component: none
- Recommended target surface: none
- Risk level for implementation now: Medium-High
- Implementation safe to start: No

## 2. Current Base UI Adoption Status

Released Base UI primitives:

| Primitive | Current location | Status |
| --- | --- | --- |
| Tooltip | `frontend/src/components/ui/BaseTooltip.tsx` | Released |
| Switch | `frontend/src/components/ui/BaseSwitchPilot.tsx` | Released pilot |
| Checkbox | `frontend/src/features/profile/ProfileArchivePage.tsx` favorites picker | Released pilot |
| Tabs | `frontend/src/features/places/PlaceLibraryPage.tsx` places type control | Released pilot |

Current dependency policy:

- `@base-ui/react` is installed.
- Radix must remain absent.
- No `@base-ui/react/popover` import exists in the frontend.
- Current Base UI imports are limited to tooltip, switch, checkbox, and tabs.

Relevant policy documents:

- `DESIGN_SYSTEM_DECISION_RECORD.md`
- `BASE_UI_LAYERING_POLICY.md`
- `BASE_UI_FULL_MIGRATION_MASTER_PLAN.md`

## 3. Candidate Comparison Table

| Candidate surface | File path | Current behavior | User value of Popover | RTL/mobile risk | Portal/z-index risk | Regression risk | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Profile stat helper | `frontend/src/features/profile/ProfileArchivePage.tsx` | Base UI Tooltip for supplementary stat help | Low; already solved | Low | Medium because Tooltip already portals | Low | Keep Tooltip. Do not convert to Popover. |
| Places subtype filter | `frontend/src/features/places/PlaceLibraryPage.tsx` | Button opens `BottomSheet` with radio-like subtype choices | Medium, but this is essential filtering | High on mobile | High near bottom nav and viewport edges | High | Defer. Not a safe Popover pilot. |
| Action menus | `frontend/src/components/ui/ActionMenu.tsx`, profile/place/list surfaces | Custom menu for important actions | Low for Popover; Menu is the correct primitive class | High | High | High | Do not use Popover. Menu remains separately deferred. |
| Responsive dialogs | `frontend/src/components/ui/Dialog.tsx` and usage sites | Modal/bottom-sheet dialogs for edit, save, upload, rate flows | None; Dialog is the correct primitive class | High | High | High | Do not use Popover. Dialog audit required. |
| Inline field helper text | `frontend/src/components/ui/Input.tsx` | Visible helper/error text with `aria-describedby` | Low; visible text is better than hidden popover help | Low | None today; Popover would add risk | Medium | Keep inline helper text. |
| Search/filter controls | `frontend/src/components/ui/SearchField.tsx`, places page | Visible controls and results status | Low | Medium | Medium | Medium | Keep custom. Combobox/search audit is separate. |

## 4. Popover Target Analysis

### Profile Stat Helper

Evidence:

- `frontend/src/features/profile/ProfileArchivePage.tsx` uses `BaseTooltip` for stat help text.
- `frontend/src/components/ui/BaseTooltip.tsx` already wraps Base UI Tooltip with collision avoidance and RTL popup content.

Assessment:

- This is the safest class of supplementary information.
- It has already been migrated to Base UI Tooltip.
- Converting this to Popover would add interactive popup behavior without improving product value.

Decision:

- Keep as Tooltip.
- Do not use as Wave 4 Popover target.

### Places Subtype Filter

Evidence:

- `frontend/src/features/places/PlaceLibraryPage.tsx` has `subtypeFilterOpen`.
- The trigger exposes `aria-haspopup="dialog"`.
- The content opens in `BottomSheet`.
- The sheet contains a radio-like subtype filter used to change the places list.

Assessment:

- This is not supplementary information.
- It is an essential mobile filtering control.
- Replacing it with Popover would introduce portal, viewport collision, bottom navigation, keyboard, and mobile Safari risks.
- It would also blur the boundary between filter dialog and non-modal popover behavior.

Decision:

- Defer.
- Keep the current `BottomSheet` until a dedicated filter/dialog audit approves a migration.

### Action Menus

Evidence:

- `ActionMenu` is used in profile, place detail, list detail, and list item surfaces.
- It handles edit/logout/list/place actions, including some owner-only or destructive-adjacent actions.
- ActionMenu accessibility was recently hardened, and Menu migration remains deferred.

Assessment:

- Popover is the wrong primitive for action lists.
- Base UI Menu is the correct future primitive, but it requires a dedicated Menu pilot.
- Using Popover here would risk regressing menu semantics and keyboard expectations.

Decision:

- Do not use Popover for menu surfaces.
- Continue following the ActionMenu/Menu audit path.

### Responsive Dialogs

Evidence:

- `ResponsiveDialog`, `Modal`, and `BottomSheet` are central custom primitives.
- They support edit profile, edit favorites, rating, list, image, and create flows.

Assessment:

- Popover is not an appropriate substitute for modal or bottom-sheet dialogs.
- These flows require focus management, explicit labels, Escape behavior, close affordances, and mobile layout guarantees.

Decision:

- Do not use Popover for dialog surfaces.
- Keep Dialog/ResponsiveDialog migration deferred pending dedicated audit.

### Inline Helper Text

Evidence:

- `frontend/src/components/ui/Input.tsx` uses visible helper/error text and `aria-describedby`.
- Current helper content is directly visible and screen-reader associated.

Assessment:

- Moving helper text into Popover would hide useful information and increase interaction cost.
- It would be a net accessibility and UX risk.

Decision:

- Keep helper text inline.
- Use future Field/Form work for semantics, not Popover.

## 5. Menu Target Analysis

Menu is not part of Wave 4 implementation, but it matters because several tempting Popover targets are actually menu surfaces.

Current menu-like surfaces:

- `frontend/src/components/ui/ActionMenu.tsx`
- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `frontend/src/features/places/PlaceDetailPage.tsx`
- `frontend/app/lists/[id]/page.tsx`

Decision:

- Do not use Popover for these surfaces.
- Base UI Menu remains the correct future primitive class.
- Menu migration should wait for an approved isolated Menu pilot.

## 6. Deferred Candidates Analysis

### Dialog

Deferred because:

- focus trap and restore behavior are high risk.
- mobile bottom-sheet behavior is custom and production-proven.
- mutation dialogs require production smoke with cleanup.

### Select

Deferred because:

- current app does not have a clear low-risk custom select requiring replacement.
- existing controls are mostly tabs, radios, search fields, or bottom sheets.

### Combobox

Deferred because:

- current search fields are not true suggestion comboboxes.
- converting them would risk changing product behavior and search expectations.

### Popover

Deferred because:

- no safe supplementary target exists beyond the already released Tooltip.
- the likely targets are essential mobile filters or action/dialog surfaces.

## 7. Risk Ranking

| Rank | Candidate | Risk | Reason |
| --- | --- | --- | --- |
| 1 | Keep existing Tooltip for stat help | Low | Already released and scoped. |
| 2 | Future supplementary Popover target, if a new one appears | Medium | Requires portal, focus, outside-click, RTL, and mobile checks. |
| 3 | Places subtype filter Popover | High | Essential mobile filter, currently dialog/sheet behavior. |
| 4 | ActionMenu via Popover | High | Wrong primitive; menu semantics risk. |
| 5 | Dialog-like surfaces via Popover | High | Wrong primitive; focus and modality risk. |

## 8. Recommended Phase 5 Decision

Recommended decision:

DO NOT IMPLEMENT POPOVER YET

This wave should remain an audit-only decision. The next implementation work should continue with lower-risk master-plan waves that have a real target:

1. Merge/release Wave 0 dependency and policy verification.
2. Review Wave 1 Field/Form audit.
3. Implement the selected low-risk Field/Form pilot only after Wave 0 is merged.

## 9. Recommended Target Surface

No Popover target is recommended.

Explicitly rejected targets:

- profile stat help: already handled by Tooltip.
- places subtype filter: essential mobile bottom-sheet filter.
- ActionMenu: should use Menu, not Popover.
- dialogs: should use Dialog/ResponsiveDialog strategy, not Popover.
- inline helper text: should stay visible and associated with form controls.

## 10. Why No Candidate Was Selected

A valid Popover pilot must be:

- supplementary.
- non-essential on mobile.
- isolated to one surface.
- not required to complete a workflow.
- not replacing Menu, Dialog, Select, or Combobox.
- not creating new product behavior.

No current surface satisfies these criteria.

The only supplementary target found is already served by Base UI Tooltip. Every other target either changes core workflow behavior or belongs to a different primitive class.

## 11. Why Other Candidates Were Deferred

- Menu surfaces were deferred because ActionMenu handles important actions and has a dedicated migration path.
- Dialog surfaces were deferred because focus trap, scroll lock, bottom sheet, and iOS Safari risks require a separate audit.
- Select and Combobox were deferred because no current low-risk product need exists.
- Places subtype filter was deferred because it is essential filtering on mobile and currently uses a bottom sheet.

## 12. Acceptance Criteria For A Future Popover Pilot

A future Popover pilot may proceed only if a new target appears that meets all of these:

- supplementary information or preview only.
- not required to complete a task.
- one surface only.
- no mutation.
- no menu actions.
- no dialog replacement.
- no filter required for a core browsing flow.
- Arabic trigger accessible name.
- Arabic popup text.
- Escape closes popup.
- outside click closes popup.
- focus returns safely.
- no bottom-navigation collision.
- no horizontal overflow at 320px and 390px.
- no Radix dependency.

## 13. Required Screenshots

For any future Popover pilot:

- target page 390x844 closed state.
- target page 390x844 open state.
- target page 320x568 open state.
- trigger focused state.
- popup near viewport edge if placement/collision is relevant.
- RTL open-state screenshot.
- no bottom-nav collision screenshot if the trigger is near the viewport bottom.

## 14. Required E2E Tests

For any future Popover pilot:

- trigger has Arabic accessible name.
- trigger opens popup by click/tap.
- trigger opens popup by keyboard.
- Escape closes popup.
- outside click closes popup.
- focus remains visible.
- focus returns or advances according to the documented contract.
- popup content is discoverable by assistive technology.
- no horizontal overflow.
- no Radix dependency.
- no product behavior change.

## 15. Accessibility Checklist

Future Popover work must verify:

- correct trigger role and accessible name.
- correct popup semantics for non-modal supplementary content.
- keyboard open/close.
- Escape close.
- outside-click close.
- focus behavior documented and tested.
- no required content hidden behind hover only.
- no duplicate or conflicting tooltip/popover semantics.

## 16. RTL/Mobile Checklist

Future Popover work must verify:

- Arabic text direction.
- natural RTL placement and alignment.
- no clipping at 320px.
- no horizontal overflow at 320px, 390px, and 430px.
- no collision with fixed bottom navigation.
- mobile Safari visual viewport risk documented.
- touch target is at least 44px where practical.

## 17. Layering / Portal Checklist

Future Popover work must follow `BASE_UI_LAYERING_POLICY.md`:

- use the documented z-index scale.
- do not cover active dialogs, prompts, or toasts unexpectedly.
- do not collide with bottom navigation.
- verify scroll behavior.
- verify portal root behavior.
- verify cleanup on close/unmount.

## 18. Rollback Strategy

For any future Popover pilot:

- keep the PR isolated to one surface.
- keep the previous inline/helper UI easy to restore.
- avoid shared primitive rewrites.
- do not combine with Menu/Dialog/Select/Combobox work.
- rollback is a single PR revert.

## 19. Production Smoke Requirements

If a future Popover pilot is approved:

- authenticated read-only smoke only.
- open and close the Popover.
- verify Arabic/RTL at 390x844.
- verify no horizontal overflow.
- verify no bottom-navigation collision.
- verify no overlay/z-index regression.
- verify no Radix dependency remains.

Production mutation is not allowed for a Popover pilot.

## 20. Final Recommendation

Final recommendation:

DO NOT IMPLEMENT POPOVER YET

Reason:

The current app has no safe Popover target. The useful supplementary surface is already handled by Base UI Tooltip. The remaining candidates are essential mobile filters, menus, or dialogs and should not be migrated through Popover.

Next recommended work:

1. Finish review/merge/release of Wave 0 dependency and policy verification.
2. Review Wave 1 Field/Form candidate audit.
3. Implement Wave 1 only after Wave 0 is merged and the selected field target is approved.

