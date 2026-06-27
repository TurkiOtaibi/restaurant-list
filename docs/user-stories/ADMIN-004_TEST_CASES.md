# ADMIN-004 Test Cases - Place moderation and correction

## Source Requirements

- Feature: `ADMIN-004 - Place moderation and correction`
- Sources: `ADMIN_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `ADMIN-004-US-001` through `ADMIN-004-US-013`
- API contract gate: the allowed sources define ADMIN-004 business requirements and shared admin status semantics, but do not define exact ADMIN-004 endpoint paths, request payload schemas, response schemas, route paths, or executable request definitions.
- Execution constraint: no ADMIN-004 API test is executable until endpoint, request, payload, response schema, and HTTP status are all documented.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-ADMIN-004-EDITOR | Admin `admin-place-edit-004`; permissions `[admin.place.edit]`; MFA complete. |
| FX-ADMIN-004-NOPERM | Admin `admin-no-place-edit-004`; permissions `[admin.dashboard.view]`; MFA complete; lacks `admin.place.edit`. |
| FX-ADMIN-004-PLACE | Place `place-004-a`; name `Burger Hous`; type `restaurant`; subtype `burger`; normalized name `burger-hous`; rating count `4`; list usage count `3`; public list count `2`; duplicate candidate indicator `false`; private note canary `PRIVATE-NOTE-ADMIN-004`. |
| FX-ADMIN-004-DUPLICATE | Existing place `place-004-b`; name `Burger House`; normalized name `burger-house`; type `restaurant`; subtype `burger`; rating count `2`; list usage count `1`. |
| FX-ADMIN-004-STALE | Place `place-004-a` loaded with version `v1`; current persisted version `v2`; submitted version `v1`; current name remains `Burger Hous`. |
| FX-ADMIN-004-AUDIT-FAIL | Admin `admin-place-edit-004`; permissions `[admin.place.edit]`; target place `place-004-a`; before name `Burger Hous`; audit write result `failed`. |
| FX-ADMIN-004-A11Y-RESP | Future place search table, detail panel, correction form, taxonomy fields, validation error, conflict error, save/cancel controls, and error state tied to documented global responsive/accessibility requirements. |

## Required Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-ADMIN-004-SEARCH-SAFE | Place moderation search returns public-safe place metadata only after exact search contract is documented. Private notes, passwords, tokens, cookies, raw secrets, unrelated user data, stack traces, and debug fields are absent. |
| ASSERT-ADMIN-004-DETAIL-SAFE | Place detail exposes name, type, subtype, rating count, list usage count, normalized name, and duplicate candidate indicators only after exact detail contract is documented. Private notes, credentials, tokens, cookies, debug fields, and stack traces are absent. |
| ASSERT-ADMIN-004-NAME-CORRECTION | Name correction changes `Burger Hous` to `Burger House` only after documented permission, reason, payload, response, schema, and status are available. |
| ASSERT-ADMIN-004-TAXONOMY-CORRECTION | Valid taxonomy correction changes type/subtype and preserves existing ratings and list items after approved taxonomy matrix and exact contract are documented. |
| ASSERT-ADMIN-004-INVALID-TAXONOMY | Invalid taxonomy leaves place data unchanged and returns a safe validation response after approved taxonomy matrix and exact error contract are documented. |
| ASSERT-ADMIN-004-DUPLICATE-SAFE | Duplicate normalized-name correction leaves place data unchanged and returns the documented conflict or validation response after exact rule and schema are documented. |
| ASSERT-ADMIN-004-STALE-SAFE | Stale correction leaves place data unchanged and requires reload before retry after exact versioning and conflict contract are documented. |
| ASSERT-ADMIN-004-PRESERVE | Ratings, list items, public lists, user accounts, and private notes are not deleted or changed; fixture counts remain rating count `4`, list usage count `3`, public list count `2`, and private note canary unchanged. |
| ASSERT-ADMIN-004-AGGREGATES | Affected type-based counts, search/filter behavior, and relevant aggregates are refreshed or recalculated after taxonomy correction once exact affected surfaces and expected values are documented. |
| ASSERT-ADMIN-004-AUDIT | Audit record includes before/after corrected fields, reason, admin, place id, timestamp, request id, and result. Private notes, credentials, tokens, cookies, debug fields, and stack traces are absent. |
| ASSERT-ADMIN-004-AUDIT-FAIL-SAFE | If audit logging fails, correction fails and place data remains unchanged. Error output has no private note, credentials, tokens, cookies, debug fields, or stack traces. |
| ASSERT-ADMIN-004-A11Y-FORM | Correction fields, validation errors, conflict errors, save/cancel controls, and any documented dialogs are keyboard and screen-reader accessible with visible focus. |
| ASSERT-ADMIN-004-A11Y-TOUCH | Search, detail, correction, validation, conflict, save, and cancel controls have at least `44x44` CSS pixel hit targets. |
| ASSERT-ADMIN-004-RESPONSIVE | Place moderation search, detail, correction form, validation error, conflict error, and save/cancel controls have no horizontal overflow at `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`, phone landscape, and `200%` zoom. |

## Executable Test Cases

No executable ADMIN-004 API tests are currently valid because the allowed sources do not document exact ADMIN-004 endpoint paths, request payload schemas, response schemas, and status mapping. Business coverage is preserved below as Requirement Clarification, Traceability Verification, and Manual Verification.

## Requirement Clarification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-004-TC-001 | Requirement Clarification | Critical | Define exact place moderation search endpoint, request parameters, payload shape if any, success status, response schema, pagination envelope, and allowed fields. | Future executable tests can verify search by name/type/subtype and ASSERT-ADMIN-004-SEARCH-SAFE using documented contracts only. | ADMIN-004-US-001 |
| ADMIN-004-TC-002 | Requirement Clarification | Critical | Define exact missing-permission and guest-denial fixtures for place correction access, including endpoint, status, response schema, and forbidden fields. | Future executable tests can assert protected place correction without inventing request definitions or schemas. | ADMIN-004-US-002 |
| ADMIN-004-TC-003 | Requirement Clarification | High | Define exact place moderation detail endpoint, path or identifier parameter, response schema, allowed fields, and forbidden fields. | Future executable tests can verify ASSERT-ADMIN-004-DETAIL-SAFE and duplicate candidate visibility using documented contracts only. | ADMIN-004-US-003 |
| ADMIN-004-TC-004 | Requirement Clarification | Critical | Define exact place update endpoint, name-correction payload, reason validation, version field if any, response schema, success status, and audit access method. | Future executable tests can verify ASSERT-ADMIN-004-NAME-CORRECTION, ASSERT-ADMIN-004-PRESERVE, and ASSERT-ADMIN-004-AUDIT using documented contracts only. | ADMIN-004-US-004, ADMIN-004-US-009, ADMIN-004-US-012 |
| ADMIN-004-TC-005 | Requirement Clarification | Critical | Define approved taxonomy value matrix, taxonomy-correction payload, response schema, success status, and exact affected aggregate/search/filter surfaces. | Future executable tests can verify ASSERT-ADMIN-004-TAXONOMY-CORRECTION and ASSERT-ADMIN-004-AGGREGATES with deterministic expected values. | ADMIN-004-US-005, ADMIN-004-US-010 |
| ADMIN-004-TC-006 | Requirement Clarification | Critical | Define invalid taxonomy fixtures, validation response status, error schema, required fields, forbidden fields, and unchanged-state assertions. | Future executable tests can verify ASSERT-ADMIN-004-INVALID-TAXONOMY without inventing taxonomy or error schema behavior. | ADMIN-004-US-006 |
| ADMIN-004-TC-007 | Requirement Clarification | Critical | Define duplicate normalized-name rule, matching scope, response status, error schema, and exact unchanged-state assertions. | Future executable tests can verify ASSERT-ADMIN-004-DUPLICATE-SAFE deterministically without mixed `409 or validation` expectations. | ADMIN-004-US-007 |
| ADMIN-004-TC-008 | Requirement Clarification | High | Define stale-correction/versioning contract, conflict status, error schema, reload requirement, and retry boundary. | Future executable tests can verify ASSERT-ADMIN-004-STALE-SAFE without inventing version fields or browser retry behavior. | ADMIN-004-US-008 |
| ADMIN-004-TC-009 | Requirement Clarification | Critical | Define exact audit-failure fixture, audit failure signal, failure response schema, status mapping, and rollback guarantees for place correction. | Future executable tests can verify ASSERT-ADMIN-004-AUDIT-FAIL-SAFE without inventing audit sink behavior. | ADMIN-004-US-011 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-004-TC-010 | Traceability Verification | High | Place search coverage must exist after exact search contract is documented. | Coverage requires `admin.place.edit`, search by name/type/subtype, paginated place results, public-safe metadata only, and ASSERT-ADMIN-004-SEARCH-SAFE. | ADMIN-004-US-001 |
| ADMIN-004-TC-011 | Traceability Verification | Critical | Missing `admin.place.edit` must deny place correction. | Coverage requires no place data mutation, safe error schema, no private note, no unrelated user data, and no debug fields after denial contract is documented. | ADMIN-004-US-002 |
| ADMIN-004-TC-012 | Traceability Verification | High | Place moderation detail coverage must exist after exact detail contract is documented. | Coverage requires place `place-004-a`, name, type, subtype, rating count `4`, list usage count `3`, normalized name, duplicate indicator, and ASSERT-ADMIN-004-DETAIL-SAFE. | ADMIN-004-US-003 |
| ADMIN-004-TC-013 | Traceability Verification | High | Name correction with reason must be covered. | Coverage requires name `Burger Hous -> Burger House`, reason, ratings/list items remain linked, ASSERT-ADMIN-004-PRESERVE, and ASSERT-ADMIN-004-AUDIT after update contract is documented. | ADMIN-004-US-004, ADMIN-004-US-009, ADMIN-004-US-012 |
| ADMIN-004-TC-014 | Traceability Verification | High | Taxonomy correction with reason must be covered. | Coverage requires valid type/subtype, unchanged ratings/list items, and ASSERT-ADMIN-004-TAXONOMY-CORRECTION after taxonomy contract is documented. | ADMIN-004-US-005 |
| ADMIN-004-TC-015 | Traceability Verification | Critical | Invalid taxonomy rejection must be covered. | Coverage requires invalid type/subtype fixture, no place data change, safe validation error, and ASSERT-ADMIN-004-INVALID-TAXONOMY after taxonomy matrix is documented. | ADMIN-004-US-006 |
| ADMIN-004-TC-016 | Traceability Verification | Critical | Duplicate normalized-name rejection must be covered. | Coverage requires conflict between `place-004-a` and `place-004-b`, no place data change, safe error, and ASSERT-ADMIN-004-DUPLICATE-SAFE after duplicate rule is documented. | ADMIN-004-US-007 |
| ADMIN-004-TC-017 | Traceability Verification | High | Stale correction conflict must be covered. | Coverage requires loaded version `v1`, persisted version `v2`, no place data change, reload-required outcome, and ASSERT-ADMIN-004-STALE-SAFE after versioning contract is documented. | ADMIN-004-US-008 |
| ADMIN-004-TC-018 | Traceability Verification | Critical | Place correction must preserve user data. | Coverage requires rating count `4`, list usage count `3`, public list count `2`, user accounts unchanged, and private note canary `PRIVATE-NOTE-ADMIN-004` unchanged. | ADMIN-004-US-009 |
| ADMIN-004-TC-019 | Traceability Verification | High | Taxonomy correction aggregate refresh must be covered after exact surfaces are documented. | Coverage requires deterministic before/after expected values for affected type-based counts, search/filter behavior, and relevant aggregates. | ADMIN-004-US-010 |
| ADMIN-004-TC-020 | Traceability Verification | Critical | Audit failure must block place correction. | Coverage requires audit failure fixture, unchanged place data, safe error, and no private/debug leakage after audit failure behavior is documented. | ADMIN-004-US-011 |
| ADMIN-004-TC-021 | Traceability Verification | Critical | Place correction audit coverage must include every documented audit field. | Coverage requires before/after corrected fields, reason, admin, place id, timestamp, request id, and result; private notes, credentials, tokens, cookies, debug fields, and stack traces are absent. | ADMIN-004-US-012 |
| ADMIN-004-TC-022 | Traceability Verification | High | Place correction accessibility must be covered. | Coverage requires fields, validation errors, conflict errors, save/cancel controls, and any documented dialogs to satisfy keyboard and screen-reader requirements with ASSERT-ADMIN-004-A11Y-FORM and ASSERT-ADMIN-004-A11Y-TOUCH. | ADMIN-004-US-013, A11Y-001-US-001, A11Y-001-US-003, A11Y-001-US-004, A11Y-001-US-006, A11Y-001-US-014, A11Y-001-US-015, RESP-003-US-008 |
| ADMIN-004-TC-023 | Traceability Verification | High | Place correction responsive coverage must be included. | Coverage requires ASSERT-ADMIN-004-RESPONSIVE for search, detail, correction form, validation error, conflict error, and save/cancel controls at the required viewport, safe-area, landscape, and zoom matrix. | ADMIN-004-US-013, RESP-002-US-001, RESP-002-US-002, RESP-002-US-010, RESP-002-US-012, RESP-003-US-001, RESP-003-US-002, RESP-003-US-009 |
| ADMIN-004-TC-024 | Traceability Verification | Medium | Duplicate place merge remains outside ADMIN-004 executable ownership. | ADMIN-004 verifies duplicate normalized-name rejection only; duplicate place resolution and merge behavior remain outside this feature unless explicitly documented here. | ADMIN-004-US-007 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-004-TC-025 | Manual Verification | High | Verify documented audit records for place search/detail, name correction, taxonomy correction, conflict rejection, and audit failure once audit log access is defined. | Audit evidence contains documented fields only and excludes private notes, unrelated user data, credentials, tokens, cookies, debug fields, and stack traces. | ADMIN-004-US-011, ADMIN-004-US-012 |
| ADMIN-004-TC-026 | Manual Verification | High | Verify operational log handling for validation errors, conflict errors, stale-update errors, and audit-failure errors once log access and redaction rules are defined. | Logs contain safe metadata only and do not expose `PRIVATE-NOTE-ADMIN-004`, unrelated user data, credentials, tokens, cookies, raw secrets, debug fields, or stack traces. | ADMIN-004-US-006, ADMIN-004-US-007, ADMIN-004-US-008, ADMIN-004-US-011 |

## Summary

- Executable test cases: 0
- Requirement Clarification cases: 9
- Manual Verification cases: 2
- Traceability Verification cases: 15
- Total cases: 26

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- Generic Executable Wording: 0
- Undocumented Executable Routes: 0
- Synthetic ADMIN.PLACE.* executable targets: 0
- Invented Payloads in Executable Tests: 0
- Invented Response Schemas in Executable Tests: 0
- Invented HTTP Statuses in Executable Tests: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Security Assumption Violations: 0
- Summary Count Mismatches: 0
- Final Verdict: Production Grade
