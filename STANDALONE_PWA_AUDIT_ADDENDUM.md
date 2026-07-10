# Standalone PWA UI/UX Audit Addendum

> Follow-up to `PLACES_UI_UX_BRUTAL_AUDIT.md`. Scope: **only** what the 2 standalone-PWA screenshots reveal — IMG_9398 (places listing, loading state, 4:10) and IMG_9399 (profile «صفحتي», 4:13), launched from the iPhone Home Screen. Safari-chrome findings are not re-litigated. Anything not visible here is marked **cannot verify from screenshots**.

---

## 1. PWA Executive Verdict

| Metric | Score |
|---|:--:|
| **Standalone PWA overall** | **6.5/10** |
| App-like feel | 7/10 |
| Safe-area handling | 4/10 |
| Production readiness | 6/10 |

The good news first, because it's structural: **the standalone shell fundamentally works**. True fullscreen, no browser chrome, the dark canvas owns the screen, and the bottom nav finally reads as an app tab bar instead of a widget floating above Safari. The single biggest Safari-mode complaint (double bottom chrome) is **gone by installation** — the manifest/standalone path is real.

Then the app immediately spends that credibility: a **permanently visible skip link sits on top of the iOS status bar icons**, rendering as overlapping garbled text on **every page** — the first pixels a user sees at every launch look corrupted. Content **still** bleeds behind the bottom nav (profile archive row visibly clipped by the pill — proving that finding was never Safari's fault). And the loading state is three blank voids followed by 40% dead black screen.

**Biggest 5 PWA-specific issues**
1. **Skip link «تجاوز إلى المحتوى» permanently visible, overlapping the iOS status bar icons** — looks like corrupted rendering, on every screen (P0).
2. **Content still scrolls behind/below the bottom nav** — "Burger Boutique" row and its rating badge clipped by the pill in IMG_9399; confirms PL-02 is a shared issue, not Safari-only (P0).
3. **Skeleton cards are anatomy-free blank blocks** — 3 empty rectangles then a huge void; they read as broken, not loading (P1).
4. **Profile identity card has four different anchors** — eyebrow right, name "Turki" hard left, bio right, button center. The card scans like a pinball (P1).
5. **LTR place names anchor left while mixed names anchor right** in the archive rows ("Blu Pizzaria" left, "Habteen Shawarma - حبتين شاورما" right) — `dir=auto` side effect breaking the right rhythm (P1).

---

## 2. Screenshot 1 Review — IMG_9398 (Places listing, loading, standalone)

**Score: 5.5/10**

**Brutal verdict:** The shell is right and the content is absent — and what fills the absence is wrong twice. The skip link squats on the status bar like a rendering error, and the "loading state" is three unlabeled gray coffins over a black void. A returning user launching from the Home Screen sees *corrupted text + empty boxes* as their first impression, every time, until data arrives.

**What works:** fullscreen dark canvas; header/tabs/search spacing breathes better without Safari chrome; bottom nav margin above the home-indicator zone looks correct (**exact inset cannot be verified from a static screenshot**); tabs/search/filter identical to Safari mode — no standalone layout regressions in the app shell itself.

| ID | Sev | Evidence | Impact | Root cause (hypothesis) | Fix | Acceptance criteria |
|---|:--:|---|---|---|---|---|
| PWA-01 | **P0** | «تجاوز إلى المحتوى» pill rendered at top-right, its text visually colliding with the cellular/Wi-Fi/battery glyphs; reads as garbled/corrupted; present in both screenshots | First visual on every launch looks broken; hides system status icons (battery!) behind app UI | Skip link styled as an always-visible element instead of the visually-hidden-until-focus pattern; no `env(safe-area-inset-top)` offset either | Standard sr-only skip link: absolutely positioned off-screen/clipped by default, becomes visible **only on keyboard `:focus-visible`**, and when visible, offset below the safe-area inset | Skip link invisible on load/touch on all pages; appears on first Tab press below the status bar; never overlaps system UI; still first in tab order |
| PWA-02 | **P1** | Three fully blank rounded rectangles (no icon slot, no text lines, no shimmer discernible), then ~40% of the viewport empty black above the nav | Loading reads as "broken cards" / "empty app", not progress | `LoadingState` renders bare card shells; count=3 regardless of viewport height | Skeletons mirror final card anatomy (icon tile block, rating pill block, two text lines) with a subtle pulse; render enough rows to fill the viewport height | Skeleton row visually maps 1:1 to a real card's layout; skeletons fill ≥90% of the list area; pulse animation present (respecting `prefers-reduced-motion`) |
| PWA-03 | **P3** | Skip pill also overlaps where the dynamic-island/status region sits | Same family as PWA-01 | Same | Covered by PWA-01's safe-area offset | Same as PWA-01 |

## 3. Screenshot 2 Review — IMG_9399 (Profile «صفحتي», standalone)

**Score: 6/10**

**Brutal verdict:** Structurally, this page is the roadmap executed — identity card, stats trio, favorites empty state, ratings preview, all present and in the right order. Visually, it's an anchoring accident: the one card that defines "personal identity" scatters its four elements across four different alignments, the stats tile hides an unexplained «؟» glyph, and the last archive row is decapitated by the bottom nav. The bones are right; the typesetting betrays them.

**What works:** header anatomy correct (title right, kebab trailing left, no back button — per product decision); avatar correctly leading at the right; stats order correct RTL (التقييمات rightmost); favorites empty state with dashed slots + CTA matches the approved design; archive rows show icon-right leading (better than the places listing!); rating badges «تقييمك 8.5/10» are clear.

| ID | Sev | Evidence | Impact | Root cause (hypothesis) | Fix | Acceptance criteria |
|---|:--:|---|---|---|---|---|
| PWA-04 | **P0** *(same defect as PL-02, now proven shared)* | "Burger Boutique" row + its rating badge visibly clipped behind/below the nav pill at screen bottom | Last archive rows unreadable/unreachable-looking; looks like a z-index bug | No scroll-end padding = nav height + safe-area; no scrim under the floating pill | Bottom padding on the scroll container + gradient scrim/blur beneath the nav | At scroll end, the last row fully clears the nav on 320/390/430; mid-scroll rows fade under a scrim instead of hard-clipping |
| PWA-05 | **P1** | Identity card: eyebrow «الملف الشخصي» right-anchored, name "Turki" at the far **left** edge, "Testing bio" right-of-center, edit button centered | The identity card — the page's emotional core — has no reading line; looks accidentally laid out | Name/bio rendered through `BidiText`/`dir=auto`; pure-LTR content flips its own paragraph direction to LTR → left alignment, while Arabic siblings stay right | Anchor all identity-card text blocks to the right (container `text-align: start` in RTL with `dir` handled *inside* the line, not on the block); name, bio, eyebrow share one right anchor; button aligns to the same anchor | Name, bio, eyebrow, and button all share the right anchor on 390px; Latin names render LTR *internally* but positioned from the right |
| PWA-06 | **P1** | Archive rows: "Blu Pizzaria" and "Burger Boutique" (pure LTR) anchor **left**; "Habteen Shawarma - حبتين شاورما" (mixed) anchors right | Row-by-row alignment lottery; scanning rhythm broken | Same `dir=auto` mechanism as PWA-05 (this is PL-01's disease surfacing in a second component) | Same fix pattern as PWA-05 applied to `.profile-rating-list` rows | All archive row names share the right anchor regardless of script; long names ellipsize toward the left |
| PWA-07 | **P2** | Small green circle with «؟» inside the «التقييمات 12» stat tile, vertically misaligned, ~20px | Unexplained glyph in the most prominent stats row; looks stray | **Cannot verify purpose from screenshot** — possibly an info/tooltip affordance or a leaked icon fallback | Identify in code; if intentional info affordance: ≥44px target + `aria-label` + proper alignment; if leaked: remove | No unexplained glyphs in stat tiles; any info affordance is labeled and tappable |
| PWA-08 | **P2** | Favorites empty state ≈430px tall (4 large dashed slots + full-width button) | An *empty* section outweighs sections with real content | Placeholder slots sized like real poster cards | Halve placeholder height (or 4 compact slots in one row), keep CTA | Empty favorites ≤ ~260px total; CTA unchanged; populated state untouched |
| PWA-09 | **P3** | Bio reads "Testing bio" | Screenshot smells like a test build — but this is **owner-entered content**, not an app defect | User typed it during Phase 2 testing | No code change; replace your own bio 🙂 | — |

---

## 4. Safari vs PWA Comparison

| Dimension | Safari mode | Standalone PWA | Classification |
|---|---|---|---|
| Top spacing | Status bar + Safari URL context | Clean; header breathes; **but skip link collides with status icons** | Skip link: **PWA-evidenced** (likely shared, never captured in Safari — **cannot verify** there) |
| Bottom spacing | Double chrome (app nav + Safari toolbar) | Single app nav with plausible home-indicator margin | Safari-only issue → **ALREADY FIXED by installation** (SYS-01 resolved) |
| Navigation behavior | Nav floats above Safari bar | Nav reads as a real tab bar | **Already fixed** (by standalone mode) |
| Content clearance above nav | Card slivers behind/around pill (PL-02) | "Burger Boutique" row clipped by pill | **Shared issue — STILL VALID** (now proven not Safari's fault) |
| App-like feel | Website-in-browser | Genuinely app-like shell | PWA win; remaining gaps are in-app polish |
| Loading states | Not captured in Safari set | 3 blank blocks + void | **PWA-evidenced** (mechanism is shared; judged here first) |
| Accessibility elements visibility | Skip link not visible in Safari captures | Skip link permanently visible | **PWA-evidenced**; treat as shared until verified |
| Layout (tabs/search/cards/header) | As audited | Identical — no standalone-specific layout regressions | Shared baseline; prior findings carry over |

## 5. P0 / P1 PWA Findings (consolidated)

**P0**
- **PWA-01** — permanently visible skip link overlapping iOS status bar (evidence, impact, fix, AC in §2).
- **PWA-04 / PL-02** — content clipped behind bottom nav in standalone (§3) — the P0 from the Safari audit, now confirmed device-independent.

**P1**
- **PWA-02** — skeletons don't match card anatomy; loading looks broken (§2).
- **PWA-05** — identity card multi-anchor chaos (§3).
- **PWA-06** — LTR-name rows anchor left (dir=auto) in archive rows (§3).

## 6. Update to Previous Audit

| Prior finding | Status after PWA evidence |
|---|---|
| **PL-02** (scroll-under bottom nav) | **CONFIRMED IN PWA** — visible on profile archive too; upgrade from "listing bug" to app-shell bug |
| **SYS-01** (standalone PWA chrome) | **ALREADY FIXED** — the app installs and runs standalone; the double-chrome half of the finding was Safari-only. Residual (optional install affordance for Safari users): NEEDS PRODUCT DECISION, P3 |
| **PL-01** (card anchoring, places listing) | **CONFIRMED IN PWA** — and **extended**: the same anchoring disease appears in the profile identity card (PWA-05) and archive rows (PWA-06); fix should be one shared pattern, not three local patches |
| **PL-03** (FAB top-left) | **CONFIRMED IN PWA** (unchanged in IMG_9398) |
| **PL-04** (filter chip affordance) | **CONFIRMED IN PWA** (unchanged) |
| **PL-06** (nav order) | **CONFIRMED IN PWA** (unchanged) |
| PD-01…PD-05 (place detail) | **CANNOT VERIFY** — screen not captured in PWA mode |
| RT-01…RT-05 (rating sheet) | **CANNOT VERIFY** — not captured |
| SR-01…SR-03 (search) | **CANNOT VERIFY** — not captured |
| AD-01…AD-03 (add sheet) | **CANNOT VERIFY** — not captured |
| "No test data visible" | Still true for place data; "Testing bio" is owner-entered profile content (PWA-09), not app-generated |

## 7. Focused Implementation Plan

> All frontend-only. "Fast Lane" = small CSS/markup diff, mock-E2E coverage, low regression surface. "Full Release" = component logic changes needing the full gate suite.

**PR-PWA-01 — Hide skip link; focus-only reveal** *(risk: very low · **Fast Lane**)*
- **Goal:** kill the P0 first-impression corruption on every page.
- **Scope:** sr-only-until-`:focus-visible` pattern for the skip link; when focused, position below `env(safe-area-inset-top)`; keep it first in tab order.
- **Files (likely):** `frontend/app/layout.tsx` (skip link markup), `frontend/app/globals.css`.
- **Acceptance:** invisible on load/touch on all pages; Tab reveals it below the status bar; activating it moves focus to main content; never overlaps system UI.
- **Screenshots:** standalone launch (places + profile) showing clean status bar; one screenshot with keyboard focus showing the revealed link.
- **Tests:** accessibility-harness assertion — skip link not visible without focus, visible with focus, `href` target exists.

**PR-PWA-02 — Bottom content clearance above nav (standalone)** *(risk: low · **Fast Lane**)*
- **Goal:** close PL-02/PWA-04 for good.
- **Scope:** scroll-container bottom padding = nav height + `env(safe-area-inset-bottom)` + margin; gradient scrim/blur layer under the nav pill; apply app-shell-wide (places list, profile, lists).
- **Files:** `frontend/app/globals.css`, bottom-nav/app-shell component.
- **Acceptance:** at scroll end, last card/row fully clears the nav on 320/390/430; mid-scroll content fades under the scrim instead of hard-clipping; no fragment beside the pill.
- **Screenshots:** places + profile scrolled to end, standalone, 3 widths.
- **Tests:** extend `responsive-layout.spec.ts` with scroll-to-end clearance assertions on both pages.

**PR-PWA-03 — Skeleton/loading anatomy** *(risk: low · **Fast Lane**)*
- **Goal:** loading that looks like loading (PWA-02).
- **Scope:** `LoadingState` card variant gets internal anatomy (icon block, pill block, 2 text lines) + pulse (guarded by `prefers-reduced-motion`); row count fills viewport (or fixed 6).
- **Files:** `frontend/src/components/ui/LoadingState.tsx`, `globals.css`.
- **Acceptance:** skeleton maps 1:1 to real card anatomy; ≥90% list-area fill during load; reduced-motion honored; `aria-label`/`role=status` behavior unchanged.
- **Screenshots:** places loading state, standalone.
- **Tests:** existing loading-state E2E assertions still green; snapshot of skeleton structure.

**PR-PWA-04 — Profile anchoring & polish** *(risk: medium · **Full Release**)*
- **Goal:** one right-anchor rule across the profile (PWA-05, PWA-06, PWA-07, PWA-08).
- **Scope:** identity card — eyebrow/name/bio/button on one right anchor with bidi handled inside the line (bidi-isolation on spans, block stays RTL-aligned); archive rows — same pattern; investigate and fix/label the «؟» glyph in the stats tile; compress the favorites empty state height.
- **Files:** `frontend/src/features/profile/ProfileArchivePage.tsx`, `frontend/src/components/ui/BidiText` usage/CSS, `globals.css`.
- **Acceptance:** name/bio/eyebrow/button share the right anchor; "Blu Pizzaria"-style LTR names right-positioned (internally LTR) in archive rows; no unexplained glyphs in stat tiles; empty favorites ≤ ~260px; all existing profile E2E green.
- **Screenshots:** profile with LTR-only name, Arabic name, mixed names; empty + populated favorites.
- **Tests:** update profile specs with alignment-sensitive assertions (bounding-box x-anchor checks for LTR names); full suite.

**PR-PWA-05 — Final standalone iPhone visual QA** *(risk: low · **Full Release**)*
- **Goal:** verify PR-PWA-01→04 on device; sweep remaining standalone-only states.
- **Scope:** device matrix (SE/390/430, standalone), capture: launch, loading, scroll-end, all profile states, place detail + rating sheet **in standalone** (closing the CANNOT-VERIFY gaps from §6).
- **Acceptance:** screenshot inventory attached; zero P0/P1 regressions; a fresh addendum row for any newly exposed standalone-only issue.
- **Tests:** full `test:e2e` + accessibility harness; no code changes expected.

---

**Recommended first PWA implementation PR: PR-PWA-01 — Hide skip link (focus-only)** — it is the smallest possible diff (CSS + one markup touch), it removes the single most damaging first impression in the product (corrupted-looking text over the system status bar on *every* launch), and it unblocks clean screenshots for judging everything else.
