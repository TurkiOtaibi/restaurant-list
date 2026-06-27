# Admin User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Context:

- `ADMIN-001` is currently marked `Missing`.
- No admin frontend route or backend admin API exists in the current system.
- This file defines the minimum viable Admin module required to operate `سجل` safely in beta/production.
- These are requirements only. They do not imply implementation is currently complete.

Total features processed: 7
Total user stories written: 105

## Admin Scope Decision

The product needs a minimal admin capability before broader public operation because it has shared user-generated and shared catalog data:

- Users create accounts.
- Users create places.
- Places are shared catalog records.
- Public lists expose user-generated list names and owner display names.
- Duplicate places and abusive public content can affect all users.

The product does not need an enterprise admin suite. The approved minimum viable admin scope is:

1. Admin access control and audit foundation.
2. User lookup and account status review.
3. Public list moderation.
4. Place moderation and correction.
5. Duplicate place resolution.
6. Abuse/content review queue.
7. Operational admin dashboard for beta safety.

## Shared Admin Requirements

### Permission Matrix

Minimum explicit permissions:

| Permission | Capability Boundary |
|---|---|
| `admin.user.view` | Search users and view limited operational user summary. |
| `admin.user.disable` | Disable/re-enable users; requires step-up authentication and reason. |
| `admin.list.moderate` | Hide/restore public lists; requires step-up authentication and reason. |
| `admin.place.edit` | Correct place metadata; requires reason. |
| `admin.place.merge` | Merge duplicate places; requires step-up authentication, backup, and reason. |
| `admin.abuse.review` | Review reports, change report states, and apply permitted moderation actions. |
| `admin.dashboard.view` | View aggregate operational dashboard only. |

Rules:

- Admin permissions are additive and least-privilege.
- Admin authorization must be enforced server-side on every admin API.
- UI hiding is never sufficient authorization.
- Guest requests to admin APIs return `401 Unauthorized`.
- Authenticated users without required permission return `403 Forbidden`.

### Admin Authentication

- Admin access requires MFA.
- MFA is required at admin login.
- MFA is required again after admin session expiry.
- MFA failure must be handled with safe errors.
- MFA success/failure must be audited.
- Admin sessions follow normal authentication security plus admin-specific MFA requirements.

### Step-Up Authentication

The following actions require recent re-authentication:

- Disable user.
- Merge places.
- Hide public list.
- Restore public list.

Step-up rules:

- If re-authentication is missing or expired, the action is blocked.
- Step-up failure is audited.
- Step-up success is audited.
- Step-up tokens or challenge data must never be logged.

### Sensitive Data Prohibition

Admins must never access:

- Private notes.
- Passwords.
- Password hashes.
- Access tokens.
- Refresh tokens.
- Session cookies.
- Raw secrets.

Exception:

- Any future exception requires explicit approved requirements, security review, and audit policy update.

### Audit Requirements

- Sensitive admin actions must fail if audit logging fails.
- No destructive action may succeed without a corresponding audit record.
- No destructive action may succeed without a corresponding audit record.
- Audit records must include:
  - actor admin id
  - actor permission used
  - action type
  - target entity type
  - target entity id
  - timestamp
  - request id
  - correlation id where available
  - reason text where required
  - before/after values where safe
  - result: success/failure
- Audit records are immutable from the application perspective.
- Audit retention minimum: 1 year for beta, 7 years for production unless superseded by policy.
- Audit log access requires explicit audit-view permission in future implementation.
- Audit export is restricted; no unrestricted export is allowed.

### Admin API Contract Baseline

Admin APIs must define:

- `200 OK` for successful read/update where applicable.
- `201 Created` only when creating admin-managed records such as reports if implemented.
- `400 Bad Request` for malformed input.
- `401 Unauthorized` for guests.
- `403 Forbidden` for missing admin permission.
- `404 Not Found` for missing resources or private resources where existence must not leak.
- `409 Conflict` for stale writes, merge conflicts, or moderation state conflicts.
- `422 Unprocessable Entity` for validation failures.
- `500 Error` for unexpected server failure with safe payload.
- Pagination for search/list queues using bounded `limit` and `offset`.
- Structured errors with safe `code`, `message`, `details`, and `requestId`.

### Accessibility, Mobile, and Desktop

- Admin UI must support keyboard navigation.
- Admin UI must show visible `focus-visible`.
- Admin controls must have screen-reader labels.
- Dialogs must follow the approved dialog accessibility contract.
- Destructive actions must use accessible confirmation flows.
- Validation and errors must be announced accessibly.
- Interactive targets must be at least `44x44` CSS pixels.
- Admin layouts must support laptop and tablet screens.
- Admin tables/queues must not require horizontal page scrolling; dense data should use responsive layouts or internal scrolling with accessible labels.

## Admin Module

### ADMIN-001 - Admin access control and audit foundation

Feature Description: Only authorized admin users with MFA and explicit permissions can access admin functions; every sensitive admin action is audited.

#### Business Rules

- Admin features are unavailable to normal users.
- Admin access requires MFA.
- Admin permissions are explicit and least-privilege.
- Sensitive admin actions require audit records.
- Sensitive admin actions fail if audit logging fails.
- One emergency break-glass admin account is permitted for emergency-only use.

#### Security Rules

- Enforce server-side authorization for every admin API.
- Require exact permission for each action.
- Require step-up auth for high-risk actions.
- Block guest access with `401`.
- Block missing permission with `403`.
- Never expose private notes, passwords, password hashes, access tokens, refresh tokens, cookies, or secrets.

#### Audit Requirements

- Audit admin login, MFA success/failure, permission failure, dashboard access, and all sensitive actions.
- Audit records must be immutable and retained according to policy.
- Audit export is restricted.
- Audit write failure blocks sensitive actions.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| ADMIN-001-US-001 | Restrict admin console to admins | Critical | As the system, I want only admins to access admin tools. | Given a non-admin authenticated user opens an admin route/API, then response is `403 Forbidden` and no admin data is returned. |
| ADMIN-001-US-002 | Reject guests from admin tools | Critical | As the system, I want guests blocked. | Given no valid session exists, when an admin route/API is requested, then response is `401 Unauthorized`. |
| ADMIN-001-US-003 | Require MFA for admin login | Critical | As a security architect, I want admin access protected by MFA. | Given an admin signs in, when they attempt to enter admin tools, then MFA must succeed before admin access is granted. |
| ADMIN-001-US-004 | Require MFA after admin session expiry | Critical | As a security architect, I want expired admin sessions revalidated. | Given an admin session expires, when the admin tries to access admin tools again, then MFA is required again. |
| ADMIN-001-US-005 | Handle MFA failure safely | High | As the system, I want MFA failure safe. | Given MFA fails, then admin access is denied, a safe error appears, no sensitive challenge data is logged, and the failure is audited. |
| ADMIN-001-US-006 | Enforce exact permission boundary | Critical | As the system, I want least privilege enforced. | Given an admin lacks the required permission for an action, then backend returns `403 Forbidden` even if the UI control is visible or called directly. |
| ADMIN-001-US-007 | Apply permission matrix | Critical | As QA, I want permission boundaries testable. | Given each admin permission is tested, then only users with the exact required permission can perform its associated actions. |
| ADMIN-001-US-008 | Step-up for high-risk actions | Critical | As a security architect, I want destructive actions re-authenticated. | Given an admin attempts disable user, merge places, hide public list, or restore public list, then recent step-up authentication is required. |
| ADMIN-001-US-009 | Audit admin access events | High | As an operator, I want admin access traceable. | Given an admin opens admin console/API, then audit/log event records admin id, route/action, timestamp, request id, and result. |
| ADMIN-001-US-010 | Audit sensitive action success | Critical | As an auditor, I want sensitive actions recorded. | Given a sensitive admin action succeeds, then an immutable audit record exists with actor, permission, action, target, reason, before/after safe values, timestamp, request id, and result. |
| ADMIN-001-US-011 | Block sensitive action on audit failure | Critical | As a security architect, I want no unaudited destructive action. | Given audit logging fails, when an admin attempts a sensitive/destructive action, then the action fails and no target data is changed. |
| ADMIN-001-US-012 | Protect audit records from sensitive data | Critical | As a security architect, I want audit logs safe. | Given audit records are stored or viewed, then passwords, password hashes, tokens, cookies, private notes, and raw secrets are absent. |
| ADMIN-001-US-013 | Enforce audit retention | High | As an auditor, I want audit records retained. | Given audit records are created, then they are retained at least 1 year in beta and 7 years in production unless a later policy supersedes it. |
| ADMIN-001-US-014 | Restrict audit export | High | As a security architect, I want audit exports controlled. | Given an admin attempts to export audit logs, then export requires explicit permission, is scoped, redacted, and audited. |
| ADMIN-001-US-015 | Break-glass account emergency use | Critical | As an operator, I want emergency access controlled. | Given the break-glass admin account is used, then usage is allowed only for emergency recovery, triggers an alert, and creates an audit record. |
| ADMIN-001-US-016 | Break-glass post-use review | High | As a security owner, I want emergency access reviewed. | Given break-glass account is used, then a post-use review is required with incident/reason, actions taken, and follow-up decision. |
| ADMIN-001-US-017 | Admin API error contract | High | As a frontend developer, I want admin API failures predictable. | Given admin API returns `401`, `403`, `404`, `409`, `422`, or `500`, then response follows structured error contract and exposes no sensitive data. |
| ADMIN-001-US-018 | Admin accessibility baseline | High | As an admin using keyboard or assistive tech, I want admin tools accessible. | Given admin UI renders, then keyboard navigation, focus-visible, screen-reader labels, error announcements, and accessible dialogs are supported. |

Story Count: 18

Risks: Critical security risk if MFA, permission boundaries, step-up auth, or audit-failure blocking are missing.

### ADMIN-002 - User lookup and account status review

Feature Description: Admins can find a user account and review limited operational metadata needed for support, abuse handling, and beta operations.

#### Business Rules

- User lookup requires `admin.user.view`.
- Account disable/re-enable requires `admin.user.disable`.
- User search is paginated and rate-limited.
- User detail access is audited.
- User disable preserves user-owned data but revokes access.

#### Security Rules

- Admins must not see passwords, password hashes, refresh tokens, access tokens, cookies, or private notes.
- Email visibility is restricted to admins with user-support permission.
- User search must minimize returned fields.
- No unrestricted export of users is allowed.

#### Audit Requirements

- Audit user detail view.
- Audit user searches where they return identifiable account results.
- Audit disable/re-enable actions with reason and before/after status.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| ADMIN-002-US-001 | Search users with permission | High | As an admin, I want to find a user account for support or abuse handling. | Given I have `admin.user.view`, when I search by email/display name, then paginated matching users are returned with allowed fields only. |
| ADMIN-002-US-002 | Deny user search without permission | Critical | As the system, I want user search protected. | Given I lack `admin.user.view`, when I call user search, then response is `403 Forbidden`. |
| ADMIN-002-US-003 | Rate-limit user search | High | As a security architect, I want user enumeration reduced. | Given repeated user searches exceed threshold, then admin search returns a structured rate-limit error and logs safe metadata. |
| ADMIN-002-US-004 | Minimize user search results | Critical | As a privacy owner, I want user data minimized. | Given user search returns results, then each row includes only user id, display name, account status, created date, and email only if permission allows. |
| ADMIN-002-US-005 | View user operational summary | High | As an admin, I want limited account state. | Given I open user detail with `admin.user.view`, then I can see account status, created date, list count, rating count, public list count, and last admin action summary where safe. |
| ADMIN-002-US-006 | Hide credentials and private data | Critical | As the system, I want user secrets hidden. | Given admin views user detail, then passwords, password hashes, access tokens, refresh tokens, cookies, private notes, and raw auth data are absent. |
| ADMIN-002-US-007 | Audit user detail view | High | As an auditor, I want account access traceable. | Given an admin opens a user detail view, then audit log records admin id, target user id, timestamp, request id, and reason if required. |
| ADMIN-002-US-008 | Disable user with step-up | Critical | As an authorized admin, I want to disable an abusive account safely. | Given I have `admin.user.disable`, recent step-up auth, and a reason, when I disable a user, then account status changes to disabled. |
| ADMIN-002-US-009 | Disable user revokes sessions | Critical | As a security architect, I want disabled accounts locked out. | Given a user is disabled, then refresh tokens are revoked and active sessions are invalidated. |
| ADMIN-002-US-010 | Disable preserves user data | Critical | As a data owner, I want account disable non-destructive. | Given a user is disabled, then ratings, lists, places, public lists, and audit history are preserved. |
| ADMIN-002-US-011 | Disabled user access behavior | High | As the system, I want disabled users blocked consistently. | Given a disabled user attempts login, refresh, or protected API access, then access is denied with safe error and no private data leak. |
| ADMIN-002-US-012 | Re-enable user with reason | High | As an authorized admin, I want to restore access when appropriate. | Given I have `admin.user.disable` and provide a reason, when I re-enable a disabled user, then account can authenticate under normal auth rules. |
| ADMIN-002-US-013 | Prevent self-lockout | High | As an operator, I want admin access protected. | Given an admin attempts to disable their own active admin account, then the system blocks it or requires break-glass/second-admin safeguard. |
| ADMIN-002-US-014 | No unrestricted user export | Critical | As a privacy owner, I want bulk user leakage prevented. | Given an admin accesses user tools, then unrestricted user export is unavailable; any future export requires explicit permission, scope, redaction, and audit. |
| ADMIN-002-US-015 | Audit account status changes | Critical | As an auditor, I want account changes traceable. | Given an admin disables or enables a user, then audit log records admin, target user, previous status, new status, reason, timestamp, request id, and result. |

Story Count: 15

Risks: Critical privacy and access-control risk if user lookup exposes sensitive data or disable does not revoke sessions.

### ADMIN-003 - Public list moderation

Feature Description: Admins can review and moderate public lists using explicit moderation states while preserving owner data and auditability.

#### Business Rules

- Public list moderation requires `admin.list.moderate`.
- Moderation states:
  - `Visible`
  - `Hidden`
  - `Restored`
- Hidden public lists are removed from public discovery/detail.
- Owners can still see their own list in owned-list context with moderation status if product UI supports it.
- Moderation does not delete list records or list items by default.

#### Security Rules

- Private lists are not included in public-list moderation queue.
- Hide/restore requires step-up authentication and reason.
- Admins must not see private notes through list moderation.

#### Audit Requirements

- Audit hide/restore actions.
- Audit before/after moderation state.
- Audit reason, admin, list, owner, timestamp, request id.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| ADMIN-003-US-001 | View public lists for moderation | High | As a moderator, I want to review public lists. | Given I have `admin.list.moderate`, when I open moderation queue, then public lists are shown with list name, owner display name, place count, visibility, and moderation state. |
| ADMIN-003-US-002 | Deny list moderation without permission | Critical | As the system, I want list moderation protected. | Given I lack `admin.list.moderate`, when I access list moderation, then response is `403 Forbidden`. |
| ADMIN-003-US-003 | Exclude private lists | Critical | As the system, I want private lists protected. | Given private lists exist, when moderation queue loads, then private lists are absent. |
| ADMIN-003-US-004 | Search public lists with pagination | Medium | As a moderator, I want bounded search. | Given I search public lists, then results are paginated and include only public list moderation fields. |
| ADMIN-003-US-005 | Hide public list with step-up | Critical | As a moderator, I want to hide violating public lists. | Given I have permission, recent step-up auth, and a reason, when I hide a public list, then moderation state becomes `Hidden`. |
| ADMIN-003-US-006 | Hidden list public visibility | Critical | As the system, I want hidden lists removed publicly. | Given a list is `Hidden`, then it does not appear in public list index and public detail returns safe not-found/hidden behavior. |
| ADMIN-003-US-007 | Hidden list owner visibility | High | As a list owner, I want to understand moderation status. | Given my public list is hidden, when I view it through owned-list context, then the list remains preserved and moderation status is visible where supported. |
| ADMIN-003-US-008 | Restore public list with step-up | Critical | As a moderator, I want to restore content after review. | Given a list is `Hidden`, I have permission, recent step-up auth, and a reason, when I restore it, then moderation state becomes `Restored` and public visibility returns only if owner visibility is public. |
| ADMIN-003-US-009 | False positive handling | Medium | As a moderator, I want to correct bad moderation decisions. | Given a list was hidden incorrectly, when I restore it with reason, then audit trail shows the false-positive correction. |
| ADMIN-003-US-010 | Preserve owner data | Critical | As Product, I want moderation non-destructive. | Given a list is hidden/restored, then list record, list items, owner account, places, and ratings are preserved. |
| ADMIN-003-US-011 | Block moderation if audit fails | Critical | As a security architect, I want no unaudited moderation. | Given audit logging fails, when hide/restore is attempted, then action fails and moderation state remains unchanged. |
| ADMIN-003-US-012 | Audit public list moderation | Critical | As an auditor, I want moderation traceable. | Given a list is hidden or restored, then audit log records admin, permission, list, owner, previous state, new state, reason, timestamp, request id, and result. |
| ADMIN-003-US-013 | Public list moderation accessibility | Medium | As an admin using keyboard or assistive tech, I want moderation usable. | Given moderation UI renders, then queue rows, filters, hide/restore dialogs, errors, and confirmations are keyboard and screen-reader accessible. |

Story Count: 13

Risks: Critical trust and privacy risk if hidden lists leak publicly, private lists appear in moderation, or moderation is unaudited.

### ADMIN-004 - Place moderation and correction

Feature Description: Admins can correct shared place metadata when catalog quality issues affect multiple users.

#### Business Rules

- Place correction requires `admin.place.edit`.
- Corrections are limited to objective fields:
  - place name
  - primary type
  - subtype
  - optional description if present in API
- Admins must not view or modify private rating notes.
- Corrections must preserve ratings, list memberships, and user accounts.
- Stale/concurrent edits must be detected.

#### Security Rules

- Corrections require permission and reason.
- Invalid taxonomy or duplicate normalized names are rejected.
- Admin cannot use place correction to access private notes.

#### Audit Requirements

- Audit before/after values for corrected fields.
- Audit validation/conflict failures where security-relevant.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| ADMIN-004-US-001 | Search places for moderation | High | As a catalog moderator, I want to find places. | Given I have `admin.place.edit`, when I search by name/type/subtype, then paginated places are returned with public-safe metadata only. |
| ADMIN-004-US-002 | Deny place correction without permission | Critical | As the system, I want place edits protected. | Given I lack `admin.place.edit`, when I access place correction APIs, then response is `403 Forbidden`. |
| ADMIN-004-US-003 | View place moderation detail | High | As a catalog moderator, I want correction context. | Given I open a place in admin, then I see name, type, subtype, rating count, list usage count, normalized name, and duplicate candidate indicators. |
| ADMIN-004-US-004 | Correct place name | High | As a catalog moderator, I want to correct a typo. | Given a place name is incorrect, when I update name with reason, then name changes and ratings/list items remain linked. |
| ADMIN-004-US-005 | Correct place taxonomy | High | As a catalog moderator, I want type/subtype correct. | Given a place has wrong taxonomy, when I submit valid type/subtype with reason, then taxonomy changes and existing ratings/list items remain. |
| ADMIN-004-US-006 | Reject invalid taxonomy | Critical | As the system, I want taxonomy rules preserved. | Given invalid type/subtype combination is submitted, then response is `422 Unprocessable Entity` and no place data changes. |
| ADMIN-004-US-007 | Reject duplicate normalized name | Critical | As the system, I want catalog uniqueness preserved. | Given correction would create duplicate normalized place name, then response is `409 Conflict` or validation error and no change is applied. |
| ADMIN-004-US-008 | Detect stale correction conflict | High | As the system, I want concurrent edits safe. | Given place data changed after admin loaded it, when stale update is submitted, then response is `409 Conflict` and admin must reload before retrying. |
| ADMIN-004-US-009 | Preserve user data during correction | Critical | As a user, I want my data preserved. | Given admin corrects place metadata, then ratings, list items, public lists, user accounts, and private notes are not deleted or changed. |
| ADMIN-004-US-010 | Recalculate affected aggregates | High | As the system, I want public data accurate after correction. | Given place taxonomy changes, then affected type-based counts/search/filter behavior and relevant aggregates are refreshed or recalculated. |
| ADMIN-004-US-011 | Block correction if audit fails | Critical | As a security architect, I want no unaudited place edits. | Given audit logging fails, when place correction is submitted, then correction fails and place data remains unchanged. |
| ADMIN-004-US-012 | Audit place correction | Critical | As an auditor, I want corrections traceable. | Given admin changes place metadata, then audit log records before/after values, reason, admin, place id, timestamp, request id, and result. |
| ADMIN-004-US-013 | Place correction accessibility | Medium | As an admin using assistive tech, I want correction forms usable. | Given place correction UI renders, then fields, validation errors, conflict errors, and save/cancel controls are keyboard and screen-reader accessible. |

Story Count: 13

Risks: Critical data-integrity risk if place correction breaks shared references, bypasses uniqueness, or overwrites concurrent edits.

### ADMIN-005 - Duplicate place resolution

Feature Description: Admins can resolve duplicate shared places safely by merging duplicates into a canonical place.

#### Business Rules

- Duplicate merge requires `admin.place.merge`.
- Merge flow:
  1. Pre-merge validation
  2. Backup
  3. Merge
  4. Post-merge verification
- Merge must preserve ratings, list memberships, public list references, and audit history.
- Merge must prevent duplicate list item rows.
- Merge must prevent duplicate rating rows for same user/canonical place.
- Merge requires step-up authentication, reason, and confirmation.

#### Conflict Rules

- If a user rated only the source place, move rating to canonical place.
- If a user rated only the canonical place, keep canonical rating.
- If a user rated both:
  - keep the most recently updated rating as canonical
  - preserve the discarded rating details in audit-safe merge summary without exposing private notes
  - private notes are never shown to admin
- Aggregates are recalculated after merge.

#### Security Rules

- Admins cannot view private notes during merge.
- Merge is transactional.
- Failed merge rolls back fully.
- Post-commit bad merge recovery requires backup/restore or explicitly approved corrective migration/process.

#### Audit Requirements

- Audit source place id, target place id, affected counts, conflict summary, reason, admin id, timestamp, request id.
- Audit must not include private notes.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| ADMIN-005-US-001 | Detect duplicate candidates | High | As a catalog moderator, I want duplicate candidates surfaced. | Given similar normalized names or same name/type exist, when duplicate review loads, then candidate pairs/groups are shown. |
| ADMIN-005-US-002 | Deny merge without permission | Critical | As the system, I want merge protected. | Given I lack `admin.place.merge`, when I access merge APIs, then response is `403 Forbidden`. |
| ADMIN-005-US-003 | Require step-up for merge | Critical | As a security architect, I want merge re-authenticated. | Given an admin starts merge, then recent step-up authentication is required before commit. |
| ADMIN-005-US-004 | Choose canonical place | Critical | As a catalog moderator, I want to select the canonical record. | Given duplicate candidates exist, then admin must select target canonical place and source duplicate place(s). |
| ADMIN-005-US-005 | Run pre-merge validation | Critical | As the system, I want unsafe merges blocked early. | Given merge is prepared, then validation checks source/target existence, active status, taxonomy compatibility, rating conflicts, list item conflicts, and admin permission. |
| ADMIN-005-US-006 | Require backup before merge | Critical | As an operator, I want merge recoverable. | Given merge is ready to commit, then an approved backup or restore point exists before merge starts. |
| ADMIN-005-US-007 | Preview merge impact | Critical | As a catalog moderator, I want to see impact before commit. | Given merge is prepared, then preview shows affected ratings count, list item count, public list references, aggregate impact, and conflict counts without private notes. |
| ADMIN-005-US-008 | Merge transactionally | Critical | As the system, I want atomic merge. | Given merge is confirmed, then all reference updates happen in one transaction; if any step fails, all changes rollback. |
| ADMIN-005-US-009 | Preserve list memberships | Critical | As a user, I want my lists preserved. | Given source and target appear in lists, when merge completes, then memberships point to canonical place and duplicate rows are removed. |
| ADMIN-005-US-010 | Preserve ratings | Critical | As a user, I want my ratings preserved. | Given users rated source place, when merge completes, then ratings move or consolidate according to conflict rules. |
| ADMIN-005-US-011 | Handle duplicate user ratings | Critical | As the system, I want rating uniqueness preserved. | Given same user rated both source and target, then most recently updated rating remains canonical and no duplicate rating row remains. |
| ADMIN-005-US-012 | Protect private notes during merge | Critical | As a privacy owner, I want notes hidden. | Given ratings have private notes, then merge preview, audit, logs, and UI never show note content. |
| ADMIN-005-US-013 | Recalculate aggregates after merge | Critical | As the system, I want public ratings accurate. | Given merge completes, then average rating, rating count, place list references, and search/filter results reflect canonical place. |
| ADMIN-005-US-014 | Retire source place | High | As a user, I want duplicate records removed from browsing. | Given source place is merged, then it is no longer active in catalog browsing and supported references resolve to canonical place. |
| ADMIN-005-US-015 | Post-merge verification | Critical | As QA, I want merge integrity verified. | Given merge completes, then verification confirms no orphan list items, no duplicate list items, no duplicate user/place ratings, source retired, target active, and aggregates recalculated. |
| ADMIN-005-US-016 | Rollback failed merge | Critical | As the system, I want failed merge safe. | Given merge fails before commit, then transaction rolls back fully and no partial references remain. |
| ADMIN-005-US-017 | Bad merge recovery expectation | High | As an operator, I want post-commit recovery clear. | Given a bad merge is discovered after commit, then recovery requires backup/restore or approved corrective process; admin UI does not silently reverse complex merges. |
| ADMIN-005-US-018 | Block merge if audit fails | Critical | As a security architect, I want no unaudited merge. | Given audit logging fails, when merge is committed, then merge fails and no data changes. |
| ADMIN-005-US-019 | Audit duplicate merge | Critical | As an auditor, I want merge traceable. | Given merge completes or fails, then audit log records source/target ids, affected counts, conflict summary, reason, backup reference, admin id, timestamp, request id, and result. |
| ADMIN-005-US-020 | Duplicate merge accessibility | Medium | As an admin using keyboard or assistive tech, I want merge flow usable. | Given merge UI renders, then candidate selection, preview, confirmation, errors, and result summary are keyboard and screen-reader accessible. |

Story Count: 20

Risks: Critical data-integrity risk if merge loses ratings/list memberships, exposes notes, or succeeds without backup/audit.

### ADMIN-006 - Abuse and content review queue

Feature Description: Admins can review reported or flagged public content and take minimal moderation actions through a defined review lifecycle.

#### Business Rules

- Abuse review requires `admin.abuse.review`.
- State model:
  - `Open`
  - `In Review`
  - `Action Taken`
  - `Dismissed`
  - `Escalated`
  - `Reopened`
- Reports may target public lists, public catalog records, or user accounts.
- Reports must not expose private notes or unrelated private data.

#### Security Rules

- Abuse queue is admin-only.
- Enforcement actions require specific permissions:
  - hide/restore list: `admin.list.moderate`
  - disable user: `admin.user.disable`
  - edit/merge place: `admin.place.edit` / `admin.place.merge`
- Sensitive actions require reason and audit.

#### Audit Requirements

- Audit state transitions.
- Audit enforcement actions.
- Audit false-positive dismissal.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| ADMIN-006-US-001 | View abuse review queue | High | As a moderator, I want a queue of flagged content. | Given I have `admin.abuse.review`, when I open the queue, then I see report id, target type, public-safe summary, reason/category, state, and created date. |
| ADMIN-006-US-002 | Deny queue without permission | Critical | As the system, I want reports protected. | Given I lack `admin.abuse.review`, when I access abuse queue, then response is `403 Forbidden`. |
| ADMIN-006-US-003 | Filter by review state | Medium | As a moderator, I want to filter reports. | Given reports exist, when I filter by Open, In Review, Action Taken, Dismissed, Escalated, or Reopened, then matching reports appear. |
| ADMIN-006-US-004 | Assign report In Review | Medium | As a moderator, I want to mark work in progress. | Given a report is Open, when I start review, then state changes to In Review and audit log records actor and timestamp. |
| ADMIN-006-US-005 | Dismiss false positive | High | As a moderator, I want to close invalid reports. | Given a report is false positive, when I dismiss with reason, then state becomes Dismissed and no content changes. |
| ADMIN-006-US-006 | Escalate report | Medium | As a moderator, I want to escalate unclear cases. | Given a report needs higher review, when I escalate with reason, then state becomes Escalated and audit log records reason. |
| ADMIN-006-US-007 | Reopen report | Medium | As a moderator, I want to revisit cases. | Given a report was dismissed or action taken, when new information appears, then report can be Reopened with reason. |
| ADMIN-006-US-008 | Take moderation action | High | As a moderator, I want to act on valid reports. | Given report requires enforcement and I have the required permission, when I take action, then related moderation/account/catalog action applies and report state becomes Action Taken. |
| ADMIN-006-US-009 | Enforce permission for linked actions | Critical | As the system, I want abuse actions least-privilege. | Given I can review abuse but lack list/user/place permission, then I cannot perform the linked enforcement action. |
| ADMIN-006-US-010 | Preserve private data in queue | Critical | As the system, I want reports privacy-safe. | Given reports reference public content, then queue/detail does not expose private notes, tokens, passwords, cookies, or unrelated private user data. |
| ADMIN-006-US-011 | Paginate abuse queue | Medium | As an admin, I want review queue scalable. | Given many reports exist, then queue uses bounded pagination and stable ordering. |
| ADMIN-006-US-012 | Audit report state transition | Critical | As an auditor, I want review decisions traceable. | Given a report state changes, then audit log records previous state, new state, admin, reason, timestamp, request id, and result. |
| ADMIN-006-US-013 | Block report action if audit fails | Critical | As a security architect, I want no unaudited enforcement. | Given audit logging fails, then report state/enforcement action is not changed. |
| ADMIN-006-US-014 | Abuse queue accessibility | Medium | As an admin using assistive tech, I want review tools accessible. | Given abuse queue renders, then filters, rows, state controls, reason dialogs, errors, and confirmations are keyboard and screen-reader accessible. |

Story Count: 14

Risks: High trust/safety risk if abuse actions are untracked, over-permissioned, or expose private data.

### ADMIN-007 - Beta operational dashboard

Feature Description: Admins can view a minimal operational dashboard for beta safety without exposing sensitive user content.

#### Business Rules

- Dashboard access requires `admin.dashboard.view`.
- Dashboard is operational, not analytics/BI.
- Dashboard uses aggregate data by default.
- Drill-down requires the underlying feature permission.
- No unrestricted export is allowed.

#### Security Rules

- Admin-only.
- Aggregates only unless drill-down permission is explicit.
- No private notes, passwords, password hashes, tokens, cookies, raw secrets, or private account data.

#### Audit Requirements

- Audit dashboard access.
- Audit drill-down access.
- Audit any scoped export if future requirements approve it.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| ADMIN-007-US-001 | View beta operational summary | Medium | As an admin, I want a minimal beta dashboard. | Given I have `admin.dashboard.view`, when I open dashboard, then I see aggregate counts for users, places, lists, public lists, ratings, pending reports, and recent moderation actions. |
| ADMIN-007-US-002 | Deny dashboard without permission | High | As the system, I want dashboard protected. | Given I lack `admin.dashboard.view`, when I open dashboard, then response is `403 Forbidden`. |
| ADMIN-007-US-003 | View health/deployment summary | High | As an operator, I want health visible. | Given health/deployment data is available, then dashboard shows liveness, readiness, deployment marker, migration status, and data freshness timestamp. |
| ADMIN-007-US-004 | View moderation metrics | Medium | As a moderator, I want moderation load visible. | Given reports or moderated items exist, then dashboard shows open reports, in-review reports, hidden public lists, duplicate candidates, and recent action counts. |
| ADMIN-007-US-005 | Enforce drill-down permissions | Critical | As the system, I want dashboard least-privilege. | Given an admin opens dashboard without user/list/place permission, then aggregate cards may show allowed counts but drill-down links are hidden or denied. |
| ADMIN-007-US-006 | No sensitive dashboard data | Critical | As a security architect, I want dashboard safe. | Given dashboard renders, then it does not show passwords, password hashes, tokens, cookies, private notes, raw secrets, emails unless permitted, or private account metadata. |
| ADMIN-007-US-007 | Show metric freshness | Medium | As an operator, I want to know if dashboard data is stale. | Given dashboard metrics render, then each metric group shows timestamp/source or global freshness indicator. |
| ADMIN-007-US-008 | No unrestricted export | Critical | As a privacy owner, I want bulk data leakage prevented. | Given dashboard renders, then unrestricted export is unavailable; any future export requires explicit permission, scope, minimization, redaction, and audit. |
| ADMIN-007-US-009 | Audit dashboard access | High | As an auditor, I want dashboard access traceable. | Given admin opens dashboard, then access is audited with admin id, timestamp, request id, and result. |
| ADMIN-007-US-010 | Audit dashboard drill-down | High | As an auditor, I want investigations traceable. | Given admin opens dashboard drill-down, then audit records admin id, target area, permission used, timestamp, and request id. |
| ADMIN-007-US-011 | Dashboard accessibility | Medium | As an admin using assistive tech, I want dashboard usable. | Given dashboard renders, then cards, links, filters, errors, and drill-down controls are keyboard and screen-reader accessible. |
| ADMIN-007-US-012 | Dashboard responsive layout | Medium | As an admin on laptop/tablet, I want dashboard usable. | Given dashboard renders on tablet or laptop screens, then content remains readable without horizontal page scrolling and controls keep `44x44` hit targets. |

Story Count: 12

Risks: Medium operational risk if beta issues are invisible; critical privacy risk if dashboard enables broad data exposure.

## Features Rejected

The following admin capabilities are explicitly rejected for minimum viable admin scope:

| Rejected Feature | Decision | Reason |
|---|---|---|
| Enterprise RBAC matrix UI | Rejected for now | Explicit permissions are required, but a full enterprise role-management UI is unnecessary at current scale. |
| Bulk marketing/email tools | Rejected | Not needed to operate a place logging app safely. |
| Advanced analytics/BI dashboards | Rejected | Operational aggregate dashboard is enough; product analytics is separate future work. |
| Social moderation for comments/follows | Rejected | Comments/follows/social feeds are not current product features. |
| Anonymous public browsing moderation | Rejected | Anonymous public lists are future roadmap and not current scope. |
| User-facing place correction workflow | Rejected from Admin scope | This is a future product feature, not admin MVP. |
| Admin editing user private notes | Rejected | Private notes are user-private and must not be edited by admins in minimum viable scope. |
| Admin viewing private notes | Rejected | Admins must never access private notes unless future requirements explicitly approve it. |
| Admin deleting arbitrary user data | Rejected by default | Destructive operations require explicit approval, backup, audit, and narrow scope. |
| Unrestricted exports | Rejected | Export requires explicit future approval, permission, scope, minimization, redaction, and audit. |
| Feature flag management UI | Rejected for now | Useful later, but not required for minimum viable beta operations unless engineering introduces flags. |

## QA Requirements

Admin QA must include:

- Permission matrix tests.
- Guest and non-admin denial tests.
- MFA and step-up authentication tests.
- Audit creation tests.
- Audit failure blocks action tests.
- Sensitive field absence tests.
- User disable/session revocation tests.
- Public list moderation state tests.
- Place correction validation and stale-conflict tests.
- Duplicate merge transaction/conflict/rollback tests.
- Backup/pre-merge/post-merge verification tests.
- Abuse queue state transition tests.
- Dashboard permission and safe-data tests.
- Accessibility tests for admin dialogs, queues, destructive confirmations, and dashboard.
- Security tests for no passwords, password hashes, tokens, cookies, private notes, or secrets in admin responses/logs/audits.

## Module Summary

Recommended Admin Features:

1. `ADMIN-001` - Admin access control and audit foundation.
2. `ADMIN-002` - User lookup and account status review.
3. `ADMIN-003` - Public list moderation.
4. `ADMIN-004` - Place moderation and correction.
5. `ADMIN-005` - Duplicate place resolution.
6. `ADMIN-006` - Abuse and content review queue.
7. `ADMIN-007` - Beta operational dashboard.

Total Features Processed: 7

Total User Stories Generated: 105

Security Considerations:

- Admin module must enforce server-side authorization.
- Admin access requires MFA.
- High-risk actions require step-up authentication.
- Admin permissions must follow explicit least privilege.
- Sensitive admin actions require immutable audit logs.
- Sensitive/destructive actions fail if audit logging fails.
- Admin tools must never expose passwords, password hashes, access tokens, refresh tokens, cookies, private notes, or raw secrets.
- Public moderation must not expose private lists.
- Place correction and duplicate merge must preserve user ratings and list memberships.
- Duplicate merge requires pre-merge validation, backup, transaction, post-merge verification, and audit.
- One break-glass account is permitted for emergency-only use and triggers alert/review.

Suggested QA Priority:

1. `ADMIN-001` - access control, MFA, permissions, audit foundation.
2. `ADMIN-005` - duplicate place resolution.
3. `ADMIN-002` - user disable/session revocation.
4. `ADMIN-004` - place moderation/correction.
5. `ADMIN-003` - public list moderation.
6. `ADMIN-006` - abuse/content review queue.
7. `ADMIN-007` - beta operational dashboard.

Risks:

- Highest security risk: weak admin authorization, missing MFA, missing step-up auth, or unaudited actions.
- Highest data-integrity risk: duplicate place merge losing ratings/list memberships or mishandling rating conflicts.
- Highest privacy risk: admin tools exposing private notes, credentials, tokens, emails unnecessarily, or private lists.
- Highest operational risk: no audited way to moderate public content, disable abusive users, or correct shared catalog issues during beta.

Implementation Status:

- Current catalog status: `ADMIN-001` is `Missing`.
- No admin route/API currently exists.
- This file defines production-grade requirements for future implementation only.

Open Product Questions:

- None.
