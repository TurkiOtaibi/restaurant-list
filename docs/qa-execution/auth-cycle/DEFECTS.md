# Authentication QA Defects

Branch: `feature/sprint-1-user-facing-completion`  
SHA: `4b99b43d9a58082c8f0c47ecadd30bef2ee22fdc`

## AUTH-QA-DEF-001: Auth API error responses violate EDR-001 standardized error envelope

- Severity: Critical
- Owner: Developer
- Affected test cases: AUTH-002-US-005-TC-001, AUTH-002-US-007-TC-001, AUTH-002-US-009-TC-001, AUTH-002-US-011-TC-001, AUTH-002-US-012-TC-001, AUTH-002-US-013-TC-001, AUTH-002-US-014-TC-001, AUTH-002-US-015-TC-001, AUTH-002-US-017-TC-001, AUTH-002-US-021-TC-001, AUTH-003-US-007-TC-001, AUTH-003-US-009-TC-001, AUTH-003-US-010-TC-001, AUTH-003-US-011-TC-001, AUTH-003-US-013-TC-001, AUTH-003-US-018-TC-001, AUTH-004-US-008-TC-001, AUTH-004-US-009-TC-001, AUTH-004-US-010-TC-001, AUTH-004-US-011-TC-001, AUTH-004-US-011-TC-002, AUTH-004-US-011-TC-003, AUTH-004-US-011-TC-004, AUTH-004-US-012-TC-001, AUTH-004-US-014-TC-001, AUTH-004-US-016-TC-001, AUTH-004-US-019-TC-001, AUTH-004-US-023-TC-001, AUTH-004-US-024-TC-001, AUTH-006-US-001-TC-001, AUTH-006-US-002-TC-001, AUTH-006-US-003-TC-001, AUTH-006-US-004-TC-001, AUTH-006-US-005-TC-001, AUTH-006-US-005-TC-002, AUTH-006-US-006-TC-001, AUTH-006-US-006-TC-002, AUTH-006-US-007-TC-001, AUTH-006-US-007-TC-002, AUTH-006-US-007-TC-003, AUTH-006-US-007-TC-004, AUTH-006-US-007-TC-005, AUTH-006-US-013-TC-001, AUTH-006-US-013-TC-002, AUTH-006-US-013-TC-003, AUTH-007-US-001-TC-001, AUTH-007-US-002-TC-001, AUTH-007-US-003-TC-001, AUTH-007-US-004-TC-001, AUTH-007-US-005-TC-001, AUTH-007-US-005-TC-002, AUTH-007-US-007-TC-001, AUTH-007-US-011-TC-001, AUTH-007-US-011-TC-002, AUTH-008-US-002-TC-001, AUTH-008-US-002-TC-002, AUTH-008-US-002-TC-003, AUTH-008-US-002-TC-004, AUTH-008-US-003-TC-001, AUTH-008-US-003-TC-002, AUTH-008-US-003-TC-003, AUTH-008-US-003-TC-004
- Expected: Error responses use { error: { code, message, requestId, details? } }; automation branches on error.code.
- Actual: Observed Auth API errors return { detail: { code, message, ... } }; requestId is present only as X-Request-ID response header, not error.requestId.
- Evidence: Inline ASGI execution on synchronized branch: invalid login email -> 422 {"detail":{"code":"VALIDATION_ERROR"...}}; wrong password -> 401 {"detail":{"code":"INVALID_CREDENTIALS"...}}; rate limit -> 429 {"detail":{"code":"RATE_LIMITED"...}}.
- Suspected component: backend/app/main.py HTTPException and RequestValidationError handlers; backend/app/core/errors.py.
- Suspected root cause: Backend exception handlers still emit FastAPI-style detail envelope instead of approved EDR-001 error envelope.
- Recommended fix: Update API error handlers and auth/service errors to emit error.code, error.message, error.requestId, optional error.details; keep forbidden fields excluded.

## AUTH-QA-DEF-002: Successful registration/login navigate to /lists instead of documented /places default

- Severity: High
- Owner: Developer
- Affected test cases: AUTH-002-US-004-TC-001, AUTH-003-US-006-TC-001
- Expected: AUTH-002 and AUTH-003 require successful direct auth flows to navigate to /places unless a safe return origin exists.
- Actual: Observed mocked successful register and login both ended at /lists.
- Evidence: Playwright against synchronized production build at http://127.0.0.1:3110 with successful auth response: register path=/lists; login path=/lists. Source also hard-codes router.push("/lists") in frontend/app/register/page.tsx and frontend/app/login/page.tsx.
- Suspected component: frontend/app/register/page.tsx; frontend/app/login/page.tsx.
- Suspected root cause: Frontend hard-codes /lists as post-auth destination, while approved Auth contract names /places.
- Recommended fix: Change direct successful login/register destination to /places or update approved requirements if /lists is intended.

## AUTH-QA-DEF-003: Safe return-origin preservation is not implemented for guest-denied auth flow

- Severity: High
- Owner: Developer
- Affected test cases: AUTH-003-US-005-TC-001, AUTH-006-US-009-TC-001, AUTH-006-US-009-TC-002, AUTH-006-US-009-TC-003, AUTH-006-US-009-TC-004, AUTH-006-US-010-TC-001, AUTH-006-US-010-TC-002, AUTH-006-US-011-TC-001
- Expected: Guest protected-route attempts preserve same-origin destination/action and post-auth returns to that origin.
- Actual: Guest-denied screens render a /login link without observable return context; /places/:id/rate redirects to /login without return parameter/state; login handler ignores return origins.
- Evidence: Playwright denied-route probe on synchronized branch: /lists, /places, /profile, /lists/public, /places/place-001, /lists/public/public-list-001 showed loginLinks=1 and hasReturnSignal=false; /places/place-001/rate ended at /login with hasReturnSignal=false.
- Suspected component: protected route UI prompts; frontend/app/login/page.tsx; frontend/src/lib/api.ts auth flow.
- Suspected root cause: No return-origin storage/sanitization/consumption mechanism exists in the current frontend.
- Recommended fix: Implement safe same-origin return context capture on protected denial, consume after auth, clear after use, and reject external/unsafe schemes.

## AUTH-QA-DEF-004: Logout UI navigates to /login instead of documented root /

- Severity: High
- Owner: Developer
- Affected test cases: AUTH-005-US-008-TC-001, AUTH-005-US-008-TC-002, AUTH-005-RESP-001, AUTH-005-RESP-002
- Expected: AUTH-005 requires logout completion or local fallback to navigate to /.
- Actual: Profile logout handler calls logout() and then router.push("/login").
- Evidence: Source inspection on synchronized branch: frontend/src/features/profile/ProfileArchivePage.tsx handleLogout awaits logout(); router.push("/login").
- Suspected component: frontend/src/features/profile/ProfileArchivePage.tsx.
- Suspected root cause: Frontend logout destination is hard-coded to /login rather than approved root route.
- Recommended fix: Navigate to / after logout success and local fallback, unless requirements are formally changed.

## AUTH-QA-DEF-005: Logout failure path clears local state but does not report unconfirmed server revocation

- Severity: Medium
- Owner: Developer
- Affected test cases: AUTH-005-US-007-TC-001, AUTH-005-US-007-TC-002
- Expected: AUTH-005 network/5xx logout failures clear local state and report that server revocation may not be confirmed.
- Actual: logout() swallows network/HTTP errors and ProfileArchivePage immediately routes away without user-visible unconfirmed revocation notice.
- Evidence: frontend/src/lib/api.ts logout() catches all errors and clears tokens; frontend/src/features/profile/ProfileArchivePage.tsx does not render an unconfirmed revocation message.
- Suspected component: frontend/src/lib/api.ts; frontend/src/features/profile/ProfileArchivePage.tsx.
- Suspected root cause: Logout API failure is intentionally ignored by client helper, but UI has no state/message channel for unconfirmed revocation.
- Recommended fix: Return logout outcome from api helper or expose UI state so network/5xx fallback can present documented notice while clearing local state.

## AUTH-QA-DEF-006: Structured auth log evidence required by EDR-004 is not implemented/available

- Severity: High
- Owner: Developer
- Affected test cases: AUTH-001-US-006-TC-002, AUTH-002-US-018-TC-001, AUTH-003-US-018-TC-001, AUTH-005-US-013-TC-001, AUTH-005-US-013-TC-002
- Expected: Auth log/security tests can verify JSON logs with timestamp, level, requestId, userId, path, method, status, durationMs, and errorCode without token leakage.
- Actual: No structured logging middleware/sink was found for Auth request evidence; no deterministic log export exists for correlation IDs.
- Evidence: Code inspection found operational headers but no structured JSON request logging implementation. Log-specific Auth tests could not collect required correlation-ID evidence.
- Suspected component: backend app middleware / logging infrastructure.
- Suspected root cause: EDR-004 structured logging policy has not been implemented for request lifecycle logging.
- Recommended fix: Add structured JSON request/error logging with required EDR-004 fields and redaction, then expose deterministic test log capture.

## AUTH-QA-DEF-008: Focus/visibility stale-session recovery hooks are not implemented

- Severity: Medium
- Owner: Developer
- Affected test cases: AUTH-004-US-018-TC-002, AUTH-005-US-010-TC-002, AUTH-005-US-010-TC-003
- Expected: When BroadcastChannel is unavailable, stale tabs recover on focus/visibility change where documented.
- Actual: Auth client has BroadcastChannel and Web Locks logic, but no focus or visibilitychange event recovery path was found.
- Evidence: rg over frontend auth code found no visibilitychange/focus auth recovery listener; api.ts only retries on protected request/refresh flow.
- Suspected component: frontend/src/lib/api.ts and app auth session lifecycle.
- Suspected root cause: Fallback recovery only occurs during API calls, not focus/visibility events.
- Recommended fix: Add documented focus/visibility recovery or reclassify those cases if product no longer requires them.

