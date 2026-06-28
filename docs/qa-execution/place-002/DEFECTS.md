# PLACE-002 Defects

## Open Defects

No open PLACE-002 developer-owned defects remain after revalidation.

## Resolved Defects

| Test Case ID | Previous Result | Current Result | Evidence |
| --- | --- | --- | --- |
| PLACE-002-US-001-TC-006 | FAIL | PASS | Revalidation PASS: filtered restaurant collection response recursively scanned; `createdByUserId` and other prohibited private fields are absent. |
| PLACE-002-US-001-TC-010 | FAIL | PASS | Revalidation PASS: filtered restaurant row schema includes documented public fields and excludes `createdByUserId`. |
| PLACE-002-US-002-TC-007 | FAIL | PASS | Revalidation PASS: filtered cafe collection response recursively scanned; creator identity/private fields are absent. |
| PLACE-002-US-003-TC-007 | FAIL | PASS | Revalidation PASS: filtered ice cream collection response recursively scanned; creator identity/private fields are absent. |
| PLACE-002-US-007-TC-009 | FAIL | PASS | Revalidation PASS: repeated `type` query parameters return HTTP 422 with `VALIDATION_ERROR` and no `data` payload. |

## Developer-Owned Defect Count

- Open: 0
- Resolved in commit `4d781bed9492a635cf20e13307a777d9717f0983`: 5
