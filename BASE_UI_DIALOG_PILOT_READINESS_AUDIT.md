# Base UI Dialog Pilot Readiness Audit

## 1. Executive Summary

Base UI Dialog migration is still not ready to implement.

The repository has materially improved the current `ResponsiveDialog` safety baseline:

- `RESPONSIVEDIALOG_ACCESSIBILITY_CONTRACT.md` documents the current contract.
- `frontend/tests/e2e/responsive-dialog-contract.spec.ts` now covers focus trap, focus restore, scroll lock, inert/aria-hidden isolation, close behavior, confirm-close behavior, and destructive `alertdialog` cancel safety.
- `RESPONSIVEDIALOG_CONFIRM_CLOSE_FOLLOWUP_REPORT.md` documents unsaved-change confirmation coverage.
- `RESPONSIVEDIALOG_ALERTDIALOG_FOLLOWUP_REPORT.md` documents destructive confirmation coverage.

That progress reduces migration risk, but it does not remove the two remaining blockers for a Base UI Dialog pilot:

1. The current app uses a responsive `Modal` / `BottomSheet` split. Base UI Dialog alone does not preserve the mobile bottom-sheet interaction model.
2. The best candidate, route-mounted `CreateListDialog` on `/lists/new`, creates data. Production smoke and cleanup policy for that mutation must be explicitly approved before implementation.

Final decision:

**DO NOT IMPLEMENT BASE UI DIALOG YET.**

Recommended next action:

**Create a dedicated mobile Dialog/Drawer strategy and production smoke cleanup decision for the route-mounted create-list candidate.**

## 2. Current Base UI Adoption Status

Released Base UI primitives:

| Primitive | Surface | Status |
| --- | --- | --- |
| Tooltip | Profile stat helper | Released |
| Switch | `/health` pilot | Released |
| Checkbox | Profile favorites picker selection | Released |
| Tabs | Places type control | Released |
| Field/Input | Profile favorites picker search | Released |
| Radio / RadioGroup | List visibility selector | Released |
| Menu | System-list detail action menu | Released |

Not migrated:

- Dialog
- Drawer / BottomSheet
- Alert Dialog
- Select
- Combobox

Dependency policy:

- `@base-ui/react/dialog` is not currently approved.
- `@base-ui/react/drawer` is not currently approved.
- `@base-ui/react/alert-dialog` is not currently approved.
- Radix remains disallowed.

## 3. Evidence Reviewed

Repository evidence:

- `BASE_UI_FULL_MIGRATION_MASTER_PLAN.md`
- `BASE_UI_WAVE_6_DIALOG_CANDIDATE_AUDIT.md`
- `RESPONSIVEDIALOG_ACCESSIBILITY_CONTRACT.md`
- `RESPONSIVEDIALOG_CONTRACT_TEST_REPORT.md`
- `RESPONSIVEDIALOG_CONFIRM_CLOSE_FOLLOWUP_REPORT.md`
- `RESPONSIVEDIALOG_ALERTDIALOG_FOLLOWUP_REPORT.md`
- `frontend/src/components/ui/Dialog.tsx`
- `frontend/src/features/lists/CreateListDialog.tsx`
- `frontend/src/features/lists/DeleteListDialog.tsx`
- `frontend/tests/e2e/responsive-dialog-contract.spec.ts`
- `frontend/tests/e2e/ui-dependency-policy.spec.ts`

Official Base UI documentation reviewed:

- Base UI Dialog: https://base-ui.com/react/components/dialog
- Base UI Drawer: https://base-ui.com/react/components/drawer
- Base UI Alert Dialog: https://base-ui.com/react/components/alert-dialog

Relevant documentation implications:

- Dialog is the Base UI primitive for modal dialog behavior.
- Drawer is the Base UI primitive that better maps to a bottom-sheet/drawer interaction.
- Alert Dialog is the Base UI primitive for destructive or interrupting confirmation flows.

## 4. Contract Coverage Status

Current `ResponsiveDialog` contract coverage:

| Contract area | Evidence | Status |
| --- | --- | --- |
| Accessible dialog name | `responsive-dialog-contract.spec.ts` | Covered |
| Initial focus | `responsive-dialog-contract.spec.ts` | Covered |
| Focus trap | `responsive-dialog-contract.spec.ts` | Covered |
| Focus restore | `responsive-dialog-contract.spec.ts` | Covered |
| Portal cleanup | `responsive-dialog-contract.spec.ts` | Covered |
| Body scroll lock cleanup | `responsive-dialog-contract.spec.ts` | Covered |
| Background inert / aria-hidden isolation | `responsive-dialog-contract.spec.ts` | Covered |
| Close button behavior | `responsive-dialog-contract.spec.ts` | Covered |
| Escape close behavior | `responsive-dialog-contract.spec.ts` | Covered |
| Unsaved confirm-close | `responsive-dialog-contract.spec.ts`, `RESPONSIVEDIALOG_CONFIRM_CLOSE_FOLLOWUP_REPORT.md` | Covered |
| Destructive alertdialog cancel safety | `responsive-dialog-contract.spec.ts`, `RESPONSIVEDIALOG_ALERTDIALOG_FOLLOWUP_REPORT.md` | Covered |
| Mobile geometry for all dialog classes | responsive layout tests cover representative fit; no per-dialog screenshot matrix | Partial |
| iOS Safari visual viewport behavior | existing iOS/session and responsive tests; no Dialog/Drawer-specific Safari proof | Partial |

## 5. Candidate Reassessment

| Candidate | Current risk | Value | Readiness | Decision |
| --- | --- | --- | --- | --- |
| Route-mounted `CreateListDialog` on `/lists/new` | Medium-High | Best first candidate if approved | Contract coverage improved, but mutation smoke and mobile strategy unresolved | Defer implementation |
| Route-mounted `CreatePlaceDialog` on `/places/new` | High | Later candidate | More fields, place creation, subtype selects, and validation risk | Defer |
| Edit profile dialog | High | Moderate | Profile mutation and unsaved-state expectations | Defer |
| Edit favorites dialog | High | Low now | Already contains Base UI Checkbox and Field/Input; complex search/reorder/save | Defer |
| Rate place dialog | High | High but risky | Rating EDR/accessibility and mutation behavior | Defer |
| Delete list dialog | Very High | Better fit for Alert Dialog later | Destructive action; not a pilot target | Defer |
| Places subtype bottom sheet | High | Moderate | Essential mobile filter; BottomSheet/Drawer strategy unresolved | Defer |
| Global `ResponsiveDialog` replacement | Very High | High only after all pilots | Broad regression surface | Do not do |

## 6. Why CreateListDialog Is Not Approved Yet

`CreateListDialog` remains the least-bad future pilot candidate because:

- it is route-mounted at `/lists/new`.
- it has existing confirm-close behavior.
- it is smaller than create-place, rating, image upload, favorites, and add-place dialogs.
- it is already covered by current `ResponsiveDialog` contract tests.

It is not approved for implementation yet because:

- it creates persistent data if tested in production.
- production smoke cleanup approval for temporary list creation/deletion has not been documented for this pilot.
- the current mobile behavior is `BottomSheet`; a Base UI Dialog-only pilot may alter mobile behavior.
- a Base UI Drawer strategy has not been approved for mobile parity.
- adding `@base-ui/react/dialog`, `@base-ui/react/drawer`, or `@base-ui/react/alert-dialog` would require dependency policy expansion.

## 7. Required Decision Before Any Dialog Pilot

Before implementation, choose one approved strategy:

### Option A: Base UI Dialog Desktop Only, Keep Custom BottomSheet On Mobile

Description:

- Use Base UI Dialog for desktop modal behavior only.
- Keep the existing custom `BottomSheet` for mobile.

Pros:

- Smaller change.
- Preserves mobile bottom sheet.

Cons:

- Creates a hybrid dialog system.
- Does not prove full Base UI Dialog/Drawer compatibility.
- Requires careful wrapper design to avoid two divergent contracts.

### Option B: Base UI Dialog + Base UI Drawer For Responsive Parity

Description:

- Use Base UI Dialog for desktop.
- Use Base UI Drawer for mobile.

Pros:

- More aligned with the future Base UI direction.
- Better maps to the current `ResponsiveDialog` split.

Cons:

- Higher risk.
- Introduces two new Base UI primitives in the same wave unless explicitly approved.
- Requires mobile Safari, safe-area, bottom-nav, scroll, and gesture verification.

### Option C: Defer Dialog Implementation

Description:

- Keep current custom `ResponsiveDialog`.
- Add only additional screenshots/audit if needed.

Pros:

- Lowest risk.
- Current contract coverage is strong.

Cons:

- Slower Base UI conversion.

Recommended decision:

**Option C for now.**

## 8. Required Acceptance Criteria For A Future Pilot

A future Dialog pilot may proceed only if all are true:

- The target is exactly one dialog surface.
- The target and responsive strategy are explicitly approved.
- Mobile behavior is preserved or intentionally changed with product/design approval.
- No global `ResponsiveDialog` replacement happens.
- No Dialog migration is mixed with Menu, Popover, Select, Combobox, Field, Toast, or Rating changes.
- The dependency policy is updated to allow only the approved new Base UI primitive imports.
- Radix remains absent.
- Arabic copy remains unchanged.
- Route behavior remains unchanged.
- API payloads remain unchanged.
- Unsaved-change confirmation behavior remains unchanged.
- Focus trap and focus restore remain correct.
- Scroll lock and background isolation remain correct.
- Mobile 320x568 and 390x844 screenshots prove no overflow.
- iOS Safari or equivalent visual viewport behavior is verified or explicitly documented.
- Production smoke cleanup is approved if any data mutation is required.

## 9. Required Tests For A Future Pilot

Required E2E:

- Target route/page loads.
- Dialog has Arabic accessible name.
- Initial focus lands on the expected control.
- Tab and Shift+Tab stay trapped.
- Escape behavior matches the current contract.
- Close button behavior matches the current contract.
- Unsaved confirm-close appears where applicable.
- Cancel confirm-close keeps the dialog open.
- Confirm close follows the existing route/close path.
- Portal cleanup works.
- Body scroll lock cleanup works.
- Background isolation cleanup works.
- Mobile 320x568 and 390x844 fit.
- No horizontal overflow.
- No Radix dependency.
- Base UI imports limited to the approved primitive list.

For create-list specifically:

- Empty name validation remains unchanged.
- Visibility selection remains unchanged.
- Submit payload is unchanged.
- Success navigation is unchanged.
- Cancel/close route behavior is unchanged.
- Production smoke creates only temporary smoke-account data, then deletes or documents it according to approval.

## 10. Required Screenshots

Future pilot screenshot directory:

`docs/qa-execution/base-ui-dialog-pilot/screenshots/`

Required screenshots:

- Target dialog open at 320x568.
- Target dialog open at 390x844.
- Target dialog open at tablet/desktop width.
- Initial focused control state.
- Confirm-close notice state if applicable.
- Mobile bottom-sheet or Drawer state if applicable.
- No-horizontal-overflow evidence at 320 and 390.

## 11. Production Smoke Requirements

For a future create-list pilot:

- Use only the approved production smoke account.
- Do not use real user data.
- Create the minimum temporary list only if mutation smoke is explicitly approved.
- Delete the temporary list before final verdict if deletion is supported and safe.
- If cleanup cannot be completed, final verdict must be `NOT RELEASED`.
- Document temporary data and cleanup in `RELEASE_REPORT.md`.

Read-only smoke is not enough if the changed surface is the create-list submit flow.

## 12. Rollback Strategy

For this audit:

- Remove `BASE_UI_DIALOG_PILOT_READINESS_AUDIT.md`.

For a future Dialog pilot:

1. Restore the target dialog to current `ResponsiveDialog`.
2. Remove unused Base UI Dialog/Drawer/Alert Dialog wrappers.
3. Remove new Dialog/Drawer/Alert Dialog imports from `ui-dependency-policy.spec.ts` if no longer used.
4. Keep `@base-ui/react` because released primitives still require it.
5. Re-run frontend and backend gates.

No backend, API, auth, or database rollback should be required if the pilot preserves behavior.

## 13. Final Recommendation

Final recommendation:

**DO NOT IMPLEMENT BASE UI DIALOG YET.**

Implementation safe to start:

**No.**

Recommended next action:

Create a specific product/engineering decision for the responsive Dialog strategy:

1. keep custom BottomSheet and pilot Base UI Dialog desktop-only, or
2. pilot Base UI Dialog plus Base UI Drawer together, or
3. continue keeping `ResponsiveDialog` custom.

Until that decision exists, the current custom `ResponsiveDialog` should remain in place.
