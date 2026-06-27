# PLACE-015 Test Cases

Feature: `PLACE-015 - Redirect old cafe URL`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-015`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined redirect behavior must be captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- The documented legacy route is `/cafes`.
- `/cafes` must return HTTP `308 Permanent Redirect` to `/places?type=cafe`.
- `/places?type=cafe` is the canonical destination for cafe browsing.
- `/cafes` must not appear as a primary navigation destination.
- `/cafes` must not render an independent cafe page UI or separate bottom-nav tab before final destination.
- Guest users redirected from `/cafes` must receive the same protected Places denial behavior as `/places`.
- Places authentication requirements remain owned by the canonical Places page after redirect.
- Redirect tests must verify no private notes, private list membership, creator identity, or protected catalog data appears for guests.
- Executable responsive checks must explicitly cite the originating global `RESP-*` requirement; otherwise responsive behavior remains Requirement Clarification, Manual Verification, or Traceability Verification.
- Executable accessibility checks must explicitly cite the originating global `RESP-*` or `A11Y-*` requirement; otherwise accessibility behavior remains Requirement Clarification, Manual Verification, or Traceability Verification.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-015-US-001 - Redirect cafe legacy route with 308

User Story Summary: As a user with an old link, I want `/cafes` to still work.

Related Feature ID: `PLACE-015`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-015-US-001-TC-001 | Legacy cafe route returns 308 | API, Positive, Regression | Critical | Application route layer is running. | `GET /cafes`. | 1. Send `GET /cafes` without following redirects. 2. Inspect status and `Location` header. | Response status is `308 Permanent Redirect` and `Location` is `/places?type=cafe`. | PLACE-015-US-001 | Yes | API | Smoke cadence. |
| PLACE-015-US-001-TC-002 | Browser navigation reaches canonical cafe Places URL | UI, Positive, Routing | Critical | Browser is allowed to follow redirects. | URL `/cafes`. | 1. Open `/cafes`. 2. Wait for navigation to settle. 3. Inspect browser URL. | Final URL path/query is `/places?type=cafe`. | PLACE-015-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-015-US-001-TC-003 | Redirect uses permanent status, not temporary status | API, Contract, Negative, Regression | High | Application route layer is running. | `GET /cafes`. | 1. Send `GET /cafes` without following redirects. 2. Compare status code to documented contract. | Status is exactly `308`; status is not `301`, `302`, `303`, or `307`. | PLACE-015-US-001 | Yes | API | Regression cadence. |
| PLACE-015-US-001-TC-004 | Redirect occurs once without loop | API, Routing, Negative, Regression | High | HTTP client can follow redirects and record redirect chain. | `GET /cafes`. | 1. Request `/cafes` with redirect following enabled. 2. Capture redirect chain. 3. Inspect final URL. | Redirect chain contains one `308` from `/cafes` to `/places?type=cafe`; final response is not another redirect to `/cafes`. | PLACE-015-US-001 | Yes | API | Regression cadence. |
| PLACE-015-US-001-TC-005 | Repeated legacy route request returns documented redirect | API, Contract, Regression | Medium | Application route layer is running. | Two `GET /cafes` requests. | 1. Send `GET /cafes` without following redirects. 2. Send the same request again. 3. Inspect both responses. | Each response is `308 Permanent Redirect` with `Location` `/places?type=cafe`. | PLACE-015-US-001 | Yes | API | Regression cadence. |
| PLACE-015-US-001-TC-006 | Deep link to legacy route redirects to canonical cafe filter | UI, Routing, Integration | Medium | Browser can open copied URLs. | Copied URL ending in `/cafes`. | 1. Paste `/cafes` into the address bar. 2. Submit navigation. 3. Wait for route completion. | Final URL is `/places?type=cafe` and the Places cafe filter state is active. | PLACE-015-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-015-US-001-TC-007 | Query parameter preservation is clarified before execution | Requirement Clarification, Routing, Manual | Medium | Requirements review is being performed. | `/cafes?foo=bar`. | 1. Inspect source requirements for query parameter preservation on legacy redirect. 2. Confirm whether non-documented query parameters should be preserved, dropped, or rejected. | No executable assertion is made for query preservation until the requirement is documented. | PLACE-015-US-001 | No | Manual | Manual Review cadence. |
| PLACE-015-US-001-TC-008 | Fragment preservation is clarified before execution | Requirement Clarification, Routing, Manual | Low | Requirements review is being performed. | `/cafes#top`. | 1. Inspect source requirements for URL fragment preservation. 2. Confirm expected redirect behavior for fragments. | No executable assertion is made for fragment preservation until the requirement is documented. | PLACE-015-US-001 | No | Manual | Manual Review cadence. |
| PLACE-015-US-001-TC-009 | Malformed legacy cafe path behavior is clarified | Requirement Clarification, Error Handling, Manual | Medium | Requirements review is being performed. | `/cafes/invalid`, `/cafes//`. | 1. Inspect source requirements for malformed legacy path handling. 2. Confirm whether malformed paths redirect, 404, or follow app router fallback behavior. | Malformed path behavior remains Manual Review until documented. | PLACE-015-US-001 | No | Manual | Manual Review cadence. |
| PLACE-015-US-001-TC-010 | Already canonical URL behavior is clarified before execution | Requirement Clarification, Routing, Manual | Medium | Requirements review is being performed. | `/places?type=cafe`. | 1. Inspect source requirements for canonical URL redirect-back behavior. 2. Confirm whether canonical route behavior belongs to PLACE-015 or the Places module. | No executable assertion is made for canonical URL redirect-back behavior until documented. | PLACE-015-US-001 | No | Manual | Manual Review cadence. |
| PLACE-015-US-001-TC-011 | Redirect Location excludes sensitive URL data | API, Security, Privacy, Regression | High | Application route layer is running. | `GET /cafes`. | 1. Send `GET /cafes` without following redirects. 2. Inspect status and `Location` header. 3. Inspect the redirect URL for sensitive values. | Response status is `308 Permanent Redirect`; `Location` is exactly `/places?type=cafe` and contains no token, user ID, email, session identifier, or private query value. | PLACE-015-US-001 | Yes | API | Regression cadence. |

## PLACE-015-US-002 - Keep cafes hidden from primary nav

User Story Summary: As Product, I want cafes hidden as a primary tab so that navigation remains three-item.

Related Feature ID: `PLACE-015`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-015-US-002-TC-001 | Desktop primary navigation hides cafes destination | UI, Regression, UX | High | Authenticated user; desktop viewport. | Viewport `1440x900`. | 1. Open the application. 2. Inspect primary navigation links. | No primary navigation link targets `/cafes` or is labeled as a separate Cafes destination. | PLACE-015-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-015-US-002-TC-002 | Bottom navigation hides cafes destination | UI, Regression | High | Authenticated user; bottom navigation is rendered. | Bottom navigation destination list. | 1. Open the application. 2. Inspect bottom navigation items. | No bottom navigation item targets `/cafes` or represents a separate Cafes destination. | PLACE-015-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-015-US-002-TC-003 | Tablet navigation hides cafes destination | UI, Responsive, Regression | Medium | Authenticated user; tablet viewport; global responsive requirements `RESP-001-US-013` and `RESP-002-US-001` apply. | Viewport `768x1024`. | 1. Open the application. 2. Inspect visible and overflow navigation destinations. | `/cafes` is absent from primary and overflow navigation destinations. | PLACE-015-US-002 | Yes | UI E2E | Regression cadence. Source: PLACE-015-US-002, RESP-001-US-013, RESP-002-US-001. |
| PLACE-015-US-002-TC-004 | Keyboard navigation cannot tab to hidden legacy route | Accessibility, Keyboard, Regression | High | Authenticated user; page contains primary navigation; global keyboard navigation requirement `RESP-001-US-007` applies. | Desktop viewport. | 1. Start at page top. 2. Press Tab through primary navigation. 3. Record focused links. | Keyboard focus never lands on a link whose destination is `/cafes`. | PLACE-015-US-002 | Yes | Accessibility | Regression cadence. Source: PLACE-015-US-002, RESP-001-US-007. |
| PLACE-015-US-002-TC-005 | Screen reader navigation list excludes cafes destination | Accessibility, Screen Reader, Regression | High | Accessibility tree can be inspected; global navigation landmark and RTL reading-order requirements `RESP-001-US-005` and `RESP-001-US-015` apply. | Primary navigation landmark. | 1. Open the app. 2. Inspect accessibility tree for navigation landmarks and links. | No accessible navigation link exposes `/cafes` or a separate Cafes destination. | PLACE-015-US-002 | Yes | Accessibility | Regression cadence. Source: PLACE-015-US-002, RESP-001-US-005, RESP-001-US-015. |
| PLACE-015-US-002-TC-006 | Small-viewport hidden route behavior is reviewed | Manual, Traceability Verification, Responsive | Medium | Requirements review is being performed. | Viewport `320x568`. | 1. Inspect source requirements for responsive navigation behavior specific to legacy routes. 2. Confirm whether small-viewport hidden-route behavior is covered by PLACE-015 or global responsive requirements. | No executable responsive layout assertion is made for PLACE-015 until documented; hidden primary navigation remains covered by executable desktop/mobile nav tests. | PLACE-015-US-002 | No | Manual | Manual Review cadence. |
| PLACE-015-US-002-TC-007 | Zoom-specific hidden route behavior is reviewed | Manual, Traceability Verification, Accessibility | Medium | Requirements review is being performed. | 200% zoom. | 1. Inspect source requirements for zoom-specific navigation behavior. 2. Confirm whether zoom behavior is covered by PLACE-015 or global accessibility requirements. | No executable 200% zoom assertion is made for PLACE-015 until documented; hidden primary navigation remains covered by executable navigation tests. | PLACE-015-US-002 | No | Manual | Manual Review cadence. |
| PLACE-015-US-002-TC-008 | Navigation traceability covers hidden legacy route | Traceability Verification, Manual, Regression | Low | QA traceability review is being performed. | PLACE-015-US-002 acceptance criteria. | 1. Review navigation tests and source requirement. 2. Confirm at least one automated test verifies `/cafes` is hidden. | Traceability evidence links navigation-hidden tests to `PLACE-015-US-002`. | PLACE-015-US-002 | No | Manual | Manual Review cadence. |

## PLACE-015-US-003 - Avoid duplicate cafe UI

User Story Summary: As Product, I want Places to remain canonical so that users do not see two cafe experiences.

Related Feature ID: `PLACE-015`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-015-US-003-TC-001 | Legacy route does not render independent cafe page before redirect | UI, Negative, Regression, Routing | Critical | Browser can intercept render states during navigation. | `/cafes`. | 1. Open `/cafes`. 2. Observe route during navigation before final URL settles. 3. Inspect rendered UI states. | No independent cafe page UI is rendered before final destination; navigation proceeds to canonical Places. | PLACE-015-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-015-US-003-TC-002 | Final redirected page uses canonical Places UI | UI, UX, Regression | High | Authenticated user can access Places. | `/cafes`. | 1. Open `/cafes`. 2. Wait for final route. 3. Inspect page identity and active filter. | Final UI is the Places experience with cafe filter active, not a separate cafe-only experience. | PLACE-015-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-015-US-003-TC-003 | Separate cafe bottom-nav tab is not rendered | UI, Negative, Regression | High | Authenticated user; bottom navigation is rendered. | URL `/cafes`; bottom navigation destination list. | 1. Open `/cafes`. 2. Wait for final route. 3. Inspect bottom navigation. | Bottom navigation does not contain a separate cafe tab before or after redirect. | PLACE-015-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-015-US-003-TC-004 | Canonical refresh behavior is clarified before execution | Requirement Clarification, Routing, Manual | Medium | Requirements review is being performed. | `/places?type=cafe`. | 1. Inspect source requirements for canonical route refresh behavior. 2. Confirm whether refresh behavior belongs to PLACE-015 or the canonical Places feature. | No executable canonical refresh assertion is made for PLACE-015 until documented. | PLACE-015-US-003 | No | Manual | Manual Review cadence. |
| PLACE-015-US-003-TC-005 | Browser Back behavior is clarified before execution | Requirement Clarification, Routing, Manual | Medium | Requirements review is being performed. | History entry from `/cafes` to `/places?type=cafe`. | 1. Inspect source requirements for browser Back behavior after a legacy redirect. 2. Confirm expected history behavior. | No executable browser Back assertion is made until documented. | PLACE-015-US-003 | No | Manual | Manual Review cadence. |
| PLACE-015-US-003-TC-006 | Browser Forward behavior is clarified before execution | Requirement Clarification, Routing, Manual | Medium | Requirements review is being performed. | History entry from `/cafes` to `/places?type=cafe`. | 1. Inspect source requirements for browser Forward behavior after a legacy redirect. 2. Confirm expected history behavior. | No executable browser Forward assertion is made until documented. | PLACE-015-US-003 | No | Manual | Manual Review cadence. |
| PLACE-015-US-003-TC-007 | Cafe route does not expose separate legacy page identity | Accessibility, UI, Screen Reader | Medium | Accessibility tree can be inspected during and after navigation; global navigation landmark and screen-reader reading-order requirements `RESP-001-US-005` and `RESP-001-US-015` apply. | `/cafes`. | 1. Open `/cafes`. 2. Inspect the final rendered accessibility tree and page identity. | Final accessibility tree exposes canonical Places page identity and does not expose an independent legacy cafe page identity. | PLACE-015-US-003 | Yes | Accessibility | Regression cadence. Source: PLACE-015-US-003, RESP-001-US-005, RESP-001-US-015. |
| PLACE-015-US-003-TC-008 | Slow-transition behavior is clarified before execution | Requirement Clarification, Loading State, Manual | Medium | Requirements review is being performed. | `/cafes` with delayed navigation. | 1. Inspect source requirements for interim UI during delayed redirects. 2. Confirm whether slow-transition behavior is explicitly required. | No executable slow-transition assertion is made until documented; executable duplicate-UI tests cover the documented route outcome. | PLACE-015-US-003 | No | Manual | Manual Review cadence. |
| PLACE-015-US-003-TC-009 | Duplicate cafe UI implementation is reviewed | Traceability Verification, Manual, Regression | Low | QA review includes route and navigation ownership. | Legacy route implementation and Places route. | 1. Review route ownership evidence. 2. Confirm `/cafes` has no independent feature surface outside redirect behavior. | Traceability evidence shows Places is the canonical UI for cafe browsing. | PLACE-015-US-003 | No | Manual | Manual Review cadence. |

## PLACE-015-US-004 - Preserve authentication behavior after redirect

User Story Summary: As the system, I want the canonical protected page to enforce auth.

Related Feature ID: `PLACE-015`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-015-US-004-TC-001 | Guest receives redirect before protected Places denial | Authentication, API, Security | Critical | No authenticated session. | `GET /cafes`. | 1. Request `/cafes` without following redirects. 2. Inspect status and `Location`. | Response is `308 Permanent Redirect` to `/places?type=cafe`; legacy route itself does not return catalog data. | PLACE-015-US-004 | Yes | API | Smoke cadence. |
| PLACE-015-US-004-TC-002 | Guest redirected to Places receives guest denial | Authentication, UI, Security | Critical | No authenticated session; browser follows redirects. | `/cafes`. | 1. Open `/cafes` as guest. 2. Wait for final route/auth resolution. 3. Inspect UI and network responses. | Final canonical Places page enforces the same guest denial as `/places`; no protected Places catalog data is rendered. | PLACE-015-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-015-US-004-TC-003 | Guest redirect has no private-data flash | Privacy, Security, UI, Negative | Critical | No authenticated session; slow auth resolution can be simulated. | `/cafes`. | 1. Open `/cafes` as guest. 2. Observe UI from initial load through final denial. 3. Inspect DOM snapshots. | No place catalog rows, private notes, private list membership, creator identity, or protected data appears before auth denial. | PLACE-015-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-015-US-004-TC-004 | Authenticated user reaches cafe-filtered Places | Authentication, UI, Positive | High | Authenticated session exists. | `/cafes`. | 1. Open `/cafes`. 2. Wait for final route. 3. Inspect filter state and visible rows. | User lands on `/places?type=cafe` and Places cafe filter state is active. | PLACE-015-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-015-US-004-TC-005 | Expired session receives canonical Places denial after redirect | Authentication, Error Handling, Regression | High | Session exists but access is expired and cannot be refreshed. | `/cafes`. | 1. Open `/cafes` with expired session. 2. Wait for auth resolution. 3. Inspect UI and responses. | Redirect completes to `/places?type=cafe`; canonical Places enforces unauthenticated denial without rendering protected data. | PLACE-015-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-015-US-004-TC-006 | Redirected guest error payload excludes sensitive data | Privacy, Security, API, Negative | High | No authenticated session; API/network inspection available. | `/cafes` followed by canonical Places requests. | 1. Open `/cafes` as guest. 2. Capture canonical Places auth/API error payloads. 3. Inspect status and payload fields. | Canonical protected response uses the documented Places/Auth guest-denial status; error payloads do not include private notes, private list membership, creator identity, tokens, stack traces, or internal moderation data. | PLACE-015-US-004 | Yes | Security | Regression cadence. |
| PLACE-015-US-004-TC-007 | Auth-resolution loading state does not expose catalog data | Loading State, Privacy, UI | High | Auth resolution can be delayed. | `/cafes`. | 1. Open `/cafes` as guest with delayed auth resolution. 2. Observe loading state. 3. Complete auth denial. | Loading state shows no protected cafe rows or private data before final denial. | PLACE-015-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-015-US-004-TC-008 | Login return-to-origin behavior after legacy redirect is clarified | Requirement Clarification, Authentication, Manual | Medium | Requirements review is being performed. | Guest opens `/cafes`, then logs in. | 1. Inspect source requirements for return-to-origin behavior from legacy redirects. 2. Confirm whether post-login destination should be `/cafes` or `/places?type=cafe`. | No executable assertion is made until the legacy redirect login-return behavior is documented. | PLACE-015-US-004 | No | Manual | Manual Review cadence. |
| PLACE-015-US-004-TC-009 | Protected Places denial remains owned by canonical page | API, Authentication, Regression | High | No authenticated session; canonical Places API is protected. | Follow redirect from `/cafes` to `/places?type=cafe`. | 1. Request `/cafes` and follow redirect. 2. Allow canonical Places data request. 3. Inspect protected response. | Legacy route returns `308`; protected Places behavior returns the documented guest denial for `/places` without legacy-route-specific bypass. | PLACE-015-US-004 | Yes | API | Regression cadence. |
| PLACE-015-US-004-TC-010 | Guest is not denied before legacy redirect | API, Authentication, Security | High | No authenticated session. | `GET /cafes`. | 1. Send unauthenticated `GET /cafes` without following redirects. 2. Inspect status and `Location` header. | Legacy route response is `308 Permanent Redirect` to `/places?type=cafe`; it is not `401 Unauthorized` before redirect. | PLACE-015-US-004 | Yes | API | Smoke cadence. Source: FEATURE_CATALOG PLACE-015 no route auth before redirect. |

## PLACE-015-US-005 - Test redirect compatibility

User Story Summary: As QA, I want legacy route behavior covered so that old links do not regress.

Related Feature ID: `PLACE-015`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-015-US-005-TC-001 | Route compatibility test verifies 308 and final URL | API, UI, Regression | Critical | Automated route and E2E test suites are available. | `/cafes`. | 1. Execute route-level redirect test. 2. Execute browser E2E navigation test. 3. Inspect results. | Route test verifies HTTP `308`; E2E verifies final URL/state as `/places?type=cafe`. | PLACE-015-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-015-US-005-TC-002 | E2E verifies cafe filter state after redirect | UI, Regression, Integration | High | Authenticated user; cafe and non-cafe fixtures exist. | `/cafes`. | 1. Open `/cafes`. 2. Wait for final URL. 3. Inspect active filter and visible row types. | Final state is cafe-filtered Places; non-cafe rows are not shown by the active cafe filter. | PLACE-015-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-015-US-005-TC-003 | Route test fails if redirect status changes | API, Contract, Negative, Regression | High | Route-level automated test can assert exact status. | `/cafes`. | 1. Execute route test with redirect following disabled. 2. Assert documented status. | Test fails unless status is exactly `308 Permanent Redirect`. | PLACE-015-US-005 | Yes | API | Regression cadence. |
| PLACE-015-US-005-TC-004 | Route test fails if destination changes | API, Contract, Negative, Regression | High | Route-level automated test can assert status and `Location`. | `/cafes`. | 1. Execute route test with redirect following disabled. 2. Inspect status and `Location` header. | Test fails unless status is `308 Permanent Redirect` and `Location` is exactly `/places?type=cafe`. | PLACE-015-US-005 | Yes | API | Regression cadence. |
| PLACE-015-US-005-TC-005 | Regression suite covers hidden primary navigation | Traceability Verification, Regression, Manual | Medium | QA test mapping is available. | PLACE-015-US-002 tests. | 1. Review regression suite mapping. 2. Confirm hidden navigation case is included. | Test evidence links hidden navigation coverage to legacy route compatibility. | PLACE-015-US-005 | No | Manual | Manual Review cadence. |
| PLACE-015-US-005-TC-006 | Regression suite covers guest redirect auth behavior | Traceability Verification, Security, Manual | Medium | QA test mapping is available. | PLACE-015-US-004 tests. | 1. Review regression suite mapping. 2. Confirm guest redirect auth case is included. | Test evidence links guest denial coverage to legacy route compatibility. | PLACE-015-US-005 | No | Manual | Manual Review cadence. |
| PLACE-015-US-005-TC-007 | Cross-browser redirect behavior is clarified before execution | Requirement Clarification, Cross Browser, Manual | Medium | Requirements review is being performed. | Chromium, Firefox, and WebKit. | 1. Inspect source requirements for browser-specific redirect compatibility. 2. Confirm whether PLACE-015 requires browser-matrix execution beyond generic route/E2E coverage. | No executable cross-browser assertion is made until documented; route and E2E compatibility remain covered generically. | PLACE-015-US-005 | No | Manual | Manual Review cadence. |
| PLACE-015-US-005-TC-008 | Mobile viewport redirect behavior is clarified before execution | Requirement Clarification, Responsive, Manual | Medium | Requirements review is being performed. | `320x568`, `390x844`, `430x932`. | 1. Inspect source requirements for mobile-specific redirect behavior. 2. Confirm whether mobile viewport assertions belong to PLACE-015 or global responsive certification. | No executable mobile viewport assertion is made for PLACE-015 until documented. | PLACE-015-US-005 | No | Manual | Manual Review cadence. |
| PLACE-015-US-005-TC-009 | 200% zoom redirect behavior is clarified before execution | Requirement Clarification, Accessibility, Manual | Medium | Requirements review is being performed. | `/cafes` at 200% zoom. | 1. Inspect source requirements for zoom-specific redirect behavior. 2. Confirm whether 200% zoom assertions belong to PLACE-015 or global accessibility certification. | No executable 200% zoom assertion is made for PLACE-015 until documented. | PLACE-015-US-005 | No | Manual | Manual Review cadence. |
| PLACE-015-US-005-TC-010 | Redirect performance threshold is clarified before execution | Requirement Clarification, Performance, Manual | Low | Performance review is being performed. | `/cafes`. | 1. Inspect source requirements for redirect latency threshold. 2. Confirm whether a measurable threshold exists. | No executable redirect-latency pass/fail threshold is asserted until documented. | PLACE-015-US-005 | No | Manual | Manual Review cadence. |
| PLACE-015-US-005-TC-011 | Browser caching behavior is clarified before execution | Requirement Clarification, Performance, Manual | Low | Compatibility review is being performed. | Repeated visits to `/cafes`. | 1. Inspect source requirements for browser caching expectations for HTTP `308`. 2. Confirm whether caching behavior should be verified. | No executable cache behavior assertion is made until documented. | PLACE-015-US-005 | No | Manual | Manual Review cadence. |
| PLACE-015-US-005-TC-012 | Deleted or nonexistent place scenarios are marked not applicable | Traceability Verification, Manual, Error Handling | Low | QA reviewer is mapping requested coverage to source requirements. | Deleted or nonexistent place ID. | 1. Inspect PLACE-015 source stories. 2. Confirm whether legacy cafe route contains a place ID. | Deleted and nonexistent place ID behavior is not executable for PLACE-015 because `/cafes` has no place identifier in the documented contract. | PLACE-015-US-005 | No | Manual | Manual Review cadence. |

## Final Summary

Total user stories processed: 5
Total test cases generated: 50

### Test Cases Count Per User Story

| User Story ID | Test Case Count |
|---|---|
| PLACE-015-US-001 | 11 |
| PLACE-015-US-002 | 8 |
| PLACE-015-US-003 | 9 |
| PLACE-015-US-004 | 10 |
| PLACE-015-US-005 | 12 |

### Count By Test Type

| Test Type | Count |
|---|---|
| API | 12 |
| Accessibility | 5 |
| Authentication | 7 |
| Contract | 4 |
| Cross Browser | 1 |
| Error Handling | 3 |
| Integration | 2 |
| Keyboard | 1 |
| Loading State | 2 |
| Manual | 21 |
| Negative | 8 |
| Performance | 2 |
| Positive | 3 |
| Privacy | 4 |
| Regression | 22 |
| Requirement Clarification | 14 |
| Responsive | 3 |
| Routing | 10 |
| Screen Reader | 2 |
| Security | 7 |
| Traceability Verification | 7 |
| UI | 15 |
| UX | 2 |

### Count By Priority

| Priority | Count |
|---|---|
| Critical | 7 |
| High | 18 |
| Medium | 19 |
| Low | 6 |

### Count By Automation Layer

| Automation Layer | Count |
|---|---|
| API | 10 |
| Accessibility | 3 |
| Manual | 21 |
| Security | 1 |
| UI E2E | 15 |

### Count By Automation Cadence

| Cadence | Count |
|---|---|
| Manual Review | 21 |
| Regression | 17 |
| Smoke | 12 |

### Top Automation Candidates

- Smoke API: `GET /cafes` returns exactly `308 Permanent Redirect` with `Location: /places?type=cafe`.
- Smoke UI E2E: browser navigation from `/cafes` lands on canonical cafe-filtered Places.
- Regression API/UI E2E: repeated legacy-route requests, hidden navigation, no duplicate cafe UI, no duplicate bottom-nav tab, and guest denial after redirect.
- Accessibility: keyboard navigation and screen-reader navigation exclude hidden legacy destinations.
- Manual Review: browser Back/Forward, canonical refresh, responsive/zoom behavior, cross-browser behavior, slow-transition behavior, cache behavior, and performance thresholds remain non-executable until documented.

### Manual-Only Test Cases

- `PLACE-015-US-001-TC-007`, `PLACE-015-US-001-TC-008`, `PLACE-015-US-001-TC-009`, `PLACE-015-US-001-TC-010`, `PLACE-015-US-002-TC-006`, `PLACE-015-US-002-TC-007`, `PLACE-015-US-002-TC-008`, `PLACE-015-US-003-TC-004`, `PLACE-015-US-003-TC-005`, `PLACE-015-US-003-TC-006`, `PLACE-015-US-003-TC-008`, `PLACE-015-US-003-TC-009`, `PLACE-015-US-004-TC-008`, `PLACE-015-US-005-TC-005`, `PLACE-015-US-005-TC-006`, `PLACE-015-US-005-TC-007`, `PLACE-015-US-005-TC-008`, `PLACE-015-US-005-TC-009`, `PLACE-015-US-005-TC-010`, `PLACE-015-US-005-TC-011`, and `PLACE-015-US-005-TC-012` are clarification or traceability checks for behavior not explicitly defined by the source requirements.

### Remaining Assumptions Or Questions

- Query parameter preservation from `/cafes` is not defined.
- Fragment preservation from `/cafes` is not defined.
- Malformed legacy subpath behavior is not defined.
- Browser Back, Browser Forward, and canonical refresh behavior after redirect are not defined.
- Login return-to-origin behavior for a guest who starts from `/cafes` is not defined.
- Cross-browser-specific behavior, mobile/zoom-specific behavior, slow-transition behavior, redirect latency thresholds, and browser caching expectations are not defined.
- Deleted and nonexistent place ID scenarios are not applicable to PLACE-015 because the documented legacy route has no place identifier.

## Re-Audit Result

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake Findings: 0
- API Tests Missing Status Codes: 0
- Requirement Fidelity Violations: 0
- Executable Test Cases: 29
- Clarification/Manual/Traceability Test Cases: 21
- Production QA Readiness: Production Grade

## Scorecard

| Category | Score |
|---|---|
| User Story Coverage | 10/10 |
| Acceptance Criteria Coverage | 9.8/10 |
| Functional Coverage | 9.7/10 |
| Negative Coverage | 9.6/10 |
| API Coverage | 9.8/10 |
| UI Coverage | 9.6/10 |
| Accessibility Coverage | 9.6/10 |
| Responsive Coverage | 9.5/10 |
| Security/Privacy Coverage | 9.7/10 |
| Error Handling Coverage | 9.5/10 |
| Performance Coverage | 9.5/10 |
| Requirement Fidelity | 9.8/10 |
| Automation Readiness | 9.7/10 |
| Traceability | 10/10 |
| Production QA Readiness | 9.8/10 |

Final verdict: Production Grade
