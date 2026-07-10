# 38 — CI/CD and Deployment Contract

This note reconciles the deployment configuration with how delivery actually works,
and records the invariants that must hold for auto-deploy to be safe.

## Pipeline shape (`.github/workflows/ci.yml`)

Three jobs run on every pull request and on pushes to `main`:

1. **backend** — provisions `postgres:16`, then runs `ruff`, `ruff format --check`,
   `mypy --strict`, `alembic upgrade head`, `pytest`, and `pip-audit`. The test
   suite now runs against **PostgreSQL** (via `POSTGRES_TEST_DATABASE_URL`), not
   SQLite, so foreign keys, cascades, and CHECK constraints are exercised on the
   production engine.
2. **frontend** — `npm ci`, `eslint`, `tsc --noEmit`, `next build`, `npm audit`.
3. **e2e** — provisions `postgres:16`, installs **both** the Python backend and the
   Node frontend, installs Chromium, and runs Playwright. The real end-to-end spec
   boots the FastAPI app (`backend/scripts/start_e2e_api.py`) against PostgreSQL and
   drives the actual UI. (Previously the Playwright step lived in the frontend job,
   which never installed the backend, so the real integration test could never start
   — it failed with `ModuleNotFoundError: No module named 'uvicorn'`.)

> CI only triggers on `pull_request` and `push: branches: [main]`. Work branches do
> not run CI until a pull request is opened. To verify green CI for a branch, open a
> PR.

## Render auto-deploy contract (`render.yaml`)

Both services set `autoDeployTrigger: checksPass`. This means Render auto-deploys a
new commit **only after the GitHub checks for that commit pass**.

Invariant: **`main` must be green for auto-deploy to function.** Historically every
CI run on `main` failed, so `checksPass` would have blocked all auto-deploys — any
live environment was therefore produced by a manual deploy that bypassed the gate.
After this remediation, keep `main` green; do not merge red. If a deploy is ever
required while `main` is red, it must be an explicit, logged manual action, not the
default path.

## Rate limiting

Authentication endpoints are rate limited (default 10 requests / 60s per client +
path). Anonymous discovery reads are also rate limited (default 60 requests /
60s per client and stable endpoint scope). When `REDIS_URL` is set the counter is
backed by Redis so it is shared across instances; otherwise an in-process
fallback is used (local dev and tests).
`render.yaml` provisions a Redis service and wires `REDIS_URL`.

> The free Redis plan is shared across instances but does not guarantee
> persistence across restarts/deployments. Upgrade to a persistent (paid) plan
> before public beta to fully satisfy the "persist across restarts" requirement.

## Controlled-beta scope and pre-public-beta requirements

Intentional constraints during the current controlled beta:

- **Public discovery is anonymous and read-only.** Guests may browse the place
  catalog and public-list collection/detail routes. The approved EDR-014 policy
  applies explicit per-client limits, stable endpoint scopes, neutral guest
  context, and public-safe fields only.
- Personal context, private lists, profiles, ratings, notes, and all mutations
  remain login-only.

## Secrets

`DATABASE_URL`, `CORS_ORIGINS`, and `NEXT_PUBLIC_API_BASE_URL` are `sync: false`
(set in the Render dashboard). `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` use
`generateValue: true`. Production startup rejects default/duplicate secrets
(`app/core/config.py`).
