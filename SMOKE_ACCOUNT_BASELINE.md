# Production Smoke Account Baseline

## 1. Purpose

This document records the approved persistent baseline for the dedicated production smoke account.

The baseline exists only to support authenticated production smoke verification for releases. It is not product seed data, not real user data, and not a customer-owned state.

## 2. Why The Baseline Exists

Some release checks require authenticated production state that cannot be verified with a completely empty account.

For example, PR-specific smoke for system-list UI requires the smoke account to have a protected wishlist system list so the list detail page can be opened and verified.

If this baseline is missing, PR-specific smoke may be blocked and the release may remain `NOT RELEASED`.

## 3. Approved Smoke Account Baseline Data

Approved persistent smoke-only data:

- Wishlist/system list ID: `a168599e-19dd-4f2a-9b33-8f84b940aa12`
- System list name: `رغباتي`
- Wishlist place count: `1`
- Smoke-only ratings from previous approved release verification

No passwords, tokens, secret values, or personal credentials are documented here.

## 4. What Must Always Remain

The smoke account should retain:

- The `رغباتي` system list.
- At least one existing place in `رغباتي`.
- The minimum smoke-only ratings needed for authenticated release verification.
- Enough profile/list/rating state to exercise authenticated smoke without creating new production data every release.

## 5. What Can Be Changed During Smoke

Only approved smoke flows may change smoke account data.

Allowed changes must be:

- Limited to the dedicated smoke account.
- Minimal for the verification target.
- Documented in the release report.
- Either restored, or explicitly accepted as persistent smoke-only baseline.

## 6. What Must Not Be Deleted

Do not delete during normal cleanup:

- The `رغباتي` system list.
- The baseline wishlist membership unless a replacement baseline is approved.
- Smoke-only ratings required for release verification.

System lists are protected product data. Removing or resetting this baseline requires explicit release-owner approval and an approved cleanup/reset path.

## 7. Smoke-Only Data Ownership

The baseline belongs only to the dedicated production smoke account.

It must not be treated as:

- Real user data.
- Customer data.
- Product analytics signal.
- Editorial or seed content.
- A baseline for any real account.

Real user data must never be mutated for smoke verification.

## 8. Cleanup Policy

Default cleanup policy:

- Keep the approved baseline in place.
- Do not delete the system wishlist during routine cleanup.
- Do not remove all wishlist items unless a replacement verification path exists.

Temporary smoke changes outside the approved baseline must be cleaned up or documented as approved persistent smoke-only data before a release can be marked `RELEASED`.

If cleanup cannot be completed and persistence was not approved, the release must remain `NOT RELEASED`.

## 9. Release Verification Usage

The baseline may be used to verify:

- Authenticated login.
- `/profile`.
- Wishlist row/link behavior.
- System-list detail page.
- System-list protected action behavior.
- Base UI Menu system-list smoke.
- List, rating, favorites, wishlist, and RTL/mobile release smoke where the data is relevant.

Release reports must document:

- Whether the baseline was used.
- Whether any new smoke-only data was created.
- Whether cleanup is required.
- Whether the final verdict is `RELEASED` or `NOT RELEASED`.

## 10. Security Rules

Never write the following in this file:

- Smoke account password.
- Secret values.
- Access tokens.
- Refresh tokens.
- Personal credentials.
- Private operational notes that identify a real person.

Credentials must be provided through approved environment variables or secret-management paths only.

## 11. Change Control Rules

The baseline must not be expanded without approval.

Any change to the baseline must document:

- The reason for the change.
- The exact smoke-only data changed.
- Whether the change is temporary or persistent.
- Cleanup status.
- Release-owner approval when persistence is required.

If the baseline is missing, stale, or insufficient for a PR-specific smoke requirement, stop and document the blocker instead of mutating production data without approval.
