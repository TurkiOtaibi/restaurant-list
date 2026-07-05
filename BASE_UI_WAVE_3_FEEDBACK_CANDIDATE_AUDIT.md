# Base UI Wave 3 Feedback Candidate Audit

## 1. Executive Summary

Wave 3 should not migrate all feedback surfaces to Base UI. The current app has two distinct feedback patterns:

- Inline contextual feedback via `StatusMessage`.
- One toast-like undo feedback surface via `Toast` on list detail.

`StatusMessage` is simple, stable, and semantically explicit. It should remain custom for now. The only plausible Base UI feedback pilot is the existing list-detail `Toast`, but that should happen only after Waves 0-2 are approved, merged, and released.

Recommended Wave 3 decision:

- Audit first.
- Keep `StatusMessage` custom.
- Consider a single Base UI Toast pilot for the list-item undo toast only after earlier waves are complete.

## 2. Current Feedback Stack

Current files:

- `frontend/src/components/ui/StatusMessage.tsx`
- `frontend/src/components/ui/Toast.tsx`
- `frontend/src/lib/ui.ts`

Current shared feedback type:

- `FeedbackTone = "error" | "notice" | "success"`

Current role mapping:

- `error` -> `role="alert"`
- `notice` -> `role="status"`
- `success` -> `role="status"`

Current live-region mapping for `Toast`:

- `error` -> `aria-live="assertive"`
- `notice` / `success` -> `aria-live="polite"`

## 3. Base UI Docs Evidence

Official Base UI docs reviewed:

- Toast: https://base-ui.com/react/components/toast
- Dialog: https://base-ui.com/react/components/dialog

Relevant findings:

- Base UI Toast supports provider/manager patterns, custom data, queues, close/update/promise behavior, and portal/layer concerns.
- Toast can be managed globally via a toast manager.
- Overlay/layering interaction with dialogs is a real concern; Base UI Toast uses portal/layer behavior that must be reviewed against `BASE_UI_LAYERING_POLICY.md`.

Implication:

- Base UI Toast is not a drop-in replacement for inline status messages.
- Migrating `StatusMessage` to Base UI Toast would be the wrong abstraction.
- Base UI Toast may be appropriate only for actual temporary notifications such as the list undo toast.

## 4. Current Usage Inventory

| Surface | File | Component | Behavior | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Profile auth/error/edit/favorites messages | `frontend/src/features/profile/ProfileArchivePage.tsx` | `StatusMessage` | Inline notice/error/success | Medium | Keep custom. |
| Place detail image/wishlist messages | `frontend/src/features/places/PlaceDetailPage.tsx` | `StatusMessage` | Inline success/error/notice | Medium | Keep custom. |
| Place library auth/error/load-more messages | `frontend/src/features/places/PlaceLibraryPage.tsx` | `StatusMessage` | Inline route feedback | Medium | Keep custom. |
| Rate place dialog messages | `frontend/src/features/places/RatePlaceDialog.tsx` | `StatusMessage` | Inline dialog validation/success | High | Keep custom. |
| Save-to-list dialog messages | `frontend/src/features/places/SavePlaceToListDialog.tsx` | `StatusMessage` | Inline dialog mutation feedback | High | Keep custom. |
| Create place dialog messages | `frontend/src/features/places/CreatePlaceDialog.tsx` | `StatusMessage` | Inline dialog mutation feedback | High | Keep custom. |
| Create/edit/delete list dialog messages | `frontend/src/features/lists/*Dialog.tsx` | `StatusMessage` | Inline validation/error | High | Keep custom. |
| Public lists/list detail messages | `frontend/src/features/lists/Public*.tsx` | `StatusMessage` | Inline route feedback | Low-Medium | Keep custom. |
| Login/register messages | `frontend/app/login/page.tsx`, `frontend/app/register/page.tsx` | `StatusMessage` | Inline auth errors | High | Keep custom. |
| List detail undo feedback | `frontend/app/lists/[id]/page.tsx` | `Toast` | Toast with undo action and success/error tone | Medium-High | Only plausible future Base UI Toast pilot. |

## 5. Candidate Comparison

| Candidate | User value | Accessibility value | RTL risk | Layering risk | Product risk | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| Keep `StatusMessage` custom | High | High | Low | None | Low | Recommended. |
| Base UI Toast for list-item undo toast | Medium | Medium | Low-Medium | Medium | Medium-High | Candidate pilot after earlier waves. |
| Global Base UI Toast manager | Medium | Medium | Low-Medium | High | High | Defer. Requires architecture decision. |
| Replace inline `StatusMessage` with Toast | Low | Negative | Medium | High | High | Do not do. |
| Dialog validation messages through Toast | Low | Negative | Medium | High | High | Do not do. |

## 6. Recommended Wave 3 Target

Target:

- List detail undo toast in `frontend/app/lists/[id]/page.tsx`.

Current behavior:

- Renders `Toast` only when an item removal/undo feedback state exists.
- Supports success/error tone.
- Can include an undo action.
- Is tied to list item removal flow.

Recommended implementation shape if approved later:

- Create a small Base UI Toast wrapper.
- Use it exactly once for the list-detail undo toast.
- Do not introduce a global toast manager in the first pilot.
- Do not migrate inline `StatusMessage`.
- Do not change undo timing, action availability, or list-item removal behavior.
- Do not migrate dialog validation messages.

## 7. Acceptance Criteria

Wave 3 implementation must prove:

- Undo toast appears in the same user flow.
- Undo action remains available and works.
- Error tone still announces assertively.
- Success tone still announces politely.
- Existing Arabic copy remains unchanged.
- Toast does not collide with dialogs, menus, or bottom navigation.
- Toast does not create horizontal overflow.
- Keyboard focus behavior is safe.
- No Radix dependency.
- Base UI import policy is intentionally updated for `toast` only if used.
- No inline `StatusMessage` migration happens.

## 8. Required E2E Tests

Add or update focused E2E coverage for:

- Remove list item shows toast.
- Toast has the expected Arabic message.
- Undo action is keyboard reachable.
- Undo restores the item.
- Error state displays when undo fails.
- Toast live-region role/politeness remains correct.
- Toast does not cover bottom navigation at 390x844.
- No Radix dependency.
- Base UI import policy includes only reviewed primitives.

Do not execute destructive production-like actions outside isolated test data.

## 9. Required Screenshots

Save screenshots under:

`docs/qa-execution/base-ui-toast-pilot/screenshots/`

Required:

- list detail with success toast 390x844 after
- list detail with toast action focused 390x844 after
- list detail with error toast 390x844 after
- list detail with toast 320x568 after
- bottom-nav collision check 390x844 after

## 10. RTL / Arabic Checklist

Verify:

- Arabic toast copy remains unchanged.
- Undo action label remains Arabic.
- Toast layout aligns naturally in RTL.
- Action placement is clear in RTL.
- No clipped Arabic glyphs.
- No horizontal overflow.

## 11. Accessibility Checklist

Verify:

- `error` feedback remains assertive.
- `success` feedback remains polite.
- Undo action is reachable by keyboard.
- Toast does not steal focus unexpectedly.
- Toast does not trap focus.
- Toast action accessible name is clear.
- Screen reader announcements do not duplicate inline status messages.

## 12. Layering / Portal Checklist

Because Base UI Toast may introduce portal/layer behavior, verify:

- It follows `BASE_UI_LAYERING_POLICY.md`.
- It does not render beneath dialogs or backdrops when a dialog is open.
- It does not cover fixed bottom navigation.
- It does not conflict with ActionMenu z-index.
- It behaves at 320x568, 390x844, and 430x932.
- iOS Safari visual viewport behavior is checked or documented.

## 13. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Toast changes undo behavior | High | E2E remove/undo parity test. |
| Portal/layer conflict | High | Follow layering policy and screenshot open states. |
| Live-region regression | High | Assert role/live behavior by tone. |
| Global toast manager over-scopes pilot | High | Do not introduce global manager in first pilot. |
| Inline messages are migrated accidentally | High | Restrict PR to list-detail toast only. |
| Mobile bottom-nav collision | Medium | Required 320/390 screenshots. |

## 14. Rollback Strategy

Rollback must be limited:

1. Restore list-detail feedback to the existing custom `Toast`.
2. Remove Base UI Toast wrapper/import if unused.
3. Restore Base UI import policy allow-list if toast is removed.
4. Re-run frontend and backend gates.

No backend, API, database, auth, or product data rollback should be required.

## 15. Production Smoke Requirements

Production smoke should avoid real-user data.

If mutation-capable smoke is approved for the dedicated smoke account:

- Login.
- Open an owned smoke list.
- Remove one smoke-owned list item.
- Verify toast appears.
- Trigger undo.
- Verify item is restored.
- Confirm no cleanup remains.

If no suitable smoke list exists:

- Do not create production data unless explicitly approved.
- Mark production toast mutation smoke as not executed.

## 16. Final Recommendation

Proceed with Wave 3 implementation only after Waves 0, 1, and 2 are approved, merged, and released.

Recommended Wave 3 component:

- Base UI Toast pilot.

Recommended target surface:

- List-detail undo toast only.

Risk level:

- Medium-High.

Implementation safe to start now:

- No.

Implementation safe after Waves 0-2:

- Yes, if limited to the list-detail undo toast and all acceptance criteria above.
