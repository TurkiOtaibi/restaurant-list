# Production Smoke Preparation Report

## Executive Summary

Authenticated production smoke testing is now prepared but not executed. The setup is intentionally read-only and waits for approved credentials before touching production.

No production users were created. No production data was mutated. No deploy or merge was performed.

## Files Created

- `.env.production-smoke.example`
- `frontend/scripts/production-smoke.mjs`
- `PRODUCTION_SMOKE_RUNBOOK.md`
- `PRODUCTION_SMOKE_PREPARATION_REPORT.md`

## Strategy Source

Source document:

- `PRODUCTION_SMOKE_TEST_STRATEGY.md`

Verified required environment variables:

- `PROD_SMOKE_EMAIL`
- `PROD_SMOKE_PASSWORD`
- `PROD_FRONTEND_URL`
- `PROD_BACKEND_URL`

## Automated Smoke Readiness

Automated smoke is ready to run once approved credentials are provided.

Command:

```powershell
cd frontend
node scripts/production-smoke.mjs
```

Configuration-only validation:

```powershell
cd frontend
node scripts/production-smoke.mjs --check-config
```

The runner:

- Reads only environment variables.
- Fails clearly when credentials or URLs are missing.
- Checks frontend and backend health endpoints.
- Logs in through the production frontend using the approved smoke account.
- Verifies authenticated profile, places, place detail, lists, wishlist, favorites, public lists, and rating route coverage.
- Checks RTL document direction.
- Checks no horizontal overflow at `390x844`.
- Does not create production users.
- Does not create or mutate production data.
- Fails if mutation mode is requested.

## Missing Credentials

Current workspace does not contain approved production smoke credentials.

Required before execution:

- `PROD_SMOKE_EMAIL`
- `PROD_SMOKE_PASSWORD`
- `PROD_FRONTEND_URL`
- `PROD_BACKEND_URL`

## Product Owner Inputs Required

Before release verification can be rerun, provide:

- Approved production smoke account.
- Approved smoke account baseline data expectations.
- Safe secret delivery mechanism.
- Cleanup owner and evidence location.
- Explicit mutation approval scope, if any.

## Cleanup Notes

The current script is read-only, so no cleanup is expected.

Full cleanup is not possible for arbitrary production users, created places, or ratings with the current normal product APIs. Therefore mutation-based production smoke must remain blocked unless a cleanup-capable approved strategy is supplied.

## Remaining Blocker To Mark RELEASED

The remaining blocker is approved credentials and baseline smoke account data.

No authenticated production release can be marked `RELEASED` until authenticated smoke passes using approved credentials and any approved data mutation is cleaned up or explicitly approved to remain.
