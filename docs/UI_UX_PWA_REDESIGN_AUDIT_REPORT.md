# UI/UX/PWA Redesign Audit Report

## 1. Executive Summary

This audit used the `redesign-existing-projects` skill as requested. The repository is a working Arabic-first Next.js web product with a stronger foundation than a throwaway prototype: it has RTL at the document root, an Arabic font, custom design tokens, reusable UI primitives, Base UI pilots, accessible ActionMenu work, image fallbacks, bottom navigation, install prompting, and meaningful E2E coverage.

The main gap is not basic functionality. The gap is product feel. The current experience still reads more like a protected utility/dashboard than a mobile-first, content/social catalog PWA in the spirit of Letterboxd. The largest issues are:

- PWA readiness is incomplete because there is no service worker or offline fallback.
- Discovery and shareability are weak because most catalog/social surfaces are authenticated and route-level metadata is minimal.
- Mobile navigation does not make search/discovery/public content first-class.
- Core catalog cards and list cards are functional but not yet editorial, collectible, or poster-like enough.
- Profile still risks becoming an archive-heavy page instead of a short app-like identity/dashboard surface.
- The global CSS system is tokenized but large and page-selector-heavy, which increases redesign risk.

The recommended first future implementation target is **PWA manifest/offline fallback**. This is the highest leverage first step because the product explicitly wants to behave like a mobile PWA, and installability without offline/runtime resilience creates a trust gap during user testing.

No application code was changed by this audit.

## 2. Product Context

The product is a website today, with an expected mobile-first PWA future. Its product direction is similar in spirit to Letterboxd:

- catalog discovery
- user ratings
- review/list-like behavior
- public lists
- profiles
- search/filtering
- wishlist/saved behavior

The audit therefore evaluates the product as a mobile-first Arabic/RTL social catalog PWA, not as a generic dashboard or admin tool.

## 3. Skill Usage Confirmation

Skill requested:

- `redesign-existing-projects`

Availability check:

- `.agents/skills/redesign-existing-projects/SKILL.md` was not present initially.
- `.agents/skills/redesign-skill/SKILL.md` was not present.
- Existing repository skill folder contained unrelated skills only.

Installation:

- Installed with:
  `npx skills add https://github.com/Leonxlnx/taste-skill --skill "redesign-existing-projects"`

Verification:

- Installed file: `.agents/skills/redesign-existing-projects/SKILL.md`
- Frontmatter name: `redesign-existing-projects`
- Frontmatter description exists.
- The skill was read and used for audit criteria: typography, colors/surfaces, layout, interactivity/states, content, component patterns, visual identity, and AI-generated design pattern risks.

Important constraint:

- The skill normally includes implementation guidance, but this task is audit/report only. The skill was used only for diagnosis, scoring, prioritization, and future recommendations.

## 4. Repository and Stack Overview

Frontend framework:

- Next.js App Router.
- React 19.
- TypeScript.

Evidence:

- `frontend/package.json:14-19` includes `@base-ui/react`, `next`, `react`, `react-dom`, `clsx`, and `tailwind-merge`.
- `frontend/package.json:24-35` includes TypeScript, Playwright, ESLint, Tailwind, and axe-core.
- `frontend/app/layout.tsx:35-44` defines the root App Router layout.

Styling system:

- Tailwind v4 infrastructure is installed.
- `frontend/app/globals.css` remains the primary styling surface.
- CSS custom properties define the design tokens.
- shadcn infrastructure is present through `components.json`.
- Base UI is present for selected behavior primitives.
- Custom UI primitives remain the main visual system.

Evidence:

- `frontend/app/globals.css:1` imports Tailwind.
- `frontend/app/globals.css:3-40` defines color, radius, spacing, shadow, content width, and mobile nav tokens.
- `frontend/package.json:27` includes `@tailwindcss/postcss`.
- `frontend/package.json:34` includes `tailwindcss`.
- `frontend/components.json` exists and configures shadcn with RTL support.

Routing structure:

- App Router pages exist for `/`, `/login`, `/register`, `/places`, `/places/[id]`, `/places/[id]/rate`, `/places/new`, `/lists`, `/lists/new`, `/lists/[id]`, `/lists/public`, `/lists/public/[id]`, `/profile`, and `/health`.

Evidence:

- `frontend/app/page.tsx`
- `frontend/app/places/page.tsx`
- `frontend/app/places/[id]/page.tsx`
- `frontend/app/places/[id]/rate/page.tsx`
- `frontend/app/lists/page.tsx`
- `frontend/app/lists/[id]/page.tsx`
- `frontend/app/lists/public/page.tsx`
- `frontend/app/profile/page.tsx`

App shell:

- Root layout renders `AppNav`, page content, and `InstallAppPrompt`.
- Mobile bottom navigation is implemented in CSS.
- Auth pages hide the app nav.

Evidence:

- `frontend/app/layout.tsx:37-42`
- `frontend/src/components/AppNav.tsx:19-24`
- `frontend/app/globals.css:2758-2765`

Key product surfaces:

- Home/auth entry: `frontend/app/page.tsx`
- Places catalog: `frontend/src/features/places/PlaceLibraryPage.tsx`
- Place detail: `frontend/src/features/places/PlaceDetailPage.tsx`
- Rating flow: `frontend/src/features/places/RatePlaceDialog.tsx`
- Lists: `frontend/app/lists/page.tsx`
- Public lists: `frontend/src/features/lists/PublicListsPage.tsx`
- Profile: `frontend/src/features/profile/ProfileArchivePage.tsx`
- Shared cards: `frontend/src/components/ui/PlaceCard.tsx`, `frontend/src/components/ui/ListCard.tsx`
- Shared images: `frontend/src/components/ui/PlaceImage.tsx`
- Dialog/sheet orchestration: `frontend/src/components/ui/Dialog.tsx`

## 5. PWA Status

Current PWA assets and behavior:

- Manifest exists.
- App name, short name, description, theme color, background color, `standalone`, Arabic language, RTL direction, portrait orientation, and icons are defined.
- Apple web app metadata exists.
- Viewport uses `viewportFit: "cover"`.
- Install prompt logic exists for Chromium `beforeinstallprompt` and iOS Safari guidance.

Evidence:

- `frontend/app/manifest.ts:3-20`
- `frontend/app/layout.tsx:14-25`
- `frontend/app/layout.tsx:28-32`
- `frontend/src/components/InstallAppPrompt.tsx:65-84`
- `frontend/src/components/InstallAppPrompt.tsx:113-130`

Major gap:

- No service worker, Workbox, `next-pwa`, custom offline fallback, or `navigator.serviceWorker` usage was found in the frontend search.

Evidence:

- Repository search found only manifest and install-prompt references for PWA behavior:
  - `frontend/app/manifest.ts:3`
  - `frontend/src/components/InstallAppPrompt.tsx:74`
  - no service worker registration or offline fallback match.

Assessment:

- The product has installability basics but is not yet a resilient PWA. For the stated target of mobile-first app-like usage, offline and retry behavior need a dedicated implementation phase.

## 6. Mobile-First Experience Assessment

Strengths:

- Mobile bottom navigation exists.
- Safe-area variables are used in several fixed and bottom surfaces.
- Inputs use `font-size: 16px`, reducing iOS zoom risk.
- Touch action is set on links and buttons.
- Dialogs use a bottom sheet on mobile.

Evidence:

- `frontend/app/globals.css:39`
- `frontend/app/globals.css:80-84`
- `frontend/app/globals.css:95-98`
- `frontend/app/globals.css:129-135`
- `frontend/app/globals.css:1755-1764`
- `frontend/app/globals.css:2741-2765`

Weaknesses:

- Mobile navigation has only three primary items and does not make search or public discovery first-class.
- Some viewport sizing still uses `100vh` and only some surfaces use `100dvh`/`100svh`.
- Install prompt and toast are fixed near the bottom nav; current spacing is intentional, but future overlays need strict collision testing.
- Public/mobile landing experience is still an auth card rather than a browseable content surface.

## 7. Arabic/RTL Assessment

Strengths:

- Root document is Arabic and RTL.
- IBM Plex Sans Arabic is used.
- Manifest declares Arabic language and RTL direction.
- BidiText and NumberText exist and are used in key catalog/profile surfaces.
- CSS uses many logical properties such as `inset-inline`, `margin-inline`, and `padding-inline`.

Evidence:

- `frontend/app/layout.tsx:7-12`
- `frontend/app/layout.tsx:37`
- `frontend/app/manifest.ts:12-13`
- `frontend/src/components/ui/PlaceCard.tsx:53-58`
- `frontend/src/components/ui/ListCard.tsx:44-57`
- `frontend/app/globals.css:517`
- `frontend/app/globals.css:1749-1750`

Risks:

- Arabic copy appears correctly in source intent, but terminal output shows encoding mojibake in this environment. This audit does not treat that as a source defect without browser evidence.
- Some accessibility text remains English by design, such as rating `aria-valuetext`; this may be constrained by an existing EDR, but it weakens a fully Arabic screen reader experience.
- Icon direction and arrow direction need continued RTL screenshot checks, especially for links using left arrows.

## 8. Key Screens and Components Reviewed

Reviewed screens:

- Home/auth entry: `frontend/app/page.tsx`
- Places catalog: `frontend/src/features/places/PlaceLibraryPage.tsx`
- Place detail: `frontend/src/features/places/PlaceDetailPage.tsx`
- Rating flow: `frontend/src/features/places/RatePlaceDialog.tsx`
- Lists page: `frontend/app/lists/page.tsx`
- Public lists page: `frontend/src/features/lists/PublicListsPage.tsx`
- List detail: `frontend/app/lists/[id]/page.tsx`
- Profile: `frontend/src/features/profile/ProfileArchivePage.tsx`
- Login/register: `frontend/app/login/page.tsx`, `frontend/app/register/page.tsx`
- Health/dev-safe UI surfaces: `frontend/app/health/page.tsx`

Reviewed shared components:

- `frontend/src/components/AppNav.tsx`
- `frontend/src/components/InstallAppPrompt.tsx`
- `frontend/src/components/ui/ActionMenu.tsx`
- `frontend/src/components/ui/Dialog.tsx`
- `frontend/src/components/ui/PlaceCard.tsx`
- `frontend/src/components/ui/ListCard.tsx`
- `frontend/src/components/ui/PlaceImage.tsx`
- `frontend/src/components/ui/RatingControl.tsx`
- `frontend/src/components/ui/SearchField.tsx`
- `frontend/src/components/ui/VirtualList.tsx`
- `frontend/src/components/ui/StatusMessage.tsx`
- `frontend/src/components/ui/Toast.tsx`

## 9. Scorecard

| Area | Score | Why | Main evidence |
| --- | ---: | --- | --- |
| Overall UI quality | 6.5/10 | Solid functional dark UI with tokens and good components, but not yet a distinctive content/catalog identity. | `globals.css:3-40`, `PlaceCard.tsx:50-70`, `ListCard.tsx:38-67` |
| Mobile-first experience | 7/10 | Bottom nav, safe-area handling, mobile sheets, and 16px inputs exist; discovery/nav hierarchy still needs mobile-first refinement. | `globals.css:80-84`, `globals.css:2741-2765`, `Dialog.tsx:128-133` |
| PWA readiness | 4/10 | Manifest and install prompt exist, but no service worker/offline fallback was found. | `manifest.ts:3-20`, `InstallAppPrompt.tsx:65-84` |
| App-like feel | 6/10 | Bottom nav and sheets help; root and discovery still feel web/auth-first. | `AppNav.tsx:10-14`, `page.tsx:14-31` |
| Arabic/RTL quality | 8/10 | Root RTL, Arabic font, manifest RTL, BidiText/NumberText patterns; some screen reader text and icon direction need continued checks. | `layout.tsx:7-12`, `layout.tsx:37`, `manifest.ts:12-13` |
| Visual hierarchy | 6/10 | Clear headings and sections exist, but list/card surfaces can feel uniform and utility-like. | `PlaceLibraryPage.tsx:287-350`, `ProfileArchivePage.tsx:176-214` |
| Typography | 7/10 | Arabic font and weights are configured; hierarchy could use more editorial display rhythm. | `layout.tsx:7-12`, `globals.css:63-67` |
| Color consistency | 7/10 | Token system is coherent and green accent is consistent; the palette risks becoming one-note without richer content imagery. | `globals.css:5-25` |
| Card/component quality | 6/10 | Cards are reusable and accessible, but catalog/list cards need stronger poster/editorial affordance. | `PlaceCard.tsx:50-70`, `ListCard.tsx:38-67` |
| Rating/review UX | 6/10 | Rating control is accessible and usable, but the UX is more utility input than expressive review/rating moment. | `RatingControl.tsx:43-74` |
| Profile/list UX | 6.5/10 | Profile identity, favorites, wishlist, and lists exist; profile still risks archive dominance. | `ProfileArchivePage.tsx:176-214`, `ProfileArchivePage.tsx:785-802` |
| Navigation | 6/10 | Bottom nav is clear, but search/public discovery are not primary destinations. | `AppNav.tsx:10-14`, `PlaceLibraryPage.tsx:338-350` |
| Accessibility | 7.5/10 | Focus rings, ActionMenu semantics, dialog work, labels, status messages, and E2E exist; skip link and some Arabic screen reader polish remain. | `globals.css:108-110`, `ActionMenu.tsx:83-163`, `Dialog.tsx:46-78` |
| Responsive behavior | 7/10 | Mobile-specific CSS and safe-area support exist; `100vh` usage and fixed surfaces require regression checks. | `globals.css:56-57`, `globals.css:2741-2765` |
| Performance risk | 6/10 | Virtualized lists and lazy images help; native image optimization and route metadata are weaker. | `VirtualList.tsx:25-63`, `PlaceImage.tsx:28-36` |
| SEO/shareability readiness | 4/10 | Root metadata exists, but no route-level dynamic metadata or OG/Twitter metadata was found. | `layout.tsx:14-25`, metadata search under `frontend/app` |
| Design system maturity | 6.5/10 | Tokens and components are real; `globals.css` is large and page-specific, increasing future migration risk. | `globals.css` has 2739 lines; `components/ui` primitives are reused |

## 10. Critical Findings

### F-001

Severity

- Critical

Category

- PWA

Affected file(s)

- `frontend/app/manifest.ts`
- `frontend/src/components/InstallAppPrompt.tsx`
- `frontend/app/layout.tsx`

Affected screen/component

- Whole app PWA shell

Evidence from code

- `frontend/app/manifest.ts:3-20` defines a manifest.
- `frontend/src/components/InstallAppPrompt.tsx:65-84` listens for `beforeinstallprompt`.
- Repository search found no `navigator.serviceWorker`, Workbox, `next-pwa`, service worker file, or offline fallback route.

What is wrong

- The app has installability basics but does not have runtime PWA resilience. A user can be prompted to install the product, but the app does not appear to have offline fallback, shell caching, or service worker-based recovery.

Why it matters for users

- Mobile users expect an installed app-like product to survive weak network, reload predictably, and fail gracefully. Without offline behavior, the installed experience can feel like a bookmarked website rather than an app.

Why it matters for mobile/PWA

- This is a direct blocker for PWA trust. Installability without offline or cache strategy is not enough for a serious mobile-first PWA.

Recommended fix

- Add a dedicated PWA phase: service worker registration, offline fallback page, app-shell caching strategy, runtime caching for safe read endpoints/assets, and tests for offline navigation. Keep data mutation offline support out of scope unless explicitly designed.

Implementation risk

- Medium

Suggested verification after future implementation

- Lighthouse PWA checks.
- Browser installability check.
- Playwright route/network offline test for app shell.
- Manual iOS Safari install/open check.
- Verify auth/session errors remain correct when offline.

## 11. High Findings

### F-002

Severity

- High

Category

- Product Positioning

Affected file(s)

- `frontend/app/page.tsx`
- `frontend/src/features/places/PlaceLibraryPage.tsx`
- `frontend/src/features/lists/PublicListsPage.tsx`

Affected screen/component

- Home page, places catalog, public lists

Evidence from code

- `frontend/app/page.tsx:14-31` renders an auth-oriented card with register/login actions.
- `frontend/src/features/places/PlaceLibraryPage.tsx:102-109` blocks place loading when `ensureSession()` fails.
- `frontend/src/features/lists/PublicListsPage.tsx:36-44` also requires an authenticated session before loading public lists.

What is wrong

- A content/social catalog product is expected to invite browsing and discovery. The current public entry point is primarily an auth gate, and even public-list browsing requires session recovery/auth.

Why it matters for users

- New users cannot understand the product value before committing. Content products need visible examples, browsing paths, and shareable public surfaces.

Why it matters for mobile/PWA

- Mobile users often arrive from shared links or quick browsing sessions. If the product starts as a login wall, it loses the lightweight discovery loop that makes catalog products sticky.

Recommended fix

- Future product/design phase: create a public discovery landing state and clarify which catalog/list/detail surfaces should be indexable and browseable without auth. Do not change auth policy without product approval.

Implementation risk

- High

Suggested verification after future implementation

- Anonymous browsing smoke for `/`, `/places`, `/lists/public`, and public list detail.
- SEO crawl check.
- Ensure private/user-owned features remain protected.

### F-003

Severity

- High

Category

- SEO

Affected file(s)

- `frontend/app/layout.tsx`
- `frontend/app/places/[id]/page.tsx`
- `frontend/app/lists/public/[id]/page.tsx`
- `frontend/app/profile/page.tsx`

Affected screen/component

- Public share/deep-link metadata

Evidence from code

- `frontend/app/layout.tsx:14-25` defines only global metadata.
- Search of `frontend/app` found no `generateMetadata`, `openGraph`, `twitter`, or canonical configuration on detail routes.

What is wrong

- Detail pages and public list pages do not appear to provide route-specific titles, descriptions, Open Graph images, or share metadata.

Why it matters for users

- Shared place/list links will look generic in messaging apps and social previews. That weakens the content/social loop.

Why it matters for mobile/PWA

- Mobile discovery often happens through link previews. Generic previews reduce click-through and make the product feel less polished.

Recommended fix

- Add route-level metadata for public/indexable routes after confirming auth/public access policy. Use place/list names, type metadata, and image/fallback preview assets.

Implementation risk

- Medium

Suggested verification after future implementation

- Inspect rendered metadata for place detail and public list detail.
- Validate OG/Twitter cards.
- Confirm private data is not leaked.

### F-004

Severity

- High

Category

- Navigation

Affected file(s)

- `frontend/src/components/AppNav.tsx`
- `frontend/src/features/places/PlaceLibraryPage.tsx`

Affected screen/component

- Mobile app navigation and search reachability

Evidence from code

- `frontend/src/components/AppNav.tsx:10-14` defines three nav links: lists, places, profile.
- Search is implemented inside the places page at `frontend/src/features/places/PlaceLibraryPage.tsx:338-350`, not as a global reachable action.

What is wrong

- For a Letterboxd-like catalog product, search/discovery is a primary action. It is currently nested inside the places page and not treated as an app-level destination or command.

Why it matters for users

- Users come to catalog products to find items quickly. Hiding search one level down increases friction and makes the app feel less immediate.

Why it matters for mobile/PWA

- Thumb-first mobile apps need obvious, reachable primary actions. Search should be reachable without scanning a page.

Recommended fix

- Future navigation phase: decide whether search belongs in the bottom nav, a persistent top affordance, or a command-style search route. Keep the nav item count disciplined.

Implementation risk

- Medium

Suggested verification after future implementation

- 320/390/430 screenshots.
- Keyboard/screen reader test for search entry.
- No horizontal overflow.
- Ensure existing `/places?q=...` behavior remains.

### F-005

Severity

- High

Category

- Profile/List UX

Affected file(s)

- `frontend/src/features/profile/ProfileArchivePage.tsx`

Affected screen/component

- `/profile`

Evidence from code

- `frontend/src/features/profile/ProfileArchivePage.tsx:188-201` renders the rated places section directly on the profile page.
- `frontend/src/features/profile/ProfileArchivePage.tsx:193` renders `RatingArchiveList`.
- `frontend/src/features/profile/ProfileArchivePage.tsx:51-53` defines archive virtualization constants.
- `frontend/src/features/profile/ProfileArchivePage.tsx:785-802` switches between full render and virtualization based on count.

What is wrong

- The profile page still carries archive behavior. A mobile profile/dashboard should be short, identity-first, and scannable. A long archive can dominate the page and reduce the premium profile feel.

Why it matters for users

- Users checking their profile want identity, stats, favorites, wishlist/lists, and recent activity first. Full archives belong behind a focused route or explicit action.

Why it matters for mobile/PWA

- Long mobile pages bury navigation and primary actions, and can feel less app-like.

Recommended fix

- Future profile polish phase: show only a latest-rated preview on `/profile` and move the full archive behind an explicit route/action.

Implementation risk

- Medium

Suggested verification after future implementation

- E2E verifying max preview count.
- 320/390/430 profile screenshots.
- Check bottom nav clearance.
- Verify full archive remains reachable.

### F-006

Severity

- High

Category

- Visual Design

Affected file(s)

- `frontend/src/components/ui/PlaceCard.tsx`
- `frontend/src/components/ui/ListCard.tsx`
- `frontend/src/components/ui/PlaceImage.tsx`
- `frontend/app/globals.css`

Affected screen/component

- Places catalog cards, list cards, public list cards

Evidence from code

- `frontend/src/components/ui/PlaceCard.tsx:50-70` uses title/meta/rating plus `PlaceImage`.
- `frontend/src/components/ui/ListCard.tsx:38-67` uses shelf icon, title, meta, badge, actions.
- `frontend/src/components/ui/PlaceImage.tsx:23-25` falls back to `PlaceTypeIcon`.

What is wrong

- The cards are clean and functional, but they are closer to utility rows than collectible catalog objects. A Letterboxd-like product needs stronger poster/card identity, richer visual hierarchy, and more scan-friendly metadata grouping.

Why it matters for users

- Catalog products rely on browsing desire. If every item feels like an admin row, users are less likely to explore, save, rate, and share.

Why it matters for mobile/PWA

- Mobile browsing depends on immediate visual recognition. Strong card composition reduces cognitive load.

Recommended fix

- Future card redesign phase: establish one premium repeated catalog/place card with clear image/fallback poster treatment, rating chip, type/subtype hierarchy, and pressed/focus states.

Implementation risk

- Medium

Suggested verification after future implementation

- Visual regression screenshots for places list, list detail, public lists, profile favorites, and save-to-list rows.
- Accessibility check for link names and decorative images.

### F-007

Severity

- High

Category

- Search/Discovery

Affected file(s)

- `frontend/src/features/places/PlaceLibraryPage.tsx`
- `frontend/src/components/ui/SearchField.tsx`

Affected screen/component

- Place search/filtering

Evidence from code

- `frontend/src/features/places/PlaceLibraryPage.tsx:338-350` provides scoped place search.
- `frontend/src/components/ui/SearchField.tsx:40-68` implements a labeled accessible search field.
- No global search route or global search shell was found.

What is wrong

- Search is accessible and well-formed locally, but product-level search/discovery is not elevated.

Why it matters for users

- Users expect catalog products to answer "where is this place?" immediately.

Why it matters for mobile/PWA

- App-like catalog products need low-friction search entry. Local-only search feels like page filtering, not product discovery.

Recommended fix

- Future IA phase: define global search behavior, including whether it searches places only, lists, users/profiles, or all public content.

Implementation risk

- High

Suggested verification after future implementation

- Search route/direct link tests.
- Arabic and mixed English/Arabic search examples.
- Back/forward behavior.

## 12. Medium Findings

### F-008

Severity

- Medium

Category

- PWA

Affected file(s)

- `frontend/app/manifest.ts`

Affected screen/component

- Web app manifest

Evidence from code

- `frontend/app/manifest.ts:5-18` includes name, short name, description, start URL, standalone display, colors, lang/dir/orientation, and icons.
- It does not include `id`, `scope`, `categories`, `screenshots`, or shortcuts.

What is wrong

- The manifest is valid/basic, but not tuned for a polished app-store-like PWA presentation.

Why it matters for users

- A richer manifest improves install surfaces and makes the app feel more intentional when added to a device.

Why it matters for mobile/PWA

- Screenshots, scope, and shortcuts can improve install UX and reduce navigation ambiguity after launch.

Recommended fix

- Add `id`, `scope`, screenshots, and carefully chosen shortcuts after the app shell and public/private route strategy are settled.

Implementation risk

- Low

Suggested verification after future implementation

- Lighthouse manifest audit.
- Chrome install panel inspection.
- iOS home screen icon/name check.

### F-009

Severity

- Medium

Category

- Mobile UX

Affected file(s)

- `frontend/app/globals.css`

Affected screen/component

- Layout shell and mobile viewports

Evidence from code

- `frontend/app/globals.css:56-57` uses `100vh` and `100svh`.
- `frontend/app/globals.css:131-132` uses `100vh` and `100svh` for `.content`.
- `frontend/app/globals.css:2751-2752` uses both `100vh` and `100dvh` only for `.place-library-page`.

What is wrong

- Viewport unit handling is partly modernized but inconsistent. Some surfaces use `svh`, some use `dvh`, and `100vh` remains as a fallback.

Why it matters for users

- On mobile browsers, especially iOS Safari, viewport changes can cause jumpy layouts or bottom content being hidden.

Why it matters for mobile/PWA

- Installed PWAs and Safari tabs handle viewport chrome differently. Inconsistent units increase regression risk.

Recommended fix

- Future mobile shell phase: standardize viewport sizing tokens and document when to use `svh`, `dvh`, and safe-area padding.

Implementation risk

- Medium

Suggested verification after future implementation

- iOS Safari checks.
- 320/390/430 screenshots.
- Scroll-to-bottom checks on pages with bottom nav and sheets.

### F-010

Severity

- Medium

Category

- Performance

Affected file(s)

- `frontend/src/components/ui/PlaceImage.tsx`

Affected screen/component

- Place images across cards/detail/profile/list rows

Evidence from code

- `frontend/src/components/ui/PlaceImage.tsx:28-36` renders a native `img`.
- `frontend/src/components/ui/PlaceImage.tsx:29` disables Next's `no-img-element` rule with a deployment/storage URL explanation.
- `frontend/src/components/ui/PlaceImage.tsx:31-34` uses empty alt, async decoding, lazy loading, and error fallback.

What is wrong

- The native image choice is justified by dynamic storage/fallback needs, but it gives up built-in Next image optimization, sizing, and some Core Web Vitals protections.

Why it matters for users

- Catalog browsing will become image-heavy. Poor image sizing can slow scrolling and create layout/performance issues.

Why it matters for mobile/PWA

- Mobile networks and installed app shells are sensitive to image payload and layout stability.

Recommended fix

- Keep the fallback behavior, but add explicit sizing/aspect-ratio guarantees and consider a documented image optimization strategy compatible with the storage public base URL.

Implementation risk

- Medium

Suggested verification after future implementation

- Lighthouse image diagnostics.
- Slow 4G scroll test.
- Broken image fallback test.
- CLS check on catalog cards.

### F-011

Severity

- Medium

Category

- Design System

Affected file(s)

- `frontend/app/globals.css`

Affected screen/component

- Global styling system

Evidence from code

- `frontend/app/globals.css` has 2739 lines.
- Token definitions are concentrated at `frontend/app/globals.css:3-40`.
- Many page/component selectors and media rules live in the same global file.

What is wrong

- The token foundation is good, but the global CSS file is large and selector-heavy. This makes future redesign work harder to scope and increases accidental regression risk.

Why it matters for users

- Users feel this indirectly when small visual changes create inconsistent spacing, surfaces, or mobile regressions.

Why it matters for mobile/PWA

- PWA shell, safe-area, overlays, and content screens all share one global styling surface. Unscoped changes can break mobile layout.

Recommended fix

- Future design-system phase: keep tokens global, but gradually split stable component styles from page-specific layout styles. Do not rewrite all CSS at once.

Implementation risk

- Medium

Suggested verification after future implementation

- Screenshot suite before/after.
- CSS diff review.
- No component migration bundled with CSS organization unless tightly scoped.

### F-012

Severity

- Medium

Category

- Accessibility

Affected file(s)

- `frontend/app/layout.tsx`

Affected screen/component

- Global keyboard navigation

Evidence from code

- `frontend/app/layout.tsx:37-42` renders `AppNav`, children, and `InstallAppPrompt`.
- No skip link was found in the root layout.

What is wrong

- Keyboard and screen reader users must traverse navigation before reaching main content on each page.

Why it matters for users

- Repeated navigation is tiring, especially on mobile keyboards and assistive technology.

Why it matters for mobile/PWA

- App-like products still need web accessibility conventions. A skip link is low-cost and improves repeated route navigation.

Recommended fix

- Add a visually-hidden skip link that becomes visible on focus and targets the main content landmark.

Implementation risk

- Low

Suggested verification after future implementation

- Keyboard tab test from page load.
- Screen reader landmark navigation.
- 320/390 screenshots for focused skip link.

### F-013

Severity

- Medium

Category

- Social/Catalog UX

Affected file(s)

- `frontend/src/features/lists/PublicListsPage.tsx`
- `frontend/src/components/ui/ListCard.tsx`

Affected screen/component

- Public lists

Evidence from code

- `frontend/src/features/lists/PublicListsPage.tsx:43-44` maps public list records to `{ ...list, items: [] }`.
- `frontend/src/components/ui/ListCard.tsx:38-67` renders a shelf icon, name, count, visibility, and owner metadata.

What is wrong

- Public list cards do not preview contents. For a social catalog product, list cards should communicate taste and collection identity, not just count/visibility.

Why it matters for users

- Users need a reason to open public lists. Without previews, lists feel generic and administrative.

Why it matters for mobile/PWA

- Mobile users scan quickly. Visual previews make list browsing more engaging.

Recommended fix

- Future public-list card phase: add a compact poster/collage preview from list items if available through existing or approved contract. If not available, document required API/product decision first.

Implementation risk

- Medium

Suggested verification after future implementation

- Public list screenshots.
- Empty-list card fallback.
- No private list leakage.

### F-014

Severity

- Medium

Category

- Performance

Affected file(s)

- `frontend/src/components/ui/VirtualList.tsx`
- `frontend/src/features/places/PlaceLibraryPage.tsx`
- `frontend/src/features/profile/ProfileArchivePage.tsx`

Affected screen/component

- Long catalog and rating archive lists

Evidence from code

- `frontend/src/components/ui/VirtualList.tsx:25-63` implements document-scroll windowing.
- `frontend/src/features/places/PlaceLibraryPage.tsx:431-439` uses `VirtualList` for places.
- `frontend/src/features/profile/ProfileArchivePage.tsx:785-802` uses archive virtualization logic.

What is wrong

- Virtualization is good for performance, but semantic list structure is mostly generic `div` wrappers. This can reduce screen reader list context.

Why it matters for users

- Assistive technology users benefit from knowing list length and item boundaries.

Why it matters for mobile/PWA

- Large lists are central to the app. Performance and accessibility need to be solved together.

Recommended fix

- Future accessibility/performance phase: evaluate `role="list"` / `role="listitem"` or semantic list wrappers without breaking virtualization.

Implementation risk

- Medium

Suggested verification after future implementation

- Screen reader smoke on catalog list.
- E2E for virtualized scrolling.
- Performance scroll test.

### F-015

Severity

- Medium

Category

- Rating/Review UX

Affected file(s)

- `frontend/src/components/ui/RatingControl.tsx`

Affected screen/component

- Rating control

Evidence from code

- `frontend/src/components/ui/RatingControl.tsx:43-74` uses a fieldset, range input, visible value, and live region.
- `frontend/src/components/ui/RatingControl.tsx:63-64` sets `aria-label` from the Arabic label but `aria-valuetext` in English.

What is wrong

- The control is accessible and appears intentionally constrained, but the rating moment is utilitarian. The English `aria-valuetext` is also not fully aligned with Arabic-first UX.

Why it matters for users

- Rating is a core emotional action in catalog products. It should feel expressive and clear.

Why it matters for mobile/PWA

- Mobile rating controls need thumb-friendly precision, clear feedback, and localized assistive output.

Recommended fix

- Future rating UX phase: improve the visual affordance and microcopy while preserving EDR-002 behavior unless that EDR is explicitly revised.

Implementation risk

- High

Suggested verification after future implementation

- Keyboard/range input test.
- Screen reader test.
- Touch precision test at 320px.
- Confirm EDR-002 compliance.

## 13. Low Findings

### F-016

Severity

- Low

Category

- Visual Design

Affected file(s)

- `frontend/src/components/ui/ListCard.tsx`

Affected screen/component

- List cards

Evidence from code

- `frontend/src/components/ui/ListCard.tsx:61-67` renders an aria-hidden dotted more indicator when no actions are provided.

What is wrong

- The decorative three-dot placeholder can read as an unfinished action affordance even when it is hidden from assistive tech.

Why it matters for users

- Visual affordances should clearly communicate whether something is interactive.

Why it matters for mobile/PWA

- On touch devices, users may try to tap decorative marks that look like a menu.

Recommended fix

- Replace with a clearer non-interactive visual cue or remove it from cards that are fully clickable.

Implementation risk

- Low

Suggested verification after future implementation

- Tap target audit.
- Visual screenshots for owner/viewer list cards.

### F-017

Severity

- Low

Category

- PWA

Affected file(s)

- `frontend/src/components/InstallAppPrompt.tsx`

Affected screen/component

- Install prompt

Evidence from code

- `frontend/src/components/InstallAppPrompt.tsx:33-42` limits prompt display to app route prefixes.
- `frontend/src/components/InstallAppPrompt.tsx:45-47` requires a local authenticated session.
- `frontend/src/components/InstallAppPrompt.tsx:99-103` stores a permanent dismissed flag.

What is wrong

- The prompt is careful, but permanent dismissal can hide PWA education forever after one early dismissal.

Why it matters for users

- Users may dismiss before understanding value and never see install guidance again.

Why it matters for mobile/PWA

- PWA install adoption is timing-sensitive. The prompt should be respectful but recoverable.

Recommended fix

- Consider a time-boxed dismissal or a settings/help entry for install guidance.

Implementation risk

- Low

Suggested verification after future implementation

- LocalStorage dismissal test.
- iOS Safari prompt copy check.

### F-018

Severity

- Low

Category

- AI-Generated Design Pattern Risk

Affected file(s)

- `frontend/app/globals.css`

Affected screen/component

- Global dark visual language

Evidence from code

- `frontend/app/globals.css:59-61` uses a radial green glow and dark gradient background.
- `frontend/app/globals.css:21-25` defines premium surface/glow tokens.

What is wrong

- The current palette is restrained, but the glow-plus-card pattern can drift toward generic AI SaaS styling if overused.

Why it matters for users

- A catalog/social product should feel specific to food/place memory, not like a generic AI dashboard.

Why it matters for mobile/PWA

- Mobile screens have less room; decorative glow can compete with content if expanded.

Recommended fix

- Keep the green identity, but anchor future redesigns in content objects: place images, poster cards, list collages, and tactile controls.

Implementation risk

- Low

Suggested verification after future implementation

- Visual review comparing places, profile, and lists.
- Confirm no new generic gradient/orb sections.

### F-019

Severity

- Low

Category

- Components

Affected file(s)

- `frontend/src/components/ui/Dialog.tsx`

Affected screen/component

- Dialog and bottom sheet layering

Evidence from code

- `frontend/src/components/ui/Dialog.tsx:46-78` uses Base UI Dialog for selected desktop presentation.
- `frontend/src/components/ui/Dialog.tsx:100-125` custom portals the existing modal/sheet implementation.
- `frontend/app/globals.css:1723-1764` defines dialog and bottom sheet layers.

What is wrong

- The current approach is intentionally staged and working, but it has two dialog behavior paths. That is acceptable short-term but increases future migration complexity.

Why it matters for users

- Divergent dialog behavior can create inconsistent focus or close behavior between desktop and mobile if not tested.

Why it matters for mobile/PWA

- Mobile sheets are core to app-like behavior and must not regress as Base UI desktop dialog adoption grows.

Recommended fix

- Continue wave-based dialog migration with screenshot-backed desktop/mobile tests. Do not globally replace `ResponsiveDialog`.

Implementation risk

- Medium

Suggested verification after future implementation

- Desktop focus trap and restoration tests.
- Mobile bottom sheet screenshots.
- iOS Safari safe-area verification.

### F-020

Severity

- Low

Category

- Accessibility

Affected file(s)

- `frontend/src/components/ui/ActionMenu.tsx`

Affected screen/component

- Action menus

Evidence from code

- `frontend/src/components/ui/ActionMenu.tsx:83-111` defines accessible trigger semantics and keyboard opening.
- `frontend/src/components/ui/ActionMenu.tsx:118-163` defines menu roles, item roles, roving tab index, arrows, Home/End, Tab close, and Escape close.

What is wrong

- ActionMenu is in a comparatively strong state now. The remaining risk is coverage across all multi-action/destructive surfaces, not the base component contract.

Why it matters for users

- Menus contain important actions: edit, logout, list actions, image actions, and removals.

Why it matters for mobile/PWA

- Mobile action menus need predictable focus and no accidental destructive behavior.

Recommended fix

- Keep expanding representative E2E coverage before any future Base UI Menu migration.

Implementation risk

- Low

Suggested verification after future implementation

- Multi-item arrow wrapping tests.
- Safe destructive-flow smoke without executing destructive actions.

## 14. Design System Assessment

Strengths:

- Strong token base in `:root`.
- Consistent dark theme.
- Green accent is coherent.
- Arabic font is configured centrally.
- Custom primitives are reused rather than copied locally.
- Base UI adoption is staged rather than broad.
- shadcn/Tailwind infrastructure exists without forcing a visual rewrite.

Risks:

- `globals.css` is large and combines tokens, primitives, page layouts, responsive shell behavior, dialogs, and feature-specific styles.
- Some core surfaces still rely on generic cards/rows.
- Visual identity is more "dark utility app" than "content/social catalog."
- Design system documentation should eventually define card density, image ratio, rating chip usage, and bottom-nav rules.

Recommendation:

- Do not rewrite the design system.
- Create one future component redesign target at a time.
- Start with a repeated surface such as place cards after PWA shell readiness is addressed.

## 15. Accessibility Assessment

Strengths:

- Root language/direction are correct.
- Focus-visible styling exists globally.
- Inputs use proper labels in key components.
- Search field has a clear label, searchbox role, clear button label, and result status.
- ActionMenu has a clear keyboard contract and implementation.
- Dialog work includes Base UI desktop pilot and custom mobile bottom sheet.
- Status and toast components use appropriate live/role patterns.

Evidence:

- `frontend/app/layout.tsx:37`
- `frontend/app/globals.css:108-110`
- `frontend/src/components/ui/SearchField.tsx:40-68`
- `frontend/src/components/ui/ActionMenu.tsx:83-163`
- `frontend/src/components/ui/Dialog.tsx:46-78`
- `frontend/src/components/ui/Toast.tsx`
- `frontend/src/components/ui/StatusMessage.tsx`

Gaps:

- No skip link.
- Route-level heading consistency should be kept under test as visual redesign happens.
- Rating control assistive text is not fully Arabic.
- Virtualized lists may need stronger list semantics.
- Future visual polish must not weaken focus visibility.

## 16. Performance and Core Web Vitals Risks

Current protections:

- Virtualized long lists.
- Lazy native image loading.
- Async image decoding.
- Image fallback on error.
- Next font loading with `display: "swap"`.

Evidence:

- `frontend/src/components/ui/VirtualList.tsx:25-63`
- `frontend/src/components/ui/PlaceImage.tsx:28-36`
- `frontend/app/layout.tsx:7-12`

Risks:

- No service worker caching.
- Native images need strict sizing/aspect-ratio discipline.
- Global CSS is large and broad.
- Route pages are largely client-heavy for authenticated flows.
- Dynamic public metadata/share assets are absent.

## 17. SEO and Shareability Risks

Current state:

- Global metadata exists.
- Manifest metadata exists.

Evidence:

- `frontend/app/layout.tsx:14-25`
- `frontend/app/manifest.ts:3-20`

Risks:

- No route-specific metadata found.
- Public content strategy appears auth-constrained.
- Open Graph/Twitter cards are absent.
- Public lists and place detail are weaker as share destinations.

Recommendation:

- Decide public/indexable route policy first.
- Then add dynamic metadata and share cards for public-safe routes.

## 18. AI-Generated Design Pattern Risks

Observed risk patterns:

- Dark radial glow and card surfaces can drift into generic AI/SaaS styling if expanded.
- Uniform row/card systems can make the product feel like a dashboard.
- Root page is a centered auth card, which is common in generated MVPs.
- Public/social catalog identity is not yet strong enough.

Observed strengths against AI-generic design:

- Arabic-first typography.
- Specific product concepts: ratings, favorites, wishlist, lists, profile.
- Green accent is consistent.
- No broad purple/blue AI gradient palette.
- Real app shell and component states exist.

Recommendation:

- Future redesign should lean into catalog artifacts: posters, place imagery, list collages, rating chips, profile identity, and browseable public content. Avoid generic feature-card sections.

## 19. Prioritized Roadmap

### P0 - Must Fix Before Serious User Testing

| Target | Why now | Expected impact | Difficulty | Risk | Owner area | Verification needed |
| --- | --- | --- | --- | --- | --- | --- |
| PWA manifest/offline fallback | The app wants PWA behavior but lacks service worker/offline fallback. | Higher trust in installed/mobile usage. | Medium | Medium | Frontend/PWA | Lighthouse, offline app-shell test, iOS install/open smoke |
| Mobile viewport/safe-area standardization | Remaining `100vh` and fixed bottom surfaces can regress on iOS. | More stable mobile shell. | Medium | Medium | Frontend CSS/App shell | 320/390/430 screenshots, iOS Safari check |
| Public discovery/access policy decision | Catalog/social value is hidden behind auth. | Better onboarding and sharing. | High | High | Product/Frontend/Backend | Anonymous route smoke, privacy review |

### P1 - High-Impact Improvements

| Target | Why now | Expected impact | Difficulty | Risk | Owner area | Verification needed |
| --- | --- | --- | --- | --- | --- | --- |
| Global or app-level search entry | Search is core to catalog products. | Faster discovery, stronger app feel. | Medium | Medium | Product/Frontend | Search E2E, direct-link behavior, RTL screenshots |
| Repeated catalog/place card redesign | Cards drive browsing quality. | More premium, less dashboard-like catalog. | Medium | Medium | Design System/Frontend | Visual snapshots across all card surfaces |
| Profile preview/archive split | Profile should be short and identity-first. | Better mobile scanability. | Medium | Medium | Frontend/Profile | Max preview E2E, archive route reachability |
| Route-level metadata/OG cards | Social sharing depends on preview quality. | Stronger public link experience. | Medium | Medium | Frontend/SEO | Metadata inspection, no private data leakage |

### P2 - Product Polish

| Target | Why now | Expected impact | Difficulty | Risk | Owner area | Verification needed |
| --- | --- | --- | --- | --- | --- | --- |
| Public list card previews | Public lists need taste/collection identity. | Better list browsing and sharing. | Medium | Medium | Product/Frontend/API if needed | Empty/non-empty list screenshots |
| Rating/review moment polish | Rating is a core emotional action. | More satisfying rating flow. | Medium | High | Frontend/Accessibility | EDR-002 review, touch/keyboard tests |
| Install prompt lifecycle | Permanent dismissal may suppress install education. | Better install adoption. | Low | Low | Frontend/PWA | Dismissal timing tests |
| Skip link | Accessibility low-cost improvement. | Better keyboard/screen reader navigation. | Low | Low | Frontend | Keyboard tab check |

### P3 - Later Enhancements

| Target | Why now | Expected impact | Difficulty | Risk | Owner area | Verification needed |
| --- | --- | --- | --- | --- | --- | --- |
| CSS modularization | Useful after visual direction stabilizes. | Easier long-term maintenance. | Medium | Medium | Design System | Screenshot regression suite |
| Richer manifest screenshots/shortcuts | Useful after core PWA is stable. | Better install surface. | Low | Low | PWA | Browser install panel check |
| Advanced share imagery | Requires visual assets and public policy. | Better social growth. | High | Medium | Product/Design/Frontend | OG preview validation |
| Base UI remaining high-risk primitives | Continue only where product value exists. | Better behavior/accessibility consistency. | High | High | Design System | Dedicated audits and PRs |

## 20. Recommended First Implementation Target

Chosen target:

- **PWA manifest/offline fallback**

Why this should be first:

- The product explicitly targets a mobile-first PWA experience.
- Current code has a manifest and install prompt but no service worker/offline fallback.
- Fixing PWA resilience is foundational and reduces risk before deeper visual redesign work.
- It can be scoped without changing product behavior, backend contracts, routing semantics, or visual identity.

Likely files involved later:

- `frontend/app/manifest.ts`
- `frontend/app/layout.tsx`
- `frontend/src/components/InstallAppPrompt.tsx`
- possible new service worker/public worker file
- possible offline fallback route/page
- E2E/PWA verification specs

What should be changed later:

- Add service worker registration.
- Add offline fallback.
- Define safe asset/app-shell caching.
- Add manifest `scope`/`id` if appropriate.
- Add PWA verification tests.

What should not be touched:

- Backend/API/auth/database.
- Product flows.
- Rating/list/profile business logic.
- Large visual redesign.
- Route slugs without explicit SEO/product approval.

Verification after implementation:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`
- Lighthouse PWA checks.
- Offline app-shell test.
- iOS Safari install/open smoke.
- Public endpoint smoke.

## 21. Verification Plan for Future Implementation

Every future UI/PWA implementation should include:

- Desktop and mobile screenshots.
- 320px, 390px, and 430px mobile checks.
- RTL-specific screenshot review.
- No horizontal overflow check.
- Keyboard/focus checks.
- Screen reader/ARIA checks for changed controls.
- Playwright E2E for behavior changes.
- Dependency policy check: no Radix unless explicitly approved.
- Backend gates when repository release policy requires them.
- Production smoke for released app-shell/navigation/PWA changes.

Suggested command gates:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`
- `python -m ruff format --check .`
- `python -m ruff check .`
- `python -m mypy app tests`
- `python -m pytest -q`

No gates were run for this audit because this task did not implement code.

## 22. What Was Not Changed

No application code was changed.

Not changed:

- frontend components
- CSS/styling
- routes
- backend code
- API contracts
- database schema
- migrations
- auth/session logic
- seed data
- business logic
- packages, except installing the requested local skill when it was missing

Created:

- `docs/UI_UX_PWA_REDESIGN_AUDIT_REPORT.md`

Allowed skill installation:

- `.agents/skills/redesign-existing-projects/SKILL.md`

## 23. Open Questions

1. Should `/places`, `/places/[id]`, `/lists/public`, and public list detail be browseable without authentication?
2. Should the home page become a public discovery surface or remain auth-first?
3. What is the intended offline behavior: shell-only fallback, cached read pages, or no offline data beyond an explanatory page?
4. Should public place/list pages be indexable by search engines?
5. Should route-level OG images be generated from place/list data?
6. Should search remain place-only, or eventually search lists/profiles too?
7. Should the profile page show a preview plus archive route, or keep a full archive inline?
8. Are reviews planned as long-form text, or are ratings/lists the primary user-generated content?
9. What image coverage is expected for places before redesigning cards around posters?
10. Should rating assistive text remain English per EDR-002, or is a future Arabic localization EDR desired?
