# Places UI/UX Brutal Audit

> Reviewed as: Principal UI/UX Director · Mobile Product Designer · Design Systems Architect · Arabic/RTL UX Specialist · Ruthless Product Quality Reviewer.
> Input: 5 iOS Safari screenshots (IMG_9390 listing, IMG_9392 search-focused, IMG_9393 add-place sheet, IMG_9394 place detail, IMG_9395 rating sheet). Anything not visible in these five is marked **cannot verify from screenshots**.

---

## 1. Executive Verdict

| Metric | Score |
|---|:--:|
| **Overall** | **6/10** |
| Visual | 7/10 |
| UX | 5.5/10 |
| Production readiness | 6/10 |

The visual identity is genuinely coherent — the dark surface, green accent, glow discipline, and focus rings read as one system, which is more than most PWAs achieve. But the app currently **looks better than it behaves**. The place detail page spends half a viewport saying almost nothing, the core rating flow offers three competing input mechanisms with an LTR slider inside an RTL product, list cards scan diagonally instead of right-to-left, and content visibly leaks behind the floating bottom nav. None of this is a redesign problem — it is a discipline problem, fixable in small PRs.

**Biggest 5 problems**
1. **Place detail hero is bloated and its CTA hierarchy is wrong** — a giant placeholder icon plus «أضف إلى رغباتي» as the primary action on a place the user already rated 9.5 (IMG_9394).
2. **Rating input is three overlapping mechanisms** (slider + arrows + 10 star buttons) with an **LTR slider** and a **«-/10» placeholder** in the most important flow in the app (IMG_9395).
3. **List cards scan diagonally**: name anchored left-of-center, metadata anchored hard right — a Z-pattern in an RTL product (IMG_9390).
4. **Content scrolls visibly behind/around the floating bottom nav** — card slivers peek out beside and below the pill (IMG_9390); end-of-list reachability is doubtful.
5. **Running in Safari chrome, not standalone PWA** — double bottom chrome (app nav + Safari toolbar) destroys the native feel the design is clearly aiming for (all screenshots).

**Biggest 5 opportunities**
1. Compact, information-dense place detail with a state-aware primary CTA — the single highest-leverage screen.
2. One rating input mechanism done perfectly (RTL slider with big live value) — instantly makes the core loop feel premium.
3. Fully right-anchored cards — the list will read twice as fast in Arabic.
4. Standalone PWA (manifest display + safe-area padding) — biggest "feels like an app" jump for the least code.
5. The place images feature already shipped — getting real images onto cards/hero will do more for perceived quality than any styling change (**currently dormant — no image visible in any screenshot**).

---

## 2. Screenshot-by-Screenshot Review

### IMG_9390 — Places listing — **6.5/10**

**Brutal verdict:** A competent skeleton wearing a good coat. The tab bar, search, and card chrome are solid; the internal card layout and the bottom edge of the screen are where it stops being premium.

**What works:** RTL tab order correct (المطاعم rightmost, selected state unambiguous); title typography strong; card surfaces/radii consistent; ratings visually scannable; type icon tiles consistent with the brand.

**What is weak:** card internal alignment; filter chip affordance; bottom-edge layering.

**What looks amateur:** card slivers visible beside/behind the floating nav pill; the diagonal name/metadata scan; «التصنيف: الكل» looks like a static label, not a control.

**What breaks trust:** content bleeding around the nav pill reads as a rendering bug even if intentional.

**What should stay:** tabs, search placement, card size/rhythm, FAB concept (relocated).

| ID | Sev | Evidence | Impact | Root cause (hypothesis) | Fix | Acceptance criteria |
|---|:--:|---|---|---|---|---|
| PL-01 | **P1** | Card: "Blu Pizzaria" starts left-of-center; «مطعم · إيطالي» hugs the right edge on the next line | Eye zig-zags on every card; Arabic scan order broken | Card row = icon+rating leading (left), name `flex:1` LTR-biased; metadata `text-align: end` on its own line | Mirror the card: type icon at the **right**, name + metadata stacked **right-anchored** beside it, rating pill as the **left (trailing)** element, vertically centered | On 390px, name and metadata share the same right anchor; rating pill alone on the left; no text starts left of the card midline unless it overflows |
| PL-02 | **P0** | A card ("Burger Butcher Shop…") is partially visible **behind and below** the nav pill, clipped by Safari's bar | Looks broken; last items likely unreachable/obscured at scroll end | Floating pill nav + no `scroll-padding-bottom` / bottom spacer; no `env(safe-area-inset-bottom)` compensation | Add list bottom padding = nav height + safe-area + margin; optionally a `backdrop-blur` + gradient scrim under the pill | Scrolled to end, the last card clears the nav fully; no card fragment ever visible beside/behind the pill |
| PL-03 | **P1** | Green «+» FAB at top-left with glow | Top-left is the worst one-handed reach zone; competes with the page title for attention | FAB positioned in header for symmetry | Move create-place into the header as a quiet icon button, or a bottom-anchored FAB above the nav (right side in RTL) | Create action reachable by thumb on 390px without regrip; header contains title + one quiet action max |
| PL-04 | **P2** | «التصنيف: الكل» chip, small icon, sits alone | Users won't discover subtype filtering | Chip styled like metadata, not a button | Style as an obvious control (border, chevron-down); show active filter as a filled chip with a clear (×) | Tap target ≥44px; active filter visually distinct from "all" |
| PL-05 | **P2** | Rating pill and icon tile both compete at card leading edge | Two green elements fight; rating is the datum users scan for | Equal visual weight | Reduce icon tile saturation; make the rating pill the single accent per card | One accent element per card at normal state |
| PL-06 | **P3** | Bottom nav order (RTL): قوائمي، الأماكن، بحث، صفحتي | «الأماكن» is the de-facto home but sits second | IA ordering | Consider الأماكن as the first (rightmost) tab | First tab = most-used destination |

### IMG_9392 — Search focused — **6.5/10**

**Brutal verdict:** The focus treatment is the best moment in the flow — clear ring, correct trailing clear button. The problem is what's around it: the screen doesn't reorganize for search mode.

**What works:** green focus ring (visible a11y win); clear (×) correctly trailing (left in RTL); placeholder/text right-aligned; tabs stay visible for scope context.

**What is weak:** typed «مطعم» while visible results (Blu Pizzaria) don't contain that string — either debounce lag or name-only search against a type word; **cannot verify from screenshots** which. Filter chip stays interactive but half the list is under the keyboard.

| ID | Sev | Evidence | Impact | Root cause | Fix | Acceptance criteria |
|---|:--:|---|---|---|---|---|
| SR-01 | **P1** | Query «مطعم» shows results seemingly unrelated to the string | If real: users typing category words get "wrong" results and no explanation | Search matches name only; users think it searches everything | Show an inline scope hint («نبحث في أسماء الأماكن») or match type/subtype synonyms client-side | Typing a category word either matches by category or explains the scope; no silent mismatch |
| SR-02 | **P2** | Bottom nav has a «بحث» tab AND the places page has inline search | Two entry points, unclear contract; **cannot verify** what the tab opens | Duplicated affordances | Define one: nav «بحث» = global search; keep inline as list filter with distinct placeholder wording | Each search affordance states its scope in its placeholder |
| SR-03 | **P3** | No result count / empty-state visible while typing | User can't tell if filtering is happening | — | Live result count under the field («٨ نتائج») | Count updates with debounce; empty state has a clear CTA |

### IMG_9393 — Add place sheet — **7/10**

**Brutal verdict:** The most disciplined screen of the five. Correct sheet anatomy (grabber, title right, close left), correct button hierarchy, clean field stack. Weakness is in the selects and validation affordance.

**What works:** RTL header anatomy; primary/secondary stack (حفظ green, إلغاء ghost, full-width, thumb-reachable); focus ring on the name field; label placement.

| ID | Sev | Evidence | Impact | Root cause | Fix | Acceptance criteria |
|---|:--:|---|---|---|---|---|
| AD-01 | **P2** | Selects show a tiny two-way chevron at the far left; «اختر» state for subtype | Selects look like text rows; low tap affordance | Native `<select>` minimal styling | Style select rows like tappable fields (border, chevron-down at left, 48px min height) | Selects visually match text inputs; chevron ≥16px |
| AD-02 | **P2** | «حفظ» renders fully enabled while the required name is empty | Users tap and get a rejection instead of guidance; **cannot verify** submit behavior | No disabled/validation state on the primary | Keep enabled but show inline field error on submit, or disable until name non-empty (pick one convention app-wide) | Tapping حفظ with empty name produces an inline field error within the sheet, no dead tap |
| AD-03 | **P3** | Sheet at ~50% height with large void above | Slight imbalance on tall screens | Fixed content height | Fine as-is; consider anchoring content taller on small screens only | — |

### IMG_9394 — Place detail — **5.5/10**

**Brutal verdict:** This is the money screen and it wastes it. Half the viewport is a decorative icon and two stacked full-width buttons — for a place the user has **already rated 9.5**. The wishlist CTA as the hero primary is a logic error, not a taste choice: wishlist is for places you intend to visit; this user has been there. Meanwhile the actual content (ratings, info) is pushed below the fold, and the two rating cards repeat the same number (9.5) twice.

**What works:** back/menu buttons are quiet and consistent; chips are clean; the rating badges are legible; «تعديل التقييم» affordance is clear; the community/user rating split is honest.

**What looks amateur:** hero-scale placeholder icon (the image feature shipped but is dormant — this tile at 150px+ with glow announces "we have no content"); two stacked full-width CTAs of near-equal visual weight.

| ID | Sev | Evidence | Impact | Root cause | Fix | Acceptance criteria |
|---|:--:|---|---|---|---|---|
| PD-01 | **P1** | «أضف إلى رغباتي» is the green primary above «أضف إلى قائمة», on a place with «تقييمك الحالي 9.5/10» | The #1 CTA is contextually wrong for anyone who already rated; trains users to ignore the primary | Static CTA layout, no state awareness | State-aware hero actions: unrated → primary «أضف إلى رغباتي»; rated → primary «تعديل التقييم» (or compact action row), wishlist demoted to secondary/icon | For a rated place, the visually dominant action relates to the user's rating; wishlist never primary when `currentUserRating` exists |
| PD-02 | **P1** | Icon tile ≈150px + glow + 40px name + chips + 2 full-width buttons ≈ 55% of viewport before any data | One full swipe to reach actual information | Hero built for an image that doesn't exist yet | Compact hero: 96px tile, name + chips beside/below it, actions as one horizontal row (primary + icon-secondary); when a real image exists, allow the tall hero | On 390×844, تقييمك card's top edge is visible without scrolling |
| PD-03 | **P2** | «تقييمك 9.5/10» card and «تقييم المجتمع 9.5 · تقييم واحد» card = same number twice, two cards | Redundant, inflates page length | Two sections built independently | Merge into one «التقييم» card: your rating (with edit) + community line under it | One rating card; both values visible; edit reachable |
| PD-04 | **P2** | Back «<» at top-LEFT pointing left; menu at top-right | In RTL, back conventionally sits top-RIGHT pointing right (iOS mirrors); current layout is LTR anatomy | Topbar not mirrored | Mirror the topbar for RTL: back at right with a right-pointing chevron, menu at left | Back control at the inline-start (right) edge with direction-correct chevron |
| PD-05 | **P3** | Chips «إيطالي مطعم» duplicated by «معلومات المكان» section below (**cannot fully verify** — below fold) | Repeated data | — | Keep chips, trim the info section to non-duplicated fields | — |

### IMG_9395 — Rating sheet — **5/10**

**Brutal verdict:** The core action of the entire product, and it opens with «-/10», an LTR slider whose 1 sits on the left in an Arabic app, and **three** ways to input one number. Precision ≠ quality: 10 star buttons + a slider + arrow-key support is not generosity, it's indecision shipped to the user.

**What works:** the microcopy «لن يغيّر التقييم قوائمك أو عضوية هذا المكان فيها.» is genuinely excellent — it answers a real fear at exactly the right moment. Place-name context panel is good. «ملاحظتك خاصة» privacy hint is good.

| ID | Sev | Evidence | Impact | Root cause | Fix | Acceptance criteria |
|---|:--:|---|---|---|---|---|
| RT-01 | **P1** | Slider: thumb + «1/10» at LEFT, «10/10» at RIGHT | Progression runs left→right in a right→left product; muscle memory inverted in the core flow | `input[type=range]` not inheriting/mirroring `dir="rtl"` | Force RTL on the range control (dir attr / CSS) so 1 starts at the right; keep `aria-valuetext` per EDR-002 untouched | In RTL, min sits at the right, thumb moves leftward as value grows; keyboard arrows still work; EDR-002 output unchanged |
| RT-02 | **P1** | «-/10» value badge before any selection | Reads like broken data at the emotional peak of the flow | Placeholder renders raw dash into the /10 template | Empty state = «اختر تقييمًا» text (no /10 template until a value exists), or default the slider to 7 with the badge live | The /10 badge never renders without a numeric value |
| RT-03 | **P1** | Slider + arrows-instruction + 10 star buttons, all setting the same value | Choice paralysis; visual noise; stars imply a 5-star mental model that doesn't exist here | Two generations of input UI shipped together | Pick ONE: the slider with a big live value (recommended, matches the /10 scale). Remove the 10-star row entirely | Exactly one input mechanism; sheet height shrinks ≥25%; rating still keyboard-accessible |
| RT-04 | **P2** | Panel label «تقييم المكان» + sheet title «قيّم المكان» + section «تقييمك» — three near-identical labels in one viewport | Verbal clutter | Sections written independently | Title once; the name panel needs no label; «تقييمك» keeps the section | Each label appears once per sheet |
| RT-05 | **P3** | 10 star tap targets ≈70px wide each incl. gaps (if retained) | Borderline dense on 320px | — | Moot if RT-03 removes them | — |

---

## 3. Cross-Screen Systemic Issues

- **Anchoring discipline (RTL):** the system正确ly right-anchors headers, tabs, sheet titles — but cards (PL-01), the detail topbar (PD-04), and the slider (RT-01) leak LTR anatomy. RTL here is 90% done, and the missing 10% is precisely in the highest-frequency components.
- **State-blind CTAs:** the hero primary ignores `currentUserRating` (PD-01); حفظ ignores form validity (AD-02). The design system has hierarchy but no *conditional* hierarchy.
- **Redundancy as a pattern:** three rating inputs (RT-03), two rating cards (PD-03), three labels in one sheet (RT-04), two search entry points (SR-02). The product repeatedly ships two generations of an idea instead of choosing.
- **Bottom edge is nobody's job:** scroll-under slivers (PL-02), double chrome with Safari, safe-area unhandled. Everything above 90% of the screen is designed; the last 10% is abandoned.
- **Placeholder-forward visuals:** icon tiles at hero scale (PD-02) and saturated tiles on every card (PL-05) celebrate the absence of images. The images feature exists — it's dormant pending storage env vars.
- **Data quality:** **no test/smoke data visible in these five screenshots** — no "CodexSmoke", no numeric suffixes, no generated names. Visible names (Blu Pizzaria, BLY'S, BLANCA, Baodo, Habteen Shawarma - حبتين شاورما) read as authentic user content ("Pizzaria" is the user's own spelling — not an app defect, no action). Cannot verify beyond these screenshots.
- **Typography/numerals:** Western digits used consistently for ratings (9.5, 8.0) — a defensible, consistently-applied choice. Arabic type rendering is clean throughout. No mixed-digit bugs visible.

## 4. P0 Fixes

| ID | Title | Why P0 |
|---|---|---|
| **PL-02** | Bottom nav scroll-under + safe-area + end-of-list clearance | Visible layering artifact on the main screen; reads as a bug; risks unreachable content |
| **SYS-01** | Standalone PWA chrome (manifest `display: standalone`, `theme-color`, `env(safe-area-inset-*)` padding, iOS meta) — **cannot verify manifest state from screenshots**; if already standalone-capable, reduce this to an install affordance | Double bottom chrome (app nav + Safari toolbar) is the single biggest "this is a website" signal; every other polish inherits from it |

*(Honesty note: the classic P0 category — test data shown to users — has **no visible instances** in these screenshots.)*

## 5. P1 Fixes

| ID | Title |
|---|---|
| PD-01 | State-aware place-detail primary CTA (rated → rating action primary; wishlist demoted) |
| PD-02 | Compact hero (96px tile, single action row, data above the fold) |
| RT-01 | RTL-correct rating slider |
| RT-02 | Kill «-/10» empty state |
| RT-03 | Single rating input mechanism (remove the 10-star row) |
| PL-01 | Right-anchored card layout (icon right, text right, rating trailing left) |
| PL-03 | Relocate create-place FAB out of top-left |
| SR-01 | Search scope honesty (hint or category matching) |
| PD-04 | Mirror detail topbar for RTL |

## 6. Visual Design Improvements

- **Cards:** one accent per card (rating pill); desaturate icon tiles ~30%; equal top/bottom padding; name+metadata on one right anchor with 4px gap; consider 2px-inset image thumbnails when images go live.
- **Hero:** 96px tile, remove outer glow on placeholder (keep it for real images); name `clamp(24px, 6vw, 30px)`; chips inline under name; actions = one row: primary pill + 44px icon-secondary.
- **Buttons:** primary = filled green (one per viewport, enforced); secondary = outline; tertiary = text. The detail page currently shows two near-primaries — never again.
- **Chips:** filter chips get borders + chevrons (controls); descriptive chips stay borderless (labels). Two visually distinct species.
- **Bottom nav:** reduce pill height ~15%; add blur+scrim beneath; active tab = filled pill (current treatment is good); respect safe-area.
- **Menus:** **cannot verify from screenshots** (no open menu captured) — audit separately that RTL popovers open inward and never clip.
- **Typography:** keep the strong title scale; drop card metadata to 12px/`--color-text-2`; never let two same-size text blocks sit on opposite anchors in one row.
- **Background/glow:** current radial glows are tasteful; cap at one glow per viewport; kill the FAB glow (it fights the nav's active state).

## 7. UX Flow Improvements

- **Discover:** listing → filter chip becomes an obvious control (PL-04) + live result count (SR-03); subtype chips row appears when a type tab is active.
- **Open detail:** compact hero (PD-02) puts تقييمك above the fold; back mirrored (PD-04).
- **Save to wishlist:** stays one tap in hero but as secondary when rated (PD-01); toggle state must read instantly («في رغباتي» filled state).
- **Add to list:** unchanged flow, moves into the action row.
- **Rate:** one mechanism (RT-03), RTL slider (RT-01), live value from first touch (RT-02), keep the excellent decoupling microcopy.
- **Navigate back:** consistent mirrored topbar everywhere.
- **Search/filter:** scope-honest placeholders (SR-01/SR-02); keyboard-open state keeps count visible above the fold.

## 8. Arabic / RTL Improvements

1. **RT-01** — range input renders LTR: min/1 must sit at the **right**. This is the most user-visible RTL defect.
2. **PL-01** — cards: leading (icon/name) belongs to the right edge; trailing (rating) to the left. Current layout is mirrored wrong.
3. **PD-04** — back button anatomy: top-right, chevron pointing right (iOS RTL convention).
4. Mixed-name handling (BidiText) works — "Habteen Shawarma - حبتين شاورما" renders without direction breakage. Keep.
5. Numerals: Western digits applied consistently; acceptable — do not mix ٩٫٥ and 9.5 later.
6. Sheet anatomy (title right, close left, grabber center) is correct — this is the standard the cards/topbar should match.

## 9. Accessibility Improvements

- **Tap targets:** star buttons (if they survive RT-03 — they shouldn't) and the filter chip are the only sub-44px suspects visible; select rows in AD-01 should hit 48px.
- **Contrast:** metadata gray-on-dark passes at a glance for 12px+ (**cannot verify exact ratios from screenshots**); the green-on-dark rating pills are strong.
- **Focus states:** the green focus ring (IMG_9392/9393) is genuinely good — extend it to cards, chips, nav items for keyboard/switch users.
- **Screen reader names:** rating badge must keep EDR-002 `aria-valuetext`; the «-/10» state (RT-02) currently risks announcing garbage — verify.
- **Semantics:** filter chip must be a `button` with `aria-expanded`; star row (if kept) is a radiogroup, not 10 buttons; nav items need `aria-current="page"`.
- **Slider:** keep arrow-key support after RTL flip; announce value changes politely.

## 10. Production Trust Issues

1. **Safari chrome + floating nav double-stack** — the app looks embedded, not installed (SYS-01).
2. **Scroll-under slivers** beside the nav pill (PL-02) — reads as a rendering bug.
3. **«-/10»** (RT-02) — looks like a null leaked into the UI.
4. **Hero-scale placeholder icons** (PD-02) — announces missing content; activate the shipped images feature (storage env vars) to fix at the root.
5. **No test/smoke data visible** — genuinely clean on this axis in all five screenshots.

## 11. Recommended Redesign Direction

**Stay:** dark premium surfaces, green accent, focus rings, sheet anatomy, tab bar treatment, rating badge language, decoupling microcopy, BidiText handling.

**Tone down:** glow count (one per viewport), icon tile saturation on cards, hero scale until real images exist, button duplication.

**Remove:** the 10-star input row, the second rating card on detail, the «-/10» state, the top-left FAB glow.

**How it should feel:** like a fast, quiet, native Arabic app — right-anchored everything, one obvious action per screen, data above the fold, and the bottom edge owned by the app (not Safari). The brand is already premium; the behavior needs to catch up to it.

## 12. Implementation Roadmap

> All PRs small, testable, no backend changes required except where marked optional. Existing mock-based E2E pattern covers all of these.

**PR-01 — P0: Bottom edge & app chrome** *(risk: low)*
- **Goal:** own the bottom edge; kill scroll-under artifacts; standalone PWA behavior.
- **Scope:** list/scroll bottom padding = nav + `env(safe-area-inset-bottom)`; blur/scrim under nav pill; manifest `display: standalone` + `theme-color` + iOS meta (verify current manifest first — cannot verify from screenshots).
- **Files (likely):** `frontend/app/globals.css`, app shell/bottom-nav component, `frontend/app/manifest.ts`(or `public/manifest.json`), `frontend/app/layout.tsx`.
- **Acceptance:** end of list fully clears nav on 320/390/430; no card fragment beside the pill; installed PWA shows no browser chrome.
- **Screenshots required:** listing scrolled to end (3 widths); installed-PWA home screen launch.
- **Tests:** extend `responsive-layout.spec.ts` with a scrolled-to-end clearance assertion.

**PR-02 — Place detail action hierarchy & layout** *(risk: medium)*
- **Goal:** state-aware CTAs + compact hero (PD-01/02/03/04).
- **Scope:** hero restructure; primary = rating action when `currentUserRating` exists; merge rating cards; mirror topbar.
- **Files:** `frontend/src/features/places/PlaceDetailPage.tsx`, `frontend/app/globals.css`.
- **Acceptance:** تقييمك visible above the fold at 390×844; exactly one filled-green button; back at inline-start with correct chevron.
- **Screenshots:** rated & unrated place, 3 widths. **Tests:** update place-detail specs; add state-aware CTA assertions.

**PR-03 — Cards visual polish** *(risk: low)*
- **Goal:** right-anchored card anatomy (PL-01/05).
- **Files:** `frontend/src/components/ui/PlaceCard.tsx`, `globals.css`.
- **Acceptance:** single right anchor for name+metadata; rating pill trailing left; one accent per card.
- **Screenshots:** Arabic, English, mixed, long names. **Tests:** responsive-layout long-name containment still green.

**PR-04 — Search/filter UX** *(risk: low)*
- **Goal:** SR-01/02/03 + PL-04: control-styled filter chip, result count, scope-honest placeholders.
- **Files:** `PlaceLibraryPage.tsx`, `SearchField.tsx`, `globals.css`.
- **Acceptance:** filter chip ≥44px with chevron + active state; live count; placeholders state scope.
- **Tests:** places E2E filter/search flows updated.

**PR-05 — Rating sheet overhaul** *(risk: medium — core flow)*
- **Goal:** RT-01/02/03/04: one RTL slider, no «-/10», no star row, deduplicated labels.
- **Files:** `frontend/src/components/ui/RatingControl.tsx`, `RatePlaceDialog`/rate page, `globals.css`.
- **Acceptance:** slider min at right; badge never shows a non-numeric value; exactly one input mechanism; EDR-002 `aria-valuetext` byte-identical.
- **Screenshots:** empty → mid-drag → chosen, RTL verified. **Tests:** rating E2E updated; a11y harness re-run; EDR-002 assertion kept.

**PR-06 — Accessibility/RTL sweep** *(risk: low)*
- **Goal:** §8/§9 leftovers: FAB relocation (PL-03), focus rings on cards/chips/nav, `aria-current`, filter-chip semantics, RTL popover audit.
- **Acceptance:** axe/a11y harness green; keyboard path through list→detail→rate works; no popover clipping at 320px.

**PR-07 — Final mobile production QA** *(risk: low)*
- **Goal:** device-matrix pass (320/390/430 + iOS standalone + Android), screenshot inventory of every state, regression of PR-01→06 acceptance criteria.
- **Deliverable:** QA report + updated E2E snapshots; no new features.

---

**Recommended first implementation PR: PR-01 — P0: Bottom edge & app chrome** (smallest diff, kills both P0s, and every later screenshot review depends on the bottom edge being trustworthy first).
