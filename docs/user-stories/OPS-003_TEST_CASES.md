# OPS-003 Test Cases - Structured error contract

## Source Requirements

- Feature: `OPS-003 - Structured error contract`
- Sources: `SYSTEM_OPERATIONS_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `OPS-003-US-001` through `OPS-003-US-018`
- API contract gate: standardized error envelope and request-id/logging behavior are resolved by `EDR-001_API_ERROR_CONTRACT.md` and `EDR-004_REQUEST_ID_AND_STRUCTURED_LOGGING.md`; metrics, alert sinks, slow-request thresholds, and audit-event access methods remain governed by `EDR-006_OPERATIONAL_MONITORING_AND_EVIDENCE_POLICY.md`.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-OPS-003-VALIDATION | Invalid request fixture with field `name` set to empty string on an owning feature endpoint that documents endpoint, request, payload, response schema, and status; validation error follows EDR-001. |
| FX-OPS-003-ERROR-CANARIES | Sensitive values `SECRET-OPS-003`, `PASSWORD-OPS-003`, `ACCESS-TOKEN-OPS-003`, `REFRESH-TOKEN-OPS-003`, `COOKIE-OPS-003`, `DATABASE-URL-OPS-003`, `PRIVATE-NOTE-OPS-003`, `RAW-PAYLOAD-OPS-003`, `email-ops-003@example.test`, `Display Name OPS 003`. |
| FX-OPS-003-REQUEST-ID | Incoming request without `X-Request-ID` and incoming request with `X-Request-ID: req-ops-003-001`; no separate correlation ID exists in MVP per EDR-004. |
| FX-OPS-003-ALERTS | Error rate `5xx` exceeds `1%` over 15 minutes; auth failures spike above configured threshold; rate-limit responses spike above configured threshold. Exact alert sink pending clarification. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| OPS-003-TC-001 | Standard error envelope uses EDR-001 | API, Security | Critical | FX-OPS-003-VALIDATION on any owning endpoint with fully documented validation-failure contract. | Invalid payload field `name=""`; `X-Request-ID: req-ops-003-validation`. | Send the documented invalid request. | Response follows EDR-001; required fields `error.code`, `error.message`, and `error.requestId` are present; `error.code` is `VALIDATION_ERROR`; `error.requestId` equals `req-ops-003-validation`; optional `error.details` is an object if present; no stack trace, SQL error, internal exception, debug payload, secret, or FX-OPS-003-ERROR-CANARIES value is present. | OPS-003-US-001, OPS-003-US-002, OPS-003-US-003, OPS-003-US-016 | Yes | API, Security |
| OPS-003-TC-002 | Request ID is reused or generated per EDR-004 | API, Observability | Critical | FX-OPS-003-REQUEST-ID on any owning endpoint with fully documented response contract. | Request A has `X-Request-ID: req-ops-003-001`; Request B omits `X-Request-ID`. | Send Request A, then Request B. | Request A response includes `error.requestId` or response request-id field equal to `req-ops-003-001`; Request B response includes a non-empty generated request id; no separate correlation id field is required in MVP. | OPS-003-US-006, OPS-003-US-007 | Yes | API |
| OPS-003-TC-003 | Structured JSON log contains required EDR-004 fields | Observability, Security | Critical | Log capture fixture supports JSON log inspection for a documented request; EDR-004 active. | Request id `req-ops-003-log`; path from owning endpoint; no sensitive canaries in expected log. | Execute the documented request and inspect captured JSON log entry. | Log entry is valid JSON and contains `timestamp`, `level`, `requestId`, `userId`, `path`, `method`, `status`, `durationMs`, and `errorCode`; `requestId` equals `req-ops-003-log`; logs omit or redact all FX-OPS-003-ERROR-CANARIES values. | OPS-003-US-008, OPS-003-US-009, OPS-003-US-010 | Yes | Security |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-003-TC-004 | Traceability Verification | Critical | Error metric names, dimensions, and sinks remain governed by EDR-006. | No executable product test invents metrics backend or sensitive labels; future automation waits for production monitoring design. | OPS-003-US-011 |
| OPS-003-TC-005 | Traceability Verification | Critical | Alert sink and configured thresholds for auth failure spikes and rate-limit spikes remain governed by EDR-006. | No executable product test invents alert routing or threshold values. | OPS-003-US-013, OPS-003-US-014 |
| OPS-003-TC-006 | Traceability Verification | Medium | Slow-request threshold, trace/log schema beyond EDR-004, dependency timing fields, and capture sink remain governed by EDR-006. | Future executable observability tests require production infrastructure design before automation. | OPS-003-US-015 |
| OPS-003-TC-007 | Traceability Verification | High | Security-sensitive audit event schema and access method remain governed by EDR-006 unless a product feature documents exact audit surfaces. | No executable test invents audit internals for login failure spikes, token reuse detection, rate-limit spikes, migration actions, or destructive operations. | OPS-003-US-018 |
| OPS-003-TC-008 | Traceability Verification | Critical | Error leakage coverage must exist for all documented failure classes. | Responses never include `SECRET-OPS-003`, `PASSWORD-OPS-003`, `ACCESS-TOKEN-OPS-003`, `REFRESH-TOKEN-OPS-003`, `COOKIE-OPS-003`, `DATABASE-URL-OPS-003`, `PRIVATE-NOTE-OPS-003`, or `RAW-PAYLOAD-OPS-003`. | OPS-003-US-004 |
| OPS-003-TC-009 | Traceability Verification | Medium | Frontend fallback error coverage must exist after unexpected-error fixture is documented. | UI displays safe fallback copy and never renders raw exception, stack trace, or private payload. | OPS-003-US-005, OPS-003-US-017 |
| OPS-003-TC-010 | Traceability Verification | Critical | Log redaction coverage must exist wherever EDR-004 log capture is available. | Logs omit or redact passwords, access tokens, refresh tokens, cookies, API keys, database URLs, auth headers, and private notes. | OPS-003-US-009 |
| OPS-003-TC-011 | Traceability Verification | Critical | PII log minimization coverage must exist after approved audit exceptions are documented. | Emails and display names are omitted, hashed, or minimized unless required for an approved audit event. | OPS-003-US-010 |
| OPS-003-TC-012 | Traceability Verification | Critical | Elevated `5xx` alert coverage must exist after alert sink is defined by EDR-006 follow-up infrastructure design. | Alert threshold source and routing are not invented by product tests. | OPS-003-US-012 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-003-TC-013 | Manual Verification | Critical | Review observability dashboards and alert rules for error, auth failure, and rate-limit alerts under EDR-006. | Dashboards and alerts use safe labels and map to documented operational thresholds once production monitoring design exists. | OPS-003-US-011, OPS-003-US-012, OPS-003-US-013, OPS-003-US-014 |
| OPS-003-TC-014 | Manual Verification | High | Review error taxonomy documentation before release. | Expected error codes follow EDR-001 UPPER_SNAKE_CASE convention and frontend/automation uses `error.code`, not `error.message`. | OPS-003-US-016 |

## Summary

- Executable test cases: 3
- Requirement Clarification cases: 0
- Manual Verification cases: 2
- Traceability Verification cases: 9
- Total cases: 14

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- Generic Executable Wording: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Security Assumption Violations: 0
- Final Verdict: Production Grade
