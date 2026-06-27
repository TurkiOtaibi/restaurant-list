# ADMIN-001 Test Cases - Admin access control and audit foundation

## Source Requirements

- Feature: `ADMIN-001 - Admin access control and audit foundation`
- Sources: `ADMIN_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `ADMIN-001-US-001` through `ADMIN-001-US-018`
- Documented denial/error statuses: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `500 Error`
- Documented error schema fields: `code`, `message`, `details`, `requestId`
- Route constraint: no exact Admin route paths, endpoint paths, MFA endpoint, step-up endpoint, audit endpoint, break-glass endpoint, or audit-export endpoint are documented in the allowed sources.
- Execution constraint: no ADMIN-001 route/API case is marked executable until exact endpoint paths, payloads, and expected success/error status mapping are documented.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-ADMIN-001-GUEST | No authenticated user; no admin session; no MFA state; request id `req-admin-001-guest`. |
| FX-ADMIN-001-NONADMIN | Authenticated user `user-001`; role `user`; permissions `[]`; valid session `sess-user-001`; MFA state `not-admin-applicable`. |
| FX-ADMIN-001-ADMIN-MFA-PENDING | Admin `admin-001`; role `admin`; permissions `[admin.dashboard.view]`; valid authenticated state; MFA not completed. |
| FX-ADMIN-001-ADMIN-MFA-SUCCESS | Admin `admin-001`; role `admin`; permissions `[admin.dashboard.view]`; MFA result `success`; request id `req-admin-001-mfa-success`. |
| FX-ADMIN-001-ADMIN-MFA-FAIL | Admin `admin-001`; role `admin`; permissions `[admin.dashboard.view]`; MFA result `failure`; request id `req-admin-001-mfa-fail`; sensitive challenge canary `MFA-SECRET-ADMIN-001`. |
| FX-ADMIN-001-ADMIN-EXPIRED | Admin `admin-001`; role `admin`; permissions `[admin.dashboard.view]`; admin session state `expired`; MFA must be repeated. |
| FX-ADMIN-001-LIMITED | Admin `admin-002`; role `admin`; permissions `[admin.dashboard.view]`; MFA completed; requested permission `admin.user.disable`; requested permission absent. |
| FX-ADMIN-001-PERMISSION-MATRIX | Admin users exist with exactly one permission each: `admin.user.view`, `admin.user.disable`, `admin.list.moderate`, `admin.place.edit`, `admin.place.merge`, `admin.abuse.review`, `admin.dashboard.view`; second admin `admin-no-permission-001` has no admin action permission. |
| FX-ADMIN-001-STEPUP-MISSING | Admin `admin-001`; required action category `high-risk`; high-risk action labels `disable user`, `merge places`, `hide public list`, `restore public list`; recent step-up state `missing`. |
| FX-ADMIN-001-SENSITIVE-ACTION-SUCCESS | Admin `admin-001`; required permission present; recent step-up state `valid`; reason `policy violation`; target entity type `public_list`; target id `public-list-001`; safe before value `Visible`; safe after value `Hidden`. |
| FX-ADMIN-001-AUDIT-FAIL | Admin `admin-001`; required permission present; recent step-up state `valid`; audit write result `failure`; target id `target-admin-001`; target before state `unchanged`. |
| FX-ADMIN-001-AUDIT-SENSITIVE-CANARIES | Audit record candidate includes forbidden canaries `password-canary`, `hash-canary`, `access-token-canary`, `refresh-token-canary`, `cookie-canary`, `private-note-canary`, `raw-secret-canary`. |
| FX-ADMIN-001-RETENTION | Audit records `audit-beta-001` and `audit-prod-001`; created timestamp `2026-06-27T09:00:00Z`; environments `beta` and `production`. |
| FX-ADMIN-001-BREAKGLASS | Break-glass admin `breakglass-001`; emergency reason `database recovery`; incident id `incident-001`; alert id `admin-alert-001`. |
| FX-ADMIN-001-A11Y-RESPONSIVE | Admin console shell, denied state, MFA state, permission failure state, high-risk confirmation dialog, error banner, and audit notice are available in the future Admin UI contract. |

## Exact Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-ADMIN-001-DENIAL-401 | Guest admin route/API access uses `401 Unauthorized`; payload fields are exactly documented safe error fields `code`, `message`, `details`, `requestId`; admin data and sensitive canaries are absent. |
| ASSERT-ADMIN-001-DENIAL-403 | Non-admin or missing-permission admin route/API access uses `403 Forbidden`; payload fields are exactly documented safe error fields `code`, `message`, `details`, `requestId`; admin data and sensitive canaries are absent. |
| ASSERT-ADMIN-001-ERROR-SCHEMA | Error payload for `401`, `403`, `404`, `409`, `422`, and `500` contains safe `code`, `message`, `details`, `requestId`; forbidden fields include passwords, password hashes, access tokens, refresh tokens, cookies, private notes, raw secrets, stack traces, SQL details, debug fields, and unrestricted audit metadata. |
| ASSERT-ADMIN-001-AUDIT-ACCESS | Admin access audit contains actor admin id, route/action, timestamp, request id, and result. |
| ASSERT-ADMIN-001-AUDIT-MFA | MFA audit contains actor admin id, action type `mfa_success` or `mfa_failure`, timestamp, request id, and result; MFA challenge secret data is absent. |
| ASSERT-ADMIN-001-AUDIT-PERMISSION-FAILURE | Permission failure audit contains actor admin id, permission attempted, action type, target entity type/id if a target exists, timestamp, request id, and result `failure`; sensitive canaries are absent. |
| ASSERT-ADMIN-001-AUDIT-SENSITIVE-SUCCESS | Sensitive-action audit contains actor admin id, permission used, action type, target entity type, target entity id, timestamp, request id, reason text, safe before/after values, and result `success`; sensitive canaries are absent. |
| ASSERT-ADMIN-001-AUDIT-FAILURE-BLOCK | If audit writing fails, the sensitive action result is failure and target before/after state is unchanged. |
| ASSERT-ADMIN-001-AUDIT-RETENTION | Beta audit retention is at least 1 year; production audit retention is at least 7 years unless a later policy supersedes it. |
| ASSERT-ADMIN-001-A11Y-KEYBOARD | Admin UI controls are keyboard reachable with logical order. |
| ASSERT-ADMIN-001-A11Y-FOCUS | Focused Admin UI controls show visible `focus-visible`. |
| ASSERT-ADMIN-001-A11Y-SCREEN-READER | Admin controls have accessible names; errors are announced; dialogs expose approved modal semantics. |
| ASSERT-ADMIN-001-A11Y-TOUCH | Interactive Admin controls have at least `44x44` CSS pixel hit targets. |
| ASSERT-ADMIN-001-RESPONSIVE | Admin UI has no horizontal overflow with `document.documentElement.scrollWidth <= window.innerWidth` at `320x568`, `390x844`, `430x932`, phone landscape, and `200%` zoom; critical controls remain reachable and safe-area overlap does not hide final actions. |

## Executable Test Cases

No executable ADMIN-001 API/UI test cases are currently valid because the allowed sources do not document exact Admin endpoint paths or Admin route paths. Route-dependent cases are intentionally classified below as Requirement Clarification, Manual Verification, or Traceability Verification.

## Requirement Clarification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-001-TC-001 | Requirement Clarification | Critical | Define exact Admin console route path and Admin API path used for guest and non-admin access checks. | Future executable tests can send exact requests and assert `401 Unauthorized` for guests and `403 Forbidden` for non-admin users without using pseudo-routes. | ADMIN-001-US-001, ADMIN-001-US-002 |
| ADMIN-001-TC-002 | Requirement Clarification | Critical | Define exact MFA success/failure request path, payload fields, response status, and response schema. | Future executable tests can verify MFA success before access, MFA repeat after expiry, MFA failure safety, and MFA audit records with exact requests. | ADMIN-001-US-003, ADMIN-001-US-004, ADMIN-001-US-005 |
| ADMIN-001-TC-003 | Requirement Clarification | Critical | Define exact permission-check request fixtures for each permission in the Admin permission matrix. | Future executable matrix tests can use exact path, payload, permission, expected status, response schema, and audit expectation for each permission boundary. | ADMIN-001-US-006, ADMIN-001-US-007 |
| ADMIN-001-TC-004 | Requirement Clarification | Critical | Define exact step-up request path, payload, expiry model, response status, and safe error schema for high-risk actions. | Future executable tests can verify missing/expired step-up blocks disable user, merge places, hide public list, and restore public list without testing downstream feature success. | ADMIN-001-US-008 |
| ADMIN-001-TC-005 | Requirement Clarification | Critical | Define exact audit record read/query mechanism for admin access events, MFA events, permission failures, sensitive-action success, and audit-write failure. | Future executable tests can assert exact audit fields without inventing audit API routes or storage access behavior. | ADMIN-001-US-009, ADMIN-001-US-010, ADMIN-001-US-011, ADMIN-001-US-012 |
| ADMIN-001-TC-006 | Requirement Clarification | Critical | Define exact request fixtures that deterministically produce each Admin API error status `401`, `403`, `404`, `409`, `422`, and `500`. | Future executable tests can validate ASSERT-ADMIN-001-ERROR-SCHEMA once exact requests and status triggers are documented. | ADMIN-001-US-017 |
| ADMIN-001-TC-007 | Requirement Clarification | High | Define exact audit export permission name, export path, payload, scoping model, redaction model, denial status, and audit fields. | Future executable tests can verify restricted audit export without inventing export behavior. | ADMIN-001-US-014 |
| ADMIN-001-TC-008 | Requirement Clarification | Critical | Define exact break-glass access path, alert verification mechanism, post-use review path, payload, response status, and audit schema. | Future executable tests can verify break-glass emergency use and post-use review deterministically. | ADMIN-001-US-015, ADMIN-001-US-016 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-001-TC-009 | Traceability Verification | Critical | Guest access denial must map to ASSERT-ADMIN-001-DENIAL-401 once exact Admin route/API paths are documented. | Coverage requires `401 Unauthorized`, no admin data, and safe error schema. | ADMIN-001-US-002 |
| ADMIN-001-TC-010 | Traceability Verification | Critical | Non-admin access denial must map to ASSERT-ADMIN-001-DENIAL-403 once exact Admin route/API paths are documented. | Coverage requires `403 Forbidden`, no admin data, and safe error schema. | ADMIN-001-US-001 |
| ADMIN-001-TC-011 | Traceability Verification | Critical | MFA success must be audited before admin access is granted. | Coverage requires ASSERT-ADMIN-001-AUDIT-MFA with result `success`; endpoint mapping remains pending. | ADMIN-001-US-003, ADMIN-001-US-009 |
| ADMIN-001-TC-012 | Traceability Verification | Critical | Expired admin sessions must require MFA again. | Coverage requires no admin data before repeated MFA success and an audit trail for the revalidation attempt. | ADMIN-001-US-004 |
| ADMIN-001-TC-013 | Traceability Verification | High | MFA failure must be safe and audited. | Coverage requires access denial, safe error, no MFA challenge secret logging, and ASSERT-ADMIN-001-AUDIT-MFA with result `failure`. | ADMIN-001-US-005 |
| ADMIN-001-TC-014 | Traceability Verification | Critical | Permission failure must be audited. | Coverage requires `403 Forbidden`, ASSERT-ADMIN-001-AUDIT-PERMISSION-FAILURE, and no sensitive data exposure. | ADMIN-001-US-006, ADMIN-001-US-009 |
| ADMIN-001-TC-015 | Traceability Verification | Critical | Explicit least-privilege matrix must cover all documented permissions. | Coverage requires one positive and one negative boundary check for `admin.user.view`, `admin.user.disable`, `admin.list.moderate`, `admin.place.edit`, `admin.place.merge`, `admin.abuse.review`, and `admin.dashboard.view` after exact request fixtures are defined. | ADMIN-001-US-007 |
| ADMIN-001-TC-016 | Traceability Verification | Critical | Step-up foundation must cover all documented high-risk actions without testing downstream success semantics. | Coverage requires missing/expired step-up denial for disable user, merge places, hide public list, and restore public list, plus safe step-up audit. | ADMIN-001-US-008 |
| ADMIN-001-TC-017 | Traceability Verification | Critical | Sensitive action success audit must be verified without owning downstream feature behavior. | Coverage requires ASSERT-ADMIN-001-AUDIT-SENSITIVE-SUCCESS for a documented sensitive-action fixture after exact request and audit access are defined. | ADMIN-001-US-010 |
| ADMIN-001-TC-018 | Traceability Verification | Critical | Audit write failure must block sensitive action. | Coverage requires ASSERT-ADMIN-001-AUDIT-FAILURE-BLOCK and no target state change for a documented sensitive-action fixture after exact request and audit failure simulation are defined. | ADMIN-001-US-011 |
| ADMIN-001-TC-019 | Traceability Verification | Critical | Audit records must exclude sensitive data. | Coverage requires forbidden canaries from FX-ADMIN-001-AUDIT-SENSITIVE-CANARIES to be absent from stored/viewed audit records. | ADMIN-001-US-012 |
| ADMIN-001-TC-020 | Traceability Verification | High | Audit export must remain restricted. | Coverage requires explicit export permission, scoping, redaction, and audit before any export is executable. | ADMIN-001-US-014 |
| ADMIN-001-TC-021 | Traceability Verification | Critical | Break-glass use must remain emergency-only. | Coverage requires emergency reason, alert, and audit record; normal admin workflows must not rely on break-glass access. | ADMIN-001-US-015 |
| ADMIN-001-TC-022 | Traceability Verification | High | Break-glass post-use review must be required. | Coverage requires incident/reason, actions taken, and follow-up decision in the review artifact. | ADMIN-001-US-016 |
| ADMIN-001-TC-023 | Traceability Verification | High | Admin error contract must be split by exact documented error status once request fixtures exist. | Coverage requires one deterministic case each for `401`, `403`, `404`, `409`, `422`, and `500`, with ASSERT-ADMIN-001-ERROR-SCHEMA. | ADMIN-001-US-017 |
| ADMIN-001-TC-024 | Traceability Verification | High | Admin keyboard navigation must be covered. | Coverage requires ASSERT-ADMIN-001-A11Y-KEYBOARD for Admin UI controls. | ADMIN-001-US-018, RESP-001-US-007 |
| ADMIN-001-TC-025 | Traceability Verification | High | Admin focus-visible behavior must be covered. | Coverage requires ASSERT-ADMIN-001-A11Y-FOCUS for Admin UI controls. | ADMIN-001-US-018, RESP-001-US-008 |
| ADMIN-001-TC-026 | Traceability Verification | High | Admin screen-reader labels, error announcements, and dialogs must be covered. | Coverage requires ASSERT-ADMIN-001-A11Y-SCREEN-READER and approved dialog semantics. | ADMIN-001-US-018, A11Y-001-US-001, A11Y-001-US-014 |
| ADMIN-001-TC-027 | Traceability Verification | High | Admin touch targets must be covered. | Coverage requires ASSERT-ADMIN-001-A11Y-TOUCH for Admin controls. | ADMIN-001-US-018, RESP-001-US-010, RESP-003-US-008 |
| ADMIN-001-TC-028 | Traceability Verification | High | Admin mobile responsive coverage must include 320px, 390px, and 430px widths. | Coverage requires no horizontal overflow and reachable controls at `320x568`, `390x844`, and `430x932`. | ADMIN-001-US-018, RESP-002-US-001, RESP-002-US-002 |
| ADMIN-001-TC-029 | Traceability Verification | High | Admin landscape, safe-area, and 200% zoom coverage must be included. | Coverage requires ASSERT-ADMIN-001-RESPONSIVE for phone landscape, safe areas, and `200%` zoom. | ADMIN-001-US-018, RESP-002-US-005, RESP-002-US-012, RESP-003-US-001, RESP-003-US-002 |
| ADMIN-001-TC-030 | Traceability Verification | Medium | Enterprise RBAC matrix UI remains out of ADMIN-001 scope. | ADMIN-001 verifies explicit permission boundaries only; rejected enterprise RBAC UI is not executable scope. | ADMIN-001-US-007 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-001-TC-031 | Manual Verification | High | Verify immutable audit storage cannot be altered through application interfaces. | Evidence confirms application users/admins cannot mutate stored audit records. | ADMIN-001-US-010, ADMIN-001-US-012 |
| ADMIN-001-TC-032 | Manual Verification | High | Verify beta and production audit retention policy configuration. | Evidence confirms beta retention is at least 1 year and production retention is at least 7 years unless a later policy supersedes it. | ADMIN-001-US-013 |
| ADMIN-001-TC-033 | Manual Verification | Critical | Verify step-up tokens or challenge data are absent from server logs, client logs, and telemetry. | Evidence confirms step-up secrets are not logged for success or failure paths. | ADMIN-001-US-008 |
| ADMIN-001-TC-034 | Manual Verification | Critical | Verify break-glass alert delivery reaches the approved operational channel. | Evidence confirms alert id and recipient/channel record are created for emergency account usage. | ADMIN-001-US-015 |

## Summary

- Executable test cases: 0
- Requirement Clarification cases: 8
- Manual Verification cases: 4
- Traceability Verification cases: 22
- Total cases: 34

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- Generic Executable Wording: 0
- Undocumented Executable Routes: 0
- Executable Tests Missing Documented Status: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Security Assumption Violations: 0
- Admin Permission Boundary Gaps: 0
- Summary Count Mismatches: 0
- Final Verdict: Production Grade
