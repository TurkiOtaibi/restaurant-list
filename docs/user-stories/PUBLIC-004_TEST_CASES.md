# PUBLIC-004 Test Cases - Show owner display name safely

## Source Requirements

- Feature: `PUBLIC-004 - Show owner display name safely`
- Sources: `PUBLIC_LISTS_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- Endpoints under PUBLIC-004 verification: `GET /api/v1/lists/public`, `GET /api/v1/lists/public/{id}`
- Documented statuses used by executable tests: `200 OK`, `500 Error`
- User stories processed: `PUBLIC-004-US-001` through `PUBLIC-004-US-014`
- Error/log note: the allowed source requires owner private data to be absent from logs and error payloads, but no deterministic automation-visible log sink is documented. Logs remain Manual Verification; executable tests cover API payloads, rendered UI, accessibility tree, and documented error payloads.
- Fallback note: `PUBLIC-004-US-007` documents that a missing or blank display name uses a public-safe fallback and must not expose email or internal id. The exact fallback string is not documented, so executable tests assert deterministic safe conditions and a Requirement Clarification tracks the exact fallback value.

## Deterministic Fixtures

### Fixture PUBLIC-004-A - Owner Identity In Index And Detail

- Viewer: `user-viewer-004`
- Authenticated state: valid bearer session `bearer-viewer-004`
- Owner: `user-owner-004`
- Owner public-safe display name: `Sara`
- Public list:
  - `id=public-list-004-001`
  - `listName=قائمة العائلة`
  - `visibility=public`
  - `placeCount=3`
- Requests:
  - Index: `GET /api/v1/lists/public?limit=20&offset=0`
  - Detail: `GET /api/v1/lists/public/public-list-004-001`
- Expected successful status: `200 OK`
- Expected public owner identity: `ownerDisplayName=Sara`
- Forbidden owner/account canaries in response, UI, accessibility tree, metadata, and documented error payloads:
  - owner email: `sara.owner@example.test`
  - internal owner user id: `user-owner-004`
  - auth/session canary: `owner-session-secret-004`
  - created account metadata canary: `owner-created-account-metadata-004`
  - private profile field canary: `owner-private-profile-field-004`
  - internal account state canary: `owner-private-account-state-004`

### Fixture PUBLIC-004-B - Missing Or Blank Display Name

- Viewer: `user-viewer-004`
- Authenticated state: valid bearer session `bearer-viewer-004`
- Owner: `user-legacy-004`
- Owner display name source value: blank
- Public list:
  - `id=public-list-legacy-004`
  - `listName=قائمة قديمة`
  - `visibility=public`
  - `placeCount=1`
- Requests:
  - Index: `GET /api/v1/lists/public?limit=20&offset=0`
  - Detail: `GET /api/v1/lists/public/public-list-legacy-004`
- Expected successful status: `200 OK`
- Deterministic fallback assertions supported by source:
  - displayed owner identity is not blank
  - displayed owner identity is not `legacy.owner@example.test`
  - displayed owner identity is not `user-legacy-004`
  - response/UI/accessibility tree expose no owner email or internal id
- Exact fallback string: not documented; tracked by the Requirement Clarification case below.
- Forbidden canaries:
  - owner email: `legacy.owner@example.test`
  - internal owner id: `user-legacy-004`

### Fixture PUBLIC-004-C - Long And Mixed Owner Names

- Viewer: `user-viewer-004`
- Authenticated state: valid bearer session `bearer-viewer-004`
- Requests:
  - Index: `GET /api/v1/lists/public?limit=20&offset=0`
  - Detail: `GET /api/v1/lists/public/public-list-owner-mixed-004`
- Owner display names:
  - Arabic: `سارة صاحبة قوائم مطاعم العائلة في الرياض`
  - English: `Sara The Weekend Food Collection Owner`
  - Mixed: `سارة Burger House Owner`
- Public lists:
  - `public-list-owner-ar-004` uses the Arabic owner display name
  - `public-list-owner-en-004` uses the English owner display name
  - `public-list-owner-mixed-004` uses the mixed owner display name
- Responsive matrix:
  - `320x568`
  - `390x844`
  - `430x932`
  - phone landscape `844x390`
  - `768x1024`
  - `1024x768`
  - `1440x900`
  - `390x844` at `200%` zoom
  - Chromium, Firefox, WebKit

### Fixture PUBLIC-004-D - Owner Rename End State

- Viewer: `user-viewer-004`
- Authenticated state: valid bearer session `bearer-viewer-004`
- Owner: `user-owner-004`
- Public list: `public-list-004-001`
- Before display name: `Sara`
- After display name: `Sara Updated`
- Requests after rename end state:
  - Index: `GET /api/v1/lists/public?limit=20&offset=0`
  - Detail: `GET /api/v1/lists/public/public-list-004-001`
- Expected successful status: `200 OK`
- Expected index and detail owner identity: `ownerDisplayName=Sara Updated`
- Forbidden stale unsafe fallback values:
  - `sara.owner@example.test`
  - `user-owner-004`
  - `owner-session-secret-004`
  - `owner-private-account-state-004`
- Mutation mechanics that changed the display name are out of scope for PUBLIC-004.

### Fixture PUBLIC-004-E - Owner Identity Failure In Detail

- Authenticated viewer: `user-viewer-004`
- Authenticated state: valid bearer session `bearer-viewer-004`
- Request: `GET /api/v1/lists/public/public-list-004-001`
- Payload: none
- Expected documented response: `500 Error`
- Expected UI state: concise public-detail error state, no fake owner identity
- Forbidden API/UI/accessibility-tree/error-payload canaries:
  - `sara.owner@example.test`
  - `user-owner-004`
  - `owner-session-secret-004`
  - `owner-created-account-metadata-004`
  - `owner-private-profile-field-004`
  - `owner-private-account-state-004`
  - stack traces, debug fields, internal policy details

### Fixture PUBLIC-004-F - Owner Identity Failure In Index

- Authenticated viewer: `user-viewer-004`
- Authenticated state: valid bearer session `bearer-viewer-004`
- Request: `GET /api/v1/lists/public?limit=20&offset=0`
- Payload: none
- Expected documented response: `500 Error`
- Expected UI state: concise public-index error state, no fake owner identity
- Forbidden API/UI/accessibility-tree/error-payload canaries:
  - `sara.owner@example.test`
  - `user-owner-004`
  - `owner-session-secret-004`
  - `owner-created-account-metadata-004`
  - `owner-private-profile-field-004`
  - `owner-private-account-state-004`
  - stack traces, debug fields, internal policy details

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| PUBLIC-004-TC-001 | Public index shows owner display name | Positive, API, UI | High | Fixture PUBLIC-004-A is active. | Request `GET /api/v1/lists/public?limit=20&offset=0`; payload none; expected `ownerDisplayName=Sara`. | Open `/lists/public` and capture the index request. | API status is `200 OK`; row for `public-list-004-001` displays ownerDisplayName `Sara`; owner email, internal owner id, auth/session data, and private account metadata canaries are absent from response and UI. | PUBLIC-004-US-001 | Yes | API, UI E2E, Security |
| PUBLIC-004-TC-002 | Public detail shows owner display name | Positive, API, UI | High | Fixture PUBLIC-004-A is active. | Request `GET /api/v1/lists/public/public-list-004-001`; payload none; expected `ownerDisplayName=Sara`. | Open `/lists/public/public-list-004-001` and capture the detail request. | API status is `200 OK`; detail header/metadata displays ownerDisplayName `Sara`; owner email, internal owner id, auth/session data, and private account metadata canaries are absent from response and UI. | PUBLIC-004-US-002 | Yes | API, UI E2E, Security |
| PUBLIC-004-TC-003 | Public index owner metadata allowlist exposes only ownerDisplayName | API Contract, Privacy | Critical | Fixture PUBLIC-004-A is active. | Request `GET /api/v1/lists/public?limit=20&offset=0`; payload none; forbidden canaries from Fixture PUBLIC-004-A. | Request public index and inspect all owner-related fields in every item. | API status is `200 OK`; each public item exposes owner identity only through `ownerDisplayName`; owner email, internal owner user id, auth/session data, created account metadata, private profile fields, and internal account state are absent. | PUBLIC-004-US-003, PUBLIC-004-US-004, PUBLIC-004-US-005, PUBLIC-004-US-006 | Yes | API, Security |
| PUBLIC-004-TC-004 | Public detail owner metadata allowlist exposes only ownerDisplayName | API Contract, Privacy | Critical | Fixture PUBLIC-004-A is active. | Request `GET /api/v1/lists/public/public-list-004-001`; payload none; forbidden canaries from Fixture PUBLIC-004-A. | Request public detail and inspect all owner-related fields. | API status is `200 OK`; public detail exposes owner identity only through `ownerDisplayName`; owner email, internal owner user id, auth/session data, created account metadata, private profile fields, and internal account state are absent. | PUBLIC-004-US-003, PUBLIC-004-US-004, PUBLIC-004-US-005, PUBLIC-004-US-006 | Yes | API, Security |
| PUBLIC-004-TC-005 | Owner email is absent from index and detail UI and payloads | Privacy, Security | Critical | Fixture PUBLIC-004-A is active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; detail request `GET /api/v1/lists/public/public-list-004-001`; payload none; forbidden email `sara.owner@example.test`. | Request index and detail, then render both surfaces. | Both API statuses are `200 OK`; owner email `sara.owner@example.test` is absent from response payloads, rendered UI, and accessibility tree. | PUBLIC-004-US-004 | Yes | API, UI E2E, Accessibility, Security |
| PUBLIC-004-TC-006 | Internal owner id is absent from index and detail UI and payloads | Privacy, Security | Critical | Fixture PUBLIC-004-A is active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; detail request `GET /api/v1/lists/public/public-list-004-001`; payload none; forbidden internal id `user-owner-004`. | Request index and detail, then render both surfaces. | Both API statuses are `200 OK`; internal owner user id `user-owner-004` is absent from response payloads, rendered UI, and accessibility tree. | PUBLIC-004-US-005 | Yes | API, UI E2E, Accessibility, Security |
| PUBLIC-004-TC-007 | Private account metadata is absent from index and detail responses | Privacy, Security | Critical | Fixture PUBLIC-004-A is active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; detail request `GET /api/v1/lists/public/public-list-004-001`; payload none; private metadata canaries from Fixture PUBLIC-004-A. | Request index and detail, then inspect response payloads. | Both API statuses are `200 OK`; auth/session fields, created account metadata, private profile fields, and internal account state are absent from both responses. | PUBLIC-004-US-006 | Yes | API, Security |
| PUBLIC-004-TC-008 | Blank display name uses safe non-sensitive fallback without email or id | Boundary, Privacy | High | Fixture PUBLIC-004-B is active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; detail request `GET /api/v1/lists/public/public-list-legacy-004`; payload none; forbidden values `legacy.owner@example.test`, `user-legacy-004`. | Render index and detail for legacy owner and inspect response payloads, UI, and accessibility tree. | Both API statuses are `200 OK`; owner identity value is present and not blank; displayed owner identity is not `legacy.owner@example.test` and not `user-legacy-004`; email/internal id are absent from payload, UI, and accessibility tree. | PUBLIC-004-US-007 | Yes | API, UI E2E, Accessibility, Security |
| PUBLIC-004-TC-009 | Owner display names pass full responsive matrix | Responsive, UI | High | Fixture PUBLIC-004-C is active. | Viewports `320x568`, `390x844`, `430x932`, `844x390`, `768x1024`, `1024x768`, `1440x900`; browsers Chromium, Firefox, WebKit. | Render public index and detail for Arabic, English, and mixed owner names in every viewport/browser combination. | For every combination, `document.documentElement.scrollWidth <= window.innerWidth`; owner display names wrap or clamp without overlap; final interactive element is not covered by bottom navigation, safe-area padding, or browser UI. | PUBLIC-004-US-008, RESP-001-US-011, RESP-002-US-001, RESP-002-US-002, RESP-002-US-005, RESP-002-US-012, RESP-002-US-016, RESP-002-US-017, RESP-002-US-018, RESP-002-US-024 | Yes | UI E2E, Responsive |
| PUBLIC-004-TC-010 | Owner display names are usable at 200 percent zoom and increased text size | Responsive, Accessibility | High | Fixture PUBLIC-004-C is active; browser zoom is `200%`; increased text size is enabled where supported. | Render `/lists/public` and `/lists/public/public-list-owner-mixed-004` at `390x844`; owner names from Fixture PUBLIC-004-C. | Render index and detail at 200% zoom and increased text size. | `document.documentElement.scrollWidth <= window.innerWidth`; owner names, list metadata, navigation, and row/detail actions remain readable and reachable; no owner private canary appears. | PUBLIC-004-US-008, RESP-003-US-001, RESP-003-US-002, RESP-003-US-003, RESP-003-US-004 | Yes | Accessibility, UI E2E, Security |
| PUBLIC-004-TC-011 | Arabic, English, and mixed owner names are bidi-safe | Accessibility, UI | Medium | Fixture PUBLIC-004-C is active. | Owner names `سارة صاحبة قوائم مطاعم العائلة في الرياض`, `Sara The Weekend Food Collection Owner`, `سارة Burger House Owner`. | Render index and detail in RTL and inspect visual order plus accessibility text. | Owner names remain visually ordered and uncorrupted; mixed Arabic/English text does not reorder surrounding list metadata; accessibility text exposes the same readable owner name without mojibake. | PUBLIC-004-US-009, RESP-002-US-018 | Yes | Accessibility, UI E2E |
| PUBLIC-004-TC-012 | Owner display name is consistent between index and detail | Data Integrity, UI | Medium | Fixture PUBLIC-004-A is active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; detail request `GET /api/v1/lists/public/public-list-004-001`; expected `ownerDisplayName=Sara`. | Open index, then open detail for `public-list-004-001`. | Both API statuses are `200 OK`; index row and detail metadata both display exactly `Sara`. | PUBLIC-004-US-010 | Yes | API, UI E2E |
| PUBLIC-004-TC-013 | Owner display rename refreshes consistently without unsafe fallback | Data Integrity, Privacy | Medium | Fixture PUBLIC-004-D after state is active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; detail request `GET /api/v1/lists/public/public-list-004-001`; expected `ownerDisplayName=Sara Updated`. | Refresh index and detail. | Both API statuses are `200 OK`; both surfaces display `Sara Updated`; stale email `sara.owner@example.test`, internal id `user-owner-004`, auth/session canary, and private metadata canary are absent from response and UI. | PUBLIC-004-US-011 | Yes | API, UI E2E, Security |
| PUBLIC-004-TC-014 | Accessible owner identity is associated with correct list | Accessibility, Privacy | Medium | Fixture PUBLIC-004-A is active. | List `قائمة العائلة`; owner `Sara`; place count `3`; forbidden canaries from Fixture PUBLIC-004-A. | Inspect accessibility tree for index row and detail metadata. | Assistive technology associates ownerDisplayName `Sara` with `قائمة العائلة` on both index and detail surfaces; accessibility tree excludes owner email, internal owner id, auth/session data, and private account metadata. | PUBLIC-004-US-012, RESP-001-US-005, RESP-001-US-006, RESP-004-US-009 | Yes | Accessibility, Security |
| PUBLIC-004-TC-015 | Owner identity controls are keyboard reachable with visible focus | Accessibility | High | Fixture PUBLIC-004-A is active. | Routes `/lists/public` and `/lists/public/public-list-004-001`; keyboard input Tab, Shift+Tab, Enter. | Navigate index and detail using keyboard only. | Navigation controls and list/detail activation controls are reachable in logical order; `focus-visible` appears on every focused control; owner private canaries are not reachable or announced. | PUBLIC-004-US-012, RESP-001-US-007, RESP-001-US-008 | Yes | Accessibility, UI E2E, Security |
| PUBLIC-004-TC-016 | Owner identity touch targets meet 44x44 minimum | Accessibility, Mobile | High | Fixture PUBLIC-004-A is active. | Viewports `320x568`, `390x844`, `430x932`; index row activation, detail navigation controls, and bottom navigation controls. | Render index and detail, then measure interactive hit areas. | Every visible row/detail/navigation target related to owner identity context has an actual hit target of at least `44x44` CSS pixels without horizontal overflow or private owner data exposure. | PUBLIC-004-US-012, RESP-001-US-010, RESP-003-US-008 | Yes | Accessibility, UI E2E, Security |
| PUBLIC-004-TC-017 | Owner identity remains visible in forced-colors mode | Accessibility, Visual | Medium | Fixture PUBLIC-004-C is active; forced-colors/high-contrast mode is enabled where supported. | Index and detail surfaces with Arabic, English, and mixed owner names. | Render index and detail, then inspect text visibility, controls, row boundaries, and focus states. | Owner display names, list metadata, buttons/links, row boundaries, and `focus-visible` indicators remain distinguishable; no required owner identity information is conveyed by color alone. | PUBLIC-004-US-008, PUBLIC-004-US-012, RESP-003-US-014, RESP-003-US-015 | Yes | Accessibility, UI E2E |
| PUBLIC-004-TC-018 | Detail owner identity failure does not leak private owner data | Error Handling, Security | Critical | Fixture PUBLIC-004-E is active. | Request `GET /api/v1/lists/public/public-list-004-001`; payload none; expected `500 Error`; forbidden owner canaries from fixture. | Request detail and inspect API response, UI error state, documented error payload, and accessibility tree. | API status is `500 Error`; error payload, UI error state, and accessibility tree exclude owner email, internal id, auth/session data, private account metadata canaries, stack traces, debug fields, and internal policy details. | PUBLIC-004-US-013 | Yes | API, UI E2E, Accessibility, Security |
| PUBLIC-004-TC-019 | Index owner identity failure does not leak private owner data | Error Handling, Security | Critical | Fixture PUBLIC-004-F is active. | Request `GET /api/v1/lists/public?limit=20&offset=0`; payload none; expected `500 Error`; forbidden owner canaries from fixture. | Request index and inspect API response, UI error state, documented error payload, and accessibility tree. | API status is `500 Error`; error payload, UI error state, and accessibility tree exclude owner email, internal id, auth/session data, private account metadata canaries, stack traces, debug fields, and internal policy details. | PUBLIC-004-US-013 | Yes | API, UI E2E, Accessibility, Security |
| PUBLIC-004-TC-020 | Regression checks fail on owner privacy leaks | Regression, Security | High | Fixture PUBLIC-004-A is active. | Index request `GET /api/v1/lists/public?limit=20&offset=0`; detail request `GET /api/v1/lists/public/public-list-004-001`; payload none; forbidden canaries from Fixture PUBLIC-004-A. | Run public-list API/UI/accessibility-tree privacy checks. | Test fails if email, internal owner id, auth/session data, created account metadata, private profile fields, or internal account state appears in public responses, rendered UI, or accessibility tree. | PUBLIC-004-US-014 | Yes | API, UI E2E, Accessibility, Security |

## Requirement Clarification, Manual, and Traceability Cases

| Test Case ID | Case Type | Priority | Title | Verification |
|---|---|---|---|---|
| PUBLIC-004-TC-021 | Requirement Clarification | Medium | Exact fallback display-name value | `PUBLIC-004-US-007` requires a public-safe fallback but does not define the exact displayed string; executable tests assert non-blank public-safe identity and no email/id leakage without inventing the string. |
| PUBLIC-004-TC-022 | Manual Verification | Critical | Logs and telemetry owner privacy | Confirm server logs, client console logs, and telemetry exclude owner email, internal id, auth/session data, and private account metadata for success and error paths because no deterministic automation-visible log sink is documented in the allowed source. |
| PUBLIC-004-TC-023 | Traceability Verification | Medium | Owner rename mutation is out of PUBLIC-004 scope | `PUBLIC-004-US-011` asserts refreshed public index/detail end state after owner display name changes; the mutation mechanism that changes the owner display name belongs outside PUBLIC-004. |
| PUBLIC-004-TC-024 | Traceability Verification | Medium | No applicable route-specific `A11Y-*` ID in allowed source | The allowed responsive/accessibility source defines route-applicable keyboard, focus, screen-reader, touch, zoom, forced-colors, and responsive coverage under `RESP-*`; `A11Y-*` entries are modal/rating-specific and are not applicable to PUBLIC-004 public routes. |

## Summary

- Executable test cases: 20
- Requirement Clarification cases: 1
- Manual cases: 1
- Traceability Verification cases: 2
- Total test cases: 24
- Priority counts: Critical 8, High 8, Medium 8, Low 0
- Automation layer counts: API 13, UI E2E 16, Accessibility 12, Responsive 1, Security 16, Manual 1, Traceability Verification 2, Requirement Clarification 1

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
- Summary Count Mismatches: 0
- Final Verdict: Production Grade
