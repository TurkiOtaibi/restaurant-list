# 20. Requirement Traceability Matrix

## Traceability Overview

This RTM maps every Must functional requirement to business rules, API/screen coverage, concrete QA test case IDs, acceptance criteria, and validation scenarios.

## Functional Requirement Traceability

| Requirement | Business Rules | API / Screen Evidence | Test Case IDs | Acceptance Criteria | Validation Scenario |
| --- | --- | --- | --- | --- | --- |
| FR-001 Register | BR-001 | Register screen, `POST /auth/register` | AUTH-001 | User account and tokens returned. | Submit valid registration. |
| FR-002 Login | BR-001, BR-002 | Login screen, `POST /auth/login` | AUTH-002 | Tokens returned for valid credentials. | Submit valid login. |
| FR-003 Refresh token | BR-002, BR-003 | `POST /auth/refresh` | AUTH-003 | New access token issued. | Submit valid refresh token. |
| FR-004 Logout | BR-003 | `POST /auth/logout` | AUTH-004 | Refresh token revoked safely. | Logout twice and verify idempotent result. |
| FR-005 No social login | BR-004 | Auth screens and unsupported endpoints | AUTH-005, SCOPE-001 | No social login options exist. | Inspect UI/API. |
| FR-006 Current user identity | BR-005, BR-070 | All `/api/v1` endpoints | AUTH-006 | Access token determines user. | User A cannot access User B owned data. |
| FR-007 Guest rejection | BR-005, BR-070 | All `/api/v1` endpoints | AUTH-006 | Guest requests rejected. | Request resources without token. |
| FR-010 Main navigation | N/A | Navigation shell | NAV-001 | Four required nav items route correctly. | UI navigation test. |
| FR-011 Session navigation | BR-002 | Navigation shell, `/api/v1/me` | AUTH-002, NAV-001 | Session remains active while token valid. | Login and navigate sections. |
| FR-020 Create list | BR-020, BR-021, BR-023 | Create List, `POST /lists` | LIST-001 | List saved with name/visibility. | Create public/private lists. |
| FR-021 Duplicate list names | BR-022 | Create List, database | LIST-002 | Duplicate list names allowed. | Create same name twice. |
| FR-022 Edit list | BR-026 | Edit List, `PATCH /lists/{id}` | LIST-003 | Owned list updates. | Update name/visibility. |
| FR-023 Delete list | BR-026 | List Detail, `DELETE /lists/{id}` | LIST-004 | List removed; places/ratings remain. | Delete list with place/rating data. |
| FR-024 Display owned lists | BR-020 | My Lists, `GET /lists` | LIST-005 | Current user's lists only. | Compare User A/User B data. |
| FR-025 List detail | BR-024, BR-025 | List Detail, `GET /lists/{id}` | LIST-006, LIST-008, LIST-010 | Metadata, permissions, places shown. | Open owned/public/private lists. |
| FR-026 Remove place | BR-026 | List Detail, `DELETE /lists/{id}/places/{placeId}` | LIST-007, ADD-003 | Membership removed only. | Remove place from owned list. |
| FR-027 Non-owner list protection | BR-026, BR-073 | Protected list endpoints | LIST-007 | Non-owner writes rejected. | User B attempts User A list writes. |
| FR-030 Visibility | BR-023 | Create/Edit List | LIST-001, LIST-003 | Public/private saved. | Create and update visibility. |
| FR-031 Authenticated public view | BR-024, BR-074 | Public List View, `GET /public/lists/{id}` | LIST-008 | Auth non-owner read-only view. | User B opens User A public list. |
| FR-032 Guest public rejection | BR-005, BR-070 | Public List View | LIST-009, AUTH-006 | Guest receives `401`. | Guest opens public list. |
| FR-033 Private list protection | BR-025, BR-075 | List endpoints | LIST-010 | Non-owner cannot view private list. | User B opens User A private list. |
| FR-034 Public owner data | BR-076 | Public List API | LIST-011 | Display name only; no email. | Inspect public list payload. |
| FR-040 Add one existing place | BR-026, BR-029 | Add Existing Place, `POST /lists/{id}/places` | ADD-001 | One place added to one list. | Submit one place/list and multi-list rejection. |
| FR-041 Create place while adding | BR-010 to BR-014 | Create New Place | ADD-002, PLACE-001, PLACE-002 | Place and membership created. | Create place from list context. |
| FR-042 Duplicate add idempotent | BR-027, BR-028 | Add To List API | ADD-003 | Success with one membership. | Add same place twice. |
| FR-043 Re-add tried place | BR-032 to BR-035 | Add To List, Tried indicator | ADD-004, RATING-007, RATING-009 | Tried status preserved; no second rating. | Rate, re-add, update rating. |
| FR-044 Same place multiple lists | BR-029 | Add To List API | ADD-005 | Same place appears in multiple owned lists. | Add through separate actions. |
| FR-050 Create place | BR-010, BR-011 | Create Place, `POST /places` | PLACE-001 | Valid restaurant/cafe created. | Submit valid and invalid place data. |
| FR-051 Optional description | BR-014 | Create Place | PLACE-002 | Description optional. | Create with/without description. |
| FR-052 Unique place names | BR-012, BR-013 | Database unique index | PLACE-003 | Duplicate normalized name rejected. | Case/space duplicate. |
| FR-053 No place editing | BR-015, BR-016 | Unsupported endpoints, UI | PLACE-004, SCOPE-001 | No edit UI/API. | Inspect routes and UI. |
| FR-054 Place detail | BR-050 to BR-054, BR-044 | Place Detail, `GET /places/{id}` | PLACE-005, RATING-008 | Detail fields returned; note privacy enforced. | Open detail as owner and other user. |
| FR-055 List places by type | BR-010 | Restaurants/Cafes, `GET /places?type=` | PLACE-006 | Type filter correct. | Verify restaurant/cafe pages. |
| FR-056 Place-name search | BR-060 to BR-063 | Search UI/API | SEARCH-001, SEARCH-002, SEARCH-003 | Name-only deterministic search. | Search by name and reject discovery params. |
| FR-060 Restaurants page | BR-010 | Restaurants | REST-001, PLACE-006 | Only restaurants shown. | Seed both types and verify. |
| FR-061 Restaurant row data | BR-050 to BR-054 | Restaurants | REST-001, AGG-003, RATING-009 | Name, avg, count, Tried indicator. | Verify row rendering. |
| FR-062 Restaurant Add To List | BR-029 | Restaurants | ADD-001, ADD-003 | Add to one owned list. | Add restaurant to list. |
| FR-063 Restaurant Mark/Edit Rating | BR-040 to BR-048 | Restaurants | RATING-001 to RATING-009 | Correct rating action by state. | Rate and edit restaurant. |
| FR-070 Cafes page | BR-010 | Cafes | CAFE-001, PLACE-006 | Only cafes shown. | Seed both types and verify. |
| FR-071 Cafe row data | BR-050 to BR-054 | Cafes | CAFE-001, AGG-003, RATING-009 | Name, avg, count, Tried indicator. | Verify row rendering. |
| FR-072 Cafe Add To List | BR-029 | Cafes | ADD-001, ADD-003 | Add to one owned list. | Add cafe to list. |
| FR-073 Cafe Mark/Edit Rating | BR-040 to BR-048 | Cafes | RATING-001 to RATING-009 | Correct rating action by state. | Rate and edit cafe. |
| FR-080 Rating required | BR-040 | Rating form/API | RATING-001 | Missing rating rejected. | Submit without rating. |
| FR-081 Rating 1 to 10 | BR-041 | Rating form/API | RATING-002 | Invalid values rejected. | Submit 0/11/decimal/text. |
| FR-082 Optional notes | BR-042 | Rating form/API | RATING-003 | Rating can save without notes. | Submit null/blank notes. |
| FR-083 Blank notes null | BR-043 | Rating API/database | RATING-003 | Blank notes stored as null. | Submit whitespace notes. |
| FR-084 One rating per place/user | BR-046 | Rating unique index | RATING-004 | One row per user/place. | Submit rating twice. |
| FR-085 Rating upsert | BR-047, BR-048 | `POST /places/{id}/rating` | RATING-005 | Second submission updates existing. | Compare row before/after. |
| FR-086 First rating cleanup | BR-031 | Rating transaction | RATING-006 | Removed from all user lists. | Add to multiple lists then rate. |
| FR-087 Update preserves lists | BR-035 | Rating update | RATING-007 | Re-added membership remains. | Re-add then update rating. |
| FR-088 Notes privacy | BR-044, BR-045, BR-072 | Place/public/profile APIs | RATING-008 | Other users cannot see notes. | User B checks User A notes surfaces. |
| FR-089 Tried places in profile | BR-030 | My Profile | PROFILE-002 | Rated places appear. | Rate place and open profile. |
| FR-090 Tried indicators | BR-033 | All place surfaces | RATING-009 | Tried indicator appears. | Verify list/restaurant/cafe/detail/profile. |
| FR-100 Lists count | BR-020 | Profile | PROFILE-001 | Count matches owned lists. | Compare DB/API count. |
| FR-101 Restaurants tried count | BR-030 | Profile | PROFILE-001 | Count matches restaurant ratings. | Rate restaurants and verify. |
| FR-102 Cafes tried count | BR-030 | Profile | PROFILE-001 | Count matches cafe ratings. | Rate cafes and verify. |
| FR-103 Tried places with rating/notes | BR-044 | Profile | PROFILE-002, RATING-008 | Current user's notes shown only to owner. | Verify profile rows. |
| FR-104 Edit rating from profile | BR-047, BR-048 | Profile | PROFILE-003, RATING-005 | Existing rating updates. | Edit from profile. |
| FR-110 Average rating | BR-050 | Place/list rows | AGG-001 | Arithmetic average from ratings table. | Two-user rating test. |
| FR-111 Rating count | BR-051 | Place/list rows | AGG-002 | Count equals rating rows. | Create/update ratings. |
| FR-112 One decimal display | BR-053 | Place/list rows | AGG-003 | 8.333 displays as 8.3. | Seed ratings and verify. |
| FR-113 Unrated state | BR-054 | Place/list rows | AGG-004 | Null average/count 0. | View unrated place. |
| FR-114 Aggregates from ratings table | BR-052 | Data/query design | AGG-001, AGG-002 | No cached aggregate dependency. | Verify calculation source. |
| FR-120 Validation messages | All validation rules | Forms/APIs | API-003 | Clear field errors. | Trigger invalid input. |
| FR-121 Duplicate-place message | BR-012, BR-013 | Create Place | PLACE-003, API-003 | Duplicate conflict shown. | Duplicate create. |
| FR-122 Permission messaging | BR-070 to BR-076 | Protected views/APIs | LIST-007 to LIST-011, API-003 | Unauthorized data not exposed. | Access denied scenarios. |
| FR-123 Confirm delete | BR-026 | List delete UI | LIST-004 | Destructive delete confirmed. | Attempt delete and confirm/cancel. |

## Non-Functional Requirement Traceability

| Requirement | Design Evidence | Test Case IDs |
| --- | --- | --- |
| NFR-001 Performance target | MVP load assumptions in NFR | API-001 plus performance smoke test |
| NFR-002 Pagination | API pagination contract | API-001 |
| NFR-003 Aggregate correctness | Ratings-table aggregate design | AGG-001, AGG-002, AGG-003 |
| NFR-010 Production deployment readiness | Sprint release hardening | Release checklist |
| NFR-011 Transactional operations | First-rating transaction design | RATING-006 |
| NFR-012 Partial write protection | FK constraints and transaction design | RATING-006, LIST-004 |
| NFR-020 Authorization | Role and permission model | LIST-007 to LIST-011, AUTH-006 |
| NFR-021 Secure credentials | Email/password and refresh-token design | AUTH-001 to AUTH-004 |
| NFR-022 Private data protection | Notes privacy and list visibility | RATING-008, LIST-010 |
| NFR-023 Minimal public profile exposure | Public owner payload rule | LIST-011 |
| NFR-030 Unique place names | `places.normalized_name` unique index | PLACE-003 |
| NFR-031 One rating per user/place | `ratings(user_id, place_id)` unique index | RATING-004, RATING-005 |
| NFR-032 One membership per list/place | `list_places(list_id, place_id)` unique index | ADD-003 |
| NFR-033 Referential integrity | FK design | LIST-004, RATING-006 |
| NFR-040 Responsive UI | Screen inventory and UX recommendations | E2E regression |
| NFR-041 Keyboard accessibility | Accessibility recommendations | A11Y-001 |
| NFR-042 Contrast | UX accessibility recommendations | A11Y-001 |
| NFR-043 Rating accessibility | Rating UX recommendation | A11Y-001 |
| NFR-050 Centralized domain rules | Business rules and API behavior | ADD-003, RATING-005, RATING-006, RATING-007 |
| NFR-051 Versionable API | `/api/v1` specification | API-003 |
| NFR-052 Traceability | This RTM | Release gate review |
| NFR-060 Sanitized logging | Observability requirements | Security review |
| NFR-061 Core metrics | Observability requirements | Release smoke test |
| NFR-062 Failed request monitoring | Observability requirements | Monitoring check |
| NFR-070 Scalable model | Index and query design | API-001 plus performance smoke test |
| NFR-071 Avoid heavy infrastructure | Explicit exclusions | SCOPE-001 |

## Business Rule Traceability

| Business Rule Range | Covered By |
| --- | --- |
| BR-001 to BR-005 Authentication rules | AUTH-001 to AUTH-006 |
| BR-010 to BR-018 Place rules | PLACE-001 to PLACE-006, SCOPE-001 |
| BR-020 to BR-029 List rules | LIST-001 to LIST-011, ADD-001 to ADD-005 |
| BR-030 to BR-035 Tried place rules | ADD-004, RATING-006, RATING-007, RATING-009 |
| BR-040 to BR-048 Rating rules | RATING-001 to RATING-009 |
| BR-050 to BR-055 Community rating rules | AGG-001 to AGG-004 |
| BR-060 to BR-063 Search rules | SEARCH-001 to SEARCH-003 |
| BR-070 to BR-076 Permission rules | AUTH-006, LIST-007 to LIST-011, RATING-008 |

## Out-of-Scope Traceability

| Excluded Feature | Evidence It Is Excluded | Test Case |
| --- | --- | --- |
| Maps/GPS/location/neighborhoods | Scope, API unsupported endpoints, search validation | SCOPE-001, SEARCH-002 |
| Branch management | Scope and database design | SCOPE-001 |
| Social feed/following/comments/photos | Scope and API unsupported endpoints | SCOPE-001 |
| AI recommendations/trending/popularity | Search rules and API validation | SEARCH-002, SCOPE-001 |
| Notifications | Scope | SCOPE-001 |
| Admin moderation workflows | Scope and roles | SCOPE-001 |
| Google/Apple/social login | Auth requirements | AUTH-005, SCOPE-001 |
| Public share URLs | MVP scope | SCOPE-001 |
| User-facing place editing | Place rules and unsupported endpoints | PLACE-004, SCOPE-001 |

## Release Traceability Checklist

- Every Must functional requirement maps to at least one test case ID.
- Every critical business rule maps to a validation scenario.
- Every owner-only action has an authorization test.
- Public list behavior includes guest rejection and authenticated read-only access.
- Rating notes privacy is tested across public list, place detail, search, and profile surfaces.
- Rating upsert and first-rating cleanup are tested separately.
- Tried place re-add behavior is tested.
- Search no-discovery boundaries are tested.
- Out-of-scope exclusions are tested.
