# Mobile Lists / Session Bugfix Report

## Summary

Branch: `fix/mobile-lists-ui-session-bugs`

Base SHA: `96c9836a946e9c27ce1ebb99556c5adf05cbfb43`

This bugfix addresses mobile Lists UI polish, list-detail row behavior, create-list validation timing, bottom navigation spacing, RTL row alignment, and Safari/session restore behavior.

No merge or deployment was performed.

## Bugs Fixed

- Mobile Lists header and subtitle spacing now use the shared 4/8px spacing scale.
- Bottom navigation height and bottom safe-area spacing were reduced and anchored to the viewport/safe area.
- Place/list rows now group title and metadata together with the type icon aligned as a consistent trailing badge.
- List-detail row focus/selected surface now covers the full row content instead of appearing as a detached overlay.
- The single-list promotional card was removed from `/lists`; the page now prioritizes user content plus a quiet public-lists link.
- Public-lists arrow direction now matches RTL forward direction.
- Create-list validation now appears only after pressing `حفظ`; the required-name message is exactly `اسم القائمة مطلوب`.
- Row delete/remove is now behind the row overflow menu instead of exposed inline.
- Session restoration now supports refresh-cookie-only recovery while avoiding unauthenticated refresh spam.

## Files Changed

- `frontend/app/globals.css`
  - Added spacing tokens.
  - Adjusted mobile header spacing, bottom navigation height, safe-area padding, row layout, type icon sizing, and focus/row surfaces.
- `frontend/app/lists/page.tsx`
  - Removed single-list promo card.
  - Corrected RTL public-lists arrow.
- `frontend/app/lists/[id]/page.tsx`
  - Moved row remove action behind `ActionMenu`.
- `frontend/src/components/ui/PlaceCard.tsx`
  - Reordered row content so text/meta are grouped and icon trails the row.
- `frontend/src/features/lists/CreateListDialog.tsx`
  - Changed validation timing and required-name copy.
- `frontend/src/lib/api.ts`
  - Added session marker gating for proactive refresh.
  - Restores session from refresh cookie on load/focus/page show only when a prior session is known, preventing refresh endpoint rate-limit exhaustion.
- `frontend/tests/e2e/sprint3-real.spec.ts`
  - Updated the list remove E2E flow to open the row overflow menu and choose `إزالة`.

## E2E Alignment Summary

The failing E2E test originally asserted an inline remove button named `إزالة <placeName>`.

That expectation was outdated because the intended product behavior moved destructive row removal behind the overflow menu.

Updated flow:

1. Open row overflow: `إجراءات <placeName>`
2. Select menu item: `إزالة`
3. Assert the list item is removed and the empty-list state appears.

This preserves the original test intent: the user can remove an item from a list.

## E2E Remaining Failure Resolution

After aligning the overflow-menu delete flow, the full E2E run failed later on `/profile` because the profile page showed the unauthenticated prompt instead of the user profile.

Classification: product/session implementation defect in the first pass, exposed only during the full E2E run.

Root cause:

The proactive session restore listener attempted `/auth/refresh` on page load even when no authenticated session was known. Across the full E2E suite, unauthenticated pages could consume the auth refresh rate limit. A later authenticated flow then lost session continuity when refresh was rate-limited.

Fix:

`frontend/src/lib/api.ts` now stores a non-sensitive local session marker when an access token is issued and clears it on logout/token clear. Proactive refresh only runs without an in-memory access token when that marker exists.

Why this is correct:

- No access token or refresh token is stored in web storage.
- The HttpOnly refresh cookie remains the authority for session restoration.
- Unauthenticated users no longer spam `/auth/refresh`.
- Users with a prior session can still restore after reload/tab discard.
- API calls still perform refresh-on-401 when needed.

## Screenshots / Evidence

- `docs/qa-execution/fix-pass-list-screens/screenshots/before-lists-mobile.png`
- `docs/qa-execution/fix-pass-list-screens/screenshots/before-list-detail-mobile.png`
- `docs/qa-execution/fix-pass-list-screens/screenshots/before-create-list-sheet-mobile.png`
- `docs/qa-execution/fix-pass-list-screens/screenshots/after-lists-mobile.png`
- `docs/qa-execution/fix-pass-list-screens/screenshots/after-list-detail-mobile.png`
- `docs/qa-execution/fix-pass-list-screens/screenshots/after-create-list-sheet-mobile.png`

## Quality Gate Results

Backend:

- `python -m pytest -q`: PASS, `53 passed, 1 skipped`
- `python -m ruff check .`: PASS
- `python -m ruff format --check .`: PASS
- `python -m mypy app tests`: PASS

Frontend:

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, `34 passed`

Focused checks:

- Overflow-menu delete E2E flow: PASS
- Refresh-cookie-only session restoration: PASS locally through `/lists`
- `/lists` has no `قائمة واحدة فقط` promo card: PASS
- Create-list error appears only after pressing `حفظ`: PASS
- Create-list error message is exactly `اسم القائمة مطلوب`: PASS
- List-detail delete is behind overflow: PASS
- No horizontal overflow on mobile `/lists` and list detail: PASS
- Bottom nav is fixed and remains within the mobile viewport: PASS

## BUG-13 Verification Status

Locally verified:

- Session restoration from an HttpOnly refresh cookie with no in-memory access token works on app routes.
- Full E2E no longer loses auth during the list/profile flow.

Not verified:

- Real iPhone Safari 2+ minute background/return was not tested in this environment.

## Remaining Risks

- Real-device iOS Safari backgrounding behavior still requires manual validation on an actual iPhone.
- The session marker is intentionally non-sensitive, but privacy/security review should confirm this is acceptable as a UX/session hint.
