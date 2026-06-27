# OPS-004 Test Cases - Backend liveness check

## Source Requirements

- Feature: `OPS-004 - Backend liveness check`
- Sources: `SYSTEM_OPERATIONS_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `OPS-004-US-001` through `OPS-004-US-012`
- API contract gate: `GET /health/live` is documented with no auth requirement, `200 OK`, and required response fields. Liveness process-only semantics are resolved by `EDR-005_HEALTH_CHECK_CONTRACT.md`; metric sinks, alert sinks, and deployment-marker evidence remain governed by `EDR-006_OPERATIONAL_MONITORING_AND_EVIDENCE_POLICY.md`.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-OPS-004-LIVE | Backend process is running in `test`; request id capture enabled; no database or external dependency required for liveness. |
| FX-OPS-004-NOAUTH | Request to `GET /health/live` has no Authorization header, no Cookie header, and no user session. |
| FX-OPS-004-DB-DOWN | Backend process is running; database dependency is unavailable; no readiness request is sent by OPS-004 executable tests. |
| FX-OPS-004-SENSITIVE | Sensitive canaries `USER-DATA-OPS-004`, `TOKEN-OPS-004`, `COOKIE-OPS-004`, `SECRET-OPS-004`, `DATABASE-URL-OPS-004`, `PRIVATE-ENV-OPS-004`. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| OPS-004-TC-001 | Liveness endpoint returns documented success | API, Health | Critical | FX-OPS-004-LIVE with request id capture enabled. | Endpoint `GET /health/live`; payload none. | Send the request while backend process is running. | HTTP status is `200 OK`; response body includes `status`, `service`, `environment`, and `timestamp`; `status` equals `ok`; if request id is documented as available in this environment, response includes `requestId`; absence of `requestId` alone does not fail this test. | OPS-004-US-001, OPS-004-US-003, OPS-004-US-004 | Yes | API |
| OPS-004-TC-002 | Liveness requires no authentication | API, Security | High | FX-OPS-004-NOAUTH. | Endpoint `GET /health/live`; payload none; no auth headers or cookies. | Send unauthenticated request. | Response is produced without user authentication; no sign-in, bearer token, cookie, or user session is required. | OPS-004-US-005 | Yes | API, Security |
| OPS-004-TC-003 | Liveness payload excludes private data | API, Security | Critical | FX-OPS-004-LIVE and FX-OPS-004-SENSITIVE. | Endpoint `GET /health/live`; payload none. | Send request and inspect body, headers allowed by contract, and captured error output if any. | `USER-DATA-OPS-004`, `TOKEN-OPS-004`, `COOKIE-OPS-004`, `SECRET-OPS-004`, `DATABASE-URL-OPS-004`, and `PRIVATE-ENV-OPS-004` are absent. | OPS-004-US-006 | Yes | API, Security |
| OPS-004-TC-004 | Liveness skips downstream dependency checks | API, Health | High | FX-OPS-004-DB-DOWN. | Endpoint `GET /health/live`; payload none. | Send liveness request while database is unavailable. | Liveness response does not require database, migration, or external dependency checks; no downstream health-check request is sent by this test. | OPS-004-US-002, OPS-004-US-010 | Yes | API |

## EDR-Backed Operational Policy Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-004-TC-005 | Traceability Verification | Medium | Liveness metric names, dimensions, sink, and capture method remain governed by EDR-006 until production monitoring design defines them. | No executable product test invents health metric backend, dimensions, or sensitive-label policy beyond EDR-006. | OPS-004-US-008 |
| OPS-004-TC-006 | Manual Verification | High | Review hosting/monitoring policy for repeated liveness failures under EDR-006. | Alert sink and routing are documented in production infrastructure design before alert automation is added. | OPS-004-US-009 |
| OPS-004-TC-007 | Traceability Verification | Medium | Deployment marker/version evidence remains governed by EDR-006. | No executable product test invents deployment marker field names in health logs or metrics. | OPS-004-US-011 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-004-TC-008 | Traceability Verification | High | Liveness p95 latency coverage must exist in performance or health tests. | Coverage requires p95 latency below `250ms` under normal operation. | OPS-004-US-007 |
| OPS-004-TC-009 | Traceability Verification | High | Liveness regression test coverage must remain in health test suite. | Coverage includes response status, schema, no-auth behavior, and private-data exclusion. | OPS-004-US-012 |
| OPS-004-TC-011 | Traceability Verification | High | Live-vs-ready distinction must remain covered without executing readiness behavior in OPS-004. | OPS-004 verifies liveness independence; executable readiness failure/reporting behavior is owned by OPS-005. | OPS-004-US-010 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-004-TC-010 | Manual Verification | High | Review infrastructure monitor configuration for `/health/live`. | Monitor calls unversioned `/health/live` without credentials and does not use readiness as liveness. | OPS-004-US-004, OPS-004-US-005, OPS-004-US-010 |

## Summary

- Executable test cases: 4
- Requirement Clarification cases: 0
- Manual Verification cases: 2
- Traceability Verification cases: 5
- Total cases: 11

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
