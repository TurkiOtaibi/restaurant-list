# 21. Product Audit Report

## 1. Executive Audit Summary

The package is not ready to hand to engineering as a production-ready MVP specification. It has the right broad product direction, but too many rules are weakened by "should", "if supported", "may", "conditional", and "optional" language.

The biggest risks are:

- Tried-place behavior is not enforced as a hard invariant everywhere.
- Rating notes privacy is not defined.
- Public list access is supposed to be authenticated-only, but several documents still describe it too loosely.
- Place editing is mentioned as a requirement without a permission, API, or screen model.
- Authentication is assumed but not decided.
- Search is included without enough guardrails, which risks pushing the product toward discovery.
- API contracts and QA traceability are not detailed enough for a team to implement consistently.

Final readiness score: **5.5 / 10**.

Recommendation: **Ready only after fixes**.

## 2. Severity-Ranked Issue List

### Critical

#### C-01: Tried-place invariant is not mandatory everywhere

**Issue:** The package says lists are wishlist lists and that a rated place must be removed from all user lists, but preventing a tried place from being re-added is only `Should` in `FR-043` and uses weak "should not" language in validation and API rules.

**Why it matters:** This breaks the core product promise. If a user can rate a place and later add it back to a wishlist, the app no longer cleanly represents "places I want to try" vs "places I have tried."

**Affected documents:**

- `docs/03-functional-requirements.md:56`
- `docs/05-business-rules.md:36-39`
- `docs/12-api-specification.md:205-210`
- `docs/13-validation-rules.md:52-55`
- `docs/20-requirement-traceability-matrix.md:30`

**Recommended fix:** Make the rule mandatory across all requirements, business rules, validation rules, API rules, and QA coverage: a place with an existing current-user rating cannot be added to any current-user wishlist list.

**Acceptance criteria:**

- `FR-043` priority is `Must`.
- API uses "must not already be tried", not "should not".
- Add-to-list validation rejects tried places consistently.
- QA includes a hard negative test: rated place cannot be re-added to any list owned by that user.
- Traceability maps this to a required test, not a generic "tried invariant" bucket.

#### C-02: Rating notes privacy is undefined

**Issue:** Notes are optional and stored on ratings, but the package never states whether notes are private, visible in public lists, visible on place detail, or visible to other authenticated users.

**Why it matters:** This is a privacy leak waiting to happen. The product is not Yelp and does not include comments or public reviews. If engineers expose notes in public list, place, or profile APIs, the app accidentally becomes a review-sharing product.

**Affected documents:**

- `docs/03-functional-requirements.md:91-98`
- `docs/06-user-roles-and-permissions.md:39-47`
- `docs/08-screen-inventory.md:228-243`
- `docs/10-database-design.md:104-124`
- `docs/12-api-specification.md:76-83`, `docs/12-api-specification.md:314-365`
- `docs/15-ux-recommendations.md:52-59`

**Recommended fix:** Define notes as private to the rating owner for MVP. Public list views and place endpoints must never return another user's notes. Community rating uses numeric ratings only.

**Acceptance criteria:**

- Permissions document explicitly states rating notes are private.
- Public list API excludes notes.
- Place list/detail API excludes other users' notes.
- Profile/rating API returns only current user's notes.
- QA includes tests proving User B cannot retrieve User A's rating notes through public lists, place detail, search, or profile endpoints.

#### C-03: Authenticated-only public list behavior is inconsistent

**Issue:** The role model says guests cannot view MVP data and public viewers are authenticated users, but functional requirements and user flows still say "other users" and "viewer" without explicitly requiring authentication. The list detail endpoint says auth is `Conditional`.

**Why it matters:** The user explicitly requires public lists to be visible only to authenticated users in MVP. Ambiguity here can produce anonymous public list access, which changes privacy, security, analytics, and product positioning.

**Affected documents:**

- `docs/03-functional-requirements.md:44-47`
- `docs/06-user-roles-and-permissions.md:11-15`, `docs/06-user-roles-and-permissions.md:26`, `docs/06-user-roles-and-permissions.md:44-45`
- `docs/07-user-flows.md:243-260`
- `docs/09-information-architecture.md:70-79`
- `docs/12-api-specification.md:133-142`, `docs/12-api-specification.md:415-424`
- `docs/19-qa-strategy.md:24-30`

**Recommended fix:** Replace loose wording with "authenticated non-owner" everywhere. Set list detail and public list routes to `Auth: Yes`. Add explicit guest-denied test coverage.

**Acceptance criteria:**

- Public list viewer role is consistently "authenticated non-owner".
- Guest attempts to view public lists return authentication required.
- `/api/v1/lists/{listId}` and `/api/v1/public/lists/{listId}` do not conflict on auth behavior.
- QA includes guest-public-list denial tests.

### High

#### H-01: Place editing is required but not designed

**Issue:** `FR-051` says description is allowed when creating or editing a place, but there is no place edit screen, no update endpoint, no permission model, and no ownership/admin role.

**Why it matters:** Places are shared catalog records. Allowing edits without rules creates data vandalism and cross-user impact. Removing edit from the MVP is valid, but the current package leaves it half-in.

**Affected documents:**

- `docs/03-functional-requirements.md:63-66`
- `docs/06-user-roles-and-permissions.md:30`, `docs/06-user-roles-and-permissions.md:46`
- `docs/08-screen-inventory.md:118-138`
- `docs/12-api-specification.md:271-297`
- `docs/20-requirement-traceability-matrix.md:32-35`

**Recommended fix:** Either remove place editing from MVP entirely or specify a controlled place update model. For MVP, the cleaner fix is to remove "editing" from `FR-051` and keep place creation only.

**Acceptance criteria:**

- No MVP requirement promises place editing.
- No traceability row references "place update if supported".
- If editing remains, there is an API, role, permission rule, audit requirement, and QA coverage.

#### H-02: Authentication model is unresolved

**Issue:** The API says auth provider can vary, registration/login are only "if local auth is used", while the database requires `password_hash` unless external auth is used.

**Why it matters:** Every permission, profile, list, and rating rule depends on identity. Engineering cannot finalize schema, auth middleware, error contracts, or QA fixtures without a decision.

**Affected documents:**

- `docs/02-product-scope.md:9-14`
- `docs/03-functional-requirements.md:13-19`
- `docs/10-database-design.md:30-41`
- `docs/12-api-specification.md:85-94`
- `docs/18-sprint-plan.md:32-43`

**Recommended fix:** Make an explicit MVP auth decision: local email/password, hosted auth provider, or delegated auth. Then update database, API, NFR, and QA assumptions to match.

**Acceptance criteria:**

- One auth approach is selected.
- User table fields match that approach.
- Auth endpoints are definitive, not conditional.
- QA fixtures and permission tests specify how users are authenticated.

#### H-03: Shared place catalog has no correction path

**Issue:** Any authenticated user can create a shared place, but there is no owner, edit path, merge path, moderation path, or operational correction model.

**Why it matters:** The first typo or wrong type becomes permanent in the shared catalog unless someone bypasses the app. Admin moderation is out of MVP, but production still needs a minimal operational stance.

**Affected documents:**

- `docs/06-user-roles-and-permissions.md:30`, `docs/06-user-roles-and-permissions.md:46`
- `docs/10-database-design.md:44-64`, `docs/10-database-design.md:160-166`
- `docs/12-api-specification.md:271-297`
- `docs/17-future-roadmap.md:55-67`

**Recommended fix:** For MVP, state that place records are immutable after creation through user-facing UI, with operational database correction handled outside user workflows. Add a later roadmap item for correction/merge. Do not imply user-facing edit.

**Acceptance criteria:**

- MVP explicitly defines whether place records are immutable.
- There is no unsupported edit promise.
- Operational correction is acknowledged as non-user-facing.
- QA verifies create-place only, not update-place behavior.

#### H-04: Search is in scope without sufficient anti-discovery guardrails

**Issue:** Search appears in IA, API, UX, and MVP should-haves. It is described as "not discovery", but the actual API allows a `q` search across places unless callers restrict type.

**Why it matters:** Search can become the first discovery surface. Without constraints, teams may add global search, ranking, popularity, or broad browsing behavior that violates the product positioning.

**Affected documents:**

- `docs/09-information-architecture.md:102-118`
- `docs/12-api-specification.md:252-269`
- `docs/15-ux-recommendations.md:39-40`
- `docs/16-mvp-scope.md:87-90`

**Recommended fix:** Decide whether search is truly MVP. If yes, define it narrowly: authenticated-only, exact/contains name search over existing catalog, no ranking beyond deterministic sort, no "trending", no location, no recommendations, no empty-query discovery mode.

**Acceptance criteria:**

- Search is either removed from MVP or fully specified.
- API requires bounded pagination and deterministic sort.
- Search test cases prove no location, popularity, recommendation, or anonymous discovery behavior.

#### H-05: Rating aggregate strategy is not implementation-safe

**Issue:** The database design says cached `average_rating` and `rating_count` may be used and must be maintained transactionally, but it does not specify whether to recalculate, lock, use triggers, store rating sum, or handle concurrent creates/edits.

**Why it matters:** Community ratings are user-facing and easy to corrupt under concurrent rating writes. "Recalculate or adjust" is not a design.

**Affected documents:**

- `docs/04-non-functional-requirements.md:13`, `docs/04-non-functional-requirements.md:20-21`
- `docs/05-business-rules.md:52-61`
- `docs/10-database-design.md:52-64`, `docs/10-database-design.md:126-156`, `docs/10-database-design.md:207`
- `docs/19-qa-strategy.md:76-78`, `docs/19-qa-strategy.md:102`

**Recommended fix:** Pick one aggregate strategy. Recommended MVP: authoritative `ratings` table plus transactional recalculation for one place after rating create/edit, inside the same transaction, with database locking or isolation expectations documented.

**Acceptance criteria:**

- Aggregate update algorithm is specified.
- Rounding/display precision is specified separately from stored precision.
- Concurrent rating create/edit test exists.
- Constraint states `average_rating IS NULL` iff `rating_count = 0`, if cached columns remain.

#### H-06: API contracts are too vague for implementation

**Issue:** Many endpoints list only bullets, not response schemas, pagination metadata, sorting, permission flags, full error payloads, idempotency behavior, or exact auth failure semantics.

**Why it matters:** Frontend, backend, and QA will interpret the same API differently. The result will be rework and inconsistent UX.

**Affected documents:**

- `docs/12-api-specification.md:1-440`
- `docs/20-requirement-traceability-matrix.md:9-64`

**Recommended fix:** Convert API bullets into contract-grade endpoint definitions: request schema, response schema, status codes, pagination meta, sorting, auth/permission failure behavior, and idempotency decisions.

**Acceptance criteria:**

- Every MVP endpoint has request and response examples.
- Pagination shape is defined once and reused.
- Error codes are endpoint-specific where needed.
- Duplicate add-to-list is either explicitly idempotent or explicitly conflict, not both.

#### H-07: Add-to-list flow is ambiguous

**Issue:** The user flow says users may select "one or more target lists, or one target list depending on UI pattern." The API only adds a place to one list per request.

**Why it matters:** This affects UI design, API shape, validation, transaction semantics, duplicate handling, and QA. The team should not discover this during implementation.

**Affected documents:**

- `docs/07-user-flows.md:84-90`
- `docs/12-api-specification.md:190-233`
- `docs/15-ux-recommendations.md:24-28`

**Recommended fix:** Choose one MVP behavior. Recommended: single target list per add action for simpler UI and API. Multi-list add can be future.

**Acceptance criteria:**

- User flow says exactly one target list or explicitly defines multi-list.
- API matches the flow.
- QA covers the selected behavior only.

#### H-08: Shareable public list URL is leaking into MVP scope

**Issue:** `Shareable public list URL` appears as an MVP could-have while public lists are authenticated-only and the product is not a social/discovery platform.

**Why it matters:** Shareable URLs invite anonymous access assumptions, link previews, indexing, public profile concerns, and social mechanics. This is not a harmless UI nicety.

**Affected documents:**

- `docs/16-mvp-scope.md:95-103`
- `docs/17-future-roadmap.md:40-43`
- `docs/12-api-specification.md:415-430`

**Recommended fix:** Remove shareable public list URL from MVP could-haves. Keep authenticated public list viewing only. Put share links in future roadmap with explicit auth-gated semantics.

**Acceptance criteria:**

- MVP scope contains no shareable public URL item.
- Public list access remains authenticated-only.
- Future roadmap states share links require authentication unless product strategy changes.

#### H-09: QA strategy misses key risk tests

**Issue:** QA covers broad areas, but it lacks explicit tests for guest denial on public lists, rating notes privacy, add-tried-place rejection as a hard invariant, aggregate concurrency, search boundaries, and absence of out-of-scope API fields.

**Why it matters:** The highest-risk defects will pass the current QA plan because they are not named as test cases.

**Affected documents:**

- `docs/19-qa-strategy.md:22-40`, `docs/19-qa-strategy.md:95-103`, `docs/19-qa-strategy.md:131-140`
- `docs/20-requirement-traceability-matrix.md:9-64`

**Recommended fix:** Add named test cases for every critical invariant and privacy rule. Do not rely on generic "permission tests" or "aggregate tests."

**Acceptance criteria:**

- QA has test IDs for public-auth-only, private-list denial, notes privacy, tried-place re-add rejection, aggregate concurrency, search no-discovery, and out-of-scope field absence.
- Release gates reference those tests directly.

#### H-10: Requirement traceability is not proof-grade

**Issue:** The RTM maps requirements to broad labels like "Permission tests" and "Aggregate tests", not concrete test IDs or acceptance checks.

**Why it matters:** The RTM claims it proves completeness, but it does not. It is a checklist, not traceability.

**Affected documents:**

- `docs/20-requirement-traceability-matrix.md:3-64`, `docs/20-requirement-traceability-matrix.md:124-131`
- `docs/19-qa-strategy.md:95-103`

**Recommended fix:** Replace generic QA labels with concrete test IDs from the QA strategy.

**Acceptance criteria:**

- Every Must requirement maps to at least one named test case.
- Every critical business rule maps to at least one named positive and negative test where applicable.
- RTM can be used as a release checklist without interpretation.

### Medium

#### M-01: Place detail is half-designed

**Issue:** API and RTM include place detail, but the screen inventory does not define a place detail screen. Profile says "if place detail exists in MVP UI."

**Why it matters:** Frontend cannot know whether place detail is a real MVP screen or only an API helper.

**Affected documents:**

- `docs/03-functional-requirements.md:66`
- `docs/08-screen-inventory.md:242-243`
- `docs/12-api-specification.md:293-304`
- `docs/20-requirement-traceability-matrix.md:35`

**Recommended fix:** Decide whether place detail is UI scope. If not, call it an API-only resource and remove screen references.

**Acceptance criteria:**

- Screen inventory and API spec agree.
- Navigation/user flows do not reference non-existent screens.

#### M-02: Duplicate rating create behavior conflicts

**Issue:** `FR-083` allows duplicate rating create attempts to be "rejected or converted to edit", while API state conflicts specify `409 RATING_ALREADY_EXISTS`.

**Why it matters:** Backend and frontend behavior will diverge if one side implements upsert and the other expects conflict.

**Affected documents:**

- `docs/03-functional-requirements.md:94`
- `docs/12-api-specification.md:323-329`, `docs/12-api-specification.md:438`

**Recommended fix:** Choose one. Recommended: create returns `409 RATING_ALREADY_EXISTS`; edit uses `PATCH`.

**Acceptance criteria:**

- Requirements, API, and QA all specify the same duplicate-create behavior.

#### M-03: Average rating formatting is undefined

**Issue:** Average rating is required everywhere, but there is no decision on decimal precision, rounding, or display for values like 8.3333.

**Why it matters:** API, database, UI, and tests will disagree on expected values.

**Affected documents:**

- `docs/03-functional-requirements.md:114-116`
- `docs/10-database-design.md:52-64`
- `docs/12-api-specification.md:70-71`
- `docs/15-ux-recommendations.md:33-36`

**Recommended fix:** Define stored precision and UI display precision. Example: store decimal with enough precision, return numeric average rounded to 2 decimals, display 1 decimal.

**Acceptance criteria:**

- API response precision is specified.
- UI display format is specified.
- QA includes average calculation and rounding examples.

#### M-04: Duplicate list names are unresolved

**Issue:** Database design recommends an optional unique index on `normalized_list_name`, but the table does not include that column and product rules never decide whether duplicate list names per user are allowed.

**Why it matters:** It affects UX, validation, schema, and QA. Optional indexes are not a production design.

**Affected documents:**

- `docs/10-database-design.md:66-83`
- `docs/14-edge-cases.md:20`

**Recommended fix:** Decide explicitly. Recommended MVP: allow duplicate list names if the original requirements do not prohibit them, and remove the optional index recommendation.

**Acceptance criteria:**

- Requirements state duplicate list names are allowed or rejected.
- Database design matches the decision.
- Validation rules and QA match the decision.

#### M-05: Place name normalization is too thin

**Issue:** Normalization covers trim, lowercase, and repeated spaces, but not punctuation, apostrophes, accents, Unicode case-folding, or visually similar names.

**Why it matters:** The package promises unique place names, but real input will create near-duplicates that users experience as duplicates.

**Affected documents:**

- `docs/05-business-rules.md:12-14`
- `docs/10-database-design.md:48-60`, `docs/10-database-design.md:204-205`
- `docs/13-validation-rules.md:25-36`

**Recommended fix:** Either accept the limited normalization explicitly or expand it. At minimum, document that MVP uniqueness is normalized exact-name uniqueness, not fuzzy duplicate detection.

**Acceptance criteria:**

- Normalization examples include punctuation/case/Unicode decision.
- QA fixtures include at least one punctuation or apostrophe case.

#### M-06: Profile content is duplicative and underspecified

**Issue:** My Profile must show both "User ratings" and "Tried places", but these are the same underlying ratings unless the design defines a distinction.

**Why it matters:** The UI may duplicate rows or create two inconsistent lists.

**Affected documents:**

- `docs/02-product-scope.md:96-103`
- `docs/03-functional-requirements.md:100-108`
- `docs/08-screen-inventory.md:228-243`
- `docs/12-api-specification.md:391-411`

**Recommended fix:** Define the profile layout: one tried places list with the user's rating and notes, or two clearly distinct sections.

**Acceptance criteria:**

- Profile screen inventory defines exactly what appears once.
- API endpoints either remain separate for backend convenience or are consolidated, but frontend behavior is clear.

#### M-07: Performance targets are not testable

**Issue:** NFR says P95 under 500 ms under "expected MVP load", but expected load and dataset size are not defined.

**Why it matters:** QA cannot pass or fail the NFR.

**Affected documents:**

- `docs/04-non-functional-requirements.md:9-13`
- `docs/19-qa-strategy.md:105-113`

**Recommended fix:** Define MVP load assumptions: users, places, lists per user, ratings per place, and concurrent requests.

**Acceptance criteria:**

- NFR includes test data volume and concurrency assumptions.
- QA performance smoke test references those assumptions.

#### M-08: Account deletion and data retention are punted

**Issue:** Database design says deleting a user is not part of MVP and requires policy later, but the product claims production readiness and uses authenticated accounts.

**Why it matters:** Even if user deletion UI is out of scope, production account systems need a stance on deactivation, retained ratings, and list ownership.

**Affected documents:**

- `docs/10-database-design.md:160-166`
- `docs/04-non-functional-requirements.md:27-30`

**Recommended fix:** Add a minimal MVP policy: no self-service deletion in MVP, operational deletion handled by support with defined cascading/anonymization behavior.

**Acceptance criteria:**

- Data retention stance exists.
- User deletion is not left to ad hoc database work.

#### M-09: Notes null vs empty string is unresolved

**Issue:** Notes may be null or empty, and edge cases say save as null or empty according to storage convention, but no convention is selected.

**Why it matters:** API comparisons, UI display, and tests become inconsistent.

**Affected documents:**

- `docs/05-business-rules.md:49`
- `docs/13-validation-rules.md:66-67`
- `docs/14-edge-cases.md:50`

**Recommended fix:** Normalize blank notes to null.

**Acceptance criteria:**

- Validation rules define blank notes normalization.
- API examples include null notes.
- QA tests blank notes behavior.

#### M-10: Public list owner data is not decided

**Issue:** Public list API says no private owner data beyond approved display fields, but approved display fields are not defined.

**Why it matters:** Public list UX may need an owner label, but exposing email or profile data would be a privacy defect.

**Affected documents:**

- `docs/04-non-functional-requirements.md:30`
- `docs/12-api-specification.md:426-430`
- `docs/15-ux-recommendations.md:61-68`

**Recommended fix:** Define public owner payload. Recommended: owner display name only, no email, no profile metadata.

**Acceptance criteria:**

- Public list response schema names owner fields.
- QA verifies no email or private fields are returned.

### Low

#### L-01: Wording still says "other users" where it should say "authenticated users"

**Issue:** Several sections use generic wording like "other users" for public lists.

**Why it matters:** It is not fatal if API is fixed, but it keeps ambiguity alive.

**Affected documents:**

- `docs/01-executive-summary.md:31-39`
- `docs/02-product-scope.md:106-115`
- `docs/03-functional-requirements.md:45-47`
- `docs/08-screen-inventory.md:251-265`

**Recommended fix:** Replace with "other authenticated users" throughout MVP docs.

**Acceptance criteria:**

- No MVP public-list requirement can be read as anonymous access.

#### L-02: Future roadmap contains risky social/discovery-adjacent items without decision gates

**Issue:** Public profile pages, copying links, and duplicate public lists are plausible later features, but they need guardrails.

**Why it matters:** Roadmaps often become assumed scope.

**Affected documents:**

- `docs/17-future-roadmap.md:40-43`

**Recommended fix:** Add decision gates for privacy, abuse, and discovery risk before these features can move into scope.

**Acceptance criteria:**

- Roadmap items that increase sharing have explicit prerequisites.

#### L-03: QA severity table is generic

**Issue:** Defect severities are generic and do not map enough examples to this product's rules.

**Why it matters:** Triage will be inconsistent.

**Affected documents:**

- `docs/19-qa-strategy.md:143-149`

**Recommended fix:** Add product-specific examples for public auth leak, notes leak, tried-place re-add, duplicate place, and wrong aggregate.

**Acceptance criteria:**

- QA severity examples cover top business rules.

#### L-04: Some acceptance criteria allow implementation escape hatches

**Issue:** Phrases like "if supported", "may", "could", and "or treated as" appear in requirements and API.

**Why it matters:** Optional language in a contract creates inconsistent implementations.

**Affected documents:**

- `docs/03-functional-requirements.md:55`, `docs/03-functional-requirements.md:94`
- `docs/08-screen-inventory.md:265`
- `docs/12-api-specification.md:437`

**Recommended fix:** Replace alternatives with single decisions before Sprint 1.

**Acceptance criteria:**

- MVP requirements do not contain ambiguous alternatives for core flows.

## 3. Missing Decisions List

1. Auth provider and session strategy.
2. Whether public lists are only available through authenticated routes everywhere.
3. Exact public list owner fields.
4. Whether place detail is a real screen or API-only.
5. Whether place records are immutable in MVP.
6. Operational correction path for bad place records.
7. Whether tried places can ever be re-added to lists. Current answer should be no, but docs weaken it.
8. Whether Add To List selects one list or multiple lists.
9. Duplicate add-to-list behavior: idempotent success or conflict.
10. Duplicate rating create behavior: conflict or upsert/edit.
11. Rating notes visibility and privacy.
12. Blank notes storage: null or empty string.
13. Average rating rounding and precision.
14. Aggregate update algorithm and concurrency handling.
15. Search inclusion in MVP.
16. Search matching behavior, sort order, and empty-query behavior.
17. Duplicate list names per user.
18. Public share URL inclusion or exclusion from MVP.
19. Minimal account deletion/deactivation policy.
20. Expected load for performance testing.

## 4. Contradictions List

1. Public lists are authenticated-only in roles/API, but requirements and flows use generic "other users" and "viewer" language.
2. Guests cannot view MVP data in roles, but `/api/v1/lists/{listId}` says auth is conditional.
3. `FR-051` mentions editing places, but no edit place endpoint, permission, or screen exists.
4. `FR-083` says duplicate rating create can be rejected or converted to edit; API says conflict.
5. Add-to-list flow allows one or more target lists; API supports one list per request.
6. RTM maps `FR-051` to "place update if supported", but `FR-051` is marked Must.
7. MVP says public lists are authenticated-only, but "shareable public list URL" appears as an MVP could-have.
8. Lists are defined as want-to-try lists, but preventing tried-place re-add is only Should.
9. Place detail is an API and RTM object, but screen inventory treats it as optional.
10. Database recommends a unique index on `normalized_list_name`, but the table does not define that column.

## 5. Implementation Blockers

1. Auth strategy is not decided.
2. Public list auth behavior is inconsistent.
3. Rating notes privacy is undefined.
4. Tried-place re-add rule is not mandatory.
5. Place editing/correction model is undefined.
6. Aggregate update strategy is not specific enough.
7. API contracts are not detailed enough for frontend/backend parallel work.
8. Add-to-list behavior is not decided.
9. Search scope is not decided.
10. QA traceability does not prove the critical rules.

## 6. QA Risk List

1. Guest can access public list because "public" is interpreted as anonymous.
2. User B can see User A's rating notes through public list, place detail, or profile endpoint.
3. User can rate a place and then add it back to a wishlist list.
4. Concurrent ratings corrupt average rating or rating count.
5. Duplicate place names slip through with punctuation, Unicode, or whitespace variants.
6. Duplicate rating create behaves differently across API and UI.
7. Search becomes broad discovery because no empty-query and sorting rules exist.
8. Public list response leaks owner email or private profile data.
9. Place edit behavior is accidentally implemented without authorization.
10. QA signs off using generic test labels that do not exercise the actual business rules.

## 7. Final Readiness Score

**5.5 / 10**

The package has enough structure to discuss the product, but not enough precision to start implementation safely. The critical business rules are recognizable, but the contracts are not tight enough.

## 8. Clear Recommendation

**Ready only after fixes.**

Minimum fixes before Sprint 0 planning can be trusted:

1. Make tried-place re-add prevention a Must.
2. Define rating notes privacy.
3. Normalize public-list language to authenticated-only across all docs.
4. Remove or fully specify place editing.
5. Decide auth strategy.
6. Decide search scope or remove search from MVP.
7. Make API contracts implementation-grade.
8. Replace generic RTM QA labels with concrete test IDs.
