# ADMIN-007 Test Cases - Beta operational dashboard

## Source Requirements

- Feature: `ADMIN-007 - Beta operational dashboard`
- Sources: `ADMIN_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `ADMIN-007-US-001` through `ADMIN-007-US-012`
- API contract gate: the allowed sources define ADMIN-007 business requirements and shared admin status semantics, but do not define exact ADMIN-007 endpoint paths, request payload schemas, response schemas, route paths, or executable request definitions.
- Execution constraint: no ADMIN-007 API test is executable until endpoint, request, payload, response schema, and HTTP status are all documented.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-ADMIN-007-VIEWER | Admin `admin-dashboard-007`; permissions `[admin.dashboard.view]`; MFA complete. |
| FX-ADMIN-007-NOPERM | Admin `admin-no-dashboard-007`; permissions `[admin.user.view]`; MFA complete; lacks `admin.dashboard.view`. |
| FX-ADMIN-007-DRILLDOWN-LIMITED | Admin `admin-dashboard-007`; permissions `[admin.dashboard.view]`; lacks user/list/place/report drill-down permissions. |
| FX-ADMIN-007-DRILLDOWN-FULL | Admin `admin-dashboard-full-007`; permissions `[admin.dashboard.view, admin.user.view, admin.list.moderate, admin.place.edit, admin.place.merge, admin.abuse.review]`. |
| FX-ADMIN-007-METRICS | Aggregate counts: users `12`; places `20`; lists `9`; public lists `5`; ratings `33`; pending reports `4`; recent moderation actions `2`; moderation metrics: open reports `3`; in-review reports `1`; hidden public lists `2`; duplicate candidates `6`; recent action count `2`; freshness timestamp `2026-06-27T09:30:00Z`. |
| FX-ADMIN-007-HEALTH | Liveness `pass`; readiness `pass`; deployment marker `release-2026.06.27`; migration status `current`; data freshness timestamp `2026-06-27T09:30:00Z`. |
| FX-ADMIN-007-SENSITIVE | Sensitive canaries: `PASSWORD-ADMIN-007`, `HASH-ADMIN-007`, `TOKEN-ADMIN-007`, `COOKIE-ADMIN-007`, `PRIVATE-NOTE-ADMIN-007`, `RAW-SECRET-ADMIN-007`, `PRIVATE-ACCOUNT-ADMIN-007`, `email-private-007@example.test`. |
| FX-ADMIN-007-A11Y-RESP | Future dashboard cards, drill-down links, filters, error state, no-export state, health/deployment panel, and freshness indicators tied to documented global responsive/accessibility requirements. |

## Required Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-ADMIN-007-AGGREGATES | Dashboard shows aggregate counts only: users `12`, places `20`, lists `9`, public lists `5`, ratings `33`, pending reports `4`, recent moderation actions `2`; no row-level private content is shown after exact dashboard summary contract is documented. |
| ASSERT-ADMIN-007-HEALTH | Health/deployment panel shows liveness `pass`, readiness `pass`, deployment marker `release-2026.06.27`, migration status `current`, and data freshness timestamp `2026-06-27T09:30:00Z` after exact health contract is documented. |
| ASSERT-ADMIN-007-MODERATION-METRICS | Dashboard moderation metrics show open reports `3`, in-review reports `1`, hidden public lists `2`, duplicate candidates `6`, and recent action count `2` after exact moderation metrics contract is documented. |
| ASSERT-ADMIN-007-DRILLDOWN-PERMISSION | Dashboard aggregate cards may show allowed counts, but drill-down links are hidden or denied when the admin lacks the underlying user/list/place/report permission after exact drill-down contract is documented. |
| ASSERT-ADMIN-007-SAFE | Passwords, hashes, tokens, cookies, private notes, raw secrets, emails unless permitted, private account metadata, stack traces, and debug fields are absent from dashboard API, UI, accessibility tree, errors, audit, and documented logs. |
| ASSERT-ADMIN-007-FRESHNESS | Each metric group shows timestamp/source or a global freshness indicator; fixture value is `2026-06-27T09:30:00Z` after exact freshness display contract is documented. |
| ASSERT-ADMIN-007-NO-EXPORT | Unrestricted dashboard export is unavailable; any future export requires explicit permission, scope, minimization, redaction, and audit after exact export policy contract is documented. |
| ASSERT-ADMIN-007-AUDIT-ACCESS | Dashboard access audit includes admin id, timestamp, request id, and result after exact audit access method and schema are documented. |
| ASSERT-ADMIN-007-AUDIT-DRILLDOWN | Dashboard drill-down audit includes admin id, target area, permission used, timestamp, and request id after exact audit access method and schema are documented. |
| ASSERT-ADMIN-007-A11Y | Dashboard cards, links, filters, errors, drill-down controls, no-export state, health/deployment panel, and freshness indicators are keyboard and screen-reader accessible with visible focus. |
| ASSERT-ADMIN-007-TOUCH | Dashboard cards, links, filters, errors, drill-down controls, no-export state, and health/deployment controls have at least `44x44` CSS pixel hit targets. |
| ASSERT-ADMIN-007-RESPONSIVE | Dashboard cards, links, filters, errors, drill-down controls, no-export state, health/deployment panel, and freshness indicators remain readable with no horizontal overflow at `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`, phone landscape, and `200%` zoom. |

## Executable Test Cases

No executable ADMIN-007 API tests are currently valid because the allowed sources do not document exact ADMIN-007 endpoint paths, request payload schemas, response schemas, and status mapping. Business coverage is preserved below as Requirement Clarification, Traceability Verification, and Manual Verification.

## Requirement Clarification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-007-TC-001 | Requirement Clarification | Critical | Define exact dashboard summary endpoint, request parameters, payload shape if any, success status, response schema, aggregate count fields, allowed fields, and forbidden fields. | Future executable tests can verify ASSERT-ADMIN-007-AGGREGATES using documented contracts only. | ADMIN-007-US-001 |
| ADMIN-007-TC-002 | Requirement Clarification | Critical | Define exact missing-permission and guest-denial fixtures for dashboard summary, health, moderation metrics, drill-down, and export access, including endpoint, status, response schema, and forbidden fields. | Future executable tests can verify dashboard protection without inventing request definitions or schemas. | ADMIN-007-US-002 |
| ADMIN-007-TC-003 | Requirement Clarification | High | Define exact health/deployment summary contract, data source, response schema, field names, freshness rule, and failure behavior. | Future executable tests can verify ASSERT-ADMIN-007-HEALTH using documented contracts only. | ADMIN-007-US-003 |
| ADMIN-007-TC-004 | Requirement Clarification | High | Define exact moderation metrics contract, metric names, response schema, freshness rule, and forbidden row-level fields. | Future executable tests can verify ASSERT-ADMIN-007-MODERATION-METRICS without inventing schema fields. | ADMIN-007-US-004 |
| ADMIN-007-TC-005 | Requirement Clarification | Critical | Define exact drill-down permission contract, target-area values, hidden-versus-denied behavior, denial schema, audit schema, and cross-feature ownership boundary. | Future executable tests can verify ASSERT-ADMIN-007-DRILLDOWN-PERMISSION without executing downstream feature internals. | ADMIN-007-US-005, ADMIN-007-US-010 |
| ADMIN-007-TC-006 | Requirement Clarification | Critical | Define exact dashboard sensitive-data response/UI/accessibility/error/log surfaces and whether email visibility has a separate permission rule. | Future executable tests can verify ASSERT-ADMIN-007-SAFE across documented surfaces only. | ADMIN-007-US-006 |
| ADMIN-007-TC-007 | Requirement Clarification | Medium | Define exact metric freshness display contract, timestamp/source field names, global versus per-group rule, accepted format, and stale-data behavior. | Future executable tests can verify ASSERT-ADMIN-007-FRESHNESS deterministically. | ADMIN-007-US-007 |
| ADMIN-007-TC-008 | Requirement Clarification | Critical | Define exact unrestricted-export absence or denial behavior, including whether an endpoint exists, denial status, response schema, future export preconditions, and audit fields. | Future executable tests can verify ASSERT-ADMIN-007-NO-EXPORT without inventing export payloads or routes. | ADMIN-007-US-008 |
| ADMIN-007-TC-009 | Requirement Clarification | High | Define exact dashboard access audit access method, audit schema, required fields, forbidden fields, and retention/access controls. | Future executable tests can verify ASSERT-ADMIN-007-AUDIT-ACCESS without undocumented audit behavior. | ADMIN-007-US-009 |
| ADMIN-007-TC-010 | Requirement Clarification | High | Define exact dashboard drill-down audit access method, target-area schema, permission-used field, required fields, forbidden fields, and safe denial audit behavior. | Future executable tests can verify ASSERT-ADMIN-007-AUDIT-DRILLDOWN without undocumented audit behavior. | ADMIN-007-US-010 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-007-TC-011 | Traceability Verification | Medium | Beta operational summary coverage must exist after exact dashboard summary contract is documented. | Coverage requires `admin.dashboard.view`, aggregate users `12`, places `20`, lists `9`, public lists `5`, ratings `33`, pending reports `4`, recent moderation actions `2`, Western digits, and ASSERT-ADMIN-007-AGGREGATES. | ADMIN-007-US-001 |
| ADMIN-007-TC-012 | Traceability Verification | High | Missing `admin.dashboard.view` must deny dashboard access. | Coverage requires no dashboard metrics, safe error schema, and no sensitive data after denial contract is documented. | ADMIN-007-US-002 |
| ADMIN-007-TC-013 | Traceability Verification | High | Health/deployment summary coverage must exist after exact health contract is documented. | Coverage requires liveness `pass`, readiness `pass`, deployment marker `release-2026.06.27`, migration status `current`, and data freshness timestamp `2026-06-27T09:30:00Z`. | ADMIN-007-US-003 |
| ADMIN-007-TC-014 | Traceability Verification | Medium | Moderation metrics coverage must exist after exact moderation metrics contract is documented. | Coverage requires open reports `3`, in-review reports `1`, hidden public lists `2`, duplicate candidates `6`, recent action count `2`, and no row-level private data. | ADMIN-007-US-004 |
| ADMIN-007-TC-015 | Traceability Verification | Critical | Dashboard drill-down permissions must stay inside ADMIN-007 ownership. | Coverage requires aggregate cards may show allowed counts while drill-down links are hidden or denied when underlying user/list/place/report permission is missing; downstream feature internals are not executed. | ADMIN-007-US-005 |
| ADMIN-007-TC-016 | Traceability Verification | Critical | Sensitive dashboard data absence must be covered. | Coverage requires `PASSWORD-ADMIN-007`, `HASH-ADMIN-007`, `TOKEN-ADMIN-007`, `COOKIE-ADMIN-007`, `PRIVATE-NOTE-ADMIN-007`, `RAW-SECRET-ADMIN-007`, `PRIVATE-ACCOUNT-ADMIN-007`, and unpermitted `email-private-007@example.test` absent from documented surfaces. | ADMIN-007-US-006 |
| ADMIN-007-TC-017 | Traceability Verification | Medium | Metric freshness coverage must exist after exact freshness contract is documented. | Coverage requires each metric group timestamp/source or global freshness indicator exactly `2026-06-27T09:30:00Z` for the fixture. | ADMIN-007-US-007 |
| ADMIN-007-TC-018 | Traceability Verification | Critical | Unrestricted dashboard export must remain unavailable. | Coverage requires no unrestricted export path or a documented denial with explicit permission, scope, minimization, redaction, and audit requirements for any future export. | ADMIN-007-US-008 |
| ADMIN-007-TC-019 | Traceability Verification | High | Dashboard access audit coverage must exist after exact audit contract is documented. | Coverage requires admin id, timestamp, request id, and result; sensitive canaries are absent. | ADMIN-007-US-009 |
| ADMIN-007-TC-020 | Traceability Verification | High | Dashboard drill-down audit coverage must exist after exact audit contract is documented. | Coverage requires admin id, target area, permission used, timestamp, and request id; no downstream row-level private data appears. | ADMIN-007-US-010 |
| ADMIN-007-TC-021 | Traceability Verification | High | Dashboard accessibility must be covered. | Coverage requires cards, links, filters, errors, and drill-down controls to satisfy keyboard and screen-reader requirements with ASSERT-ADMIN-007-A11Y and ASSERT-ADMIN-007-TOUCH. | ADMIN-007-US-011, RESP-003-US-008, RESP-003-US-014, RESP-003-US-015 |
| ADMIN-007-TC-022 | Traceability Verification | High | Dashboard responsive layout must be covered. | Coverage requires ASSERT-ADMIN-007-RESPONSIVE for dashboard cards, links, filters, errors, drill-down controls, no-export state, health/deployment panel, and freshness indicators at the required viewport, laptop/tablet, landscape, and zoom matrix. | ADMIN-007-US-012, RESP-002-US-001, RESP-002-US-002, RESP-002-US-012, RESP-003-US-001, RESP-003-US-002, RESP-003-US-008 |
| ADMIN-007-TC-023 | Traceability Verification | Medium | Dashboard remains operational and not analytics/BI. | Coverage verifies aggregate operational safety only and does not introduce product analytics, row-level reporting, or unrestricted export behavior. | ADMIN-007-US-001, ADMIN-007-US-008 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-007-TC-024 | Manual Verification | High | Verify documented audit records for dashboard access, drill-down access, denied drill-down, and future export-denial behavior once audit log access is defined. | Audit evidence contains documented fields only and excludes passwords, hashes, tokens, cookies, private notes, raw secrets, private account metadata, debug fields, and stack traces. | ADMIN-007-US-009, ADMIN-007-US-010, ADMIN-007-US-008 |
| ADMIN-007-TC-025 | Manual Verification | High | Verify operational log handling for dashboard access, denied access, drill-down denial, health panel errors, and future export-denial behavior once log access and redaction rules are defined. | Logs contain safe metadata only and do not expose `PASSWORD-ADMIN-007`, `HASH-ADMIN-007`, `TOKEN-ADMIN-007`, `COOKIE-ADMIN-007`, `PRIVATE-NOTE-ADMIN-007`, `RAW-SECRET-ADMIN-007`, `PRIVATE-ACCOUNT-ADMIN-007`, unpermitted email, debug fields, or stack traces. | ADMIN-007-US-006, ADMIN-007-US-008, ADMIN-007-US-009 |

## Summary

- Executable test cases: 0
- Requirement Clarification cases: 10
- Manual Verification cases: 2
- Traceability Verification cases: 13
- Total cases: 25

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- Generic Executable Wording: 0
- Undocumented Executable Routes: 0
- Symbolic ADMIN.DASHBOARD.* executable targets: 0
- Invented Payloads in Executable Tests: 0
- Invented Response Schemas in Executable Tests: 0
- Invented HTTP Statuses in Executable Tests: 0
- Undocumented Audit Behavior in Executable Tests: 0
- Cross-Feature Executable Tests: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Security Assumption Violations: 0
- Summary Count Mismatches: 0
- Final Verdict: Production Grade
