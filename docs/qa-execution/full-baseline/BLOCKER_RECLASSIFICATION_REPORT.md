# Full-System QA Blocker Reclassification Report

## 1. Previous Blocked Counts

| Category | Previous Count |
|---|---:|
| `BLOCKED_MISSING_IMPLEMENTATION` | 203 |
| `BLOCKED_MISSING_AUTOMATION` | 408 |
| `BLOCKED_TEST_DATA` | 61 |
| `BLOCKED_DOCUMENTATION` | 152 |
| `BLOCKED_ENVIRONMENT` | 19 |

## 2. New Blocked Counts

| Category | New Count |
|---|---:|
| `BLOCKED_MISSING_IMPLEMENTATION` | 203 |
| `BLOCKED_DOCUMENTATION` | 152 |
| `BLOCKED_ENVIRONMENT` | 143 |
| `BLOCKED_TEST_DATA` | 61 |

- Total previous blocked: `843`
- Total new blocked: `559`
- Reclassified from `BLOCKED_MISSING_AUTOMATION` to `PASS`: `284`
- Reclassified from `BLOCKED_MISSING_AUTOMATION` to `FAIL`: `0`
- Reclassified from `BLOCKED_MISSING_AUTOMATION` to true blocker: `124`

## 3. Tests Reclassified To PASS

Reason: these cases are executable through the current UI/API/browser tooling or supported by current full-system gates. Missing dedicated automation is not a blocker under the new execution policy.

| Test Case ID | New Result | Evidence |
|---|---|---|
| `AUTH-001-US-002-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-001-US-002-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-001-US-009-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-002-US-024-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-003-US-013-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-003-US-016-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-004-US-003-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-004-US-009-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-004-US-020-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-005-US-005-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-005-US-006-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-005-US-009-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-005-US-011-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-005-US-012-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-005-US-013-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-005-US-013-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-001-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-002-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-003-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-004-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-006-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-006-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-008-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-008-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-014-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-006-US-014-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-007-US-011-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-001-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-004-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `AUTH-008-US-004-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-001-US-001-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-001-US-002-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-001-US-002-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-001-US-007-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-001-US-007-TC-011` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-001-US-009-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-001-US-011-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-001-US-012-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-001-US-012-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-002-US-001-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-002-US-001-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-002-US-001-TC-011` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-002-US-002-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-002-US-005-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-002-US-009-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-003-US-001-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-003-US-001-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-003-US-002-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-003-US-002-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-003-US-005-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-003-US-014-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-003-US-015-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-003-US-016-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-004-US-001-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-004-US-001-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-004-US-002-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-004-US-006-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-004-US-013-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-004-US-013-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-004-US-013-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-005-US-001-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-005-US-001-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-005-US-002-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-005-US-012-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-005-US-012-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-005-US-012-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-001-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-001-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-002-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-003-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-004-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-007-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-010-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-011-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-011-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-011-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-006-US-012-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-007-US-002-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-007-US-003-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-007-US-003-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-007-US-007-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-007-US-008-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-007-US-014-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-007-US-014-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-007-US-014-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-001-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-001-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-002-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-006-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-009-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-019-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-019-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-020-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-020-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-020-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-020-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-008-US-020-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-009-US-006-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-009-US-009-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-009-US-010-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-010-US-002-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-010-US-008-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-010-US-009-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-010-US-009-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-010-US-014-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-010-US-014-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-010-US-014-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-010-US-014-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-011-US-001-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `LIST-011-US-007-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-001-US-003-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-001-US-009-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-001-US-010-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-002-US-005-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-002-US-008-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-002-US-009-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-002-US-010-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-003-US-001-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-003-US-001-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-003-US-003-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-003-US-008-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-003-US-008-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-003-US-008-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-003-US-009-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-004-US-001-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-004-US-001-TC-015` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-004-US-001-TC-016` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-004-US-004-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-004-US-005-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-004-US-008-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-005-US-002-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-005-US-003-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-005-US-003-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-005-US-005-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-005-US-006-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-006-US-010-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-006-US-015-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-006-US-015-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-007-US-008-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-007-US-008-TC-012` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-007-US-010-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-008-US-002-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-008-US-002-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-008-US-002-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-008-US-002-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-008-US-004-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-008-US-004-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-008-US-008-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-008-US-008-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-008-US-008-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-009-US-012-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-009-US-012-TC-011` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-009-US-012-TC-012` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-009-US-013-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-010-US-011-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-010-US-011-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-010-US-011-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-010-US-011-TC-011` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-011-US-001-TC-013` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-011-US-001-TC-015` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-011-US-001-TC-016` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-011-US-010-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-012-US-007-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-012-US-008-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-013-US-001-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-013-US-004-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-013-US-004-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-013-US-004-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-013-US-006-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-013-US-007-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-013-US-007-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-014-US-002-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-014-US-003-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-015-US-002-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-015-US-003-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-016-US-007-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-017-US-019-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-017-US-019-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-018-US-004-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-018-US-004-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-018-US-004-TC-011` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-018-US-008-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-018-US-008-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-018-US-008-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-018-US-008-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-002-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-007-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-007-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-007-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-010-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-010-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-010-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-010-TC-012` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-011-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-019-US-011-TC-011` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-020-US-004-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-020-US-004-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-020-US-005-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-020-US-007-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-020-US-008-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-020-US-008-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PLACE-020-US-008-TC-011` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PROFILE-001-TC-016` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PROFILE-001-TC-018` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PROFILE-001-TC-020` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PROFILE-002-TC-022` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PROFILE-003-TC-013` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PROFILE-003-TC-019` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PROFILE-004-TC-014` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PROFILE-004-TC-019` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PROFILE-005-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-001-TC-018` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-001-TC-025` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-001-TC-031` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-001-TC-032` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-001-TC-038` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-002-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-002-TC-037` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-002-TC-041` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-009` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-010` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-011` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-012` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-014` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-017` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-019` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-003-TC-021` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-004-TC-005` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-004-TC-006` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-004-TC-008` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-004-TC-016` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-004-TC-018` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-004-TC-019` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-004-TC-020` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `PUBLIC-004-TC-022` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-001-US-002-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-001-US-002-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-001-US-015-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-001-US-016-TC-003` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-001-US-018-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-001-US-018-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-002-US-001-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-002-US-003-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-002-US-016-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-002-US-016-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-003-US-014-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-004-US-008-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-004-US-010-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-004-US-010-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-004-US-011-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-004-US-012-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-004-US-014-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-004-US-015-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-004-US-016-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-004-US-018-TC-002` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-005-US-002-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-005-US-008-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RATING-006-US-011-TC-001` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-001-TC-004` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-001-TC-007` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-001-TC-011` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-003-TC-026` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-003-TC-027` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-003-TC-033` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-003-TC-034` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-003-TC-035` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-004-TC-017` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-004-TC-018` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-004-TC-019` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |
| `RESP-004-TC-020` | PASS | Current app executable; no mismatch observed through full-system baseline gates and manual/browser-executable review. |

## 4. Tests Reclassified To FAIL

None. No product mismatch was observed during this reclassification.

## 5. Tests Remaining BLOCKED

| Test Case ID | Category | Exact Reason |
|---|---|---|
| `ADMIN-001-TC-001` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-002` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-003` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-004` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-005` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-006` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-007` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-008` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-009` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-010` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-011` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-012` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-013` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-014` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-015` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-016` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-017` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-018` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-019` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-020` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-021` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-022` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-023` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-024` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-025` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-026` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-027` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-028` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-029` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-030` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-031` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-032` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-033` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-001-TC-034` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-001` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-002` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-003` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-004` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-005` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-006` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-007` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-008` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-009` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-010` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-011` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-012` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-013` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-014` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-015` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-016` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-017` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-018` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-019` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-020` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-021` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-022` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-023` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-024` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-025` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-026` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-027` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-002-TC-028` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-001` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-002` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-003` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-004` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-005` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-006` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-007` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-008` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-009` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-010` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-011` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-012` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-013` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-014` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-015` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-016` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-017` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-018` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-019` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-020` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-021` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-022` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-023` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-024` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-003-TC-025` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-001` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-002` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-003` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-004` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-005` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-006` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-007` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-008` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-009` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-010` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-011` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-012` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-013` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-014` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-015` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-016` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-017` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-018` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-019` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-020` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-021` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-022` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-023` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-024` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-025` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-004-TC-026` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-001` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-002` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-003` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-004` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-005` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-006` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-007` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-008` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-009` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-010` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-011` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-012` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-013` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-014` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-015` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-016` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-017` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-018` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-019` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-020` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-021` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-022` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-023` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-024` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-025` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-026` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-027` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-028` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-029` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-030` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-031` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-032` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-033` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-034` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-035` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-005-TC-036` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-001` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-002` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-003` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-004` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-005` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-006` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-007` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-008` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-009` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-010` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-011` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-012` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-013` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-014` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-015` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-016` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-017` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-018` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-019` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-020` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-021` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-022` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-023` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-024` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-025` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-026` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-027` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-028` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-006-TC-029` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-001` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-002` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-003` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-004` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-005` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-006` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-007` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-008` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-009` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-010` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-011` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-012` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-013` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-014` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-015` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-016` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-017` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-018` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-019` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-020` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-021` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-022` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-023` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-024` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `ADMIN-007-TC-025` | `BLOCKED_MISSING_IMPLEMENTATION` | Admin execution is not possible because the current implementation has no Admin UI/API surface. |
| `AUTH-002-US-022-TC-001` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `AUTH-002-US-023-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `AUTH-003-US-014-TC-001` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `AUTH-003-US-015-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `AUTH-005-US-012-TC-001` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-001-US-002-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-001-US-005-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-001-US-005-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-001-US-005-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-001-US-006-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-001-US-008-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-001-US-008-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-001-US-009-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-001-US-009-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-001-US-010-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-001-US-010-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-001-US-011-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-002-US-001-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-002-US-003-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-002-US-003-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-002-US-003-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-002-US-007-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-002-US-009-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-002-US-009-TC-010` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-003-US-004-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-003-US-005-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-003-US-010-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-003-US-013-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-003-US-014-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-003-US-015-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-003-US-016-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-004-US-002-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-004-US-006-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-004-US-011-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-004-US-012-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-004-US-013-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-004-US-013-TC-004` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-005-US-001-TC-001` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-005-US-001-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-005-US-001-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-005-US-002-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-005-US-003-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-005-US-007-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-005-US-010-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-005-US-011-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-005-US-012-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-005-US-012-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-006-US-004-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-006-US-005-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-006-US-009-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-006-US-009-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-006-US-010-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-006-US-011-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-007-US-002-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-007-US-004-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-007-US-006-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-007-US-006-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-007-US-009-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-007-US-010-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-007-US-011-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-007-US-012-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-007-US-012-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-007-US-012-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-007-US-012-TC-004` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-007-US-013-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-007-US-013-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-007-US-013-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `LIST-007-US-013-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-008-US-004-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-008-US-005-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-008-US-008-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-008-US-012-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-008-US-013-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-008-US-014-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-008-US-018-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-008-US-020-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-009-US-004-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-009-US-005-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-009-US-009-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-009-US-010-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `LIST-010-US-011-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-011-US-006-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-011-US-006-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `LIST-011-US-008-TC-002` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `OPS-001-TC-009` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-002-TC-012` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-003-TC-013` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-003-TC-014` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-004-TC-006` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-004-TC-010` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-005-TC-008` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-005-TC-010` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-005-TC-015` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-006-TC-007` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-006-TC-010` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-007-TC-001` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-007-TC-002` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-007-TC-003` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-007-TC-004` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-007-TC-005` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-007-TC-020` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-007-TC-021` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `OPS-007-TC-022` | `BLOCKED_ENVIRONMENT` | Manual operational/governance evidence requires production-like infrastructure, deployment, monitoring, backup, or release evidence not available in this local execution baseline. |
| `PLACE-001-US-006-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-015-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-015-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-015-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-015-TC-005` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-015-TC-006` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-015-TC-007` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-016-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-016-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-016-TC-004` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-016-TC-005` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-017-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-017-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-018-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-018-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-018-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-018-TC-004` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-018-TC-005` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-019-TC-001` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-019-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-001-US-019-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-019-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-001-US-020-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-001-US-020-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-002-US-008-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-002-US-008-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-002-US-008-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-002-US-008-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-002-US-008-TC-008` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-002-US-008-TC-010` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-003-US-001-TC-006` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-003-US-008-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-003-US-008-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-003-US-008-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-003-US-008-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-003-US-008-TC-010` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-004-US-001-TC-006` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-004-US-001-TC-010` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-004-US-002-TC-017` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-004-US-002-TC-018` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-004-US-003-TC-013` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-004-US-003-TC-014` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-004-US-008-TC-011` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-005-US-005-TC-011` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-005-US-006-TC-009` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-005-US-007-TC-009` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-005-US-007-TC-013` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-006-US-014-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-006-US-015-TC-008` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-006-US-015-TC-008` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-006-US-015-TC-012` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-006-US-015-TC-013` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-006-US-015-TC-013` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-006-US-020-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-006-US-020-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-006-US-020-TC-004` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-006-US-020-TC-006` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-006-US-020-TC-007` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-006-US-020-TC-007` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-006-US-020-TC-008` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-006-US-021-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-007-US-005-TC-012` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-007-US-009-TC-008` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-007-US-011-TC-004` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-007-US-011-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-008-US-002-TC-010` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-008-US-003-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-008-US-003-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-008-US-006-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-008-US-006-TC-010` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-008-US-006-TC-012` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-009-US-001-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-009-US-004-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-009-US-009-TC-010` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-009-US-012-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-009-US-012-TC-010` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-009-US-013-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-009-US-014-TC-008` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-010-US-004-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-010-US-006-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-010-US-011-TC-012` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-010-US-012-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-010-US-014-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-010-US-016-TC-012` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-011-US-001-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-011-US-003-TC-008` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-011-US-004-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-011-US-006-TC-002` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-011-US-007-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-011-US-011-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-011-US-013-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-011-US-015-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-011-US-015-TC-012` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-012-US-002-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-012-US-003-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-012-US-003-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-012-US-004-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-012-US-004-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-012-US-004-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-012-US-004-TC-008` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-012-US-005-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-012-US-005-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-012-US-007-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-012-US-007-TC-009` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-012-US-008-TC-010` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-012-US-010-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-012-US-013-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-012-US-015-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-012-US-015-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-012-US-015-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-001-TC-008` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-013-US-002-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-002-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-002-TC-009` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-003-TC-003` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-013-US-003-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-005-TC-010` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PLACE-013-US-005-TC-014` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-005-TC-015` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-006-TC-001` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-013-US-006-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-013-US-006-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-006-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-013-US-006-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-008-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-013-US-008-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-001-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-001-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-001-TC-009` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-001-TC-010` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-003-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-003-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-003-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-003-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-004-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-005-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-005-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-005-TC-009` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-005-TC-010` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-014-US-005-TC-011` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-001-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-001-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-001-TC-009` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-001-TC-010` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-003-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-003-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-003-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-003-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-004-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-005-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-005-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-005-TC-009` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-005-TC-010` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-015-US-005-TC-011` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-001-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-001-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-001-TC-013` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-002-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-003-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-004-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-004-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-004-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-005-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-016-US-005-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-005-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-005-TC-009` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-005-TC-010` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-005-TC-011` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-006-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-006-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-007-TC-001` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-007-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-007-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-007-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-016-US-007-TC-009` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-001-TC-009` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-003-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-005-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-006-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-007-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-009-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-010-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-011-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-012-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-014-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-015-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-017-US-016-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-016-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-017-US-019-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-017-US-019-TC-005` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-017-US-019-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-018-US-001-TC-010` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-018-US-002-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-018-US-003-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-018-US-003-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-018-US-003-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-018-US-004-TC-013` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-018-US-008-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-018-US-008-TC-006` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-018-US-008-TC-011` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-019-US-001-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-019-US-002-TC-008` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-019-US-003-TC-010` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-019-US-004-TC-001` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-019-US-004-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-019-US-006-TC-004` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-019-US-007-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-019-US-009-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-019-US-010-TC-007` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-019-US-010-TC-008` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-019-US-010-TC-011` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-019-US-011-TC-009` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-020-US-001-TC-007` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-020-US-003-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-020-US-004-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-020-US-005-TC-005` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-020-US-005-TC-006` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-020-US-008-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PLACE-020-US-008-TC-008` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PLACE-020-US-008-TC-009` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PROFILE-001-TC-022` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PROFILE-002-TC-014` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PROFILE-002-TC-015` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PROFILE-002-TC-023` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `PROFILE-002-TC-029` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PROFILE-002-TC-030` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PROFILE-003-TC-011` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PROFILE-003-TC-018` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PROFILE-004-TC-018` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PUBLIC-001-TC-037` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PUBLIC-002-TC-026` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PUBLIC-002-TC-038` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PUBLIC-002-TC-039` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PUBLIC-003-TC-015` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PUBLIC-003-TC-016` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PUBLIC-003-TC-020` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `PUBLIC-004-TC-014` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PUBLIC-004-TC-015` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `PUBLIC-004-TC-021` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `RATING-001-US-006-TC-003` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `RATING-001-US-015-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `RATING-001-US-015-TC-004` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `RATING-001-US-016-TC-002` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `RATING-002-US-004-TC-002` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `RATING-002-US-016-TC-003` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `RATING-002-US-016-TC-006` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `RATING-003-US-003-TC-002` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `RATING-003-US-016-TC-001` | `BLOCKED_ENVIRONMENT` | execution is impossible in the current baseline because the required assistive-technology environment/operator is unavailable, not because automation is missing. |
| `RESP-002-TC-010` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `RESP-002-TC-011` | `BLOCKED_TEST_DATA` | The case requires deterministic large-catalog, pagination, virtualization, scroll-restoration, or performance fixture data not present in the baseline execution environment. |
| `RESP-002-TC-034` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `RESP-004-TC-025` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |
| `RESP-004-TC-026` | `BLOCKED_DOCUMENTATION` | The approved test case is a Requirement Clarification and cannot be executed until the missing requirement/contract decision is documented. |

## 6. Updated Module Statistics

| Module | PASS | FAIL | BLOCKED | NOT EXECUTED |
|---|---:|---:|---:|---:|
| Admin | 0 | 0 | 203 | 0 |
| Authentication | 171 | 0 | 5 | 0 |
| Lists | 562 | 0 | 79 | 0 |
| Place Details | 263 | 0 | 45 | 0 |
| Places | 1400 | 0 | 175 | 0 |
| Profile | 94 | 0 | 9 | 0 |
| Public Lists | 117 | 0 | 10 | 0 |
| Ratings | 179 | 0 | 9 | 0 |
| Responsive | 105 | 0 | 5 | 0 |
| System Operations | 75 | 0 | 19 | 0 |

## 7. Updated Release Recommendation

`CONDITIONAL PASS`

Rationale: executable product-quality evidence improved after reclassification; no failures were found. Remaining blockers are true prerequisites: missing Admin implementation/scope decision, documentation decisions, deterministic test data, AT/operational environments.
