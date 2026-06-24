# 32. Final Design Production Package

> Canonical status note (2026-06-24): This document is retained as historical design production context. Where it conflicts with current product decisions, use the current canonical implementation: `سجل`; primary navigation `قوائمي`, `الأماكن`, `صفحتي`; restaurants/cafes/ice cream are Places filters; ratings support 0.5 increments; profile uses `تقييماتك` as the single archive.

## Document Purpose

This is the final implementation-grade design production package for the Restaurant & Cafe Wishlist Tracker.

This document uses the approved product, UX, audit, and remediation documentation as its source of truth:

- [08-screen-inventory.md](08-screen-inventory.md)
- [09-information-architecture.md](09-information-architecture.md)
- [15-ux-recommendations.md](15-ux-recommendations.md)
- [29-world-class-product-experience-specification.md](29-world-class-product-experience-specification.md)
- [30-world-class-design-audit-report.md](30-world-class-design-audit-report.md)
- [31-design-remediation-phase-package.md](31-design-remediation-phase-package.md)

Where this document is more specific than earlier design documents, this document controls final UI implementation decisions.

## External Standard References

- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines
- Apple HIG Accessibility: https://developer.apple.com/design/Human-Interface-Guidelines/accessibility
- Apple HIG Right to Left: https://developer.apple.com/design/human-interface-guidelines/right-to-left
- Material Design 3 Foundations: https://m3.material.io/foundations
- Material Design 3 Accessible Design: https://m3.material.io/foundations/accessible-design/overview
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI WCAG Overview: https://www.w3.org/WAI/standards-guidelines/wcag/

## Scope Rules

No new product features are introduced by this package.

The product remains:

- Authenticated.
- Arabic-first.
- RTL-native.
- Mobile-first.
- Personal taste-library oriented.
- Not a map product.
- Not a recommendation product.
- Not a public social network.
- Not a Yelp/Google Maps-style discovery platform.

Disallowed design outcomes:

- Trending sections.
- Popularity rankings.
- Nearby/location UX.
- Comments.
- Photos.
- Follows.
- Social feeds.
- Anonymous list access.
- Admin or moderation screens.
- Operational place editing.

## Production Quality Bar

Target design readiness after adopting this package: **9.6 / 10**.

This score means frontend implementation should not require invention of:

- Screen structure.
- Component anatomy.
- Component variants.
- RTL rules.
- Accessibility behavior.
- Mobile ergonomics.
- Content tone.
- Empty/error/loading states.
- Motion timing.
- QA acceptance criteria.

# 1. Screen Anatomy Specifications

## Global App Shell Anatomy

| Region | Mobile | Tablet/Desktop | Rules |
| --- | --- | --- | --- |
| Root canvas | `surface.canvas`, full viewport | Same | Never use decorative gradient/orb backgrounds. |
| Content frame | 16px margin | 24-40px margin, max 1180px | Content must not stretch past max width. |
| Primary navigation | Fixed bottom nav | Top or side nav depending on width | Exactly four primary items. |
| Page header | Screen title plus one primary action | Same, with optional side alignment | Header is never a card. |
| Main content | Single column | Single column or content + side context | No nested cards. |
| Sheet/modal layer | Bottom sheet | Modal or inline panel | Used for short focused tasks only. |
| Toast layer | Above bottom nav | Top/end | One visible toast at a time. |

## Universal Screen Anatomy

Every screen must contain these defined regions in this order:

1. Screen title.
2. Primary action, if available.
3. Context helper, if needed for privacy/scope.
4. Main content.
5. Secondary content.
6. Error or empty state, when applicable.
7. Loading skeleton, when applicable.
8. Persistent navigation, except auth screens.

## Screen Anatomy Matrix

| Screen | Primary Object | Header | Primary Action | Main Body | Secondary Body | Persistent Chrome |
| --- | --- | --- | --- | --- | --- | --- |
| Register | User account | Product name + account title | Register | Email/password form | Login link | None |
| Login | Session | Login title | Login | Email/password form | Register link | None |
| My Lists | User lists | قوائمي / My Lists | Create List | List cards | Public Lists entry | Bottom nav |
| Create List | List | Sheet title | Save List | Name + visibility | Visibility helper | Sheet controls |
| List Detail | List | List name + visibility | Add Place | Place cards | Owner actions/read-only context | Bottom nav |
| Add Place To List | List item | Sheet title | Select place | Search + results | Create place option | Sheet controls |
| Create Place | Place | Sheet/page title | Create Place | Name/type/description | Duplicate recovery | Sheet or page controls |
| Restaurants | Place inventory | المطاعم / Restaurants | Add Restaurant | Restaurant cards | Empty/error/loading states | Bottom nav |
| Cafes | Place inventory | المقاهي / Cafes | Add Cafe | Cafe cards | Empty/error/loading states | Bottom nav |
| Place Detail | Place | Place name | Rate/Edit Rating | Rating summary + tried + notes | Add to list context | Bottom nav |
| Rate Place | Rating | Sheet title + place name | Save Rating | 1-10 rating + private notes | Tried consequence copy | Sheet controls |
| My Profile | Taste archive | ملفي / My Profile | Content action only | Stats + tried places | Ratings + my public lists | Bottom nav |
| Public Lists | Public list index | Public lists title | Open public list | Public list cards | Scope explanation | Bottom nav via My Lists context |
| Public List Detail | Public list | Owner + list name | Open place | Read-only place cards | Public/read-only explanation | Bottom nav |

# 2. Complete Screen-by-Screen Layout Specifications

## Layout Tokens

| Token | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Page margin | 16px | 24px | 32-40px |
| Content max width | Fluid | 720px | 1040-1180px |
| Header gap | 16px | 20px | 24px |
| Section gap | 24px | 32px | 40px |
| Card gap | 12px | 12px | 16px |
| Bottom safe padding | Nav + 24px | Nav + 24px | 40px |

## Register

| Spec Area | Requirement |
| --- | --- |
| Route context | Unauthenticated only. |
| Mobile layout | Full-height single column, 16px margin, form vertically centered only when keyboard is closed. |
| Desktop layout | Centered 400px form, no marketing split panel. |
| Header order | Product name, concise Arabic-first headline, optional short reassurance. |
| Field order | Email, password. |
| Primary CTA | Full-width Register button, 48px high mobile. |
| Secondary action | Login link below CTA. |
| Loading | Button enters loading state; fields remain visible and unchanged. |
| Error | Inline field errors plus form-level duplicate email when applicable. |
| Accessibility | Focus starts on email; first invalid field receives focus after failed submit. |
| Forbidden | Social login, hero marketing, decorative imagery. |

## Login

| Spec Area | Requirement |
| --- | --- |
| Route context | Unauthenticated only. |
| Mobile layout | Same auth shell as Register. |
| Desktop layout | Same 400px centered form. |
| Field order | Email, password. |
| Primary CTA | Full-width Login button. |
| Secondary action | Register link. |
| Loading | Button loading; preserve entered email. |
| Error | Invalid credentials as form-level error; do not reveal whether email exists. |
| Accessibility | Error announced before focus returns to email. |
| Forbidden | Third-party login, forgot password unless already supported. |

## My Lists

| Spec Area | Requirement |
| --- | --- |
| Route context | Authenticated owner. |
| Mobile layout | Header row, Create List button, list section, Public Lists secondary entry, bottom nav. |
| Desktop layout | Max 1040px; list grid may use two columns if cards keep equal height. |
| Header | "قوائمي" / "My Lists". |
| Primary CTA | Create List. |
| Card content | List name, visibility badge, place count. |
| Empty | One empty state with Create List CTA. |
| Loading | 3 list-card skeletons after 300ms. |
| Error | Retry panel; do not hide Create List unless auth is invalid. |
| Accessibility | Cards announce name, visibility, count. |
| Forbidden | Trending public lists, recommendations, popularity sorting. |

## Create List

| Spec Area | Requirement |
| --- | --- |
| Surface | Mobile bottom sheet; desktop modal. |
| Mobile height | 44-56% default, 80% max with keyboard. |
| Header | "أضف قائمة" / "Create List". |
| Field order | Name, visibility, helper copy. |
| Default visibility | Private. |
| Primary CTA | Save List. |
| Validation | Name required. Duplicate names are allowed. |
| Loading | Save button loading; form values remain visible. |
| Error | Inline name error. |
| Accessibility | Visibility choices include audience explanation. |
| Forbidden | Category, cover image, collaborators. |

## List Detail

| Spec Area | Owner Requirement | Public Viewer Requirement |
| --- | --- | --- |
| Header | List name, visibility badge, place count | Owner context, list name, public badge |
| Primary CTA | Add Place | None; place cards open detail |
| Owner actions | Rename, visibility, delete | Absent, not disabled |
| Main body | Place cards | Read-only place cards |
| Empty | Add first place CTA | No places message |
| Error | Private/not found/session error | Private/not found/sign-in state |
| Loading | Header skeleton + cards | Same |
| Accessibility | Owner actions named by list | Read-only context announced |
| Forbidden | Showing rating notes from other users | Same |

## Add Place To List

| Spec Area | Requirement |
| --- | --- |
| Surface | Bottom sheet mobile, modal desktop. |
| Header | "أضف مكان" / "Add Place". |
| Search scope | Place name only. |
| Result order | Exact match, prefix match, then create option if no match. |
| Primary action | Select one place. |
| Duplicate add | Idempotent success copy; no duplicate item. |
| Loading | Result row skeletons. |
| Empty | Prompt to search. |
| No results | Create place using typed name. |
| Accessibility | Result count announced after debounce. |
| Forbidden | Multiple-list selection, recommendations, nearby search. |

## Create Place

| Spec Area | Requirement |
| --- | --- |
| Surface | Sheet from context; page only for standalone route. |
| Header | "أضف مكان" / "Create Place". |
| Field order | Name, type, description. |
| Type choices | Restaurant, cafe only. |
| Description | Optional, visually secondary. |
| Primary CTA | Create Place. |
| Duplicate name | Conflict state with path to existing place. |
| Loading | Save button loading. |
| Accessibility | Type is a two-option segmented/radio control. |
| Forbidden | Place editing, categories beyond restaurant/cafe, location fields. |

## Restaurants

| Spec Area | Requirement |
| --- | --- |
| Header | "المطاعم" / "Restaurants". |
| Primary CTA | Add Restaurant. |
| Main body | Restaurant place cards only. |
| Card priority | Name, Tried, current user rating, average rating/count, add/rate actions. |
| Empty | Add Restaurant CTA. |
| Loading | Place-card skeletons. |
| Error | Retry panel. |
| Accessibility | Cards do not announce recommendation/ranking language. |
| Forbidden | Trending, nearby, best-rated sort, category exploration. |

## Cafes

Same as Restaurants with cafe labels and cafe type default.

## Place Detail

| Spec Area | Requirement |
| --- | --- |
| Header | Place name, type, Tried badge if applicable. |
| First viewport | Place name, aggregate rating, current user rating/tried status, Rate/Edit CTA. |
| Private notes | Shown only to rating owner; separated in a private notes region. |
| List action | Add To List available, including tried places. |
| Empty aggregate | "No ratings yet" if rating count is zero. |
| Loading | Header/rating/list-action skeletons. |
| Error | Not found. |
| Accessibility | Notes privacy and rating summary announced separately. |
| Forbidden | Public reviews, photos, comments, map/location modules. |

## Rate Place

| Spec Area | Requirement |
| --- | --- |
| Surface | Bottom sheet mobile, modal desktop. |
| Header | "قيّم المكان" / "Rate Place" plus place name. |
| Consequence copy | Must appear before Save. |
| Rating control | 1-10, two rows on compact mobile. |
| Notes | Optional private notes, blank stored as null. |
| Primary CTA | Save Rating. |
| First rating success | Confirms Tried and list removal. |
| Update success | Confirms rating updated and Tried remains. |
| Error | Rating required; note text preserved on failure. |
| Accessibility | Radio group semantics; each value announces scale meaning. |
| Forbidden | Public review framing. |

## My Profile

| Spec Area | Requirement |
| --- | --- |
| Header | "ملفي" / "My Profile". |
| First viewport | Taste summary, not account settings. |
| Stats | List count, tried restaurant count, tried cafe count, ratings count. |
| Main body | Tried places, user ratings with private notes. |
| Secondary body | My public lists if present. |
| Empty | Explain tried archive begins by rating a place. |
| Loading | Stats skeleton + row skeletons. |
| Error | Partial failure keeps loaded sections visible. |
| Accessibility | Stats announce label/value/unit. |
| Forbidden | Followers, activity feed, social graph. |

## Public Lists

| Spec Area | Requirement |
| --- | --- |
| Placement | Secondary under My Lists. |
| Header | Public lists title and authenticated-only scope copy. |
| Main body | Public list cards. |
| Empty | No public lists available; return to My Lists. |
| Loading | Public list-card skeletons. |
| Error | Sign-in required or unavailable. |
| Accessibility | Public/authenticated-only context announced. |
| Forbidden | Top-level nav, trending, recommendation, anonymous preview. |

## Public List Detail

| Spec Area | Requirement |
| --- | --- |
| Header | Owner context, list name, public badge. |
| Context copy | "Read-only public list." |
| Main body | Place cards. |
| Actions | Open place; add from place context only if existing flow supports it. |
| Empty | No places in this list. |
| Loading | Header skeleton + card skeletons. |
| Error | Sign-in/private/not found without leaking private content. |
| Accessibility | Owner controls absent; read-only mode announced. |
| Forbidden | Owner-only controls, notes from other users. |

# 3. Component Anatomy Specifications

## Component Contract

Every component must define:

- Container dimensions.
- Internal slots.
- State behavior.
- RTL behavior.
- Accessibility role/name/state.
- Loading behavior.
- Error behavior.
- Mobile touch target.
- Allowed variants.

## Button

| Slot | Requirement |
| --- | --- |
| Container | 44px min height, 48px preferred mobile, radius 8px. |
| Label | Visible text required; no icon-only primary buttons. |
| Icon | Optional, mirrors in RTL when directional. |
| State | Default, hover, pressed, focus, disabled, loading. |
| Loading | Width stable; progress indicator does not replace accessible label. |
| Accessibility | Role button; accessible name equals visible label plus context if needed. |

## Text Input

| Slot | Requirement |
| --- | --- |
| Label | Always visible. |
| Field | 48px min height mobile; border default; focus ring 2px. |
| Helper | Below field; used for privacy/format. |
| Error | Below helper or replaces helper; never tooltip-only. |
| Accessibility | Label, description, and error are associated. |

## Search Field

| Slot | Requirement |
| --- | --- |
| Scope | Place name only. |
| Leading icon | Search icon, mirrored only if icon is directional. |
| Clear action | 44px target. |
| Results | Count announced; exact/prefix matches only. |
| Empty | Prompt to search. |
| Forbidden | Discovery suggestions or location affordances. |

## Place Card

| Slot | Requirement |
| --- | --- |
| Container | 72px min read-only; 88px min actionable mobile. |
| Title | Place name, two-line max on mobile. |
| Meta | Type, average rating, rating count. |
| Personal state | Tried badge, current user rating. |
| Actions | Open detail primary; Add To List and Rate/Edit contextual. |
| Accessibility | Card summary includes name/type/rating/tried. Actions are separately reachable. |

## List Card

| Slot | Requirement |
| --- | --- |
| Title | List name, two-line max. |
| Meta | Place count. |
| Status | Public/private badge. |
| Actions | Open detail primary; owner actions menu if owner. |
| Accessibility | Duplicate names allowed; card accessible name includes count/visibility. |

## Rating Control

| Slot | Requirement |
| --- | --- |
| Label | "Your rating" / "تقييمك". |
| Values | 1-10 numeric targets. |
| Layout | Two rows of five at 320-430px; one row only if targets remain 44px. |
| Semantics | 1-3 not for me, 4-6 okay, 7-8 liked it, 9-10 favorite-level. |
| Notes | Private notes field below value selection. |
| Accessibility | Radio group; arrow keys; touch targets 44px. |

## Badge

| Slot | Requirement |
| --- | --- |
| Container | 24px min height, radius 4px. |
| Content | Icon + text unless inside parent accessible label. |
| Priority | Tried, personal rating, visibility, aggregate. |
| Accessibility | Meaning included in parent description. |

## Bottom Sheet

| Slot | Requirement |
| --- | --- |
| Header | Title and close button. |
| Body | Scrollable content. |
| Footer | Sticky primary CTA. |
| Height | Defined per sheet in Mobile Ergonomics Matrix. |
| Dismissal | Unsaved input requires confirmation. |
| Accessibility | Dialog semantics, focus trap, focus restore. |

## Modal

| Slot | Requirement |
| --- | --- |
| Container | 480px default width, max 640px for result-heavy flows. |
| Header | Title and close. |
| Body | Scroll if content exceeds viewport. |
| Footer | Primary and secondary actions. |
| Accessibility | Same focus rules as sheet. |

## Toast

| Slot | Requirement |
| --- | --- |
| Content | Short message plus one optional action. |
| Placement | Above nav mobile; top/end desktop. |
| Duration | 4s success; persistent blocking error. |
| Accessibility | Polite live region except destructive failure. |

# 4. Component Variant Matrix

| Component | Variant | Use | States | Not Allowed |
| --- | --- | --- | --- | --- |
| Button | Primary | One main action per screen/sheet | Default, pressed, focus, loading, disabled | Multiple primary buttons in same decision area |
| Button | Secondary | Non-destructive alternate action | Same | Competing with primary CTA |
| Button | Destructive | Delete list only | Default, focus, confirm/loading | As default action |
| Button | Icon | Close, clear, overflow | Default, pressed, focus, disabled | Unlabelled icon-only control |
| Input | Text | Names/descriptions | Empty, filled, focus, error, disabled | Placeholder-only label |
| Input | Password | Login/register password | Empty, filled, focus, error | Social login adjuncts |
| Search | Place-name | Add Place flow | Empty, typing, results, no results, error | Nearby/category/trending search |
| Card | Place | Place summary | Default, pressed, loading, tried, rated | Nested full-card actions with conflicting buttons |
| Card | List | List summary | Default, public, private, loading, empty | Unique-name assumption |
| Rating | Numeric | Rate/edit place | Empty, selected, error, disabled | Stars only, half ratings, public review copy |
| Badge | Tried | Tried state | Default | Color-only check |
| Badge | Public | Public visibility | Default | Globe icon without text in edit contexts |
| Badge | Private | Private visibility | Default | Lock icon without text in edit contexts |
| Sheet | Form | Create/rate flows | Opening, open, loading, error | Full-screen takeover unless keyboard requires expansion |
| Modal | Form/results | Desktop create/add/rate | Opening, open, loading, error | Mobile primary pattern |
| Toast | Success | Non-blocking confirmation | Visible, dismissed | Replacing required inline error |
| Skeleton | Card/row | Section loading | Static, shimmer if allowed | Layout-shifting skeleton |

# 5. RTL Behavior Matrix

| Element | RTL Behavior | Exception |
| --- | --- | --- |
| App direction | Arabic surfaces use RTL root direction. | Latin place names are isolated. |
| Mobile nav | Visual order starts from right: قوائمي, المطاعم, المقاهي, ملفي. | None. |
| Back icon | Points right in Arabic. | Browser-native controls may follow platform. |
| Forward/progression icon | Points left in Arabic. | Numeric rating scale remains 1 to 10. |
| Page header | Title aligned right. | Centered auth title allowed. |
| Primary CTA in forms | Full-width preferred. | Desktop aligns to visual end. |
| Card text | Right aligned for Arabic. | Latin names preserve native direction. |
| Metadata row | Right-to-left reading order. | Rating number retains Latin digit order. |
| Search field | Search icon at visual start; clear at visual end. | None. |
| Bottom sheet | Enters from bottom; no horizontal direction. | None. |
| Modal | Centered; no directional slide. | None. |
| Toast | Bottom above nav mobile; desktop visual end. | None. |
| Directional motion | Mirrored. | Vertical motion not mirrored. |
| Punctuation | Isolate mixed language segments. | None. |
| Rating numbers | Display 1-10 left-to-right inside control. | Labels/helper copy remain RTL. |

# 6. Accessibility Behavior Matrix

## WCAG Target

Minimum conformance target: WCAG 2.2 AA.

| Area | Behavior | Acceptance Test |
| --- | --- | --- |
| Keyboard | All actions reachable without pointer. | Tab through every screen and sheet. |
| Focus | Visible 2px focus ring on all interactive elements. | Check keyboard focus at 320px and desktop. |
| Touch targets | 44x44px minimum. | Inspect buttons, icons, rating values. |
| Names/roles | Controls expose correct role and accessible name. | Screen reader reads label and purpose. |
| Errors | Errors are associated and announced. | Submit invalid forms. |
| Status updates | Toasts/loading/success announced without stealing focus. | Save list/rating and listen. |
| Reduced motion | Non-essential motion disabled. | Enable reduced motion. |
| Color | Meaning never color-only. | Disable color perception mentally; status still clear. |
| Contrast | Text and UI components meet WCAG AA; body text aims higher where practical. | Check token pair contrast before implementation signoff. |
| Arabic screen reader | Arabic labels and mixed names read in expected order. | Test Arabic VoiceOver/NVDA flow. |

## Screen Accessibility Requirements

| Screen | Required Behavior |
| --- | --- |
| Register | Email/password labelled; invalid fields announced; submit preserves input. |
| Login | Invalid credentials announced as form error. |
| My Lists | List cards announce list name, count, visibility. |
| Create List | Visibility choices announce audience. |
| List Detail | Owner and public-viewer modes announced distinctly. |
| Add Place | Result count announced after search debounce. |
| Create Place | Type choices announced as restaurant/cafe. |
| Restaurants/Cafes | Cards announce place, type, tried, rating summary. |
| Place Detail | Private notes region announced as private. |
| Rate Place | Consequence copy appears before rating; rating group announced. |
| My Profile | Stats read as label/value. |
| Public Lists | Authenticated-only context announced. |
| Public List Detail | Read-only mode announced; owner controls absent. |

# 7. Mobile Ergonomics Matrix

| Pattern | 320-359px | 360-430px | 431-767px |
| --- | --- | --- | --- |
| Page margin | 16px | 16px | 20px |
| Primary CTA | Full width | Full width or header button | Header button allowed |
| Bottom nav | 64px + safe area | Same | Same |
| Place card | 2-line title allowed | 2-line title allowed | 1-2 line title |
| List card | 2-line title allowed | 2-line title allowed | 1-2 line title |
| Rating control | 2 rows of 5 | 2 rows of 5 | 1 row only if targets >=44px |
| Create List sheet | 56% max initial | 44-56% | 44-56% |
| Add Place sheet | 90% max | 72-90% | 72-90% |
| Rate Place sheet | 90% max | 76-90% | 76-90% |
| Toast | Above nav | Above nav | Above nav |
| Keyboard | CTA remains visible or scrolls into view | Same | Same |

## One-Handed Rules

- Primary save actions in sheets are sticky at the bottom.
- Destructive actions are never placed as accidental thumb targets.
- Bottom nav labels remain visible.
- Icon buttons remain 44x44px.
- No floating action obscures final list row.

# 8. Content Design System

## Voice

The product voice is:

- Calm.
- Direct.
- Private by default.
- Personal, not social.
- Arabic-first.

## Content Principles

| Principle | Rule |
| --- | --- |
| One action per message | Do not combine multiple instructions in one sentence. |
| Privacy is explicit | State who can see lists/notes where decisions happen. |
| No discovery language | Avoid "popular", "trending", "recommended", "nearby". |
| No blame | Errors describe what happened and how to recover. |
| Short Arabic first | Arabic strings must fit mobile before English is accepted. |

## Canonical Labels

| Concept | Arabic | English |
| --- | --- | --- |
| My Lists | قوائمي | My Lists |
| Restaurants | المطاعم | Restaurants |
| Cafes | المقاهي | Cafes |
| My Profile | ملفي | My Profile |
| Create List | أضف قائمة | Create List |
| Add Place | أضف مكان | Add Place |
| Create Place | أضف مكان | Create Place |
| Add To List | أضف للقائمة | Add To List |
| Rate Place | قيّم المكان | Rate Place |
| Edit Rating | عدّل التقييم | Edit Rating |
| Tried | جرّبته | Tried |
| Private | خاص | Private |
| Public | عام | Public |
| Save | حفظ | Save |
| Cancel | إلغاء | Cancel |
| Delete | حذف | Delete |

# 9. UX Writing System

## UX Writing Patterns

| Moment | Arabic Pattern | English Pattern |
| --- | --- | --- |
| Required field | الاسم مطلوب. | Name is required. |
| Invalid email | أدخل بريدًا صحيحًا. | Enter a valid email. |
| Duplicate place | يوجد مكان بهذا الاسم. | A place with this name already exists. |
| Duplicate list item | المكان موجود في هذه القائمة. | This place is already in this list. |
| Private note helper | ملاحظاتك خاصة ولا تظهر للآخرين. | Your notes are private and never shown to others. |
| Public helper | يمكن للمستخدمين المسجلين رؤية هذه القائمة. | Signed-in users can view this list. |
| Private helper | لا تظهر هذه القائمة إلا لك. | Only you can view this list. |
| Tried consequence | حفظ التقييم يجعل المكان مجرّبًا ويزيله من قوائمك. يمكنك إضافته لاحقًا. | Saving a rating marks this place as tried and removes it from your lists. You can add it back later. |
| Rating saved | تم حفظ التقييم. أصبح المكان مجرّبًا. | Rating saved. Marked as Tried. |
| Visibility changed | تم تحديث ظهور القائمة. | List visibility updated. |

## Forbidden Copy

Do not use:

- Recommended for you.
- Popular near you.
- Trending.
- Discover places.
- Public review.
- Followers.
- Activity feed.
- إدارة الكيانات
- تنفيذ العملية
- حدث خطأ غير معروف without recovery.

# 10. Empty State Library

| Context | Title Arabic | Body Arabic | CTA Arabic | English Equivalent |
| --- | --- | --- | --- | --- |
| My Lists empty | ابدأ بقائمتك الأولى | اجمع الأماكن التي تريد تجربتها في قائمة واحدة. | أضف قائمة | Start your first list / Create List |
| New List empty | أضف أول مكان | هذه القائمة جاهزة لحفظ الأماكن التي تريد تجربتها. | أضف مكان | Add the first place / Add Place |
| Restaurants empty | لا توجد مطاعم بعد | أضف مطعمًا تريد تجربته أو تذكره. | أضف مطعم | No restaurants yet / Add Restaurant |
| Cafes empty | لا توجد مقاهٍ بعد | أضف مقهى تريد تجربته أو تذكره. | أضف مقهى | No cafes yet / Add Cafe |
| Place ratings empty | لا توجد تقييمات بعد | كن أول من يقيّم هذا المكان. | قيّم المكان | No ratings yet / Rate Place |
| Profile empty | يبدأ أرشيفك بالتقييم | قيّم مكانًا بعد تجربته ليظهر هنا. | افتح المطاعم | Your archive starts with a rating / Open Restaurants |
| Public Lists empty | لا توجد قوائم عامة | القوائم العامة تظهر هنا عندما تكون متاحة للمستخدمين المسجلين. | رجوع لقوائمي | No public lists / Back to My Lists |
| Search empty | ابحث باسم المكان | اكتب اسم مطعم أو مقهى لإضافته. | None | Search by place name |
| Search no result | لا يوجد مكان بهذا الاسم | يمكنك إنشاء المكان بهذا الاسم. | أضف مكان | No matching place / Create Place |

Rules:

- Empty states have one primary CTA maximum.
- Empty states must not imply recommendations.
- Empty state visuals are optional and quiet.

# 11. Error State Library

| Error | Arabic Copy | English Copy | Recovery |
| --- | --- | --- | --- |
| Required name | الاسم مطلوب. | Name is required. | Focus field. |
| Invalid email | أدخل بريدًا صحيحًا. | Enter a valid email. | Focus email. |
| Invalid password | كلمة المرور مطلوبة. | Password is required. | Focus password. |
| Invalid credentials | تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى. | Could not log in. Check your details and try again. | Preserve email. |
| Duplicate place | يوجد مكان بهذا الاسم. | A place with this name already exists. | Show existing place path. |
| Duplicate list item | المكان موجود في هذه القائمة. | This place is already in this list. | Treat as success-style notice. |
| Private list | هذه القائمة خاصة أو غير متاحة. | This list is private or unavailable. | Back to My Lists. |
| Guest list access | سجّل الدخول لعرض القوائم. | Sign in to view lists. | Login. |
| Network | تعذر الاتصال. حاول مرة أخرى. | Could not connect. Try again. | Retry. |
| Save failed | تعذر الحفظ. لم نفقد ما كتبته. | Could not save. Your input is still here. | Retry. |
| Rating required | اختر تقييمًا من 1 إلى 10. | Choose a rating from 1 to 10. | Focus rating group. |
| Notes save failed | تعذر حفظ الملاحظات. النص محفوظ هنا. | Could not save notes. Your text is still here. | Retry. |

Rules:

- Preserve user input on all recoverable errors.
- Permission errors must not leak private content.
- Form errors appear inline and are announced.

# 12. Loading State Library

| Context | 0-300ms | 300ms+ | 1s+ | Failure |
| --- | --- | --- | --- | --- |
| Register/Login | Button loading | Same | Same | Form error |
| My Lists | No skeleton | 3 list skeletons | Stable skeletons | Retry panel |
| List Detail | Header reserved | Header + card skeletons | Stable skeletons | Retry/private state |
| Add Place | Search field active | Result skeletons | Stable result area | Inline retry |
| Create Place | Button loading | Same | Same | Preserve fields |
| Restaurants/Cafes | Header visible | Place skeletons | Stable skeletons | Retry panel |
| Place Detail | Header reserved | Rating/list skeletons | Stable skeletons | Not found/retry |
| Rate Place | Button loading | Same | Same | Preserve rating/notes |
| Profile | Header visible | Stats + row skeletons | Stable skeletons | Partial error |
| Public Lists | Header visible | Public list skeletons | Stable skeletons | Sign-in/retry |

Rules:

- Skeletons match final layout dimensions.
- Reduced motion disables shimmer.
- Layout must not jump when content arrives.

# 13. Interaction State Library

| Component | Default | Hover | Pressed | Focus | Disabled | Loading | Error |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primary button | Brand fill | Slight darken | 80ms press | 2px ring | Muted, no action | Spinner + stable width | Not used |
| Secondary button | Border/subtle | Surface shift | 80ms press | 2px ring | Muted | Spinner if mutation | Not used |
| Text input | Border default | Border strong desktop | None | 2px ring | Muted bg | Not used | Error border + message |
| Search field | Empty prompt | Border strong desktop | None | 2px ring | Muted | Results loading | Inline retry |
| Place card | Raised/border | Surface subtle desktop | Pressed surface | Ring around card | Not used | Skeleton | Inline row error |
| List card | Raised/border | Surface subtle desktop | Pressed surface | Ring around card | Not used | Skeleton | Inline row error |
| Rating value | Neutral | Surface subtle | Press scale 80ms | Ring | Muted | Not used | Group error |
| Badge | Semantic bg | None | None | Not focusable unless interactive | Muted | Not used | Not used |
| Bottom sheet | Closed/open | Not applicable | Drag handle visual only | Trap focus | Not applicable | Footer loading | Inline error |
| Toast | Hidden/visible | Not applicable | Dismiss/action press | Action focusable | Not applicable | Not applicable | Error toast |

# 14. Motion Choreography Specification

## Motion Tokens

| Token | Duration | Easing | Use |
| --- | --- | --- | --- |
| `motion.press` | 80ms | ease-out | Button/card/rating press. |
| `motion.fast` | 140ms | ease-out | Badge/status changes. |
| `motion.base` | 220ms | standard ease | Sheet/modal/toast entrance. |
| `motion.slow` | 320ms | ease-in-out | Rare page-level transition. |

## Flow Choreography

| Flow | Timeline |
| --- | --- |
| Create List | Press 80ms, sheet enters 220ms, save button loading immediately, success toast 220ms. |
| Add Place | Press 80ms, sheet enters 220ms, result skeleton after 300ms, selected row press 80ms, success closes sheet. |
| Create Place | Save button loading, duplicate conflict fades in 140ms or success returns to source. |
| Rate Place | Sheet enters 220ms, rating value press 80ms, save loading, Tried badge fades in 140ms after success. |
| Visibility Change | Option press 80ms, badge text updates first, color transition 140ms, toast confirms. |
| Error Recovery | Inline error appears 140ms; focus moves immediately without animated scroll unless needed. |

Reduced motion:

- No shimmer.
- No scale.
- No non-essential fade.
- State changes remain instant or use opacity only where necessary.

# 15. Benchmark Comparison Matrix

| Benchmark | Adopted Quality Bar | Product Application | Acceptance Evidence |
| --- | --- | --- | --- |
| Linear | Precision, restraint, fast scanning | One primary action, quiet surfaces, no noisy chrome | Screen headers and cards pass hierarchy review. |
| Airbnb | Trust and clarity around user-generated content | Visibility and private notes are explicit | Public/private copy visible at decision points. |
| Notion | Calm density and composable content | Lists, places, ratings, notes feel structured | Cards use consistent object anatomy. |
| Spotify | Personal taste memory | Profile acts as taste archive | Tried places and ratings lead profile. |
| Letterboxd | Archive and rating identity | Rating marks become personal memory | Rating + Tried + note pattern visible. |
| Sofa | Personal collection warmth | Lists act as shelves | Empty states frame collection value. |
| Arc | Opinionated navigation | Four-tab nav constrained and purposeful | Public lists not elevated. |
| Perplexity | Focus and low-noise hierarchy | Screens answer the current task first | No unrelated discovery modules. |
| Apple HIG | Platform clarity, accessibility, RTL adaptation | Native-feeling layout, focus, safe areas | Mobile/sheet/RTL matrices pass QA. |
| Material 3 | Systematic accessibility and state behavior | Component variants and states defined | Variant/accessibility matrices complete. |

# 16. Design Consistency Rules

1. Use design tokens only; do not invent colors, spacing, radius, or shadows.
2. Cards use max 8px radius.
3. Page sections are not cards.
4. No nested cards.
5. One primary action per screen or sheet.
6. Public/private status always includes text.
7. Tried status always includes text or accessible text.
8. Rating notes are always labelled private.
9. Arabic labels are primary for Arabic surfaces.
10. Bottom nav always has four visible labels.
11. Empty states never contain more than one primary CTA.
12. Error messages always include recovery when possible.
13. Loading states preserve final layout dimensions.
14. Motion is restrained and functional.
15. No out-of-scope discovery language.

# 17. Frontend Design Implementation Rules

These are design implementation rules, not code instructions.

| Rule | Requirement |
| --- | --- |
| Token use | All colors, spacing, radius, shadow, and type must map to this package. |
| Responsive behavior | Implement mobile first; desktop expands layout but not workflow. |
| RTL | Layout must be tested in RTL before LTR signoff. |
| Text overflow | No label, badge, button, or card text may overlap or escape container. |
| Component reuse | New visual variants are prohibited without updating the variant matrix. |
| Accessibility | No component ships without role/name/focus/error behavior. |
| Loading | Do not show spinners where a skeleton is specified. |
| Error handling | Do not replace inline validation with toast-only errors. |
| Notes privacy | Never expose another user's notes in any public/list context. |
| Public lists | Do not create top-level public-list navigation. |
| Rating | Do not implement stars-only rating; numeric 1-10 is required. |
| Add to list | One action targets one list only. |
| Duplicate add | Treat duplicate list item as idempotent success. |

# 18. Design QA Checklist

## Screen QA

- [ ] Register matches auth anatomy.
- [ ] Login matches auth anatomy.
- [ ] My Lists has one primary CTA and secondary Public Lists entry.
- [ ] Create List uses visibility helper text.
- [ ] List Detail separates owner and public viewer modes.
- [ ] Add Place searches by name only.
- [ ] Create Place rejects duplicate names with recovery.
- [ ] Restaurants and Cafes do not imply discovery.
- [ ] Place Detail exposes rating, Tried, private notes, and Add To List correctly.
- [ ] Rate Place explains Tried/list-removal consequence before save.
- [ ] My Profile opens as taste archive, not settings.
- [ ] Public Lists is secondary, not primary nav.
- [ ] Public List Detail is read-only for non-owner.

## State QA

- [ ] Empty states use approved copy and one CTA.
- [ ] Error states preserve input.
- [ ] Loading states match final layout.
- [ ] Reduced motion disables shimmer.
- [ ] Toasts do not replace required inline errors.
- [ ] Guest list access shows sign-in required without preview.
- [ ] Private list denial does not leak content.

## Accessibility QA

- [ ] Keyboard path completes every critical flow.
- [ ] Focus is visible and logical.
- [ ] Rating is operable by keyboard and touch.
- [ ] Arabic screen reader announces nav in correct order.
- [ ] Public/private/tried statuses are not color-only.
- [ ] All touch targets are at least 44x44px.
- [ ] Form errors are associated and announced.

## RTL QA

- [ ] Arabic nav visual order starts from the right.
- [ ] Back icons point right.
- [ ] Mixed Arabic/Latin names preserve punctuation.
- [ ] Arabic labels fit at 320px.
- [ ] Rating numbers remain readable and ordered.

# 19. Design Review Checklist

Before approving UI implementation, design review must answer yes to all:

- [ ] Does this screen preserve MVP scope?
- [ ] Is the primary action obvious and singular?
- [ ] Is Arabic the source experience, not an afterthought?
- [ ] Does the layout work at 320px without overlap?
- [ ] Does the screen avoid discovery/social patterns?
- [ ] Are privacy states visible before user decisions?
- [ ] Is the Tried behavior explained where rating happens?
- [ ] Are empty, loading, and error states designed, not generic?
- [ ] Are all component variants from the approved matrix?
- [ ] Are focus order and screen-reader behavior defined?
- [ ] Is reduced motion respected?
- [ ] Does the screen feel like a personal taste library?
- [ ] Would frontend avoid inventing design decisions during implementation?

If any answer is no, the screen is not ready.

# 20. Final World-Class Readiness Assessment

## Final Score

Final production design readiness score: **9.6 / 10**.

## Score Evidence

| Area | Score | Evidence |
| --- | --- | --- |
| Screen anatomy | 9.6 | Every screen has defined regions, hierarchy, actions, states, and chrome. |
| Layout specificity | 9.6 | Mobile/tablet/desktop layout rules are concrete. |
| Component system | 9.7 | Anatomy and variants are specified for production handoff. |
| RTL readiness | 9.6 | Direction, navigation, icons, motion, punctuation, and numeric exceptions are defined. |
| Accessibility | 9.6 | WCAG 2.2 behavior is mapped to components and screens. |
| Mobile ergonomics | 9.6 | Touch targets, sheets, nav, keyboard, and safe areas are specified. |
| Content design | 9.5 | Labels, tone, empty/error/loading copy, and forbidden language are defined. |
| Interaction states | 9.6 | Component states and motion choreography are deterministic. |
| Scope control | 9.8 | Discovery/social/map drift is explicitly blocked. |
| Frontend handoff | 9.6 | Implementation rules prevent invented design decisions. |

## Remaining Risk

The only remaining risk is visual execution quality during UI implementation. This package defines the system and behavior, but final score depends on disciplined visual craft, QA, and review against this document.

## Final Recommendation

**Ready For World-Class Frontend Handoff.**

Frontend implementation may begin when the team agrees that this document is the controlling design production package.
