# Production Smoke Runbook

## Purpose

This runbook explains how to run authenticated production smoke tests safely after a release candidate has passed local gates, CI, and public endpoint verification.

It follows `PRODUCTION_SMOKE_TEST_STRATEGY.md`.

## Required Inputs

Provide these values as environment variables:

- `PROD_SMOKE_EMAIL`
- `PROD_SMOKE_PASSWORD`
- `PROD_FRONTEND_URL`
- `PROD_BACKEND_URL`

Example URL values:

- `PROD_FRONTEND_URL=https://restaurant-list-web.onrender.com`
- `PROD_BACKEND_URL=https://restaurant-list-api.onrender.com`

Do not commit real values.

## Providing Credentials Safely

Use shell environment variables, a secrets manager, or the CI/CD secret store.

Do not:

- Commit secrets.
- Paste secrets into release reports.
- Print secrets in logs.
- Store secrets in screenshots.
- Send secrets in PR comments.

For local execution, copy `.env.production-smoke.example` outside source control or export the variables directly in the shell.

## Smoke Account Rules

The smoke account must:

- Be pre-approved for production release verification.
- Not belong to a real customer.
- Contain no sensitive personal data.
- Have stable baseline data for profile, lists, wishlist, favorites, places, and ratings where possible.
- Have a documented owner and rotation policy outside source control.
- Have a documented cleanup policy for any allowed mutations.

## Allowed Flows

Read-only authenticated smoke may verify:

- Login.
- Profile loads.
- Favorites section loads.
- Wishlist row/state loads.
- Places list loads.
- Place detail loads.
- Rating route/dialog loads without saving.
- Lists page loads.
- Public lists page loads.
- Bottom navigation remains usable.
- No obvious Tailwind Preflight visual regression.
- No obvious mobile RTL regression.
- No horizontal overflow at `390x844`.

## Forbidden Data Creation

Do not create:

- Production users.
- Shared catalog places.
- Ratings.
- Lists.
- Wishlist entries.
- Favorites.
- Public lists.
- Any record that cannot be cleaned up safely.

Do not mutate production data unless the release owner explicitly approves the mutation scope and cleanup evidence requirement.

## Automated Smoke Command

The non-mutating smoke runner is:

```powershell
cd frontend
$env:PROD_SMOKE_EMAIL = "<approved smoke email>"
$env:PROD_SMOKE_PASSWORD = "<approved smoke password>"
$env:PROD_FRONTEND_URL = "https://restaurant-list-web.onrender.com"
$env:PROD_BACKEND_URL = "https://restaurant-list-api.onrender.com"
node scripts/production-smoke.mjs
```

Configuration-only local validation:

```powershell
cd frontend
node scripts/production-smoke.mjs --check-config
```

The script:

- Reads only environment variables.
- Fails clearly when required env vars are missing.
- Logs in using the approved smoke account.
- Verifies protected profile, places, place detail, lists, wishlist, favorites, and rating route coverage.
- Checks RTL direction and horizontal overflow at `390x844`.
- Does not create or mutate production data.

Mutation mode is intentionally not implemented. If `PROD_SMOKE_ALLOW_MUTATION=1` is set, the script fails.

## Cleanup Steps

For the current read-only script, no cleanup is expected.

If a future approved mutation smoke is added, cleanup must:

- Record created or changed object identifiers.
- Restore profile favorites to the approved baseline.
- Restore wishlist membership to the approved baseline.
- Delete smoke-created lists and list memberships when safe.
- Restore changed ratings or document why they remain.
- Avoid deleting shared catalog places unless an approved admin cleanup path exists.
- Retain cleanup evidence outside source control.

If cleanup is incomplete, the release verdict must remain `NOT RELEASED` unless the release owner explicitly approves the remaining data.

## Release Decision Rules

Mark `RELEASED` only when:

- Local gates passed.
- CI passed on `main`.
- Deployment verification passed.
- Public endpoints passed.
- Authenticated production smoke passed using approved credentials.
- Any approved mutation was cleaned up or approved to remain.

Mark `NOT RELEASED` when:

- Credentials are missing.
- Login fails.
- The smoke account lacks required baseline data.
- The smoke test would require unapproved production mutation.
- Cleanup cannot be completed.
- Any blocking production regression is found.

## Required Before Rerun

Before rerunning release verification, the product/release owner must provide:

- Approved `PROD_SMOKE_EMAIL`.
- Approved `PROD_SMOKE_PASSWORD`.
- Production frontend URL.
- Production backend URL.
- Smoke account baseline expectations.
- Mutation approval scope, if any.
- Cleanup owner and evidence location.

Without these inputs, authenticated production smoke remains blocked.
