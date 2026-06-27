# AUTH-005 Test Cases

Feature: `AUTH-005 - Logout and revoke refresh token`

## Sources

- `docs/user-stories/AUTH_USER_STORIES.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## Documented Contract

- Logout endpoint: `POST /api/v1/auth/logout`.
- Logout response body contains `revoked: true` after logout completes.
- Logout with a valid refresh cookie revokes the refresh token so it cannot be used again.
- Logout clears the refresh cookie using matching path `/api/v1/auth` and matching security attributes.
- Logout clears the in-memory access token.
- Logout with a missing refresh cookie clears local session state and remains safe.
- Network or 5xx logout API failure clears local access token and private UI state while reporting that server revocation may not be confirmed.
- Logout completion or local fallback navigates to `/`.
- BroadcastChannel-supported logout clears access token and private UI state in other tabs.
- Without BroadcastChannel, stale tabs recover on next protected request, focus, visibility change, or refresh failure.
- After logout, lists, places, ratings, profile, and authenticated public-list pages are hidden until login.
- Logout action has a clear label, visible focus, keyboard activation, and announces state change after completion.
- Logout success or failure never places tokens in URL, localStorage, sessionStorage, logs, or error payloads.

## Shared Deterministic Fixtures

| Fixture ID | Purpose | Exact State |
|---|---|---|
| FX-AUTH-005-VALID-001 | Authenticated logout with refresh cookie | User `user-001`; in-memory access token canary `ACCESS-CANARY-AUTH-005`; HttpOnly refresh cookie canary `REFRESH-CANARY-AUTH-005`; refresh token record `refresh-005-001`, `revoked=false`; current route `/lists`; private canaries visible before logout: `PRIVATE-LIST-AUTH-005`, `PRIVATE-PLACE-AUTH-005`, `PRIVATE-RATING-AUTH-005`, `PRIVATE-PROFILE-AUTH-005`, `PRIVATE-PUBLIC-LIST-AUTH-005`. |
| FX-AUTH-005-NOCOOKIE-001 | Authenticated local state with missing refresh cookie | User `user-001`; in-memory access token canary `ACCESS-CANARY-AUTH-005`; no refresh cookie; current route `/lists`; same private canaries visible before logout. |
| FX-AUTH-005-NETWORK-001 | Logout network failure | Same as FX-AUTH-005-VALID-001; `POST /api/v1/auth/logout` fails before an HTTP response is received. |
| FX-AUTH-005-5XX-001 | Logout server failure | Same as FX-AUTH-005-VALID-001; `POST /api/v1/auth/logout` returns a documented 5xx-class failure without asserting a specific numeric code. |
| FX-AUTH-005-TABS-BROADCAST | BroadcastChannel available | Tab A and Tab B are authenticated as `user-001`; both have in-memory access token canary `ACCESS-CANARY-AUTH-005`; both display private canaries before logout; BroadcastChannel is available. |
| FX-AUTH-005-TABS-NO-BROADCAST | BroadcastChannel unavailable | Tab A and Tab B are authenticated as `user-001`; both display private canaries before logout; BroadcastChannel is unavailable. |
| FX-AUTH-005-UI-001 | Logout action accessibility | Authenticated screen has one logout control with visible label `Logout`; no modal, sheet, or rating control is involved. |
| FX-AUTH-005-RESPONSIVE-001 | Logout responsive state | Authenticated active screen has one logout action, private canaries before logout, and post-logout root route `/`. |

## Shared Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-AUTH-005-NO-TOKEN-LEAK | `ACCESS-CANARY-AUTH-005`, `REFRESH-CANARY-AUTH-005`, token hash, cookie value, credentials, secrets, debug payloads, stack traces, and internal identifiers are absent from URL, localStorage, sessionStorage, rendered DOM, accessibility tree, client error payloads, network error payloads, and captured logs. |
| ASSERT-AUTH-005-LOCAL-CLEAR | In-memory access token is `null`; local authenticated state is cleared; localStorage/sessionStorage contain no auth token values; private canaries are absent from DOM and accessibility tree. |
| ASSERT-AUTH-005-PRIVATE-HIDDEN | `PRIVATE-LIST-AUTH-005`, `PRIVATE-PLACE-AUTH-005`, `PRIVATE-RATING-AUTH-005`, `PRIVATE-PROFILE-AUTH-005`, and `PRIVATE-PUBLIC-LIST-AUTH-005` are absent from DOM text, accessibility tree text, client logs, and error payloads after logout or local fallback. |
| ASSERT-AUTH-005-LOGOUT-BODY | Logout completion response body contains `revoked: true` and does not contain `accessToken`, `refreshToken`, `user`, `session`, `tokenHash`, `claims`, `debug`, `stack`, `internalId`, credentials, secrets, or private user data. Numeric success status is not asserted because AUTH-005 does not document it. |
| ASSERT-AUTH-005-COOKIE-CLEAR | Logout response clears refresh cookie using path `/api/v1/auth` and matching security attributes from the pre-logout cookie fixture; `REFRESH-CANARY-AUTH-005` is absent from document-accessible cookies and browser storage after logout handling. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| AUTH-005-US-001-TC-001 | Logout action calls documented endpoint without token payload | UI, Security | Critical | FX-AUTH-005-UI-001 and FX-AUTH-005-VALID-001 are loaded. | Request: `POST /api/v1/auth/logout`; payload: none. | 1. Activate logout control. 2. Capture outbound request method, URL, body, URL bar, and logs. | Exactly one logout request is sent to `POST /api/v1/auth/logout`; request body is empty; URL and logs do not contain `ACCESS-CANARY-AUTH-005` or `REFRESH-CANARY-AUTH-005`. | AUTH-005-US-001 | Yes | UI E2E |
| AUTH-005-US-002-TC-001 | Logout completion body contains revoked true only with safe fields | API, Security | High | FX-AUTH-005-VALID-001 is loaded. | Request: `POST /api/v1/auth/logout`; payload: none; refresh cookie present. | 1. Send logout request. 2. After logout completion response is available, parse response body without asserting numeric success status. 3. Inspect body fields and logs. | ASSERT-AUTH-005-LOGOUT-BODY passes; response body contains `revoked: true`; ASSERT-AUTH-005-NO-TOKEN-LEAK passes. | AUTH-005-US-002 | Yes | API |
| AUTH-005-US-003-TC-001 | Logout revokes old refresh token without asserting undocumented refresh status | API, Security, Data Integrity | Critical | FX-AUTH-005-VALID-001 is loaded. | Before logout: `refresh-005-001.revoked=false`; old refresh cookie canary `REFRESH-CANARY-AUTH-005`. | 1. Send logout request. 2. Query refresh token record `refresh-005-001`. 3. Attempt to use old refresh cookie in a controlled harness. 4. Inspect whether an access token is issued. | `refresh-005-001.revoked=true`; old refresh cookie cannot obtain a new access token; no numeric refresh-failure status is asserted; ASSERT-AUTH-005-NO-TOKEN-LEAK passes. | AUTH-005-US-003 | Yes | API |
| AUTH-005-US-004-TC-001 | Logout clears refresh cookie with matching path and attributes | Security, API | Critical | FX-AUTH-005-VALID-001 is loaded with recorded pre-logout cookie attributes for `REFRESH-CANARY-AUTH-005`. | Pre-logout cookie path `/api/v1/auth`; pre-logout security attributes recorded by browser/network API. | 1. Send logout request. 2. Inspect logout response cookie mutation. 3. Inspect `document.cookie`, localStorage, sessionStorage, and URL. | ASSERT-AUTH-005-COOKIE-CLEAR passes; cookie clear path is `/api/v1/auth`; clear operation uses matching recorded security attributes; ASSERT-AUTH-005-NO-TOKEN-LEAK passes. | AUTH-005-US-004 | Yes | Security |
| AUTH-005-US-005-TC-001 | Logout clears in-memory access token | UI, Security | Critical | FX-AUTH-005-VALID-001 is loaded. | In-memory access token canary `ACCESS-CANARY-AUTH-005`. | 1. Activate logout. 2. Inspect in-memory auth state after logout handling. 3. Inspect DOM, accessibility tree, storage, URL, and logs. | ASSERT-AUTH-005-LOCAL-CLEAR passes; `ACCESS-CANARY-AUTH-005` is absent from storage, URL, DOM, accessibility tree, logs, and errors. | AUTH-005-US-005 | Yes | UI E2E |
| AUTH-005-US-006-TC-001 | Missing-cookie logout clears local session safely | UI, Security | High | FX-AUTH-005-NOCOOKIE-001 is loaded. | Request: `POST /api/v1/auth/logout`; payload: none; refresh cookie absent. | 1. Activate logout. 2. Inspect local auth state, DOM, accessibility tree, storage, URL, logs, and error payloads. | ASSERT-AUTH-005-LOCAL-CLEAR passes; ASSERT-AUTH-005-PRIVATE-HIDDEN passes; ASSERT-AUTH-005-NO-TOKEN-LEAK passes. | AUTH-005-US-006 | Yes | UI E2E |
| AUTH-005-US-007-TC-001 | Network-failure logout clears local state and reports unconfirmed revocation | UI, Security, Negative | High | FX-AUTH-005-NETWORK-001 is loaded. | Logout request fails before HTTP response. | 1. Activate logout. 2. Simulate network failure before response. 3. Inspect local auth state, route, UI text, storage, URL, logs, and error payloads. | ASSERT-AUTH-005-LOCAL-CLEAR passes; ASSERT-AUTH-005-PRIVATE-HIDDEN passes; UI reports that server revocation may not be confirmed; ASSERT-AUTH-005-NO-TOKEN-LEAK passes. | AUTH-005-US-007 | Yes | UI E2E |
| AUTH-005-US-007-TC-002 | 5xx logout failure clears local state and reports unconfirmed revocation | UI, Security, Negative | High | FX-AUTH-005-5XX-001 is loaded. | Logout request returns documented 5xx-class failure; exact numeric status is not asserted. | 1. Activate logout. 2. Simulate 5xx-class response. 3. Inspect local auth state, route, UI text, storage, URL, logs, and error payloads. | ASSERT-AUTH-005-LOCAL-CLEAR passes; ASSERT-AUTH-005-PRIVATE-HIDDEN passes; UI reports that server revocation may not be confirmed; ASSERT-AUTH-005-NO-TOKEN-LEAK passes. | AUTH-005-US-007 | Yes | UI E2E |
| AUTH-005-US-008-TC-001 | Logout success navigates to root | UI | High | FX-AUTH-005-VALID-001 is loaded. | Current route `/lists`; logout completes. | 1. Activate logout. 2. Wait for logout completion handling. 3. Inspect browser location and private canaries. | Browser path is `/`; ASSERT-AUTH-005-PRIVATE-HIDDEN passes; ASSERT-AUTH-005-NO-TOKEN-LEAK passes. | AUTH-005-US-008 | Yes | UI E2E |
| AUTH-005-US-008-TC-002 | Local fallback logout navigates to root | UI, Negative | High | FX-AUTH-005-NETWORK-001 is loaded. | Current route `/lists`; logout API network failure. | 1. Activate logout. 2. Simulate network failure. 3. Inspect browser location and private canaries. | Browser path is `/`; ASSERT-AUTH-005-LOCAL-CLEAR passes; ASSERT-AUTH-005-PRIVATE-HIDDEN passes. | AUTH-005-US-008 | Yes | UI E2E |
| AUTH-005-US-009-TC-001 | BroadcastChannel logout clears other tab state | UI, Security | High | FX-AUTH-005-TABS-BROADCAST is loaded. | Tab A action: logout; Tab B before-state: access token present and private canaries visible. | 1. Activate logout in Tab A. 2. Capture BroadcastChannel logout notification. 3. Inspect Tab B in-memory auth state, DOM, accessibility tree, storage, URL, and logs. | Tab B in-memory access token becomes `null`; Tab B private canaries are hidden; Tab B storage, URL, logs, and errors do not contain token canaries. | AUTH-005-US-009 | Yes | UI E2E |
| AUTH-005-US-010-TC-001 | No BroadcastChannel: stale tab recovers on next protected request | UI, Security | Medium | FX-AUTH-005-TABS-NO-BROADCAST is loaded. | Tab A logs out; Tab B remains open; recovery trigger is next protected request. | 1. Logout in Tab A. 2. Trigger next protected request in Tab B. 3. Inspect Tab B auth state and private canaries. | Tab B detects logged-out state on the next protected request; ASSERT-AUTH-005-LOCAL-CLEAR and ASSERT-AUTH-005-PRIVATE-HIDDEN pass in Tab B. | AUTH-005-US-010 | Yes | UI E2E |
| AUTH-005-US-010-TC-002 | No BroadcastChannel: stale tab recovers on focus event | UI, Security | Medium | FX-AUTH-005-TABS-NO-BROADCAST is loaded. | Tab A logs out; Tab B remains open; recovery trigger is focus event. | 1. Logout in Tab A. 2. Focus Tab B. 3. Inspect Tab B auth state and private canaries. | Tab B detects logged-out state on focus handling; ASSERT-AUTH-005-LOCAL-CLEAR and ASSERT-AUTH-005-PRIVATE-HIDDEN pass in Tab B. | AUTH-005-US-010 | Yes | UI E2E |
| AUTH-005-US-010-TC-003 | No BroadcastChannel: stale tab recovers on visibility change | UI, Security | Medium | FX-AUTH-005-TABS-NO-BROADCAST is loaded. | Tab A logs out; Tab B remains open; recovery trigger is visibility change. | 1. Logout in Tab A. 2. Fire visibility-change handling in Tab B. 3. Inspect Tab B auth state and private canaries. | Tab B detects logged-out state on visibility-change handling; ASSERT-AUTH-005-LOCAL-CLEAR and ASSERT-AUTH-005-PRIVATE-HIDDEN pass in Tab B. | AUTH-005-US-010 | Yes | UI E2E |
| AUTH-005-US-010-TC-004 | No BroadcastChannel: stale tab recovers on refresh failure | UI, Security | Medium | FX-AUTH-005-TABS-NO-BROADCAST is loaded. | Tab A logs out; Tab B remains open; recovery trigger is refresh failure. | 1. Logout in Tab A. 2. Trigger Tab B refresh failure recovery. 3. Inspect Tab B auth state and private canaries. | Tab B detects logged-out state on refresh failure handling; ASSERT-AUTH-005-LOCAL-CLEAR and ASSERT-AUTH-005-PRIVATE-HIDDEN pass in Tab B. | AUTH-005-US-010 | Yes | UI E2E |
| AUTH-005-US-011-TC-001 | Private authenticated data is hidden after logout | Security, Privacy, UI | Critical | FX-AUTH-005-VALID-001 is loaded. | Private canaries: lists, places, ratings, profile, authenticated public-list data. | 1. Activate logout. 2. Attempt to view each previously loaded authenticated surface. 3. Inspect DOM, accessibility tree, logs, and error payloads. | ASSERT-AUTH-005-PRIVATE-HIDDEN passes for all private canaries; data remains hidden until a new authenticated session exists. | AUTH-005-US-011 | Yes | Security |
| AUTH-005-US-012-TC-001 | Logout control is keyboard operable and announced | Accessibility, UI | Medium | FX-AUTH-005-UI-001 is loaded. | Logout control label `Logout`; keyboard-only interaction. | 1. Move focus to logout control using keyboard. 2. Verify focus indicator. 3. Activate logout with keyboard. 4. Inspect accessibility tree and live/status announcement. | Logout control has accessible name `Logout`; focus indicator is visible; keyboard activation starts logout; state-change announcement is exposed to assistive technology after completion. | AUTH-005-US-012 | Yes | Accessibility |
| AUTH-005-US-012-TC-002 | Logout control touch target and forced-colors state remain usable | Accessibility, Responsive | Medium | FX-AUTH-005-UI-001 is loaded. | Forced-colors mode and 200% zoom are enabled separately. | 1. Measure logout control hit target at normal zoom and 200% zoom. 2. Enable forced-colors mode. 3. Inspect focus and control visibility. | Logout control hit target is at least `44x44` CSS pixels; focus and control state remain visible in forced-colors mode; logout can still be activated. | AUTH-005-US-012; RESP-003-US-008; RESP-003-US-015 | Yes | Accessibility |
| AUTH-005-US-013-TC-001 | Logout success does not leak token or credential canaries | Security, Privacy | Critical | FX-AUTH-005-VALID-001 is loaded. | Canaries: `ACCESS-CANARY-AUTH-005`, `REFRESH-CANARY-AUTH-005`, credential canary `PASSWORD-CANARY-AUTH-005`. | 1. Activate logout and allow completion. 2. Inspect URL, localStorage, sessionStorage, response body, response headers visible to JS, client logs, server log capture, DOM, accessibility tree, and error payloads. | ASSERT-AUTH-005-NO-TOKEN-LEAK passes; credential canary is absent from all inspected artifacts. | AUTH-005-US-013 | Yes | Security |
| AUTH-005-US-013-TC-002 | Logout fallback failures do not leak token or credential canaries | Security, Privacy, Negative | Critical | FX-AUTH-005-NETWORK-001 and FX-AUTH-005-5XX-001 are available. | Canaries: `ACCESS-CANARY-AUTH-005`, `REFRESH-CANARY-AUTH-005`, credential canary `PASSWORD-CANARY-AUTH-005`. | 1. Execute network-failure logout. 2. Execute 5xx-class logout. 3. Inspect URL, storage, response/error payloads, logs, DOM, and accessibility tree for both runs. | ASSERT-AUTH-005-NO-TOKEN-LEAK passes for both failure modes; credential canary is absent from all inspected artifacts. | AUTH-005-US-013 | Yes | Security |
| AUTH-005-RESP-001 | Logout action and post-logout state pass mobile viewport matrix | Responsive, UI | High | FX-AUTH-005-RESPONSIVE-001 is loaded. | Viewports: `320x568`, `390x844`, `430x932`; current route `/lists`; logout action present. | 1. Render authenticated state at each viewport. 2. Activate logout. 3. Inspect route `/`, logout completion/fallback state, safe areas, and overflow. | At each viewport, logout action is reachable before activation; post-logout root state is visible; private canaries are hidden; `document.documentElement.scrollWidth <= window.innerWidth`; top and bottom safe areas do not obscure required controls. | AUTH-005-US-008; AUTH-005-US-011; RESP-002-US-001; RESP-002-US-002; RESP-002-US-004; RESP-002-US-005 | Yes | UI E2E |
| AUTH-005-RESP-002 | Logout flow passes landscape and 200% zoom | Responsive, Accessibility | High | FX-AUTH-005-RESPONSIVE-001 is loaded. | Phone landscape viewport; 200% browser zoom; logout action present. | 1. Render authenticated state in phone landscape. 2. Activate logout. 3. Render at 200% zoom and repeat. 4. Inspect overflow, action reachability, and private canaries. | Logout action remains reachable; post-logout root state remains visible; private canaries are hidden; `document.documentElement.scrollWidth <= window.innerWidth`; function is preserved under landscape and 200% zoom. | AUTH-005-US-008; AUTH-005-US-011; RESP-002-US-012; RESP-003-US-001; RESP-003-US-002; RESP-003-US-003 | Yes | UI E2E |

## Clarification / Manual / Traceability Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| AUTH-005-RC-001 | Requirement Clarification | High | Confirm exact numeric success HTTP status for `POST /api/v1/auth/logout`. | Executable tests assert documented endpoint and `revoked: true` response body without inventing a numeric success status. | AUTH-005-US-001; AUTH-005-US-002 |
| AUTH-005-RC-002 | Requirement Clarification | High | Confirm exact response/error schema fields for logout network failure and 5xx-class failure if the UI displays structured error details. | Executable tests assert local cleanup, unconfirmed revocation notice, and forbidden sensitive fields without inventing undocumented error field names. | AUTH-005-US-007; AUTH-005-US-013 |
| AUTH-005-RC-003 | Requirement Clarification | Medium | Confirm exact accessible announcement text and localization for the logout state-change announcement. | Executable accessibility tests assert that a state-change announcement exists without inventing localized copy. | AUTH-005-US-012 |
| AUTH-005-TRACE-001 | Traceability Verification | High | Verify `POST /api/v1/auth/logout` maps to frontend API client, backend `revoke_refresh_token`, `RefreshToken`, and `refresh_tokens` traceability. | AUTH-005 tests remain scoped to logout, refresh-token revocation, local cleanup, route `/`, cross-tab logout cleanup, and token-leak prevention. | AUTH-005-US-001; AUTH-005-US-003; AUTH-005-US-004 |
| AUTH-005-TRACE-002 | Traceability Verification | Medium | Verify responsive/accessibility cases use only AUTH-005 accessibility acceptance criteria and approved global responsive requirements. | No unrelated modal-only, rating-only, login, registration, session-lifetime, MFA, lockout, or rate-limit behavior is tested as executable AUTH-005 behavior. | AUTH-005-US-012; RESP-002-US-001; RESP-003-US-001; RESP-003-US-008 |

## Summary

- User Stories Processed: 13
- Executable Test Cases: 22
- Clarification Cases: 3
- Manual Cases: 0
- Traceability Cases: 2
- Total Test Cases: 27

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
