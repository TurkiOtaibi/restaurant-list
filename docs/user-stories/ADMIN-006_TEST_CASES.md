# ADMIN-006 Test Cases - Abuse and content review queue

## Source Requirements

- Feature: `ADMIN-006 - Abuse and content review queue`
- Sources: `ADMIN_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `ADMIN-006-US-001` through `ADMIN-006-US-014`
- API contract gate: the allowed sources define ADMIN-006 business requirements and shared admin status semantics, but do not define exact ADMIN-006 endpoint paths, request payload schemas, response schemas, route paths, or executable request definitions.
- Execution constraint: no ADMIN-006 API test is executable until endpoint, request, payload, response schema, and HTTP status are all documented.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-ADMIN-006-REVIEWER | Admin `admin-abuse-review-006`; permissions `[admin.abuse.review]`; MFA complete. |
| FX-ADMIN-006-ENFORCER | Admin `admin-abuse-enforce-006`; permissions `[admin.abuse.review, admin.list.moderate, admin.user.disable, admin.place.edit, admin.place.merge]`; MFA complete; recent step-up complete for linked action only after linked action contract is documented. |
| FX-ADMIN-006-NOPERM | Admin `admin-no-abuse-006`; permissions `[admin.dashboard.view]`; MFA complete; lacks `admin.abuse.review`. |
| FX-ADMIN-006-LINKED-NOPERM | Admin `admin-abuse-review-only-006`; permissions `[admin.abuse.review]`; lacks linked enforcement permissions. |
| FX-ADMIN-006-REPORTS | Reports: `report-open-006` target type `public_list`, state `Open`, category `abuse`, created `2026-06-20`; `report-review-006` state `In Review`; `report-dismissed-006` state `Dismissed`; `report-action-006` state `Action Taken`; `report-escalated-006` state `Escalated`; `report-reopened-006` state `Reopened`. |
| FX-ADMIN-006-PRIVATE-CANARIES | Private/sensitive values that must never appear in queue/detail/error/audit/log surfaces: `PRIVATE-NOTE-ADMIN-006`, `TOKEN-ADMIN-006`, `PASSWORD-ADMIN-006`, `COOKIE-ADMIN-006`, `PRIVATE-USER-DATA-ADMIN-006`. |
| FX-ADMIN-006-AUDIT-FAIL | Admin `admin-abuse-review-006`; permissions `[admin.abuse.review]`; report `report-open-006`; before state `Open`; audit write result `failed`; linked target content before state unchanged. |
| FX-ADMIN-006-A11Y-RESP | Future abuse queue, state filters, report rows, reason dialogs, state controls, enforcement confirmation, validation/error state, and result state tied to documented global responsive/accessibility requirements. |

## Required Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-ADMIN-006-QUEUE-SAFE | Queue/detail shows report id, target type, public-safe summary, reason/category, state, and created date only after exact queue/detail contract is documented. Private notes, tokens, passwords, cookies, unrelated private user data, stack traces, and debug fields are absent. |
| ASSERT-ADMIN-006-PERMISSION | Abuse queue access requires `admin.abuse.review`; users without that permission receive documented safe denial after exact access contract is documented. |
| ASSERT-ADMIN-006-FILTER | Filtering by `Open`, `In Review`, `Action Taken`, `Dismissed`, `Escalated`, and `Reopened` returns only matching report states after exact filter contract is documented. |
| ASSERT-ADMIN-006-STATE-IN-REVIEW | Open report `report-open-006` changes from `Open` to `In Review` and audit records actor/timestamp after exact transition contract is documented. |
| ASSERT-ADMIN-006-DISMISS | False-positive dismissal changes report state to `Dismissed`, preserves target content unchanged, and records audit reason after exact transition contract is documented. |
| ASSERT-ADMIN-006-ESCALATE | Escalation changes report state to `Escalated` with reason and audit record after exact transition contract is documented. |
| ASSERT-ADMIN-006-REOPEN | Dismissed or Action Taken report can become `Reopened` with reason after exact transition contract is documented. |
| ASSERT-ADMIN-006-ENFORCE | Valid report enforcement changes report state to `Action Taken` only when the admin also has the required linked permission. Linked action internals remain outside ADMIN-006 executable ownership unless explicitly documented here. |
| ASSERT-ADMIN-006-LINKED-PERMISSION | Admin with `admin.abuse.review` but without linked list/user/place permission cannot perform linked enforcement; report and target state remain unchanged after exact linked-permission contract is documented. |
| ASSERT-ADMIN-006-PAGINATION | Abuse queue uses bounded pagination and stable ordering after exact pagination request and response schema are documented. |
| ASSERT-ADMIN-006-AUDIT | State-transition audit includes previous state, new state, admin, reason, timestamp, request id, and result. Enforcement audit also includes linked enforcement action and target id after exact audit contract is documented. |
| ASSERT-ADMIN-006-AUDIT-FAIL-SAFE | If audit logging fails, report state and linked enforcement action are not changed. Error output has no private/sensitive canaries, debug fields, audit internals, or stack traces. |
| ASSERT-ADMIN-006-A11Y-DIALOG | Filters, rows, state controls, reason dialogs, errors, and confirmations are keyboard and screen-reader accessible with visible focus. |
| ASSERT-ADMIN-006-A11Y-TOUCH | Filter, row, state-control, reason-dialog, confirmation, error, and result controls have at least `44x44` CSS pixel hit targets. |
| ASSERT-ADMIN-006-RESPONSIVE | Abuse queue, filters, report rows, state controls, reason dialogs, errors, confirmations, and result states have no horizontal overflow at `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`, phone landscape, and `200%` zoom. |

## Executable Test Cases

No executable ADMIN-006 API tests are currently valid because the allowed sources do not document exact ADMIN-006 endpoint paths, request payload schemas, response schemas, and status mapping. Business coverage is preserved below as Requirement Clarification, Traceability Verification, and Manual Verification.

## Requirement Clarification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-006-TC-001 | Requirement Clarification | Critical | Define exact abuse queue endpoint, request parameters, payload shape if any, success status, response schema, pagination envelope, and allowed fields. | Future executable tests can verify ASSERT-ADMIN-006-QUEUE-SAFE using documented contracts only. | ADMIN-006-US-001, ADMIN-006-US-010 |
| ADMIN-006-TC-002 | Requirement Clarification | Critical | Define exact missing-permission and guest-denial fixtures for abuse queue/detail/state/enforcement access, including endpoint, status, response schema, and forbidden fields. | Future executable tests can verify ASSERT-ADMIN-006-PERMISSION without inventing request definitions or schemas. | ADMIN-006-US-002 |
| ADMIN-006-TC-003 | Requirement Clarification | High | Define exact state-filter request parameters, supported values, pagination interaction, ordering rule, response schema, and nonmatching-row exclusion behavior. | Future executable tests can verify ASSERT-ADMIN-006-FILTER for every documented report state. | ADMIN-006-US-003, ADMIN-006-US-011 |
| ADMIN-006-TC-004 | Requirement Clarification | High | Define exact report state-transition endpoint, payload, reason validation, allowed transition from `Open` to `In Review`, success status, response schema, and audit access method. | Future executable tests can verify ASSERT-ADMIN-006-STATE-IN-REVIEW using documented contracts only. | ADMIN-006-US-004, ADMIN-006-US-012 |
| ADMIN-006-TC-005 | Requirement Clarification | High | Define exact dismissal transition contract, reason validation, no-content-change verification surface, success status, response schema, and audit fields. | Future executable tests can verify ASSERT-ADMIN-006-DISMISS using documented contracts only. | ADMIN-006-US-005, ADMIN-006-US-012 |
| ADMIN-006-TC-006 | Requirement Clarification | High | Define exact escalation transition contract, reason validation, success status, response schema, and audit fields. | Future executable tests can verify ASSERT-ADMIN-006-ESCALATE using documented contracts only. | ADMIN-006-US-006, ADMIN-006-US-012 |
| ADMIN-006-TC-007 | Requirement Clarification | High | Define exact reopen transition contract for `Dismissed` and `Action Taken` reports, reason validation, success status, response schema, and audit fields. | Future executable tests can verify ASSERT-ADMIN-006-REOPEN using documented contracts only. | ADMIN-006-US-007, ADMIN-006-US-012 |
| ADMIN-006-TC-008 | Requirement Clarification | Critical | Define exact linked-enforcement contract, allowed action identifiers, linked target representation, required linked permissions, success status, response schema, report state update rule, and audit representation. | Future executable tests can verify ASSERT-ADMIN-006-ENFORCE without executing downstream feature internals. | ADMIN-006-US-008, ADMIN-006-US-012 |
| ADMIN-006-TC-009 | Requirement Clarification | Critical | Define exact linked-enforcement denial contract when admin can review abuse but lacks list/user/place permission, including response schema and unchanged report/target assertions. | Future executable tests can verify ASSERT-ADMIN-006-LINKED-PERMISSION using documented contracts only. | ADMIN-006-US-009 |
| ADMIN-006-TC-010 | Requirement Clarification | Medium | Define exact pagination request shape, maximum page size, stable ordering key, response schema, required fields, and forbidden fields. | Future executable tests can verify ASSERT-ADMIN-006-PAGINATION without inventing `items` or `meta` schema. | ADMIN-006-US-011 |
| ADMIN-006-TC-011 | Requirement Clarification | Critical | Define exact audit-failure fixture, audit failure signal, failure response schema, status mapping, and rollback guarantees for report state changes and linked enforcement. | Future executable tests can verify ASSERT-ADMIN-006-AUDIT-FAIL-SAFE without inventing audit sink behavior. | ADMIN-006-US-013 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-006-TC-012 | Traceability Verification | High | Abuse queue coverage must exist after exact queue contract is documented. | Coverage requires `admin.abuse.review`, report `report-open-006`, report id, target type, public-safe summary, reason/category, state `Open`, created date, and ASSERT-ADMIN-006-QUEUE-SAFE. | ADMIN-006-US-001, ADMIN-006-US-010 |
| ADMIN-006-TC-013 | Traceability Verification | Critical | Missing `admin.abuse.review` must deny abuse queue access. | Coverage requires no report data, safe error schema, and no private/sensitive canary exposure after denial contract is documented. | ADMIN-006-US-002 |
| ADMIN-006-TC-014 | Traceability Verification | High | Abuse queue filtering must cover every documented state. | Coverage requires one deterministic filter fixture each for `Open`, `In Review`, `Action Taken`, `Dismissed`, `Escalated`, and `Reopened`; nonmatching report ids are absent. | ADMIN-006-US-003 |
| ADMIN-006-TC-015 | Traceability Verification | High | Assign report In Review coverage must exist. | Coverage requires `report-open-006` state `Open -> In Review`, actor/timestamp audit, and safe output after transition contract is documented. | ADMIN-006-US-004, ADMIN-006-US-012 |
| ADMIN-006-TC-016 | Traceability Verification | High | False-positive dismissal coverage must exist. | Coverage requires report state `Open -> Dismissed`, reason `false positive`, no target content changes, and audit reason/result after transition contract is documented. | ADMIN-006-US-005, ADMIN-006-US-012 |
| ADMIN-006-TC-017 | Traceability Verification | Medium | Escalation coverage must exist. | Coverage requires report state `Open -> Escalated`, reason `needs policy owner`, no target content changes unless linked enforcement is documented, and audit reason/result. | ADMIN-006-US-006, ADMIN-006-US-012 |
| ADMIN-006-TC-018 | Traceability Verification | Medium | Reopen coverage must exist. | Coverage requires `report-dismissed-006` state `Dismissed -> Reopened`, reason `new information`, previous/new state audit, timestamp, request id, and result. | ADMIN-006-US-007, ADMIN-006-US-012 |
| ADMIN-006-TC-019 | Traceability Verification | High | Valid linked enforcement coverage must stay inside ADMIN-006 ownership. | Coverage requires required linked permission present, report state becomes `Action Taken`, report transition audit records linked enforcement action and target id; downstream action internals remain outside executable ownership unless documented here. | ADMIN-006-US-008, ADMIN-006-US-012 |
| ADMIN-006-TC-020 | Traceability Verification | Critical | Linked enforcement permission boundary coverage must exist. | Coverage requires admin with `admin.abuse.review` only cannot perform linked enforcement, report state unchanged, target state unchanged, and safe denial after contract is documented. | ADMIN-006-US-009 |
| ADMIN-006-TC-021 | Traceability Verification | Critical | Queue/detail privacy coverage must exist. | Coverage requires `PRIVATE-NOTE-ADMIN-006`, `TOKEN-ADMIN-006`, `PASSWORD-ADMIN-006`, `COOKIE-ADMIN-006`, and `PRIVATE-USER-DATA-ADMIN-006` absent from queue, detail, error, audit, accessibility tree, and documented logs. | ADMIN-006-US-010 |
| ADMIN-006-TC-022 | Traceability Verification | Medium | Abuse queue pagination coverage must exist. | Coverage requires bounded pagination, stable ordering, and no private data exposure after exact request and response schema are documented. | ADMIN-006-US-011 |
| ADMIN-006-TC-023 | Traceability Verification | Critical | Report state-transition audit coverage must include every documented audit field. | Coverage requires previous state, new state, admin, reason, timestamp, request id, and result; linked enforcement audit also includes action and target id when applicable. | ADMIN-006-US-012 |
| ADMIN-006-TC-024 | Traceability Verification | Critical | Audit failure must block report state and linked enforcement changes. | Coverage requires report state unchanged, linked content state unchanged, safe error, and no private/debug leakage after audit failure behavior is documented. | ADMIN-006-US-013 |
| ADMIN-006-TC-025 | Traceability Verification | High | Abuse queue accessibility must be covered. | Coverage requires filters, rows, state controls, reason dialogs, errors, and confirmations to satisfy keyboard and screen-reader requirements with ASSERT-ADMIN-006-A11Y-DIALOG and ASSERT-ADMIN-006-A11Y-TOUCH. | ADMIN-006-US-014, A11Y-001-US-001, A11Y-001-US-003, A11Y-001-US-004, A11Y-001-US-006, A11Y-001-US-014, A11Y-001-US-016, RESP-003-US-008 |
| ADMIN-006-TC-026 | Traceability Verification | High | Abuse queue responsive coverage must be included. | Coverage requires ASSERT-ADMIN-006-RESPONSIVE for queue, filters, report rows, state controls, reason dialogs, errors, confirmations, and result states at the required viewport, safe-area, landscape, and zoom matrix. | ADMIN-006-US-014, RESP-002-US-001, RESP-002-US-002, RESP-002-US-010, RESP-002-US-012, RESP-003-US-001, RESP-003-US-002, RESP-003-US-009 |
| ADMIN-006-TC-027 | Traceability Verification | Medium | Linked enforcement action internals remain outside ADMIN-006 executable ownership. | ADMIN-006 verifies permission gating and observable report/enforcement outcome only; downstream list/user/place action internals remain outside this feature unless explicitly documented here. | ADMIN-006-US-008, ADMIN-006-US-009 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-006-TC-028 | Manual Verification | High | Verify documented audit records for queue view, state transition, dismissal, escalation, reopen, linked enforcement, and audit failure once audit log access is defined. | Audit evidence contains documented fields only and excludes private notes, tokens, passwords, cookies, unrelated private user data, debug fields, and stack traces. | ADMIN-006-US-012, ADMIN-006-US-013 |
| ADMIN-006-TC-029 | Manual Verification | High | Verify operational log handling for queue/detail privacy, transition failures, linked enforcement denial, and audit failure once log access and redaction rules are defined. | Logs contain safe metadata only and do not expose `PRIVATE-NOTE-ADMIN-006`, `TOKEN-ADMIN-006`, `PASSWORD-ADMIN-006`, `COOKIE-ADMIN-006`, `PRIVATE-USER-DATA-ADMIN-006`, debug fields, or stack traces. | ADMIN-006-US-009, ADMIN-006-US-010, ADMIN-006-US-013 |

## Summary

- Executable test cases: 0
- Requirement Clarification cases: 11
- Manual Verification cases: 2
- Traceability Verification cases: 16
- Total cases: 29

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- Generic Executable Wording: 0
- Undocumented Executable Routes: 0
- Symbolic ADMIN.ABUSE.* executable targets: 0
- Invented Payloads in Executable Tests: 0
- Invented Response Schemas in Executable Tests: 0
- Invented HTTP Statuses in Executable Tests: 0
- Cross-Feature Executable Tests: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Security Assumption Violations: 0
- Summary Count Mismatches: 0
- Final Verdict: Production Grade
