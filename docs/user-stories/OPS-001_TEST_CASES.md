# OPS-001 Test Cases - `/api/v1` prefix

## Source Requirements

- Feature: `OPS-001 - /api/v1 prefix`
- Sources: `SYSTEM_OPERATIONS_USER_STORIES.md` OPS section, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `OPS-001-US-001` through `OPS-001-US-008`
- API contract gate: OPS-001 version-prefix behavior is resolved by `EDR-007_FRONTEND_API_VERSIONING_CONTRACT.md`; unsupported-version error response uses `EDR-001_API_ERROR_CONTRACT.md`. Health endpoint execution remains owned by OPS-004/OPS-005.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-OPS-001-PRODUCT-ENDPOINTS | Representative documented product endpoints: `GET /api/v1/places`, `GET /api/v1/lists`, `GET /api/v1/profile`. |
| FX-OPS-001-HEALTH-ENDPOINTS | Unversioned health endpoints: `GET /health/live`, `GET /health/ready`. |
| FX-OPS-001-FRONTEND-CLIENT | Frontend API client receives input path `/places` and already-versioned input path `/api/v1/places`. |
| FX-OPS-001-UNSUPPORTED | Unsupported version request path `GET /api/v9/places`; expected response follows EDR-001 and EDR-007: HTTP `404`, `error.code = "NOT_FOUND"`, required `error.message` and `error.requestId`, optional `error.details`, no debug/internal fields. |
| FX-OPS-001-LOG-CANARY | Sensitive values `TOKEN-OPS-001`, `COOKIE-OPS-001`, `PASSWORD-OPS-001`, `PRIVATE-NOTE-OPS-001`. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| OPS-001-TC-001 | Frontend client prefixes unversioned API path | UI, Contract | High | FX-OPS-001-FRONTEND-CLIENT; route capture harness records final request path without sending downstream product endpoint semantics. | Input path `/places`; payload none. | Invoke frontend API client with `/places` and inspect captured final request path. | Captured final request path is exactly `/api/v1/places`; no product endpoint response/status is asserted; EDR-007 is referenced as the deterministic contract. | OPS-001-US-002 | Yes | UI E2E |
| OPS-001-TC-002 | Frontend client does not double-prefix versioned path | UI, Contract | High | FX-OPS-001-FRONTEND-CLIENT; route capture harness records final request path without sending downstream product endpoint semantics. | Input path `/api/v1/places`; payload none. | Invoke frontend API client with `/api/v1/places` and inspect captured final request path. | Captured final request path is exactly `/api/v1/places`; captured path does not contain `/api/v1/api/v1`; EDR-007 is referenced as the deterministic contract. | OPS-001-US-003 | Yes | UI E2E |
| OPS-001-TC-003 | Unsupported API version returns standardized error | API, Security | Medium | FX-OPS-001-UNSUPPORTED and FX-OPS-001-LOG-CANARY. | Endpoint `GET /api/v9/places`; payload none; optional `X-Request-ID: req-ops-001-unsupported`. | Send unsupported version request. | HTTP status is `404`; response follows EDR-001 with required `error.code`, `error.message`, and `error.requestId`; `error.code` equals `NOT_FOUND`; `error.requestId` equals `req-ops-001-unsupported`; response has no stack trace, SQL error, internal exception, debug payload, secret, `TOKEN-OPS-001`, `COOKIE-OPS-001`, `PASSWORD-OPS-001`, or `PRIVATE-NOTE-OPS-001`. | OPS-001-US-006 | Yes | API, Security |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-001-TC-004 | Traceability Verification | Low | Future `/api/v2` lifecycle remains traceability-only per EDR-007 until product documentation defines deprecation timelines, compatibility rules, and migration guidance. | Release planning references EDR-007; no executable `/api/v2` behavior is required in the MVP. | OPS-001-US-008 |
| OPS-001-TC-005 | Traceability Verification | Critical | Product endpoint version-prefix coverage must exist once representative endpoint auth/status fixtures are documented in owning feature packages. | Coverage requires documented product API paths such as `GET /api/v1/places`, `GET /api/v1/lists`, and `GET /api/v1/profile` to use `/api/v1` unless explicitly documented as unversioned. | OPS-001-US-001 |
| OPS-001-TC-006 | Traceability Verification | High | Health endpoint exception coverage must remain traceable to OPS-004/OPS-005 execution packages. | `/health/live` and `/health/ready` are documented unversioned exceptions for OPS-001, but executable endpoint behavior is owned by OPS-004 and OPS-005. | OPS-001-US-004 |
| OPS-001-TC-007 | Traceability Verification | Medium | Versioned route logs use EDR-004 structured logging when log capture is available. | Coverage requires method, path, status, duration, requestId, API version, and absence of `TOKEN-OPS-001`, `COOKIE-OPS-001`, `PASSWORD-OPS-001`, and `PRIVATE-NOTE-OPS-001`; log sink remains governed by EDR-006. | OPS-001-US-005 |
| OPS-001-TC-008 | Traceability Verification | High | Regression coverage must include representative backend and frontend version-prefix checks. | Coverage requires product API prefix, frontend auto-prefix, double-prefix prevention, unsupported version error, and unversioned health exception without executing OPS-004/OPS-005 endpoint contracts in this file. | OPS-001-US-007 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-001-TC-009 | Manual Verification | Medium | Review API documentation for endpoint exceptions to `/api/v1`. | Every unversioned exception is explicitly documented; only `/health/live` and `/health/ready` are currently accepted by this package. | OPS-001-US-001, OPS-001-US-004 |

## Summary

- Executable test cases: 3
- Requirement Clarification cases: 0
- Manual Verification cases: 1
- Traceability Verification cases: 5
- Total cases: 9

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- Generic Executable Wording: 0
- Cross-feature Executable API Tests: 0
- Health Endpoint Ownership Violations: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Security Assumption Violations: 0
- Final Verdict: Production Grade
