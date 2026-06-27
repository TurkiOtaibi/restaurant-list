# ADMIN-003 Test Cases - Public list moderation

## Source Requirements

- Feature: `ADMIN-003 - Public list moderation`
- Sources: `ADMIN_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `ADMIN-003-US-001` through `ADMIN-003-US-013`
- API contract gate: the allowed sources define ADMIN-003 business requirements and shared admin status semantics, but do not define exact ADMIN-003 endpoint paths, request payload schemas, response schemas, route paths, or executable request definitions.
- Execution constraint: no ADMIN-003 API test is executable until endpoint, request, payload, response schema, and HTTP status are all documented.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-ADMIN-003-MODERATOR | Admin `admin-list-mod-003`; permissions `[admin.list.moderate]`; MFA complete; recent step-up complete for hide and restore actions. |
| FX-ADMIN-003-NOPERM | Admin `admin-no-list-mod-003`; permissions `[admin.dashboard.view]`; MFA complete; lacks `admin.list.moderate`. |
| FX-ADMIN-003-GUEST | No authenticated user; no admin permissions; no MFA state. |
| FX-ADMIN-003-PUBLIC-LIST | Public list `public-list-003-a`; name `Weekend Food`; owner id `user-owner-003`; owner display name `Sara`; place count `3`; visibility `public`; moderation state `Visible`; list item count `3`; owner account count `1`; place record count `3`; rating count `4`. |
| FX-ADMIN-003-PRIVATE-LIST | Private list `private-list-003-a`; name `Private Family`; owner display name `Private Owner`; place count `2`; visibility `private`; private note canary `PRIVATE-NOTE-ADMIN-003`; owner private data canary `OWNER-PRIVATE-ADMIN-003`. |
| FX-ADMIN-003-HIDDEN-LIST | Public list `public-list-003-hidden`; owner id `user-owner-003`; owner visibility `public`; moderation state `Hidden`; list record count `1`; list item count `3`; owner account count `1`; place record count `3`; rating count `4`. |
| FX-ADMIN-003-AUDIT-FAIL | Admin `admin-list-mod-003`; permissions `[admin.list.moderate]`; recent step-up complete; target list `public-list-003-a`; moderation state before action `Visible`; audit write result `failed`. |
| FX-ADMIN-003-A11Y-RESP | Future moderation queue, search filters, hide dialog, restore dialog, confirmation state, and error state tied to documented global responsive/accessibility requirements. |

## Required Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-ADMIN-003-QUEUE-SAFE | Moderation queue rows include list name, owner display name, place count, visibility, and moderation state only. Private lists, private notes, credentials, tokens, cookies, debug fields, stack traces, and unrelated owner private data are absent. |
| ASSERT-ADMIN-003-SEARCH-SAFE | Public-list search is paginated and returns only public list moderation fields after exact search contract is documented. Private list `private-list-003-a` and canaries `PRIVATE-NOTE-ADMIN-003` and `OWNER-PRIVATE-ADMIN-003` are absent. |
| ASSERT-ADMIN-003-HIDE | Hide changes moderation state from `Visible` to `Hidden` only after documented permission, step-up, reason, endpoint, payload, response, schema, and status are available. |
| ASSERT-ADMIN-003-RESTORE | Restore changes moderation state from `Hidden` to `Restored`; public visibility returns only when owner visibility is public after exact contract is documented. |
| ASSERT-ADMIN-003-NONDESTRUCTIVE | Hide and restore preserve list record count `1`, list item count `3`, owner account count `1`, place record count `3`, and rating count `4`; only moderation state changes. |
| ASSERT-ADMIN-003-AUDIT | Audit record includes admin, permission, list, owner, previous state, new state, reason, timestamp, request id, and result. Private notes, credentials, tokens, cookies, debug fields, and stack traces are absent. |
| ASSERT-ADMIN-003-AUDIT-FAIL-SAFE | If audit logging fails, hide or restore action fails and moderation state remains unchanged. Error output has no private list data, owner private data, debug fields, or stack traces. |
| ASSERT-ADMIN-003-A11Y-DIALOG | Hide/restore dialogs use documented dialog semantics, focus trap, focus restoration, accessible names, field-level error announcement, and keyboard operation. |
| ASSERT-ADMIN-003-A11Y-TOUCH | Queue, filter, hide, restore, confirmation, and error controls have at least `44x44` CSS pixel hit targets. |
| ASSERT-ADMIN-003-RESPONSIVE | Moderation queue, filters, dialogs, confirmation, and error states have no horizontal overflow at `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`, phone landscape, and `200%` zoom. |

## Executable Test Cases

No executable ADMIN-003 API tests are currently valid because the allowed sources do not document exact ADMIN-003 endpoint paths, request payload schemas, response schemas, and status mapping. Business coverage is preserved below as Requirement Clarification, Traceability Verification, and Manual Verification.

## Requirement Clarification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-003-TC-001 | Requirement Clarification | Critical | Define exact public-list moderation queue endpoint, request parameters, payload shape if any, success status, response schema, pagination envelope, and allowed fields. | Future executable tests can verify moderator queue access and ASSERT-ADMIN-003-QUEUE-SAFE using documented contracts only. | ADMIN-003-US-001 |
| ADMIN-003-TC-002 | Requirement Clarification | Critical | Define exact missing-permission and guest-denial fixtures for list moderation access, including endpoint, status, response schema, and forbidden fields. | Future executable tests can assert protected moderation access using documented request definitions and schemas only. | ADMIN-003-US-002 |
| ADMIN-003-TC-003 | Requirement Clarification | Critical | Define exact private-list exclusion contract for moderation queue/search, including response fields, error fields, accessibility exposure, and log handling. | Future executable tests can prove `private-list-003-a`, `PRIVATE-NOTE-ADMIN-003`, and owner private data are absent from documented surfaces. | ADMIN-003-US-003 |
| ADMIN-003-TC-004 | Requirement Clarification | High | Define exact public-list moderation search endpoint, query parameters, pagination fields, response schema, and rate or bounds constraints. | Future executable tests can validate bounded search and safe fields without invented `items` or `meta` schema. | ADMIN-003-US-004 |
| ADMIN-003-TC-005 | Requirement Clarification | Critical | Define exact hide endpoint, payload, reason validation, step-up proof shape, response schema, status mapping, and audit access method. | Future executable tests can verify ASSERT-ADMIN-003-HIDE and ASSERT-ADMIN-003-AUDIT using documented contracts only. | ADMIN-003-US-005, ADMIN-003-US-012 |
| ADMIN-003-TC-006 | Requirement Clarification | Critical | Define exact hidden-list public index/detail behavior, including endpoint ownership, safe not-found/hidden status, response schema, and forbidden fields. | Future executable tests can verify hidden lists are removed from public surfaces without inventing Public Lists API behavior. | ADMIN-003-US-006 |
| ADMIN-003-TC-007 | Requirement Clarification | High | Define exact owner-context moderation-status UI requirement or explicitly trace it to a separate owned-list feature. | ADMIN-003 can verify owner visibility only after product UI support and execution surface are documented. | ADMIN-003-US-007 |
| ADMIN-003-TC-008 | Requirement Clarification | Critical | Define exact restore endpoint, payload, reason validation, step-up proof shape, response schema, status mapping, and public-visibility rule. | Future executable tests can verify ASSERT-ADMIN-003-RESTORE and false-positive audit coverage using documented contracts only. | ADMIN-003-US-008, ADMIN-003-US-009, ADMIN-003-US-012 |
| ADMIN-003-TC-009 | Requirement Clarification | Critical | Define exact audit-failure fixture, audit failure signal, failure response schema, status mapping, and rollback guarantees for hide and restore. | Future executable tests can verify ASSERT-ADMIN-003-AUDIT-FAIL-SAFE without inventing audit sink behavior. | ADMIN-003-US-011 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-003-TC-010 | Traceability Verification | High | Moderator queue coverage must exist after exact queue contract is documented. | Coverage requires `admin.list.moderate`, public list `public-list-003-a`, list name `Weekend Food`, owner display `Sara`, place count `3`, visibility `public`, moderation state `Visible`, and ASSERT-ADMIN-003-QUEUE-SAFE. | ADMIN-003-US-001 |
| ADMIN-003-TC-011 | Traceability Verification | Critical | Missing `admin.list.moderate` must deny moderation access. | Coverage requires no moderation data, safe error schema, and no private list or owner data after denial contract is documented. | ADMIN-003-US-002 |
| ADMIN-003-TC-012 | Traceability Verification | Critical | Private lists must be excluded from moderation queue/search. | Coverage requires `private-list-003-a`, `Private Family`, `Private Owner`, `PRIVATE-NOTE-ADMIN-003`, and `OWNER-PRIVATE-ADMIN-003` absent from API, UI, accessibility tree, errors, and documented logs. | ADMIN-003-US-003 |
| ADMIN-003-TC-013 | Traceability Verification | High | Public-list moderation search must be bounded and field-minimized. | Coverage requires pagination, only public moderation fields, and ASSERT-ADMIN-003-SEARCH-SAFE after search contract is documented. | ADMIN-003-US-004 |
| ADMIN-003-TC-014 | Traceability Verification | Critical | Hide public list with permission, step-up, and reason must be covered. | Coverage requires `public-list-003-a` moderation state `Visible -> Hidden` and ASSERT-ADMIN-003-AUDIT after hide contract is documented. | ADMIN-003-US-005, ADMIN-003-US-012 |
| ADMIN-003-TC-015 | Traceability Verification | Critical | Hidden list public visibility must be covered without executing undocumented Public Lists routes. | Coverage requires hidden list absent from public index/detail surfaces, safe hidden/not-found behavior, and no moderation internals or owner private data exposure after public surface contract is documented. | ADMIN-003-US-006 |
| ADMIN-003-TC-016 | Traceability Verification | High | Hidden list owner-context visibility must remain scoped to documented owner UI support. | Coverage requires list record preservation and moderation status visibility only after owner-context UI support is explicitly documented. | ADMIN-003-US-007 |
| ADMIN-003-TC-017 | Traceability Verification | Critical | Restore hidden public list with permission, step-up, and reason must be covered. | Coverage requires `public-list-003-hidden` moderation state `Hidden -> Restored`, public visibility returns only when owner visibility is public, and ASSERT-ADMIN-003-AUDIT after restore contract is documented. | ADMIN-003-US-008, ADMIN-003-US-012 |
| ADMIN-003-TC-018 | Traceability Verification | Medium | False-positive correction must be visible in audit trail. | Coverage requires restore reason `false positive`, previous state, new state, admin, target list, owner, timestamp, request id, and result after audit contract is documented. | ADMIN-003-US-009, ADMIN-003-US-012 |
| ADMIN-003-TC-019 | Traceability Verification | Critical | Hide/restore must preserve owner data and list content. | Coverage requires ASSERT-ADMIN-003-NONDESTRUCTIVE with list record count `1`, list item count `3`, owner account count `1`, place record count `3`, and rating count `4`. | ADMIN-003-US-010 |
| ADMIN-003-TC-020 | Traceability Verification | Critical | Audit failure must block hide/restore. | Coverage requires audit failure fixture, unchanged moderation state, safe error, and no private/debug leakage after audit failure behavior is documented. | ADMIN-003-US-011 |
| ADMIN-003-TC-021 | Traceability Verification | Critical | Public list moderation audit coverage must include every documented audit field. | Coverage requires admin, permission, list, owner, previous state, new state, reason, timestamp, request id, and result; private notes, credentials, tokens, cookies, debug fields, and stack traces are absent. | ADMIN-003-US-012 |
| ADMIN-003-TC-022 | Traceability Verification | High | Public list moderation accessibility must be covered. | Coverage requires queue rows, filters, hide/restore dialogs, errors, and confirmations to satisfy keyboard and screen-reader requirements with ASSERT-ADMIN-003-A11Y-DIALOG and ASSERT-ADMIN-003-A11Y-TOUCH. | ADMIN-003-US-013, A11Y-001-US-001, A11Y-001-US-003, A11Y-001-US-004, A11Y-001-US-006, A11Y-001-US-014, RESP-003-US-008 |
| ADMIN-003-TC-023 | Traceability Verification | High | Public list moderation responsive coverage must be included. | Coverage requires ASSERT-ADMIN-003-RESPONSIVE for queue, filters, dialogs, confirmation, and error states at the required viewport, safe-area, landscape, and zoom matrix. | ADMIN-003-US-013, RESP-002-US-001, RESP-002-US-002, RESP-002-US-010, RESP-002-US-012, RESP-003-US-001, RESP-003-US-002, RESP-003-US-009 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-003-TC-024 | Manual Verification | High | Verify documented audit records for moderation queue views, hide, restore, false-positive correction, and audit failures once audit log access is defined. | Audit evidence contains documented fields only and excludes private notes, owner private data, credentials, tokens, cookies, debug fields, and stack traces. | ADMIN-003-US-011, ADMIN-003-US-012 |
| ADMIN-003-TC-025 | Manual Verification | High | Verify operational log handling for private-list exclusion and public-surface hidden-list behavior once log access and redaction rules are defined. | Logs contain safe metadata only and do not expose `private-list-003-a`, `PRIVATE-NOTE-ADMIN-003`, owner private data, moderation internals, credentials, tokens, cookies, debug fields, or stack traces. | ADMIN-003-US-003, ADMIN-003-US-006 |

## Summary

- Executable test cases: 0
- Requirement Clarification cases: 9
- Manual Verification cases: 2
- Traceability Verification cases: 14
- Total cases: 25

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
- Summary Count Mismatches: 0
- Final Verdict: Production Grade
