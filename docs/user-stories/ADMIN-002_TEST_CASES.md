# ADMIN-002 Test Cases - User lookup and account status review

## Source Requirements

- Feature: `ADMIN-002 - User lookup and account status review`
- Sources: `ADMIN_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `ADMIN-002-US-001` through `ADMIN-002-US-015`
- API contract gate: no exact ADMIN-002 endpoint paths, request payload schemas, response schemas, or route paths are documented in the allowed sources.
- Execution constraint: no ADMIN-002 API test is executable until endpoint, request, payload, response, and HTTP status are all documented.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-ADMIN-002-VIEWER | Admin `admin-user-view-001`; permissions `[admin.user.view]`; MFA complete; request id `req-admin-002-view`. |
| FX-ADMIN-002-DISABLER | Admin `admin-user-disable-001`; permissions `[admin.user.view, admin.user.disable]`; MFA and recent step-up complete. |
| FX-ADMIN-002-NOPERM | Admin `admin-no-user-view-001`; permissions `[admin.dashboard.view]`; MFA complete; lacks `admin.user.view`. |
| FX-ADMIN-002-GUEST | No authenticated user; no admin permission; no MFA state. |
| FX-ADMIN-002-TARGET | User `user-target-002`; display name `Sara Support`; email `sara.support@example.test`; account status `enabled`; created date `2026-01-10`; lists `3`; ratings `4`; public lists `1`; active sessions `2`; refresh tokens `2`; private note canary `PRIVATE-NOTE-ADMIN-002`; password canary `PASSWORD-ADMIN-002`; hash canary `HASH-ADMIN-002`; token canary `TOKEN-ADMIN-002`; cookie canary `COOKIE-ADMIN-002`; raw auth data canary `RAW-AUTH-ADMIN-002`. |
| FX-ADMIN-002-DISABLED | User `user-disabled-002`; account status `disabled`; active sessions `0`; refresh tokens `0`; owned lists `2`; ratings `5`; places `1`; public lists `1`; audit history `audit-user-002`. |
| FX-ADMIN-002-SELF | Admin `admin-user-disable-001` attempts to disable own active admin account `admin-user-disable-001`. |
| FX-ADMIN-002-SEARCH-LIMIT | Repeated user searches exceed threshold; exact numeric threshold is undocumented. |
| FX-ADMIN-002-RESPONSIVE | Future Admin user search screen, detail summary, status-change reason dialog, error state, and no-export UI. |

## Required Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-ADMIN-002-SEARCH-MIN | User search results include only user id, display name, account status, created date, and email only if final documented permission allows it. Passwords, password hashes, tokens, cookies, private notes, raw auth data, debug fields, and unrestricted export data are absent. |
| ASSERT-ADMIN-002-DETAIL-SAFE | User detail shows account status, created date, list count, rating count, public list count, and safe last admin action summary only. Credential, token, cookie, raw auth, and private note canaries are absent from API, UI, accessibility tree, logs, and errors. |
| ASSERT-ADMIN-002-AUDIT-DETAIL | User detail audit includes admin id, target user id, timestamp, request id, and final documented reason field if the approved requirement makes reason mandatory. Sensitive credential/token/private note canaries are absent. |
| ASSERT-ADMIN-002-AUDIT-STATUS | Status-change audit includes admin id, target user id, previous status, new status, reason, timestamp, request id, and result. Sensitive credential/token/private note canaries are absent. |
| ASSERT-ADMIN-002-DISABLE-INTEGRITY | Disable changes account status to `disabled`, revokes active sessions and refresh tokens, preserves ratings, lists, places, public lists, and audit history, and exposes no token values. |
| ASSERT-ADMIN-002-REENABLE-INTEGRITY | Re-enable changes account status to `enabled` with reason and audit; authentication follows normal auth rules without redefining Auth feature mechanics. |
| ASSERT-ADMIN-002-A11Y-KEYBOARD | User tools are keyboard reachable in logical order. |
| ASSERT-ADMIN-002-A11Y-FOCUS | User tools show visible `focus-visible` on focused controls. |
| ASSERT-ADMIN-002-A11Y-SCREEN-READER | User search, detail, errors, and status-change dialog controls have accessible names and error announcements. |
| ASSERT-ADMIN-002-A11Y-TOUCH | User tool controls have at least `44x44` CSS pixel hit targets. |
| ASSERT-ADMIN-002-RESPONSIVE | Future user tools have no horizontal overflow at `320x568`, `390x844`, `430x932`, phone landscape, and `200%` zoom; laptop/tablet layouts remain readable. |

## Executable Test Cases

No executable ADMIN-002 API tests are currently valid because the allowed sources do not document exact ADMIN-002 endpoint paths, request payload schemas, response schemas, and status mapping. Business coverage is preserved below as Requirement Clarification, Traceability Verification, and Manual Verification.

## Requirement Clarification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-002-TC-001 | Requirement Clarification | Critical | Define exact user search endpoint path, request parameters, payload shape if any, `200 OK` response schema, pagination envelope, rate-limit threshold, and rate-limit response status/schema. | Future executable search tests can verify search by email/display name, pagination, minimization, rate limiting, and safe metadata using documented contracts only. | ADMIN-002-US-001, ADMIN-002-US-003, ADMIN-002-US-004 |
| ADMIN-002-TC-002 | Requirement Clarification | Critical | Define exact missing-permission and guest-denial request fixtures for user search/detail/status tools. | Future executable tests can assert documented `403 Forbidden` for missing permission and `401 Unauthorized` for guests using exact routes and schemas. | ADMIN-002-US-002 |
| ADMIN-002-TC-003 | Requirement Clarification | High | Define whether email visibility requires a separate user-support permission beyond `admin.user.view`. | Search minimization assertions expose email only according to the final documented permission rule. | ADMIN-002-US-004 |
| ADMIN-002-TC-004 | Requirement Clarification | Critical | Define exact user detail endpoint, path parameter, response schema, allowed fields, forbidden fields, and audit access method. | Future executable user-detail tests can assert operational summary fields and ASSERT-ADMIN-002-DETAIL-SAFE. | ADMIN-002-US-005, ADMIN-002-US-006, ADMIN-002-US-007 |
| ADMIN-002-TC-005 | Requirement Clarification | Critical | Define exact disable-user endpoint, payload, reason validation, step-up proof shape, response schema, and status mapping. | Future executable tests can verify disable status change, session revocation, data preservation, self-lockout protection, and audit using documented contracts only. | ADMIN-002-US-008, ADMIN-002-US-009, ADMIN-002-US-010, ADMIN-002-US-013, ADMIN-002-US-015 |
| ADMIN-002-TC-006 | Requirement Clarification | High | Define exact re-enable endpoint, payload, response schema, reason validation, and audit schema. | Future executable re-enable tests can assert account status returns to `enabled` and ASSERT-ADMIN-002-AUDIT-STATUS. | ADMIN-002-US-012, ADMIN-002-US-015 |
| ADMIN-002-TC-007 | Requirement Clarification | High | Define exact disabled-user access denial contract for login, refresh, and protected API access, or explicitly trace it to Auth. | ADMIN-002 can verify disabled-user outcome without inventing Auth endpoint behavior. | ADMIN-002-US-011 |
| ADMIN-002-TC-008 | Requirement Clarification | Critical | Define exact unrestricted-export denial behavior for user tools, including whether an endpoint exists, denial status, response schema, and audit fields. | Future executable tests can prove unrestricted export is unavailable without inventing export APIs. | ADMIN-002-US-014 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-002-TC-009 | Traceability Verification | High | User search with `admin.user.view` must be covered once exact search contract is documented. | Coverage requires matching users, bounded pagination, allowed fields only, and ASSERT-ADMIN-002-SEARCH-MIN. | ADMIN-002-US-001, ADMIN-002-US-004 |
| ADMIN-002-TC-010 | Traceability Verification | Critical | Missing `admin.user.view` must deny user search. | Coverage requires `403 Forbidden`, no user rows, safe error schema, and no sensitive fields once route/schema are documented. | ADMIN-002-US-002 |
| ADMIN-002-TC-011 | Traceability Verification | High | Repeated searches above threshold must return structured safe rate-limit behavior. | Coverage requires documented threshold, response status/schema, safe logs, and no credential/private data leakage. | ADMIN-002-US-003 |
| ADMIN-002-TC-012 | Traceability Verification | Critical | Search result minimization must be enforced. | Coverage requires only user id, display name, account status, created date, and email only if permitted; no passwords, hashes, tokens, cookies, private notes, raw auth data, debug fields, or unrestricted export data. | ADMIN-002-US-004 |
| ADMIN-002-TC-013 | Traceability Verification | High | User operational summary must be limited. | Coverage requires account status, created date, list count, rating count, public list count, and safe last admin action summary only. | ADMIN-002-US-005 |
| ADMIN-002-TC-014 | Traceability Verification | Critical | User detail must hide credentials and private data. | Coverage requires passwords, password hashes, access tokens, refresh tokens, cookies, private notes, and raw auth data absent from API/UI/accessibility/log/error surfaces. | ADMIN-002-US-006 |
| ADMIN-002-TC-015 | Traceability Verification | High | User detail view must be audited. | Coverage requires ASSERT-ADMIN-002-AUDIT-DETAIL after exact audit access is documented. | ADMIN-002-US-007 |
| ADMIN-002-TC-016 | Traceability Verification | Critical | Disable user with step-up and reason must be covered. | Coverage requires `admin.user.disable`, recent step-up, reason, disabled status, and ASSERT-ADMIN-002-AUDIT-STATUS after exact endpoint is documented. | ADMIN-002-US-008, ADMIN-002-US-015 |
| ADMIN-002-TC-017 | Traceability Verification | Critical | Disable user must revoke sessions and refresh tokens. | Coverage requires active sessions `2 -> 0`, refresh tokens `2 -> 0`, and no token value exposure. | ADMIN-002-US-009 |
| ADMIN-002-TC-018 | Traceability Verification | Critical | Disable user must preserve user-owned data. | Coverage requires lists `3`, ratings `4`, places `1`, public lists `1`, and audit history counts unchanged after disable. | ADMIN-002-US-010 |
| ADMIN-002-TC-019 | Traceability Verification | High | Disabled user access denial is an ADMIN-002 outcome but Auth mechanics are out of scope. | Coverage requires disabled users are denied login, refresh, and protected API access with safe error and no private data leak; exact Auth execution remains outside ADMIN-002 unless explicitly documented here. | ADMIN-002-US-011 |
| ADMIN-002-TC-020 | Traceability Verification | High | Re-enable user with reason must be covered. | Coverage requires `admin.user.disable`, reason, status `enabled`, normal-auth-rule handoff, and ASSERT-ADMIN-002-AUDIT-STATUS after exact endpoint is documented. | ADMIN-002-US-012, ADMIN-002-US-015 |
| ADMIN-002-TC-021 | Traceability Verification | High | Self-lockout prevention must be covered. | Coverage requires self-disable attempt for `admin-user-disable-001`, blocked result or documented break-glass/second-admin safeguard, unchanged active admin status, and audit result. | ADMIN-002-US-013 |
| ADMIN-002-TC-022 | Traceability Verification | Critical | Unrestricted user export must remain unavailable. | Coverage requires no unrestricted export path or a documented denial with scope, redaction, and audit requirements before any future export. | ADMIN-002-US-014 |
| ADMIN-002-TC-023 | Traceability Verification | Critical | Account status changes must be audited. | Coverage requires admin, target user, previous status, new status, reason, timestamp, request id, and result. | ADMIN-002-US-015 |
| ADMIN-002-TC-024 | Traceability Verification | High | User search screen accessibility must be covered. | Coverage requires keyboard navigation, focus-visible, accessible names, screen-reader behavior, and error announcements. | ADMIN-002-US-001, RESP-001-US-007, RESP-001-US-008, A11Y-001-US-014 |
| ADMIN-002-TC-025 | Traceability Verification | High | User detail and status-change dialog accessibility must be covered. | Coverage requires accessible status summary, reason dialog semantics, validation/error announcement, focus handling, and touch targets. | ADMIN-002-US-005, ADMIN-002-US-008, ADMIN-002-US-012, A11Y-001-US-001, A11Y-001-US-004, A11Y-001-US-006, RESP-003-US-008 |
| ADMIN-002-TC-026 | Traceability Verification | High | User tools responsive coverage must be included. | Coverage requires no horizontal overflow at `320x568`, `390x844`, `430x932`, phone landscape, tablet/laptop, and `200%` zoom with controls reachable. | ADMIN-002-US-001, ADMIN-002-US-005, RESP-002-US-001, RESP-002-US-002, RESP-002-US-012, RESP-003-US-001, RESP-003-US-002 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-002-TC-027 | Manual Verification | High | Verify safe logging for rate-limited searches and identifiable search results once logging sink is defined. | Logs contain safe metadata only and no passwords, hashes, tokens, cookies, private notes, raw auth data, or unrestricted export data. | ADMIN-002-US-003, ADMIN-002-US-006 |
| ADMIN-002-TC-028 | Manual Verification | Critical | Verify unrestricted user export is absent from UI, API documentation, and operational tooling unless a future scoped export requirement is approved. | No unrestricted user export is available. | ADMIN-002-US-014 |

## Summary

- Executable test cases: 0
- Requirement Clarification cases: 8
- Manual Verification cases: 2
- Traceability Verification cases: 18
- Total cases: 28

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- Generic Executable Wording: 0
- Executable API Tests using undocumented routes: 0
- Synthetic endpoints: 0
- Placeholder request targets: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Security Assumption Violations: 0
- Summary Count Mismatches: 0
- Final Verdict: Production Grade
