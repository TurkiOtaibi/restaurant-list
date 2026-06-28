# Developer Implementation Backlog - Full-System QA Baseline

## Executive Summary

- Developer-owned blocked test cases: `203`
- Remaining developer-owned blocker category: `BLOCKED_MISSING_IMPLEMENTATION` only.
- Affected module: `Admin` only.
- Root cause: the current system has no Admin UI/API surface (`frontend/app/admin` absent and `backend/app/api/admin.py` absent in the baseline evidence).
- Scope note: this backlog is actionable if Admin is moved into implementation scope. If Admin remains deferred, these items should remain out of the current release backlog.

## Developer-Owned Blocked Test Cases

| Module | Blocked Test Count | Affected Features | Affected User Stories | Priority | Estimated Effort | Dependencies | Risk | Recommended Sprint |
|---|---:|---|---|---|---|---|---|---|
| Admin | 203 | `ADMIN-001`, `ADMIN-002`, `ADMIN-004`, `ADMIN-005`, `ADMIN-003`, `ADMIN-006`, `ADMIN-007` | 105 Admin user stories across `ADMIN-001` through `ADMIN-007` | P0 overall | XL | Product decision to include Admin in release; ADMIN-001 must land first | High security, privacy, moderation, and operational risk if Admin is required but absent | Admin implementation program |

## Modules Ordered By Priority

| Rank | Module | Blocked Test Count | Affected Features | Priority | Estimated Effort | Dependencies | Risk | Recommended Sprint |
|---:|---|---:|---|---|---|---|---|---|
| 1 | Admin | 203 | `ADMIN-001`, `ADMIN-002`, `ADMIN-004`, `ADMIN-005`, `ADMIN-003`, `ADMIN-006`, `ADMIN-007` | P0 | XL | Product scope approval; Admin foundation first | Only developer-owned blocker module; no Admin surface exists | Admin implementation program |

## Features Ordered By Priority

| Rank | Feature ID | Feature Name | Blocked Test Cases | Affected User Stories | Missing Implementation Summary | Affected Components | Backend | Frontend | Database | API | Estimated Effort | Recommended Sprint |
|---:|---|---|---:|---|---|---|---|---|---|---|---|---|
| 1 | `ADMIN-001` | Admin access control and audit foundation | 34 | 18 stories: `ADMIN-001-US-001`, `ADMIN-001-US-002`, `ADMIN-001-US-003`, `ADMIN-001-US-004`, `ADMIN-001-US-005`, `ADMIN-001-US-006`, `ADMIN-001-US-007`, `ADMIN-001-US-008`, `ADMIN-001-US-009`, `ADMIN-001-US-010`, `ADMIN-001-US-011`, `ADMIN-001-US-012`, `ADMIN-001-US-013`, `ADMIN-001-US-014`, `ADMIN-001-US-015`, `ADMIN-001-US-016`, `ADMIN-001-US-017`, `ADMIN-001-US-018` | Missing complete Admin implementation for admin access control and audit foundation. | Backend, frontend, database, API, audit/security/accessibility surfaces | Admin auth/authorization services, MFA/step-up enforcement, permission middleware, audit service, safe error handling. | Admin shell, protected admin route guard, MFA/step-up screens, audit-safe error states, accessibility baseline. | Admin roles/permissions, audit records, MFA/step-up state, retention metadata as documented. | Admin access/check endpoints only where documented; exact Admin API routes must be implemented from approved requirements/EDRs. | L | Sprint Admin-1 |
| 2 | `ADMIN-002` | User lookup and account status review | 28 | 15 stories: `ADMIN-002-US-001`, `ADMIN-002-US-002`, `ADMIN-002-US-003`, `ADMIN-002-US-004`, `ADMIN-002-US-005`, `ADMIN-002-US-006`, `ADMIN-002-US-007`, `ADMIN-002-US-008`, `ADMIN-002-US-009`, `ADMIN-002-US-010`, `ADMIN-002-US-011`, `ADMIN-002-US-012`, `ADMIN-002-US-013`, `ADMIN-002-US-014`, `ADMIN-002-US-015` | Missing complete Admin implementation for user lookup and account status review. | Backend, frontend, database, API, audit/security/accessibility surfaces | User search, user detail minimization, account status transitions, session/token revocation, audit events. | User search/review UI, status review/detail screens, disable/re-enable dialogs, safe error states. | User status fields, audit records, session/token invalidation support if not already sufficient. | Admin user search/detail/status APIs with permission enforcement and error contract. | L | Sprint Admin-2 |
| 3 | `ADMIN-004` | Place moderation and correction | 26 | 13 stories: `ADMIN-004-US-001`, `ADMIN-004-US-002`, `ADMIN-004-US-003`, `ADMIN-004-US-004`, `ADMIN-004-US-005`, `ADMIN-004-US-006`, `ADMIN-004-US-007`, `ADMIN-004-US-008`, `ADMIN-004-US-009`, `ADMIN-004-US-010`, `ADMIN-004-US-011`, `ADMIN-004-US-012`, `ADMIN-004-US-013` | Missing complete Admin implementation for place moderation and correction. | Backend, frontend, database, API, audit/security/accessibility surfaces | Place moderation search/detail, correction validation, uniqueness/conflict handling, aggregate refresh, audit blocking. | Place correction search/detail UI, edit forms, conflict/error handling. | Place correction metadata/audit; may require version/concurrency marker. | Admin place search/detail/correction APIs. | M | Sprint Admin-3 |
| 4 | `ADMIN-005` | Duplicate place resolution | 36 | 20 stories: `ADMIN-005-US-001`, `ADMIN-005-US-002`, `ADMIN-005-US-003`, `ADMIN-005-US-004`, `ADMIN-005-US-005`, `ADMIN-005-US-006`, `ADMIN-005-US-007`, `ADMIN-005-US-008`, `ADMIN-005-US-009`, `ADMIN-005-US-010`, `ADMIN-005-US-011`, `ADMIN-005-US-012`, `ADMIN-005-US-013`, `ADMIN-005-US-014`, `ADMIN-005-US-015`, `ADMIN-005-US-016`, `ADMIN-005-US-017`, `ADMIN-005-US-018`, `ADMIN-005-US-019`, `ADMIN-005-US-020` | Missing complete Admin implementation for duplicate place resolution. | Backend, frontend, database, API, audit/security/accessibility surfaces | Duplicate candidate detection, pre-merge validation, transactional merge, rollback, aggregate recalculation, audit blocking. | Duplicate review, canonical/source selection, merge preview, confirmation, result summary, error handling. | Merge transaction across places, ratings, list items, aggregates, retired source state, audit/backup references. | Admin duplicate candidate, preview, validate, and merge APIs. | L | Sprint Admin-3 or Admin-4 |
| 5 | `ADMIN-003` | Public list moderation | 25 | 13 stories: `ADMIN-003-US-001`, `ADMIN-003-US-002`, `ADMIN-003-US-003`, `ADMIN-003-US-004`, `ADMIN-003-US-005`, `ADMIN-003-US-006`, `ADMIN-003-US-007`, `ADMIN-003-US-008`, `ADMIN-003-US-009`, `ADMIN-003-US-010`, `ADMIN-003-US-011`, `ADMIN-003-US-012`, `ADMIN-003-US-013` | Missing complete Admin implementation for public list moderation. | Backend, frontend, database, API, audit/security/accessibility surfaces | Public-list moderation queue, hide/restore transitions, audit blocking, public visibility enforcement. | Moderation queue, filters, public-list detail moderation actions, hide/restore dialogs. | Moderation state on public lists, moderation audit records. | Admin public-list moderation query/action APIs. | M | Sprint Admin-4 |
| 6 | `ADMIN-006` | Abuse and content review queue | 29 | 14 stories: `ADMIN-006-US-001`, `ADMIN-006-US-002`, `ADMIN-006-US-003`, `ADMIN-006-US-004`, `ADMIN-006-US-005`, `ADMIN-006-US-006`, `ADMIN-006-US-007`, `ADMIN-006-US-008`, `ADMIN-006-US-009`, `ADMIN-006-US-010`, `ADMIN-006-US-011`, `ADMIN-006-US-012`, `ADMIN-006-US-013`, `ADMIN-006-US-014` | Missing complete Admin implementation for abuse and content review queue. | Backend, frontend, database, API, audit/security/accessibility surfaces | Abuse queue, report state transitions, linked action permission checks, audit blocking, privacy-safe summaries. | Abuse queue, filters, report detail, state/reason dialogs, linked action UI. | Abuse report records, state history, audit records. | Admin abuse queue/filter/state/action APIs. | M | Sprint Admin-4 |
| 7 | `ADMIN-007` | Beta operational dashboard | 25 | 12 stories: `ADMIN-007-US-001`, `ADMIN-007-US-002`, `ADMIN-007-US-003`, `ADMIN-007-US-004`, `ADMIN-007-US-005`, `ADMIN-007-US-006`, `ADMIN-007-US-007`, `ADMIN-007-US-008`, `ADMIN-007-US-009`, `ADMIN-007-US-010`, `ADMIN-007-US-011`, `ADMIN-007-US-012` | Missing complete Admin implementation for beta operational dashboard. | Backend, frontend, database, API, audit/security/accessibility surfaces | Dashboard aggregate providers, freshness metadata, permission-gated drill-downs, dashboard audit events. | Dashboard cards, drill-down links, responsive layout, safe empty/error states. | No new primary domain storage expected unless dashboard caching/freshness records are required. | Admin dashboard summary/drill-down APIs. | M | Sprint Admin-5 |

## Raw Blocked Count Order

| Rank | Feature ID | Feature Name | Blocked Test Count | Dependency Note |
|---:|---|---|---:|---|
| 1 | `ADMIN-005` | Duplicate place resolution | 36 | Depends on ADMIN-001, ADMIN-004 place correction model, backup/restore policy, and ratings/list integrity rules. |
| 2 | `ADMIN-001` | Admin access control and audit foundation | 34 | Foundation dependency, should be implemented before higher raw-count downstream features. |
| 3 | `ADMIN-006` | Abuse and content review queue | 29 | Depends on ADMIN-001 and downstream moderation/action features ADMIN-002/003/004 as linked enforcement targets. |
| 4 | `ADMIN-002` | User lookup and account status review | 28 | Depends on ADMIN-001 permission, MFA/step-up, and audit foundation. |
| 5 | `ADMIN-004` | Place moderation and correction | 26 | Depends on ADMIN-001; shares taxonomy/uniqueness logic with Places. |
| 6 | `ADMIN-003` | Public list moderation | 25 | Depends on ADMIN-001 and benefits from ADMIN-002 actor/audit patterns. |
| 7 | `ADMIN-007` | Beta operational dashboard | 25 | Depends on ADMIN-001 and data providers from ADMIN-002 through ADMIN-006 plus OPS health/readiness evidence. |

## Feature Backlog Details

### ADMIN-001 - Admin access control and audit foundation

- Blocked test cases: `34`
- Priority: `P0`
- Estimated effort: `L`
- Recommended sprint: `Sprint Admin-1`
- Dependencies: None; prerequisite for all other Admin features.
- Risk: Critical security and audit foundation risk; all downstream Admin work depends on access control, MFA/step-up, permissions, safe errors, and audit.

#### Affected User Stories

`ADMIN-001-US-001` - Restrict admin console to admins<br>`ADMIN-001-US-002` - Reject guests from admin tools<br>`ADMIN-001-US-003` - Require MFA for admin login<br>`ADMIN-001-US-004` - Require MFA after admin session expiry<br>`ADMIN-001-US-005` - Handle MFA failure safely<br>`ADMIN-001-US-006` - Enforce exact permission boundary<br>`ADMIN-001-US-007` - Apply permission matrix<br>`ADMIN-001-US-008` - Step-up for high-risk actions<br>`ADMIN-001-US-009` - Audit admin access events<br>`ADMIN-001-US-010` - Audit sensitive action success<br>`ADMIN-001-US-011` - Block sensitive action on audit failure<br>`ADMIN-001-US-012` - Protect audit records from sensitive data<br>`ADMIN-001-US-013` - Enforce audit retention<br>`ADMIN-001-US-014` - Restrict audit export<br>`ADMIN-001-US-015` - Break-glass account emergency use<br>`ADMIN-001-US-016` - Break-glass post-use review<br>`ADMIN-001-US-017` - Admin API error contract<br>`ADMIN-001-US-018` - Admin accessibility baseline

#### Blocked Test Cases

`ADMIN-001-TC-001`, `ADMIN-001-TC-002`, `ADMIN-001-TC-003`, `ADMIN-001-TC-004`, `ADMIN-001-TC-005`, `ADMIN-001-TC-006`, `ADMIN-001-TC-007`, `ADMIN-001-TC-008`, `ADMIN-001-TC-009`, `ADMIN-001-TC-010`, `ADMIN-001-TC-011`, `ADMIN-001-TC-012`, `ADMIN-001-TC-013`, `ADMIN-001-TC-014`, `ADMIN-001-TC-015`, `ADMIN-001-TC-016`, `ADMIN-001-TC-017`, `ADMIN-001-TC-018`, `ADMIN-001-TC-019`, `ADMIN-001-TC-020`, `ADMIN-001-TC-021`, `ADMIN-001-TC-022`, `ADMIN-001-TC-023`, `ADMIN-001-TC-024`, `ADMIN-001-TC-025`, `ADMIN-001-TC-026`, `ADMIN-001-TC-027`, `ADMIN-001-TC-028`, `ADMIN-001-TC-029`, `ADMIN-001-TC-030`, `ADMIN-001-TC-031`, `ADMIN-001-TC-032`, `ADMIN-001-TC-033`, `ADMIN-001-TC-034`

#### Missing Implementation Summary

The Admin feature `ADMIN-001` has no executable UI/API surface in the current system. Implement the approved behavior for `Admin access control and audit foundation` with deterministic route/API contracts, permission enforcement, audit behavior, safe error handling, accessibility, and responsive support as documented.

#### Affected Components

- Backend: Admin auth/authorization services, MFA/step-up enforcement, permission middleware, audit service, safe error handling.
- Frontend: Admin shell, protected admin route guard, MFA/step-up screens, audit-safe error states, accessibility baseline.
- Database: Admin roles/permissions, audit records, MFA/step-up state, retention metadata as documented.
- API: Admin access/check endpoints only where documented; exact Admin API routes must be implemented from approved requirements/EDRs.

### ADMIN-002 - User lookup and account status review

- Blocked test cases: `28`
- Priority: `P1`
- Estimated effort: `L`
- Recommended sprint: `Sprint Admin-2`
- Dependencies: Depends on ADMIN-001 permission, MFA/step-up, and audit foundation.
- Risk: High privacy/security risk around user lookup, account disable/enable, session revocation, and self-lockout protection.

#### Affected User Stories

`ADMIN-002-US-001` - Search users with permission<br>`ADMIN-002-US-002` - Deny user search without permission<br>`ADMIN-002-US-003` - Rate-limit user search<br>`ADMIN-002-US-004` - Minimize user search results<br>`ADMIN-002-US-005` - View user operational summary<br>`ADMIN-002-US-006` - Hide credentials and private data<br>`ADMIN-002-US-007` - Audit user detail view<br>`ADMIN-002-US-008` - Disable user with step-up<br>`ADMIN-002-US-009` - Disable user revokes sessions<br>`ADMIN-002-US-010` - Disable preserves user data<br>`ADMIN-002-US-011` - Disabled user access behavior<br>`ADMIN-002-US-012` - Re-enable user with reason<br>`ADMIN-002-US-013` - Prevent self-lockout<br>`ADMIN-002-US-014` - No unrestricted user export<br>`ADMIN-002-US-015` - Audit account status changes

#### Blocked Test Cases

`ADMIN-002-TC-001`, `ADMIN-002-TC-002`, `ADMIN-002-TC-003`, `ADMIN-002-TC-004`, `ADMIN-002-TC-005`, `ADMIN-002-TC-006`, `ADMIN-002-TC-007`, `ADMIN-002-TC-008`, `ADMIN-002-TC-009`, `ADMIN-002-TC-010`, `ADMIN-002-TC-011`, `ADMIN-002-TC-012`, `ADMIN-002-TC-013`, `ADMIN-002-TC-014`, `ADMIN-002-TC-015`, `ADMIN-002-TC-016`, `ADMIN-002-TC-017`, `ADMIN-002-TC-018`, `ADMIN-002-TC-019`, `ADMIN-002-TC-020`, `ADMIN-002-TC-021`, `ADMIN-002-TC-022`, `ADMIN-002-TC-023`, `ADMIN-002-TC-024`, `ADMIN-002-TC-025`, `ADMIN-002-TC-026`, `ADMIN-002-TC-027`, `ADMIN-002-TC-028`

#### Missing Implementation Summary

The Admin feature `ADMIN-002` has no executable UI/API surface in the current system. Implement the approved behavior for `User lookup and account status review` with deterministic route/API contracts, permission enforcement, audit behavior, safe error handling, accessibility, and responsive support as documented.

#### Affected Components

- Backend: User search, user detail minimization, account status transitions, session/token revocation, audit events.
- Frontend: User search/review UI, status review/detail screens, disable/re-enable dialogs, safe error states.
- Database: User status fields, audit records, session/token invalidation support if not already sufficient.
- API: Admin user search/detail/status APIs with permission enforcement and error contract.

### ADMIN-004 - Place moderation and correction

- Blocked test cases: `26`
- Priority: `P2`
- Estimated effort: `M`
- Recommended sprint: `Sprint Admin-3`
- Dependencies: Depends on ADMIN-001; shares taxonomy/uniqueness logic with Places.
- Risk: High catalog integrity risk; taxonomy correction can impact filters, search, aggregates, and user data preservation.

#### Affected User Stories

`ADMIN-004-US-001` - Search places for moderation<br>`ADMIN-004-US-002` - Deny place correction without permission<br>`ADMIN-004-US-003` - View place moderation detail<br>`ADMIN-004-US-004` - Correct place name<br>`ADMIN-004-US-005` - Correct place taxonomy<br>`ADMIN-004-US-006` - Reject invalid taxonomy<br>`ADMIN-004-US-007` - Reject duplicate normalized name<br>`ADMIN-004-US-008` - Detect stale correction conflict<br>`ADMIN-004-US-009` - Preserve user data during correction<br>`ADMIN-004-US-010` - Recalculate affected aggregates<br>`ADMIN-004-US-011` - Block correction if audit fails<br>`ADMIN-004-US-012` - Audit place correction<br>`ADMIN-004-US-013` - Place correction accessibility

#### Blocked Test Cases

`ADMIN-004-TC-001`, `ADMIN-004-TC-002`, `ADMIN-004-TC-003`, `ADMIN-004-TC-004`, `ADMIN-004-TC-005`, `ADMIN-004-TC-006`, `ADMIN-004-TC-007`, `ADMIN-004-TC-008`, `ADMIN-004-TC-009`, `ADMIN-004-TC-010`, `ADMIN-004-TC-011`, `ADMIN-004-TC-012`, `ADMIN-004-TC-013`, `ADMIN-004-TC-014`, `ADMIN-004-TC-015`, `ADMIN-004-TC-016`, `ADMIN-004-TC-017`, `ADMIN-004-TC-018`, `ADMIN-004-TC-019`, `ADMIN-004-TC-020`, `ADMIN-004-TC-021`, `ADMIN-004-TC-022`, `ADMIN-004-TC-023`, `ADMIN-004-TC-024`, `ADMIN-004-TC-025`, `ADMIN-004-TC-026`

#### Missing Implementation Summary

The Admin feature `ADMIN-004` has no executable UI/API surface in the current system. Implement the approved behavior for `Place moderation and correction` with deterministic route/API contracts, permission enforcement, audit behavior, safe error handling, accessibility, and responsive support as documented.

#### Affected Components

- Backend: Place moderation search/detail, correction validation, uniqueness/conflict handling, aggregate refresh, audit blocking.
- Frontend: Place correction search/detail UI, edit forms, conflict/error handling.
- Database: Place correction metadata/audit; may require version/concurrency marker.
- API: Admin place search/detail/correction APIs.

### ADMIN-005 - Duplicate place resolution

- Blocked test cases: `36`
- Priority: `P2`
- Estimated effort: `L`
- Recommended sprint: `Sprint Admin-3 or Admin-4`
- Dependencies: Depends on ADMIN-001, ADMIN-004 place correction model, backup/restore policy, and ratings/list integrity rules.
- Risk: Critical data-integrity risk; duplicate merge is transactional, cross-table, and backup-dependent.

#### Affected User Stories

`ADMIN-005-US-001` - Detect duplicate candidates<br>`ADMIN-005-US-002` - Deny merge without permission<br>`ADMIN-005-US-003` - Require step-up for merge<br>`ADMIN-005-US-004` - Choose canonical place<br>`ADMIN-005-US-005` - Run pre-merge validation<br>`ADMIN-005-US-006` - Require backup before merge<br>`ADMIN-005-US-007` - Preview merge impact<br>`ADMIN-005-US-008` - Merge transactionally<br>`ADMIN-005-US-009` - Preserve list memberships<br>`ADMIN-005-US-010` - Preserve ratings<br>`ADMIN-005-US-011` - Handle duplicate user ratings<br>`ADMIN-005-US-012` - Protect private notes during merge<br>`ADMIN-005-US-013` - Recalculate aggregates after merge<br>`ADMIN-005-US-014` - Retire source place<br>`ADMIN-005-US-015` - Post-merge verification<br>`ADMIN-005-US-016` - Rollback failed merge<br>`ADMIN-005-US-017` - Bad merge recovery expectation<br>`ADMIN-005-US-018` - Block merge if audit fails<br>`ADMIN-005-US-019` - Audit duplicate merge<br>`ADMIN-005-US-020` - Duplicate merge accessibility

#### Blocked Test Cases

`ADMIN-005-TC-001`, `ADMIN-005-TC-002`, `ADMIN-005-TC-003`, `ADMIN-005-TC-004`, `ADMIN-005-TC-005`, `ADMIN-005-TC-006`, `ADMIN-005-TC-007`, `ADMIN-005-TC-008`, `ADMIN-005-TC-009`, `ADMIN-005-TC-010`, `ADMIN-005-TC-011`, `ADMIN-005-TC-012`, `ADMIN-005-TC-013`, `ADMIN-005-TC-014`, `ADMIN-005-TC-015`, `ADMIN-005-TC-016`, `ADMIN-005-TC-017`, `ADMIN-005-TC-018`, `ADMIN-005-TC-019`, `ADMIN-005-TC-020`, `ADMIN-005-TC-021`, `ADMIN-005-TC-022`, `ADMIN-005-TC-023`, `ADMIN-005-TC-024`, `ADMIN-005-TC-025`, `ADMIN-005-TC-026`, `ADMIN-005-TC-027`, `ADMIN-005-TC-028`, `ADMIN-005-TC-029`, `ADMIN-005-TC-030`, `ADMIN-005-TC-031`, `ADMIN-005-TC-032`, `ADMIN-005-TC-033`, `ADMIN-005-TC-034`, `ADMIN-005-TC-035`, `ADMIN-005-TC-036`

#### Missing Implementation Summary

The Admin feature `ADMIN-005` has no executable UI/API surface in the current system. Implement the approved behavior for `Duplicate place resolution` with deterministic route/API contracts, permission enforcement, audit behavior, safe error handling, accessibility, and responsive support as documented.

#### Affected Components

- Backend: Duplicate candidate detection, pre-merge validation, transactional merge, rollback, aggregate recalculation, audit blocking.
- Frontend: Duplicate review, canonical/source selection, merge preview, confirmation, result summary, error handling.
- Database: Merge transaction across places, ratings, list items, aggregates, retired source state, audit/backup references.
- API: Admin duplicate candidate, preview, validate, and merge APIs.

### ADMIN-003 - Public list moderation

- Blocked test cases: `25`
- Priority: `P3`
- Estimated effort: `M`
- Recommended sprint: `Sprint Admin-4`
- Dependencies: Depends on ADMIN-001 and benefits from ADMIN-002 actor/audit patterns.
- Risk: High public-content moderation risk; depends on audit and list visibility behavior.

#### Affected User Stories

`ADMIN-003-US-001` - View public lists for moderation<br>`ADMIN-003-US-002` - Deny list moderation without permission<br>`ADMIN-003-US-003` - Exclude private lists<br>`ADMIN-003-US-004` - Search public lists with pagination<br>`ADMIN-003-US-005` - Hide public list with step-up<br>`ADMIN-003-US-006` - Hidden list public visibility<br>`ADMIN-003-US-007` - Hidden list owner visibility<br>`ADMIN-003-US-008` - Restore public list with step-up<br>`ADMIN-003-US-009` - False positive handling<br>`ADMIN-003-US-010` - Preserve owner data<br>`ADMIN-003-US-011` - Block moderation if audit fails<br>`ADMIN-003-US-012` - Audit public list moderation<br>`ADMIN-003-US-013` - Public list moderation accessibility

#### Blocked Test Cases

`ADMIN-003-TC-001`, `ADMIN-003-TC-002`, `ADMIN-003-TC-003`, `ADMIN-003-TC-004`, `ADMIN-003-TC-005`, `ADMIN-003-TC-006`, `ADMIN-003-TC-007`, `ADMIN-003-TC-008`, `ADMIN-003-TC-009`, `ADMIN-003-TC-010`, `ADMIN-003-TC-011`, `ADMIN-003-TC-012`, `ADMIN-003-TC-013`, `ADMIN-003-TC-014`, `ADMIN-003-TC-015`, `ADMIN-003-TC-016`, `ADMIN-003-TC-017`, `ADMIN-003-TC-018`, `ADMIN-003-TC-019`, `ADMIN-003-TC-020`, `ADMIN-003-TC-021`, `ADMIN-003-TC-022`, `ADMIN-003-TC-023`, `ADMIN-003-TC-024`, `ADMIN-003-TC-025`

#### Missing Implementation Summary

The Admin feature `ADMIN-003` has no executable UI/API surface in the current system. Implement the approved behavior for `Public list moderation` with deterministic route/API contracts, permission enforcement, audit behavior, safe error handling, accessibility, and responsive support as documented.

#### Affected Components

- Backend: Public-list moderation queue, hide/restore transitions, audit blocking, public visibility enforcement.
- Frontend: Moderation queue, filters, public-list detail moderation actions, hide/restore dialogs.
- Database: Moderation state on public lists, moderation audit records.
- API: Admin public-list moderation query/action APIs.

### ADMIN-006 - Abuse and content review queue

- Blocked test cases: `29`
- Priority: `P3`
- Estimated effort: `M`
- Recommended sprint: `Sprint Admin-4`
- Dependencies: Depends on ADMIN-001 and downstream moderation/action features ADMIN-002/003/004 as linked enforcement targets.
- Risk: High moderation workflow risk; links to user/list/place actions and least-privilege enforcement.

#### Affected User Stories

`ADMIN-006-US-001` - View abuse review queue<br>`ADMIN-006-US-002` - Deny queue without permission<br>`ADMIN-006-US-003` - Filter by review state<br>`ADMIN-006-US-004` - Assign report In Review<br>`ADMIN-006-US-005` - Dismiss false positive<br>`ADMIN-006-US-006` - Escalate report<br>`ADMIN-006-US-007` - Reopen report<br>`ADMIN-006-US-008` - Take moderation action<br>`ADMIN-006-US-009` - Enforce permission for linked actions<br>`ADMIN-006-US-010` - Preserve private data in queue<br>`ADMIN-006-US-011` - Paginate abuse queue<br>`ADMIN-006-US-012` - Audit report state transition<br>`ADMIN-006-US-013` - Block report action if audit fails<br>`ADMIN-006-US-014` - Abuse queue accessibility

#### Blocked Test Cases

`ADMIN-006-TC-001`, `ADMIN-006-TC-002`, `ADMIN-006-TC-003`, `ADMIN-006-TC-004`, `ADMIN-006-TC-005`, `ADMIN-006-TC-006`, `ADMIN-006-TC-007`, `ADMIN-006-TC-008`, `ADMIN-006-TC-009`, `ADMIN-006-TC-010`, `ADMIN-006-TC-011`, `ADMIN-006-TC-012`, `ADMIN-006-TC-013`, `ADMIN-006-TC-014`, `ADMIN-006-TC-015`, `ADMIN-006-TC-016`, `ADMIN-006-TC-017`, `ADMIN-006-TC-018`, `ADMIN-006-TC-019`, `ADMIN-006-TC-020`, `ADMIN-006-TC-021`, `ADMIN-006-TC-022`, `ADMIN-006-TC-023`, `ADMIN-006-TC-024`, `ADMIN-006-TC-025`, `ADMIN-006-TC-026`, `ADMIN-006-TC-027`, `ADMIN-006-TC-028`, `ADMIN-006-TC-029`

#### Missing Implementation Summary

The Admin feature `ADMIN-006` has no executable UI/API surface in the current system. Implement the approved behavior for `Abuse and content review queue` with deterministic route/API contracts, permission enforcement, audit behavior, safe error handling, accessibility, and responsive support as documented.

#### Affected Components

- Backend: Abuse queue, report state transitions, linked action permission checks, audit blocking, privacy-safe summaries.
- Frontend: Abuse queue, filters, report detail, state/reason dialogs, linked action UI.
- Database: Abuse report records, state history, audit records.
- API: Admin abuse queue/filter/state/action APIs.

### ADMIN-007 - Beta operational dashboard

- Blocked test cases: `25`
- Priority: `P4`
- Estimated effort: `M`
- Recommended sprint: `Sprint Admin-5`
- Dependencies: Depends on ADMIN-001 and data providers from ADMIN-002 through ADMIN-006 plus OPS health/readiness evidence.
- Risk: Medium operational/privacy risk; dashboard is valuable but should follow core Admin controls and moderation APIs.

#### Affected User Stories

`ADMIN-007-US-001` - View beta operational summary<br>`ADMIN-007-US-002` - Deny dashboard without permission<br>`ADMIN-007-US-003` - View health/deployment summary<br>`ADMIN-007-US-004` - View moderation metrics<br>`ADMIN-007-US-005` - Enforce drill-down permissions<br>`ADMIN-007-US-006` - No sensitive dashboard data<br>`ADMIN-007-US-007` - Show metric freshness<br>`ADMIN-007-US-008` - No unrestricted export<br>`ADMIN-007-US-009` - Audit dashboard access<br>`ADMIN-007-US-010` - Audit dashboard drill-down<br>`ADMIN-007-US-011` - Dashboard accessibility<br>`ADMIN-007-US-012` - Dashboard responsive layout

#### Blocked Test Cases

`ADMIN-007-TC-001`, `ADMIN-007-TC-002`, `ADMIN-007-TC-003`, `ADMIN-007-TC-004`, `ADMIN-007-TC-005`, `ADMIN-007-TC-006`, `ADMIN-007-TC-007`, `ADMIN-007-TC-008`, `ADMIN-007-TC-009`, `ADMIN-007-TC-010`, `ADMIN-007-TC-011`, `ADMIN-007-TC-012`, `ADMIN-007-TC-013`, `ADMIN-007-TC-014`, `ADMIN-007-TC-015`, `ADMIN-007-TC-016`, `ADMIN-007-TC-017`, `ADMIN-007-TC-018`, `ADMIN-007-TC-019`, `ADMIN-007-TC-020`, `ADMIN-007-TC-021`, `ADMIN-007-TC-022`, `ADMIN-007-TC-023`, `ADMIN-007-TC-024`, `ADMIN-007-TC-025`

#### Missing Implementation Summary

The Admin feature `ADMIN-007` has no executable UI/API surface in the current system. Implement the approved behavior for `Beta operational dashboard` with deterministic route/API contracts, permission enforcement, audit behavior, safe error handling, accessibility, and responsive support as documented.

#### Affected Components

- Backend: Dashboard aggregate providers, freshness metadata, permission-gated drill-downs, dashboard audit events.
- Frontend: Dashboard cards, drill-down links, responsive layout, safe empty/error states.
- Database: No new primary domain storage expected unless dashboard caching/freshness records are required.
- API: Admin dashboard summary/drill-down APIs.

## Suggested Sprint Order

| Sprint | Features | Goal | Exit Criteria |
|---|---|---|---|
| Admin Sprint 1 | `ADMIN-001` | Establish Admin access, permission, MFA/step-up, audit, and safe-error foundation. | Admin routes/API protected; audit foundation present; permission boundaries enforceable; accessibility baseline present. |
| Admin Sprint 2 | `ADMIN-002` | Add user lookup, minimized account review, disable/re-enable, session revocation, and account audit. | User tools permissioned, privacy-safe, audited, and non-destructive. |
| Admin Sprint 3 | `ADMIN-004`, start `ADMIN-005` | Add place correction and begin duplicate resolution foundations. | Place correction safe/audited; duplicate candidates and preview contracts available. |
| Admin Sprint 4 | finish `ADMIN-005`, `ADMIN-003`, `ADMIN-006` | Complete high-risk moderation and duplicate merge workflows. | Merge transactional; list moderation and abuse queue permissioned, audited, and privacy-safe. |
| Admin Sprint 5 | `ADMIN-007` | Add beta operational dashboard after Admin data providers exist. | Dashboard shows safe aggregates, freshness, permissioned drill-downs, audit, responsive/accessibility support. |

## Recommended First Module

Admin is the only developer-owned blocked module. Within Admin, implement `ADMIN-001` first despite `ADMIN-005` having the highest raw test count, because every other Admin feature depends on the access-control, permission, step-up, safe-error, and audit foundation.

## Final Recommendation

Do not start downstream Admin feature work until Product confirms Admin is current release scope. If confirmed, assign Claude Code to `ADMIN-001` first. If Admin remains deferred, no current developer-owned blocker should be fixed now.
