# Test Place Cleanup Maintenance Command Report

## Summary

Implemented a backend-only internal maintenance command for safe smoke/test/Codex place cleanup.

Command path:

- `backend/app/maintenance/cleanup_test_places.py`

The command was created because the production cleanup dry run found smoke/test/Codex places, but cleanup stopped correctly: the app had no supported place-delete path and direct database cleanup was prohibited.

This PR does not run production deletion and does not mutate production data.

## Files Changed

- `backend/app/maintenance/__init__.py`
- `backend/app/maintenance/cleanup_test_places.py`
- `backend/tests/unit/test_cleanup_test_places.py`
- `TEST_PLACE_CLEANUP_MAINTENANCE_COMMAND_REPORT.md`

## Command Usage

Run commands from the `backend` directory so the `app` package is importable.

Dry-run from the existing Markdown inventory:

```bash
python -m app.maintenance.cleanup_test_places \
  --dry-run \
  --candidate-file ../PRODUCTION_TEST_PLACE_CLEANUP_DRY_RUN.md
```

Execute from an approved JSON allowlist:

```bash
python -m app.maintenance.cleanup_test_places \
  --execute \
  --candidate-file approved_test_place_candidates.json \
  --confirm "DELETE_TEST_PLACES_ONLY"
```

Execute against production requires one additional explicit flag:

```bash
python -m app.maintenance.cleanup_test_places \
  --execute \
  --candidate-file approved_test_place_candidates.json \
  --confirm "DELETE_TEST_PLACES_ONLY" \
  --confirm-production
```

## Candidate Allowlist Design

Execute mode deletes only explicit place IDs from a JSON allowlist. It does not delete by name pattern alone.

Supported execute allowlist shapes:

```json
{
  "approvedPlaceIds": [
    "00000000-0000-0000-0000-000000000000"
  ],
  "ambiguousPlaceIds": [],
  "protectedPlaceIds": []
}
```

or:

```json
[
  "00000000-0000-0000-0000-000000000000"
]
```

Markdown candidate files are supported only for dry-run inventory review. Execute mode rejects Markdown files.

## Dry-Run Behavior

Dry-run mode:

- is the default behavior
- may use name/description patterns for discovery
- can parse the existing Markdown dry-run report
- reports linked references
- reports deletion plan
- reports skipped ambiguous candidates
- does not mutate data

Patterns are used only for dry-run discovery and safety classification.

## Execute Behavior

Execute mode requires:

- `--execute`
- a JSON candidate allowlist
- `--confirm "DELETE_TEST_PLACES_ONLY"`
- `--confirm-production` when `APP_ENV=production`

Before deleting each place, the command verifies:

- the ID is in the approved allowlist
- the place has explicit smoke/test/Codex evidence
- the place is not ambiguous
- the place is not explicitly protected
- the place is not referenced from a system list, including the smoke baseline wishlist pattern

Unsafe candidates are skipped rather than deleted.

## Relationship Cleanup Strategy

The command uses the repository SQLAlchemy app models and a transaction.

For each approved safe place, DB references are removed in this order:

1. `user_favorite_places`
2. `ratings`
3. `list_items`
4. `places`

This order is intentional:

- `user_favorite_places.place_id` uses `RESTRICT`
- `ratings.place_id` and `list_items.place_id` use cascade-capable FKs, but explicit cleanup makes behavior deterministic across SQLite/Postgres test runs
- deleting the place does not delete the creator user

The command reports whether `image_url` exists. The place row deletion removes the image URL from the app-visible catalog data. Physical object-store deletion is not attempted inside the DB transaction because the app does not have an atomic DB/object-store cleanup transaction. If image object cleanup becomes required, it should be added as a separate best-effort post-commit phase with explicit logging.

## Protected Baseline Handling

The command preserves:

- explicitly protected place IDs from `protectedPlaceIds`
- any place referenced by a system list
- the smoke baseline wishlist/system list itself

This prevents accidental deletion of the approved persistent smoke-only baseline.

## Tests Added

Added `backend/tests/unit/test_cleanup_test_places.py`.

Coverage:

- dry-run does not mutate data
- execute requires explicit confirmation
- production execute requires `--confirm-production`
- execute deletes only allowlisted test places
- related records are removed safely
- ambiguous candidates are skipped
- non-test real places are not deleted
- protected system wishlist places are preserved
- Arabic smoke/test markers are recognized
- invalid candidate files fail safely

## Quality Gate Results

Backend gates run:

- `python -m ruff check backend/app/maintenance/cleanup_test_places.py backend/tests/unit/test_cleanup_test_places.py`: PASS
- `python -m pytest backend/tests/unit/test_cleanup_test_places.py -q`: PASS, 9 passed
- `python -m mypy app tests`: PASS

Full backend gates:

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 87 passed, 1 skipped

## Production Execution Instructions

Production deletion must be a separate explicit operation after PR review/merge/deploy.

Before production execution:

1. Prepare an approved JSON allowlist from `PRODUCTION_TEST_PLACE_CLEANUP_DRY_RUN.md`.
2. Exclude the ambiguous/manual-review candidate.
3. Exclude protected smoke baseline data.
4. Run dry-run against production first.
5. Review the JSON output.
6. Only then run execute mode with both confirmation gates.

Do not run production deletion from this implementation PR.

## Risks

- Physical image objects may remain if a deleted place had an external `image_url`.
- The command intentionally skips system-list references, so any test place inside the approved smoke baseline will remain.
- Bad allowlist files are rejected or skipped, but production operators must still review candidate IDs carefully.
- Rollback after execute requires database backup/restore; place recreation would not preserve original IDs or linked metadata.

## Rollback Limitations

The maintenance command itself can be reverted like normal code.

Data deletion is not easily reversible. Production execution must happen only after:

- PR review
- CI
- deployment
- dry-run output review
- explicit product/ops approval for the exact candidate allowlist
