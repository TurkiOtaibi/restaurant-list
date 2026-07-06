# Base UI Dialog / Drawer Strategy Decision

## 1. Purpose

This decision record defines the current strategy for Base UI Dialog, Drawer, and Alert Dialog adoption.

It exists because the Base UI migration plan has reached the first high-risk overlay area where implementation cannot safely continue without an explicit responsive-dialog strategy and production smoke policy.

## 2. Current State

Released Base UI primitives:

- Tooltip
- Switch
- Checkbox
- Tabs
- Field/Input
- Radio / RadioGroup
- Menu, limited to the approved system-list action-menu pilot

Still custom:

- `ResponsiveDialog`
- desktop `Modal`
- mobile `BottomSheet`
- destructive confirmation dialogs
- route-mounted create/edit dialogs
- upload, rating, save-to-list, and favorites edit dialogs

Relevant policy and evidence:

- `BASE_UI_FULL_MIGRATION_MASTER_PLAN.md`
- `BASE_UI_LAYERING_POLICY.md`
- `RESPONSIVEDIALOG_ACCESSIBILITY_CONTRACT.md`
- `BASE_UI_DIALOG_PILOT_READINESS_AUDIT.md`
- `frontend/tests/e2e/responsive-dialog-contract.spec.ts`

Radix remains disallowed.

## 3. Decision

Decision:

**Keep the current custom `ResponsiveDialog`, `Modal`, and `BottomSheet` implementation for now.**

Base UI Dialog, Base UI Drawer, and Base UI Alert Dialog are not approved for implementation yet.

This means:

- no `@base-ui/react/dialog` imports.
- no `@base-ui/react/drawer` imports.
- no `@base-ui/react/alert-dialog` imports.
- no global `ResponsiveDialog` replacement.
- no dialog migration mixed with Menu, Popover, Select, Combobox, Toast, Field, Radio, Rating, or navigation work.
- no product behavior changes to dialog close, focus, confirmation, or mobile sheet behavior.

## 4. Decision Rationale

The current dialog system is not a simple desktop modal.

It is a responsive primitive with two different interaction models:

- desktop: modal dialog.
- mobile: bottom sheet.

Base UI Dialog maps to the desktop modal behavior. Base UI Drawer maps more closely to the mobile bottom-sheet behavior. Migrating only Dialog would not prove mobile parity. Migrating Dialog and Drawer together would introduce two high-risk overlay primitives in one wave.

The safest current decision is to keep the custom implementation until the mobile strategy and production smoke policy are explicitly approved.

## 5. Options Considered

### Option A: Base UI Dialog On Desktop Only, Keep Custom BottomSheet On Mobile

Status: not approved.

Reason:

- Lower scope than a full responsive migration.
- Still creates a hybrid primitive with two behavior engines.
- Does not prove Base UI Drawer compatibility.
- Requires wrapper design and parity tests before use.

This option may be revisited only after a dedicated wrapper design is approved.

### Option B: Base UI Dialog Plus Base UI Drawer

Status: not approved.

Reason:

- Better maps to the existing responsive split.
- Higher implementation risk.
- Introduces two new high-risk overlay primitives in one wave.
- Requires strong mobile Safari, safe-area, scroll lock, focus, and bottom-navigation evidence.

This option may be revisited only as a dedicated approved implementation wave.

### Option C: Keep ResponsiveDialog Custom For Now

Status: approved current strategy.

Reason:

- Lowest product and release risk.
- Current custom implementation is production-proven.
- Current contract coverage is now materially stronger.
- No dependency-policy expansion is required.
- No mobile bottom-sheet behavior is changed.

## 6. Future Revisit Conditions

Revisit Base UI Dialog / Drawer only when all conditions are met:

- one exact target dialog is selected.
- the responsive strategy is explicitly approved.
- mobile bottom-sheet behavior is preserved or an intentional product/design change is approved.
- production smoke data creation and cleanup are approved if the target mutates data.
- the target has current behavior parity tests before migration.
- screenshots are required for mobile and desktop open states.
- no Radix dependency is introduced.
- the dependency policy is updated only for the specifically approved Base UI primitive.

## 7. Production Smoke Policy For A Future Create-List Pilot

The route-mounted create-list dialog is the least-bad future pilot candidate, but it creates persistent data.

Before implementation, release policy must define:

- whether the approved smoke account may create a temporary list.
- the exact temporary list naming convention.
- the cleanup path using existing UI/API behavior.
- whether cleanup failure blocks release.
- where temporary data and cleanup result are recorded.

Required rule:

If a future Dialog pilot requires production mutation and cleanup cannot be completed, final release verdict must be `NOT RELEASED`.

## 8. Accessibility Requirements For Future Implementation

Any future Dialog / Drawer pilot must preserve:

- Arabic accessible dialog names.
- `dialog` and `alertdialog` role behavior.
- initial focus behavior.
- Tab and Shift+Tab focus trap behavior.
- Escape behavior.
- close button behavior.
- unsaved-change confirm-close behavior.
- focus restoration behavior.
- background inert / `aria-hidden` isolation.
- scroll lock and cleanup.
- visible focus states.

Destructive confirmation flows must not become easier to trigger.

## 9. RTL, Mobile, And iOS Requirements

Any future implementation must verify:

- RTL layout at 320x568, 390x844, and 430x932.
- no horizontal overflow.
- mobile bottom sheet or Drawer does not collide with bottom navigation.
- safe-area spacing remains correct.
- dialog content remains scrollable without body scroll leakage.
- iOS Safari visual viewport behavior is verified or the limitation is explicitly documented.
- Arabic copy and Arabic accessible names remain unchanged.

## 10. Screenshot Requirements For Future Implementation

Required screenshots under a target-specific folder:

- desktop dialog open state.
- mobile open state at 320x568.
- mobile open state at 390x844.
- initial focused control.
- confirm-close state when applicable.
- alertdialog state when applicable.
- no-horizontal-overflow evidence.

## 11. Testing Requirements For Future Implementation

Required E2E coverage:

- route/page opens the target dialog.
- Arabic accessible name is exposed.
- initial focus lands on the expected control.
- Tab and Shift+Tab are trapped.
- Escape follows the existing close contract.
- close button follows the existing close contract.
- unsaved-change confirmation is preserved where applicable.
- destructive confirmation remains safe where applicable.
- focus returns safely after close.
- portal cleanup works.
- body scroll lock cleanup works.
- background isolation cleanup works.
- mobile 320 and 390 layouts fit.
- no horizontal overflow.
- no Radix dependency.
- Base UI imports are limited to the approved primitive.

## 12. Stop / Go Criteria

### Go

Proceed only when:

- the target is isolated.
- the responsive strategy is approved.
- behavior parity is testable.
- production smoke can verify the changed surface.
- rollback is a single focused PR revert.

### Stop

Keep the current custom implementation when:

- mobile bottom-sheet parity is unclear.
- production mutation cleanup is not approved.
- focus trap or scroll-lock behavior becomes less predictable.
- the migration requires changing product behavior.
- Radix would be introduced.
- tests must be weakened.

## 13. Rollback Strategy

For this decision record:

- remove `BASE_UI_DIALOG_DRAWER_STRATEGY_DECISION.md`.

For a future implementation:

1. restore the target to current `ResponsiveDialog`.
2. remove unused Base UI Dialog / Drawer / Alert Dialog wrappers.
3. remove newly allowed imports from dependency-policy checks if no longer used.
4. keep `@base-ui/react` for released primitives.
5. rerun full frontend and backend gates.

## 14. Next Allowed Work

Allowed next work:

- add more current `ResponsiveDialog` contract tests if gaps are found.
- add screenshot evidence for existing `ResponsiveDialog` surfaces.
- draft a future create-list smoke cleanup policy.
- audit one exact Dialog / Drawer target again after the above policies exist.

Not allowed next work without explicit approval:

- Base UI Dialog implementation.
- Base UI Drawer implementation.
- Base UI Alert Dialog implementation.
- global `ResponsiveDialog` replacement.
- Dialog migration mixed with another primitive migration.

## 15. Final Decision

Final decision:

**DO NOT IMPLEMENT BASE UI DIALOG / DRAWER YET.**

Current approved strategy:

**Keep `ResponsiveDialog`, `Modal`, and `BottomSheet` custom until a specific responsive strategy and production smoke cleanup policy are approved.**

Implementation safe to start:

**No.**
