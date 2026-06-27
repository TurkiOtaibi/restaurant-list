# PUBLIC-003 Test Cases - Hide private lists from non-owners

## Source Requirements

- Feature: `PUBLIC-003 - Hide private lists from non-owners`
- Sources: `PUBLIC_LISTS_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- Endpoints under PUBLIC-003 verification: `GET /api/v1/lists/public`, `GET /api/v1/lists/public/{id}`
- Documented public-route statuses used by executable tests: `200 OK`, `401 Unauthorized`, `404 Not Found`
- User stories processed: `PUBLIC-003-US-001` through `PUBLIC-003-US-012`
- Error body note: the allowed source documents denial status codes and forbidden private fields, but does not define required error-body field names. Executable tests therefore assert documented status and forbidden-field absence; exact denial error schema is tracked as Requirement Clarification.

## Deterministic Fixtures

### Fixture PUBLIC-003-A - Mixed Visibility Index

- Authenticated requester: `user-public-003`
- Authenticated state: valid bearer session `bearer-public-003`
- Request: `GET /api/v1/lists/public?limit=20&offset=0`
- Payload: none
- Public list eligible for index:
  - `id=public-list-003-001`
  - `listName=قائمة عامة`
  - `visibility=public`
  - `ownerDisplayName=Sara Public`
  - `placeCount=2`
  - place ids: `place-public-003-001`, `place-public-003-002`
- Private list in same database state:
  - `id=private-list-003-001`
  - `listName=قائمة خاصة`
  - `visibility=private`
  - `ownerDisplayName=Private Owner Canary`
  - `ownerEmail=private-owner-003@example.test`
  - `internalOwnerId=user-owner-private-003`
  - `placeCount=3`
  - place ids: `place-private-003-001`, `place-private-003-002`, `place-private-003-003`
  - membership ids: `membership-private-003-001`, `membership-private-003-002`, `membership-private-003-003`
  - private note canary: `private-note-public-003`
- Expected index response:
  - Status `200 OK`
  - `items` contains `public-list-003-001`
  - `items` excludes `private-list-003-001`
  - Response and UI exclude every private-list canary listed above.

### Fixture PUBLIC-003-B - Private Detail Denial

- Authenticated requester: `user-public-003`
- Authenticated state: valid bearer session `bearer-public-003`
- Request: `GET /api/v1/lists/public/private-list-003-001`
- Payload: none
- Expected documented response: `404 Not Found`
- Required response fields: none documented by the allowed source.
- Forbidden response/UI/accessibility-tree fields:
  - `private-list-003-001`
  - `قائمة خاصة`
  - `Private Owner Canary`
  - `private-owner-003@example.test`
  - `user-owner-private-003`
  - `placeCount=3`
  - `visibility=private`
  - `place-private-003-001`, `place-private-003-002`, `place-private-003-003`
  - `membership-private-003-001`, `membership-private-003-002`, `membership-private-003-003`
  - `private-note-public-003`
  - stack traces, debug fields, internal policy details, hidden metadata.

### Fixture PUBLIC-003-C - Missing Detail Denial

- Authenticated requester: `user-public-003`
- Authenticated state: valid bearer session `bearer-public-003`
- Request: `GET /api/v1/lists/public/missing-list-003-001`
- Payload: none
- Expected documented response: `404 Not Found`
- Required response fields: none documented by the allowed source.
- Forbidden response/UI/accessibility-tree fields: same private-list canaries from Fixture PUBLIC-003-B.
- Shape comparison rule for executable tests: compare only documented observable properties: status is `404 Not Found` and forbidden private fields are absent. Exact error-body field names are not asserted.

### Fixture PUBLIC-003-D - Guest Denial

- Requester: none
- Authenticated state: no valid session
- Requests:
  - `GET /api/v1/lists/public?limit=20&offset=0`
  - `GET /api/v1/lists/public/private-list-003-001`
  - `GET /api/v1/lists/public/missing-list-003-001`
- Payload: none
- Expected documented response for each request: `401 Unauthorized`
- Forbidden response/UI/accessibility-tree fields: whether a list exists, whether it is private, list names, owner metadata, place counts, places, memberships, notes, visibility, stack traces, debug fields, internal policy details.

### Fixture PUBLIC-003-E - Public-To-Private End State

- Owner: `user-owner-public-003`
- Requester: `user-public-003`
- Requester state: valid bearer session `bearer-public-003`
- Before state:
  - `public-list-003-001`: `visibility=public`, `listName=قائمة عامة`, `ownerDisplayName=Sara Public`, `placeCount=2`
  - Public detail URL was previously renderable at `/lists/public/public-list-003-001`
- After state:
  - `public-list-003-001`: `visibility=private`
  - `public-list-003-002`: `visibility=public`, `listName=أماكن عامة`, `ownerDisplayName=Omar Public`, `placeCount=1`
- Requests after visibility change:
  - Index request: `GET /api/v1/lists/public?limit=20&offset=0`
  - Detail request: `GET /api/v1/lists/public/public-list-003-001`
- Expected end state:
  - Index response `200 OK`
  - Index `items` contains exactly `public-list-003-002` from this fixture and omits `public-list-003-001`
  - Detail response for `public-list-003-001` is `404 Not Found`
  - Response/UI/accessibility tree expose no private metadata for `public-list-003-001`.

### Fixture PUBLIC-003-F - Private-To-Public End State

- Owner: `user-owner-private-003`
- Requester: `user-public-003`
- Requester state: valid bearer session `bearer-public-003`
- Before state:
  - `private-list-003-001`: `visibility=private`, `listName=قائمة خاصة`, `ownerDisplayName=Private Owner Canary`, `placeCount=3`
  - Index omits `private-list-003-001`
  - Detail request returns `404 Not Found`
- After state:
  - `private-list-003-001`: `visibility=public`, `listName=قائمة عامة جديدة`, `ownerDisplayName=Private Owner Canary`, `placeCount=3`, `updatedAt=2026-06-13T10:00:00Z`, `createdAt=2026-06-01T10:00:00Z`
  - `public-list-003-002`: `visibility=public`, `listName=أماكن عامة`, `ownerDisplayName=Omar Public`, `placeCount=1`, `updatedAt=2026-06-12T10:00:00Z`, `createdAt=2026-06-01T10:00:00Z`
- Requests after visibility change:
  - Index request: `GET /api/v1/lists/public?limit=20&offset=0`
  - Detail request: `GET /api/v1/lists/public/private-list-003-001`
- Expected end state:
  - Index response `200 OK`
  - Index ordered ids are `private-list-003-001`, then `public-list-003-002`
  - Detail response for `private-list-003-001` is `200 OK`
  - Response/UI expose only public-safe data after the list is public.

### Fixture PUBLIC-003-G - Stale Cached Detail

- Requester: `user-public-003`
- Requester state: valid bearer session `bearer-public-003`
- Before state:
  - Browser route `/lists/public/public-list-003-001` previously rendered public detail with `listName=قائمة عامة`, `ownerDisplayName=Sara Public`, `placeCount=2`
- After state:
  - `public-list-003-001.visibility=private`
  - Revalidation request: `GET /api/v1/lists/public/public-list-003-001`
  - Revalidation response: `404 Not Found`
- Forbidden after revalidation:
  - `قائمة عامة`
  - `Sara Public`
  - `place-public-003-001`
  - `place-public-003-002`
  - `private-note-public-003`
  - private metadata, owner email, internal owner id, memberships.

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| PUBLIC-003-TC-001 | Public index excludes private list | Privacy, API | Critical | Fixture PUBLIC-003-A is active. | Request `GET /api/v1/lists/public?limit=20&offset=0`; payload none. | Request public index and render `/lists/public`. | API status is `200 OK`; `items` contains `public-list-003-001`; response and UI exclude `private-list-003-001`, `قائمة خاصة`, `Private Owner Canary`, `private-owner-003@example.test`, `user-owner-private-003`, private place ids, private membership ids, and `private-note-public-003`. | PUBLIC-003-US-001 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-002 | Private public-detail access returns 404 without list detail UI | Privacy, API | Critical | Fixture PUBLIC-003-B is active. | Request `GET /api/v1/lists/public/private-list-003-001`; payload none. | Request private list through public detail route and render `/lists/public/private-list-003-001`. | API status is `404 Not Found`; no list detail UI is rendered; DOM and accessibility tree exclude all Fixture PUBLIC-003-B forbidden fields. | PUBLIC-003-US-002 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-003 | Private 404 response contains no private metadata | Privacy, Security | Critical | Fixture PUBLIC-003-B is active. | Request `GET /api/v1/lists/public/private-list-003-001`; payload none; forbidden canaries from Fixture PUBLIC-003-B. | Request private detail and inspect API response, rendered DOM, and accessibility tree. | API status is `404 Not Found`; response, DOM, and accessibility tree exclude list id, list name, owner display name, email, internal owner id, place count, visibility, place ids, membership ids, notes, stack traces, debug fields, internal policy details, and private metadata. | PUBLIC-003-US-003, PUBLIC-003-US-009, PUBLIC-003-US-010, PUBLIC-003-US-012 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-004 | Owner private list remains public-route denied | Privacy, UI | High | Owner `user-owner-private-003` is authenticated and owns `private-list-003-001`. | Request `GET /api/v1/lists/public/private-list-003-001`; payload none. | Open `/lists/public/private-list-003-001` as owner. | API status is `404 Not Found`; public route shows no private list content; response, DOM, and accessibility tree exclude all Fixture PUBLIC-003-B forbidden fields. | PUBLIC-003-US-004 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-005 | Public-to-private removes public index and detail access | Privacy, Data Integrity | Critical | Fixture PUBLIC-003-E after state is active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; detail request `GET /api/v1/lists/public/public-list-003-001`; payload none. | Request public index, then request public detail for `public-list-003-001`. | Index response is `200 OK` and contains exactly `public-list-003-002` from this fixture; index omits `public-list-003-001`; detail response is `404 Not Found`; response/UI expose no private metadata for `public-list-003-001`. | PUBLIC-003-US-005 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-006 | Private-to-public adds public index and detail access | Positive, Data Integrity | High | Fixture PUBLIC-003-F after state is active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; detail request `GET /api/v1/lists/public/private-list-003-001`; payload none. | Refresh public index and open public detail for `private-list-003-001`. | Index response is `200 OK`; index ordered ids are `private-list-003-001`, then `public-list-003-002`; detail response is `200 OK`; detail UI shows `قائمة عامة جديدة`, `Private Owner Canary`, and place count `3` as public-safe data. | PUBLIC-003-US-006 | Yes | API, UI E2E |
| PUBLIC-003-TC-007 | Back navigation to stale public detail clears protected content | Privacy, UI | Critical | Fixture PUBLIC-003-G is active. | Revalidation request `GET /api/v1/lists/public/public-list-003-001`; expected `404 Not Found`; forbidden stale/private canaries from Fixture PUBLIC-003-G. | Navigate back to stale public detail and wait for revalidation. | Revalidation returns `404 Not Found`; previously visible list metadata and place rows are removed; DOM and accessibility tree never expose `قائمة عامة`, `Sara Public`, public place ids, private note canary, owner email, internal owner id, memberships, or private metadata after denial. | PUBLIC-003-US-007 | Yes | UI E2E, Security |
| PUBLIC-003-TC-008 | Guest denial precedes visibility exposure for index and detail | Security, Privacy | Critical | Fixture PUBLIC-003-D is active. | Guest index request, guest private detail request, and guest missing detail request; payload none for each. | Request all three routes without a valid session. | Each response is `401 Unauthorized`; responses, DOM, and accessibility tree do not reveal whether `private-list-003-001` exists, is private, or differs from missing id; no list names, owner metadata, place counts, places, memberships, notes, or visibility fields appear. | PUBLIC-003-US-008 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-009 | Public route never exposes private place membership | Privacy, API | Critical | Fixture PUBLIC-003-B is active. | Request `GET /api/v1/lists/public/private-list-003-001`; private place ids and membership ids from Fixture PUBLIC-003-B. | Request public detail for private list and inspect API response, DOM, and accessibility tree. | API status is `404 Not Found`; response, DOM, and accessibility tree exclude `place-private-003-001`, `place-private-003-002`, `place-private-003-003`, all membership ids, place count `3`, and membership records. | PUBLIC-003-US-009 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-010 | Public route never exposes private owner metadata | Privacy, API | Critical | Fixture PUBLIC-003-B is active. | Request `GET /api/v1/lists/public/private-list-003-001`; owner canaries `Private Owner Canary`, `private-owner-003@example.test`, `user-owner-private-003`. | Request public detail for private list and inspect API response, DOM, and accessibility tree. | API status is `404 Not Found`; response, DOM, and accessibility tree exclude owner display name, owner email, internal owner id, auth/session data, account metadata, stack traces, debug fields, and internal policy details. | PUBLIC-003-US-010 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-011 | Private and non-existent detail denials are indistinguishable by documented observables | Security, API | High | Fixtures PUBLIC-003-B and PUBLIC-003-C are active. | Private request `GET /api/v1/lists/public/private-list-003-001`; missing request `GET /api/v1/lists/public/missing-list-003-001`; payload none for both. | Request both detail URLs as the same authenticated user. | Both responses use `404 Not Found`; neither response, DOM, nor accessibility tree includes private list id, list name, owner display name, email, internal owner id, place count, visibility, place ids, membership ids, note canary, stack traces, debug fields, or internal policy details. | PUBLIC-003-US-011 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-012 | Regression test fails on any private-list leak through public routes | Regression, Security | High | Fixtures PUBLIC-003-A and PUBLIC-003-B are active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; private detail request `GET /api/v1/lists/public/private-list-003-001`; forbidden private canaries: `قائمة خاصة`, `Private Owner Canary`, `private-owner-003@example.test`, `user-owner-private-003`, `place-private-003-001`, `membership-private-003-001`, `private-note-public-003`. | Run public index and private-detail denial contract checks. | Test fails if any forbidden private canary appears in public index response, private-detail denial response, rendered DOM, or accessibility tree; valid public data such as `Sara Public` is allowed when attached to `public-list-003-001`. | PUBLIC-003-US-012 | Yes | API, UI E2E, Security |
| PUBLIC-003-TC-013 | Private denial states pass responsive viewport matrix | Responsive, Privacy | High | Fixtures PUBLIC-003-B and PUBLIC-003-D are active. | Viewports `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`; browsers Chromium, Firefox, WebKit. | Render private-detail `404` and guest `401` denial states at every viewport/browser combination. | For every combination, `document.documentElement.scrollWidth <= window.innerWidth`; denial message and navigation remain readable and operable; final interactive element is not covered by bottom navigation, safe-area padding, or browser UI; no private canary appears. | PUBLIC-003-US-003, PUBLIC-003-US-008, RESP-001-US-011, RESP-002-US-001, RESP-002-US-002, RESP-002-US-005, RESP-002-US-024 | Yes | UI E2E, Responsive, Security |
| PUBLIC-003-TC-014 | Private denial states work at 200% zoom | Responsive, Accessibility, Privacy | High | Fixtures PUBLIC-003-B, PUBLIC-003-D, and PUBLIC-003-G are active; browser zoom is `200%`. | Render private `404`, guest `401`, and stale-detail denial states at `390x844`; payload none for public-route requests. | Open each denial route at `200%` zoom and inspect layout. | `document.documentElement.scrollWidth <= window.innerWidth`; denial content, navigation, and available actions remain readable and reachable; no private/stale canary appears in DOM or accessibility tree. | PUBLIC-003-US-007, PUBLIC-003-US-008, RESP-003-US-001, RESP-003-US-002, RESP-003-US-003 | Yes | Accessibility, UI E2E, Security |
| PUBLIC-003-TC-015 | Denial routes are keyboard navigable with visible focus | Accessibility, Privacy | High | Fixtures PUBLIC-003-B and PUBLIC-003-D are active. | Routes `/lists/public/private-list-003-001`, `/lists/public/missing-list-003-001`, and `/lists/public`; keyboard input Tab, Shift+Tab, Enter. | Navigate each denial state using keyboard only. | Navigation controls and available recovery controls are reachable in logical order; `focus-visible` appears on each focused control; hidden/private list content is not reachable by keyboard or assistive technology. | PUBLIC-003-US-003, PUBLIC-003-US-008, RESP-001-US-007, RESP-001-US-008 | Yes | Accessibility, UI E2E, Security |
| PUBLIC-003-TC-016 | Denial routes expose privacy-safe screen-reader output | Accessibility, Privacy | High | Fixtures PUBLIC-003-B, PUBLIC-003-C, and PUBLIC-003-D are active. | Private detail `404`, missing detail `404`, and guest `401` states. | Inspect accessibility tree for each denial state. | Accessible names/descriptions identify only the safe denial state and navigation/recovery purpose; accessibility tree excludes list names, owner metadata, place counts, visibility, places, memberships, notes, hidden metadata, and obsolete hidden destinations. | PUBLIC-003-US-003, PUBLIC-003-US-008, PUBLIC-003-US-011, RESP-001-US-005, RESP-001-US-006, RESP-001-US-015 | Yes | Accessibility, Security |
| PUBLIC-003-TC-017 | Denial route touch targets meet 44x44 minimum | Accessibility, Mobile | High | Fixtures PUBLIC-003-B and PUBLIC-003-D are active. | Viewports `320x568`, `390x844`, `430x932`; denial navigation controls and bottom navigation controls. | Render denial states and measure interactive hit areas. | Every visible denial-state navigation/recovery control and every bottom-nav item has an actual hit target of at least `44x44` CSS pixels without causing horizontal overflow or exposing hidden/private content. | PUBLIC-003-US-003, PUBLIC-003-US-008, RESP-001-US-010, RESP-003-US-008 | Yes | Accessibility, UI E2E, Security |
| PUBLIC-003-TC-018 | Denial routes support forced-colors and increased text size | Accessibility, Responsive | Medium | Fixtures PUBLIC-003-B and PUBLIC-003-D are active; forced-colors/high-contrast mode and increased text size are enabled where supported. | Private `404` and guest `401` states at `390x844`. | Render denial states, keyboard-focus controls, and inspect text visibility. | Denial text, controls, row boundaries if present, and `focus-visible` indicators remain distinguishable; required content does not clip or overlap; no private canary appears. | PUBLIC-003-US-003, PUBLIC-003-US-008, RESP-003-US-004, RESP-003-US-014, RESP-003-US-015 | Yes | Accessibility, UI E2E, Security |
| PUBLIC-003-TC-019 | Denial routes preserve reduced-motion privacy state | Accessibility, Privacy | Medium | Fixture PUBLIC-003-G is active; `prefers-reduced-motion: reduce`. | Stale-detail revalidation request `GET /api/v1/lists/public/public-list-003-001`; expected `404 Not Found`. | Navigate back to stale detail with reduced motion enabled and wait for revalidation. | Stale content is removed without relying on nonessential animation; no critical information depends on motion; DOM and accessibility tree exclude all Fixture PUBLIC-003-G forbidden fields after denial. | PUBLIC-003-US-007, RESP-003-US-016, RESP-003-US-017 | Yes | Accessibility, UI E2E, Security |

## Requirement Clarification, Manual, and Traceability Cases

| Test Case ID | Case Type | Priority | Title | Verification |
|---|---|---|---|---|
| PUBLIC-003-TC-020 | Requirement Clarification | Critical | Exact denial error-body schema | `PUBLIC-003-US-002`, `PUBLIC-003-US-003`, and `PUBLIC-003-US-011` define status and forbidden private fields, but the allowed source does not define required error-body field names for `401 Unauthorized` or `404 Not Found`. |
| PUBLIC-003-TC-021 | Manual Verification | Critical | Logs and telemetry private-denial leak check | Confirm denial logs and telemetry exclude private list, owner, place membership, and note canaries because no deterministic automation-visible log sink is documented in the allowed source. |
| PUBLIC-003-TC-022 | Traceability Verification | High | Owned route management remains outside PUBLIC-003 | `PUBLIC-003-US-004` is covered by public-route denial here; owned-route manage behavior belongs to owned-list features. |
| PUBLIC-003-TC-023 | Traceability Verification | High | Visibility mutation mechanics are out of scope | `PUBLIC-003-US-005` and `PUBLIC-003-US-006` assert public-route end states only; visibility mutation behavior belongs to list visibility features. |
| PUBLIC-003-TC-024 | Traceability Verification | Medium | No applicable route-specific `A11Y-*` ID in allowed source | The allowed responsive/accessibility source defines route-applicable keyboard, focus, screen-reader, touch, zoom, forced-colors, and reduced-motion coverage under `RESP-*`; `A11Y-*` entries are modal/rating-specific and are not applicable to PUBLIC-003 public routes. |

## Summary

- Executable test cases: 19
- Requirement Clarification cases: 1
- Manual cases: 1
- Traceability Verification cases: 3
- Total test cases: 24
- Priority counts: Critical 10, High 11, Medium 3, Low 0
- Automation layer counts: API 11, UI E2E 18, Accessibility 6, Responsive 1, Security 18, Manual 1, Traceability Verification 3, Requirement Clarification 1

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Generic Executable Wording: 0
- Encoding/Mojibake: 0
- Public-route API Tests Missing Documented Status Codes: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Security Assumption Violations: 0
- Responsive Traceability Gaps: 0
- Accessibility Traceability Gaps: 0
- Final Verdict: Production Grade
