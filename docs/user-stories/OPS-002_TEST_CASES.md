# OPS-002 Test Cases - `{data, meta}` collections

## Source Requirements

- Feature: `OPS-002 - {data, meta} collections`
- Sources: `SYSTEM_OPERATIONS_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `OPS-002-US-001` through `OPS-002-US-012`
- API contract gate: collection envelope and pagination limits are resolved by `EDR-003_COLLECTION_ENVELOPE_AND_PAGINATION.md`; standardized validation errors use `EDR-001_API_ERROR_CONTRACT.md`; performance and observability sinks remain governed by `EDR-006_OPERATIONAL_MONITORING_AND_EVIDENCE_POLICY.md`.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-OPS-002-COLLECTION | Candidate documented collection endpoints: `GET /api/v1/places`, `GET /api/v1/lists`, `GET /api/v1/lists/public`; exact auth fixtures follow each endpoint's owning feature. |
| FX-OPS-002-PAGE | Stable collection dataset with records `row-001` through `row-025`; requested `limit=10`; requested offsets `0`, `10`, `20`; sort `created_desc`. |
| FX-OPS-002-EMPTY | Collection request with deterministic filter `query=NO_MATCH_OPS_002` returning no rows. |
| FX-OPS-002-INVALID | Invalid pagination candidates: `limit=-1`, `offset=-1`, `limit=101`, `limit=not-a-number`, `offset=not-a-number`; expected error uses EDR-001 and EDR-003: HTTP `422`, `error.code = "VALIDATION_ERROR"`. |
| FX-OPS-002-SENSITIVE | Sensitive canaries `TOKEN-OPS-002`, `COOKIE-OPS-002`, `PASSWORD-OPS-002`, `PRIVATE-PAYLOAD-OPS-002`. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| OPS-002-TC-001 | Collection response uses standardized envelope | API, Contract | Critical | FX-OPS-002-COLLECTION; owning endpoint auth fixture selected by the endpoint's feature package; EDR-003 active. | Representative documented collection request with `limit=20`, `offset=0`, and `sort=created_desc`; payload none. | Execute the request only where the owning endpoint documents endpoint, request, response schema, and status. | Response top level contains `data` and `meta`; top level does not contain `items` or undocumented collection metadata; `meta` contains only `limit`, `offset`, `total`, and `sort`. | OPS-002-US-001 | Yes | API |
| OPS-002-TC-002 | Pagination metadata fields are deterministic | API, Contract | High | FX-OPS-002-PAGE; EDR-003 active. | Request `limit=10`, `offset=0`, `sort=created_desc`; payload none. | Execute the documented collection request. | `meta.limit` equals `10`; `meta.offset` equals `0`; `meta.total` is numeric and equals deterministic dataset total `25`; `meta.sort` equals `created_desc`; no undocumented `meta` fields are present. | OPS-002-US-002, OPS-002-US-005, OPS-002-US-011 | Yes | API |
| OPS-002-TC-003 | Over-maximum limit is rejected, not clamped | API, Validation | High | FX-OPS-002-INVALID; EDR-001 and EDR-003 active. | Request `limit=101`, `offset=0`; payload none; `X-Request-ID: req-ops-002-limit`. | Send the documented collection request with over-maximum limit. | HTTP status is `422`; response follows EDR-001; `error.code` equals `VALIDATION_ERROR`; `error.requestId` equals `req-ops-002-limit`; response does not return a clamped `meta.limit=100`. | OPS-002-US-003 | Yes | API, Security |
| OPS-002-TC-004 | Invalid pagination values return standardized validation error | API, Validation | Medium | FX-OPS-002-INVALID; EDR-001 and EDR-003 active. | Request `limit=not-a-number`, `offset=-1`; payload none; `X-Request-ID: req-ops-002-invalid`. | Send the documented collection request with invalid pagination parameters. | HTTP status is `422`; response follows EDR-001; `error.code` equals `VALIDATION_ERROR`; `error.requestId` equals `req-ops-002-invalid`; response excludes stack traces, SQL errors, internal exceptions, debug payloads, and sensitive canaries from FX-OPS-002-SENSITIVE. | OPS-002-US-007 | Yes | API, Security |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-002-TC-005 | Traceability Verification | High | Performance load model remains governed by EDR-006 until production infrastructure defines beta-load conditions or collection exceptions to p95 `1000ms`. | No executable product test invents load profile, exception list, or performance harness; coverage references operational policy. | OPS-002-US-009 |
| OPS-002-TC-006 | Traceability Verification | Medium | Slow-query threshold, metric/log sink, and capture method remain governed by EDR-006 and EDR-004. | Future observability automation can be added only after production infrastructure design defines metric/log sinks and thresholds. | OPS-002-US-010 |
| OPS-002-TC-007 | Traceability Verification | Medium | Empty collection coverage must exist after endpoint contracts are documented. | Coverage requires `data` equals `[]` and `meta.total` equals `0` for FX-OPS-002-EMPTY using EDR-003 envelope rules. | OPS-002-US-004 |
| OPS-002-TC-008 | Traceability Verification | High | Stable pagination coverage must exist after exact sort and endpoint contracts are documented. | Coverage requires records are not duplicated or skipped across offsets `0`, `10`, and `20` without data changes. | OPS-002-US-006 |
| OPS-002-TC-009 | Traceability Verification | Medium | Pagination log redaction coverage must exist after log capture is documented. | Coverage requires EDR-004 fields and absence of `TOKEN-OPS-002`, `COOKIE-OPS-002`, `PASSWORD-OPS-002`, and `PRIVATE-PAYLOAD-OPS-002`; sinks are governed by EDR-006. | OPS-002-US-008 |
| OPS-002-TC-010 | Traceability Verification | High | Envelope contract tests must be part of release-gating coverage after endpoint contracts are documented. | Coverage requires `data`, `meta.limit`, `meta.offset`, `meta.total`, and `meta.sort` assertions from EDR-003. | OPS-002-US-011 |
| OPS-002-TC-011 | Traceability Verification | High | Naming consistency must reject undocumented `items/meta` wording in new collection contracts. | API docs and story packages use `{data, meta}` from EDR-003 unless a deliberate exception is documented. | OPS-002-US-012 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-002-TC-012 | Manual Verification | High | Review API docs and generated client references for collection envelope naming. | No collection endpoint is documented with raw arrays or `items/meta` unless explicitly approved as an exception. | OPS-002-US-001, OPS-002-US-012 |

## Summary

- Executable test cases: 4
- Requirement Clarification cases: 0
- Manual Verification cases: 1
- Traceability Verification cases: 7
- Total cases: 12

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
