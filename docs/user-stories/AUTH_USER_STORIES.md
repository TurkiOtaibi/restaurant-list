# Authentication User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Scope: all `AUTH-*` features from `FEATURE_CATALOG.md`.

Out of scope for this file:

- Password reset, email verification, MFA, SSO, account deletion, admin impersonation, and external identity providers.
- Google, Apple, and social login are explicitly out of scope.

Total features processed: 8
Total user stories written: 122

## Shared Authentication Security Rules

- Auth API endpoints are exactly:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
- `TokenPairResponse` contains `user.id`, `user.email`, `user.displayName`, and `accessToken`.
- `RefreshResponse` contains `accessToken`.
- `LogoutResponse` contains `revoked: true`.
- Display name is required during registration, trimmed, minimum 1 character, maximum 80 characters, public-safe, and used in Public Lists, Profile, and owner identity.
- Email uses email-format validation, is trimmed/lowercased/normalized, is unique case-insensitively, and must not be duplicated.
- Password is required, minimum 8 characters, maximum 128 characters, maximum 72 bytes for bcrypt safety, never logged, never returned, and never exposed.
- Access token is stored in frontend memory only.
- Access token must never be stored in `localStorage`, `sessionStorage`, URLs, logs, or error payloads.
- Refresh token is stored only in an HttpOnly refresh cookie and is unreadable by JavaScript.
- Refresh cookie must be HttpOnly, Secure in HTTPS/production, use configured SameSite policy, use `path=/api/v1/auth`, and use configured max age.
- Default token/session configuration: access token expires after 15 minutes; refresh token max age is 30 days unless environment configuration changes it.
- Logout must clear the refresh cookie using matching cookie attributes, including path.
- Refresh rotates refresh tokens; a successful refresh revokes the previous refresh token and issues a new one.
- Reusing a revoked refresh token is treated as refresh-token reuse and revokes active tokens for the user/session family according to backend rules.
- Protected APIs return `401 Unauthorized` when no valid access token/session is available.
- `403 Forbidden` is used where an authenticated user is known but not allowed, unless privacy-preserving not-found behavior is explicitly required by the feature.
- Auth rate limiting returns `429` with code `RATE_LIMITED` after the configured threshold.
- Default rate limit is 10 requests per 60 seconds per client/path unless environment configuration changes it.
- Production rate limiting uses Redis when configured; memory fallback is for local/test or configured fallback environments.
- Protected screens must not flash private data while auth state is unknown.
- If a user is redirected to login from a protected action, successful login returns to the original destination.
- Successful registration auto-logs in and navigates to `/places`.
- Successful logout navigates to `/`.
- Auth forms must support labels, field associations, error announcements, keyboard submit, focus on first invalid field, password manager/autofill, 320px and 390px viewports, 200% zoom, mobile keyboard pressure, and safe areas.

## Authentication Module

### AUTH-001 - View entry shell and auth links

Feature Description: Guests can view the public entry shell and access authentication links.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| AUTH-001-US-001 | View public entry shell | Medium | As a guest, I want to view the entry shell so that I can access authentication. | Given I am not authenticated, when I open `/`, then the entry shell loads without requiring a session. |
| AUTH-001-US-002 | Keep entry shell public-data only | Critical | As the system, I want the entry shell to expose no private MVP data. | Given I am a guest, when `/` loads, then no lists, places catalog data, ratings, profile data, protected public-list data, tokens, or account data are exposed. |
| AUTH-001-US-003 | Show login link | High | As a guest, I want a login link so that I can access my account. | Given I am on `/`, when I activate login, then I navigate to `/login`. |
| AUTH-001-US-004 | Show register link | High | As a guest, I want a registration link so that I can create an account. | Given I am on `/`, when I activate register, then I navigate to `/register`. |
| AUTH-001-US-005 | Authenticated user can leave entry shell | Medium | As an authenticated user, I want the entry shell not to trap me outside the app. | Given I am authenticated and open `/`, then the UI provides a clear path to the authenticated app, with `/places` as the approved post-registration destination and `/lists`/primary nav available where applicable. |
| AUTH-001-US-006 | Entry shell no-token exposure | Critical | As the system, I want public entry rendering to avoid token leakage. | Given `/` renders, then access token, refresh token, JWT claims, cookies, and secrets are never printed into HTML, URLs, logs, or client-visible errors. |
| AUTH-001-US-007 | Entry shell mobile layout | Medium | As a mobile guest, I want auth entry actions to fit my screen. | Given 320px and 390px viewports, when `/` renders, then auth links remain visible, reachable, and do not cause horizontal overflow. |
| AUTH-001-US-008 | Entry shell 200% zoom | Medium | As a low-vision user, I want the entry shell usable at high zoom. | Given 200% browser zoom, when `/` renders, then login/register actions remain reachable without clipped text. |
| AUTH-001-US-009 | Entry shell accessibility | Medium | As a keyboard or screen-reader user, I want entry links accessible. | Given I navigate `/` by keyboard or assistive tech, then login/register links have clear labels, visible focus, and logical focus order. |
| AUTH-001-US-010 | Entry shell supports password managers indirectly | Low | As a user, I want the entry path to work with normal auth tooling. | Given I navigate from `/` to login/register, then destination forms retain browser/password-manager compatibility. |

Story Count: 10

Coverage Assessment: Covers public entry, no private data/token exposure, login/register navigation, authenticated escape path, mobile, zoom, accessibility, and password-manager path.

Missing Assumptions: Whether `/` automatically redirects authenticated users is not required; it must provide a clear app path.

Risks: Low security risk if static; medium UX risk if authenticated users are stranded.

### AUTH-002 - Register with display name, email, password

Feature Description: Guests create an account with required display name, email, and password; registration starts a refresh-token-backed session and navigates to `/places`.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| AUTH-002-US-001 | Submit registration endpoint | Critical | As a guest, I want to register with required credentials so that I can use the product. | Given valid display name, email, and password, when I submit, then frontend calls `POST /api/v1/auth/register`. |
| AUTH-002-US-002 | Return TokenPairResponse on registration | Critical | As an API consumer, I want a complete registration response so that session setup is reliable. | Given registration succeeds, then response status is `201 Created` and body contains `user.id`, `user.email`, `user.displayName`, and `accessToken`. |
| AUTH-002-US-003 | Auto-login after registration | Critical | As a newly registered user, I want registration to start my session. | Given registration succeeds, then access token is held in frontend memory and refresh cookie is set by backend. |
| AUTH-002-US-004 | Navigate to Places after registration | High | As a newly registered user, I want to enter the app where I can start adding places. | Given registration succeeds and auto-login completes, then the app navigates to `/places`. |
| AUTH-002-US-005 | Require display name | Critical | As Product, I want display name captured for public-safe identity. | Given `displayName` is missing, null, empty, or whitespace-only, when registration is submitted, then validation returns `422` and no user is created. |
| AUTH-002-US-006 | Trim display name | High | As a user, I want accidental spaces removed from my public name. | Given `displayName = "  Turki  "`, when registration succeeds, then response `user.displayName` is `Turki`. |
| AUTH-002-US-007 | Enforce display name max length | High | As the system, I want display names bounded. | Given trimmed display name exceeds 80 characters, when submitted, then validation returns `422` and no user is created. |
| AUTH-002-US-008 | Use display name as public-safe identity | High | As Product, I want display name safe for public contexts. | Given registration succeeds, then display name may be used in Public Lists, Profile, and owner identity, while email remains private outside auth/account contexts. |
| AUTH-002-US-009 | Validate email format | Critical | As the system, I want valid email format required. | Given email is not valid `EmailStr`, when registration is submitted, then validation returns `422` and no user is created. |
| AUTH-002-US-010 | Normalize email | Critical | As the system, I want equivalent email casing handled consistently. | Given email includes casing or surrounding whitespace, when registration succeeds, then stored email is trimmed/lowercased/normalized. |
| AUTH-002-US-011 | Enforce case-insensitive email uniqueness | Critical | As the system, I want one account per email regardless of casing. | Given `User@Example.com` exists, when `user@example.com` is submitted, then registration fails with duplicate email behavior. |
| AUTH-002-US-012 | Reject duplicate email safely | Critical | As the system, I want duplicate emails rejected without creating accounts. | Given normalized email already exists, when registration is submitted, then API returns conflict such as `EMAIL_ALREADY_EXISTS` and no duplicate user is created. |
| AUTH-002-US-013 | Require password | Critical | As the system, I want password required. | Given password is missing or empty, when registration is submitted, then validation returns `422` and no user is created. |
| AUTH-002-US-014 | Enforce password minimum length | Critical | As the system, I want weak short passwords rejected. | Given password is fewer than 8 characters, when submitted, then validation returns `422`. |
| AUTH-002-US-015 | Enforce password max character length | High | As the system, I want oversized password payloads rejected. | Given password exceeds 128 characters, when submitted, then validation returns `422`. |
| AUTH-002-US-016 | Enforce bcrypt byte limit | Critical | As the system, I want bcrypt truncation avoided. | Given password exceeds 72 UTF-8 bytes, when submitted, then validation returns `422` before hashing. |
| AUTH-002-US-017 | Never return password or hash | Critical | As the system, I want credentials protected. | Given registration succeeds or fails, then password and password hash are never returned in response payloads. |
| AUTH-002-US-018 | Never log registration password | Critical | As the system, I want credentials protected operationally. | Given registration request is processed, then raw password is not written to application logs, structured errors, traces, or analytics. |
| AUTH-002-US-019 | Set secure refresh cookie on registration | Critical | As the system, I want registration session persistence secure. | Given registration succeeds, then refresh cookie is HttpOnly, Secure in HTTPS/production, SameSite per config, path `/api/v1/auth`, max age per refresh-token expiry, and unreadable by JavaScript. |
| AUTH-002-US-020 | Registration loading state | Medium | As a guest, I want duplicate registration submissions prevented. | Given registration is pending, when I submit again, then the submit action is disabled or busy and no second client request is sent. |
| AUTH-002-US-021 | Registration failure recovery | High | As a guest, I want errors recoverable without retyping everything. | Given validation, duplicate, rate-limit, network, or 5xx failure occurs, then field values except password may remain where safe, error is shown accessibly, and no false session starts. |
| AUTH-002-US-022 | Registration accessibility | High | As a keyboard or screen-reader user, I want registration accessible. | Given validation fails, then errors are associated to fields, announced, and focus moves to the first invalid field. |
| AUTH-002-US-023 | Registration mobile and zoom support | High | As a mobile user, I want registration usable on small screens. | Given 320px, 390px, 200% zoom, and mobile keyboard pressure, then fields/actions remain visible, tappable, and safe-area aware with no horizontal overflow. |
| AUTH-002-US-024 | Support autofill and password managers | Medium | As a user, I want browser autofill/password managers to work. | Given registration form renders, then email/password fields use appropriate labels, autocomplete hints, and standard input behavior. |

Story Count: 24

Coverage Assessment: Covers exact endpoint/response, display-name decision, email normalization/uniqueness, password limits, credential privacy, refresh cookie, post-registration `/places`, loading/error states, accessibility, mobile, and autofill.

Missing Assumptions: None.

Risks: Critical account-integrity and security risk if validation/session setup drifts.

### AUTH-003 - Login with email/password

Feature Description: Guests log in using email and password; successful login establishes refresh-cookie session and returns to the original protected destination when applicable.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| AUTH-003-US-001 | Submit login endpoint | Critical | As a registered user, I want to log in with email and password. | Given valid credentials, when I submit login, then frontend calls `POST /api/v1/auth/login`. |
| AUTH-003-US-002 | Return TokenPairResponse on login | Critical | As an API consumer, I want login response complete. | Given login succeeds, then response body contains `user.id`, `user.email`, `user.displayName`, and `accessToken`. |
| AUTH-003-US-003 | Set refresh cookie on login | Critical | As the system, I want login to establish secure refresh session. | Given login succeeds, then backend sets refresh cookie with HttpOnly, Secure in HTTPS/production, SameSite per config, path `/api/v1/auth`, max age per refresh-token expiry, and JavaScript cannot read it. |
| AUTH-003-US-004 | Store access token in memory only | Critical | As the frontend, I want access token protected from persistent storage. | Given login succeeds, then `accessToken` is kept in memory and is not stored in localStorage, sessionStorage, URL, logs, or error payloads. |
| AUTH-003-US-005 | Navigate to return-to-origin after protected redirect | High | As a user, I want login to complete the action I originally attempted. | Given I was redirected to login from Place Detail, Create Rating, Add To List, or Public List Access, when login succeeds, then I return to the original destination/action route. |
| AUTH-003-US-006 | Navigate to default app destination without origin | Medium | As a user, I want login to enter the app when no origin exists. | Given I open `/login` directly and login succeeds, then I navigate to an authenticated app destination such as `/places`. |
| AUTH-003-US-007 | Validate login email format | High | As the system, I want bad email payloads rejected before credential lookup. | Given email is not valid `EmailStr`, when submitted, then validation returns `422`. |
| AUTH-003-US-008 | Normalize login email | High | As a user, I want casing and spaces not to block login. | Given email has different casing or surrounding whitespace, when submitted, then lookup uses trimmed/lowercased/normalized email. |
| AUTH-003-US-009 | Require login password | Critical | As the system, I want password required for login. | Given password is missing or empty, when submitted, then validation returns `422`. |
| AUTH-003-US-010 | Reject wrong password generically | Critical | As the system, I want wrong passwords rejected without account leaks. | Given existing email and wrong password, when login is submitted, then API returns `401` with generic invalid-credentials error. |
| AUTH-003-US-011 | Reject unknown email generically | Critical | As the system, I want unknown emails indistinguishable from wrong passwords. | Given unknown email, when login is submitted, then API returns the same generic invalid-credentials behavior used for wrong password. |
| AUTH-003-US-012 | Prevent duplicate login submit | Medium | As a user, I want login protected from repeated taps. | Given login is pending, when I submit again, then submit action is disabled or busy and no duplicate client request is sent. |
| AUTH-003-US-013 | Recover from login failure | High | As a user, I want login failures clear and recoverable. | Given validation, invalid credentials, rate limit, network, or 5xx failure occurs, then a safe error is shown, password is not logged/exposed, and no false session starts. |
| AUTH-003-US-014 | Login form accessibility | High | As a keyboard or screen-reader user, I want login controls accessible. | Given login form renders, then labels, error associations, keyboard submit, focus on first invalid field, and visible focus work. |
| AUTH-003-US-015 | Login mobile and zoom support | High | As a mobile user, I want login usable on phone. | Given 320px, 390px, 200% zoom, mobile keyboard pressure, and safe areas, then fields/actions remain reachable without horizontal overflow. |
| AUTH-003-US-016 | Support login autofill and password managers | Medium | As a user, I want password managers to work. | Given login form renders, then email/password fields use standard semantics and autocomplete behavior compatible with browser/password managers. |
| AUTH-003-US-017 | Do not expose account state in UI timing/copy | High | As the system, I want login failures not to reveal whether an account exists. | Given wrong password and unknown email scenarios, then user-facing copy remains generic and does not distinguish account existence. |
| AUTH-003-US-018 | Apply auth rate limit to login | Critical | As the system, I want repeated login attempts limited. | Given attempts exceed configured rate limit, when login is submitted, then API returns `429` with code `RATE_LIMITED`. |

Story Count: 18

Coverage Assessment: Covers exact endpoint/response, secure cookie, memory-only token, return-to-origin, validation, generic invalid credentials, duplicate-submit prevention, recovery, accessibility, mobile, autofill, account-enumeration protection, and rate limiting.

Missing Assumptions: None.

Risks: Critical if invalid credential handling or token storage leaks account/session data.

### AUTH-004 - Refresh access token with HttpOnly cookie

Feature Description: Access token can be refreshed using an HttpOnly refresh cookie; refresh token is rotated and never exposed to JavaScript.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| AUTH-004-US-001 | Refresh endpoint contract | Critical | As an API consumer, I want a stable refresh endpoint. | Given refresh is needed, when frontend calls `POST /api/v1/auth/refresh`, then the request relies on refresh cookie and not a JS-readable refresh token. |
| AUTH-004-US-002 | Return RefreshResponse | Critical | As an API consumer, I want refresh response minimal and safe. | Given refresh succeeds, then response status is `200 OK` and body contains `accessToken` only. |
| AUTH-004-US-003 | Restore session after reload | Critical | As an authenticated user, I want my session restored after reload. | Given I have a valid refresh cookie and no in-memory access token, when app boot or protected request requires auth, then refresh returns a new access token. |
| AUTH-004-US-004 | Keep refresh token unreadable by JavaScript | Critical | As the system, I want refresh token protected from frontend code. | Given a session exists, when JavaScript inspects localStorage, sessionStorage, document-accessible cookies, URLs, logs, or errors, then refresh token is absent. |
| AUTH-004-US-005 | Keep access token memory-only after refresh | Critical | As the frontend, I want refreshed access token not persisted. | Given refresh succeeds, then access token is stored in memory only and never localStorage/sessionStorage/URL/log/error payload. |
| AUTH-004-US-006 | Rotate refresh token on every refresh | Critical | As the system, I want refresh token rotation. | Given refresh succeeds, then current refresh token record is revoked and a new refresh token cookie/record is issued. |
| AUTH-004-US-007 | Set rotated cookie attributes | Critical | As the system, I want rotated cookies secure. | Given refresh succeeds, then new refresh cookie uses HttpOnly, Secure in HTTPS/production, SameSite per config, path `/api/v1/auth`, and configured max age. |
| AUTH-004-US-008 | Reject missing refresh cookie | Critical | As the system, I want unauthenticated refresh attempts rejected. | Given no refresh cookie is present, when refresh is called, then API returns `401` with safe invalid-refresh behavior. |
| AUTH-004-US-009 | Reject expired refresh token | Critical | As the system, I want expired sessions rejected. | Given refresh token is expired, when refresh is attempted, then API returns `401`, frontend clears session state, and protected data is hidden. |
| AUTH-004-US-010 | Detect revoked token reuse | Critical | As the system, I want replayed refresh tokens detected. | Given an old rotated refresh token is reused, when refresh is attempted, then API returns `401` with revoked/reuse behavior and active refresh tokens for that user/session family are revoked. |
| AUTH-004-US-011 | Reject malformed refresh token | Critical | As the system, I want malformed tokens rejected safely. | Given refresh token has invalid signature, type, subject, or token id, when refresh runs, then API returns `401` and does not expose token internals. |
| AUTH-004-US-012 | Reject refresh for deleted user | High | As the system, I want refresh blocked when user no longer exists. | Given refresh token references a deleted/nonexistent user, when refresh runs, then API returns `401` and no access token is issued. |
| AUTH-004-US-013 | Retry original request once after refresh | High | As a user, I want expired access tokens recovered transparently. | Given a protected API request receives `401` due to access expiry and refresh succeeds, then the original request is retried once. |
| AUTH-004-US-014 | Prevent infinite refresh loops | Critical | As the system, I want failed refresh not to hang the app. | Given refresh fails, when protected request handling continues, then frontend does not retry indefinitely and moves to guest/login state. |
| AUTH-004-US-015 | Coordinate refresh with Web Locks | High | As the system, I want concurrent refresh serialized across tabs. | Given multiple tabs need refresh and Web Locks are available, then one tab performs rotation while others wait or receive the resulting access token. |
| AUTH-004-US-016 | Fallback when Web Locks unsupported | Medium | As a user in unsupported browsers, I want refresh still safe. | Given Web Locks are unavailable, then frontend uses best-effort coordination and handles refresh failure by clearing stale state without exposing private data. |
| AUTH-004-US-017 | Share token updates with BroadcastChannel | High | As a multi-tab user, I want refreshed session state shared. | Given one tab refreshes successfully and BroadcastChannel is available, then other tabs receive updated auth state. |
| AUTH-004-US-018 | Fallback when BroadcastChannel unsupported | Medium | As a user in unsupported browsers, I want stale tabs to recover. | Given BroadcastChannel is unavailable, when another tab refreshes/logs out, then this tab recovers on next protected request or visibility/focus refresh. |
| AUTH-004-US-019 | Handle refresh failure across tabs | High | As a multi-tab user, I want failed refresh handled consistently. | Given refresh fails in one tab due to expiry/reuse/revocation, then tabs clear stale auth state on notification or next protected request. |
| AUTH-004-US-020 | Show protected loading while refresh resolves | Medium | As a user, I want protected pages stable during session recovery. | Given auth state is unknown and refresh is in progress, then protected pages show loading/pending state and do not flash private data. |
| AUTH-004-US-021 | Expire access token after configured lifetime | High | As the system, I want short-lived access tokens. | Given access token is issued, then it expires according to configured lifetime, default 15 minutes. |
| AUTH-004-US-022 | Expire refresh token after configured lifetime | High | As the system, I want refresh sessions bounded. | Given refresh token is issued, then it expires according to configured lifetime, default 30 days. |
| AUTH-004-US-023 | Avoid CSRF-sensitive response on refresh | High | As the system, I want cookie refresh endpoints safe. | Given refresh relies on cookies, then SameSite policy, CORS configuration, and response behavior prevent exposing private data to unauthorized origins. |
| AUTH-004-US-024 | Keep refresh errors safe | High | As the system, I want refresh errors not to leak token data. | Given any refresh failure occurs, then response/logs do not include raw refresh token, token hash, JWT claims, or secrets. |

Story Count: 24

Coverage Assessment: Covers exact refresh endpoint/response, cookie security, memory-only token, rotation, expiry, reuse detection/family revocation, malformed/deleted-user cases, retry-once, no loops, Web Locks, BroadcastChannel, fallbacks, loading/no-flash, configured expiry, CSRF-aware behavior, and safe errors.

Missing Assumptions: None.

Risks: Highest security complexity; weak coordination can cause session loss or replay vulnerability.

### AUTH-005 - Logout and revoke refresh token

Feature Description: Authenticated users can log out; logout revokes refresh token, clears local session state, broadcasts logout, and navigates to `/`.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| AUTH-005-US-001 | Submit logout endpoint | Critical | As an authenticated user, I want to log out so that my account is no longer accessible on the device. | Given I am logged in, when I choose logout, then frontend calls `POST /api/v1/auth/logout`. |
| AUTH-005-US-002 | Return logout response | High | As an API consumer, I want predictable logout response. | Given logout completes, then response body contains `revoked: true`. |
| AUTH-005-US-003 | Revoke refresh token | Critical | As the system, I want logout to revoke refresh token so that it cannot be used again. | Given logout succeeds with a valid refresh cookie, when refresh is attempted with the old token, then refresh fails. |
| AUTH-005-US-004 | Clear refresh cookie with matching attributes | Critical | As the system, I want logout cookie deletion reliable. | Given logout completes, then refresh cookie is cleared using matching path `/api/v1/auth` and matching security attributes. |
| AUTH-005-US-005 | Clear in-memory access token | Critical | As the frontend, I want access token cleared on logout. | Given logout completes or local logout fallback runs, then in-memory access token is null. |
| AUTH-005-US-006 | Logout with missing cookie succeeds locally | High | As a user, I want logout to work even if the cookie is already missing. | Given no refresh cookie exists, when logout is called, then local session is cleared and response remains safe. |
| AUTH-005-US-007 | Logout network failure clears local state | High | As a user, I want device logout even if server is unreachable. | Given logout API fails due to network/5xx, then frontend clears local access token and private UI state while reporting that server revocation may not be confirmed. |
| AUTH-005-US-008 | Navigate to root after logout | High | As a user, I want a clear signed-out destination. | Given logout completes or local fallback clears state, then the app navigates to `/`. |
| AUTH-005-US-009 | Broadcast logout to tabs | High | As a multi-tab user, I want logout reflected across tabs. | Given I log out in one tab and BroadcastChannel is available, then other tabs clear access token and private UI state. |
| AUTH-005-US-010 | Fallback multi-tab logout without BroadcastChannel | Medium | As a user in unsupported browsers, I want stale tabs to recover. | Given BroadcastChannel is unavailable, then other tabs detect logout on next protected request, focus, visibility change, or refresh failure. |
| AUTH-005-US-011 | Do not show private data after logout | Critical | As the system, I want private data hidden after logout. | Given logout occurs, when protected routes are opened, then lists, places, ratings, profile, and authenticated public-list pages are hidden until login. |
| AUTH-005-US-012 | Keep logout accessible | Medium | As a keyboard or screen-reader user, I want logout accessible. | Given logout action is focused, then it has a clear label, visible focus, keyboard activation, and announces state change after completion. |
| AUTH-005-US-013 | Avoid token leakage during logout | Critical | As the system, I want logout safe. | Given logout succeeds or fails, then tokens are never placed in URL, localStorage, sessionStorage, logs, or error payloads. |

Story Count: 13

Coverage Assessment: Covers endpoint/response, token revocation, cookie clearing, local cleanup, missing-cookie and network-failure behavior, `/` destination, multi-tab logout, private-data hiding, accessibility, and no token leakage.

Missing Assumptions: None.

Risks: High privacy risk if local or cross-tab session state persists.

### AUTH-006 - Reject guests from MVP data

Feature Description: Guest users are rejected from protected MVP data including lists, places, ratings, profile, and public lists.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| AUTH-006-US-001 | Deny guest owned lists | Critical | As the system, I want guests denied from owned lists. | Given no valid access token/session, when `/lists` or `GET /api/v1/lists` is opened/called, then protected data is not shown and API returns `401`. |
| AUTH-006-US-002 | Deny guest places catalog | Critical | As the system, I want guests denied from the places catalog. | Given no valid access token/session, when `/places` or `GET /api/v1/places` is opened/called, then protected data is not shown and API returns `401`. |
| AUTH-006-US-003 | Deny guest place detail | Critical | As the system, I want guests denied from Place Detail. | Given no valid session, when `/places/{id}` or its API is opened/called, then protected place context is not shown and API returns `401`. |
| AUTH-006-US-004 | Deny guest profile | Critical | As the system, I want guests denied from profile archive. | Given no valid session, when `/profile` or `GET /api/v1/profile` is opened/called, then profile, ratings, notes, and counts are not shown and API returns `401`. |
| AUTH-006-US-005 | Deny guest ratings | Critical | As the system, I want guests denied from rating creation and update. | Given no valid session, when `POST /api/v1/ratings` or `PATCH /api/v1/ratings/{place_id}` is called, then request returns `401`. |
| AUTH-006-US-006 | Deny guest public lists | Critical | As the system, I want public lists visible only to authenticated users. | Given no valid session, when `/lists/public`, `/lists/public/{id}`, or public-list APIs are accessed, then access is denied with `401`. |
| AUTH-006-US-007 | Deny guest list mutations | Critical | As the system, I want guests unable to mutate lists. | Given no valid session, when create/edit/delete/add/remove list APIs are called, then request returns `401` and no data changes. |
| AUTH-006-US-008 | No private-data flash while auth resolves | Critical | As the frontend, I want protected pages not to flash private data. | Given auth state is unknown, when protected page renders, then it shows loading/pending state until auth resolves and never renders cached private data to guests. |
| AUTH-006-US-009 | Redirect guest to login with return origin | High | As a guest, I want to authenticate and return to my attempted action. | Given I attempt protected Place Detail, Create Rating, Add To List, or Public List Access, when redirected to login, then original destination/action context is preserved for post-login return. |
| AUTH-006-US-010 | Return to origin after login | High | As an authenticated user after login, I want to resume the protected action. | Given I logged in after protected redirect, then app returns to the original destination where safe and authorized. |
| AUTH-006-US-011 | Clear return origin after use | Medium | As the system, I want return destinations safe and single-use. | Given return-to-origin has been consumed or is unsafe/external, then it is cleared and the app uses the default authenticated destination. |
| AUTH-006-US-012 | Prevent open redirect | Critical | As the system, I want return-to-origin safe. | Given a return destination points outside the app or uses an unsafe scheme, when login completes, then the app ignores it and navigates to default destination. |
| AUTH-006-US-013 | Consistent unauthorized API contract | High | As an API consumer, I want auth errors consistent. | Given no valid token is provided to any protected API, then response is structured `401` without private data. |
| AUTH-006-US-014 | Guest prompt accessibility | Medium | As a guest using assistive tech, I want recovery accessible. | Given protected access is denied in UI, then sign-in prompt/link is labeled, keyboard reachable, and focus is managed. |
| AUTH-006-US-015 | Protected mobile layout | Medium | As a mobile guest, I want denied states usable. | Given 320px, 390px, or 200% zoom, when a protected page denies access, then prompt/actions remain visible without horizontal overflow. |

Story Count: 15

Coverage Assessment: Covers guest denial across all MVP data, protected APIs/routes, no private-data flash, return-to-origin, open-redirect prevention, consistent `401`, accessibility, and mobile.

Missing Assumptions: None.

Risks: Critical data exposure risk if guest denial or no-flash behavior fails.

### AUTH-007 - Rate-limit auth endpoints

Feature Description: Authentication endpoints are rate-limited using Redis in production when configured, with memory fallback for local/test/fallback environments.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| AUTH-007-US-001 | Rate-limit login attempts | Critical | As the system, I want repeated login attempts limited to slow brute-force attacks. | Given more than the configured threshold of login requests are made for a client/path within the window, then API returns `429` with code `RATE_LIMITED`. |
| AUTH-007-US-002 | Rate-limit registration attempts | High | As the system, I want repeated registration attempts limited. | Given registration requests exceed threshold within the window, then API returns `429` with code `RATE_LIMITED`. |
| AUTH-007-US-003 | Rate-limit refresh attempts | High | As the system, I want refresh abuse limited. | Given refresh requests exceed threshold within the window, then API returns `429` with code `RATE_LIMITED`. |
| AUTH-007-US-004 | Rate-limit logout attempts | Medium | As the system, I want logout endpoint protected consistently. | Given logout requests exceed threshold within the window, then API returns `429` with code `RATE_LIMITED` while frontend still clears local state when user chooses logout. |
| AUTH-007-US-005 | Use default threshold and window | High | As QA, I want rate limits testable. | Given default configuration, then threshold is 10 auth requests per 60 seconds per client/path. |
| AUTH-007-US-006 | Allow configuration override | Medium | As an operator, I want thresholds configurable. | Given `AUTH_RATE_LIMIT_REQUESTS` or `AUTH_RATE_LIMIT_WINDOW_SECONDS` are configured, then enforcement uses configured values. |
| AUTH-007-US-007 | Recover after window expiry | Medium | As a legitimate user, I want rate-limit recovery after waiting. | Given I am rate-limited, when the configured window expires, then normal auth requests can succeed again if otherwise valid. |
| AUTH-007-US-008 | Use Redis in production when configured | High | As the system, I want rate limiting shared across instances. | Given `REDIS_URL` is configured, then rate-limit counters use Redis with keying by client/path. |
| AUTH-007-US-009 | Use memory fallback when Redis absent | Medium | As the system, I want local/test environments protected. | Given Redis is not configured, then memory fallback enforces rate limits for the running process. |
| AUTH-007-US-010 | Handle Redis failure with safe fallback | High | As the system, I want Redis failures not to expose credentials or disable authentication protections. | Given Redis is configured but temporarily unavailable, when an auth endpoint is called, then rate limiting falls back to the process-local memory limiter, the auth request still runs normal credential/session validation, operational errors are logged without credentials, tokens, passwords, cookies, or request bodies, and no stack trace or internal Redis detail is returned to the client. |
| AUTH-007-US-011 | Return safe rate-limit error | High | As a user, I want rate-limit errors understandable without security leakage. | Given rate limit is exceeded, then response is structured, includes code `RATE_LIMITED`, and does not reveal thresholds beyond user-safe recovery guidance unless intentionally exposed. |
| AUTH-007-US-012 | Normal usage not blocked | High | As a legitimate user, I want normal authentication use not blocked. | Given requests are within threshold, then register, login, refresh, and logout are not blocked by rate limiting. |

Story Count: 12

Coverage Assessment: Covers endpoint coverage, `429`, `RATE_LIMITED`, default threshold/window, config override, recovery, Redis production behavior, memory fallback, Redis failure fallback, safe errors, and legitimate use.

Missing Assumptions: None.

Risks: High security risk if permissive; high UX risk if overly strict or poorly recovered.

### AUTH-008 - Google/Apple/social login out of scope

Feature Description: Social login is explicitly not implemented; only email/password authentication is supported.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| AUTH-008-US-001 | No social login in UI | High | As Product, I want no Google, Apple, or social login buttons so that MVP auth scope remains email/password only. | Given I open login or registration, then no Google, Apple, OAuth, SSO, or social login options appear. |
| AUTH-008-US-002 | No social auth API contract | High | As the system, I want no supported social-login API exposed. | Given current API routes are inspected, then no supported Google, Apple, OAuth, SSO, or social login endpoint exists. |
| AUTH-008-US-003 | Social auth attempts fail safely | Medium | As the system, I want unsupported auth paths safe. | Given a client attempts an unsupported social auth path, then the system returns not found or unsupported behavior without creating users or sessions. |
| AUTH-008-US-004 | Email/password only copy | Medium | As a user, I want auth copy to match available options. | Given login/register screens render, then only email/password authentication is presented. |
| AUTH-008-US-005 | Tests avoid social login assumptions | Medium | As QA, I want auth tests aligned to approved scope. | Given auth tests run, then they cover email/password and do not require social providers. |
| AUTH-008-US-006 | Future social login requires product approval | Low | As Product, I want scope protected. | Given future work proposes social auth, then it must not be treated as current behavior without explicit product approval and updated requirements. |

Story Count: 6

Coverage Assessment: Covers negative UI/API scope, unsupported path safety, copy, tests, and future approval guard.

Missing Assumptions: None.

Risks: Low functional risk; scope-creep risk if future social auth is introduced without requirements.

## Module Summary

Total Features Processed: 8

Total User Stories Generated: 122

Features With Highest Complexity:

- `AUTH-004` - refresh token, cookie security, rotation, reuse detection, multi-tab BroadcastChannel, Web Locks, and fallbacks.
- `AUTH-002` - registration validation, display name decision, email normalization, password byte safety, session creation.
- `AUTH-006` - protected access, no private-data flash, return-to-origin, open-redirect prevention.
- `AUTH-003` - login, generic credential errors, return-to-origin, token storage.
- `AUTH-007` - rate limiting with Redis, memory fallback, and operational failure policy.

Features With Highest Business Risk:

- `AUTH-004` - refresh-cookie security, token rotation, and reuse protection.
- `AUTH-006` - unauthorized access prevention and private-data flash prevention.
- `AUTH-003` - invalid credential handling and account protection.
- `AUTH-002` - registration/account integrity and credential validation.
- `AUTH-005` - logout, cookie clearing, and cross-tab local cleanup.

Recommended QA Priority Order:

1. `AUTH-004`
2. `AUTH-006`
3. `AUTH-002`
4. `AUTH-003`
5. `AUTH-005`
6. `AUTH-007`
7. `AUTH-001`
8. `AUTH-008`

Coverage Assessment:

- Covered: entry shell, registration, display name rules, email normalization/uniqueness, password constraints, login, logout, session persistence, access token handling, refresh token handling, cookie security, token rotation, expired sessions, invalid credentials, rate limiting, unauthorized access, protected routes, return-to-origin, redirect after registration, redirect after logout, authenticated and guest experiences, refresh-token reuse protection, multi-tab BroadcastChannel behavior, Web Locks coordination, unsupported-browser fallbacks, loading states, error states, validation messages, accessibility, mobile authentication UX, password manager support, and security/privacy rules.
- Not included: social provider login implementation, password reset, email verification, account deletion, MFA, SSO, admin impersonation, or external identity providers because they are not implemented current AUTH features.

Resolved Product Decisions:

- Display name is required, trimmed, min 1, max 80, public-safe, and used in Public Lists, Profile, and owner identity.
- Successful registration auto-logs in and navigates to `/places`.
- Successful logout navigates to `/`.
- Login after protected redirect returns to original destination/action when safe.
