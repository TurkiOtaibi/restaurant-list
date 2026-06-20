# 28. Full Production System Roadmap

## Document Purpose

This document converts the project plan from an MVP-only plan into a full production system roadmap.

The current implementation is now treated as the Core Foundation. It should be preserved and extended, not rewritten.

## Planning Position

The existing MVP documentation remains useful as the baseline contract for the foundation already built. This roadmap expands the product beyond MVP and should be used for future planning, prioritization, architecture evolution, and sprint sequencing.

## 1. Current State Assessment

### Product State

The product currently supports the core authenticated workflow for tracking restaurants and cafes:

- Register.
- Login.
- Refresh token.
- Logout endpoint.
- Create and view places.
- Create, view, update, and delete owned lists.
- Add and remove places from owned lists.
- Create and update ratings.
- Derive tried status from ratings.
- Automatically remove a newly rated place from all of the user's lists.
- Re-add tried places to lists later.
- Mark lists public or private.
- View authenticated public lists.
- View profile basics.

### Backend State

Current backend implementation is a FastAPI modular monolith with these route areas:

- `auth`
- `places`
- `lists`
- `ratings`
- `profile`
- `health`

Current database migrations create or modify:

- `users`
- `places`
- `lists`
- `list_items`
- `ratings`

Current backend tests cover authentication, places, lists, ratings, tried behavior, visibility, profile statistics, and security token helpers.

### Frontend State

Current frontend implementation is a Next.js application with simple functional screens:

- Home.
- Health.
- Login.
- Register.
- Lists.
- Create List.
- List Detail.
- Public Lists.
- Public List Detail.
- Places.
- Create Place.
- Rate Place.
- Profile.

Current Playwright tests cover foundation workflows through Sprint 2 using mocked backend API responses.

### QA State

Current automated checks include:

- Backend API/unit tests with `pytest`.
- Backend lint/format with `ruff`.
- Frontend lint.
- Frontend TypeScript typecheck.
- Frontend Playwright happy-path tests.

### Current Foundation Risks

- Refresh tokens are not durably persisted or revoked server-side.
- API routes are unversioned in implementation, while the API specification anticipates `/api/v1`.
- Backend tests use SQLite, while production target remains PostgreSQL.
- Frontend Playwright tests mock backend API behavior, so full-stack browser regression is not yet covered.
- User profile is functional but minimal and lacks public display identity controls.
- Place model is global and unique by name only; production place quality needs stronger identity, duplicate handling, and correction workflows.
- No production observability, rate limiting, audit logging, or abuse tooling is implemented yet.

## 2. Full Product Vision

The complete product should become a trusted personal and social restaurant and cafe planning system.

The product should help users:

- Save places they want to try.
- Organize places into personal and shareable lists.
- Track tried places through ratings and private notes.
- Discover places through controlled search, filters, community signals, and social context.
- Share curated lists with authenticated users and selected external audiences when privacy rules allow.
- Follow trusted people or lists.
- Understand why a place may be relevant without becoming a generic review site.
- Maintain privacy over personal notes, private lists, and account data.

The product should help operators:

- Maintain data quality.
- Moderate user-generated content.
- Detect abuse.
- Manage reports.
- Review place corrections.
- Observe system health.

The long-term product should be production-grade, privacy-aware, testable, observable, and scalable without discarding the current foundation.

## 3. Gap Analysis Between Current MVP Foundation and Full System

| Area | Current Foundation | Full Production Need | Gap |
| --- | --- | --- | --- |
| Authentication | Email/password, JWT access/refresh, stateless logout | Durable sessions, refresh-token rotation, revocation, device/session management | High |
| User Profile | Basic private stats | Display names, avatars, bio, public profile controls, account settings | High |
| Places | Global unique name, type, description | Normalized names, aliases, duplicate detection, location, metadata, correction workflow | High |
| Lists | Owner lists, public/private visibility | Share links, collaborators, copied lists, ordered items, list metadata | Medium |
| Ratings | Private notes, 1-10 rating, aggregates | Rating history, optional review-like public text if approved, richer personal signals | Medium |
| Tried State | Derived from ratings | Strong invariant retained, with richer UX and analytics | Low |
| Search | Not implemented in current code | Name, filters, location, tags, ranked search, typo tolerance | High |
| Discovery | Not implemented | Personalized discovery, social discovery, curated collections, trending with controls | High |
| Social | Not implemented | Follow users/lists, reactions, list saves, activity controls | High |
| Notifications | Not implemented | Account, social, moderation, and system notifications | High |
| Admin | Not implemented | Moderation queue, reports, user/place/list controls, audit logs | Critical |
| Security | Basic JWT/password | Rate limits, abuse protection, secrets, token revocation, privacy operations | High |
| QA | Unit/API/E2E foundation | Contract, integration, full-stack, performance, accessibility, security automation | High |
| Observability | Health endpoint only | Structured logs, metrics, traces, alerts, dashboards | High |
| Release Ops | Local verification | CI/CD, migrations, rollback, backups, environment promotion | High |

## 4. Updated Product Scope For Complete System

### In Scope For Complete Production System

- Account and session management.
- User profiles and public profile controls.
- Personal and public lists.
- Collaborative and shareable list workflows.
- Place catalog with data quality workflows.
- Ratings, private notes, and tried history.
- Place search and filtering.
- Discovery surfaces.
- Social follows and list saves.
- Notifications.
- Reporting, moderation, and admin operations.
- Privacy controls and data export/deletion workflows.
- Observability, analytics, and operational readiness.
- Production-grade QA automation.

### Still Out Of Scope Unless Explicitly Approved

- Reservation booking.
- Payment processing.
- Business-owner advertising tools.
- Food delivery integrations.
- Full restaurant management software.
- Anonymous access to private user data.
- Public exposure of private rating notes.

### Product Guardrails

- Private notes remain private.
- Private lists remain owner-only unless collaboration is explicitly introduced.
- Public content requires moderation and reporting paths.
- Discovery should not expose sensitive private activity.
- Social features should be opt-in, controllable, and abuse-resistant.

## 5. Feature Phases

### Phase 0: Current Core Foundation

Status: implemented.

Includes:

- Authenticated app shell.
- Places.
- Lists.
- List items.
- Ratings.
- Tried derivation.
- Public/private list visibility.
- Profile basics.

### Phase 1: Production Hardening And Contract Alignment

Goal: make the foundation production-safe before broad feature expansion.

Features:

- Persist refresh tokens.
- Add refresh-token rotation and revocation.
- Add account display name.
- Add current-user endpoint.
- Align API route versioning strategy.
- Add pagination and sorting contracts to implemented list endpoints.
- Apply migrations to PostgreSQL in automated CI.
- Add production environment configuration.
- Add structured errors.
- Add audit log foundation.
- Add rate limiting and auth abuse protection.

Exit criteria:

- Session revocation works server-side.
- API contracts match implementation.
- Database migrations run against PostgreSQL in CI.
- Core flows pass full-stack tests.

### Phase 2: Profile, Account, And Personal Organization

Goal: make the product usable as a durable personal tracker.

Features:

- Display name.
- Avatar.
- Bio.
- Account settings.
- Password change.
- Email change.
- Export personal data.
- Delete account request flow.
- Personal tags.
- Favorite tried places.
- Reorder list items.
- Archive lists.
- Duplicate own list.
- List item notes before trying.

Exit criteria:

- User identity is production-ready.
- Personal organization is richer without requiring social features.
- Privacy controls are clear.

### Phase 3: Place Data Quality And Catalog Maturity

Goal: improve trust in the shared place catalog.

Features:

- Normalized place name column.
- Place aliases.
- Duplicate place suggestion.
- Duplicate merge workflow.
- Place correction request flow.
- Place metadata fields such as address, city, neighborhood, website, phone, and operating status.
- Place type expansion only after taxonomy approval.
- Admin-reviewed place edits.
- Data-quality audit log.

Exit criteria:

- Duplicate place creation is reduced.
- Operational corrections are traceable.
- Place data quality can be moderated.

### Phase 4: Search And Discovery Foundation

Goal: help users find places without relying only on exact names.

Features:

- Search by name with typo tolerance.
- Filters by type, city, neighborhood, list presence, tried state, rating range, and tags.
- Sort by name, rating, recently added, recently tried, and distance where location is approved.
- Dedicated place detail page.
- Search result pagination.
- Search analytics.
- Search index or managed search service if database search is insufficient.

Exit criteria:

- Search is fast, relevant, tested, and explainable.
- Discovery still respects private data boundaries.

### Phase 5: Sharing And Social Foundation

Goal: enable controlled social value without losing privacy.

Features:

- Public profile pages.
- Public list pages.
- Follow users.
- Follow lists.
- Save or copy public lists.
- View lists from followed users.
- Activity controls.
- Block user.
- Report user/list/place content.
- User-controlled visibility defaults.

Exit criteria:

- Social graph exists.
- Public surfaces have abuse controls.
- Private data remains private.

### Phase 6: Community Content And Moderation

Goal: support public community content safely.

Features:

- Public optional review text, separate from private notes.
- Comments on public lists or reviews only if moderation is staffed.
- Photos only with upload scanning and moderation.
- Reactions or lightweight feedback on public lists.
- Report queues.
- Moderator actions.
- Content takedown workflow.
- User warnings, suspensions, and bans.

Exit criteria:

- Moderation tools ship before or with community content.
- Abuse reporting is available everywhere public content appears.

### Phase 7: Advanced Discovery And Personalization

Goal: provide helpful recommendations while preserving user trust.

Features:

- Similar places.
- Personalized suggestions from saved places, ratings, and followed lists.
- Trending lists with anti-manipulation controls.
- Curated collections.
- Neighborhood discovery.
- "Because you liked" explanations.
- Recommendation opt-out.

Exit criteria:

- Recommendation logic is measurable and explainable.
- Private data is not leaked through recommendation surfaces.
- Abuse and popularity manipulation risks are monitored.

### Phase 8: Production Scale And Platform Operations

Goal: operate reliably at production scale.

Features:

- Observability dashboards.
- Alerting.
- Background jobs.
- Queue workers.
- Search indexing pipeline.
- CDN and media pipeline if photos are approved.
- Backup and restore drills.
- Incident runbooks.
- Feature flags.
- A/B experiment framework.

Exit criteria:

- Releases are controlled.
- Incidents are observable and recoverable.
- Data can be restored and audited.

## 6. Updated Architecture Roadmap

### Current Architecture

- FastAPI backend.
- Next.js frontend.
- SQLAlchemy models and Alembic migrations.
- Modular monolith organized by domain modules.
- PostgreSQL target with SQLite used for test isolation.
- Playwright browser tests with mocked API.

### Near-Term Architecture

- Keep modular monolith.
- Add API versioning.
- Add service layer for cross-domain transactions.
- Add repository/query helpers only where repeated patterns justify them.
- Add PostgreSQL-backed integration tests.
- Add structured logging and request IDs.
- Add durable refresh-token storage.
- Add central error response shaping.

### Mid-Term Architecture

- Add background worker process.
- Add Redis or equivalent for rate limiting, short-lived caches, and job coordination.
- Add search service or PostgreSQL full-text/trigram search depending on scale.
- Add event table or outbox for notifications and analytics.
- Add object storage and media processing if photos are approved.
- Add admin console behind role-based authorization.

### Long-Term Architecture

- Keep the core application a modular monolith until scaling data proves service extraction is needed.
- Extract search, media processing, notification delivery, or recommendation pipelines only when operational pressure justifies it.
- Maintain a single source of truth for users, lists, places, ratings, permissions, and privacy.

## 7. Updated Data Model Roadmap

### Current Tables

- `users`
- `places`
- `lists`
- `list_items`
- `ratings`

### Production Foundation Tables

- `refresh_tokens`
- `user_profiles`
- `user_sessions`
- `audit_logs`
- `rate_limit_events` or equivalent operational store.

### Place Quality Tables

- `place_aliases`
- `place_correction_requests`
- `place_merge_requests`
- `place_metadata`
- `place_change_logs`

### Organization Tables

- `list_item_notes`
- `list_item_ordering`
- `list_tags`
- `place_tags`
- `archived_lists`
- `saved_lists`

### Social Tables

- `follows`
- `blocks`
- `public_profile_settings`
- `list_collaborators`
- `list_copies`
- `activity_events`

### Discovery Tables

- `search_index_state`
- `search_events`
- `recommendation_events`
- `curated_collections`
- `collection_places`
- `trending_snapshots`

### Moderation Tables

- `reports`
- `moderation_cases`
- `moderation_actions`
- `content_statuses`
- `user_sanctions`
- `admin_notes`

### Notification Tables

- `notifications`
- `notification_preferences`
- `notification_deliveries`

### Media Tables, If Photos Are Approved

- `media_assets`
- `photo_attachments`
- `media_moderation_results`

## 8. Updated API Roadmap

### Contract Alignment

- Decide whether production routes use `/api/v1`.
- Keep auth endpoints consistent with the chosen versioning strategy.
- Standardize response envelopes or explicitly choose direct JSON resources.
- Standardize error shape.
- Add pagination metadata for collection endpoints.
- Add sorting and filtering validation.

### Foundation APIs

- `GET /me`
- `PATCH /me`
- `POST /auth/logout` with durable revocation.
- Session listing and session revoke APIs.
- Account settings APIs.

### Place APIs

- Place detail.
- Place search.
- Place filters.
- Place correction request.
- Duplicate suggestion.
- Admin place merge.
- Admin place correction decision.

### List APIs

- List ordering.
- List item notes.
- List archive/restore.
- Copy public list.
- Save public list.
- Collaborator management if approved.

### Rating APIs

- Current user's rating.
- Rating history if needed.
- Optional public review APIs if approved separately from private notes.

### Profile APIs

- Private profile summary.
- Public profile.
- Public profile lists.
- User privacy settings.

### Social APIs

- Follow user.
- Unfollow user.
- Follow list.
- Unfollow list.
- Block user.
- Unblock user.
- Report user/list/place/content.

### Discovery APIs

- Search.
- Suggested places.
- Similar places.
- Curated collections.
- Trending lists.
- Personalized feed if approved.

### Admin APIs

- Moderation queue.
- Report detail.
- Resolve report.
- Suspend user.
- Restore user.
- Merge places.
- Update place metadata.
- View audit log.

## 9. Updated Frontend Roadmap

### Foundation Improvements

- Create a real design system.
- Add shared form, table, modal, badge, empty-state, and error components.
- Add authenticated layout and route guards.
- Add durable API client with refresh handling.
- Add loading, error, and permission states consistently.

### User-Facing Screens

- Account settings.
- Session management.
- Place detail.
- Search results.
- Advanced filters.
- Saved public lists.
- Public profile.
- Edit profile.
- List archive.
- List reorder.
- Copy public list.
- Personal tags.
- Tried history.

### Social Screens

- Followers and following.
- Followed lists.
- Public user profile.
- Social activity controls.
- Blocks and privacy settings.

### Discovery Screens

- Search home.
- Curated collections.
- Neighborhood or location-based discovery if approved.
- Similar places.
- Personalized suggestions.
- Trending lists with explanation and guardrails.

### Admin Screens

- Admin dashboard.
- Reports queue.
- Moderation case detail.
- Place correction queue.
- Place merge workflow.
- User management.
- Audit log viewer.

## 10. Admin & Moderation Roadmap

### Phase 1: Operational Admin

- Admin role model.
- Admin-only route protection.
- User lookup.
- Place lookup.
- List lookup.
- Basic audit log view.

### Phase 2: Reporting

- Report place.
- Report public list.
- Report user.
- Report public profile.
- Report public review/comment/photo if those features exist.

### Phase 3: Moderation Cases

- Report queue.
- Case assignment.
- Case status.
- Moderator notes.
- Resolution reasons.
- Takedown and restore.

### Phase 4: Enforcement

- User warnings.
- Temporary suspensions.
- Permanent bans.
- Content hiding.
- Appeal workflow.

### Phase 5: Data Quality Operations

- Place correction queue.
- Duplicate merge workflow.
- Alias management.
- Metadata correction.
- Audit trail for all changes.

## 11. Social Features Roadmap

### Principles

- Social features should be opt-in and privacy-aware.
- Following should never expose private lists, private notes, or private activity.
- Blocking and reporting must ship before broad social expansion.

### Roadmap

1. Public profiles with user-controlled display data.
2. Follow public users.
3. Follow public lists.
4. Save or copy public lists.
5. See followed public lists.
6. Lightweight public activity such as newly published lists.
7. Reactions to public lists if moderation exists.
8. Comments only after moderation capacity exists.

## 12. Discovery Features Roadmap

### Discovery Principles

- Discovery must not use private notes as public evidence.
- Recommendation explanations should be clear.
- Users should be able to understand or disable personalization.
- Popularity features require abuse resistance.

### Roadmap

1. Name search with filters.
2. Place detail improvements.
3. Curated collections.
4. Public list browsing.
5. Social discovery from followed users/lists.
6. Similar places.
7. Personalized suggestions.
8. Trending lists or places with anti-gaming controls.
9. Location-aware discovery if location data and privacy controls are approved.

## 13. Security & Privacy Roadmap

### Authentication And Sessions

- Durable refresh tokens.
- Refresh-token hashing.
- Rotation and replay detection.
- Server-side logout.
- Device/session list.
- Password reset.
- Email verification.
- Password change.
- Optional MFA later.

### Authorization

- Central permission checks.
- Role-based admin authorization.
- Owner checks for private resources.
- Public list/profile permission model.
- Collaboration permission model if collaboration is approved.

### Abuse Protection

- Rate limits.
- Login throttling.
- Signup abuse detection.
- Report abuse flows.
- Content moderation states.
- Admin audit logs.

### Privacy

- Private notes never exposed through public APIs.
- Private lists never visible to non-owners.
- Public profile settings.
- Data export.
- Account deletion workflow.
- Privacy policy and retention policy support.
- Logging policy that avoids sensitive data capture.

### Infrastructure Security

- Secrets management.
- TLS-only production traffic.
- Secure cookie strategy or hardened token storage strategy.
- Security headers.
- Dependency scanning.
- Container/image scanning if containers are used.
- Regular backup/restore validation.

## 14. QA & Automation Roadmap

### Current QA Base

- Backend API/unit tests.
- Frontend Playwright happy-path tests.
- Lint and typecheck.

### Near-Term QA

- PostgreSQL integration tests.
- Migration up/down tests.
- Contract tests for API response schemas.
- Full-stack Playwright tests against live API.
- Authorization matrix tests.
- Privacy leak tests.
- Accessibility smoke tests.

### Mid-Term QA

- Cross-browser Playwright suite.
- Visual regression for critical screens.
- Performance smoke tests.
- Load tests for places, lists, ratings, search, and public lists.
- Security tests for auth, rate limits, and permission bypass.
- Data integrity tests for concurrent rating/list writes.
- Seeded test data fixtures.

### Long-Term QA

- Synthetic monitoring.
- Production smoke tests.
- Release canary checks.
- Automated rollback checks.
- Moderation workflow test suite.
- Recommendation quality regression tests.
- Search relevance test set.

## 15. Release Plan

### Release 0: Core Foundation

Status: current.

Includes:

- Auth.
- Places.
- Lists.
- Ratings/tried.
- Public/private lists.
- Profile basics.

### Release 1: Production Foundation Beta

Audience: internal team and invited test users.

Must include:

- Durable refresh tokens.
- API contract alignment.
- PostgreSQL CI.
- Full-stack E2E tests.
- Basic observability.
- Account display names.
- Password reset.
- Error handling standardization.

### Release 2: Private Beta

Audience: limited real users.

Must include:

- Account settings.
- Place detail.
- Search by name and filters.
- Profile polish.
- Data export.
- Admin basic lookup.
- Report content foundation.

### Release 3: Public Beta

Audience: broader authenticated users.

Must include:

- Public profile controls.
- Public list browsing.
- Follow lists or users.
- Blocking.
- Reporting.
- Moderation queue.
- Search reliability.
- Monitoring dashboards.

### Release 4: General Availability

Audience: public launch.

Must include:

- Stable onboarding.
- Production moderation.
- Incident response.
- Backup/restore readiness.
- Security review.
- Accessibility review.
- Performance targets met.
- Privacy and retention policy support.

### Release 5: Growth And Discovery

Audience: scaled production.

May include:

- Curated collections.
- Similar places.
- Personalized recommendations.
- Trending with anti-abuse controls.
- Notifications.
- Optional photos or comments only if moderation is mature.

## 16. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Expanding too quickly into social/discovery | Privacy, abuse, scope drift | Harden foundation and moderation first |
| Private notes leak | Severe trust breach | Response shaping, privacy tests, code review gates |
| Place duplicates grow quickly | Poor search and discovery quality | Normalized names, aliases, duplicate suggestions, admin merge |
| Stateless refresh tokens remain | Session revocation weakness | Implement durable token storage in next sprint |
| Search ranking becomes opaque | User mistrust | Explain ranking and keep filters explicit |
| Trending/recommendations can be gamed | Bad discovery quality | Anti-abuse metrics and moderation |
| Public content without moderation | Abuse and legal exposure | Moderation/reporting before comments/photos |
| SQLite-only backend tests hide PostgreSQL issues | Production defects | Add PostgreSQL integration suite |
| Mocked E2E tests miss integration bugs | False confidence | Add full-stack Playwright suite |
| API spec and implementation drift | Engineering confusion | Contract tests and versioned API plan |

## 17. Recommended Next Sprint

### Sprint 3 Recommendation: Production Foundation Hardening And Contract Alignment

This should be the next sprint before adding social or discovery features.

Goal:

- Convert the current Core Foundation into a production-safe baseline.

Recommended backlog:

- Add durable `refresh_tokens` persistence.
- Hash refresh tokens at rest.
- Implement refresh-token rotation.
- Implement server-side logout revocation.
- Add `GET /me`.
- Add display name to user/account profile.
- Decide and implement API versioning strategy.
- Standardize API error responses.
- Add pagination and sorting contracts to implemented collection endpoints.
- Add PostgreSQL-backed integration tests.
- Add migration up/down verification.
- Add full-stack Playwright tests against a live backend.
- Add structured request logging and request IDs.
- Add baseline rate limiting for auth endpoints.
- Add account settings skeleton.

Acceptance criteria:

- Logout actually revokes refresh tokens.
- API implementation and documentation use the same route/version strategy.
- Core backend tests run against PostgreSQL in CI.
- Frontend happy paths can run against a live backend.
- No private notes or private lists leak in expanded contract tests.
- Current Core Foundation behavior remains intact.

## Roadmap Governance

Future sprint planning should classify every proposed item as one of:

- Foundation hardening.
- Personal organization.
- Place data quality.
- Search/discovery.
- Social.
- Moderation/admin.
- Security/privacy.
- Operations/QA.

Any feature that creates public content, public identity, social graph, or discovery ranking must include:

- Privacy review.
- Abuse review.
- Moderation plan.
- QA plan.
- Rollback plan.

## Final Recommendation

Preserve the current Core Foundation and proceed with production hardening before shipping broader social or discovery functionality.

The project should no longer be planned as "finish MVP, then stop." It should now be planned as:

1. Stabilize the Core Foundation.
2. Mature account, privacy, and data quality.
3. Add search and discovery.
4. Add social features with moderation.
5. Scale operations, automation, and reliability.
