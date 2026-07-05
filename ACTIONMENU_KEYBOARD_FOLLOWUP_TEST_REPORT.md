# ActionMenu Keyboard Follow-Up Test Report

## Purpose

Add focused E2E coverage for the non-blocking ActionMenu follow-ups from PR #26:

- multi-item ArrowUp / ArrowDown wrapping
- Tab close behavior

This is a tests-only follow-up. No production behavior, UI design, backend, API, auth, database, Base UI Menu, or Radix changes were made.

## Contract Interpretation

`ACTIONMENU_ACCESSIBILITY_CONTRACT.md` clearly requires both behaviors:

- Arrow wrapping: `ArrowDown` from an item moves to the next item, wrapping at the end; `ArrowUp` from an item moves to the previous item, wrapping at the start.
- Tab close: `Tab` closes the menu without forcing focus back to the trigger so normal tab navigation can continue.

Because both behaviors are explicit in the contract, both are now covered by E2E tests.

## Surfaces Tested

Representative surface:

- `/profile` header ActionMenu

Reason:

- It is a real production ActionMenu surface.
- It has multiple items: `تعديل الملف الشخصي` and `تسجيل الخروج`.
- It allows keyboard behavior to be verified without selecting either item.
- No destructive action is executed.

## Tests Added

Updated `frontend/tests/e2e/profile-phase-1.spec.ts` with:

- `profile ActionMenu wraps keyboard focus across multiple items`
- `profile ActionMenu closes on Tab without executing an action`

## Behavior Verified

Arrow wrapping test verifies:

- menu opens from keyboard
- first item receives focus
- `ArrowUp` from the first item wraps focus to the last item
- `ArrowDown` from the last item wraps focus back to the first item
- menu remains open during arrow navigation
- Escape closes and restores focus to the trigger
- no menu action is executed

Tab behavior test verifies:

- menu opens from keyboard
- item receives focus
- `Tab` closes the menu
- no dialog opens
- the page remains on `/profile`
- no action is executed

## Tab Behavior Decision

Tab behavior was tested because the ActionMenu contract explicitly requires it.

The test intentionally avoids asserting the exact next focused element after Tab because the contract states that the menu should close without forcing focus back to the trigger so normal tab navigation can continue. The stable behavior under contract is menu closure and no action execution.

## Files Changed

- `frontend/tests/e2e/profile-phase-1.spec.ts`
- `ACTIONMENU_KEYBOARD_FOLLOWUP_TEST_REPORT.md`

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 58 passed
- `python -m ruff format --check .`: PASS, 79 files already formatted
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS, no issues in 66 source files
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

Focused pre-check:

- `npm exec -- playwright test tests/e2e/profile-phase-1.spec.ts -g "profile ActionMenu"`: PASS, 2 passed

## Radix Dependency Added

No.

## Base UI Menu Used

No.

## Remaining Risks

- The tests intentionally do not select `تسجيل الخروج` or `تعديل الملف الشخصي`; they verify keyboard behavior without executing actions.
- Exact post-Tab focus target remains browser/tab-order dependent and is not asserted beyond the contract-required menu closure and no action execution.

## Recommendation

After this tests-only follow-up is reviewed and released, the Base UI Menu audit can resume with better protection around the existing custom ActionMenu behavior. A Base UI Menu migration should still be a separate, isolated PR and should not start with destructive or high-risk surfaces.
