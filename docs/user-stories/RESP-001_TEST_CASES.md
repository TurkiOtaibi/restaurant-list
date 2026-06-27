# RESP-001 Test Cases - RTL primary nav

## Source Requirements

- Feature: `RESP-001 - RTL primary nav`
- Sources: `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`
- User stories processed: `RESP-001-US-001` through `RESP-001-US-015`
- Feature ownership: primary navigation Arabic labels, approved destination set, RTL ordering, active state, auth-screen absence, navigation semantics, keyboard operation, focus-visible state, RTL icon/label alignment, touch targets, bottom-nav clearance, safe-area support, required viewport/browser matrix, 200% zoom behavior, and RTL screen-reader order.

## Deterministic Fixtures

| Fixture ID | Exact Initial State |
|---|---|
| FX-RESP-001-AUTH-LISTS | Authenticated user `user-resp-001`; locale `ar`; document direction `rtl`; route `/lists`; no modal, menu, drawer, or sheet open; focus starts on `body`; current primary destination is `قوائمي`. |
| FX-RESP-001-AUTH-PLACES | Authenticated user `user-resp-001`; locale `ar`; document direction `rtl`; route `/places`; no modal, menu, drawer, or sheet open; focus starts on `body`; current primary destination is `الأماكن`. |
| FX-RESP-001-AUTH-PROFILE | Authenticated user `user-resp-001`; locale `ar`; document direction `rtl`; route `/profile`; no modal, menu, drawer, or sheet open; focus starts on `body`; current primary destination is `صفحتي`. |
| FX-RESP-001-AUTH-SCREENS | Guest user; locale `ar`; document direction `rtl`; routes `/login` and `/register`; no modal, menu, drawer, or sheet open; focus starts on `body`. |
| FX-RESP-001-LABELS | Approved primary labels are exactly `قوائمي`, `الأماكن`, and `صفحتي`; forbidden primary labels are `مطاعم`, `مقاهي`, `Restaurants`, and `Cafes`. |
| FX-RESP-001-FINAL-ACTIONS | `/lists` has final interactive control `resp-001-lists-final-action`; `/places` has final interactive control `resp-001-places-final-action`; `/profile` has final interactive control `resp-001-profile-final-action`. |

## Viewport Fixtures

| Viewport ID | Exact Viewport / Browser State |
|---|---|
| VP-RESP-001-MOBILE-320 | Chromium, `320x568`, zoom `100%`, RTL locale, no virtual keyboard. |
| VP-RESP-001-MOBILE-390 | Chromium, `390x844`, zoom `100%`, RTL locale, no virtual keyboard. |
| VP-RESP-001-MOBILE-430 | Chromium, `430x932`, zoom `100%`, RTL locale, no virtual keyboard. |
| VP-RESP-001-TABLET-PORTRAIT | Chromium, `768x1024`, zoom `100%`, RTL locale. |
| VP-RESP-001-TABLET-LANDSCAPE | Chromium, `1024x768`, zoom `100%`, RTL locale. |
| VP-RESP-001-DESKTOP | Chromium, `1440x900`, zoom `100%`, RTL locale. |
| VP-RESP-001-BROWSER-MATRIX | Chromium, Firefox, and WebKit at `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, and `1440x900`, zoom `100%`, RTL locale. |
| VP-RESP-001-ZOOM-200 | Chromium, `390x844`, zoom `200%`, RTL locale. |
| VP-RESP-001-SAFE-AREA | WebKit, `390x844`, iOS-like bottom safe area enabled, zoom `100%`, RTL locale. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Fixture | Viewport | Initial State | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RESP-001-TC-001 | Primary nav renders approved Arabic destinations only | UI, RTL | Critical | FX-RESP-001-AUTH-LISTS, FX-RESP-001-LABELS | VP-RESP-001-MOBILE-390 | Route `/lists`; authenticated `user-resp-001`; `dir="rtl"`; no modal/menu/drawer/sheet; focus on `body`. | Query the primary navigation landmark or semantic nav element; collect visible primary nav item text in DOM order. | Exactly three primary nav items are visible; their text values are `قوائمي`, `الأماكن`, `صفحتي`; forbidden labels `مطاعم`, `مقاهي`, `Restaurants`, and `Cafes` are absent; visible nav text contains no Unicode escape text and no replacement character. | RESP-001-US-001, RESP-001-US-002 | Yes | UI E2E |
| RESP-001-TC-002 | Primary nav is hidden on auth screens | UI | Medium | FX-RESP-001-AUTH-SCREENS, FX-RESP-001-LABELS | VP-RESP-001-MOBILE-390 and VP-RESP-001-DESKTOP | Routes `/login` and `/register`; guest user; `dir="rtl"`; focus on `body`; no modal/menu/drawer/sheet. | Open `/login`; query navigation landmarks and approved primary labels; repeat on `/register`. | For each route and viewport, no primary app navigation landmark is present and none of `قوائمي`, `الأماكن`, or `صفحتي` renders as primary navigation. | RESP-001-US-004 | Yes | UI E2E |
| RESP-001-TC-003 | Active destination state is distinct from keyboard focus | UI, Accessibility | High | FX-RESP-001-AUTH-PLACES | VP-RESP-001-MOBILE-390 | Route `/places`; current destination `الأماكن`; focus on `body`; no modal/menu/drawer/sheet. | Locate nav item `الأماكن`; press Tab until nav item `قوائمي` receives keyboard focus without activation. | `الأماكن` has the selected/current visual state; `قوائمي` has focus-visible state; the two states are applied to different items; selected state remains visible while focus is on `قوائمي`; focus indicator contrast against adjacent colors is at least `3:1`. | RESP-001-US-003, RESP-001-US-008 | Yes | UI E2E, Accessibility |
| RESP-001-TC-004 | Primary nav exposes semantic navigation and exact accessible names | Accessibility | High | FX-RESP-001-AUTH-PROFILE, FX-RESP-001-LABELS | VP-RESP-001-DESKTOP | Route `/profile`; current destination `صفحتي`; `dir="rtl"`; focus on `body`. | Inspect accessibility tree for navigation landmark or semantic nav structure; collect accessible names for primary nav items. | One primary navigation semantic region is exposed; accessible names are exactly `قوائمي`, `الأماكن`, and `صفحتي`; each accessible name matches its visible text. | RESP-001-US-005, RESP-001-US-006 | Yes | Accessibility |
| RESP-001-TC-005 | Keyboard focus order and activation cover all nav destinations | Accessibility | Critical | FX-RESP-001-AUTH-LISTS, FX-RESP-001-LABELS | VP-RESP-001-MOBILE-390 | Route `/lists`; authenticated `user-resp-001`; `dir="rtl"`; focus on `body`. | Press Tab until the first primary nav item is focused; continue Tab through all primary nav items; activate each focused item once with Enter and once with Space, resetting to `/lists` after each activation. | Keyboard focus reaches exactly the three primary nav items; focus order is `قوائمي`, `الأماكن`, `صفحتي`; Enter and Space activate the focused item without pointer input; after activation, the selected/current state moves to the activated destination. | RESP-001-US-007, RESP-001-US-015 | Yes | UI E2E, Accessibility |
| RESP-001-TC-006 | RTL icon and label alignment is measurable | UI, RTL | Medium | FX-RESP-001-AUTH-LISTS, FX-RESP-001-LABELS | VP-RESP-001-MOBILE-390 | Route `/lists`; `dir="rtl"`; no modal/menu/drawer/sheet; focus on `body`. | For each nav item, capture icon and label bounding boxes and computed direction. | Document direction is `rtl`; every nav label is fully inside its nav item hit area; icon and label bounding boxes do not overlap; inline gap between icon and label is greater than `0`; the same relative icon/label order is used for all three items. | RESP-001-US-009 | Yes | UI E2E |
| RESP-001-TC-007 | Mobile nav touch targets and final content clearance cover primary screens | Responsive, Accessibility | Critical | FX-RESP-001-AUTH-LISTS, FX-RESP-001-AUTH-PLACES, FX-RESP-001-AUTH-PROFILE, FX-RESP-001-FINAL-ACTIONS | VP-RESP-001-MOBILE-320, VP-RESP-001-MOBILE-390, VP-RESP-001-MOBILE-430 | Routes `/lists`, `/places`, and `/profile`; authenticated `user-resp-001`; `dir="rtl"`; focus on `body`; no modal/menu/drawer/sheet. | At each mobile viewport, measure each nav item hit target; scroll each route to its final interactive control; compare final control rectangle with bottom nav and viewport bounds. | Every nav item hit target is at least `44x44` CSS px; final interactive controls `resp-001-lists-final-action`, `resp-001-places-final-action`, and `resp-001-profile-final-action` are visible and not covered by bottom nav, safe-area padding, or browser UI at all three mobile viewports. | RESP-001-US-010, RESP-001-US-011 | Yes | UI E2E, Accessibility |
| RESP-001-TC-008 | Bottom nav respects iOS-like bottom safe area | Responsive | Critical | FX-RESP-001-AUTH-LISTS, FX-RESP-001-FINAL-ACTIONS | VP-RESP-001-SAFE-AREA | Route `/lists`; authenticated `user-resp-001`; `dir="rtl"`; bottom safe area enabled; focus on `body`. | Measure bottom nav rectangle, safe-area padding, viewport bottom, and final interactive control after scrolling to page end. | Bottom nav accounts for `env(safe-area-inset-bottom)` or equivalent safe-area spacing; final interactive control is above the covered bottom region; no primary nav item is clipped by the safe area. | RESP-001-US-012 | Yes | UI E2E |
| RESP-001-TC-009 | Required viewport and browser matrix keeps nav operable without overflow | Responsive | High | FX-RESP-001-AUTH-LISTS, FX-RESP-001-AUTH-PLACES, FX-RESP-001-AUTH-PROFILE | VP-RESP-001-BROWSER-MATRIX | Routes `/lists`, `/places`, and `/profile`; authenticated `user-resp-001`; `dir="rtl"`; focus on `body`; no modal/menu/drawer/sheet. | In Chromium, Firefox, and WebKit, open each route at `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, and `1440x900`; measure nav visibility and page width. | All three primary nav items are visible; each nav item can be focused by keyboard; `document.documentElement.scrollWidth <= window.innerWidth` for every route, viewport, and browser combination. | RESP-001-US-013 | Yes | UI E2E |
| RESP-001-TC-010 | Primary nav passes 200 percent zoom checks | Responsive, Accessibility | High | FX-RESP-001-AUTH-LISTS, FX-RESP-001-LABELS | VP-RESP-001-ZOOM-200 | Route `/lists`; authenticated `user-resp-001`; `dir="rtl"`; zoom `200%`; focus on `body`. | Inspect nav labels, measure hit targets, keyboard-focus each nav item, and measure horizontal overflow. | Labels `قوائمي`, `الأماكن`, and `صفحتي` remain readable; each nav item hit target is at least `44x44` CSS px; focus-visible appears on each focused nav item with at least `3:1` contrast; `document.documentElement.scrollWidth <= window.innerWidth`. | RESP-001-US-014 | Yes | UI E2E, Accessibility |
| RESP-001-TC-011 | RTL screen-reader order is exact and excludes hidden destinations | Accessibility, RTL | High | FX-RESP-001-AUTH-LISTS, FX-RESP-001-LABELS | VP-RESP-001-MOBILE-390 | Route `/lists`; authenticated `user-resp-001`; `dir="rtl"`; focus on `body`; no modal/menu/drawer/sheet. | Traverse the primary navigation accessibility tree from first exposed nav item to last. | Accessibility tree exposes nav items in exact order `قوائمي`, `الأماكن`, `صفحتي`; forbidden destinations `مطاعم`, `مقاهي`, `Restaurants`, and `Cafes` are not exposed in the navigation tree. | RESP-001-US-015 | Yes | Accessibility |

## Traceability Verification Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| RESP-001-TC-012 | Traceability Verification | High | Confirm `FEATURE_TRACEABILITY.md` continues mapping primary navigation implementation and responsive tests to the Responsive, RTL, accessibility area. | Evidence references include app shell/navigation implementation and responsive/auth-gating tests. | RESP-001-US-005, RESP-001-US-013 |

## Summary

- Executable test cases: 11
- Requirement Clarification cases: 0
- Manual Verification cases: 0
- Traceability Verification cases: 1
- Total cases: 12

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- Generic Executable Wording: 0
- Missing Viewport in Executable Tests: 0
- Missing Initial State in Executable Tests: 0
- Vague Responsive Assertions: 0
- Vague Accessibility Assertions: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Accessibility Coverage Gaps: 0
- Responsive Coverage Gaps: 0
- Final Verdict: Production Grade
