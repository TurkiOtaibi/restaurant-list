# 18. Sprint Plan

## Planning Assumptions

- Team includes product, design, backend, frontend, database, and QA coverage.
- Sprint length: 2 weeks.
- MVP target: 4 delivery sprints plus release hardening.
- Authentication is email/password with JWT access tokens and refresh tokens.

## Sprint 0: Product, Architecture, and UX Foundation

**Goal:** Approve the remediated implementation-ready specification.

**Deliverables:**

- Final requirements and business rules.
- Final API contracts.
- Final database schema.
- Wireframes for authentication, main navigation, lists, place detail, ratings, and profile.
- QA test case catalog.
- RTM with test IDs.
- Out-of-scope guardrail checklist.

**Exit Criteria:**

- Stakeholders approve MVP scope.
- Engineering approves data model and API contracts.
- QA approves test cases and traceability.
- No unresolved blockers remain.

## Sprint 1: Auth, Data Foundation, Lists, and Places

**Goal:** Establish authenticated app foundation, database constraints, list CRUD, and place creation/detail.

**Backlog:**

- Email/password register and login.
- JWT access token and refresh token flow.
- Logout/revoke refresh token.
- Database tables: users, refresh_tokens, places, lists, list_places.
- Place unique name validation.
- Place create.
- Place detail API and screen.
- List create, edit, delete.
- My Lists screen.
- List detail screen.
- Public/private visibility enforcement.
- Guest access rejection.

**QA Focus:**

- Auth token flow.
- No social login.
- List CRUD.
- Public/private authorization.
- Guest rejection.
- Place uniqueness.
- No place edit route/UI.

**Exit Criteria:**

- User can register, login, logout, and access authenticated app.
- User can create/manage lists and create/view places.
- Public/private list rules pass.
- Place uniqueness is enforced.

## Sprint 2: Places, Search, Restaurants, Cafes, and Add To List

**Goal:** Complete browsing, search, and list membership flows.

**Backlog:**

- Restaurants section.
- Cafes section.
- Place list API by type.
- Place-name search only.
- Deterministic name sorting.
- Add existing place to one list.
- Create new place while adding to one list.
- Idempotent duplicate add.
- Remove place from list.
- Tried indicator display where data exists.

**QA Focus:**

- Restaurants only show restaurants.
- Cafes only show cafes.
- Search by place name only.
- No location, trending, popularity, recommendations, or category exploration.
- Add To List targets one list.
- Duplicate add creates no duplicate.
- Tried places can be re-added later.

**Exit Criteria:**

- User can populate lists with restaurants and cafes.
- Search is constrained to name search.
- Add/remove list membership works correctly.

## Sprint 3: Ratings, Tried State, Private Notes, and Aggregates

**Goal:** Implement rating upsert, first-rating cleanup, tried indicators, private notes, and community rating calculations.

**Backlog:**

- Ratings table.
- Rating upsert endpoint.
- Mark As Tried UI.
- Edit Rating UI.
- First-rating removal from all user lists.
- Existing rating update preserves re-added list memberships.
- Private notes handling.
- Blank notes stored as null.
- Average rating and rating count calculated from ratings table.
- Average rating displayed with one decimal place.

**QA Focus:**

- Rating required and range 1 to 10.
- One rating per user/place.
- Rating upsert updates existing row.
- First rating removes place from all user lists.
- Re-added tried place remains listed after rating update.
- Rating notes privacy.
- Aggregate calculation and rounding.

**Exit Criteria:**

- User can mark places as tried and edit ratings.
- Tried indicators are correct.
- Notes privacy is enforced.
- Community rating calculations are correct.

## Sprint 4: Profile, Polish, RTM Closure, and Release Readiness

**Goal:** Complete profile, end-to-end UX, accessibility, and release gates.

**Backlog:**

- My Profile summary.
- Lists count.
- Restaurants tried count.
- Cafes tried count.
- Tried places list.
- Edit Rating from profile.
- Responsive UI polish.
- Accessibility pass.
- Observability hooks.
- Final regression fixes.

**QA Focus:**

- Profile counts match database state.
- Tried places display once with private notes.
- Public/private permissions.
- Place detail authorization.
- End-to-end regression.
- Accessibility checks.

**Exit Criteria:**

- All MVP screens are complete.
- RTM test cases pass.
- Critical and high defects are resolved.
- Product owner accepts release candidate.

## Release Hardening

**Activities:**

- Final regression suite.
- Security permission review.
- Data integrity checks.
- Performance smoke tests with MVP load assumptions.
- Error logging verification.
- Backup and recovery readiness.
- Launch checklist review.
