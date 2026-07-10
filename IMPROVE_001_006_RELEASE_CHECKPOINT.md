# Improve 001-006 Release Checkpoint

Date: 2026-07-10

Status: RELEASED

## Release

- Integration PR: https://github.com/TurkiOtaibi/restaurant-list/pull/65
- Integration head: `ed32fe74049ae03ca74fc37dbbdcca45bfcb9bd4`
- Released main SHA: `ddca052ffc182919bb690809807dc12ec1a008cc`
- CI run: https://github.com/TurkiOtaibi/restaurant-list/actions/runs/29110950065

The release contains the approved Improve security foundation Plans 001-006.
The PR was reviewed against the approved linear stack, contained only the 42
expected files, had no unresolved review threads, and was mergeable at the
expected head SHA.

## Verification

- GitHub Actions backend, frontend, four Playwright shards, and aggregate E2E
  jobs completed successfully.
- Backend production liveness and database readiness returned HTTP 200.
- Frontend production health and homepage returned HTTP 200.
- Anonymous place and public-list collection/detail reads returned HTTP 200.
- Anonymous place detail omitted creator identity and returned neutral personal
  context.
- Public-list detail omitted owner user ID and email.
- Protected profile and owned-list reads returned canonical HTTP 401 responses
  without the retired legacy error envelope.
- Verification used read-only requests and did not mutate production data.

## Product Boundary

EDR-014 remains RATIFIED. Public place and public-list discovery stays
anonymous and read-only. Private lists, profiles, ratings, notes, personal
context, and all mutations remain authenticated.

## Next Base

Future UI/UX work must start from the latest `origin/main` containing
`ddca052ffc182919bb690809807dc12ec1a008cc` or a later main commit. No new
Improve plan or UI/UX program was started as part of this release.
