# AUTH-007 Test Cases

Feature: `AUTH-007 - Rate-limit auth endpoints`

## Sources

- `docs/user-stories/AUTH_USER_STORIES.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## Documented Contract

- Authentication endpoints are rate-limited.
- Covered endpoints are registration, login, refresh, and logout.
- Requests above the configured threshold for a client/path within the configured window return `429` with code `RATE_LIMITED`.
- Default threshold is `10` auth requests per `60` seconds per client/path.
- `AUTH_RATE_LIMIT_REQUESTS` and `AUTH_RATE_LIMIT_WINDOW_SECONDS` override threshold/window when configured.
- When the configured window expires, normal auth requests can proceed past the rate-limit gate if otherwise valid.
- When `REDIS_URL` is configured in production, counters use Redis with keying by client/path.
- When Redis is not configured, memory fallback enforces limits for the running process.
- When Redis is configured but temporarily unavailable, rate limiting falls back to the process-local memory limiter; normal credential/session validation still runs; operational logs exclude credentials, tokens, passwords, cookies, and request bodies; client response excludes stack trace or internal Redis detail.
- Safe rate-limit errors are structured, include code `RATE_LIMITED`, and do not reveal thresholds beyond user-safe recovery guidance unless intentionally exposed.
- Normal auth usage within threshold is not blocked by rate limiting.

## Shared Deterministic Fixtures

| Fixture ID | Purpose | Exact State |
|---|---|---|
| FX-AUTH-007-DEFAULT-LOGIN | Default login limiter | `AUTH_RATE_LIMIT_REQUESTS=10`; `AUTH_RATE_LIMIT_WINDOW_SECONDS=60`; client `client-login-001`; path `POST /api/v1/auth/login`; request timestamps `T+00s` through `T+10s`; payload contains `email=login-limit@example.com`, password canary `PASSWORD-CANARY-AUTH-007`. |
| FX-AUTH-007-DEFAULT-REGISTER | Default registration limiter | Default threshold/window; client `client-register-001`; path `POST /api/v1/auth/register`; request timestamps `T+00s` through `T+10s`; payload contains `email=register-limit@example.com`, password canary `PASSWORD-CANARY-AUTH-007`, display name `Rate Limit User`. |
| FX-AUTH-007-DEFAULT-REFRESH | Default refresh limiter | Default threshold/window; client `client-refresh-001`; path `POST /api/v1/auth/refresh`; request timestamps `T+00s` through `T+10s`; cookie/token canary `REFRESH-CANARY-AUTH-007` is present only in controlled test artifact. |
| FX-AUTH-007-DEFAULT-LOGOUT | Default logout limiter | Default threshold/window; client `client-logout-001`; path `POST /api/v1/auth/logout`; request timestamps `T+00s` through `T+10s`; local access token canary `ACCESS-CANARY-AUTH-007` exists before user chooses logout. |
| FX-AUTH-007-OVERRIDE-REQUESTS | Threshold override | `AUTH_RATE_LIMIT_REQUESTS=3`; `AUTH_RATE_LIMIT_WINDOW_SECONDS=60`; client `client-override-requests-001`; path `POST /api/v1/auth/login`; request timestamps `T+00s` through `T+03s`. |
| FX-AUTH-007-OVERRIDE-WINDOW | Window override | `AUTH_RATE_LIMIT_REQUESTS=10`; `AUTH_RATE_LIMIT_WINDOW_SECONDS=30`; client `client-override-window-001`; path `POST /api/v1/auth/login`; request timestamps include `T+00s` through `T+10s`, then `T+31s`. |
| FX-AUTH-007-KEY-SAME | Same client and same path | Default threshold/window; client `client-key-001`; path `POST /api/v1/auth/login`; 11 requests at `T+00s` through `T+10s`. |
| FX-AUTH-007-KEY-DIFF-PATH | Same client and different paths | Default threshold/window; client `client-key-002`; 10 requests to `POST /api/v1/auth/login`, then 1 request to `POST /api/v1/auth/register`, all within 60 seconds. |
| FX-AUTH-007-KEY-DIFF-CLIENT | Different clients and same path | Default threshold/window; client `client-key-003-a` sends 10 requests to `POST /api/v1/auth/login`; client `client-key-003-b` sends 1 request to same path within same 60-second window. |
| FX-AUTH-007-REDIS-PROD | Redis production limiter | Environment `production`; `REDIS_URL` configured; API instance A and B share Redis counter store; client `client-redis-001`; path `POST /api/v1/auth/login`; requests 1-6 go to instance A and requests 7-11 go to instance B within 60 seconds. |
| FX-AUTH-007-MEMORY | Redis absent memory fallback | `REDIS_URL` absent; single running process; client `client-memory-001`; path `POST /api/v1/auth/login`; 11 requests within 60 seconds. |
| FX-AUTH-007-REDIS-FAIL | Redis temporarily unavailable | `REDIS_URL` configured; Redis operation fails before counter operation; process-local memory limiter available; client `client-redis-fail-001`; path `POST /api/v1/auth/login`; payload contains password canary `PASSWORD-CANARY-AUTH-007`. |
| FX-AUTH-007-SAFE-ERROR | Rate-limited error surface | Any endpoint over threshold; response artifact, client logs, server logs, URL, and rendered error UI are captured; canaries are `PASSWORD-CANARY-AUTH-007`, `TOKEN-CANARY-AUTH-007`, `COOKIE-CANARY-AUTH-007`, and `REQUEST-BODY-CANARY-AUTH-007`. |
| FX-AUTH-007-RESPONSIVE | Rate-limit error UI | Login active screen displays rate-limit error state after `429 RATE_LIMITED`; no credentials/tokens/cookies are rendered. |

## Shared Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-AUTH-007-429 | Response status is `429`; response body is structured; response body includes field `code` with value `RATE_LIMITED`. |
| ASSERT-AUTH-007-FORBIDDEN | Response body, response headers visible to JavaScript, URL, DOM, accessibility tree, client logs, server logs, and error payloads do not contain credentials, passwords, tokens, cookies, raw request body, Redis connection details, stack traces, limiter storage internals, internal identifiers, or sensitive metadata. |
| ASSERT-AUTH-007-NOT-RATE-LIMITED | Response for the request under inspection is not `429` and does not include code `RATE_LIMITED`; no endpoint business success, credential validity, session creation, or authorization result is asserted. |
| ASSERT-AUTH-007-LOCAL-LOGOUT | For logout when user chooses logout, local access token canary `ACCESS-CANARY-AUTH-007` is cleared from local auth state and absent from URL, storage, DOM, accessibility tree, logs, and error payloads. |
| ASSERT-AUTH-007-RESPONSIVE | Rate-limit error text and any recovery/action control remain visible/reachable; `document.documentElement.scrollWidth <= window.innerWidth`; no global overflow masking is required; any visible action target is at least `44x44` CSS pixels. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| AUTH-007-US-001-TC-001 | Login endpoint blocks request 11 for same client/path | API, Security, Negative | Critical | FX-AUTH-007-DEFAULT-LOGIN is loaded. | Requests 1-11: `POST /api/v1/auth/login`; client `client-login-001`; timestamps `T+00s` to `T+10s`; same path. | 1. Send requests 1-10. 2. Send request 11. 3. Inspect request 11 response and captured artifacts. | Request 11 satisfies ASSERT-AUTH-007-429 and ASSERT-AUTH-007-FORBIDDEN. | AUTH-007-US-001 | Yes | API |
| AUTH-007-US-001-TC-002 | Login requests 1-10 are not blocked by rate limit | API, Positive | Critical | FX-AUTH-007-DEFAULT-LOGIN is loaded. | Requests 1-10: same client/path within 60 seconds. | 1. Send requests 1-10. 2. Inspect each response. | Each of requests 1-10 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED. | AUTH-007-US-001; AUTH-007-US-005; AUTH-007-US-012 | Yes | API |
| AUTH-007-US-002-TC-001 | Registration endpoint blocks request 11 for same client/path | API, Security, Negative | High | FX-AUTH-007-DEFAULT-REGISTER is loaded. | Requests 1-11: `POST /api/v1/auth/register`; client `client-register-001`; timestamps `T+00s` to `T+10s`; same path. | 1. Send requests 1-10. 2. Send request 11. 3. Inspect request 11 response and captured artifacts. | Request 11 satisfies ASSERT-AUTH-007-429 and ASSERT-AUTH-007-FORBIDDEN; no registration business success is asserted. | AUTH-007-US-002 | Yes | API |
| AUTH-007-US-002-TC-002 | Registration requests 1-10 are not blocked by rate limit | API, Positive | High | FX-AUTH-007-DEFAULT-REGISTER is loaded. | Requests 1-10: same client/path within 60 seconds. | 1. Send requests 1-10. 2. Inspect each response. | Each of requests 1-10 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED. | AUTH-007-US-002; AUTH-007-US-005; AUTH-007-US-012 | Yes | API |
| AUTH-007-US-003-TC-001 | Refresh endpoint blocks request 11 for same client/path | API, Security, Negative | High | FX-AUTH-007-DEFAULT-REFRESH is loaded. | Requests 1-11: `POST /api/v1/auth/refresh`; client `client-refresh-001`; timestamps `T+00s` to `T+10s`; same path. | 1. Send requests 1-10. 2. Send request 11. 3. Inspect request 11 response and captured artifacts. | Request 11 satisfies ASSERT-AUTH-007-429 and ASSERT-AUTH-007-FORBIDDEN; `REFRESH-CANARY-AUTH-007` is absent from response, logs, URL, DOM, and errors. | AUTH-007-US-003 | Yes | API |
| AUTH-007-US-003-TC-002 | Refresh requests 1-10 are not blocked by rate limit | API, Positive | High | FX-AUTH-007-DEFAULT-REFRESH is loaded. | Requests 1-10: same client/path within 60 seconds. | 1. Send requests 1-10. 2. Inspect each response. | Each of requests 1-10 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED. | AUTH-007-US-003; AUTH-007-US-005; AUTH-007-US-012 | Yes | API |
| AUTH-007-US-004-TC-001 | Logout endpoint blocks request 11 and local state still clears | API, UI, Security, Negative | Medium | FX-AUTH-007-DEFAULT-LOGOUT is loaded. | Requests 1-11: `POST /api/v1/auth/logout`; client `client-logout-001`; timestamps `T+00s` to `T+10s`; same path; user chooses logout. | 1. Send requests 1-10. 2. User chooses logout for request 11. 3. Inspect request 11 response and local auth state. | Request 11 satisfies ASSERT-AUTH-007-429 and ASSERT-AUTH-007-FORBIDDEN; ASSERT-AUTH-007-LOCAL-LOGOUT passes. | AUTH-007-US-004 | Yes | UI E2E |
| AUTH-007-US-004-TC-002 | Logout requests 1-10 are not blocked by rate limit | API, Positive | Medium | FX-AUTH-007-DEFAULT-LOGOUT is loaded. | Requests 1-10: same client/path within 60 seconds. | 1. Send requests 1-10. 2. Inspect each response only for rate-limit outcome. | Each of requests 1-10 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED; endpoint business logout result is not asserted. | AUTH-007-US-004; AUTH-007-US-005; AUTH-007-US-012 | Yes | API |
| AUTH-007-US-005-TC-001 | Default threshold blocks 11th request inside 60-second window | API, Boundary, Security | High | FX-AUTH-007-DEFAULT-LOGIN is loaded. | Request 10 timestamp `T+09s`; request 11 timestamp `T+10s`; window `60s`; threshold `10`. | 1. Send requests 1-10. 2. Send request 11 at `T+10s`. 3. Inspect response. | Request 10 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED; request 11 satisfies ASSERT-AUTH-007-429. | AUTH-007-US-005 | Yes | API |
| AUTH-007-US-005-TC-002 | Same client same path shares one default counter | API, Boundary, Security | High | FX-AUTH-007-KEY-SAME is loaded. | Client `client-key-001`; path `POST /api/v1/auth/login`; requests 1-11 within 60 seconds. | 1. Send requests 1-10. 2. Send request 11 for same client/path. | Request 11 satisfies ASSERT-AUTH-007-429. | AUTH-007-US-005 | Yes | API |
| AUTH-007-US-005-TC-003 | Same client different path does not consume same path counter | API, Boundary, Security | High | FX-AUTH-007-KEY-DIFF-PATH is loaded. | Client `client-key-002`; 10 requests to login path; request 11 equivalent goes to register path within same 60 seconds. | 1. Send 10 login requests. 2. Send 1 register request for same client. 3. Inspect register response. | Register request satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED because keying is per client/path. | AUTH-007-US-005 | Yes | API |
| AUTH-007-US-005-TC-004 | Different client same path does not consume same client counter | API, Boundary, Security | High | FX-AUTH-007-KEY-DIFF-CLIENT is loaded. | Client `client-key-003-a` sends 10 login requests; client `client-key-003-b` sends 1 login request within same window. | 1. Send 10 login requests as client A. 2. Send 1 login request as client B. 3. Inspect client B response. | Client B request satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED because keying is per client/path. | AUTH-007-US-005 | Yes | API |
| AUTH-007-US-006-TC-001 | Request-threshold override blocks request 4 | API, Boundary, Security | Medium | FX-AUTH-007-OVERRIDE-REQUESTS is loaded. | `AUTH_RATE_LIMIT_REQUESTS=3`; window `60s`; client `client-override-requests-001`; login requests 1-4. | 1. Send requests 1-3. 2. Send request 4. 3. Inspect response. | Requests 1-3 satisfy ASSERT-AUTH-007-NOT-RATE-LIMITED; request 4 satisfies ASSERT-AUTH-007-429. | AUTH-007-US-006 | Yes | API |
| AUTH-007-US-006-TC-002 | Window override recovers after 30-second configured window | API, Boundary, Security | Medium | FX-AUTH-007-OVERRIDE-WINDOW is loaded. | `AUTH_RATE_LIMIT_WINDOW_SECONDS=30`; threshold `10`; client `client-override-window-001`; request 11 at `T+10s`; next request at `T+31s`. | 1. Send requests 1-11 by `T+10s`. 2. Send next request at `T+31s`. 3. Inspect both responses. | Request 11 satisfies ASSERT-AUTH-007-429; request at `T+31s` satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED. | AUTH-007-US-006; AUTH-007-US-007 | Yes | API |
| AUTH-007-US-007-TC-001 | Default rate limit recovers after 60-second window expiry | API, Boundary, Security | Medium | FX-AUTH-007-DEFAULT-LOGIN is loaded with controlled clock. | Client `client-login-001`; request 11 at `T+10s`; next request at `T+61s`. | 1. Send requests 1-11 by `T+10s`. 2. Advance controlled clock to `T+61s`. 3. Send next request. | Request 11 satisfies ASSERT-AUTH-007-429; request at `T+61s` satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED. | AUTH-007-US-007 | Yes | API |
| AUTH-007-US-008-TC-001 | Redis production limiter shares counters across instances | API, Security | High | FX-AUTH-007-REDIS-PROD is loaded. | Production environment; `REDIS_URL` configured; client `client-redis-001`; path `POST /api/v1/auth/login`; requests 1-6 instance A, 7-11 instance B. | 1. Send requests 1-6 to instance A. 2. Send requests 7-10 to instance B. 3. Send request 11 to instance B. | Requests 1-10 satisfy ASSERT-AUTH-007-NOT-RATE-LIMITED; request 11 satisfies ASSERT-AUTH-007-429, proving shared Redis counter for client/path. | AUTH-007-US-008 | Yes | API |
| AUTH-007-US-009-TC-001 | Memory fallback enforces default limit when Redis absent | API, Security | Medium | FX-AUTH-007-MEMORY is loaded. | `REDIS_URL` absent; single process; client `client-memory-001`; path `POST /api/v1/auth/login`; requests 1-11 within 60 seconds. | 1. Send requests 1-10. 2. Send request 11. 3. Inspect response and logs. | Requests 1-10 satisfy ASSERT-AUTH-007-NOT-RATE-LIMITED; request 11 satisfies ASSERT-AUTH-007-429 and ASSERT-AUTH-007-FORBIDDEN. | AUTH-007-US-009 | Yes | API |
| AUTH-007-US-010-TC-001 | Redis failure falls back to process-local memory limiter safely | API, Security | High | FX-AUTH-007-REDIS-FAIL is loaded. | Redis temporarily unavailable; client `client-redis-fail-001`; path `POST /api/v1/auth/login`; requests 1-11 within 60 seconds. | 1. Send request 1 while Redis is unavailable. 2. Inspect response/log capture for request 1. 3. Send requests 2-10. 4. Send request 11. 5. Inspect request 11 response/log capture. | Request 1 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED and operational logs satisfy ASSERT-AUTH-007-FORBIDDEN; request 11 satisfies ASSERT-AUTH-007-429 and ASSERT-AUTH-007-FORBIDDEN under memory fallback. | AUTH-007-US-010 | Yes | API |
| AUTH-007-US-011-TC-001 | Rate-limit error schema includes RATE_LIMITED code and no sensitive fields | API, Security, Negative | High | FX-AUTH-007-SAFE-ERROR is loaded. | Over-threshold request to `POST /api/v1/auth/login`; canaries `PASSWORD-CANARY-AUTH-007`, `TOKEN-CANARY-AUTH-007`, `COOKIE-CANARY-AUTH-007`, `REQUEST-BODY-CANARY-AUTH-007`. | 1. Trigger over-threshold request. 2. Inspect response body, response headers visible to JavaScript, URL, DOM, accessibility tree, client logs, server logs, and error payloads. | ASSERT-AUTH-007-429 and ASSERT-AUTH-007-FORBIDDEN pass. | AUTH-007-US-011 | Yes | Security |
| AUTH-007-US-011-TC-002 | Rate-limit error does not expose sensitive threshold details | API, Security, Negative | High | FX-AUTH-007-SAFE-ERROR is loaded. | Over-threshold request; response artifact captured. | 1. Trigger `429 RATE_LIMITED`. 2. Inspect response body and visible UI text for threshold details. | Response includes code `RATE_LIMITED`; response does not reveal thresholds beyond user-safe recovery guidance unless such exposure is explicitly configured and documented in the environment. | AUTH-007-US-011 | Yes | Security |
| AUTH-007-US-012-TC-001 | Register request within threshold is not blocked by rate limiting | API, Positive | High | FX-AUTH-007-DEFAULT-REGISTER is loaded. | Request 1 only: `POST /api/v1/auth/register`; client `client-register-001`; timestamp `T+00s`. | 1. Send request 1. 2. Inspect only rate-limit outcome. | Request 1 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED; registration validation or account creation result is not asserted. | AUTH-007-US-012 | Yes | API |
| AUTH-007-US-012-TC-002 | Login request within threshold is not blocked by rate limiting | API, Positive | High | FX-AUTH-007-DEFAULT-LOGIN is loaded. | Request 1 only: `POST /api/v1/auth/login`; client `client-login-001`; timestamp `T+00s`. | 1. Send request 1. 2. Inspect only rate-limit outcome. | Request 1 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED; credential validation result is not asserted. | AUTH-007-US-012 | Yes | API |
| AUTH-007-US-012-TC-003 | Refresh request within threshold is not blocked by rate limiting | API, Positive | High | FX-AUTH-007-DEFAULT-REFRESH is loaded. | Request 1 only: `POST /api/v1/auth/refresh`; client `client-refresh-001`; timestamp `T+00s`. | 1. Send request 1. 2. Inspect only rate-limit outcome. | Request 1 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED; refresh token validation or session result is not asserted. | AUTH-007-US-012 | Yes | API |
| AUTH-007-US-012-TC-004 | Logout request within threshold is not blocked by rate limiting | API, Positive | High | FX-AUTH-007-DEFAULT-LOGOUT is loaded. | Request 1 only: `POST /api/v1/auth/logout`; client `client-logout-001`; timestamp `T+00s`. | 1. Send request 1. 2. Inspect only rate-limit outcome. | Request 1 satisfies ASSERT-AUTH-007-NOT-RATE-LIMITED; logout business result is not asserted. | AUTH-007-US-012 | Yes | API |
| AUTH-007-RESP-001 | Rate-limit error state fits mobile viewport matrix | Responsive, UI | Medium | FX-AUTH-007-RESPONSIVE is loaded. | Viewports `320x568`, `390x844`, `430x932`; screen displays `RATE_LIMITED` error state. | 1. Render rate-limit error at each viewport. 2. Measure overflow. 3. Inspect error text and any recovery/action control. | ASSERT-AUTH-007-RESPONSIVE passes for each viewport. | AUTH-007-US-011; RESP-002-US-001; RESP-002-US-002; RESP-002-US-022 | Yes | UI E2E |
| AUTH-007-RESP-002 | Rate-limit error state works in landscape and 200% zoom | Responsive, Accessibility | Medium | FX-AUTH-007-RESPONSIVE is loaded. | Phone landscape viewport; 200% browser zoom; screen displays `RATE_LIMITED` error state. | 1. Render rate-limit error in landscape. 2. Render at 200% zoom. 3. Measure overflow and action target size. | ASSERT-AUTH-007-RESPONSIVE passes in landscape and at 200% zoom; visible action target is at least `44x44` CSS pixels. | AUTH-007-US-011; RESP-002-US-012; RESP-003-US-001; RESP-003-US-002; RESP-003-US-003; RESP-003-US-008 | Yes | UI E2E |
| AUTH-007-A11Y-001 | Rate-limit error state is keyboard reachable and visibly focused | Accessibility, UI | Medium | FX-AUTH-007-RESPONSIVE is loaded. | Screen displays `RATE_LIMITED` error state with visible recovery/action control if one is rendered. | 1. Navigate the rate-limit error state by keyboard. 2. Inspect focused element and focus indicator. 3. Inspect accessibility tree for `RATE_LIMITED` state. | Error state is reachable by keyboard; any visible recovery/action control has visible focus; accessibility tree exposes the rate-limit error without credential/token/cookie canaries; touch target satisfies RESP-003-US-008 where action is rendered. | AUTH-007-US-011; RESP-003-US-008 | Yes | Accessibility |

## Clarification / Manual / Traceability Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| AUTH-007-RC-001 | Requirement Clarification | High | Confirm exact response field names beyond required `code: RATE_LIMITED`, if the structured rate-limit error schema should be asserted more narrowly. | Executable tests assert documented `429`, required `code`, and forbidden sensitive fields without inventing undocumented schema fields. | AUTH-007-US-011 |
| AUTH-007-RC-002 | Requirement Clarification | Medium | Confirm whether threshold exposure in recovery guidance is intentionally exposed in the active environment. | Executable tests block sensitive threshold leakage unless intentionally exposed by documented configuration. | AUTH-007-US-011 |
| AUTH-007-RC-003 | Requirement Clarification | Medium | Confirm whether a dedicated non-modal `A11Y-*` requirement exists for auth error states. | Executable accessibility tests trace to AUTH-007-US-011 and applicable global `RESP-*` touch/zoom/error-state requirements; modal-only and rating-only `A11Y-*` requirements are not applied. | AUTH-007-US-011 |
| AUTH-007-TRACE-001 | Traceability Verification | High | Confirm endpoint-specific outcomes remain outside AUTH-007 execution. | AUTH-007 tests assert rate-limit gating, counter keying, fallback behavior, and safe errors only; register/login/refresh/logout business success is not asserted. | AUTH-007-US-012 |
| AUTH-007-TRACE-002 | Traceability Verification | High | Confirm `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, and `POST /api/v1/auth/logout` are the documented auth endpoint paths under rate-limit coverage. | Endpoint paths used in tests match AUTH-007 user stories and feature traceability endpoint inventory. | AUTH-007-US-001; AUTH-007-US-002; AUTH-007-US-003; AUTH-007-US-004 |
| AUTH-007-TRACE-003 | Traceability Verification | Medium | Confirm responsive/accessibility coverage is limited to rate-limit error states and approved global responsive requirements. | Responsive/accessibility cases do not test unrelated auth forms, session internals, token internals, lockout, MFA, or redirect rules. | AUTH-007-US-011; RESP-002-US-001; RESP-003-US-001; RESP-003-US-008 |

## Summary

- User Stories Processed: 12
- Executable Test Cases: 27
- Clarification Cases: 3
- Manual Cases: 0
- Traceability Cases: 3
- Total Test Cases: 33

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Generic Executable Wording = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Security Assumption Violations = 0
- Responsive Traceability Gaps = 0
- Accessibility Traceability Gaps = 0
