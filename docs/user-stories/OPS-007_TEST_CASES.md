# OPS-007 Test Cases - Alembic schema evolution

## Source Requirements

- Feature: `OPS-007 - Alembic schema evolution`
- Sources: `SYSTEM_OPERATIONS_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- User stories processed: `OPS-007-US-001` through `OPS-007-US-024`
- API contract gate: OPS-007 is an operational migration and release-safety feature. Migration and release evidence requirements are governed by `EDR-008_MIGRATION_RELEASE_EVIDENCE_POLICY.md`; no executable API endpoints, payloads, response schemas, or HTTP statuses are defined for migration operations.

## Deterministic Fixtures

| Fixture ID | Exact State |
|---|---|
| FX-OPS-007-MIGRATION | New Alembic target revision `rev-ops-007-target`; previous revision `rev-ops-007-previous`; deployment id `deploy-ops-007-001`; environment `test`, `beta`, or `production` as specified by each case. |
| FX-OPS-007-DATA | Representative data exists before migration: users `5`, lists `4`, places `6`, ratings `7`, list items `8`. |
| FX-OPS-007-BACKUP | Backup id `backup-ops-007-001`; location `backup-location-ops-007`; timestamp `2026-06-27T09:30:00Z`; environment `production`; database identifier `db-ops-007`; target revision `rev-ops-007-target`; credential canary `DB-PASSWORD-OPS-007`. |
| FX-OPS-007-RESTORE | Approved non-production restore target `restore-ops-007-001`; restored revision `rev-ops-007-target`; row-count sanity expected from FX-OPS-007-DATA. |
| FX-OPS-007-DESTRUCTIVE | Operation candidate can delete production data; approval id `approval-ops-007-001`; scope statement `scope-ops-007`; post-operation validation id `validation-ops-007-001`. |
| FX-OPS-007-FAILURE | Migration fails in beta or production; failure category `migration_failure`; alert sink pending clarification. |
| FX-OPS-007-ROLLBACK | Deployment causes health failure, elevated `5xx`, migration mismatch, auth breakage, or core flow outage. |
| FX-OPS-007-LIVE-DATA | Beta/production verification creates approved records tagged `ops-007-live-test`; cleanup evidence id `cleanup-ops-007-001`. |

## Required Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-OPS-007-REVISION | Database reaches expected Alembic revision `rev-ops-007-target` after approved migration step. |
| ASSERT-OPS-007-DATA-PRESERVED | Users `5`, lists `4`, places `6`, ratings `7`, and list items `8` remain intact for non-destructive migrations unless an explicitly approved destructive task exists. |
| ASSERT-OPS-007-BACKUP-SAFE | Backup metadata includes backup id/location, timestamp, environment, database identifier, and target revision; `DB-PASSWORD-OPS-007` and credentials are absent. |
| ASSERT-OPS-007-RESTORE-VALID | Restore validation confirms table existence, migration revision, row-count sanity, and representative data integrity. |
| ASSERT-OPS-007-NO-DESTRUCTIVE-RESET | Deployment migration does not drop tables, truncate data, reset schema, or wipe rows unless explicit destructive approval exists. |
| ASSERT-OPS-007-MARKER | Migration logs include environment, target revision, previous revision, request/job id, and deployment marker without secrets. |
| ASSERT-OPS-007-READY | `/health/ready` validates expected revision before deployment is accepted. |
| ASSERT-OPS-007-RECOVERY | Rollback or forward-fix decision is documented, safe for schema/data state, and verified with health, readiness, migration revision, and core smoke tests. |
| ASSERT-OPS-007-EVIDENCE | Backup proof, validation result, target revision, deployment id, and operator/release owner are retained. |

## Executable Test Cases

No executable OPS-007 API tests are currently valid because the allowed sources do not document migration operation endpoints, request payload schemas, response schemas, or HTTP status mapping. Operational coverage is preserved below as Requirement Clarification, Traceability Verification, and Manual Verification.

## EDR-Backed Operational Policy Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-007-TC-001 | Manual Verification | Critical | Migration execution evidence source, command log schema, revision source, and validation artifact path are governed by EDR-008. | Release evidence can verify ASSERT-OPS-007-REVISION without inventing migration tooling internals in product tests. | OPS-007-US-001 |
| OPS-007-TC-002 | Manual Verification | Critical | Production backup evidence source, restore validation evidence source, credential redaction rule, and approval artifact are governed by EDR-008. | Release gates verify backup and restore readiness through approved operational evidence. | OPS-007-US-003, OPS-007-US-004, OPS-007-US-005 |
| OPS-007-TC-003 | Manual Verification | Critical | Restore validation checks, representative data integrity queries, accepted row-count variance, and failure handling are governed by EDR-008. | Restore validation evidence supports ASSERT-OPS-007-RESTORE-VALID without inventing query internals. | OPS-007-US-006 |
| OPS-007-TC-004 | Manual Verification | High | Migration timeout value, failure artifact, and deploy-blocking behavior are governed by EDR-008. | Release tests do not invent deployment platform behavior; timeout evidence comes from operational policy. | OPS-007-US-011 |
| OPS-007-TC-005 | Manual Verification | Critical | Migration failure alert sink, severity, routing, and required evidence are governed by EDR-006 and EDR-008. | Alert verification waits for production monitoring design and release evidence policy. | OPS-007-US-012 |
| OPS-007-TC-006 | Traceability Verification | Medium | Migration SLI metric names, dimensions, and evidence retention location are governed by EDR-006 and EDR-008. | Observability tests do not invent metric backends or retention locations. | OPS-007-US-022 |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-007-TC-007 | Traceability Verification | Critical | Data preservation coverage must exist for non-destructive migrations. | Coverage requires ASSERT-OPS-007-DATA-PRESERVED for users, lists, places, ratings, and list items. | OPS-007-US-002 |
| OPS-007-TC-008 | Traceability Verification | High | Migration order validation must be release-gated. | Coverage requires clean database upgrade to head without revision gaps. | OPS-007-US-007 |
| OPS-007-TC-009 | Traceability Verification | High | CI migration validation must use PostgreSQL or production-compatible database engine. | Coverage rejects SQLite-only or mock-only migration confidence for release gating. | OPS-007-US-008, OPS-007-US-023 |
| OPS-007-TC-010 | Traceability Verification | Medium | Downgrade path review must exist when downgrade logic is provided. | Coverage requires downgrade syntax validation and data-loss risk review. | OPS-007-US-009 |
| OPS-007-TC-011 | Traceability Verification | Critical | Destructive reset prevention coverage must exist. | Coverage requires ASSERT-OPS-007-NO-DESTRUCTIVE-RESET unless approved destructive operation evidence exists. | OPS-007-US-010, OPS-007-US-021 |
| OPS-007-TC-012 | Traceability Verification | Medium | Migration deployment marker coverage must exist. | Coverage requires ASSERT-OPS-007-MARKER with no secrets. | OPS-007-US-013 |
| OPS-007-TC-013 | Traceability Verification | Critical | Readiness integration coverage must exist. | Coverage requires ASSERT-OPS-007-READY after migration completes. | OPS-007-US-014 |
| OPS-007-TC-014 | Traceability Verification | Critical | Rollback or forward-fix decision coverage must exist. | Coverage requires health failure, elevated `5xx`, migration mismatch, auth breakage, or core flow outage to force rollback/forward-fix decision. | OPS-007-US-015, OPS-007-US-017 |
| OPS-007-TC-015 | Traceability Verification | Critical | Rollback restrictions coverage must exist. | Coverage requires application rollback only when schema compatibility is confirmed and destructive database downgrade prohibited unless explicitly approved. | OPS-007-US-016 |
| OPS-007-TC-016 | Traceability Verification | High | Rollback verification coverage must exist. | Coverage requires ASSERT-OPS-007-RECOVERY before incident closure. | OPS-007-US-018 |
| OPS-007-TC-017 | Traceability Verification | High | Environment separation coverage must exist. | Coverage requires local/test may use fixtures, beta/production use real DB safeguards, and production requires backup plus release approval. | OPS-007-US-019 |
| OPS-007-TC-018 | Traceability Verification | High | Live test data policy coverage must exist. | Coverage requires approved beta/production test records are documented, safely cleaned up, and auditable. | OPS-007-US-020 |
| OPS-007-TC-019 | Traceability Verification | Medium | Migration evidence retention coverage must exist. | Coverage requires ASSERT-OPS-007-EVIDENCE for production migrations. | OPS-007-US-024 |

## Manual Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| OPS-007-TC-020 | Manual Verification | Critical | Review production migration release package before approval. | Package includes current backup, restore validation, target revision, destructive-operation assessment, release owner, and approval evidence. | OPS-007-US-003, OPS-007-US-005, OPS-007-US-021, OPS-007-US-024 |
| OPS-007-TC-021 | Manual Verification | Critical | Review failed migration incident evidence when FX-OPS-007-FAILURE occurs. | Alert fired, release marked failed, rollback/forward-fix decision documented, and readiness/smoke verification completed after recovery. | OPS-007-US-012, OPS-007-US-015, OPS-007-US-018 |
| OPS-007-TC-022 | Manual Verification | High | Review live test data cleanup evidence after beta/production verification. | Records tagged `ops-007-live-test` are documented, cleaned up when safe, and cleanup evidence `cleanup-ops-007-001` or equivalent is retained. | OPS-007-US-020 |

## Summary

- Executable test cases: 0
- Requirement Clarification cases: 0
- Manual Verification cases: 8
- Traceability Verification cases: 14
- Total cases: 22

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
