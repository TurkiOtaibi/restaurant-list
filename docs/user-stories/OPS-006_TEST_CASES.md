# OPS-006 Test Cases - Frontend health page/JSON

## Source Requirements

- Feature: `OPS-006 - Frontend health page/JSON`
- Sources: `SYSTEM_OPERATIONS_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `OPS-006-US-001` through `OPS-006-US-010`
- API contract gate: `/health` and `/api/health` are documented. `/api/health` success schema is documented. Deployment-marker/version naming, optional backend dependency reporting, and health latency harness details are governed by `EDR-006_OPERATIONAL_MONITORING_AND_EVIDENCE_POLICY.md`.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-OPS-006-FRONTEND | Frontend process is running in `test`; service identity expected `sijil-frontend`. |
| FX-OPS-006-NOAUTH | Requests to `/health` and `/api/health` have no Authorization header, no Cookie header, and no user session. |
| FX-OPS-006-BACKEND-DOWN | Frontend process is running; backend API is unavailable. |
| FX-OPS-006-SENSITIVE | Sensitive canaries `USER-DATA-OPS-006`, `TOKEN-OPS-006`, `COOKIE-OPS-006`, `AUTH-STATE-OPS-006`, `ENV-SECRET-OPS-006`, `PRIVATE-CONFIG-OPS-006`. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| OPS-006-TC-001 | Frontend health page is available and safe | UI, Health | High | FX-OPS-006-FRONTEND and FX-OPS-006-SENSITIVE. | Path `/health`; payload none. | Request `/health`. | HTTP status is `200 OK`; response is human-readable frontend health status; sensitive canaries are absent. | OPS-006-US-001, OPS-006-US-006 | Yes | UI E2E, Security |
| OPS-006-TC-002 | Frontend health JSON returns documented schema | API, Health | High | FX-OPS-006-FRONTEND. | Endpoint `GET /api/health`; payload none. | Request `/api/health`. | Response body is JSON and includes `status`, `service`, `environment`, and `timestamp`; `service` equals `sijil-frontend`; this test does not assert a numeric HTTP status for `/api/health`. | OPS-006-US-002, OPS-006-US-003, OPS-006-US-004 | Yes | API |
| OPS-006-TC-003 | Frontend health endpoints require no authentication | API, Security | High | FX-OPS-006-NOAUTH. | Paths `/health` and `/api/health`; payload none. | Request both endpoints without auth headers or cookies. | Both endpoints respond without user authentication; no bearer token, cookie, or user session is required. | OPS-006-US-005 | Yes | API, UI E2E, Security |
| OPS-006-TC-004 | Frontend health JSON excludes private data | API, Security | Critical | FX-OPS-006-FRONTEND and FX-OPS-006-SENSITIVE. | Endpoint `GET /api/health`; payload none. | Request `/api/health` and inspect the documented JSON body. | `USER-DATA-OPS-006`, `TOKEN-OPS-006`, `COOKIE-OPS-006`, `AUTH-STATE-OPS-006`, `ENV-SECRET-OPS-006`, and `PRIVATE-CONFIG-OPS-006` are absent. | OPS-006-US-006 | Yes | API, Security |

## EDR-Backed Operational Policy Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-006-TC-005 | Traceability Verification | Medium | Deployment marker/version field name and absence behavior for `/api/health` are governed by EDR-006. | No executable product test invents deployment marker/version fields. | OPS-006-US-003 |
| OPS-006-TC-006 | Traceability Verification | Medium | Optional backend dependency reporting schema for `/api/health` remains disabled unless a future product contract defines it. | Frontend health independence is verified without inventing dependency fields. | OPS-006-US-007 |
| OPS-006-TC-007 | Manual Verification | Medium | Frontend health latency measurement harness and beta-load conditions are governed by EDR-006. | Performance automation is added only after production infrastructure design defines the load model. | OPS-006-US-008 |
| OPS-006-TC-011 | Traceability Verification | High | Numeric success status for `GET /api/health` remains absent from the product API contract. | Executable `/api/health` tests validate documented JSON schema without asserting a numeric status until documentation defines it. | OPS-006-US-002 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-006-TC-008 | Traceability Verification | High | Frontend health must be part of deployment validation. | Coverage requires frontend health check after deploy before declaring web deployment successful. | OPS-006-US-009 |
| OPS-006-TC-009 | Traceability Verification | High | Frontend health E2E tests must remain release-gated. | Coverage requires `/health` and `/api/health` status, schema, service id, and private-data exclusion. | OPS-006-US-010 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-006-TC-010 | Manual Verification | High | Review frontend deployment monitor configuration. | Monitor uses `/health` or `/api/health` without credentials and does not require backend readiness for frontend process health unless dependency reporting is explicitly enabled. | OPS-006-US-005, OPS-006-US-007, OPS-006-US-009 |

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
