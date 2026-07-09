# Test Place Cleanup Maintenance Command PR Review

## Scope Reviewed

Review scope:

- internal backend maintenance cleanup command only
- dry-run support
- explicit execute gates
- candidate allowlist behavior
- relationship cleanup behavior
- backend tests
- documentation/report

Out of scope and verified absent:

- no public `DELETE /places/{place_id}` endpoint
- no frontend UI changes
- no production deletion run
- no direct production database mutation
- no behavior change to normal application routes

## Files Reviewed

- `backend/app/maintenance/__init__.py`
- `backend/app/maintenance/cleanup_test_places.py`
- `backend/tests/unit/test_cleanup_test_places.py`
- `TEST_PLACE_CLEANUP_MAINTENANCE_COMMAND_REPORT.md`

## Findings

No blocking or non-blocking findings.

## Verification

Safety checks verified:

- dry-run is the default mode
- execute mode requires a JSON candidate allowlist
- execute mode rejects Markdown dry-run reports
- execute mode requires `DELETE_TEST_PLACES_ONLY`
- production execute mode also requires `--confirm-production`
- execute mode deletes only explicit allowlisted place IDs
- name patterns are used for discovery/classification only
- ambiguous generated-suffix candidates are skipped
- real non-test catalog places are skipped even if allowlisted
- system-list referenced places are protected
- the approved smoke baseline pattern is protected through system-list preservation
- related DB rows are explicitly cleaned before place deletion
- production deletion was not run

Backend gates reported:

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 87 passed, 1 skipped

Targeted tests:

- `python -m pytest backend/tests/unit/test_cleanup_test_places.py -q`: PASS, 9 passed

## Final Recommendation

APPROVE
