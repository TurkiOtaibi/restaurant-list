# Base UI Create-List Dialog Pilot Re-Audit

## 1. Executive Summary

The route-mounted create-list dialog remains the best future Base UI Dialog pilot candidate, but implementation is still not approved.

The previous production-smoke cleanup blocker has been reduced by `CREATE_LIST_SMOKE_CLEANUP_POLICY.md`. A future release can now create exactly one temporary private list with the approved smoke account and must delete it before final verdict.

The remaining blocker is the responsive primitive strategy:

- current desktop behavior is `Modal`.
- current mobile behavior is `BottomSheet`.
- Base UI Dialog alone does not preserve the mobile bottom-sheet model.
- Base UI Drawer may preserve the mobile model better, but adding Dialog and Drawer together is a higher-risk implementation wave.

Final recommendation:

**DO NOT IMPLEMENT YET.**

Implementation can start only after an explicit responsive strategy is approved for this exact target.

## 2. Current Base UI Status

Released Base UI primitives:

- Tooltip
- Switch
- Checkbox
- Tabs
- Field/Input
- Radio / RadioGroup
- Menu, limited to the approved system-list action-menu pilot

Not approved:

- Base UI Dialog
- Base UI Drawer
- Base UI Alert Dialog

Dependency policy:

- Radix remains disallowed.
- No Dialog/Drawer/Alert Dialog imports are currently approved.

## 3. Evidence Reviewed

Documents:

- `BASE_UI_FULL_MIGRATION_MASTER_PLAN.md`
- `BASE_UI_DIALOG_PILOT_READINESS_AUDIT.md`
- `BASE_UI_DIALOG_DRAWER_STRATEGY_DECISION.md`
- `RESPONSIVEDIALOG_ACCESSIBILITY_CONTRACT.md`
- `CREATE_LIST_SMOKE_CLEANUP_POLICY.md`
- `PRODUCTION_SMOKE_RUNBOOK.md`
- `SMOKE_ACCOUNT_BASELINE.md`

Code:

- `frontend/app/lists/new/page.tsx`
- `frontend/src/features/lists/CreateListDialog.tsx`
- `frontend/src/components/ui/Dialog.tsx`
- `frontend/tests/e2e/responsive-dialog-contract.spec.ts`

## 4. Target Surface

Target:

- `/lists/new`
- `frontend/app/lists/new/page.tsx`
- `frontend/src/features/lists/CreateListDialog.tsx`

Current behavior:

- route verifies session.
- unauthenticated users redirect to login with return URL.
- authenticated users see the create-list dialog immediately.
- closing routes to `/lists?focus=create-list`.
- submitting creates a list through `POST /lists`.
- successful submit routes to `/lists/{id}`.
- unsaved changes trigger confirm-close behavior.
- mobile renders through `BottomSheet`.
- desktop renders through `Modal`.

## 5. Why This Is Still The Best Future Candidate

Compared with other dialog surfaces, create-list is still the least risky future pilot because:

- it is route-mounted and isolated at `/lists/new`.
- it has a small form surface.
- it does not include search, upload, rating, reorder, or image preview behavior.
- it already has current-contract E2E coverage for confirm-close behavior.
- the production smoke cleanup path is now documented.

It is still not low risk because it creates persistent data and depends on mobile bottom-sheet behavior.

## 6. Blocker Status

| Blocker | Previous status | Current status | Evidence |
| --- | --- | --- | --- |
| Production smoke cleanup policy | Blocking | Addressed | `CREATE_LIST_SMOKE_CLEANUP_POLICY.md` |
| Exact target selected | Partial | Addressed for audit | `/lists/new` route-mounted create-list dialog |
| Current contract tests | Partial | Mostly addressed | `responsive-dialog-contract.spec.ts` covers focus, close, confirm-close, alertdialog cancel, cleanup |
| Responsive strategy | Blocking | Still blocking | `BASE_UI_DIALOG_DRAWER_STRATEGY_DECISION.md` keeps custom `ResponsiveDialog` |
| Base UI Dialog/Drawer dependency approval | Blocking | Still blocking | no approved imports for Dialog/Drawer/Alert Dialog |
| Mobile Safari proof for replacement | Blocking | Still blocking | no implementation target screenshots for Base UI Dialog/Drawer |

## 7. Responsive Strategy Assessment

### Option A: Base UI Dialog Desktop Only, Keep Custom BottomSheet On Mobile

Implementation risk: Medium.

Pros:

- smallest possible Base UI Dialog proof.
- preserves existing mobile bottom-sheet implementation.
- limits mobile regression.

Cons:

- introduces a hybrid dialog system.
- does not prove Base UI Drawer compatibility.
- requires a wrapper that chooses Base UI Dialog only on desktop and current custom BottomSheet on mobile.
- requires dependency-policy approval for Dialog only.

Status:

Not approved yet.

### Option B: Base UI Dialog Desktop, Base UI Drawer Mobile

Implementation risk: High.

Pros:

- aligns more closely with the long-term Base UI direction.
- maps desktop and mobile to Base UI primitives.

Cons:

- introduces two new high-risk overlay primitives in one wave.
- requires stronger iOS Safari, safe-area, scroll-lock, focus, and bottom-navigation evidence.
- raises rollback complexity.
- requires dependency-policy approval for both Dialog and Drawer.

Status:

Not approved yet.

### Option C: Keep ResponsiveDialog Custom

Implementation risk: Low.

Pros:

- preserves current behavior.
- avoids new overlay dependency risk.
- uses existing contract coverage.

Cons:

- slows full Base UI conversion.
- does not reduce custom dialog maintenance.

Status:

Current approved strategy.

## 8. Production Smoke Readiness

Production smoke for a future create-list pilot is now defined.

Allowed mutation:

- create exactly one temporary private list with the approved smoke account.
- use the naming convention in `CREATE_LIST_SMOKE_CLEANUP_POLICY.md`.
- delete the temporary list before final verdict.

Required release outcome:

- if cleanup succeeds and all checks pass, the release can be marked `RELEASED`.
- if cleanup fails, the release must remain `NOT RELEASED`.

This policy removes the previous cleanup ambiguity, but it does not approve implementation.

## 9. Required Acceptance Criteria For A Future Pilot

A future create-list dialog pilot must preserve:

- `/lists/new` route behavior.
- unauthenticated redirect behavior.
- session recovery behavior.
- Arabic title and labels.
- initial focus on the list name input.
- name-required validation.
- private default visibility.
- visibility selector behavior.
- unsaved-change confirm-close behavior.
- close route to `/lists?focus=create-list`.
- submit payload shape.
- success route to `/lists/{id}`.
- server error rendering through `StatusMessage`.
- mobile bottom-sheet or approved mobile Drawer behavior.
- desktop modal behavior.
- no horizontal overflow.
- no Radix dependency.

## 10. Required Tests For A Future Pilot

Required E2E:

- `/lists/new` opens the dialog for an authenticated session.
- dialog has Arabic accessible name.
- initial focus lands on the list-name field.
- Tab and Shift+Tab remain trapped.
- Escape with no changes closes through the existing route behavior.
- Escape with unsaved changes shows confirm-close.
- cancel confirm-close keeps the dialog open.
- confirm close routes to `/lists?focus=create-list`.
- close button follows the same contract.
- empty name validation is unchanged.
- visibility default is private.
- changing visibility works.
- submit sends the same payload.
- success routes to the created list detail page.
- portal cleanup works.
- scroll-lock cleanup works.
- background isolation cleanup works.
- mobile 320x568 and 390x844 fit.
- no horizontal overflow.
- no Radix dependency.
- Base UI imports are limited to the approved primitive.

## 11. Required Screenshots

Future screenshot directory:

`docs/qa-execution/base-ui-create-list-dialog-pilot/screenshots/`

Required screenshots:

- `/lists/new` desktop open state.
- `/lists/new` 390x844 open state.
- `/lists/new` 320x568 open state.
- initial focused list-name field.
- confirm-close notice state.
- validation error state.
- success cleanup evidence if captured without secrets.

## 12. Rollback Strategy

Rollback for a future implementation:

1. restore `CreateListDialog` to current `ResponsiveDialog`.
2. remove any new Base UI Dialog / Drawer wrapper if unused.
3. remove dependency-policy allow-list changes for Dialog/Drawer if no longer used.
4. keep `@base-ui/react` for released primitives.
5. rerun full frontend and backend gates.

No backend, API, auth, database, or product-data rollback should be required if behavior is preserved.

## 13. Stop / Go Decision

Go only if:

- Option A or Option B is explicitly approved.
- dependency policy is updated for the exact approved primitive.
- the implementation targets only `/lists/new`.
- production smoke uses `CREATE_LIST_SMOKE_CLEANUP_POLICY.md`.
- full local gates pass.
- screenshots prove desktop/mobile parity.

Stop if:

- mobile bottom-sheet parity is unclear.
- Dialog and Drawer would be added without approval.
- production cleanup cannot be verified.
- tests need to be weakened.
- Radix would be introduced.
- product behavior would change.

## 14. Final Recommendation

Recommended next decision:

Choose exactly one responsive strategy before implementation:

1. **Option A:** Base UI Dialog on desktop only, keep custom BottomSheet on mobile.
2. **Option B:** Base UI Dialog on desktop plus Base UI Drawer on mobile.
3. **Option C:** keep current custom `ResponsiveDialog`.

Current recommendation:

**Option C remains safest until a product/engineering owner explicitly approves Option A or Option B.**

Implementation safe to start:

**No.**
