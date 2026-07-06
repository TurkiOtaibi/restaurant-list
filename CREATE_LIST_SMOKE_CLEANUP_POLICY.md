# Create-List Production Smoke Cleanup Policy

## 1. Purpose

This policy defines the only approved cleanup model for future production smoke tests that must exercise the create-list flow.

It exists to unblock future Base UI Dialog / Drawer evaluation for the route-mounted create-list dialog without permitting broad or uncontrolled production mutation.

## 2. Scope

This policy applies only to:

- the dedicated approved production smoke account.
- future release verification for a scoped create-list UI change.
- temporary list creation required to verify the changed create-list surface.

This policy does not approve:

- creating production users.
- mutating real user data.
- creating shared catalog places.
- changing ratings.
- changing favorites.
- changing wishlist baseline data.
- creating public lists.
- destructive testing against real user content.

## 3. Relationship To Existing Smoke Documents

This policy extends:

- `PRODUCTION_SMOKE_TEST_STRATEGY.md`
- `PRODUCTION_SMOKE_RUNBOOK.md`
- `SMOKE_ACCOUNT_BASELINE.md`
- `BASE_UI_DIALOG_DRAWER_STRATEGY_DECISION.md`

If this policy conflicts with a stricter rule in those documents, the stricter rule wins.

## 4. Approved Mutation

For a future create-list release smoke, the approved mutation is:

- create exactly one temporary private list using the approved smoke account.
- verify the target create-list UI behavior.
- delete that temporary list before final release verdict.

No other production mutation is approved by this policy.

## 5. Temporary List Naming Convention

Temporary smoke-created lists must use this Arabic/English prefix:

`Smoke UI - قائمة مؤقتة - <release-or-pr-id> - <timestamp>`

Requirements:

- Include the PR number or release identifier when available.
- Include a timestamp precise enough to identify the run.
- Keep the list private.
- Do not use real customer names, personal names, or real venue names.
- Do not reuse the protected system wishlist name `رغباتي`.

## 6. Data To Record During Smoke

The release report must record:

- temporary list name.
- temporary list ID.
- creation timestamp.
- deletion timestamp.
- cleanup result.
- whether any cleanup failure remains.

Do not record smoke credentials, passwords, tokens, cookies, or screenshots containing secrets.

## 7. Required Smoke Flow

Allowed create-list smoke flow:

1. Login using the approved smoke account.
2. Open the target create-list route or dialog.
3. Verify the changed UI behavior.
4. Create one private temporary list with the approved naming convention.
5. Verify the creation result only as needed for the release.
6. Delete the temporary list using the normal product UI or API.
7. Re-open lists/profile state if needed to confirm the temporary list is gone.
8. Document cleanup in `RELEASE_REPORT.md`.

Do not add places to the temporary list unless the reviewed PR explicitly changes list-item behavior and that extra mutation is separately approved.

## 8. Cleanup Requirements

Cleanup is mandatory.

The temporary list must be deleted before final verdict unless a release owner explicitly approves persistence in writing.

Cleanup must verify:

- the temporary list no longer appears in `/lists`.
- the temporary list detail URL no longer opens as an owned list.
- the smoke account's protected wishlist baseline still exists.
- the smoke account's existing baseline ratings and wishlist data remain intact.

If cleanup cannot be completed, final release verdict must be `NOT RELEASED`.

## 9. System Wishlist Baseline Protection

The approved smoke account baseline must remain intact:

- Do not delete the `رغباتي` system list.
- Do not rename the `رغباتي` system list.
- Do not clear its baseline membership.
- Do not treat the system wishlist as temporary cleanup data.

The system wishlist baseline is documented in `SMOKE_ACCOUNT_BASELINE.md`.

## 10. Release Decision Rules

Mark `RELEASED` only if:

- CI passed.
- public endpoints passed.
- authenticated production smoke passed.
- the create-list-specific smoke passed.
- the temporary list was deleted.
- cleanup evidence is recorded locally in `RELEASE_REPORT.md`.
- no real user data was mutated.

Mark `NOT RELEASED` if:

- the temporary list cannot be deleted.
- the smoke account baseline is damaged.
- a real user account or real user data is touched.
- an unexpected production mutation occurs.
- the create-list behavior fails.
- cleanup evidence is missing.

## 11. Security Rules

Never commit or document:

- smoke account password.
- refresh tokens.
- access tokens.
- session cookies.
- personal credentials.
- private operational secrets.

Use environment variables or the approved secret-management path for credentials.

## 12. Change Control

This policy may be used only for release verification after it is merged to `main`.

Any expansion requires a new reviewed documentation change, including:

- adding list items.
- making the temporary list public.
- persisting the temporary list.
- changing smoke account baseline data.
- testing delete failure paths in production.
- using any account other than the approved smoke account.

## 13. Future Base UI Dialog Pilot Impact

This policy does not approve Base UI Dialog, Drawer, or Alert Dialog implementation.

It only removes one release-verification blocker for a future create-list dialog pilot: cleanup policy for the required temporary production list.

Future implementation still requires:

- explicit Dialog / Drawer strategy approval.
- one exact target surface.
- full local gates.
- screenshots.
- accessibility review.
- RTL/mobile verification.
- no Radix dependency.

## 14. Final Policy

Future create-list production smoke may create exactly one temporary private list using the approved smoke account and must delete it before final release verdict.

If cleanup is incomplete, the release remains `NOT RELEASED`.
