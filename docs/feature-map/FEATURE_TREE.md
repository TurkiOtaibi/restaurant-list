# سجل - Feature Tree

Updated: 2026-06-24

```text
سجل
├── Authentication & Account Access
│   ├── Register
│   │   ├── Enter display name
│   │   ├── Enter email
│   │   ├── Enter password
│   │   ├── Create user
│   │   └── Start session
│   ├── Login
│   ├── Refresh token
│   ├── Logout
│   ├── Guest denial
│   └── No social login
├── قوائمي / Lists
│   ├── My Lists
│   │   ├── View owned lists
│   │   ├── View list count
│   │   ├── View total place count
│   │   └── Open list detail
│   ├── Create List
│   │   ├── Enter name
│   │   ├── Select private/public visibility
│   │   └── Save
│   ├── Edit List
│   │   ├── Rename
│   │   └── Change visibility
│   ├── Delete List
│   │   ├── Confirm
│   │   └── Delete memberships only
│   ├── List Detail
│   │   ├── View metadata
│   │   ├── View places
│   │   ├── Open place detail
│   │   └── Remove place
│   └── Add Place To List
│       ├── Search server-side catalog
│       ├── Select one place
│       ├── Add to one list
│       ├── Prevent duplicate item rows
│       └── Return idempotent success for duplicate add
├── Public Lists
│   ├── Browse public lists
│   ├── Show owner display name
│   ├── Hide owner email
│   ├── Hide owner user id in public responses
│   ├── Open public list detail
│   ├── Read-only non-owner view
│   ├── Reject guests
│   └── Deny private lists to non-owners
├── الأماكن / Places
│   ├── Browse Places
│   │   ├── View compact list
│   │   ├── Filter restaurants
│   │   ├── Filter cafes
│   │   ├── Filter ice cream
│   │   ├── Filter restaurant subtype
│   │   ├── Filter cafe subtype
│   │   ├── Search by name
│   │   ├── Sort by rating desc
│   │   └── Open place detail
│   ├── Create Place
│   │   ├── Create restaurant
│   │   ├── Require restaurant subtype
│   │   ├── Create cafe
│   │   ├── Require cafe subtype
│   │   ├── Create ice cream
│   │   ├── Reject ice cream subtype
│   │   └── Reject duplicate normalized name
│   ├── Place Detail
│   │   ├── View name/type/subtype
│   │   ├── View community rating
│   │   ├── View current-user list membership
│   │   ├── Add to list
│   │   └── Rate place
│   └── Compatibility Routes
│       ├── /restaurants redirects to /places?type=restaurant
│       └── /cafes redirects to /places?type=cafe
├── Ratings
│   ├── Create rating
│   │   ├── 1-10 scale
│   │   ├── 0.5 increments
│   │   ├── Optional private note
│   │   ├── Blank note stored null
│   │   ├── First POST returns 201
│   │   └── Repeated POST update returns 200
│   ├── Edit rating
│   ├── Enforce one rating per user/place
│   ├── Derive tried status
│   ├── Remove place from all user lists after first rating
│   ├── Preserve later re-adds on rating update
│   └── Calculate average/count from ratings table
├── صفحتي / Profile Archive
│   ├── View list count
│   ├── View tried restaurant count
│   ├── View tried cafe count
│   ├── View tried ice cream count
│   ├── View ratings created count
│   ├── View تقييماتك
│   │   ├── Place
│   │   ├── Rating
│   │   ├── Private note
│   │   └── Edit rating
│   └── View own public-list summary
├── Responsive / Accessibility
│   ├── RTL-native layout
│   ├── Mixed Arabic/English bidi isolation
│   ├── Western numerals
│   ├── Mobile safe areas
│   ├── 200% zoom test coverage
│   ├── Focus trap/restoration
│   ├── Keyboard rating control
│   └── Contrast/touch target checks
├── System / Operations
│   ├── /api/v1 API prefix
│   ├── Collection envelope
│   │   ├── data
│   │   └── meta limit/offset/total/sort
│   ├── Structured errors
│   ├── Backend health live/ready
│   ├── Frontend health
│   ├── Alembic migrations
│   └── Production config safeguards
└── Future Roadmap Only
    ├── Anonymous public-list browsing
    ├── Admin console/API
    └── Place editing/correction workflow
```
