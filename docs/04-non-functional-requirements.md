# 4. Non-Functional Requirements

## Requirement Conventions

Non-functional requirements use the prefix `NFR`.

## Performance

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-001 | Main navigation pages should load quickly for MVP load. | P95 server response under 500 ms with 10,000 users, 25,000 places, 250,000 list items, 100,000 ratings, and 50 concurrent requests. |
| NFR-002 | Place listing pages should support pagination. | API returns bounded result sets with page size limits. |
| NFR-003 | Community rating aggregates should be correct and simple for MVP. | Average rating and rating count are calculated from the ratings table using indexed rating queries. |

## Availability and Reliability

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-010 | The application should be deployable as a reliable production MVP. | Supports repeatable deployment, configuration management, and health checks. |
| NFR-011 | Data-changing operations should be transactional where business invariants span multiple tables. | First rating creation and removal from user lists succeed or fail as one operation. |
| NFR-012 | The system should protect against partial writes during failures. | No rating exists without required place and user references. No orphan list memberships remain after list deletion. |

## Security and Privacy

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-020 | User-owned resources must be protected by authorization checks. | Private lists and owner-only write operations cannot be accessed by other users. |
| NFR-021 | Authentication credentials and session tokens must be stored securely. | Passwords are hashed; refresh tokens are stored as hashes; JWT access tokens are short-lived. |
| NFR-022 | Private list data must not leak through search, public endpoints, or error details. | Unauthorized users cannot infer private list content. |
| NFR-023 | API responses should expose only required user profile data. | Public list views may expose owner display name only; email and rating notes are never exposed to other users. |

## Data Integrity

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-030 | The database must enforce unique place names. | Trimmed, lowercased, whitespace-normalized unique index. |
| NFR-031 | The database must enforce one rating per user per place. | Unique index on user and place rating pair. |
| NFR-032 | The database must enforce one membership per list and place. | Unique index on list and place pair. |
| NFR-033 | The database must use referential integrity for users, lists, places, ratings, and list memberships. | Foreign keys with explicit delete behavior. |

## Usability and Accessibility

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-040 | The MVP should be usable on desktop and mobile viewports. | Responsive layouts for all primary screens. |
| NFR-041 | Interactive controls should be keyboard accessible. | Lists, forms, modals, and rating controls can be operated by keyboard. |
| NFR-042 | UI should meet WCAG 2.1 AA contrast guidance for text and controls. | Colors and states satisfy contrast requirements. |
| NFR-043 | Rating selection should be understandable without relying on color alone. | Numeric labels are visible and screen-reader friendly. |

## Maintainability

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-050 | Product rules should be centralized in service/domain logic. | First-rating list removal, rating upsert, tried indicator, and idempotent list add behavior are not duplicated across clients. |
| NFR-051 | API contracts should be versionable. | MVP APIs use a stable prefix such as `/api/v1`. |
| NFR-052 | Requirements should be traceable to test cases. | Requirement Traceability Matrix maps requirements to tests. |

## Observability

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-060 | The system should log operational errors without exposing private user data. | Logs include request IDs and sanitized error context. |
| NFR-061 | The system should expose basic metrics for core actions. | Counts for list created, place added, rating created, rating updated, duplicate place rejected, guest access rejected. |
| NFR-062 | The system should support monitoring of failed API requests. | Error rate and latency can be observed in production. |

## Scalability

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-070 | Data model should support growth in users, lists, places, and ratings without redesign. | Indexed queries support type filters, owner filters, and aggregate reads. |
| NFR-071 | MVP should avoid features that require heavy content moderation or geospatial infrastructure. | Maps, comments, photos, and social feed remain out of scope. |
