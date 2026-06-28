# PLACE-001 Blockers

## BLOCKED_CONFIGURATION - QA

- Count: 20
- Exact reason: Requires deterministic auth/session manipulation harness that was not available in this PLACE-001 cycle.
- Missing prerequisite: Time/session/cookie fixture for expired or unresolved auth states.
- Required action: Provide QA-controlled auth state fixture or storage/cookie injection harness, then re-run.
- Owner: QA

| Test Case ID | Title | Priority |
| --- | --- | --- |
| PLACE-001-US-001-TC-004 | Places list remains available after token refresh | High |
| PLACE-001-US-002-TC-003 | Expired refresh token does not expose catalog | Critical |
| PLACE-001-US-006-TC-003 | UI does not request unbounded full catalog on initial load | High |
| PLACE-001-US-011-TC-001 | 500 error shows concise recovery state | High |
| PLACE-001-US-011-TC-002 | Network failure shows retry | High |
| PLACE-001-US-011-TC-003 | Retry after failure reloads places | High |
| PLACE-001-US-011-TC-004 | Error state does not show stale fake data | High |
| PLACE-001-US-011-TC-005 | Retry action is accessible and touch-safe | High |
| PLACE-001-US-013-TC-001 | Unknown session shows neutral state | Critical |
| PLACE-001-US-013-TC-003 | Cached browser state is not rendered before validation | Critical |
| PLACE-001-US-013-TC-004 | Auth failure clears protected loading path | High |
| PLACE-001-US-018-TC-001 | Existing rows remain after next-page failure | High |
| PLACE-001-US-018-TC-002 | Retry requests same failed page | High |
| PLACE-001-US-018-TC-003 | Incremental network failure is announced | Medium |
| PLACE-001-US-018-TC-004 | Repeated retry failures do not duplicate controls | Medium |
| PLACE-001-US-019-TC-003 | Loading announcement is not repeated excessively | Low |
| PLACE-001-US-020-TC-001 | Back returns to same filter/search context | High |
| PLACE-001-US-020-TC-002 | Back restores opened row visibility | High |
| PLACE-001-US-020-TC-004 | Return after auth expiry does not expose stale rows | High |
| PLACE-001-US-020-TC-005 | Back navigation does not duplicate loaded rows | Medium |

## BLOCKED_TEST_DATA - QA

- Count: 23
- Exact reason: Requires deterministic PLACE-001 catalog fixture volume or page-boundary dataset not available in this focused cycle.
- Missing prerequisite: Seeded empty, large, overlapping, or multi-page Places catalog data with stable IDs/order.
- Required action: Provision deterministic Places fixture data for the requested catalog size/page boundary and re-run.
- Owner: QA

| Test Case ID | Title | Priority |
| --- | --- | --- |
| PLACE-001-US-005-TC-002 | Data is always an array | High |
| PLACE-001-US-007-TC-004 | Pagination combines with auth | High |
| PLACE-001-US-009-TC-001 | Empty catalog shows concise empty state | High |
| PLACE-001-US-009-TC-002 | Empty catalog shows one create-place action | High |
| PLACE-001-US-014-TC-004 | UI does not render private fields even if accidentally present | High |
| PLACE-001-US-015-TC-001 | Next page loads near end | High |
| PLACE-001-US-015-TC-002 | No manual Load More required | Medium |
| PLACE-001-US-015-TC-003 | Loading indicator appears during next-page fetch | Medium |
| PLACE-001-US-015-TC-004 | End-of-results stops further fetches | High |
| PLACE-001-US-015-TC-005 | Rapid scrolling does not create duplicate in-flight requests | High |
| PLACE-001-US-015-TC-006 | Out-of-order page responses do not corrupt list | High |
| PLACE-001-US-016-TC-001 | Large list renders limited DOM rows | High |
| PLACE-001-US-016-TC-002 | Virtualized scroll remains stable | High |
| PLACE-001-US-016-TC-003 | Keyboard navigation works with virtualization | High |
| PLACE-001-US-016-TC-004 | Mobile performance remains within measurable budget | Medium |
| PLACE-001-US-016-TC-005 | Virtualized list keeps list semantics | High |
| PLACE-001-US-017-TC-001 | Overlapping pages de-duplicate by ID | High |
| PLACE-001-US-017-TC-003 | API page IDs are stable and unique within response | High |
| PLACE-001-US-018-TC-005 | Incremental retry preserves filter and search params | High |
| PLACE-001-US-019-TC-001 | Next-page loading uses live region | Medium |
| PLACE-001-US-019-TC-002 | End-of-results is announced without focus theft | Medium |
| PLACE-001-US-019-TC-004 | End-of-results announcement uses Arabic text | Medium |
| PLACE-001-US-020-TC-003 | Virtualized list restores opened row | Medium |
