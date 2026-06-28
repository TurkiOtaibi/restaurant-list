# Authentication QA Defects

Branch: `feature/sprint-1-user-facing-completion`
Tested SHA: `1553d430c4511e21a36a2c97dd5dfc83335d20db`
Revalidation date: 2026-06-28T13:54:51+03:00

## Active Developer-Owned Defects

None.

All 85 previously failed developer-owned Authentication test cases were revalidated as PASS after implementation commit `d0a3d9d7f9d1e019318295da8c4bd37b581af522`.

## Resolved Historical Defects

### AUTH-QA-DEF-001: Auth API error responses violate EDR-001 standardized error envelope

- Status: RESOLVED / REVALIDATED PASS
- Evidence: See `AUTH_REVALIDATION_REPORT.md`.

### AUTH-QA-DEF-002: Successful registration/login navigate to /lists instead of documented /places default

- Status: RESOLVED / REVALIDATED PASS
- Evidence: See `AUTH_REVALIDATION_REPORT.md`.

### AUTH-QA-DEF-003: Safe return-origin preservation is not implemented for guest-denied auth flow

- Status: RESOLVED / REVALIDATED PASS
- Evidence: See `AUTH_REVALIDATION_REPORT.md`.

### AUTH-QA-DEF-004: Logout UI navigates to /login instead of documented root /

- Status: RESOLVED / REVALIDATED PASS
- Evidence: See `AUTH_REVALIDATION_REPORT.md`.

### AUTH-QA-DEF-005: Logout failure path clears local state but does not report unconfirmed server revocation

- Status: RESOLVED / REVALIDATED PASS
- Evidence: See `AUTH_REVALIDATION_REPORT.md`.

### AUTH-QA-DEF-006: Structured auth log evidence required by EDR-004 is not implemented/available

- Status: RESOLVED / REVALIDATED PASS
- Evidence: See `AUTH_REVALIDATION_REPORT.md`.

### AUTH-QA-DEF-008: Focus/visibility stale-session recovery hooks are not implemented

- Status: RESOLVED / REVALIDATED PASS
- Evidence: See `AUTH_REVALIDATION_REPORT.md`.

