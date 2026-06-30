# iOS Safari Session Persistence Hotfix Report

## 1. Executive Summary

This hotfix hardens client-side authentication restoration for real iPhone Safari lifecycle behavior. The app still keeps access tokens in memory only and keeps refresh tokens in an HttpOnly Secure cookie. The change adds a clearer frontend auth state model, distinguishes invalid refresh tokens from recoverable refresh/network failures, coalesces refresh attempts, and prevents protected UI from showing login-required state while a valid prior session is still being recovered.

Branch: `hotfix/ios-safari-session-persistence`  
Base SHA: `537c1b386c78ebeaed0282025fe4182d20dae0d9`  
Stack confirmed: Next.js / React / TypeScript frontend, FastAPI backend.

## 2. Confirmed Root Cause

The confirmed application root cause is in the frontend auth state machine:

- The app had no explicit distinction between recoverable session restoration failure and authoritative unauthenticated state.
- `performRefresh()` cleared the non-sensitive session marker on every refresh failure, including transient Safari foreground/network/CORS failures.
- API `401` recovery attempted refresh without forcing rotation when an access token was already in memory, so the retry could reuse the expired access token.
- Foreground lifecycle validation was more aggressive than necessary because it could refresh even when an access token already existed.

This combination allowed real iPhone Safari foregrounding to turn a recoverable refresh hiccup into a permanent login-required state.

## 3. Evidence

- Code inspection showed memory-only `accessToken`, HttpOnly refresh cookie, and local marker `restaurantWishlist.hasSession`.
- Existing code cleared tokens in `performRefresh()` catch for all errors.
- New focused E2E reproduced:
  - missing in-memory token + marker + refresh success restores session;
  - API `401` forces refresh and retries original request;
  - invalid refresh clears marker and shows login-required;
  - recoverable refresh failure keeps marker and avoids login-required;
  - pageshow/focus/visibilitychange refresh triggers are coalesced.
- Production header checks showed current live app shell is `no-store`, no service worker registration exists in repo, and hashed Next assets include the current session marker/pageshow code.
- Production cookie check on `https://restaurant-list-web.onrender.com` showed `restaurant_refresh_token` with `HttpOnly; Secure; SameSite=none; Path=/api/v1/auth; Max-Age=2592000`.

## 4. Files Inspected

- `frontend/src/lib/api.ts`
- `frontend/src/lib/env.ts`
- `frontend/app/lists/page.tsx`
- `frontend/app/lists/[id]/page.tsx`
- `frontend/app/lists/new/page.tsx`
- `frontend/app/places/new/page.tsx`
- `frontend/app/places/[id]/rate/page.tsx`
- `frontend/src/features/places/PlaceLibraryPage.tsx`
- `frontend/src/features/places/PlaceDetailPage.tsx`
- `frontend/src/features/places/RatePlaceDialog.tsx`
- `frontend/src/features/lists/PublicListsPage.tsx`
- `frontend/src/features/lists/PublicListDetailPage.tsx`
- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `frontend/next.config.ts`
- `frontend/app/manifest.ts`
- `backend/app/modules/auth/services.py`
- `backend/app/api/auth.py`
- `backend/app/core/config.py`
- `backend/app/main.py`
- `render.yaml`

## 5. Files Changed

- `frontend/src/lib/api.ts`
- `frontend/app/lists/page.tsx`
- `frontend/app/lists/[id]/page.tsx`
- `frontend/app/lists/new/page.tsx`
- `frontend/app/places/new/page.tsx`
- `frontend/app/places/[id]/rate/page.tsx`
- `frontend/src/features/places/PlaceLibraryPage.tsx`
- `frontend/src/features/places/PlaceDetailPage.tsx`
- `frontend/src/features/places/RatePlaceDialog.tsx`
- `frontend/src/features/lists/PublicListsPage.tsx`
- `frontend/src/features/lists/PublicListDetailPage.tsx`
- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `frontend/tests/e2e/ios-safari-session-restoration.spec.ts`
- `frontend/tests/e2e/support/places-acceptance-harness.ts`
- `frontend/tests/e2e/responsive-layout.spec.ts`
- `IOS_SAFARI_SESSION_HOTFIX_REPORT.md`

## 6. Why Previous Automation Passed But Real Safari Failed

Previous browser automation verified a cookie-based restoration path in Chromium, but it did not fully reproduce real iPhone Safari foreground/background lifecycle behavior. Safari can suspend or discard page JS state and then fire lifecycle events around user interaction. The earlier implementation could clear the local marker on any refresh failure during this foreground window. Chromium automation did not expose that transient failure path.

The test harness also directly installed refresh cookies without setting the non-sensitive session marker that normal login creates. The harness has been aligned with real login state by setting only `restaurantWishlist.hasSession = "1"`; no token is stored.

## 7. Security Impact

- No access token is stored in `localStorage` or `sessionStorage`.
- No refresh token is stored in `localStorage` or `sessionStorage`.
- Refresh token remains HttpOnly Secure cookie based.
- Refresh token rotation remains enabled.
- Invalid/expired refresh token still clears marker and leads to login-required state.
- Recoverable network/CORS/server availability failures no longer erase session state prematurely.
- API `401` now forces refresh before retrying the original request.

## 8. Cookie/Header Findings

Production cookie behavior verified on the known live origin:

- Cookie name: `restaurant_refresh_token`
- `HttpOnly`: present
- `Secure`: present
- `SameSite`: `none`
- `Path`: `/api/v1/auth`
- `Max-Age`: `2592000` seconds
- Cross-origin frontend/API setup requires `SameSite=None; Secure`, which is configured.

Production CORS findings:

- `Origin: https://restaurant-list-web.onrender.com` is allowed.
- `Origin: https://nt-list-web.onrender.com` was not allowed in the API probe, and `https://nt-list-web.onrender.com/` returned `404 Not Found` during this investigation.
- If real users are truly using `nt-list-web.onrender.com`, Render routing/CORS configuration must be corrected. This is an environment configuration issue, not an application-code token storage issue.

Backend production logs were not available from this environment, so refresh endpoint call status around the reported real-device failure could not be inspected.

## 9. Service Worker/Cache Findings

- No service worker registration was found in frontend code.
- The production app shell response uses `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.
- Next.js hashed static assets use `public, max-age=31536000, immutable`, which is expected for content-hashed assets.
- Live production JavaScript contained the recent `restaurantWishlist.hasSession` and `pageshow` code, so stale frontend code is not the leading root cause.

## 10. Tests Added/Updated

Added `frontend/tests/e2e/ios-safari-session-restoration.spec.ts` covering:

- missing in-memory access token + prior marker + refresh success;
- protected UI does not show login-required while restoring;
- pageshow/focus/visibilitychange refresh coalescing;
- API `401` forces refresh and retries original request;
- invalid refresh clears marker and shows login-required safely;
- recoverable refresh failure keeps marker and avoids login-required.

Updated QA harnesses:

- `frontend/tests/e2e/support/places-acceptance-harness.ts`
- `frontend/tests/e2e/responsive-layout.spec.ts`

These now set the same non-sensitive session marker that real login sets when a valid refresh session is installed/mocked.

## 11. Quality Gate Results

Backend:

- `python -m pytest -q`: PASS, `53 passed, 1 skipped`
- `python -m ruff check .`: PASS
- `python -m ruff format --check .`: PASS
- `python -m mypy app tests`: PASS

Frontend:

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, `39 passed`

Focused:

- `npm run test:e2e -- tests/e2e/ios-safari-session-restoration.spec.ts`: PASS, `5 passed`
- `npm run test:e2e -- tests/e2e/auth-gating.spec.ts tests/e2e/ios-safari-session-restoration.spec.ts`: PASS, `8 passed`
- Previously failing harness groups: PASS, `17 passed`

## 12. Real-Device Verification Status

Real iPhone Safari 2+ minute background/return verification: **NOT VERIFIED ON REAL DEVICE**.

This hotfix includes deterministic automated coverage for the session restoration state machine, but the reported production bug must still be verified manually on a real iPhone Safari after deployment.

## 13. Remaining Risks

- If users are actually visiting `nt-list-web.onrender.com`, production routing/CORS configuration appears incorrect from this environment and must be fixed in Render/env configuration.
- Real iPhone Safari manual verification remains required before claiming complete real-device closure.
- Backend logs were unavailable, so production refresh call telemetry around the original failure could not be confirmed.

## Area Findings

| Area | Finding | Evidence | Fix | Risk |
| --- | --- | --- | --- | --- |
| Auth state machine | Recoverable refresh errors were treated like invalid sessions | `performRefresh()` cleared tokens on all caught errors | Added `SessionRecoveryError`; clear marker only on refresh `401` | Low |
| API 401 retry | Existing access token prevented forced refresh after API `401` | Focused test initially retried with old token | `apiRequest()` now calls `refreshAccessToken(true)` after `401` | Low |
| Safari lifecycle | Foreground recovery was more aggressive than needed | Listener refreshed even with access token | Foreground listener now skips when access token exists and uses shared promise | Low |
| Protected UI | Pages could show login-required after recoverable restoration failure | Pages mapped any missing token path to `needsAuth` | Protected pages handle `SessionRecoveryError` as retryable error, not login-required | Medium |
| Test harness | Harness installed cookie without session marker | Full E2E failures after marker became authoritative | Harnesses set non-sensitive marker when installing/mock-authing session | Low |
| Cookie attributes | Refresh cookie attributes are correct on known live origin | Production `Set-Cookie` header | No code change | Low |
| CORS/routing | `nt-list-web.onrender.com` probe returned 404 and was not allowed by API CORS | `curl`/preflight probes | Documented environment risk; no code-side token workaround | Medium |
| Cache/SW | Stale service worker not found | No SW registration; app shell no-store; current JS present | No service worker change | Low |
