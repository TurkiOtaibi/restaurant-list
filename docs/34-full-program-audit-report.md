# 34. Full Program Audit Report

> Canonical status note (2026-06-24): This report is historical audit evidence. It may mention outdated navigation, pagination, naming, or design states. Use current implementation and `docs/feature-map/` documents for the active capability map and resolved-gap status.

## 1. Executive Audit Summary

This program is a strong MVP engineering foundation, but it is not a world-class product yet.

The project did several hard things well: it narrowed scope, corrected early contradictions, implemented real backend invariants, built Arabic-first RTL UI, added meaningful E2E coverage, and hardened launch readiness beyond the original MVP. The best work happened when the team stopped chasing generic restaurant-app patterns and centered the product on a personal taste library.

The project also over-claimed. Several readiness scores, especially design scores above 9, are not supported by the actual rendered UI or implementation maturity. The application is credible, usable, and testable, but it is not yet memorable, deeply differentiated, operationally production-ready, or robust enough for public GA.

The biggest systemic problem is drift:

- Documentation specifies `/api/v1`, `data/meta` envelopes, display names, pagination metadata, and `page/pageSize`.
- Implementation exposes unversioned direct JSON resources, no response envelope, no display names, partial pagination, and different sorting behavior.
- QA proves many flows, but not the documented API contract.

The second biggest systemic problem is success risk:

- The product avoids Yelp and Google Maps, but it still does not fully answer why a user returns weekly instead of using Notes, Favorites, or a simple spreadsheet.
- "Personal Taste Library" is present in copy and card hierarchy, but not yet strong enough as a habit-forming product loop.

Final program score: **6.8 / 10**.

Final verdict: **Average**.

This is better than a typical throwaway MVP, but below the bar for a world-class consumer product review board.

## Evidence Reviewed

Artifacts reviewed:

- Product docs from `01` through `24`.
- Product audit and remediation docs: `21`, `22`.
- Sprint reports: `25`, `26`, `27`.
- Roadmap: `28`.
- Design docs and audit/remediation/production package: `29`, `30`, `31`, `32`.
- Launch readiness report: `33`.
- Backend FastAPI implementation, migrations, models, schemas, and tests.
- Frontend Next.js implementation, design-system components, screens, and Playwright tests.
- Existing UI screenshots from Batch 2A remediation and Batch 2B-1.

Commands executed during this audit:

| Command | Result |
| --- | --- |
| `python -m pytest` | 27 passed, 1 skipped live PostgreSQL |
| `python -m ruff check .` | Passed |
| `python -m mypy app tests` | Passed |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run test:e2e` | 32 passed |
| `npm audit --omit=dev --audit-level=moderate` | 0 vulnerabilities |
| `python -m pip_audit .` | No known vulnerabilities found |

Important caveat:

- The workspace is not a Git repository. There is a `.gitignore`, but no `.git` metadata was available. That limits delivery/process audit evidence.

## 2. Critical Findings

### C1. API Contract And Implementation Are Not The Same Product

Severity: Critical.

The documented API contract says product resources use `/api/v1`, response bodies use `data` and `meta`, errors use an `error` envelope, lists/places expose pagination metadata, and user resources include display names. The implementation uses unversioned routes such as `/places`, `/lists`, `/ratings`, returns direct resource JSON, uses FastAPI/Pydantic default validation errors, and does not implement `displayName`.

Evidence:

- `docs/12-api-specification.md` specifies `/api/v1`, `data`, `meta`, `displayName`, `page`, `pageSize`.
- `backend/app/main.py` includes routers directly.
- `backend/app/api/places.py` exposes `APIRouter(prefix="/places")`.
- `backend/app/modules/auth/schemas.py` returns only `id` and `email`.

Impact:

- Engineering cannot treat docs as source of truth.
- Contract tests would fail if written against documentation.
- Third-party or frontend integration confidence is lower than reported.

Required correction:

- Either update docs to match implementation or implement the documented versioned contract. Do not keep both.

### C2. The Product Still Has Weak Habit Formation

Severity: Critical.

The product says "Personal Taste Library", but the core loop is still mostly create list, add place, rate place, see tried status. That is useful, but not yet enough to prove weekly retention. The UI improved the language and relationship hierarchy, but the product has not answered why a user keeps returning after initial setup.

Evidence:

- Current implemented screens center lists, places, ratings, profile.
- No reminders, planning moments, temporal memory, revisit prompts, taste evolution, or real personal insight loops exist.
- Roadmap acknowledges broader discovery/social/personal organization later, but the current product depends on manual user discipline.

Impact:

- The product risks becoming a prettier Notes template.
- Differentiation remains more brand/copy-driven than behavior-driven.

Required correction:

- Define a retention thesis before expanding features: what recurring moment causes return, what data grows in value, and what the user cannot get from Notes/Favorites.

### C3. Public GA Is Not Supported Operationally

Severity: Critical.

Launch readiness reached controlled beta quality, not public GA. There is no CI/CD evidence, no live PostgreSQL test evidence, no structured logs beyond request IDs, no metrics, no alerts, no backup/restore evidence, no rollback plan, no rate limiting, and no CSP.

Evidence:

- `docs/33-launch-readiness-report.md` explicitly says ready for controlled MVP beta, not public GA.
- `pytest` skips live PostgreSQL without `POSTGRES_TEST_DATABASE_URL`.
- `backend/app/main.py` adds request IDs, but no structured logging or metrics.
- No CI results or deployment pipeline evidence available in workspace.

Impact:

- Production incidents would be hard to diagnose.
- Abuse and auth attacks are not mitigated.
- Data recovery is not evidenced.

Required correction:

- Treat GA as a separate production-hardening phase, not a launch toggle.

### C4. Security Model Is Still Not Mature Enough

Severity: Critical for public launch, High for controlled beta.

Refresh tokens are now persisted and hashed, but browser tokens still live in `localStorage`, there is no automatic client-side refresh handling, no login/signup throttling, no password reset, no email verification, no session/device management, and no CSP.

Evidence:

- `frontend/src/lib/api.ts` stores access and refresh tokens in `localStorage`.
- The API client attaches access token but does not call `/auth/refresh` on 401.
- No rate-limiting middleware exists.

Impact:

- XSS would expose tokens.
- Users will be forced out when access tokens expire even though refresh exists.
- Signup/login abuse is unprotected.

Required correction:

- Move refresh/session strategy to httpOnly secure cookies or equivalent hardened model, add refresh retry, and add auth rate limits.

## 3. High Findings

### H1. Database Does Not Enforce Normalized Place-Name Uniqueness

Docs say place names are globally unique after normalization. Implementation normalizes before insert and checks `lower(Place.name)`, but the database unique index is on raw `name`. Concurrent inserts or database-level writes can bypass normalized uniqueness for case variants.

Evidence:

- `backend/app/api/places.py` does pre-check with `func.lower`.
- `backend/app/modules/places/models.py` uses `unique=True` on `name`.
- No normalized name column or functional unique index exists.

Impact:

- Duplicate place names can leak under concurrency or external data operations.

### H2. Frontend Has No Session Refresh Behavior

The backend supports refresh token rotation, but the client API does not use it. A short-lived access token will produce 401 and clear tokens.

Evidence:

- `frontend/src/lib/api.ts` has `saveTokens`, `getAccessToken`, `clearTokens`, but no `getRefreshToken` or refresh retry path.

Impact:

- Auth persistence is incomplete from the user's perspective.

### H3. SQLite-Dominant Test Coverage Can Hide PostgreSQL Bugs

Backend tests use SQLite fixtures. PostgreSQL metadata compilation is useful, but live PostgreSQL validation is skipped unless configured.

Evidence:

- `backend/tests/conftest.py` uses `sqlite+aiosqlite`.
- `backend/tests/integration/test_postgresql_validation.py` skips live validation without `POSTGRES_TEST_DATABASE_URL`.

Impact:

- Transaction, constraint, datetime, and query behavior may differ in production.

### H4. Collection APIs Are Still Under-Specified And Partially Unbounded

`GET /places` now has `limit/offset`, but list/public/profile collections do not expose documented pagination metadata. Frontend still expects full arrays.

Evidence:

- `backend/app/api/lists.py` returns `list[UserList]` and `ListDetailResponse` without pagination.
- `docs/12-api-specification.md` expects `meta`.

Impact:

- Growth will degrade response time and frontend rendering.

### H5. Frontend Makes N+1 Detail Calls For Relationship Context

Restaurants, Cafes, Place Detail, and Profile derive relationship context by fetching all lists, then list details per list.

Evidence:

- `PlaceLibraryPage` calls `/lists`, then `Promise.all(listResponse.map(... /lists/{id}))`.
- `PlaceDetailPage` repeats the same pattern.
- `ProfileArchivePage` fetches public list details after `/lists`.

Impact:

- The first thing to break under active users will be list/detail fan-out.

### H6. Error Contract Is Inconsistent

Some errors return string `detail`, others return `{code,message}`, validation uses Pydantic's array shape, while docs require `error.code/message/fields`.

Evidence:

- `backend/app/api/lists.py` raises `detail="List not found."`.
- `backend/app/api/auth.py` raises structured `detail={"code": ...}`.
- `frontend/src/lib/api.ts` supports multiple shapes because the backend is inconsistent.

Impact:

- Client code is defensive and fuzzy instead of contract-driven.

### H7. Product Scope Was Protected, But Product Value Was Not Equally Validated

Scope discipline was excellent. Validation of why the product deserves to exist is weaker. Many audits improved presentation, but no evidence shows user testing, retention experiments, or comparative validation against Notes/Favorites.

Impact:

- The project can be "well-built" and still commercially weak.

### H8. Visual Design Is Better Than CRUD, Not Yet World-Class

The screenshots show a warm, coherent RTL interface. They do not show the polish, density control, visual surprise, or memorability of Linear, Airbnb, Sofa, or Letterboxd.

Evidence:

- Batch 2B-1 screenshots show relationship-first cards and Arabic copy.
- UI still relies heavily on bordered cards, long text blocks, and repeated panel patterns.

Impact:

- The product identity is present but not iconic.

### H9. The Documentation System Became Too Large For The Implementation

The project produced extensive documents, matrices, readiness scores, and remediation packages. Many were useful. Some became performative and drifted from implementation.

Impact:

- Future contributors may not know which document controls.
- Scores became optimistic signals rather than hard evidence.

### H10. Repository Hygiene Is Weak

The workspace contains generated Python `__pycache__`, frontend `.next`, `tsconfig.tsbuildinfo`, old screenshots, and `audit-ui.db`. There is no `.git` evidence.

Impact:

- Harder to distinguish source, artifact, generated test output, and deliverable.

## 4. Medium Findings

1. Search sort contradicts docs: docs say deterministic `name_asc`; implementation orders by `created_at.desc`.
2. Places type filtering is done client-side for Restaurants/Cafes instead of API-level `type`.
3. API versioning remains unresolved despite being called out repeatedly.
4. No visual regression testing exists.
5. Accessibility is stronger than average, but real Arabic screen-reader testing is not evidenced.
6. No manual mobile device QA evidence exists beyond screenshots and Playwright viewport tests.
7. Current design system is mostly CSS classes, not a rigorously enforceable token package.
8. Profile is conceptually a taste archive, but still shallow.
9. Public lists exist, but the public-list experience is intentionally secondary and not deeply valuable yet.
10. Performance is acceptable for MVP but not validated with realistic data volumes.
11. No concurrency tests cover rating upsert and duplicate list-item race conditions.
12. No migration up/down automation is evidenced.
13. Backend business rules live largely in route handlers, not dedicated services.
14. The roadmap admits major production gaps but does not yet convert them into enforced release blockers.
15. UI copy carries too much product meaning; behavior does not yet carry enough.

## 5. Low Findings

1. Some Arabic copy is polished but long for repeated mobile scanning.
2. Several UI sections still feel like framed panels despite attempts to avoid CRUD.
3. The brand name "ذوق" is present but visually understated.
4. Some tests rely on duplicated mock API behavior.
5. Type casts are used to bridge SQLAlchemy string fields to Literal response schemas.
6. The frontend health page still references earlier sprint shell language in tests.
7. Design docs mention items not currently implemented, increasing cognitive load.
8. Screenshots are stored in multiple audit folders without a current canonical visual baseline.
9. `.env.example` at root and backend-specific env examples can confuse setup.
10. The program uses many readiness scores but no single score governance model.

## 6. Product Review

What worked:

- The product correctly avoided maps, nearby search, Yelp patterns, photos, comments, follows, and recommendations.
- "The user relationship to a place is more important than the place itself" became visible in Restaurants, Cafes, and Place Detail.
- Tried status derived from ratings is a clean product model.
- Private notes are a meaningful differentiator versus public review products.

What did not work:

- The product still lacks a recurring use trigger.
- Public lists are underdeveloped and intentionally hidden, so social value is minimal.
- The profile is a summary, not yet a meaningful archive.
- There is no evidence that users would switch from Notes/Favorites.

Product score: **6.2 / 10**.

## 7. UX Review

Strengths:

- Mobile-first flows exist for login, register, lists, create list, list detail, restaurants, cafes, rating, profile, and public lists.
- Dialogs and sheets are accessible and focused.
- Create List and Create Place are lightweight.
- Rating consequence copy is a strong UX decision.

Weaknesses:

- There is too much explanatory copy; some screens teach the concept repeatedly.
- Empty states are warmer than before but not yet delightful.
- User value still depends on manual curation effort.
- The absence of automatic refresh creates a session UX cliff.

UX score: **7.0 / 10**.

## 8. Design Review

Strengths:

- Arabic-first, RTL-native presentation is real.
- IBM Plex Sans Arabic and warm palette create coherence.
- Cards show relationship status before raw metadata.
- Navigation is simple and scoped.

Weaknesses:

- It is visually pleasant, not world-class.
- It lacks a memorable visual object or interaction that users would recall.
- It still leans on card grids and bordered panels.
- Desktop layouts can feel spacious but not sophisticated.

UI score: **6.8 / 10**.

## 9. Architecture Review

Strengths:

- Modular monolith is the right choice.
- Domain modules exist for auth, lists, places, ratings, profile.
- Alembic migrations exist and are small.
- Backend invariants are mostly server-side.

Weaknesses:

- Business logic is route-heavy.
- API contract/versioning strategy is unresolved.
- No current-user endpoint despite roadmap/docs.
- No central error handler.
- No service layer for complex cross-domain operations.

Architecture score: **7.0 / 10**.

## 10. Backend Review

Strengths:

- Auth registration/login/refresh/logout works.
- Refresh tokens are hashed and revocable.
- Ratings enforce one per user/place.
- First rating removes place from user lists.
- Private notes are shaped carefully.
- Health readiness now checks DB.

Weaknesses:

- Normalized place uniqueness is not enforced at DB level.
- Pagination is incomplete.
- No rate limiting.
- No password reset/email verification.
- No real PostgreSQL CI evidence.
- Error responses are inconsistent.

Backend score: **7.2 / 10**.

## 11. Frontend Review

Strengths:

- Screens are implemented, Arabic-first, and covered by E2E.
- Component primitives exist: buttons, inputs, dialogs, bottom sheets, cards, badges, rating control, search field.
- Focus management in dialogs is solid.
- Relationship-first place presentation is implemented.

Weaknesses:

- API client lacks refresh handling.
- Tokens are stored in localStorage.
- Relationship context requires N+1 list-detail calls.
- Visual system is not strongly enforced through typed tokens.
- Some UI meaning is copy-dependent rather than interaction-dependent.

Frontend score: **6.7 / 10**.

## 12. QA Review

Strengths:

- Backend tests cover auth, places, lists, ratings, tried behavior, profile, search boundaries, token revocation.
- Frontend E2E covers major flows.
- There is a real frontend-to-API E2E test.
- Launch accessibility smoke test with axe exists.
- Static quality checks pass.

Weaknesses:

- Tests do not verify the documented API contract.
- Most backend tests use SQLite.
- E2E is Chromium-only.
- No visual regression.
- No load tests.
- No mutation/concurrency tests.
- QA docs are broader than implemented automation.

QA score: **7.4 / 10**.

## 13. Security Review

Strengths:

- Password hashing.
- Hashed refresh tokens.
- Refresh rotation/revocation.
- Production secret validation.
- Basic security headers.
- Notes privacy tests.
- npm and pip project audits are clean.

Weaknesses:

- localStorage token storage.
- No client refresh retry.
- No rate limiting.
- No CSP.
- No password reset/email verification.
- No session/device management.
- No audit log for sensitive actions.

Security score: **6.4 / 10**.

## 14. Scalability Review

What would break first under growth:

1. N+1 list-detail calls from frontend.
2. `LIKE '%query%'` place search.
3. List/public/profile collections without complete pagination.
4. Raw-name unique index for global places.
5. Lack of rate limiting on auth and create endpoints.
6. Lack of metrics/latency tracing.
7. SQLite-only test confidence.
8. Public list reads if users create many lists/items.
9. Rating aggregate queries without broader indexing strategy.
10. Place data quality with global unique names and no correction workflow.

Scalability score: **5.9 / 10**.

## 15. Technical Debt Review

Most important debt:

- API docs and implementation mismatch.
- Error response inconsistency.
- Route-heavy backend logic.
- localStorage session model.
- Missing API pagination metadata.
- Missing normalized place name.
- N+1 frontend calls.
- No CI/CD evidence.
- Generated artifacts in workspace.
- Overgrown documentation hierarchy.

Technical debt level: **Medium-high**.

## 16. Launch Readiness Review

Current launch state:

- Ready for controlled MVP beta.
- Not ready for broad public GA.

What is launch-ready:

- Core flows work.
- Auth persists server-side through refresh token storage.
- Critical privacy rules are tested.
- E2E passes.
- Build passes.
- Basic dependency audits pass.
- Basic accessibility smoke passes.

What blocks public GA:

- Rate limiting.
- Hardened browser session strategy.
- CSP.
- Live PostgreSQL CI.
- Observability.
- Backup/restore plan.
- Contract alignment.
- Product retention validation.

Launch readiness score: **6.5 / 10**.

## 17. Top 10 Strengths

1. Strong scope discipline: no maps, photos, comments, follows, recommendations, or social login.
2. The tried-place rule is simple and powerful: rating derives tried status.
3. Rating notes privacy is taken seriously.
4. Refresh token persistence/revocation was added before launch readiness.
5. Arabic-first and RTL-native work is real, not cosmetic.
6. Dialog/sheet accessibility is stronger than typical MVP work.
7. E2E coverage includes a real frontend-to-API path.
8. The design remediation process corrected early generic CRUD direction.
9. The modular monolith is the right architectural base.
10. Launch readiness found and fixed real issues instead of rubber-stamping.

## 18. Top 10 Weaknesses

1. API contract and implementation drift badly.
2. Product retention loop is weak.
3. "World-class" design scores were inflated.
4. Browser session handling is incomplete.
5. PostgreSQL confidence is insufficient.
6. Frontend relationship context creates N+1 calls.
7. Normalized place uniqueness is not enforced by the database.
8. Observability and release operations are thin.
9. Documentation volume outpaced implementation truth.
10. The product is still not clearly more valuable than Notes for many users.

## 19. Top 10 Biggest Mistakes Made

1. Treating design documentation readiness as equivalent to actual UI quality.
2. Letting API docs drift from implementation.
3. Assigning very high readiness scores before operational evidence existed.
4. Over-investing in audit/remediation documents before contract tests.
5. Under-investing in the retention thesis.
6. Building refresh-token backend support without frontend refresh handling.
7. Relying on SQLite tests for a PostgreSQL-targeted backend.
8. Leaving normalized uniqueness as application logic instead of DB enforcement.
9. Keeping public list value shallow while still spending design effort on it.
10. Not establishing a single final source of truth after many documents.

## 20. Top 10 Strongest Decisions Made

1. Email/password only for MVP.
2. No anonymous list access.
3. Private rating notes.
4. Rating-derived tried status.
5. Removing place editing from MVP.
6. Search by name only.
7. One add-to-list action targets one list.
8. Duplicate list item add is idempotent.
9. Public lists require authentication.
10. Arabic-first mobile-first UI direction.

## What Should Have Been Done Differently

1. Freeze a smaller API contract and enforce it with contract tests before frontend expansion.
2. Implement `/api/v1` or explicitly reject it in docs early.
3. Build a normalized place-name column and DB uniqueness from Sprint 1.
4. Add client refresh handling during Sprint 3.
5. Add live PostgreSQL CI before Launch Readiness.
6. Define retention strategy before world-class visual design work.
7. Keep fewer readiness scores; require evidence tables instead.
8. Use fewer UI copy passages and more behavior-driven identity.
9. Create one canonical design/system source after remediation.
10. Add visual regression once screenshots became part of review.

## What Still Threatens Success

- Users may not return.
- Product may be remembered as a nice tracker, not a necessary taste library.
- API/doc drift will slow future engineering.
- Public launch risk remains high without security/ops hardening.
- Place data quality will degrade with growth.
- Performance will degrade from list/detail fan-out.
- The program may continue producing documents faster than verified product value.

## What Is Over-Engineered

- The documentation/audit/remediation pipeline.
- The number of readiness scores.
- The amount of design handoff detail relative to current UI maturity.
- Some world-class benchmarking language before the app had matching proof.
- Mock-heavy E2E fixtures duplicating backend behavior.

## What Is Under-Engineered

- API contract enforcement.
- Session lifecycle in the frontend.
- Rate limiting and abuse protection.
- PostgreSQL integration validation.
- Observability.
- Place data normalization.
- Pagination metadata.
- CI/CD and release operations.
- Product analytics and retention measurement.

## What Would Break First Under Growth

1. Relationship context fetching would break first: current frontend patterns fan out from list summaries into list details to infer whether a place belongs to the user, which becomes expensive as lists and places grow.
2. Place lookup quality would degrade because the product relies on simple name search and does not yet have a mature normalization strategy.
3. Duplicate place enforcement would become fragile under concurrent writes because normalized uniqueness is not enforced as a first-class database invariant.
4. Pagination would become inconsistent because API docs, backend behavior, and frontend expectations are not aligned around response metadata.
5. Public list browsing would become noisy because the experience is not yet strong enough to distinguish meaningful personal collections from generic public data.
6. Rating aggregation would stay acceptable for MVP scale, but would need indexing and query review before larger traffic.
7. Token/session support would produce user-visible friction because the backend supports refresh while the frontend does not fully use it.
8. Operational support would fail before the product fails because monitoring, alerting, backup drills, and incident practices are not evidenced.
9. QA confidence would degrade because live PostgreSQL coverage is skipped and most E2E coverage relies on controlled fixtures.
10. The product identity would dilute if new surfaces prioritize place metadata over the user's relationship to the place.

## World-Class Potential Assessment

The strongest product principle in the program is this: **the user's relationship to a place is more important than the place itself**. Batch 2B-1 finally starts expressing that principle through context such as list membership, tried state, and personal rating. That is the correct direction.

The problem is that the principle is not yet strong enough across the whole system. Too many implementation and documentation surfaces still treat places as records, lists as containers, and public content as browseable objects. A world-class Personal Taste Library would make ownership, memory, intent, and personal history the dominant hierarchy everywhere.

World-class potential exists, but it is conditional. The product can become distinctive if relationship-first context becomes a backend-supported, UI-dominant model rather than a frontend-computed decoration. Without that, the product will remain a well-made Arabic restaurant tracker instead of a memorable consumer product.

## What Would Prevent This From Becoming World-Class

1. Confusing "polished MVP" with "world-class product".
2. No durable reason to return weekly.
3. Weak product memory and delight.
4. Insufficient visual distinctiveness.
5. Operational immaturity.
6. Contract drift.
7. Weak data quality strategy.
8. Security shortcuts.
9. No real user validation evidence.
10. Documentation bloat masking implementation gaps.

## 21. Scoring

| Area | Score | Rationale |
| --- | ---: | --- |
| Product | 6.2 | Clear scope and thesis, weak retention proof. |
| UX | 7.0 | Usable, Arabic-first, better than CRUD; still copy-heavy. |
| UI | 6.8 | Warm and coherent, not world-class or memorable. |
| Architecture | 7.0 | Right modular monolith, but contract/error/service gaps. |
| Backend | 7.2 | Good invariants, weak pagination/normalization/ops. |
| Frontend | 6.7 | Functional and tested, but session/N+1/token issues. |
| QA | 7.4 | Broad flow coverage, weak contract/Postgres/visual/load coverage. |
| Security | 6.4 | Improved, not public-launch mature. |
| Delivery | 6.6 | Persistent and disciplined, but too document-heavy and no VCS evidence. |
| Launch Readiness | 6.5 | Controlled beta yes; public GA no. |
| World-Class Potential | 6.3 | Real potential, not yet proven by product behavior. |

## Final Program Score

**6.8 / 10**.

## 22. Final Program Verdict

**Average.**

This is not a weak project. It is also not exceptional.

The project is a credible, unusually well-documented MVP with a meaningful Arabic-first direction and strong privacy instincts. But a world-class review board would not accept the current contract drift, operational gaps, weak retention thesis, and inflated design-readiness claims.

The right next move is not more design rhetoric. The right next move is hard alignment:

1. Make implementation and API docs identical.
2. Prove PostgreSQL in CI.
3. Fix frontend session refresh.
4. Add rate limiting and CSP.
5. Replace N+1 relationship fetching with backend-supported relationship summaries.
6. Validate the product with real users against Notes/Favorites.

Until then, this is a strong foundation with average program maturity and above-average potential.
