# ADMIN-005 Test Cases - Duplicate place resolution

## Source Requirements

- Feature: `ADMIN-005 - Duplicate place resolution`
- Sources: `ADMIN_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `ADMIN-005-US-001` through `ADMIN-005-US-020`
- API contract gate: the allowed sources define ADMIN-005 business requirements and shared admin status semantics, but do not define exact ADMIN-005 endpoint paths, request payload schemas, response schemas, route paths, or executable request definitions.
- Execution constraint: no ADMIN-005 API test is executable until endpoint, request, payload, response schema, and HTTP status are all documented.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-ADMIN-005-MERGER | Admin `admin-place-merge-005`; permissions `[admin.place.merge]`; MFA complete; recent step-up complete; request id `req-admin-005`. |
| FX-ADMIN-005-NOPERM | Admin `admin-no-merge-005`; permissions `[admin.place.edit]`; MFA complete; lacks `admin.place.merge`. |
| FX-ADMIN-005-PLACES | Canonical target `place-canonical-005`; name `Burger House`; type `restaurant`; subtype `burger`; active `true`; source duplicate `place-source-005`; name `Burger House Riyadh`; type `restaurant`; subtype `burger`; active `true`; incompatible source `place-incompatible-005`; type `cafe`; missing source id `place-missing-005`. |
| FX-ADMIN-005-RATINGS | `user-a` rated source only `8.0`; `user-b` rated canonical only `9.0`; `user-c` rated source `7.0` updated `2026-06-20T10:00:00Z` and canonical `8.5` updated `2026-06-26T10:00:00Z`; private note canary `PRIVATE-NOTE-ADMIN-005`. |
| FX-ADMIN-005-LISTS | `list-005-a` contains source only; `list-005-b` contains canonical only; `list-005-c` contains source and canonical; before list membership rows `4`; expected canonical membership rows after valid merge `3`; duplicate membership rows after valid merge `0`. |
| FX-ADMIN-005-BACKUP | Approved backup reference `backup-admin-005-001` exists before commit. |
| FX-ADMIN-005-NOBACKUP | No approved backup or restore point exists before commit. |
| FX-ADMIN-005-AUDIT-FAIL | Admin `admin-place-merge-005`; permissions `[admin.place.merge]`; recent step-up complete; audit write result `failed`; all source/target/rating/list data before merge unchanged. |
| FX-ADMIN-005-ROLLBACK | Merge step `update-list-memberships` fails before commit; all source/target/rating/list/public reference data must return to pre-merge state if rollback contract is documented. |
| FX-ADMIN-005-A11Y-RESP | Future duplicate review queue, candidate picker, merge preview, confirmation dialog, validation/conflict errors, rollback/error state, and result summary tied to documented global responsive/accessibility requirements. |

## Required Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-ADMIN-005-CANDIDATES | Duplicate candidate review surfaces candidate pairs/groups based on similar normalized names or same name/type after exact queue contract is documented. Private notes, credentials, tokens, cookies, raw secrets, stack traces, and debug fields are absent. |
| ASSERT-ADMIN-005-PERMISSION | Merge preview/commit/recovery access requires `admin.place.merge`; users without that permission receive the documented safe denial after exact access contract is documented. |
| ASSERT-ADMIN-005-STEP-UP | Merge commit requires recent step-up authentication; without it, no source, target, rating, list item, public list reference, aggregate, or audit-visible success state changes after exact contract is documented. |
| ASSERT-ADMIN-005-SELECTION | Admin must select target canonical place and source duplicate place(s); missing target/source leaves all data unchanged and produces the documented validation response after exact contract is documented. |
| ASSERT-ADMIN-005-PREVALIDATION | Pre-merge validation checks source/target existence, active status, taxonomy compatibility, rating conflicts, list item conflicts, and admin permission after exact validation contract is documented. |
| ASSERT-ADMIN-005-BACKUP | Merge commit is blocked unless approved backup or restore point exists before merge starts. |
| ASSERT-ADMIN-005-PREVIEW-SAFE | Preview shows affected ratings count, list item count, public list references, aggregate impact, conflict counts, source/target ids, and no private notes, tokens, passwords, cookies, raw secrets, stack traces, or debug fields after exact preview contract is documented. |
| ASSERT-ADMIN-005-MERGE-INTEGRITY | Source retired; target active; memberships point to canonical; duplicate list item rows `0`; duplicate user/place rating rows `0`; aggregates and search/filter results reflect canonical place; no orphan list items remain after exact commit contract is documented. |
| ASSERT-ADMIN-005-RATING-CONFLICT | Source-only rating moves to canonical; canonical-only rating remains; when same user rated both, most recently updated rating remains canonical; discarded details are only in audit-safe summary and private notes are absent after exact conflict contract is documented. |
| ASSERT-ADMIN-005-ROLLBACK | If merge fails before commit, all source, target, rating, list item, public list reference, aggregate, and audit-visible result state remains pre-merge after rollback contract is documented. |
| ASSERT-ADMIN-005-RECOVERY | Post-commit bad merge recovery requires backup/restore or approved corrective process; admin UI does not silently reverse complex merges after recovery process is documented. |
| ASSERT-ADMIN-005-AUDIT | Audit includes source place id, target place id, affected counts, conflict summary, reason, backup reference, admin id, timestamp, request id, and result. Private notes, credentials, tokens, cookies, raw secrets, debug fields, and stack traces are absent. |
| ASSERT-ADMIN-005-AUDIT-FAIL-SAFE | If audit logging fails, merge fails and no source, target, rating, list item, public list reference, or aggregate data changes. |
| ASSERT-ADMIN-005-A11Y-DIALOG | Candidate selection, preview, confirmation, validation errors, conflict errors, rollback/error state, and result summary are keyboard and screen-reader accessible with visible focus. |
| ASSERT-ADMIN-005-A11Y-TOUCH | Candidate, preview, confirmation, error, rollback, result, and recovery controls have at least `44x44` CSS pixel hit targets. |
| ASSERT-ADMIN-005-RESPONSIVE | Duplicate review queue, candidate picker, preview, confirmation, validation/conflict errors, rollback/error state, and result summary have no horizontal overflow at `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`, phone landscape, and `200%` zoom. |

## Executable Test Cases

No executable ADMIN-005 API tests are currently valid because the allowed sources do not document exact ADMIN-005 endpoint paths, request payload schemas, response schemas, and status mapping. Business coverage is preserved below as Requirement Clarification, Traceability Verification, and Manual Verification.

## Requirement Clarification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-005-TC-001 | Requirement Clarification | Critical | Define exact duplicate-candidate queue endpoint, request parameters, payload shape if any, success status, response schema, candidate grouping evidence, pagination envelope, and allowed fields. | Future executable tests can verify ASSERT-ADMIN-005-CANDIDATES using documented contracts only. | ADMIN-005-US-001 |
| ADMIN-005-TC-002 | Requirement Clarification | Critical | Define exact missing-permission and guest-denial fixtures for merge preview, commit, recovery, and audit access, including endpoint, status, response schema, and forbidden fields. | Future executable tests can verify ASSERT-ADMIN-005-PERMISSION without inventing request definitions or schemas. | ADMIN-005-US-002 |
| ADMIN-005-TC-003 | Requirement Clarification | Critical | Define exact merge step-up requirement, proof shape, failure response, audit handling, and unchanged-state assertions. | Future executable tests can verify ASSERT-ADMIN-005-STEP-UP using documented contracts only. | ADMIN-005-US-003 |
| ADMIN-005-TC-004 | Requirement Clarification | Critical | Define exact canonical/source selection payload, validation status, error schema, required fields, forbidden fields, and unchanged-state assertions. | Future executable tests can verify ASSERT-ADMIN-005-SELECTION without inventing payload fields. | ADMIN-005-US-004 |
| ADMIN-005-TC-005 | Requirement Clarification | Critical | Define exact pre-merge validation contract, failure classes, status mapping, response schema, and deterministic fixtures for missing source, inactive source/target, taxonomy mismatch, rating conflict, list item conflict, and permission failure. | Future executable tests can verify ASSERT-ADMIN-005-PREVALIDATION with deterministic one-condition-per-case coverage. | ADMIN-005-US-005 |
| ADMIN-005-TC-006 | Requirement Clarification | Critical | Define approved backup/restore point evidence format, commit precondition, missing-backup response schema, and forbidden fields. | Future executable tests can verify ASSERT-ADMIN-005-BACKUP without inventing backup internals. | ADMIN-005-US-006 |
| ADMIN-005-TC-007 | Requirement Clarification | Critical | Define exact merge preview endpoint, request shape, success status, response schema, affected-count fields, conflict summary fields, aggregate impact fields, and forbidden private-note fields. | Future executable tests can verify ASSERT-ADMIN-005-PREVIEW-SAFE using documented contracts only. | ADMIN-005-US-007, ADMIN-005-US-012 |
| ADMIN-005-TC-008 | Requirement Clarification | Critical | Define exact merge commit endpoint, payload, confirmation requirement, reason validation, response schema, success status, source-retirement representation, target-active representation, and transaction boundaries. | Future executable tests can verify ASSERT-ADMIN-005-MERGE-INTEGRITY using documented contracts only. | ADMIN-005-US-008, ADMIN-005-US-009, ADMIN-005-US-014, ADMIN-005-US-015 |
| ADMIN-005-TC-009 | Requirement Clarification | Critical | Define exact rating migration and rating conflict schema, most-recent timestamp tie handling, discarded-rating audit summary, and duplicate rating prevention assertion. | Future executable tests can verify ASSERT-ADMIN-005-RATING-CONFLICT deterministically. | ADMIN-005-US-010, ADMIN-005-US-011, ADMIN-005-US-012 |
| ADMIN-005-TC-010 | Requirement Clarification | Critical | Define exact aggregate/search/filter surfaces affected by merge, request definitions if any, before/after expected values, and ownership boundaries for cross-surface verification. | Future executable tests can verify aggregate and catalog outcomes without executing undocumented cross-module APIs. | ADMIN-005-US-013, ADMIN-005-US-014 |
| ADMIN-005-TC-011 | Requirement Clarification | Critical | Define exact rollback failure fixture, failure signal, failure response schema, status mapping, and pre/post state assertions. | Future executable tests can verify ASSERT-ADMIN-005-ROLLBACK without inventing transaction failure mechanics. | ADMIN-005-US-016 |
| ADMIN-005-TC-012 | Requirement Clarification | High | Define exact post-commit recovery information surface, approved corrective-process wording, backup/restore evidence, and forbidden silent-reverse controls. | Future executable tests can verify ASSERT-ADMIN-005-RECOVERY using documented UI or manual procedure only. | ADMIN-005-US-017 |
| ADMIN-005-TC-013 | Requirement Clarification | Critical | Define exact audit-failure fixture, audit failure signal, failure response schema, status mapping, and rollback guarantees for merge commit. | Future executable tests can verify ASSERT-ADMIN-005-AUDIT-FAIL-SAFE without inventing audit sink behavior. | ADMIN-005-US-018 |
| ADMIN-005-TC-014 | Requirement Clarification | Critical | Define exact audit access method, audit record schema, success and failure audit result representation, required fields, forbidden fields, and retention/access controls. | Future executable tests can verify ASSERT-ADMIN-005-AUDIT without symbolic audit access. | ADMIN-005-US-019 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-005-TC-015 | Traceability Verification | High | Duplicate candidate detection coverage must exist after exact queue contract is documented. | Coverage requires similar normalized names or same name/type candidate pairs/groups, including `place-canonical-005` and `place-source-005`, with ASSERT-ADMIN-005-CANDIDATES. | ADMIN-005-US-001 |
| ADMIN-005-TC-016 | Traceability Verification | Critical | Missing `admin.place.merge` must deny merge access. | Coverage requires no merge data, safe error schema, and no private note/debug exposure after denial contract is documented. | ADMIN-005-US-002 |
| ADMIN-005-TC-017 | Traceability Verification | Critical | Merge commit step-up coverage must exist. | Coverage requires permission, missing recent step-up, blocked commit, unchanged source/target/rating/list state, and safe audit evidence after contract is documented. | ADMIN-005-US-003 |
| ADMIN-005-TC-018 | Traceability Verification | Critical | Canonical and source selection coverage must exist. | Coverage requires selected target canonical place, selected source duplicate place(s), validation for missing selections, and no data changes on invalid selection after contract is documented. | ADMIN-005-US-004 |
| ADMIN-005-TC-019 | Traceability Verification | Critical | Pre-merge validation coverage must include every documented validation category. | Coverage requires source/target existence, active status, taxonomy compatibility, rating conflicts, list item conflicts, and admin permission with one deterministic fixture per failed condition after contract is documented. | ADMIN-005-US-005 |
| ADMIN-005-TC-020 | Traceability Verification | Critical | Backup precondition coverage must exist before merge commit. | Coverage requires approved backup reference `backup-admin-005-001`, missing-backup fixture `FX-ADMIN-005-NOBACKUP`, blocked commit without backup, and no data changes. | ADMIN-005-US-006 |
| ADMIN-005-TC-021 | Traceability Verification | Critical | Merge preview privacy coverage must exist. | Coverage requires affected ratings count, list item count, public list references, aggregate impact, conflict counts, source/target ids, and `PRIVATE-NOTE-ADMIN-005` absent from API, UI, accessibility tree, audit preview, errors, and documented logs. | ADMIN-005-US-007, ADMIN-005-US-012 |
| ADMIN-005-TC-022 | Traceability Verification | Critical | Transactional merge coverage must exist. | Coverage requires all reference updates happen in one transaction and rollback occurs on any pre-commit failure after exact transaction contract is documented. | ADMIN-005-US-008, ADMIN-005-US-016 |
| ADMIN-005-TC-023 | Traceability Verification | Critical | List membership preservation coverage must exist. | Coverage requires source/canonical/both-list fixtures, after-merge canonical membership rows `3`, duplicate membership rows `0`, and no orphan list items. | ADMIN-005-US-009, ADMIN-005-US-015 |
| ADMIN-005-TC-024 | Traceability Verification | Critical | Rating preservation coverage must exist. | Coverage requires source-only rating moves to canonical, canonical-only rating remains, and private notes remain hidden. | ADMIN-005-US-010, ADMIN-005-US-012 |
| ADMIN-005-TC-025 | Traceability Verification | Critical | Duplicate user rating conflict coverage must exist. | Coverage requires `user-c` source rating `7.0` updated `2026-06-20T10:00:00Z`, canonical rating `8.5` updated `2026-06-26T10:00:00Z`, final canonical rating `8.5`, and duplicate user/place rating rows `0`. | ADMIN-005-US-011, ADMIN-005-US-015 |
| ADMIN-005-TC-026 | Traceability Verification | Critical | Aggregate recalculation and source retirement coverage must exist without executing undocumented cross-module APIs. | Coverage requires average rating, rating count, place list references, search/filter results, source inactive state, and supported references resolving to canonical after exact affected surfaces are documented. | ADMIN-005-US-013, ADMIN-005-US-014 |
| ADMIN-005-TC-027 | Traceability Verification | Critical | Post-merge integrity verification must include every documented integrity assertion. | Coverage requires no orphan list items, no duplicate list items, no duplicate user/place ratings, source retired, target active, and aggregates recalculated. | ADMIN-005-US-015 |
| ADMIN-005-TC-028 | Traceability Verification | High | Bad-merge recovery coverage must remain scoped to documented recovery expectations. | Coverage requires backup/restore or approved corrective process and no silent reverse action in admin UI after the recovery surface is documented. | ADMIN-005-US-017 |
| ADMIN-005-TC-029 | Traceability Verification | Critical | Audit failure must block merge commit. | Coverage requires audit failure fixture, merge failure, unchanged source/target/rating/list/public reference state, and no private/debug leakage after audit failure behavior is documented. | ADMIN-005-US-018 |
| ADMIN-005-TC-030 | Traceability Verification | Critical | Duplicate merge audit coverage must include every documented audit field. | Coverage requires source place id, target place id, affected counts, conflict summary, reason, backup reference, admin id, timestamp, request id, and result; private notes, credentials, tokens, cookies, raw secrets, debug fields, and stack traces are absent. | ADMIN-005-US-019 |
| ADMIN-005-TC-031 | Traceability Verification | High | Duplicate merge accessibility must be covered. | Coverage requires candidate selection, preview, confirmation, errors, and result summary to satisfy keyboard and screen-reader requirements with ASSERT-ADMIN-005-A11Y-DIALOG and ASSERT-ADMIN-005-A11Y-TOUCH. | ADMIN-005-US-020, A11Y-001-US-001, A11Y-001-US-003, A11Y-001-US-004, A11Y-001-US-006, A11Y-001-US-014, A11Y-001-US-016, RESP-003-US-008 |
| ADMIN-005-TC-032 | Traceability Verification | High | Duplicate merge responsive coverage must be included. | Coverage requires ASSERT-ADMIN-005-RESPONSIVE for duplicate review queue, candidate picker, preview, confirmation, validation/conflict errors, rollback/error state, and result summary at the required viewport, safe-area, landscape, and zoom matrix. | ADMIN-005-US-020, RESP-002-US-001, RESP-002-US-002, RESP-002-US-010, RESP-002-US-012, RESP-003-US-001, RESP-003-US-002, RESP-003-US-009 |
| ADMIN-005-TC-033 | Traceability Verification | Medium | Place metadata correction remains outside ADMIN-005 executable ownership. | ADMIN-005 covers duplicate merge selection, preview, commit, rollback, verification, and recovery; objective metadata editing remains outside this feature unless explicitly documented here. | ADMIN-005-US-004 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| ADMIN-005-TC-034 | Manual Verification | Critical | Verify approved backup or restore point evidence before merge commit once backup process and evidence location are defined. | Evidence confirms backup reference `backup-admin-005-001` or equivalent approved restore point exists before commit and can support post-commit recovery. | ADMIN-005-US-006, ADMIN-005-US-017 |
| ADMIN-005-TC-035 | Manual Verification | High | Verify documented audit records for candidate review, preview, commit success, rollback, audit failure, and post-commit recovery once audit log access is defined. | Audit evidence contains documented fields only and excludes private notes, credentials, tokens, cookies, raw secrets, debug fields, and stack traces. | ADMIN-005-US-018, ADMIN-005-US-019 |
| ADMIN-005-TC-036 | Manual Verification | High | Verify operational log handling for preview, validation failures, backup failure, merge failure, rollback, and audit failure once log access and redaction rules are defined. | Logs contain safe metadata only and do not expose `PRIVATE-NOTE-ADMIN-005`, credentials, tokens, cookies, raw secrets, discarded private rating details, debug fields, or stack traces. | ADMIN-005-US-005, ADMIN-005-US-012, ADMIN-005-US-016, ADMIN-005-US-018 |

## Summary

- Executable test cases: 0
- Requirement Clarification cases: 14
- Manual Verification cases: 3
- Traceability Verification cases: 19
- Total cases: 36

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- Generic Executable Wording: 0
- Undocumented Executable Routes: 0
- Symbolic Request Targets: 0
- Invented Payloads: 0
- Invented Response Schemas: 0
- Invented HTTP Status Codes: 0
- Cross-Surface Executable API Tests: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Security Assumption Violations: 0
- Summary Count Mismatches: 0
- Final Verdict: Production Grade
