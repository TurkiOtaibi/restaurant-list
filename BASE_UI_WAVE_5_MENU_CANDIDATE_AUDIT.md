# Base UI Wave 5 Menu Candidate Audit

## 1. Executive Summary

Wave 5 can proceed to a **dedicated Base UI Menu pilot later**, but not as the next implementation PR.

The existing `ActionMenu` accessibility foundation has already been hardened and covered by follow-up E2E tests. That removes the previous blocker, but the remaining menu surfaces still touch important behavior. A Base UI Menu migration is now safer to plan, not safe to implement globally.

Recommended decision:

- Proceed later with a one-surface Base UI Menu pilot.
- Do not replace the shared `ActionMenu` globally.
- Do not pilot Menu before Wave 0 dependency/policy verification is merged.
- Prefer the system-list list-detail header menu as the future pilot target because delete is hidden there and existing E2E coverage already exercises that state.

Implementation safe to start now:

- No.

Implementation safe after prerequisites:

- Yes, if limited to the system-list list-detail header menu and approved as a dedicated PR.

## 2. Current Base UI Adoption Status

Released Base UI primitives:

| Primitive | Current location | Status |
| --- | --- | --- |
| Tooltip | `frontend/src/components/ui/BaseTooltip.tsx` | Released |
| Switch | `frontend/src/components/ui/BaseSwitchPilot.tsx` | Released pilot |
| Checkbox | `frontend/src/features/profile/ProfileArchivePage.tsx` favorites picker | Released pilot |
| Tabs | `frontend/src/features/places/PlaceLibraryPage.tsx` places type control | Released pilot |

Not migrated:

- Menu
- Dialog
- Popover
- Select
- Combobox

Current policy:

- Radix must remain absent.
- Base UI Menu must not be introduced as part of Dialog, Popover, Select, or Combobox work.
- Any Menu migration must be one PR, one surface, screenshot-backed, RTL-safe, accessibility-reviewed, and fully gated.

## 3. Evidence Reviewed

Repository evidence:

- `frontend/src/components/ui/ActionMenu.tsx`
- `ACTIONMENU_ACCESSIBILITY_CONTRACT.md`
- `ACTIONMENU_ACCESSIBILITY_HARDENING_REPORT.md`
- `frontend/tests/e2e/wishlist-phase-5.spec.ts`
- `frontend/tests/e2e/profile-phase-1.spec.ts`
- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `frontend/src/features/places/PlaceDetailPage.tsx`
- `frontend/app/lists/[id]/page.tsx`

Official Base UI docs reviewed:

- Menu: https://base-ui.com/react/components/menu
- Composition: https://base-ui.com/react/handbook/composition
- Dialog: https://base-ui.com/react/components/dialog

Relevant docs implications:

- Base UI Menu is the correct primitive class for dropdown action lists.
- Base UI Menu is unstyled and must be styled to match the existing dark RTL design.
- Menu-to-dialog handoff is possible, but it must be controlled deliberately and tested.
- Menu introduces positioning, portal/layering, and focus behavior that current local `ActionMenu` does not use.

## 4. Current ActionMenu Contract Status

The previous Menu deep audit recommended deferring Menu until the existing custom menu was hardened. That prerequisite is now substantially met.

Current `ActionMenu` supports:

- real button trigger
- Arabic `aria-label`
- `aria-haspopup="menu"`
- `aria-expanded`
- `aria-controls`
- `role="menu"`
- `role="menuitem"`
- keyboard open from `Enter`, `Space`, `ArrowDown`, and `ArrowUp`
- focus movement into menu on open
- Arrow key wrapping
- `Home` / `End`
- `Escape` close from item focus
- outside-click close
- focus restoration to trigger for keyboard/outside close

Current E2E coverage:

- `wishlist-phase-5.spec.ts` covers the system list action menu keyboard and focus contract.
- `profile-phase-1.spec.ts` covers multi-item wrapping and Tab close behavior.

Remaining custom-menu gaps:

- Typeahead is not implemented.
- Disabled menu items are not modeled.
- Current menu is local absolute positioning, not portaled.
- Base UI Menu would need to preserve or intentionally document any behavior differences.

## 5. Current Menu / Action Surface Inventory

| Surface | File | Actions | Criticality | Destructive risk | Existing coverage | Pilot suitability |
| --- | --- | --- | --- | --- | --- | --- |
| Shared `ActionMenu` primitive | `frontend/src/components/ui/ActionMenu.tsx` | Caller-defined | High if changed globally | Caller-defined | Direct and indirect E2E | Do not migrate globally. |
| Profile header menu | `frontend/src/features/profile/ProfileArchivePage.tsx` | Edit profile, logout | High | Logout is session-affecting | Profile E2E | Defer. |
| Place detail menu | `frontend/src/features/places/PlaceDetailPage.tsx` | Add list, rate/edit, image actions | High | Remove image direct mutation | Place/image E2E | Defer. |
| List detail header menu, normal list | `frontend/app/lists/[id]/page.tsx` | Edit, delete | High | Delete list | List E2E | Defer. |
| List detail header menu, system list | `frontend/app/lists/[id]/page.tsx` | Edit visibility only | Medium | Delete hidden | Wishlist/system-list E2E | Best future pilot. |
| List item row menu | `frontend/app/lists/[id]/page.tsx` | Remove place | High | Remove item, undo path | List E2E | Defer. |

## 6. Candidate Comparison

| Candidate | User value | Accessibility value | RTL/mobile risk | Portal/z-index risk | Product risk | Implementation complexity | Rollback difficulty | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| System-list list-detail header menu | Medium | Medium-High | Medium | Medium | Medium | Medium | Low-Medium | Best future pilot. |
| Profile header menu | Medium | Medium-High | Medium | Medium | High | Medium | Medium | Defer. |
| Normal list detail header menu | Medium | Medium-High | Medium | Medium | High | Medium | Medium | Defer. |
| Place detail menu | Medium | Medium-High | High | Medium-High | High | High | Medium-High | Defer. |
| List item row menu | Medium | Medium | High | Medium | High | High | Medium | Defer. |
| Shared global ActionMenu replacement | High | High | High | High | Very high | High | High | Do not do. |

## 7. Recommended Wave 5 Target

Recommended future target:

- System-list list-detail header menu on `/lists/{wishlist.id}`.

Why this target:

- It is one surface.
- It already has E2E coverage.
- In the system-list state, the delete action is hidden.
- The remaining menu action opens edit/visibility behavior without exposing rename/delete.
- It exercises the same `ActionMenu` trigger/menu/menuitem pattern without starting from the most destructive branch.

Why this is not safe to implement immediately:

- Wave 0 policy verification is still open.
- Waves 1-4 are still pending review/merge sequencing.
- A Menu implementation should not be merged while earlier Base UI wave governance is still unmerged.
- Even the system-list target opens an edit dialog, so menu-to-dialog handoff must be tested deliberately.

## 8. Explicitly Deferred Targets

### Global `ActionMenu`

Deferred because:

- It would alter every action menu at once.
- It would mix profile, place, list, and row action behavior in one PR.
- Rollback would be wider than one surface.

### Profile Header Menu

Deferred because:

- It includes logout.
- Logout affects session state and navigation.
- Edit profile opens a dialog.

### Place Detail Menu

Deferred because:

- It contains rating/list/image actions.
- Creator-only image actions have permission branches.
- Remove image is a direct destructive mutation.

### Normal List Detail Header Menu

Deferred because:

- It includes delete.
- Delete uses confirmation dialog behavior.

### List Item Row Menu

Deferred because:

- It is repeated per row.
- It removes list items and triggers undo toast behavior.
- Focus behavior after row removal is sensitive.

## 9. Base UI Menu Pilot Shape

Recommended implementation shape for a future PR:

- Create a small `BaseActionMenu` wrapper, or locally use Base UI Menu in the system-list header only.
- Do not replace the existing shared `ActionMenu` globally.
- Keep the existing `ActionMenu` export and all other surfaces unchanged.
- Use existing `ds-action-menu*` visual classes where practical.
- Preserve trigger accessible name.
- Preserve item labels and ordering.
- Preserve menu action handlers.
- Preserve RTL alignment.
- Follow `BASE_UI_LAYERING_POLICY.md`.

Do not combine with:

- Dialog migration.
- Popover migration.
- Select/Combobox work.
- Action redesign.
- destructive-action behavior changes.

## 10. Acceptance Criteria For Future Implementation

A future Wave 5 Menu pilot must prove:

- Base UI Menu is used in exactly one surface.
- The surface is the system-list list-detail header menu unless a new review approves another target.
- Existing `ActionMenu` remains used everywhere else.
- No global ActionMenu replacement.
- No Radix dependency.
- No backend/API/auth/database changes.
- No product behavior changes.
- Trigger has Arabic accessible name.
- Trigger exposes open state correctly.
- Menu opens by click/tap.
- Menu opens by `Enter` and `Space`.
- Menu items are keyboard reachable.
- Arrow key navigation works.
- `Home` / `End` behavior is tested if supported.
- `Escape` closes menu from item focus.
- Outside click closes menu.
- Focus returns to trigger after close.
- Selecting edit opens the same edit-list dialog.
- System list still hides rename field.
- System list still hides delete.
- Visibility editing remains allowed.
- No destructive action is introduced into the pilot target.
- No horizontal overflow at 320px and 390px.
- No bottom-navigation collision.

## 11. Required E2E Tests

Future implementation must update or add focused E2E coverage for:

- system list menu trigger visible and named `إجراءات القائمة`
- menu opens by click
- menu opens by keyboard
- item receives focus after open
- ArrowDown / ArrowUp behavior
- Home / End behavior if Base UI Menu supports it
- Escape closes from item focus
- outside click closes
- focus returns to trigger
- edit item opens the existing edit dialog
- edit dialog does not show the name field for system lists
- visibility radio remains editable
- delete item is absent
- no Radix dependency
- Base UI import policy allow-list intentionally includes `menu` only for the approved target

Do not weaken existing list, wishlist, profile, place, or ActionMenu tests.

## 12. Required Screenshots

Save screenshots under:

`docs/qa-execution/base-ui-menu-pilot/screenshots/`

Required:

- system list page 390x844 menu closed
- system list page 390x844 menu open
- system list page 390x844 focused menu item
- system list page 320x568 menu open
- edit dialog opened from menu at 390x844
- RTL alignment and no-horizontal-overflow evidence

## 13. Accessibility Checklist

Verify:

- trigger is a button or equivalent button semantics.
- trigger has Arabic accessible name.
- open/expanded state is exposed.
- menu has appropriate semantics.
- menu items have Arabic accessible names.
- focus moves predictably on open.
- keyboard navigation works.
- Escape closes.
- outside click closes.
- focus returns to trigger.
- menu-to-dialog handoff does not restore focus over the dialog.
- visible focus states remain.

## 14. RTL / Mobile Checklist

Verify:

- Arabic labels remain unchanged.
- menu aligns naturally from the inline end side.
- no clipping at 320px.
- no horizontal overflow at 320px, 390px, and 430px.
- touch targets remain at least 44px where practical.
- no bottom-navigation collision.
- iOS Safari visual viewport behavior is checked or explicitly documented.

## 15. Layering / Portal Checklist

Because Base UI Menu may use portal/positioner behavior, verify:

- z-index follows `BASE_UI_LAYERING_POLICY.md`.
- menu appears above page content.
- menu does not appear above active dialogs incorrectly.
- menu does not conflict with toasts or prompts.
- menu does not collide with bottom navigation.
- outside click works through portal boundaries.
- cleanup on close/unmount is correct.

## 16. Rollback Strategy

Rollback should be a single PR revert.

If a wrapper is introduced:

1. Restore the target surface to existing `ActionMenu`.
2. Remove the Base UI Menu wrapper if unused.
3. Remove `menu` from the Base UI import policy allow-list if no longer used.
4. Keep `@base-ui/react` because released Tooltip/Switch/Checkbox/Tabs still require it.
5. Re-run full gates.

No backend, API, auth, database, or product data rollback should be required.

## 17. Production Smoke Requirements

Production smoke should be read-only where possible:

- login
- open system wishlist list detail if reachable
- verify menu trigger visible
- open menu
- verify edit item visible
- verify delete item absent
- verify keyboard navigation if practical
- close menu with Escape
- verify focus/visual state if practical
- do not save visibility changes unless mutation-capable smoke is explicitly approved
- verify RTL at 390x844
- verify no horizontal overflow
- verify no bottom-navigation collision
- verify no Radix dependency remains

If the smoke account has no system wishlist:

- do not create production data unless explicitly approved.
- mark production surface-specific smoke as not executed.

## 18. Risk Register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Portal/layering differs from current local menu | High | Follow layering policy and screenshot open states. |
| Menu-to-dialog focus handoff regresses | High | Test edit item opening dialog and focus behavior. |
| System-list protection UI regresses | High | Assert delete absent and name field hidden. |
| Visibility edit behavior changes | High | Test visibility remains editable. |
| Keyboard behavior differs from hardened custom menu | Medium | Role/name keyboard E2E. |
| RTL placement changes | Medium | 320/390/430 screenshots. |
| Base UI import policy drift | Medium | Update dependency policy allow-list only in the implementation PR. |
| Accidental global migration | High | Keep scope to one target surface. |

## 19. Final Recommendation

Final recommendation:

PROCEED LATER WITH BASE UI MENU PILOT

Recommended component:

- Base UI Menu

Recommended target surface:

- System-list list-detail header menu only.

Risk level:

- Medium-High.

Implementation safe to start now:

- No.

Implementation safe to start after prerequisites:

- Yes, if Wave 0 is merged and the implementation PR is limited to the target and acceptance criteria in this report.

Prerequisites:

1. Merge/release Wave 0 dependency and policy verification.
2. Resolve the current docs/audit queue or explicitly approve Wave 5 sequencing.
3. Confirm `BASE_UI_LAYERING_POLICY.md` still reflects current z-index values.
4. Keep Radix absent.
5. Do not mix Menu with Dialog, Popover, Select, or Combobox migration.

