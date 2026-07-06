# Base UI Dialog Wave Closure Decision

## 1. Purpose

This decision closes the current Base UI Dialog / Drawer wave without implementation.

The goal is to keep the Base UI migration moving while avoiding a high-risk overlay migration that is not yet approved.

## 2. Decision

Decision:

**Close the current Dialog / Drawer wave with no implementation.**

Current approved strategy:

**Keep `ResponsiveDialog`, `Modal`, and `BottomSheet` custom.**

This means:

- do not add Base UI Dialog.
- do not add Base UI Drawer.
- do not add Base UI Alert Dialog.
- do not replace `ResponsiveDialog`.
- do not change create-list dialog behavior.
- do not change mobile bottom-sheet behavior.
- do not change route, focus, close, confirm-close, scroll-lock, or background-isolation behavior.

## 3. Evidence

This decision is based on:

- `BASE_UI_FULL_MIGRATION_MASTER_PLAN.md`
- `BASE_UI_WAVE_6_DIALOG_CANDIDATE_AUDIT.md`
- `RESPONSIVEDIALOG_ACCESSIBILITY_CONTRACT.md`
- `RESPONSIVEDIALOG_CONTRACT_TEST_REPORT.md`
- `RESPONSIVEDIALOG_CONFIRM_CLOSE_FOLLOWUP_REPORT.md`
- `RESPONSIVEDIALOG_ALERTDIALOG_FOLLOWUP_REPORT.md`
- `BASE_UI_DIALOG_PILOT_READINESS_AUDIT.md`
- `BASE_UI_DIALOG_DRAWER_STRATEGY_DECISION.md`
- `CREATE_LIST_SMOKE_CLEANUP_POLICY.md`
- `BASE_UI_CREATE_LIST_DIALOG_PILOT_REAUDIT.md`

## 4. Why The Wave Is Closed

The repository has enough evidence to make one decision:

Base UI Dialog implementation should not start yet.

The remaining unresolved issue is not a test gap only. It is a responsive architecture decision:

- current desktop behavior is a modal.
- current mobile behavior is a bottom sheet.
- Base UI Dialog alone does not preserve the mobile bottom-sheet model.
- Base UI Drawer may be a better mobile match, but pairing Dialog and Drawer would introduce two high-risk overlay primitives in one implementation wave.

The safe current path is to keep the custom responsive dialog primitive.

## 5. What Was Unblocked

The production-smoke cleanup blocker for a future create-list dialog pilot is now addressed by `CREATE_LIST_SMOKE_CLEANUP_POLICY.md`.

Future create-list smoke may create exactly one temporary private list with the approved smoke account and must delete it before final release verdict.

That policy removes cleanup ambiguity, but it does not approve implementation.

## 6. What Remains Blocked

The following remain blocked:

- Base UI Dialog implementation.
- Base UI Drawer implementation.
- Base UI Alert Dialog implementation.
- route-mounted create-list dialog migration.
- global `ResponsiveDialog` replacement.
- mobile bottom-sheet replacement.

Reason:

No explicit product/engineering approval exists for changing or replacing the responsive modal/bottom-sheet strategy.

## 7. Conditions To Reopen Dialog / Drawer Work

Reopen only when all are true:

- one exact dialog target is selected.
- one responsive strategy is approved:
  - Base UI Dialog desktop only with custom BottomSheet mobile, or
  - Base UI Dialog desktop plus Base UI Drawer mobile.
- dependency policy is updated for the exact approved primitive imports.
- no Radix dependency is introduced.
- behavior parity tests exist before migration.
- mobile screenshots are required.
- production smoke cleanup is approved if the target mutates data.
- rollback is a single focused PR revert.

## 8. Required Approval For Future Implementation

A future implementation PR must explicitly state which strategy is approved:

### Strategy A

Use Base UI Dialog on desktop and keep custom BottomSheet on mobile.

This is lower risk than Drawer, but creates a hybrid implementation.

### Strategy B

Use Base UI Dialog on desktop and Base UI Drawer on mobile.

This aligns more closely with the Base UI direction, but is higher risk and requires stronger mobile/iOS proof.

No implementation may proceed without choosing one.

## 9. Current Custom Component Status

`ResponsiveDialog`, `Modal`, and `BottomSheet` remain active and intentionally custom.

They are not technical debt to remove immediately. They are production-critical primitives with existing coverage for:

- accessible names.
- focus trap.
- focus restore.
- Escape behavior.
- close button behavior.
- unsaved confirm-close.
- destructive `alertdialog` cancel safety.
- portal cleanup.
- body scroll-lock cleanup.
- background isolation cleanup.
- mobile bottom-sheet behavior.

## 10. Next Base UI Plan Step

The next Base UI work should not be Dialog / Drawer.

Allowed next work:

- continue with non-Dialog waves that are already audited and low risk.
- audit future Select / Combobox only if a real product need appears.
- audit keep-custom surfaces where Base UI does not provide a clear benefit.
- add current `ResponsiveDialog` screenshots or tests only if a concrete gap is found.

Disallowed next work without new approval:

- Base UI Dialog pilot.
- Base UI Drawer pilot.
- Base UI Alert Dialog pilot.
- global `ResponsiveDialog` migration.
- any migration that combines Dialog with Menu, Popover, Select, Combobox, Rating, Toast, or navigation.

## 11. Release And Smoke Implication

Because this is a no-implementation decision:

- no production smoke is required.
- no deployment verification is required.
- no production data mutation is allowed.
- no cleanup is required.

Future implementation must follow `CREATE_LIST_SMOKE_CLEANUP_POLICY.md` if it mutates production data during release verification.

## 12. Final Recommendation

Final recommendation:

**Keep `ResponsiveDialog` custom for now and move Base UI planning forward without a Dialog implementation.**

Implementation safe to start:

**No.**
