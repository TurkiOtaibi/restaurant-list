# OPS-005 Test Cases - Backend readiness check

## Source Requirements

- Feature: `OPS-005 - Backend readiness check`
- Sources: `SYSTEM_OPERATIONS_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `OPS-005-US-001` through `OPS-005-US-018`
- API contract gate: `GET /health/ready` ready and not-ready status behavior is resolved by `EDR-005_HEALTH_CHECK_CONTRACT.md`; standardized error payloads use `EDR-001_API_ERROR_CONTRACT.md`; metrics, alert sinks, timeout harnesses, and deployment evidence remain governed by `EDR-006_OPERATIONAL_MONITORING_AND_EVIDENCE_POLICY.md`.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-OPS-005-READY | API, database, expected Alembic revision, and schema compatibility are ready in `test`; expected revision `rev-ops-005-head`; request id capture enabled. |
| FX-OPS-005-DB-FAIL | Database unavailable; expected readiness result follows EDR-005 not-ready status `503`; connection string canary `DATABASE-URL-OPS-005`; credential canary `DB-PASSWORD-OPS-005`. |
| FX-OPS-005-MIGRATION-MISMATCH | Expected Alembic revision `rev-ops-005-head`; live revision `rev-ops-005-old`; expected readiness result follows EDR-005 not-ready status `503`. |
| FX-OPS-005-SCHEMA-INCOMPATIBLE | Database reachable; schema compatibility check fails; expected readiness result follows EDR-005 not-ready status `503`. |
| FX-OPS-005-DEGRADED | Dependency is slow or partially failing; EDR-005 states no degraded readiness mode exists in MVP. |
| FX-OPS-005-NOAUTH | Request to `GET /health/ready` has no Authorization header, no Cookie header, and no user session. |
| FX-OPS-005-SENSITIVE | Sensitive canaries `DATABASE-URL-OPS-005`, `DB-PASSWORD-OPS-005`, `TOKEN-OPS-005`, `COOKIE-OPS-005`, `PRIVATE-DATA-OPS-005`, `STACK-OPS-005`. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| OPS-005-TC-001 | Readiness endpoint returns documented ready success | API, Health | Critical | FX-OPS-005-READY with request id capture enabled. | Endpoint `GET /health/ready`; payload none. | Send readiness request when API, database, migration revision, and schema are ready. | HTTP status is `200 OK`; response includes `status`, `service`, `environment`, `timestamp`, `requestId`, and `checks`. | OPS-005-US-001, OPS-005-US-002, OPS-005-US-016 | Yes | API |
| OPS-005-TC-002 | Readiness reports documented database dependency status | API, Health | Critical | FX-OPS-005-READY. | Endpoint `GET /health/ready`; payload none. | Send readiness request. | `checks.database.status` exists and its value is one of `ok`, `degraded`, or `fail`; no undocumented database fields such as `ready`, `connected`, `latencyMs`, `version`, or `revision` are required by this test. | OPS-005-US-003 | Yes | API, Security |
| OPS-005-TC-003 | Readiness requires no authentication | API, Security | High | FX-OPS-005-NOAUTH. | Endpoint `GET /health/ready`; payload none; no auth headers or cookies. | Send unauthenticated readiness request. | Response is produced without user authentication; no bearer token, cookie, or user session is required. | OPS-005-US-011 | Yes | API, Security |

## EDR-Backed Operational Policy Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-005-TC-004 | Traceability Verification | Critical | Database connectivity failure uses EDR-005 not-ready status and EDR-001 safe error envelope where an error body is returned. | Not-ready status is `503`; payload never exposes `DATABASE-URL-OPS-005`, `DB-PASSWORD-OPS-005`, stack traces, SQL errors, internal exceptions, debug payloads, or secrets. | OPS-005-US-004, OPS-005-US-012 |
| OPS-005-TC-005 | Traceability Verification | Critical | Alembic revision mismatch uses EDR-005 not-ready status; exact revision evidence fields remain operational evidence governed by EDR-008. | Not-ready status is `503`; mismatch evidence does not expose connection details or credentials. | OPS-005-US-005, OPS-005-US-007 |
| OPS-005-TC-006 | Traceability Verification | Critical | Schema incompatibility uses EDR-005 not-ready status and blocks traffic readiness. | Readiness is not ready with status `503`; no product test invents schema-check field names beyond documented readiness checks. | OPS-005-US-006 |
| OPS-005-TC-007 | Traceability Verification | High | Degraded readiness mode is not supported in MVP per EDR-005. | Tests must not accept degraded readiness as a passing state; dependency failures are ready `200` or not-ready `503` only according to EDR-005. | OPS-005-US-008 |
| OPS-005-TC-008 | Manual Verification | High | Database check timeout value and maximum duration are operational harness details governed by EDR-006. | Timeout automation is added only after production infrastructure design defines measurable timeout behavior. | OPS-005-US-010 |
| OPS-005-TC-009 | Traceability Verification | High | Readiness metrics names, dimensions, sink, and capture method are governed by EDR-006. | No executable product test invents readiness metric backend, dimensions, or sensitive-label policy. | OPS-005-US-013 |
| OPS-005-TC-010 | Manual Verification | Critical | Readiness failure alert and database connectivity alert thresholds and sinks are governed by EDR-006. | Alert automation waits for production monitoring design; no product test invents alert routing. | OPS-005-US-014, OPS-005-US-015 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-005-TC-011 | Traceability Verification | Critical | Safe readiness failure payload coverage must exist for all non-ready classes. | `DATABASE-URL-OPS-005`, `DB-PASSWORD-OPS-005`, `TOKEN-OPS-005`, `COOKIE-OPS-005`, `PRIVATE-DATA-OPS-005`, and `STACK-OPS-005` are absent. | OPS-005-US-012 |
| OPS-005-TC-012 | Traceability Verification | High | Readiness p95 latency coverage must exist when dependencies are healthy. | Coverage requires `/health/ready` p95 latency below `500ms`. | OPS-005-US-009 |
| OPS-005-TC-013 | Traceability Verification | High | Readiness regression suite coverage must exist. | Coverage includes database success, database failure, migration mismatch, safe payload, and no-auth behavior. | OPS-005-US-017 |
| OPS-005-TC-014 | Traceability Verification | Medium | Live and ready semantics must remain documented. | Runbooks/docs distinguish `/health/live` as process liveness and `/health/ready` as dependency/schema readiness. | OPS-005-US-018 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-005-TC-015 | Manual Verification | Critical | Review deployment gate configuration for readiness. | Release validation cannot pass until `/health/ready` returns ready for the deployed revision. | OPS-005-US-016 |

## Summary

- Executable test cases: 3
- Requirement Clarification cases: 0
- Manual Verification cases: 3
- Traceability Verification cases: 9
- Total cases: 15

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
