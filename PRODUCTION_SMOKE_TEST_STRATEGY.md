# Production Smoke Test Strategy

## Purpose

This document defines the minimum approved strategy required to run authenticated production smoke tests safely.

The current release cannot be marked `RELEASED` because authenticated production smoke cannot run without approved credentials and a cleanup strategy.

No authenticated production release may be marked `RELEASED` until approved smoke credentials and a cleanup strategy exist.

## Required Environment Variables

The release runner must provide these environment variables before rerunning authenticated production verification:

- `PROD_SMOKE_EMAIL`
- `PROD_SMOKE_PASSWORD`
- `PROD_FRONTEND_URL`
- `PROD_BACKEND_URL`

The values must not be committed, logged, printed, or stored in reports.

## Approved Smoke Account Policy

The smoke account must be a pre-approved production account dedicated to release verification.

Requirements:

- The account must not belong to a real customer.
- The account must not contain private or sensitive personal data.
- The account must be safe to use repeatedly across releases.
- The account must have enough existing data to verify authenticated flows without creating permanent records.
- The account owner and cleanup responsibility must be documented outside source control.
- Password rotation and access ownership must follow the project's production secret handling process.

## Allowed Production Smoke Flows

Authenticated smoke may verify:

- Login.
- Places list loads.
- Place detail loads.
- Profile loads.
- Favorites section loads.
- Wishlist row/toggle state loads.
- Lists page loads.
- Public lists page loads.
- Rating UI opens and existing state renders.
- Bottom navigation works.
- No obvious Tailwind Preflight visual regression.
- No obvious mobile RTL regression.
- No horizontal overflow at the approved mobile viewport, especially `390x844`.

Read-only verification is preferred.

## Allowed Test Data

Allowed production smoke data:

- Existing approved smoke account data.
- Existing approved smoke lists.
- Existing approved smoke wishlist membership.
- Existing approved smoke favorites.
- Existing approved smoke ratings.
- Existing approved smoke public/private lists.
- Records explicitly tagged or named for release verification, if the cleanup process is documented and approved.

Any mutation must use only approved smoke-owned records.

## Forbidden Test Data

The release runner must not create or mutate:

- Real customer/user data.
- Unapproved production users.
- Unapproved places in the shared catalog.
- Unapproved ratings.
- Unapproved lists.
- Unapproved public lists.
- Unapproved wishlist entries.
- Unapproved favorites.
- Any data that cannot be cleaned up safely.

Do not create a new production test user during release verification unless explicit approval and cleanup evidence requirements are provided.

## Cleanup Requirements

If production smoke mutates data, cleanup is mandatory unless the mutation is explicitly approved as stable smoke fixture state.

Cleanup requirements:

- Record every created or changed object type and identifier.
- Clean up smoke-created lists and list memberships when safe.
- Restore favorites and wishlist state to the approved baseline.
- Restore changed ratings to the approved baseline or document why they remain.
- Do not delete or alter shared catalog places unless an approved admin cleanup path exists.
- Retain cleanup evidence outside source control.

If cleanup cannot be completed, the release must not be marked `RELEASED` without explicit release-owner approval.

## Release Decision Rules

Mark `RELEASED` only when all are true:

- Local release gates passed.
- GitHub Actions passed on `main`.
- Deployment verification passed.
- Public endpoints passed.
- Authenticated production smoke passed using approved credentials.
- Any smoke-created data was cleaned up or explicitly approved to remain.
- No blocking production regression was found.

Mark `NOT RELEASED` if any are true:

- Required smoke credentials are unavailable.
- Authenticated smoke cannot log in.
- Authenticated smoke requires unapproved production data creation.
- Cleanup cannot be completed.
- CI fails.
- Deployment verification fails.
- Production smoke finds a blocking regression.

## Required Before Rerunning Release Verification

Before rerunning authenticated production release verification, provide:

- `PROD_SMOKE_EMAIL`
- `PROD_SMOKE_PASSWORD`
- `PROD_FRONTEND_URL`
- `PROD_BACKEND_URL`
- Confirmation that the smoke account is approved for production verification.
- The approved baseline data expected on the smoke account.
- The allowed mutation scope, if any.
- The cleanup procedure and owner.
- The release-owner approval for any persistent smoke data.

Without these inputs, authenticated production smoke is blocked and the final release verdict must remain `NOT RELEASED`.
