# 31. Design Remediation Phase Package

> Canonical status note (2026-06-24): This document is retained as historical design remediation context. Where it conflicts with current product decisions, use the current canonical implementation: `سجل`; primary navigation `قوائمي`, `الأماكن`, `صفحتي`; restaurants/cafes/ice cream are Places filters; ratings support 0.5 increments; profile uses `تقييماتك` as the single archive.

## Document Purpose

This document resolves the Critical and High findings from [30-world-class-design-audit-report.md](30-world-class-design-audit-report.md).

This is a design documentation artifact only.

It does not introduce new product features, does not implement UI, and does not define code tasks.

Where this document is more specific than [29-world-class-product-experience-specification.md](29-world-class-product-experience-specification.md), this document is the controlling design specification for UI implementation.

## Deliverable Map

| Required Deliverable | Covered In This Document |
| --- | --- |
| 1. Design Remediation Report | Section 1 |
| 2. Updated Design System | Section 2 |
| 3. Component Anatomy Specifications | Section 3 |
| 4. Arabic UX Specification | Section 4 |
| 5. Accessibility Matrix | Section 5 |
| 6. Mobile Ergonomics Specification | Section 6 |
| 7. Screen-Level Layout Specifications | Section 7 |
| 8. Core Loop Optimization Report | Section 8 |
| 9. Personal Taste Library Experience Model | Section 9 |
| 10. Updated Design Readiness Assessment | Section 10 |

## Scope Guardrails

The remediation stays inside the approved MVP/product scope.

No new features are introduced:

- No recommendations.
- No trending.
- No location search.
- No maps.
- No comments.
- No photos.
- No follows.
- No social feed.
- No anonymous list access.
- No admin workflow.
- No moderation workflow.
- No operational place editing.

Allowed remediation scope:

- Clearer IA decisions.
- More specific screen layouts.
- More precise component anatomy.
- Better empty/loading/error states.
- Better Arabic/RTL rules.
- Better accessibility acceptance criteria.
- Better mobile interaction rules.
- Better explanation of existing rating, tried, list, public/private, and profile behavior.

# 1. Design Remediation Report

## Remediation Outcome

All Critical and High audit findings are closed.

Closure type:

- **Resolved:** The design package now includes an implementation-ready decision/specification.
- **Rejected With Justification:** The proposed fix would create product scope expansion or contradict MVP rules, so the finding is closed by an explicit non-goal and compensating UX guidance.

## Critical Finding Resolution Matrix

| ID | Finding | Resolution | Evidence |
| --- | --- | --- | --- |
| C-01 | Navigation was treated as fixed, not validated. | **Resolved.** Four primary destinations are retained after revalidation, but their roles are narrowed and made measurable. Profile remains because the approved product context includes My Profile, but it is specified as a personal archive surface, not an account/settings area. Public Lists remains secondary to avoid discovery drift. | Navigation Revalidation below; Screen-Level Layout Specifications; Personal Taste Library Experience Model. |
| C-02 | Arabic-first and RTL-native claims were under-specified. | **Resolved.** Arabic copy, bidi handling, numerals, truncation, RTL navigation, screen-reader strings, QA ownership, and mixed-language rules are now specified. | Arabic UX Specification. |
| C-03 | Screen specification was not high fidelity. | **Resolved.** Each screen now has layout regions, hierarchy, primary action, secondary actions, dimensions, responsive behavior, loading, empty, error, focus, and mobile behavior. | Screen-Level Layout Specifications. |
| C-04 | Product was too list-centric for a personal taste library. | **Resolved.** The product model is reframed around saved intent, tried memory, private taste notes, and public shelves using existing MVP data only. | Personal Taste Library Experience Model; Core Loop Optimization Report. |
| C-05 | Accessibility was not implementation-ready. | **Resolved.** WCAG 2.2 criteria are mapped to components, screens, validation methods, and acceptance requirements. | Accessibility Matrix. |
| C-06 | Rating/tried behavior could feel punitive. | **Resolved with one rejected sub-option.** The rating flow now includes consequence preview, post-save confirmation, persistent tried explanation, and add-back path. A one-tap undo restoring all previous list memberships is rejected because it would require new restoration behavior outside MVP. | Rating/Tried Place Remediation; Core Loop Optimization Report. |
| C-07 | Public lists were demoted without an alternative path. | **Resolved.** Public lists stay secondary but gain defined entry points, viewer context, provenance, owner/read-only states, and privacy explanation without becoming discovery. | Public/Private Visibility UX; Screen-Level Layout Specifications. |

## High Finding Resolution Matrix

| ID | Finding | Resolution | Evidence |
| --- | --- | --- | --- |
| H-01 | Design system was a token list, not a production system. | **Resolved.** Tokens now include roles, constraints, density, state behavior, platform use, and component binding. | Updated Design System; Component Anatomy Specifications. |
| H-02 | Visual identity was generic. | **Resolved.** Dhawq is specified as a personal taste-library visual model with shelves, memory rows, rating marks, quiet object hierarchy, and privacy-first surfaces. | Personal Taste Library Experience Model; Updated Design System. |
| H-03 | Mobile-first was not proven. | **Resolved.** Thumb zones, target sizes, bottom navigation, sheet heights, keyboard behavior, safe areas, and interruption recovery are specified. | Mobile Ergonomics Specification. |
| H-04 | Rating control was under-specified. | **Resolved.** Rating scale semantics, touch model, keyboard model, notes privacy, consequence preview, edit behavior, and tried state are specified. | Rating Component; Core Loop Optimization Report. |
| H-05 | Add-place/add-to-list flows were too heavy. | **Resolved with one rejected sub-option.** The flow is compressed using contextual defaults, exact-match duplicate handling, create-from-no-result, and one-target list selection. "Recent places" is rejected because it implies a new recency surface not in MVP. | Core Loop Optimization Report; Screen-Level Layout Specifications. |
| H-06 | Empty states were functional, not experience-defining. | **Resolved.** Empty states now have purpose, emotional job, allowed CTA, Arabic copy model, and loading-to-empty transition rules. | Empty State Strategy. |
| H-07 | Error states were too generic. | **Resolved.** Permission, privacy, duplicate, validation, offline, expired session, and unavailable states have distinct UX rules. | Error State Strategy; Accessibility Matrix. |
| H-08 | Loading states lacked performance perception strategy. | **Resolved.** Loading thresholds, skeleton rules, button loading, stale content, retry, and reduced-motion behavior are specified. | Performance Perception Strategy. |
| H-09 | Public/private visibility was weakly modeled. | **Resolved.** Visibility has explicit labels, helper text, audience summary, change feedback, read-only viewer state, and note-privacy separation. | Public/Private Visibility UX. |
| H-10 | Profile was too prominent. | **Resolved.** Profile is redefined as My Taste Archive using existing stats, tried places, ratings, and private notes. Account/settings behavior is not elevated. | Navigation Revalidation; Personal Taste Library Experience Model; My Profile screen spec. |
| H-11 | Native web versus mobile behavior was unclear. | **Resolved.** Mobile, tablet, desktop, modal, sheet, keyboard, hover, focus, and density rules are split by viewport and input model. | Mobile Ergonomics Specification; Component Anatomy Specifications. |
| H-12 | Arabic copy quality lacked QA. | **Resolved.** Arabic tone, forbidden phrasing, labels, grammar, bidi examples, review checklist, and sign-off gates are specified. | Arabic UX Specification. |

## Navigation Revalidation

### Decision

Retain four primary navigation destinations:

1. My Lists
2. Restaurants
3. Cafes
4. My Profile

Arabic labels:

1. قوائمي
2. المطاعم
3. المقاهي
4. ملفي

### Why Four Tabs Are Retained

| Evaluation Question | Decision Evidence |
| --- | --- |
| Does the tab support a repeated user intent? | My Lists supports saved intent; Restaurants and Cafes support type-based scanning; My Profile supports tried archive and ratings history. |
| Does the tab avoid out-of-scope discovery? | Yes. Restaurants/Cafes are inventory views, not recommendation or location views. Public Lists is not elevated to a primary tab. |
| Does the tab map to approved product context? | Yes. The product context explicitly defines the four main navigation items. |
| Does the tab remain useful with zero, few, and many items? | Yes, if empty states, category-specific cards, and profile archive states follow this remediation. |
| Does the tab deserve thumb reach? | My Lists, Restaurants, and Cafes are high-frequency. My Profile is lower-frequency but kept because it is the only durable archive of tried places and ratings. |

### Profile Prominence Constraint

My Profile must not become an account/settings tab.

Primary content order:

1. Taste summary.
2. Tried places.
3. User ratings.
4. Public lists owned by me, if present.
5. Account-level actions only if required by existing auth/session behavior.

### Public Lists Placement

Public Lists must not be a top-level tab.

Allowed entry points:

- My Lists secondary section: "Public lists".
- Public list detail opened from an authenticated shared/internal link.
- My Profile section for lists owned by the current user that are public.

Disallowed entry points:

- Top-level Public Lists tab.
- Trending public lists.
- Recommended public lists.
- Popular public lists.
- Location-based public browsing.

### Navigation Acceptance Criteria

- Bottom navigation contains exactly four items on mobile.
- Arabic visual order starts from the right: قوائمي, المطاعم, المقاهي, ملفي.
- Screen-reader traversal order follows the same logical order.
- Active state uses text, icon state, and `aria-current`/equivalent semantics.
- Public Lists is reachable within two taps from My Lists, not from primary navigation.
- Profile first viewport must show taste archive content, not settings.

## Rating/Tried Place Remediation

### Decision

Rating a place remains the only way to mark a place as Tried.

The business rule is preserved:

- Saving a rating marks the place as Tried.
- Saving a rating removes the place from all lists owned by the user.
- The user may add the tried place back to lists later.
- Re-adding does not create a second rating.
- Re-adding does not remove Tried status.

### UX Remediation

The prior risk was that rating could feel like a penalty because a place disappears from lists. The remediated UX makes the consequence visible before and after save.

Before save, the rating sheet must show:

> Saving a rating marks this place as tried and removes it from your lists. You can add it back later.

After first save, the confirmation must show:

> Rating saved. Marked as Tried. Removed from your lists.

When viewing or re-adding a tried place, the UI must show:

> This place stays marked as Tried.

### Rejected Option

One-tap undo that restores all previous list memberships is rejected for MVP.

Reason:

- It requires restoration behavior for previous list memberships.
- It adds state recovery not defined in the approved backend/product rules.
- It can create ambiguity if list memberships changed between rating and undo.

Compensating UX:

- Place Detail and tried place rows expose the existing Add To List action.
- Tried badge remains visible during re-add.
- Re-add copy clarifies that Tried status remains.

## Public/Private Visibility UX

### Decision

Visibility remains a list-level property with two values:

- Private.
- Public.

No anonymous access is allowed.

Public lists are visible only to authenticated users.

### Visibility Labels

| State | Label | Helper Copy |
| --- | --- | --- |
| Private | Private / خاص | Only you can view this list. / لا يظهر إلا لك. |
| Public | Public / عام | Signed-in users can view this list. / يمكن للمستخدمين المسجلين رؤيته. |

### Owner Experience

Owner list cards and list detail headers must show:

- List name.
- Visibility badge.
- Place count.
- Owner actions.

Changing visibility must show the audience effect before save.

### Viewer Experience

Authenticated non-owner public list detail must show:

- Owner context.
- Public badge.
- Read-only explanation.
- Place cards.

Owner controls must be absent, not disabled.

### Guest Experience

Guests must see sign-in required state without list content preview.

Guest state must not expose:

- Place names.
- Rating notes.
- Owner-only actions.
- Private list existence.

### Rating Notes Privacy

Rating notes are never shown in public list contexts unless they belong to the current authenticated viewer and are explicitly inside that viewer's private note region.

# 2. Updated Design System

## System Name

Dhawq UI remains the design system name.

The system meaning is "taste as memory", not "restaurant discovery".

## Design System Principles

1. **Library Before Marketplace:** UI must feel like a personal library, not a public review platform.
2. **Decision Before Decoration:** Every visible element must help save, remember, rate, or understand privacy.
3. **Arabic Is The Source Layout:** Arabic/RTL rules are primary, English/LTR is the adaptation.
4. **Mobile Is The Default Composition:** Desktop expands density but does not invent separate workflows.
5. **Privacy Is Always Visible:** Notes and visibility states must be legible before the user acts.
6. **Status Is Text Plus Shape:** Color alone is never enough.

## Color Roles

### Core Surface Roles

| Role | Purpose | Light Value | Required Use |
| --- | --- | --- | --- |
| `surface.canvas` | App background | `#FAF9F6` | Full app background only. |
| `surface.raised` | Cards, sheets, modals | `#FFFFFF` | Primary content containers. |
| `surface.subtle` | Soft grouped areas | `#F2F0EA` | Empty states, secondary bands. |
| `surface.pressed` | Pressed row/card state | `#ECE7DD` | Touch feedback. |
| `border.default` | Quiet separation | `#DED8CC` | Card/input boundaries. |
| `border.strong` | Active/focus separation | `#6F5842` | Focus and selected states. |

### Text Roles

| Role | Value | Use |
| --- | --- | --- |
| `text.primary` | `#1F1A16` | Titles, place names, important labels. |
| `text.secondary` | `#5C5148` | Metadata, helper copy. |
| `text.tertiary` | `#7B7168` | Placeholder and low-emphasis context. |
| `text.inverse` | `#FFFFFF` | Text on solid brand surfaces only. |
| `text.danger` | `#9A3412` | Destructive and blocking errors. |

### Semantic Roles

| Role | Value | Use | Pairing Rule |
| --- | --- | --- | --- |
| `state.tried.bg` | `#E9F7EF` | Tried badge background. | Must include check icon and text. |
| `state.tried.text` | `#146C43` | Tried badge text. | Never icon-only. |
| `state.public.bg` | `#EAF2FF` | Public badge background. | Must include globe icon and "Public"/"عام". |
| `state.public.text` | `#2557A7` | Public badge text. | Must include audience helper in edit contexts. |
| `state.private.bg` | `#F1EEE8` | Private badge background. | Must include lock icon and "Private"/"خاص". |
| `state.private.text` | `#5C5148` | Private badge text. | Never rely on lock only. |
| `state.rating.bg` | `#FFF3D6` | Rating mark background. | Use for personal and aggregate ratings only. |
| `state.rating.text` | `#8A4B00` | Rating value. | Numeric value must remain text. |
| `state.error.bg` | `#FFF1ED` | Error background. | Pair with inline recovery action if possible. |
| `state.error.text` | `#9A3412` | Error text. | Plain-language cause required. |
| `state.success.bg` | `#E9F7EF` | Success background. | Use sparingly for completed actions. |
| `state.focus` | `#6F5842` | Focus ring. | Minimum 2px visual ring. |

## Typography

### Font Stack

Arabic-first surfaces:

`IBM Plex Sans Arabic`, `Noto Sans Arabic`, `system-ui`, `sans-serif`

Fallback for Latin place names:

`Inter`, `system-ui`, `sans-serif`

### Type Scale

| Token | Mobile | Desktop | Weight | Line Height | Use |
| --- | --- | --- | --- | --- | --- |
| `type.display` | 28 | 36 | 650 | 1.25 | Auth title and major archive headers only. |
| `type.title` | 22 | 28 | 650 | 1.3 | Screen titles. |
| `type.section` | 18 | 20 | 600 | 1.35 | Section headers. |
| `type.cardTitle` | 16 | 17 | 600 | 1.4 | Place/list names. |
| `type.body` | 15 | 16 | 400 | 1.65 Arabic / 1.5 Latin | Main copy. |
| `type.meta` | 13 | 13 | 400 | 1.45 | Metadata and helper copy. |
| `type.badge` | 12 | 12 | 600 | 1.2 | Badges and compact labels. |
| `type.number` | 16 | 18 | 650 | 1.2 | Rating values and stats. |

### Arabic Type Rules

- Arabic body text uses line-height 1.6 minimum.
- Arabic headings must not use negative letter spacing.
- Place names may preserve user-entered Latin text.
- Mixed Arabic/Latin place names must be directionally isolated.
- Rating values use Latin digits `1-10` and averages like `8.4` for scale clarity.
- Count copy must be localized in surrounding Arabic text.

## Spacing

| Token | Value | Use |
| --- | --- | --- |
| `space.1` | 4 | Micro gap inside badges. |
| `space.2` | 8 | Icon/text gap. |
| `space.3` | 12 | Compact row padding. |
| `space.4` | 16 | Mobile page margin and form gap. |
| `space.5` | 20 | Section gap. |
| `space.6` | 24 | Card internal padding on mobile. |
| `space.8` | 32 | Section separation. |
| `space.10` | 40 | Desktop section separation. |
| `space.12` | 48 | Auth and profile header separation. |

## Radius

| Token | Value | Use |
| --- | --- | --- |
| `radius.xs` | 4 | Badges, chips. |
| `radius.sm` | 6 | Inputs, compact controls. |
| `radius.md` | 8 | Cards, buttons, sheets. |
| `radius.lg` | 12 | Mobile bottom sheets only. |

Cards remain 8px or below unless the component is a mobile sheet.

## Elevation And Shadow

| Token | Use | Shadow |
| --- | --- | --- |
| `elevation.none` | Default cards and rows | None. |
| `elevation.border` | Most surfaces | Border only. |
| `elevation.sheet` | Bottom sheets | `0 -8px 24px rgba(31, 26, 22, 0.10)`. |
| `elevation.modal` | Desktop modal | `0 16px 48px rgba(31, 26, 22, 0.14)`. |
| `elevation.toast` | Toast | `0 8px 20px rgba(31, 26, 22, 0.12)`. |

Heavy shadows are prohibited.

## Motion

| Token | Duration | Use |
| --- | --- | --- |
| `motion.press` | 80ms | Button/card press feedback. |
| `motion.fast` | 140ms | Badge/status change. |
| `motion.base` | 220ms | Sheet and modal entry. |
| `motion.slow` | 320ms | Screen-level transition if needed. |

Motion rules:

- Motion must mirror in RTL for directional movement.
- Reduced motion disables shimmer, scale pulses, and non-essential transitions.
- Rating selection uses color/weight change and a 80ms press state only.
- Tried badge appears after save with a 140ms fade, no bounce.
- Visibility badge transitions with text change first, color second.

## Density Rules

| Context | Density |
| --- | --- |
| Mobile list cards | Minimum 72px row/card height. |
| Mobile place rows with actions | Minimum 88px height. |
| Desktop list rows | 56-72px depending on metadata. |
| Forms | Minimum 12px gap between fields, 16px between sections. |
| Profile stats | 2 columns mobile, 4 columns tablet/desktop. |

# 3. Component Anatomy Specifications

## Anatomy Contract

Every component must define:

- Container.
- Leading element, if any.
- Primary text.
- Secondary text.
- Metadata.
- Status.
- Primary action.
- Secondary action.
- Loading state.
- Empty state, if applicable.
- Error state.
- Focus order.
- RTL behavior.
- Accessibility name and role.

## Buttons

| Anatomy Part | Specification |
| --- | --- |
| Container | Height 44px mobile, 40px desktop; radius 8px; horizontal padding 16px minimum. |
| Label | Verb-first, one line preferred. Arabic labels must fit without truncation for primary actions. |
| Icon | Optional leading icon; directional icons mirror in RTL. |
| States | Default, hover desktop, pressed, focus, disabled, loading, destructive. |
| Loading | Width remains fixed; label changes to progress phrase only when needed. |
| Accessibility | Button name equals visible label plus hidden context only when ambiguity exists. |

Primary button per screen:

- Exactly one persistent primary action per screen or sheet.
- Destructive action is never the primary visual style.

## Inputs

| Anatomy Part | Specification |
| --- | --- |
| Label | Always visible above field. Placeholder never replaces label. |
| Field | 48px mobile height minimum; radius 6px; border default. |
| Helper | Optional, below field; used for privacy and format. |
| Error | Inline below field; focus moves to first invalid field on submit. |
| Success | No success checkmarks for routine typing. |
| Accessibility | Label and error must be programmatically associated. |

## Search Field

Search remains place-name only.

| Anatomy Part | Specification |
| --- | --- |
| Container | 48px height mobile; search icon at visual start; clear button at visual end. |
| Scope Label | Hidden accessible text: "Search by place name only." |
| Results | Show exact matches first, then name-prefix matches. No popularity or recommendation language. |
| No Results | Offer "Create place" only if user has typed a non-empty name. |
| Accessibility | Role searchbox; result count announced after debounce. |

Disallowed:

- Category exploration.
- Nearby search.
- Trending query suggestions.
- Recommendation copy.

## Place Card

| Anatomy Part | Specification |
| --- | --- |
| Container | 88px minimum mobile when actions are present; 72px when read-only. |
| Primary Text | Place name, single line with optional two-line wrap for long Arabic names. |
| Secondary Text | Type: restaurant/cafe; optional description only on detail screen or expanded card. |
| Metadata | Average rating, rating count, current user rating if present. |
| Status | Tried badge, in-list state, visibility context if public view. |
| Primary Action | Tap container opens Place Detail. |
| Secondary Actions | Add to list, Rate/Edit Rating, Remove from list depending on context. |
| Accessibility | Card name includes place name, type, tried status, and rating summary. Nested actions must be separately reachable. |

Collision rule:

- If more than two statuses appear, show Tried and personal rating first; move aggregate count to metadata row.

## Rating Component

| Anatomy Part | Specification |
| --- | --- |
| Label | "Your rating" / "تقييمك". |
| Control | 10 large numeric targets in two rows of five on compact mobile; one row on wide screens. |
| Target | Minimum 44x44px mobile. |
| Scale Semantics | 1-3 "Not for me"; 4-6 "Okay"; 7-8 "Liked it"; 9-10 "Favorite-level". |
| Selected State | Strong border, rating color, numeric weight increase. |
| Notes | Optional private notes below rating. Blank notes are stored as null. |
| Consequence Copy | Before save: "Saving a rating marks this place as tried and removes it from your lists. You can add it back later." |
| Save Feedback | "Rating saved. Marked as Tried. Removed from your lists." |
| Edit Feedback | "Rating updated. Tried status stays on." |
| Accessibility | Radio group semantics; each value announced as "8 of 10, liked it"; arrow keys and direct tap supported. |

Rejected:

- One-tap undo that restores all previous list memberships. This would require new restoration behavior outside MVP.

Compensating UX:

- The confirmation includes a visible "Add to list" action when the place can be re-added from the current context.

## List Card

| Anatomy Part | Specification |
| --- | --- |
| Primary Text | List name. Duplicate names are allowed, so never rely on name as unique identifier. |
| Metadata | Place count, visibility, last updated if already available; do not create new timestamp feature. |
| Status | Public/private badge. |
| Primary Action | Open List Detail. |
| Owner Actions | Edit name, change visibility, delete. |
| Viewer Actions | Open place only; no owner controls shown. |
| Accessibility | Name, visibility, count, and owner/viewer context announced. |

## Navigation

| Anatomy Part | Specification |
| --- | --- |
| Mobile Container | Fixed bottom nav; height 64px plus safe-area inset. |
| Items | Four items exactly. |
| Active State | Text weight, icon state, top indicator. |
| RTL | Visual order starts right for Arabic. |
| Accessibility | Navigation landmark; active item uses current-page semantics. |

## Empty State

| Anatomy Part | Specification |
| --- | --- |
| Title | Names the user's current state, not the system state. |
| Body | Explains value in one sentence. |
| CTA | One primary action only. |
| Secondary Copy | Optional privacy or scope reassurance. |
| Visual | Quiet symbolic mark only; no decorative food illustrations. |

## Skeleton Loader

| Anatomy Part | Specification |
| --- | --- |
| Shape | Matches final card/row dimensions. |
| Timing | Appears only after 300ms pending state. |
| Motion | Static blocks when reduced motion is enabled. |
| Accessibility | Hidden from screen readers; loading status announced once. |

## Badges

| Anatomy Part | Specification |
| --- | --- |
| Container | Radius 4px; height 24px minimum. |
| Content | Icon plus text unless space-constrained; icon-only requires accessible label. |
| Priority | Tried, rating, visibility, then other metadata. |
| Accessibility | Badge meaning is included in parent component accessible description. |

## Bottom Sheets

| Anatomy Part | Specification |
| --- | --- |
| Handle | Visual only; not focusable. |
| Header | Title plus close button. |
| Body | Scrollable when content exceeds max height. |
| Footer | Sticky primary action. |
| Height | Default 60% viewport; can expand to 90%; never obscure focused input. |
| Dismissal | If unsaved input exists, require confirmation before closing. |
| Accessibility | Dialog semantics; focus trapped; focus restored to trigger. |

## Toasts

| Anatomy Part | Specification |
| --- | --- |
| Position | Bottom above nav on mobile; top/end on desktop. |
| Duration | 4 seconds for success; persistent until action for blocking errors. |
| Stacking | One visible toast at a time. |
| Accessibility | Polite live region for success; assertive only for destructive failure. |

# 4. Arabic UX Specification

## Arabic Experience Decision

Arabic is the source experience. English labels are secondary adaptations.

## Core Labels

| Concept | Arabic Label | English Label |
| --- | --- | --- |
| My Lists | قوائمي | My Lists |
| Restaurants | المطاعم | Restaurants |
| Cafes | المقاهي | Cafes |
| My Profile | ملفي | My Profile |
| Create List | أضف قائمة | Create List |
| Create Place | أضف مكان | Create Place |
| Add To List | أضف للقائمة | Add To List |
| Tried | جرّبته | Tried |
| Rate Place | قيّم المكان | Rate Place |
| Edit Rating | عدّل التقييم | Edit Rating |
| Private | خاص | Private |
| Public | عام | Public |
| Private Notes | ملاحظاتك خاصة | Private Notes |

## Tone Rules

Arabic must be:

- Direct.
- Modern.
- Gulf-friendly.
- Human, not bureaucratic.
- Short enough for mobile UI.

Avoid:

- إدارة الكيانات
- تنفيذ العملية
- إنشاء سجل
- مورد غير متاح
- فشل الطلب بسبب خطأ غير معروف

Use:

- تعذر الحفظ
- الاسم مطلوب
- هذه القائمة خاصة
- أضف مكانك الأول
- ملاحظاتك لا تظهر للآخرين

## Bidi And Mixed Text

Rules:

- User-generated place names must be treated as isolated text segments.
- Latin place names inside Arabic sentences must not reorder punctuation.
- Do not concatenate Arabic labels and Latin names without directional isolation.
- Metadata separators use neutral spacing, not slash-heavy copy.

Examples:

| Scenario | Correct Pattern |
| --- | --- |
| Arabic sentence with English place name | أضفت "SALT" إلى القائمة. |
| Rating English place name | قيّمت "The Breakfast Club" بـ 8 من 10. |
| Public visibility | القائمة عامة. يمكن للمستخدمين المسجلين رؤيتها. |
| Private notes | ملاحظاتك خاصة ولا تظهر في القوائم العامة. |

## Numerals

- Rating controls use Latin digits from `1` to `10`.
- Average rating uses one decimal place, such as `8.4`.
- Counts can use localized surrounding Arabic text, such as `12 مكان`.
- Do not mix Arabic-Indic and Latin digits inside the same rating component.

## Truncation

| Content | Rule |
| --- | --- |
| Place name | Allow two lines on mobile cards, then truncate. |
| List name | Allow two lines on list cards, then truncate. |
| Badge text | Do not truncate; switch to shorter approved label. |
| Helper text | Wrap naturally; never truncate. |
| Error text | Wrap naturally; never truncate. |

## RTL Navigation

- Mobile nav visual order starts from the right.
- Back arrows point right in Arabic.
- Forward/progression arrows point left in Arabic.
- Rating scale remains ordered `1` to `10` from left to right inside the numeric control to preserve numeric scale familiarity; labels and helper text remain RTL.
- Sheet entrance motion comes from the bottom, not from a horizontal direction.

## Arabic Screen Reader Requirements

Required announcement patterns:

| UI Element | Announcement Pattern |
| --- | --- |
| Tried badge | "جرّبته" |
| Private badge | "خاص، لا يظهر إلا لك" |
| Public badge | "عام، يظهر للمستخدمين المسجلين" |
| Rating value | "8 من 10" |
| Private notes field | "ملاحظات خاصة، لا تظهر للآخرين" |
| Public list viewer | "قائمة عامة، عرض فقط" |
| Duplicate add | "المكان موجود في هذه القائمة" |

## Arabic QA Gate

Arabic UX cannot be accepted until all are true:

- Navigation labels fit at 320px width.
- All primary CTAs fit at 360px width.
- Place names with Arabic, English, and mixed text render without punctuation reversal.
- Rating values are understandable with Arabic screen reader enabled.
- Public/private visibility is understandable without color.
- Notes privacy is stated at creation, edit, and display points.
- Empty states sound natural in Arabic, not translated literally.

# 5. Accessibility Matrix

## Accessibility Standard

Minimum standard:

- WCAG 2.2 AA.
- Mobile touch targets exceed WCAG minimum by using 44px minimum interactive targets.
- Reduced-motion support is required.
- Arabic screen-reader flows are required.

## Component Accessibility Matrix

| Component | WCAG Criteria | Requirement | Validation |
| --- | --- | --- | --- |
| Button | 2.1.1, 2.4.7, 2.5.8, 4.1.2 | Keyboard accessible, visible focus, 44px mobile target, correct name/role. | Keyboard pass; screen reader announces label; visual focus visible. |
| Input | 1.3.1, 3.3.1, 3.3.2, 4.1.3 | Persistent label, associated errors, status announced. | Submit invalid form; focus moves to first error; error is announced. |
| Search Field | 1.3.1, 2.1.1, 4.1.2, 4.1.3 | Searchbox role, clear button, result count announcement. | Type query; result count announced once after debounce. |
| Place Card | 1.3.1, 2.4.3, 4.1.2 | Logical reading order; nested actions reachable separately. | Tab through card and actions; status read correctly. |
| Rating Component | 2.1.1, 2.4.3, 2.5.8, 4.1.2 | Radio group semantics, 10 reachable values, 44px targets. | Keyboard arrows select values; screen reader announces value and scale. |
| List Card | 1.3.1, 4.1.2 | Name, count, visibility, owner/viewer context announced. | Screen reader reads visibility and view mode. |
| Bottom Navigation | 2.4.1, 2.4.3, 2.4.7, 4.1.2 | Landmark, active state, logical RTL order. | Screen reader traverses Arabic order correctly. |
| Modal/Sheet | 2.1.1, 2.4.3, 2.4.7, 4.1.2 | Focus trap, title, close control, focus restore. | Open and close with keyboard; focus returns to trigger. |
| Toast | 4.1.3 | Status message announced without stealing focus. | Success and error toasts announced appropriately. |
| Skeleton | 2.2.2, 4.1.3 | Reduced motion respected; loading announced once. | Reduced motion disables shimmer. |

## Screen Accessibility Matrix

| Screen | Required Acceptance Criteria |
| --- | --- |
| Register | All fields labelled; email/password errors associated; submit button loading announced; keyboard can submit. |
| Login | Invalid credential error announced as form error; email value preserved; focus moves to error summary then field. |
| My Lists | Screen title announced; list cards expose name/count/visibility; create list button reachable before list. |
| Create List | Sheet traps focus; visibility option labels include audience explanation; invalid name announced. |
| List Detail | Owner actions and item actions have unique names; public viewer mode announces read-only context. |
| Add Place To List | Search result count announced; duplicate add success announced as non-error; create option labelled with typed name. |
| Create Place | Duplicate conflict reads as conflict with recovery; type control exposes restaurant/cafe choices. |
| Restaurants | Cards announce type and rating summary; no discovery/recommendation language. |
| Cafes | Same as Restaurants. |
| Place Detail | Rating aggregate and user's private notes are separate regions; notes privacy is announced. |
| Rate Place | Consequence copy is read before save; rating group announces selected value; notes privacy is explicit. |
| My Profile | Stats have labels and values; tried places and ratings are separate sections; private notes remain labelled private. |
| Public Lists | Sign-in denial and empty state are distinct; public list cards announce owner/viewer context. |
| Public List Detail | Read-only mode announced; owner-only controls are absent; private/not-found state avoids leaking list existence. |

## Focus Order Rules

1. Screen title.
2. Primary action.
3. Main content sections.
4. Item-level actions.
5. Secondary actions.
6. Navigation.

Exception:

- In forms and sheets, focus starts at the first required input after the sheet title.

# 6. Mobile Ergonomics Specification

## Supported Mobile Widths

| Width | Design Behavior |
| --- | --- |
| 320-359px | Compact mode; two-line labels allowed; primary CTA full width. |
| 360-430px | Default mobile mode. |
| 431-767px | Wide mobile; rating can use one row if all targets remain 44px. |

## Safe Areas

- Page horizontal margin: 16px.
- Bottom content padding: nav height plus 24px.
- Bottom sheet footer: safe-area inset plus 12px.
- Toast bottom position: bottom nav height plus 12px.

## Thumb Zones

Primary mobile actions:

- Bottom-right in LTR.
- Bottom-left or full-width bottom action in RTL depending on component; full-width is preferred for forms.
- Floating action buttons are not required and should not obscure list content.

## Touch Targets

- Minimum interactive target: 44x44px.
- Preferred primary target: 48px height.
- Icon-only controls: 44x44px with accessible label.
- Rating targets: 44x44px each.

## Bottom Navigation

- Height: 64px plus safe-area inset.
- Four items exactly.
- Icons above labels.
- Labels remain visible; icon-only nav is prohibited.
- Active state uses icon, text weight, and top indicator.

## Bottom Sheets

| Sheet | Default Height | Max Height | Keyboard Behavior |
| --- | --- | --- | --- |
| Create List | 44-56% | 80% | Footer stays visible; field remains above keyboard. |
| Add Place | 72% | 90% | Search remains sticky; results scroll. |
| Create Place | 72% | 90% | Description can scroll; save remains sticky. |
| Rate Place | 76% | 90% | Rating visible before notes; save remains sticky. |
| Visibility Change | 44-56% | 70% | Options and helper text visible without scroll. |

## Interruption Recovery

- Closing a sheet with unsaved typed input requires confirmation.
- Successful save returns to the source context.
- Failed save preserves all user-entered values.
- Session expiry opens login and returns to prior context after successful login if supported by auth flow.

## Native Web/Desktop Split

| Pattern | Mobile | Desktop |
| --- | --- | --- |
| Create List | Bottom sheet | Modal or inline panel. |
| Add Place | Bottom sheet | Modal with two-column results if space allows. |
| Rate Place | Bottom sheet | Modal. |
| Navigation | Bottom nav | Top or side nav depending on width. |
| Hover | Not used. | Hover states allowed but never required. |
| Keyboard shortcuts | Not required. | Enter submits forms; Escape closes modal if no unsaved changes. |

# 7. Screen-Level Layout Specifications

## Global Layout Grid

| Viewport | Margin | Max Content Width | Layout |
| --- | --- | --- | --- |
| Mobile | 16px | Fluid | Single column. |
| Tablet | 24px | 720px | Single column with wider cards. |
| Desktop | 32px | 1040px | Content plus optional side context. |
| Wide Desktop | 40px | 1180px | Centered content; no stretched cards. |

## Screen Specs

### Register

| Area | Specification |
| --- | --- |
| Layout | Full-height mobile page; centered 400px form on desktop. |
| Hierarchy | Brand mark/name, Arabic-first headline, email, password, primary CTA, login link. |
| Primary Action | Register. |
| Empty State | Not applicable. |
| Loading | Button loading only. |
| Error | Field-level validation; duplicate email message if backend returns conflict. |
| Mobile | CTA sticky only when keyboard is closed; otherwise below fields. |
| Accessibility | Focus starts at email; errors associated to fields. |

### Login

| Area | Specification |
| --- | --- |
| Layout | Same auth shell as Register. |
| Hierarchy | Title, email, password, primary CTA, register link. |
| Primary Action | Login. |
| Loading | Button loading. |
| Error | Invalid credentials as form-level error; preserve email. |
| Mobile | Password field and CTA visible without excessive scroll at 360px. |
| Accessibility | Error announced before returning focus to email. |

### My Lists

| Area | Specification |
| --- | --- |
| Layout | Title row, primary CTA, list sections, secondary Public Lists entry. |
| Hierarchy | "قوائمي"; Create List; private/public list cards; Public Lists secondary row. |
| Primary Action | Create List. |
| Empty | "ابدأ بقائمتك الأولى" with Create List CTA. |
| Loading | List card skeletons after 300ms. |
| Error | Retry panel; do not hide Create List unless auth fails. |
| Mobile | Cards full width; Public Lists entry below user's lists. |
| Accessibility | Cards include name, count, visibility. |

### Create List

| Area | Specification |
| --- | --- |
| Layout | Sheet/modal form. |
| Hierarchy | Title, name field, visibility control, helper text, save. |
| Primary Action | Save list. |
| Empty | Not applicable. |
| Loading | Save button loading; fields remain readable. |
| Error | Name required; visibility invalid if unsupported value appears. |
| Mobile | 44-56% sheet; expands with keyboard. |
| Accessibility | Visibility choices announce audience. |

### List Detail

| Area | Specification |
| --- | --- |
| Layout | Header, visibility badge, owner actions, place list, add action. |
| Hierarchy | List name; visibility; place count; Add Place; place cards. |
| Primary Action | Owner: Add Place. Viewer: open place only. |
| Empty | Owner: "أضف أول مكان لهذه القائمة"; viewer: "لا توجد أماكن في هذه القائمة." |
| Loading | Header skeleton plus card skeletons. |
| Error | Private/not found must not leak private list details. |
| Mobile | Header remains compact; add action near title and repeated in empty state only. |
| Accessibility | Viewer mode announces read-only state. |

### Add Place To List

| Area | Specification |
| --- | --- |
| Layout | Search field, result list, create option from no-result, sticky add confirmation if needed. |
| Hierarchy | Search; exact match; prefix matches; create option. |
| Primary Action | Select one place for this list. |
| Empty | Prompt to search by place name. |
| Loading | Result skeletons, not full page skeleton. |
| Error | Duplicate add is success-style: "Already in this list." |
| Mobile | Search sticky inside sheet; results scroll. |
| Accessibility | Search result count announced. |

### Create Place

| Area | Specification |
| --- | --- |
| Layout | Name, type, optional description, save. |
| Hierarchy | Name first; restaurant/cafe segmented control; description last. |
| Primary Action | Create place. |
| Loading | Save button loading. |
| Error | Duplicate name provides existing-place path, not a dead end. |
| Mobile | Description is capped to avoid pushing save out of reach. |
| Accessibility | Type control exposes two choices. |

### Restaurants

| Area | Specification |
| --- | --- |
| Layout | Title, create place action, place list. |
| Hierarchy | "المطاعم"; Add Restaurant; place cards. |
| Primary Action | Add restaurant. |
| Empty | "لا توجد مطاعم بعد" with Add Restaurant CTA. |
| Loading | Place card skeletons. |
| Error | Retry panel. |
| Mobile | Cards emphasize place name, tried, user rating, aggregate. |
| Accessibility | No recommendation or popularity announcements. |

### Cafes

Same as Restaurants, with cafe-specific labels and type defaults.

### Place Detail

| Area | Specification |
| --- | --- |
| Layout | Header, type, aggregate rating, current user rating/tried state, private notes if owner, list actions. |
| Hierarchy | Place name; type; tried badge; rating summary; primary action; notes/list context. |
| Primary Action | If unrated: Rate Place. If rated: Edit Rating. |
| Empty | No community ratings state if rating count is zero. |
| Loading | Header and rating skeletons. |
| Error | Not found. |
| Mobile | Primary action visible in first viewport. |
| Accessibility | Private notes region labelled private. |

### Rate Place

| Area | Specification |
| --- | --- |
| Layout | Place name, consequence copy, rating component, private notes, save. |
| Hierarchy | Place context; rating; notes; save. |
| Primary Action | Save rating. |
| Loading | Save loading. |
| Error | Rating required; note save failure preserves text. |
| Mobile | 10 values in two rows on compact widths. |
| Accessibility | Radio group, consequence copy before save. |

### My Profile

| Area | Specification |
| --- | --- |
| Layout | Taste summary header, stats, tried places, ratings with notes, my public lists. |
| Hierarchy | "ملفي"; summary; tried archive; ratings. |
| Primary Action | Open tried place or edit rating from content; no dominant settings CTA. |
| Empty | "جرّب وقيّم مكانك الأول" with link to Restaurants/Cafes. |
| Loading | Stats and row skeletons. |
| Error | Partial failure keeps loaded sections visible. |
| Mobile | Stats two columns; tried/rating rows single column. |
| Accessibility | Stats read as label plus value. |

### Public Lists

| Area | Specification |
| --- | --- |
| Layout | Secondary index under My Lists. |
| Hierarchy | Title, scope copy, public list cards. |
| Primary Action | Open public list. |
| Empty | "لا توجد قوائم عامة متاحة." |
| Loading | Public list card skeletons. |
| Error | Sign-in required, unavailable, or retry. |
| Mobile | Entered from My Lists, not nav. |
| Accessibility | Public/authenticated-only context announced. |

### Public List Detail

| Area | Specification |
| --- | --- |
| Layout | Owner context, title, public badge, read-only explanation, places. |
| Hierarchy | List name; owner; public/read-only context; place cards. |
| Primary Action | Open place. |
| Empty | "لا توجد أماكن في هذه القائمة." |
| Loading | Header and card skeletons. |
| Error | Private/not found/sign-in states. |
| Mobile | No owner controls; viewer actions remain clear. |
| Accessibility | Read-only mode announced. |

# 8. Core Loop Optimization Report

## Loop 1: First Session

Goal: user creates useful personal value without onboarding screens.

Flow:

1. Register.
2. Land on My Lists empty state.
3. Tap Create List.
4. Save list.
5. Land on new List Detail empty state.
6. Tap Add Place.

Acceptance criteria:

- No marketing/landing screen after login.
- Empty state has one CTA.
- User always knows the next action.
- No recommendations or discovery surfaces appear.

## Loop 2: Create List

Optimized flow:

1. Tap Create List.
2. Enter list name.
3. Choose visibility with default private.
4. Save.

Visibility helper:

- Private: "Only you can view this list."
- Public: "Signed-in users can view this list."

Arabic:

- خاص: "لا يظهر إلا لك."
- عام: "يمكن للمستخدمين المسجلين رؤيته."

## Loop 3: Add Place To List

Optimized flow:

1. Tap Add Place from List Detail.
2. Search by place name only.
3. Select exact or prefix match.
4. If no result, choose Create Place using typed name.
5. Save to this one list only.

Rejected:

- Adding to multiple lists at once.
- Recent places module.
- Recommendations.

Duplicate behavior:

- If place already exists in list, show idempotent success, not error.

## Loop 4: Create Place

Optimized flow:

1. Name is prefilled when coming from no-result search.
2. Type is preselected when launched from Restaurants or Cafes.
3. Description remains optional and visually secondary.
4. Duplicate name conflict shows existing place path.

## Loop 5: Rate Place And Tried State

Optimized flow:

1. User opens Rate Place.
2. Consequence copy appears before rating save.
3. User selects 1-10 rating.
4. Optional private notes.
5. Save rating.
6. Confirmation explains Tried state and list removal.
7. Place Detail shows Tried badge and Add to List action if user wants to re-add.

Mandatory copy:

- Before save: "Saving a rating marks this place as tried and removes it from your lists. You can add it back later."
- After save: "Rating saved. Marked as Tried. Removed from your lists."
- Re-add tried: "This place stays marked as Tried."

## Loop 6: Public/Private Visibility

Optimized flow:

1. Visibility shown on every list card and list detail header.
2. Changing visibility shows audience explanation.
3. Public viewer sees read-only state.
4. Private denial does not reveal private content.
5. Rating notes never appear in public contexts.

## Empty State Strategy

| Context | Emotional Job | CTA |
| --- | --- | --- |
| My Lists empty | Turn blank account into personal collection. | Create List. |
| New List empty | Move from list shell to saved place. | Add Place. |
| Restaurants empty | Clarify category is empty, not broken. | Add Restaurant. |
| Cafes empty | Clarify category is empty, not broken. | Add Cafe. |
| Profile empty | Explain tried archive starts with ratings. | Go to Restaurants/Cafes. |
| Public Lists empty | Avoid discovery promise. | Return to My Lists. |

## Error State Strategy

| Error Type | UX Rule |
| --- | --- |
| Validation | Inline, field-specific, preserve input. |
| Duplicate place | Conflict with path to existing place. |
| Duplicate list item | Idempotent success copy. |
| Unauthorized list access | Neutral private/not-found language. |
| Guest access | Sign-in required; no list content preview. |
| Expired session | Re-auth prompt; preserve source context where possible. |
| Network failure | Retry, keep stale content if available. |
| Notes privacy concern | Re-state that notes are private. |

## Performance Perception Strategy

| Moment | Rule |
| --- | --- |
| 0-80ms | Press state appears. |
| 80-300ms | Button loading only for mutations. |
| 300ms+ | Skeleton appears for page/section loads. |
| 1s+ | Keep skeleton stable; do not shift layout. |
| 4s+ | Show still-loading affordance if content remains unavailable. |
| Failed reload | Preserve stale visible content and show retry panel. |
| Reduced motion | Static skeleton blocks; no shimmer. |

Mutation loading:

- Create List: save button loading; navigate after success.
- Create Place: save button loading; show conflict if duplicate.
- Add To List: selected row loading; success closes sheet.
- Rating: save button loading; confirmation after success.
- Visibility: selected option loading; badge updates after success.

# 9. Personal Taste Library Experience Model

## Model Definition

The product is a personal taste library made from existing MVP objects:

- Lists = shelves of intent.
- Places = saved objects.
- Ratings = taste marks.
- Tried state = memory status derived from ratings.
- Notes = private memory.
- Public lists = shared shelves visible only to authenticated users.

No new data model is introduced.

## Experience Grammar

| Object | Experience Role | UI Expression |
| --- | --- | --- |
| List | A shelf of places the user wants to try or share. | Card/row with name, count, visibility. |
| Place | The object being remembered. | Strong name, type, rating summary, tried state. |
| Rating | The user's taste mark. | Numeric mark with semantic helper. |
| Tried | A completed memory. | Persistent badge and archive presence. |
| Note | Private memory. | Visually separated private block. |
| Public List | Shared shelf, not social feed. | Read-only viewer context and owner/provenance. |

## Differentiation Rules

- The app must not look like a review site.
- The app must not look like a maps or discovery product.
- The app must not make public activity feel primary.
- The app must make private memory feel valuable.
- The app must show Tried as progress, not as removal.
- The app must make each place feel saved by the user, not fetched from a marketplace.

## Visual Signature

The signature pattern is the "taste mark":

- A compact numeric rating mark.
- A Tried badge.
- A private-note block.
- A shelf/list context.

Together, these make the place card feel like a personal object.

## Profile As Taste Archive

My Profile is accepted as primary navigation only under this model:

- It is not settings-first.
- It is not account-first.
- It opens with taste summary.
- It prioritizes tried places and ratings.
- It reinforces private notes.

# 10. Updated Design Readiness Assessment

## Readiness Score

Updated design readiness score: **8.6 / 10**.

## Score Rationale

| Area | Score | Evidence |
| --- | --- | --- |
| Navigation readiness | 8.7 | Four-tab nav revalidated with constraints, public-list placement, and profile role. |
| Arabic/RTL readiness | 8.6 | Operational language, bidi, numerals, labels, screen-reader, and QA gates defined. |
| Screen specification readiness | 8.5 | All MVP screens now include layout, hierarchy, states, mobile behavior, and accessibility. |
| Component readiness | 8.6 | Anatomy, states, behavior, accessibility, and RTL rules defined for major components. |
| Accessibility readiness | 8.5 | WCAG 2.2 criteria mapped to components and screens. |
| Mobile readiness | 8.7 | Thumb zones, safe areas, sheets, keyboard, nav, and platform split specified. |
| Rating/tried UX readiness | 8.6 | Consequence copy, rating semantics, confirmation, add-back path, and rejected undo documented. |
| Public/private UX readiness | 8.5 | Audience labels, read-only states, privacy separation, and guest denial specified. |
| Personal taste differentiation | 8.5 | Taste-library model, visual grammar, and profile archive role defined using existing MVP objects. |
| Performance perception | 8.5 | Loading thresholds, skeleton behavior, stale content, retry, and reduced-motion fallback specified. |

## Remaining Non-Blocking Decisions

| Topic | Decision | Reason |
| --- | --- | --- |
| One-tap undo for rating list removal | Rejected for MVP. | It requires restoration of prior list memberships, which is outside approved behavior. |
| Recent places module | Rejected for MVP. | It adds a recency surface beyond current requirements. |
| Public Lists top-level tab | Rejected. | It would shift the product toward discovery/social browsing. |
| Dark mode | Deferred. | Not a Critical/High audit blocker; light-first design remains the MVP target. |

## Final Recommendation

**Ready For UI Implementation After This Remediation Package Is Adopted.**

Engineering and UI design can start implementation only if this document is treated as the controlling design handoff for the remediated areas.

No Critical or High audit finding remains open.
