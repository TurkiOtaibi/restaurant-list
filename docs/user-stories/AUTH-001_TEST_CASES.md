# AUTH-001 Test Cases

Feature: `AUTH-001 - View entry shell and auth links`

## Sources

- `docs/user-stories/AUTH_USER_STORIES.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## Production Contract

- Guests can open `/` without a session.
- `/` exposes only public authentication entry content.
- `/` must not expose lists, places catalog data, ratings, profile data, protected public-list data, account data, tokens, cookies, JWT claims, secrets, debug payloads, stack traces, or hidden metadata.
- Login activation from `/` navigates to `/login`.
- Register activation from `/` navigates to `/register`.
- Authenticated users opening `/` receive a clear path to the authenticated app; auto-redirect is not required.
- AUTH-001 does not own login form validation, registration validation, password rules, MFA, account recovery, lockout, rate limiting, refresh, logout, or protected-route denial.
- Destination login/register form internals are verified only as traceability because they are outside AUTH-001 entry-shell ownership.

## Deterministic Fixtures

| Fixture ID | State | Exact Data |
|---|---|---|
| FX-AUTH-001-GUEST-PUBLIC | Guest browser context | Route `/`; no access token in memory; no refresh cookie; `localStorage={}`; `sessionStorage={}`; no `Authorization` header. |
| FX-AUTH-001-GUEST-SEEDED | Guest with protected data seeded server-side | `user.id=user-001`; `email=user001@example.com`; `displayName=Turki`; `list.id=list-private-001`; `place.id=place-private-001`; `rating.id=rating-private-001`; `profile.id=profile-user-001`; protected public-list fixture `public-list-protected-001`. |
| FX-AUTH-001-AUTHENTICATED | Authenticated browser context | `user.id=user-001`; `email=user001@example.com`; `displayName=Turki`; in-memory access token exists; HttpOnly refresh cookie exists; route `/`. |
| FX-AUTH-001-CANARY | Token and log leakage canaries | `accessToken=access-token-canary-auth001`; `refreshToken=refresh-token-canary-auth001`; `jwtClaim=jwt-claim-canary-auth001`; `cookieValue=refresh-cookie-canary-auth001`; `sessionId=session-canary-auth001`; `secret=secret-canary-auth001`. |
| FX-AUTH-001-RESPONSIVE | Responsive execution matrix | Viewports `320x568`, `390x844`, `430x932`, and `667x375`; browser zoom `200%`; safe-area emulation with top and bottom insets. |
| FX-AUTH-001-A11Y | Entry-link accessibility matrix | Keyboard-only navigation; login link href `/login`; register link href `/register`; accessible name must equal each link's visible text; focus indicator contrast must meet the global baseline. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| AUTH-001-US-001-TC-001 | Guest loads `/` without a session | UI, Positive | Medium | FX-AUTH-001-GUEST-PUBLIC is active. | Request: `GET /`; Payload: none; Headers: no `Authorization`; Cookies: none. | 1. Clear cookies, storage, and in-memory auth state. 2. Navigate to `/`. 3. Capture document response, final URL, document readiness, rendered interactive controls, and network calls. | The `GET /` document response is `200 OK`; final URL remains `/`; document reaches `readyState=complete`; login and register actions are present; no session cookie or token is created; no authenticated API request returns private data. | AUTH-001-US-001 | Yes | UI E2E |
| AUTH-001-US-002-TC-001 | Guest entry shell excludes seeded private data | Security, Privacy, UI | Critical | FX-AUTH-001-GUEST-PUBLIC and FX-AUTH-001-GUEST-SEEDED are active. | Request: `GET /`; Payload: none; Seeded values: `list-private-001`, `place-private-001`, `rating-private-001`, `profile-user-001`, `public-list-protected-001`, `user001@example.com`. | 1. Navigate to `/` as a guest. 2. Inspect initial HTML, hydration data, script state, network response bodies, DOM text, attributes, and accessibility tree. | None of the seeded IDs, email, profile value, list value, place value, rating value, protected public-list value, account data, private notes, internal identifiers, hidden metadata, audit fields, debug fields, or stack traces appear in inspected artifacts. | AUTH-001-US-002 | Yes | Security |
| AUTH-001-US-002-TC-002 | Guest sees no private-data flash during entry-shell hydration | Security, Privacy, UI | Critical | FX-AUTH-001-GUEST-PUBLIC and FX-AUTH-001-GUEST-SEEDED are active; DOM mutation recording is enabled before navigation. | Request: `GET /`; Payload: none; observation window: navigation start through network idle plus 500 ms. | 1. Start DOM, accessibility-tree, and network-body observers. 2. Navigate to `/`. 3. Record every text node, attribute mutation, accessible name, and response body. | At zero points during the observation window do seeded protected values, account data, token values, cookie values, debug payloads, stack traces, or hidden metadata appear in the DOM, accessibility tree, URL, console errors, or network bodies. | AUTH-001-US-002 | Yes | Security |
| AUTH-001-US-003-TC-001 | Login action navigates to `/login` without creating auth state | UI, Navigation, Accessibility | High | FX-AUTH-001-GUEST-PUBLIC and FX-AUTH-001-A11Y are active. | Request: `GET /`; Payload: none; Action target: link with href `/login`. | 1. Navigate to `/`. 2. Locate the visible link whose `href` resolves to `/login`. 3. Verify role and accessible name. 4. Focus it by keyboard. 5. Press Enter. | The link role is `link`; accessible name is non-empty and equals visible text; visible focus is shown before activation; final path is `/login`; no access token, refresh token, or session cookie is created. | AUTH-001-US-003, AUTH-001-US-009 | Yes | UI E2E |
| AUTH-001-US-004-TC-001 | Register action navigates to `/register` without creating auth state | UI, Navigation, Accessibility | High | FX-AUTH-001-GUEST-PUBLIC and FX-AUTH-001-A11Y are active. | Request: `GET /`; Payload: none; Action target: link with href `/register`. | 1. Navigate to `/`. 2. Locate the visible link whose `href` resolves to `/register`. 3. Verify role and accessible name. 4. Focus it by keyboard. 5. Press Enter. | The link role is `link`; accessible name is non-empty and equals visible text; visible focus is shown before activation; final path is `/register`; no access token, refresh token, or session cookie is created. | AUTH-001-US-004, AUTH-001-US-009 | Yes | UI E2E |
| AUTH-001-US-005-TC-001 | Authenticated user has a documented app exit path from `/` | UI, UX, Security | Medium | FX-AUTH-001-AUTHENTICATED is active. | Request: `GET /`; Payload: none; Allowed authenticated destinations from source: `/places`, `/lists`, or primary app navigation. | 1. Navigate to `/` while authenticated. 2. Inspect visible interactive controls and primary navigation. 3. Activate the first keyboard-reachable authenticated-app entry action. | At least one visible, keyboard-reachable app entry action exists; its target is `/places`, `/lists`, or a primary app navigation destination; activation reaches an authenticated app destination; access token and refresh cookie values are not rendered in the UI or URL. | AUTH-001-US-005 | Yes | UI E2E |
| AUTH-001-US-006-TC-001 | Entry shell does not expose token canaries in client artifacts | Security, Privacy | Critical | FX-AUTH-001-AUTHENTICATED and FX-AUTH-001-CANARY are active. | Request: `GET /`; Payload: none; Canaries: `access-token-canary-auth001`, `refresh-token-canary-auth001`, `jwt-claim-canary-auth001`, `refresh-cookie-canary-auth001`, `session-canary-auth001`, `secret-canary-auth001`. | 1. Navigate to `/`. 2. Inspect final URL, HTML source, DOM, hydration state, localStorage, sessionStorage, document-accessible cookies, console messages, client-visible error overlays, and network request/response bodies. | No canary value appears in the URL, HTML, DOM, hydration state, localStorage, sessionStorage, document-accessible cookies, console messages, client-visible errors, or response bodies; no `Authorization` header value appears in rendered UI text or attributes. | AUTH-001-US-006 | Yes | Security |
| AUTH-001-US-006-TC-002 | Entry shell render logs do not contain tokens or sensitive session identifiers | Security, Privacy | Critical | FX-AUTH-001-AUTHENTICATED and FX-AUTH-001-CANARY are active; application, access, error, structured-event, and client telemetry logs are captured for the test request ID. | Request: `GET /`; Payload: none; Log correlation ID: `auth001-log-check-001`. | 1. Navigate to `/` with correlation ID `auth001-log-check-001`. 2. Export server logs, access logs, client telemetry, and structured error events for that correlation ID. 3. Search logs for every FX-AUTH-001-CANARY value and sensitive header name/value pair. | Captured logs contain the correlation ID only; logs contain zero occurrences of access token, refresh token, JWT claim, cookie value, session identifier, secret value, raw `Authorization` header value, stack trace, debug payload, or internal auth identifier. | AUTH-001-US-006 | Yes | Security |
| AUTH-001-US-007-TC-001 | Entry shell passes mobile viewport and safe-area matrix | Responsive, UI | Medium | FX-AUTH-001-GUEST-PUBLIC and FX-AUTH-001-RESPONSIVE are active. | Requests: `GET /` at `320x568`, `390x844`, `430x932`, and `667x375`; Payload: none; Safe-area top/bottom insets enabled. | 1. Open `/` at each viewport. 2. Measure login/register bounding boxes, hit targets, safe-area clearance, and page overflow. 3. Repeat at landscape `667x375`. | Login and register actions are visible and reachable in every viewport; each action has hit target at least `44x44` CSS px; top content is not obscured by top safe area; final interactive action is not obscured by bottom safe area; `document.documentElement.scrollWidth <= window.innerWidth`. | AUTH-001-US-007; RESP-002-US-001; RESP-002-US-002; RESP-002-US-004; RESP-002-US-005; RESP-002-US-012; RESP-003-US-008 | Yes | Accessibility |
| AUTH-001-US-008-TC-001 | Entry shell remains usable at 200% zoom | Responsive, Accessibility | Medium | FX-AUTH-001-GUEST-PUBLIC and FX-AUTH-001-RESPONSIVE are active. | Request: `GET /`; Payload: none; Zoom: `200%`; viewport: `390x844`. | 1. Set browser zoom to `200%`. 2. Navigate to `/`. 3. Measure login/register visibility, text clipping, target size, and page overflow. | Login and register actions remain reachable by keyboard and pointer; their text is not clipped; each target remains at least `44x44` CSS px; `document.documentElement.scrollWidth <= window.innerWidth`. | AUTH-001-US-008; RESP-003-US-001; RESP-003-US-002; RESP-003-US-008 | Yes | Accessibility |
| AUTH-001-US-009-TC-001 | Entry links have deterministic keyboard focus order and accessible names | Accessibility, UI | Medium | FX-AUTH-001-GUEST-PUBLIC and FX-AUTH-001-A11Y are active. | Request: `GET /`; Payload: none; Expected link targets: `/login`, `/register`. | 1. Navigate to `/`. 2. Use Tab from the browser viewport start until both auth actions are reached. 3. Inspect role, accessible name, visible text, focus indicator, focus order, and accessibility tree. | Focus reaches the `/login` link and `/register` link exactly once each before unrelated duplicate auth actions; each has role `link`; each accessible name is non-empty and equals its visible text; focus indicator is visible and meets the global focus contrast baseline; no token or private-data value is present in accessible names or descriptions. | AUTH-001-US-009 | Yes | Accessibility |

## Clarification / Manual / Traceability Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| AUTH-001-RC-001 | Requirement Clarification | Low | Confirm whether authenticated `/` should auto-redirect or render an explicit app-entry action. | AUTH-001 executable coverage asserts only the documented requirement: a clear app path exists. | AUTH-001-US-005 |
| AUTH-001-RC-002 | Requirement Clarification | Medium | Confirm exact localized visible copy for login and register links. | Executable tests assert accessible name equals visible text and exact route targets; they do not require undocumented English or Arabic copy. | AUTH-001-US-003, AUTH-001-US-004, AUTH-001-US-009 |
| AUTH-001-RC-003 | Requirement Clarification | Medium | Confirm whether the entry shell has a dynamic status/live-region requirement. | No executable live-region assertion is added for static `/` rendering because AUTH-001 documents labels, focus, and focus order only. | AUTH-001-US-009 |
| AUTH-001-US-010-TRACE-001 | Traceability Verification | Low | From `/`, activate the `/login` link, return to `/`, and activate the `/register` link. | `/login` and `/register` are reachable from `/`; no executable assertion is made about destination field validation, password policy, autocomplete attributes, password-manager behavior, or form errors because those are outside AUTH-001 entry-shell ownership. | AUTH-001-US-010 |
| AUTH-001-TRACE-002 | Traceability Verification | Medium | Verify global accessibility scope before citing `A11Y-*` IDs. | `A11Y-001` covers dialogs/sheets and `A11Y-002` covers rating controls; neither is cited as executable AUTH-001 entry-link coverage. AUTH-001 accessibility is traced to `AUTH-001-US-009` and global baseline rules. | AUTH-001-US-009 |
| AUTH-001-TRACE-003 | Traceability Verification | Critical | Verify protected-route denial and structured `401` response coverage remain outside AUTH-001. | AUTH-001 asserts `/` does not fetch or expose protected data; protected API denial, return-to-origin, and unauthorized API schemas are not duplicated here. | AUTH-001-US-002 |
| AUTH-001-TRACE-004 | Traceability Verification | High | Verify login/register form validation, password policy, rate limiting, lockout, MFA, and account recovery are not executable AUTH-001 tests. | Those behaviors remain outside AUTH-001 unless future requirements explicitly link them to entry-shell ownership. | AUTH-001-US-010 |

## Summary

- User Stories Processed: 10
- Executable Test Cases: 11
- Requirement Clarification Cases: 3
- Manual Cases: 0
- Traceability Verification Cases: 4
- Total Cases: 18

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0; AUTH-001 defines no owned API endpoint.
- Generic Executable Wording = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Security Assumption Violations = 0
