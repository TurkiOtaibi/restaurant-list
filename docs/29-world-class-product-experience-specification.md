# 29. World-Class Product Experience Specification

> Canonical status note (2026-06-24): This document is historical design context, not the current implementation contract where it conflicts with later approved product decisions. Current canonical decisions are: product name `سجل`; primary navigation `قوائمي`, `الأماكن`, `صفحتي`; restaurants/cafes/ice cream are filters inside Places; ratings support 1-10 in 0.5 increments; profile uses `تقييماتك` as the single rating/tried archive.

## Document Purpose

This document defines the UI, UX, interaction, accessibility, and design system foundation for the Restaurant & Cafe Wishlist Tracker as a premium production product.

This is a design specification only.

No code, implementation tasks, or feature delivery backlog is defined here.

## Product Experience Positioning

The product should feel like a focused, premium personal tracker for restaurants and cafes. It should be fast, quiet, polished, and emotionally satisfying without becoming a restaurant discovery marketplace.

Target product quality:

- Linear-level speed and restraint.
- Airbnb-level trust, spacing, and content clarity.
- Notion-level composability and calm information density.
- Sofa-level personal collection feeling.

Avoid:

- Legacy enterprise dashboards.
- Heavy admin tables in user-facing flows.
- Map-first mental models.
- Yelp-style public review density.
- Google Maps-style location exploration.
- Dark, noisy, gradient-heavy visual language.

## Experience North Star

Arabic-first users should feel that the product was designed natively for them, not translated after the fact.

The interface should make these actions feel effortless:

- Create a list.
- Save a restaurant or cafe.
- Decide what to try next.
- Rate a place after trying it.
- Revisit personal tried history.
- Share a curated public list with authenticated users.

## 1. Product Design Vision

### Vision Statement

Design a premium Arabic-first place tracking product that helps people collect, remember, and close the loop on restaurants and cafes they care about.

The experience should feel personal, minimal, and trustworthy. The product should be about the user's own taste and lists, not a noisy marketplace.

### Product Personality

- Calm.
- Clear.
- Fast.
- Warm.
- Tasteful.
- Private by default.
- Confident without being loud.

### Experience Keywords

- "My places."
- "My taste."
- "My lists."
- "Tried."
- "Worth remembering."

### Arabic Product Tone

Arabic should use concise, modern Gulf-friendly product language.

Preferred Arabic labels:

- قوائمي
- المطاعم
- المقاهي
- ملفي
- أضف قائمة
- أضف مكان
- جرّبته
- قيّم المكان
- خاص
- عام

Avoid overly formal or literal UI phrasing:

- إدارة الكيانات
- إنشاء سجل
- تنفيذ عملية
- مورد غير متاح

### Visual Direction

The UI should be:

- Light by default.
- Content-led.
- Low chrome.
- Softly structured.
- Generous on mobile.
- Dense only where scanning benefits the user.
- Built around cards, rows, sheets, and calm typography.

The product should not rely on large decorative hero sections after login. The authenticated app should open directly into useful content.

## 2. Design Principles

### 1. Content Before Chrome

Places, lists, ratings, and tried states are the product. Navigation and controls should support them quietly.

### 2. One Primary Action Per Screen

Each screen should have one obvious next action:

- My Lists: Create list.
- List Detail: Add place.
- Restaurants/Cafes: Add or rate a place from context.
- Profile: Review tried places.

### 3. Mobile First, Not Mobile Also

All primary workflows must work comfortably on a phone with one hand. Desktop layouts should expand the mobile mental model, not invent a second product.

### 4. RTL Is Native

Spacing, motion, icons, alignment, navigation order, and reading rhythm must be designed for RTL first.

### 5. Progressive Disclosure

Show the next useful decision, not every possible action. Secondary actions should appear inside menus, sheets, or contextual rows.

### 6. Fast Scanning

Users should understand a list or place row in under two seconds:

- Name.
- Type.
- Tried state.
- Average rating.
- List status.

### 7. Privacy Is Visible

Private notes and private lists must feel protected. Visibility labels should be clear and persistent.

### 8. Completion Feels Rewarding

Creating a list, adding a place, and rating a place should produce small, polished confirmation moments.

### 9. Calm Errors

Errors should be specific, recoverable, and inline where possible. Avoid alarming language unless data loss or account security is involved.

### 10. No Discovery Drift

Even in a world-class design, the product should not visually imply maps, nearby search, restaurant rankings, trending, or recommendations unless those features are explicitly introduced in a future production roadmap phase.

## 3. Information Architecture Review

### Current IA Assessment

Current IA includes:

- Auth.
- My Lists.
- Places.
- Public Lists.
- Profile.
- Rating page.

Existing docs define the intended main navigation:

- My Lists.
- Restaurants.
- Cafes.
- My Profile.

### IA Issues

| Issue | Current Direction | Design Risk |
| --- | --- | --- |
| Places screen combines restaurants and cafes | Current implementation uses a generic Places area | Weak match to stated navigation and user mental model |
| Public Lists appears as a top-level item | Current frontend includes Public Lists in nav | Competes with the four primary product areas |
| Place Detail is underdeveloped in UI | Rating page exists, but detail is not a full content destination | Place context can feel thin |
| Create Place is separated from Add Place | Minimal foundation is functional | User may not know whether to create or add |
| Profile is functional but utilitarian | Stats and tried places exist | Does not yet feel personal or premium |

### Recommended IA

Primary navigation should remain exactly four items:

```text
قوائمي | المطاعم | المقاهي | ملفي
My Lists | Restaurants | Cafes | My Profile
```

Secondary destinations:

```text
Auth
|-- Register
|-- Login

My Lists
|-- List Index
|-- Create List
|-- List Detail
|   |-- Add Place sheet
|   |-- Create Place sheet
|   |-- Rate Place sheet
|-- Public Lists tab or section
|-- Public List Detail

Restaurants
|-- Restaurant Index
|-- Place Detail
|-- Add To List sheet
|-- Rate Place sheet

Cafes
|-- Cafe Index
|-- Place Detail
|-- Add To List sheet
|-- Rate Place sheet

My Profile
|-- Summary
|-- Tried Places
|-- My Ratings
|-- Public Lists owned by me
```

### Justification For IA Changes

- Restaurants and Cafes deserve separate primary destinations because the main navigation requires them and users often think by type.
- Public Lists should be a secondary surface because the product is primarily personal, not a public browsing network.
- Add Place should be a contextual sheet because the user usually adds from a list, restaurant, cafe, or place context.
- Rate Place should be a sheet on mobile and a modal/panel on desktop because rating is a focused, short action.
- My Profile should become the personal archive and taste summary, not just account stats.

## 4. Design System Specification

### Design System Name

Working name: **Dhawq UI**.

Arabic concept: ذوق, meaning taste.

### Color System

The palette should feel premium, warm, and content-focused without becoming beige-heavy or decorative.

#### Neutral Scale

| Token | Use | Hex |
| --- | --- | --- |
| `neutral.0` | Page background | `#FBFAF7` |
| `neutral.50` | Raised surface | `#FFFFFF` |
| `neutral.100` | Subtle surface | `#F5F3EF` |
| `neutral.200` | Border subtle | `#E8E3DA` |
| `neutral.300` | Border strong | `#D8D0C4` |
| `neutral.500` | Secondary text | `#766D61` |
| `neutral.700` | Body text | `#2F2B26` |
| `neutral.900` | Primary text | `#171411` |

#### Brand Scale

Brand should not dominate the UI. Use it for primary actions and selected states.

| Token | Use | Hex |
| --- | --- | --- |
| `brand.50` | Soft selected background | `#EEF7F3` |
| `brand.100` | Hover background | `#DCEFE7` |
| `brand.500` | Primary action | `#187A5E` |
| `brand.600` | Primary action hover | `#12664E` |
| `brand.700` | Pressed primary | `#0D513F` |

#### Accent Scale

Use sparingly for ratings and warmth.

| Token | Use | Hex |
| --- | --- | --- |
| `accent.gold.100` | Rating soft background | `#FFF3D6` |
| `accent.gold.500` | Rating active | `#D99116` |
| `accent.rose.100` | Destructive soft | `#FFE8E5` |
| `accent.rose.600` | Destructive | `#C93A2E` |
| `accent.blue.100` | Informational soft | `#E8F1FF` |
| `accent.blue.600` | Informational | `#2563EB` |

### Semantic Colors

| Token | Purpose |
| --- | --- |
| `surface.page` | Main app background |
| `surface.card` | Card and sheet background |
| `surface.raised` | Floating menus, modals |
| `text.primary` | Names, headings |
| `text.secondary` | Metadata |
| `text.tertiary` | Placeholders |
| `border.subtle` | Card borders |
| `border.focus` | Keyboard focus ring |
| `action.primary` | Primary CTA |
| `action.secondary` | Secondary CTA |
| `state.success` | Success text and icon |
| `state.warning` | Validation warning |
| `state.error` | Error text and destructive |
| `state.tried` | Tried badge |
| `state.public` | Public visibility badge |
| `state.private` | Private visibility badge |

### Typography

Arabic-first typography should use a modern Arabic UI font with strong readability.

Recommended font stack:

```text
"IBM Plex Sans Arabic", "Noto Sans Arabic", "Inter", system-ui, sans-serif
```

#### Type Scale

| Token | Size | Line Height | Use |
| --- | --- | --- | --- |
| `display.sm` | 32 | 40 | Auth title, profile hero |
| `heading.lg` | 26 | 34 | Screen title |
| `heading.md` | 22 | 30 | Section title |
| `heading.sm` | 18 | 26 | Card title |
| `body.lg` | 17 | 28 | Important body |
| `body.md` | 15 | 24 | Default body |
| `body.sm` | 13 | 20 | Metadata |
| `label.md` | 14 | 20 | Buttons, inputs |
| `caption` | 12 | 18 | Helper text, badges |

Typography rules:

- Arabic line height should be generous.
- Avoid negative letter spacing.
- Use medium weight for headings, not heavy bold everywhere.
- Numbers in ratings should align cleanly with Arabic text.
- Truncate place names only after two lines on mobile.

### Spacing Scale

Use a 4px base scale.

| Token | Value | Use |
| --- | --- | --- |
| `space.1` | 4 | Tight icon/text gaps |
| `space.2` | 8 | Small component padding |
| `space.3` | 12 | Form internal gaps |
| `space.4` | 16 | Default spacing |
| `space.5` | 20 | Card padding mobile |
| `space.6` | 24 | Section gap |
| `space.8` | 32 | Page padding desktop |
| `space.10` | 40 | Large section gap |
| `space.12` | 48 | Auth layout spacing |

### Radius Scale

| Token | Value | Use |
| --- | --- | --- |
| `radius.xs` | 6 | Inputs, chips |
| `radius.sm` | 8 | Buttons, compact cards |
| `radius.md` | 12 | Place cards, sheets |
| `radius.lg` | 16 | Modal panels |
| `radius.full` | 999 | Pills, avatar |

Cards should not become overly bubbly. Most product cards should use 10-12px radius.

### Elevation System

Use elevation only to clarify layers.

| Token | Use |
| --- | --- |
| `elevation.0` | Page surface |
| `elevation.1` | Cards |
| `elevation.2` | Sticky bottom bar |
| `elevation.3` | Dropdowns and menus |
| `elevation.4` | Modal and bottom sheet |

### Shadow System

| Token | Value |
| --- | --- |
| `shadow.card` | `0 1px 2px rgba(23,20,17,.05)` |
| `shadow.raised` | `0 8px 24px rgba(23,20,17,.10)` |
| `shadow.modal` | `0 24px 60px rgba(23,20,17,.18)` |

Avoid dramatic shadows. The product should feel tactile but quiet.

### Motion System

| Token | Duration | Use |
| --- | --- | --- |
| `motion.instant` | 80ms | Press feedback |
| `motion.fast` | 140ms | Button hover, chip selection |
| `motion.base` | 220ms | Sheet enter, toast enter |
| `motion.slow` | 320ms | Modal transition |

Easing:

- Enter: `cubic-bezier(.16, 1, .3, 1)`
- Exit: `cubic-bezier(.7, 0, .84, 0)`
- Standard: `cubic-bezier(.2, 0, 0, 1)`

### Animation Principles

- Motion should confirm state, not entertain.
- Respect reduced motion.
- RTL motion should mirror direction.
- Sheets should rise from bottom on mobile.
- Navigation transitions should be subtle and fast.
- Rating selection can include a small scale response, no bounce-heavy animation.

### Iconography Guidelines

Icon style:

- 1.75px stroke.
- Rounded line caps.
- 20px default.
- 24px for primary action icons.

Icon rules:

- Icons must mirror in RTL when directional.
- Do not use food illustrations as navigation replacements.
- Use icons for recognition, text for meaning.
- Public/private icons must be paired with text.

Recommended icon meanings:

- Lists: stacked lines.
- Restaurants: fork/knife.
- Cafes: cup.
- Profile: user circle.
- Tried: check circle.
- Rating: star or numeric dot scale.
- Private: lock.
- Public: globe.

### Accessibility Requirements

Target:

- WCAG 2.2 AA minimum.
- WCAG 2.2 AAA for body text contrast where practical.

Requirements:

- Keyboard access for every action.
- Visible focus state.
- Screen reader labels for rating controls.
- Form validation announced clearly.
- Dialogs trap focus and restore focus on close.
- Toasts use polite live regions.
- Destructive confirmations require explicit action.
- Touch targets minimum 44x44px.
- Color is never the only status cue.

### RTL Rules

- Default document direction for Arabic surfaces is `rtl`.
- Main navigation order in Arabic starts from the right.
- Primary actions sit in the dominant thumb zone on mobile.
- Directional icons mirror.
- Horizontal animations mirror.
- Text aligns right by default.
- Numbers remain readable and may use tabular numerals for rating consistency.
- Mixed Arabic/English content must preserve place names without broken punctuation.
- Input icons should appear on the logical start or end, not fixed left/right.

## 5. Component Library

### Component Contract Matrix

Every component in the system must define purpose, states, behavior, and accessibility expectations.

| Component | Purpose | Required States | Behavior | Accessibility |
| --- | --- | --- | --- | --- |
| Buttons | Trigger explicit actions | Default, hover, pressed, focus, disabled, loading | One primary per screen; preserve width while loading | 44px minimum target; accessible name required |
| Inputs | Capture user data | Empty, filled, focused, disabled, error, success | Visible labels; inline validation; preserve input on error | Programmatic labels and error association |
| Search field | Search place names only | Empty, typing, results, no results, error | Debounced place-name search; clear button | `searchbox`; announce result count |
| Cards | Group related content | Default, pressed, selected, loading, empty | Tappable only when one primary action exists | Clear role/label; avoid nested interactive conflict |
| Place cards | Show restaurant/cafe summaries | Unrated, rated, tried, in-list, loading, error | Primary tap opens detail; actions contextual | Tried and rating status announced |
| Rating component | Capture 1-10 rating | Empty, selected, focused, error, disabled | Numeric selection; notes optional/private | Radio group semantics; arrow-key support |
| List component | Show list summary | Private, public, empty, loading, owner, viewer | Owner actions visible only to owner | Visibility text plus icon |
| Navigation | Move between main areas | Default, active, focus, collapsed, unavailable | Four main items only; active state persistent | `aria-current`; labelled navigation |
| Empty states | Explain absence of content | First use, no results, unavailable, permission | One primary action; concise copy | Heading describes state |
| Skeleton loaders | Preserve layout while loading | Card, row, detail, form, disabled by reduced motion | Match final content shape | Hidden from screen readers; loading announced |
| Badges | Communicate status | Tried, public, private, unrated, compact | Text and icon; no color-only meaning | Meaningful text when read aloud |
| Chips | Toggle light filters | Default, selected, focus, disabled | Toggle or remove; not primary nav | Toggle state announced |
| Modals | Focus desktop short tasks | Opening, open, closing, error, loading | Trap focus; explicit close | Labelled by title; restore focus |
| Bottom sheets | Focus mobile short tasks | Collapsed, opening, open, expanded, closing, loading | Sticky action; keyboard-aware height | Same focus model as modal |
| Toasts | Confirm non-blocking outcomes | Success, info, error, undo, dismissed | Short duration; action when useful | Polite live region |
| Error states | Support recovery | Field, inline, page, permission, network | Specific message plus recovery action | Error summary for complex forms |

### Buttons

Purpose:

- Trigger explicit actions.

Variants:

- Primary.
- Secondary.
- Tertiary.
- Destructive.
- Icon.
- Floating action.

States:

- Default.
- Hover.
- Pressed.
- Focus.
- Disabled.
- Loading.

Behavior:

- One primary button per screen or sheet.
- Loading buttons preserve width.
- Destructive buttons require confirmation for irreversible actions.

Accessibility:

- Minimum 44px height.
- Text label required, or icon button must have an accessible name.
- Focus ring visible against all backgrounds.

### Inputs

Purpose:

- Capture text, email, password, list names, place names, and notes.

States:

- Empty.
- Filled.
- Focused.
- Disabled.
- Error.
- Success.
- Loading validation.

Behavior:

- Labels are always visible.
- Helper text sits below the field.
- Errors appear below the field and are announced.
- Notes fields show optional/private helper text.

Accessibility:

- Labels programmatically associated.
- Errors associated with fields.
- Password fields support reveal/hide with accessible toggle.

### Search Field

Purpose:

- Search place names only.

States:

- Empty.
- Typing.
- Results.
- No results.
- Error.

Behavior:

- Placeholder: "ابحث باسم المكان" / "Search by place name".
- No location or discovery language.
- Clear button appears after input.
- Results update after a short debounce.

Accessibility:

- Search field uses `searchbox`.
- Result count announced.
- Clear button has accessible label.

### Cards

Purpose:

- Display grouped content such as lists, places, tried places, and profile stats.

States:

- Default.
- Pressed.
- Selected.
- Loading.
- Empty.

Behavior:

- Entire card may be tappable only when there is one primary navigation action.
- Secondary actions move to a menu or visible small controls.

Accessibility:

- Tappable card must expose clear role and label.
- Avoid nested interactive conflicts.

### Place Cards

Purpose:

- Present a restaurant or cafe in a scannable format.

Content hierarchy:

1. Place name.
2. Type.
3. Tried badge if applicable.
4. Average rating and count.
5. List/rating actions.

States:

- Unrated.
- Community rated.
- Tried by current user.
- In list.
- Loading.
- Error.

Behavior:

- Primary tap opens Place Detail.
- Add and Rate actions are available contextually.
- Tried badge persists if re-added to a list.

Accessibility:

- Tried state announced as status.
- Rating count announced as text, not icon-only.

### Rating Component

Purpose:

- Capture integer rating from 1 to 10.

Variants:

- Large input for rating sheet.
- Compact display for cards.
- Read-only aggregate display.

States:

- Empty required.
- Selected.
- Focused value.
- Error.
- Disabled.

Behavior:

- Numeric segmented control from 1 to 10 on mobile.
- Keyboard arrow keys adjust value.
- Current selection is visually strong.
- Optional notes field appears below.

Accessibility:

- Use radio group semantics.
- Each value announced as "Rating 8 of 10".
- Required status announced.

### List Component

Purpose:

- Represent a user list or public list.

Content:

- List name.
- Visibility badge.
- Place count.
- Last updated date if useful.

States:

- Private.
- Public.
- Empty.
- Loading.
- Owner.
- Public viewer.

Behavior:

- Owner sees edit, visibility, delete, and add controls.
- Public viewer sees read-only content.

Accessibility:

- Visibility is text plus icon.
- Owner controls have explicit labels.

### Navigation

Purpose:

- Provide persistent access to four main areas.

Mobile:

- Bottom navigation with four items.
- Order in Arabic RTL: ملفي, المقاهي, المطاعم, قوائمي visually from left to right if using platform convention, but reading order should preserve RTL semantics.
- Active item uses text, icon, and selected indicator.

Desktop:

- Left or top navigation depending on layout density.
- Keep four main items only.

Accessibility:

- Current page uses `aria-current`.
- Icons have decorative role when text is present.

### Empty States

Purpose:

- Help users take the next meaningful action.

States:

- No lists.
- Empty list.
- No restaurants.
- No cafes.
- No tried places.
- No search results.
- No public lists.

Behavior:

- One primary action.
- Short copy.
- No oversized illustration required.

Accessibility:

- Empty state heading describes the state.
- CTA label is explicit.

### Skeleton Loaders

Purpose:

- Preserve layout while data loads.

Rules:

- Skeleton shape matches final content.
- Avoid pulsing too strongly.
- Use subtle shimmer only if reduced motion allows.
- Do not show skeletons for very fast actions under 300ms.

Accessibility:

- Loading region announces "Loading".
- Skeletons are hidden from screen readers.

### Badges

Purpose:

- Show status.

Types:

- Tried.
- Public.
- Private.
- New.
- Unrated.

States:

- Default.
- Compact.
- High contrast.

Behavior:

- Use text and icon.
- Never color-only.

Accessibility:

- Badge text must be meaningful when read aloud.

### Chips

Purpose:

- Filter by type, state, or quick category when allowed.

States:

- Default.
- Selected.
- Focus.
- Disabled.

Behavior:

- Chips are not used for primary navigation.
- Selected chips are removable or toggleable.

Accessibility:

- Toggle state announced.

### Modals

Purpose:

- Focus desktop users on short forms or confirmations.

Use for:

- Confirm delete list.
- Edit rating on desktop.
- Visibility explanation.

Behavior:

- Escape closes non-destructive modals.
- Destructive confirmation requires explicit action.

Accessibility:

- Focus trap.
- Labelled by title.
- Return focus to trigger.

### Bottom Sheets

Purpose:

- Primary mobile container for focused actions.

Use for:

- Add place.
- Rate place.
- Create list.
- Visibility selection.

Behavior:

- Open from bottom.
- Drag handle optional.
- Primary action sticky at bottom.
- Sheet max height respects keyboard.

Accessibility:

- Same focus and labeling rules as modals.

### Toasts

Purpose:

- Confirm completed actions without blocking.

Types:

- Success.
- Error.
- Info.

Behavior:

- Short, undo-capable where relevant.
- Do not use toasts for form validation.
- Appears near bottom on mobile above navigation.

Accessibility:

- Polite live region.
- Action button accessible.

### Error States

Purpose:

- Help recovery.

Types:

- Field error.
- Inline section error.
- Full-page unavailable state.
- Permission state.
- Network retry state.

Behavior:

- Permission errors use neutral language.
- Retry action appears when useful.
- Errors preserve user input.

Accessibility:

- Error summary available for multi-field forms.

## 6. UX Guidelines

### Language

Use concise verbs.

Arabic preferred:

- إنشاء
- إضافة
- حفظ
- تقييم
- تعديل
- حذف

Avoid:

- Long instructional paragraphs.
- Technical implementation language.
- Generic "Submit".

### Action Hierarchy

- Primary action: filled button.
- Secondary action: outline button.
- Tertiary action: text button.
- Destructive action: red text or red button only in confirmation context.

### Form UX

- Labels always visible.
- Required fields clear but not noisy.
- Inline validation after blur or submit.
- Preserve entered values after errors.
- Use sheets for short mobile forms.

### List UX

- Lists are scannable rows/cards.
- Place count is visible.
- Visibility is visible.
- Empty list has Add Place action.

### Rating UX

- Rating is mandatory.
- Notes are optional and private.
- On save, user sees tried confirmation.
- First rating removal from lists should be explained gently:
  - "تم نقل المكان إلى جرّبته وإزالته من قوائمك."
  - "Marked as tried and removed from your lists."

### Privacy UX

- Private notes include a lock cue.
- Public list visibility includes short helper text.
- Public list viewers never see owner-only controls.

## 7. Mobile UX Guidelines

### Mobile Layout

- Bottom navigation is primary.
- Content max width is full viewport with 16-20px side padding.
- Primary action sits near thumb reach.
- Long forms use one column.
- Sheets replace desktop modals.

### One-Handed Usage

- Frequent actions should live in lower half:
  - Add place.
  - Save rating.
  - Create list.
- Dangerous actions should not sit in accidental thumb zones without confirmation.

### Mobile Patterns

- Pull-to-refresh may be used for list screens.
- Sticky bottom action bar for forms.
- Swipe gestures should not be required.
- Search expands inline at top of Restaurants/Cafes.
- Rating control should not require precise tapping on small icons.

### Mobile Navigation

Primary tabs:

- قوائمي
- المطاعم
- المقاهي
- ملفي

Rules:

- Four items only.
- Active icon and label.
- No floating public-list nav item.
- Public lists live inside My Lists or shared/public context.

## 8. Accessibility Specification

### Standard

Minimum target:

- WCAG 2.2 AA.

Enhanced target:

- AAA contrast for primary text where practical.
- Full keyboard support.
- Screen reader tested critical flows.

### Keyboard Requirements

- Tab order follows visual/logical order.
- Focus never enters hidden content.
- Modals and sheets trap focus.
- Escape closes non-destructive overlays.
- Rating component supports arrow keys and direct value selection.

### Screen Reader Requirements

- Page title announced.
- Main navigation labelled.
- Active nav item announced.
- Tried badge announced.
- Public/private status announced.
- Rating values announced.
- Toasts announced politely.

### Visual Accessibility

- Minimum 4.5:1 text contrast.
- Minimum 3:1 large text and icon contrast.
- Focus ring visible at all times.
- Do not rely on green/red alone.

### Motion Accessibility

- Respect reduced motion.
- Disable shimmer and non-essential transitions when reduced motion is enabled.
- Keep critical state changes visible without animation.

### RTL Accessibility

- Logical DOM order should match reading order.
- Directional icons mirror.
- Mixed language labels are tested with screen readers.

## 9. Interaction Design Specification

### User Flows

#### Registration

1. User opens Register.
2. User enters email and password.
3. Form validates inline.
4. User submits.
5. Success creates authenticated session.
6. User lands on My Lists empty or populated state.

Friction reducers:

- Autofocus first field.
- Preserve entered email after validation failure.
- Keep social login absent.

#### Login

1. User opens Login.
2. User enters email and password.
3. User submits.
4. Invalid credentials show a calm inline error.
5. Success lands on last intended authenticated page or My Lists.

Friction reducers:

- Submit on enter.
- Session-expired message appears only when relevant.

#### Create List

1. User taps Create List.
2. Bottom sheet opens with name field focused.
3. Visibility defaults to Private.
4. User enters name.
5. User saves.
6. Sheet closes.
7. New list appears with a short success confirmation.

Friction reducers:

- Duplicate names are allowed without warning.
- Visibility helper text is short and direct.

#### Add Place

1. User taps Add Place from List Detail.
2. Bottom sheet opens.
3. User searches by place name.
4. Matching places appear as place cards.
5. If no match exists, Create New Place option appears.
6. User selects or creates one place.
7. Place is added to the current list.

Friction reducers:

- Target list is implied by context.
- One add action targets one list.
- Duplicate add returns success copy, not an alarming error.

#### Add Place To List From Place Context

1. User opens Place Detail or Restaurants/Cafes card action.
2. User taps Add To List.
3. Sheet shows owned lists.
4. User chooses one list.
5. User confirms.
6. Place appears in selected list.

Friction reducers:

- Lists show visibility and count.
- Tried status remains visible for tried places.

#### Rate Place

1. User taps Rate Place or Edit Rating.
2. Rating sheet opens.
3. User selects value from 1 to 10.
4. User optionally adds private notes.
5. User saves.
6. Place becomes Tried.
7. First rating removes place from user's lists.
8. Success confirmation explains the change.

Friction reducers:

- Numeric selector is large.
- Notes privacy is explicit.
- Existing rating is prefilled when editing.

#### View Profile

1. User opens My Profile.
2. Summary stats load first.
3. Tried places and user ratings appear below.
4. User can open a place or edit rating.

Friction reducers:

- Stats are glanceable.
- Private notes are visually separated from public content.

#### Public List Browsing

1. Authenticated user opens public list from shared context or My Lists secondary section.
2. Public list detail loads read-only.
3. User sees owner display name, visibility, and place cards.
4. User can open place detail.
5. User can add a place to one of their own lists from place context.

Friction reducers:

- Guest users see Sign in to continue.
- Non-owner never sees owner controls.

### Navigation Interaction

- Tap active tab scrolls current screen to top.
- Switching primary tabs preserves last scroll position when practical.
- Auth screens have no app navigation.

### List Creation

- Opens as sheet on mobile.
- Name field focused.
- Visibility defaults to private.
- Save returns to My Lists or List Detail with confirmation.

### Add Place

- From List Detail, Add Place opens a sheet.
- Sheet offers:
  - Existing place search by name.
  - Create new place if no match.
- One target list is implied by context.
- Success updates list immediately.

### Rating

- Rate opens sheet or focused page.
- Numeric 1-10 selector appears above notes.
- Save updates tried indicator and rating aggregate.
- First rating removal from lists is confirmed.

### Visibility

- Visibility change uses a segmented control or select with helper text.
- Public/private status updates in place.
- Public status uses clear text: "Signed-in users can view."

### Public List Browsing

- Public list entry point is secondary.
- Public list detail is read-only for non-owner.
- Add to my list is available from place context, not as a bulk action.

## 10. Screen Inventory Review

### Keep

- Register.
- Login.
- My Lists.
- Create List.
- List Detail.
- Restaurants.
- Cafes.
- Place Detail.
- Create Place.
- Add Place.
- Rate Place.
- My Profile.
- Public List Detail.

### Add

- Account unavailable/session expired state.
- Network retry state.
- List delete confirmation.
- Visibility explanation sheet.
- Rating saved confirmation state.
- Place duplicate conflict state.
- Empty search result state.
- Profile empty tried state.

### Remove Or Demote

- Public Lists as a top-level nav item should be demoted into My Lists or contextual sharing.
- Generic Places as a primary product area should become Restaurants and Cafes for the main IA.

### Missing Premium Screens

- Place Detail as a rich destination.
- Account settings entry from profile.
- Public list read-only state with owner context.
- No-results create-place flow.

## 11. High-Fidelity Screen Specifications

### Screen State Matrix

Every screen must account for layout, hierarchy, interaction, responsive behavior, empty state, error state, and loading state.

| Screen | Layout Structure | Content Hierarchy | Interaction Model | Responsive Behavior | Empty State | Error State | Loading State |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Register | Center card desktop, full mobile | Brand, title, fields, CTA | Inline form validation | Sticky mobile CTA | Not applicable | Field and auth errors | Button loading |
| Login | Center card desktop, full mobile | Title, fields, CTA, register link | Submit on enter | Sticky mobile CTA | Not applicable | Invalid credentials | Button loading |
| My Lists | Header plus list cards | Title, create CTA, cards | Card opens detail | Single column mobile, constrained desktop | Create first list | Retry panel | Card skeletons |
| Create List | Sheet/modal form | Title, name, visibility, save | Save/cancel | Sheet mobile, modal desktop | Not applicable | Field validation | Save loading |
| List Detail | Header, action, place cards | Title, visibility, add, places | Owner actions plus place cards | Sticky add on mobile | Add first place | Not found/private/retry | Header and cards skeleton |
| Restaurants | Title, search, place cards | Title, search, cards | Search, add, rate, open | Single column mobile, grid optional desktop | No restaurants | Retry panel | Card skeletons |
| Cafes | Title, search, place cards | Title, search, cards | Search, add, rate, open | Single column mobile, grid optional desktop | No cafes | Retry panel | Card skeletons |
| Place Detail | Detail header plus actions | Name, type, rating, tried, notes | Add/rate contextual actions | Full mobile, side context desktop | Not applicable | Place unavailable | Detail skeleton |
| Create Place | Sheet/page form | Name, type, description, save | Create or create-and-add | Sheet in context, page standalone | Not applicable | Duplicate conflict | Save loading |
| Add Place | Sheet with search/results | Search, results, create option | Select one place | Bottom sheet mobile, modal desktop | Prompt to search | Retry/no access | Result skeletons |
| Rate Place | Sheet/modal form | Place, rating, notes, save | Numeric rating selection | Bottom sheet mobile | Not applicable | Rating validation | Save loading |
| My Profile | Summary plus lists | Header, stats, tried, ratings | Open place/edit rating | Stats grid collapses to two columns/mobile | No tried places | Retry panel | Stats and row skeletons |
| Public Lists | Secondary list index | Title, public list cards | Open public detail | Under My Lists on mobile | No public lists | Sign in/unavailable | Card skeletons |
| Public List Detail | Read-only detail | Owner, title, visibility, places | Open place/add from place context | Same as list detail without owner actions | No places | Private/not found/sign in | Detail skeleton |

### Register

Layout:

- Centered single-column card on desktop.
- Full-screen mobile layout.
- Arabic-first headline.
- Email and password fields.
- Primary button at bottom.

Hierarchy:

1. Product mark.
2. "إنشاء حساب".
3. Fields.
4. Register CTA.
5. Login link.

Interaction:

- Inline validation.
- Password visibility toggle.
- Success transitions into My Lists.

Responsive:

- Mobile uses full height and sticky CTA.
- Desktop uses max width 420px.

States:

- Empty: fields ready.
- Loading: button spinner.
- Error: inline field errors and top-level credential error.

### Login

Layout:

- Same shell as Register.
- Short copy: "تابع قوائمك وتجاربك."

Hierarchy:

1. Title.
2. Email.
3. Password.
4. Login.
5. Register link.

Interaction:

- Submit on enter.
- Preserve email after error.

States:

- Invalid credentials.
- Network retry.
- Session expired redirect message.

### My Lists

Layout:

- Mobile: title, create button, list cards.
- Desktop: constrained content width with optional side summary.

Hierarchy:

1. Screen title "قوائمي".
2. Create List CTA.
3. List cards sorted by recent update.

List card content:

- Name.
- Visibility badge.
- Place count.
- Updated date.

Empty:

- "ابدأ بأول قائمة."
- Primary CTA: "إنشاء قائمة".

Loading:

- Skeleton list cards.

Error:

- Inline retry panel.

### Create List

Layout:

- Mobile bottom sheet.
- Desktop modal.

Fields:

- Name.
- Visibility.

Hierarchy:

1. Title.
2. Name.
3. Visibility options with helper text.
4. Save.

Behavior:

- Private default.
- Duplicate names allowed.

### List Detail

Layout:

- Header with list name and visibility.
- Primary Add Place action.
- Place cards.
- Owner actions in contextual menu.

Hierarchy:

1. List title.
2. Visibility badge.
3. Add Place.
4. Saved places.

Place row:

- Name.
- Type.
- Tried badge.
- Rating aggregate.
- Rate/Edit Rating.
- Remove from list.

Empty:

- Owner: "أضف أول مكان لهذه القائمة."
- Public viewer: "لا توجد أماكن في هذه القائمة."

Error:

- Private/not found: "هذه القائمة غير متاحة."

Loading:

- Header skeleton plus 4 place card skeletons.

### Restaurants

Layout:

- Title.
- Search field.
- Restaurant cards.

Hierarchy:

1. "المطاعم".
2. Search by place name.
3. Cards.

Card:

- Restaurant name.
- Average rating.
- Rating count.
- Tried badge.
- Add to list.
- Rate/Edit Rating.

Empty:

- "لا توجد مطاعم بعد."

No results:

- "لا توجد نتائج بهذا الاسم."

### Cafes

Same as Restaurants with cafe-specific labels.

Arabic title:

- "المقاهي".

Empty:

- "لا توجد مقاهٍ بعد."

### Place Detail

Layout:

- Large place title.
- Type and tried status.
- Description.
- Rating aggregate.
- User rating section if tried.
- Actions.

Hierarchy:

1. Place name.
2. Type.
3. Tried badge.
4. Community rating.
5. Description.
6. User private rating/notes.
7. Add or Rate actions.

Privacy:

- Private notes shown only for current user.
- Private note section uses lock icon and label.

### Create Place

Layout:

- Sheet when invoked from Add Place.
- Full page when standalone.

Fields:

- Name.
- Type.
- Description optional.

Behavior:

- Duplicate name conflict shows existing place option.
- No place editing controls.

### Add Place To List

Layout:

- Bottom sheet.
- Search field.
- Results list.
- Create new place option.

Hierarchy:

1. Sheet title.
2. Search.
3. Results.
4. Create new if needed.

States:

- Empty search.
- Results.
- No results.
- Duplicate add idempotent success.

### Rate Place

Layout:

- Bottom sheet on mobile.
- Modal or side panel on desktop.

Hierarchy:

1. Place name.
2. Rating selector 1-10.
3. Private notes.
4. Save.

States:

- New rating.
- Edit rating.
- Validation error.
- Saved confirmation.

### My Profile

Layout:

- Personal summary header.
- Stats row.
- Tried places.
- Ratings with notes.

Hierarchy:

1. "ملفي".
2. Stats: lists, tried restaurants, tried cafes, ratings.
3. Tried places.
4. My ratings.

Empty:

- "الأماكن التي جرّبتها ستظهر هنا بعد التقييم."

### Public List Browsing

Layout:

- Secondary tab under My Lists or contextual page.
- Public list cards.

Hierarchy:

1. Public lists title.
2. Public list cards.
3. Read-only details.

Public list detail:

- Owner display name.
- Visibility badge.
- Places.
- No owner controls for non-owner.

Guest:

- Sign in to continue.

## 12. Responsive Design Guidelines

### Breakpoints

| Range | Layout |
| --- | --- |
| 0-479 | Compact mobile |
| 480-767 | Large mobile |
| 768-1023 | Tablet |
| 1024-1279 | Desktop |
| 1280+ | Wide desktop |

### Mobile

- Single column.
- Bottom navigation.
- Sheets for forms.
- Sticky primary actions.
- 16px side padding.

### Tablet

- Single or two-column depending on content.
- Bottom nav may remain.
- Wider cards with richer metadata.

### Desktop

- Max content width for readability.
- Navigation may be side or top.
- Modals replace sheets for focused actions.
- Avoid overly wide rows.

### Wide Desktop

- Do not stretch content endlessly.
- Use secondary panels for context.
- Keep place/list content centered.

## 13. Motion & Animation Guidelines

### Rating A Place

- Selected rating gently scales to 1.04 for 140ms.
- Tried badge fades in after save.
- Confirmation toast appears above bottom nav.

### Marking A Place As Tried

- Place row collapses from list only after save success.
- Use a short explanation toast.
- If user is on a list, preserve scroll position.

### Creating A List

- Sheet closes after success.
- New list appears at top with subtle highlight for 900ms.

### Adding A Place

- Add button enters loading state.
- Success check appears briefly.
- List count increments immediately after confirmed response.

### Visibility Changes

- Badge transitions between Private and Public.
- Helper text updates without layout jump.

### Error Recovery

- Error area slides/fades in.
- Field errors do not shake aggressively.
- Retry button is stable and reachable.

## 14. Design Risks

### Design Audit

#### UX Risks

- Current primary navigation can drift away from the required four-section model.
- Public list browsing can feel like a discovery platform if placed too prominently.
- Add Place and Create Place can feel like separate mental models instead of one flow.
- Rating can feel punitive if first-rating list removal is not explained.

#### Visual Risks

- Current minimal UI may feel generic without a clear product identity.
- Too many bordered cards can feel like a lightweight admin interface.
- Overuse of status badges can create visual noise.
- Non-native Arabic typography would weaken trust immediately.

#### Cognitive Load Issues

- Place cards can become overloaded with Add, Rate, Remove, Detail, aggregate, and tried controls.
- Public/private visibility is simple but high consequence, so helper text must be present.
- Profile stats and tried places need clear grouping.
- Search must stay clearly scoped to place name to avoid false discovery expectations.

#### Scalability Issues

- Generic components will not scale into social, discovery, and moderation surfaces.
- Without tokens, future screens will diverge visually.
- Without overlay patterns, mobile flows will become page-heavy and slow.
- Without accessibility rules, rating and sheet interactions will degrade as features grow.

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Public Lists in top-level nav dilutes personal focus | Product feels like browsing platform | Keep public lists secondary |
| Generic Places nav weakens Restaurants/Cafes model | Users lose clear category paths | Use Restaurants/Cafes as primary sections |
| Rating control too small on mobile | Friction and mis-taps | Use large numeric selector |
| Too many actions on place cards | Cognitive load | Use one primary action and contextual menu |
| Privacy labels too subtle | User mistrust | Persistent text badges and helper copy |
| Notes mistaken for public reviews | Trust breach | Label notes as private wherever shown |
| Desktop dashboard styling leaks into product | Less premium feeling | Keep content cards and focused layouts |
| Arabic treated as translated English | Poor trust and readability | RTL-native layout and Arabic copy review |
| Skeletons and loaders too generic | Perceived slowness | Match final content shape |
| Motion too playful | Product feels less premium | Use restrained, functional animation |

## 15. Design Improvement Recommendations

### Experience Direction

- Treat the product as a personal taste library.
- Keep public/social surfaces secondary until moderation is mature.
- Make tried status a satisfying completion moment.
- Make private notes visibly private.

### IA Direction

- Use the four required primary nav items only.
- Move Public Lists into My Lists as a secondary surface.
- Split generic Places into Restaurants and Cafes.
- Elevate Place Detail as a true content screen.

### Visual Direction

- Adopt Dhawq UI tokens.
- Use Arabic-first typography.
- Reduce chrome and heavy card nesting.
- Use subtle status badges.
- Avoid dashboards and marketing hero layouts inside the app.

### Interaction Direction

- Use bottom sheets for mobile actions.
- Use contextual menus for secondary actions.
- Use optimistic-feeling but server-confirmed state updates.
- Keep destructive actions behind confirmations.

### Accessibility Direction

- Design every flow keyboard-first even if mobile-first.
- Test Arabic screen reader flows.
- Make rating and visibility controls fully announced.

## 16. World-Class Design Readiness Assessment

### Current Readiness

Design readiness score: **5.8 / 10**.

### Strengths

- Product scope is clear.
- Core flows exist.
- Privacy rules are known.
- Ratings and tried behavior have strong product logic.
- Public/private visibility is conceptually simple.

### Gaps

- Current UI is functional but not premium.
- Arabic-first design is not yet specified in implementation.
- Primary IA is not fully aligned with required navigation.
- Component system is not formalized.
- Mobile-first interactions are minimal.
- Place Detail needs richer design treatment.
- Public Lists should be demoted from primary nav.
- Accessibility needs design-level rigor.

### Target Readiness

Target design readiness after applying this specification: **8.8 / 10**.

### What 8.8 Means

- Clear product personality.
- RTL-native design rules.
- Premium mobile-first screen model.
- Complete component specification.
- Strong accessibility standard.
- Scalable design system tokens.
- Screen-by-screen high-fidelity behavior.

### Final Design Recommendation

Adopt this design specification as the experience foundation before expanding the product further. The next design decision should be to produce visual comps and interactive prototypes from this specification, not to add more UI surface area.
