# PLACES_PWA_UI_UX_REVALIDATION.md — Phase 0

> Mandated first step of the Places + Standalone PWA UI/UX Excellence Program: revalidate every audit finding against **current** `origin/main` **before** touching application code.
> Baseline verified: `origin/main` = `543ef39267f61fca594048c46be5b466d463ce77` (matches the program's authoritative SHA). Inspection performed in a clean worktree at that commit.
> Inputs (treated as **stale until proven current**): `PLACES_UI_UX_BRUTAL_AUDIT.md`, `STANDALONE_PWA_AUDIT_ADDENDUM.md`.
> Method: for each finding, read the actual current component/CSS/markup on `543ef39` and classify by evidence, not by the screenshots.

---

## 0. Headline — read this first

**The screenshots that generated both audits are stale.** They were captured before a large body of work that is already on `main` (the program's own "ALREADY RELEASED — DO NOT REIMPLEMENT" list: Mobile/PWA foundation, bottom-nav safe-area work, Place Detail CTA/hierarchy fixes, Base UI adoption, Improve Plans 001–006). Consequently:

- **Both P0s are ALREADY FIXED in code** — the skip link (Wave 1) and the bottom-nav content clearance (Wave 2). The program's two highest-severity items are no-ops.
- The program contracts from **12 waves to ~3 genuinely actionable items**, one of which is blocked on a product decision.

**Blocker for the program as written:** the program's Step 3 requires `PLACES_UI_UX_BRUTAL_AUDIT.md` and `STANDALONE_PWA_AUDIT_ADDENDUM.md` to exist on `origin/main`. **They do not** — they live only in the local working tree (held uncommitted under the review-only rule). They must be committed to `main` (or carried into the program branch) before any executor can satisfy Step 3.

---

## 1. Finding-by-Finding Revalidation

Legend: **STILL VALID** · **PARTIALLY FIXED** · **ALREADY FIXED** · **STALE** · **NEEDS PRODUCT DECISION** · **CANNOT VERIFY** (needs fresh device/deploy evidence).

### Wave 1 — Skip link (audit PWA-01, PWA-03) — **ALREADY FIXED** ✅
- **Original severity:** P0. **Screen:** all (standalone).
- **Latest evidence:** `frontend/app/globals.css` L124–143. `.skip-link` is `position: fixed` and pushed **off-screen by default** via `transform: translateY(calc(-100% - var(--space-6)))`; it reappears **only** on `.skip-link:focus-visible { transform: translateY(0) }`. Top offset already uses `calc(env(safe-area-inset-top) + var(--space-3))`. Markup `frontend/app/layout.tsx` L77 is a single first-in-DOM `<a class="skip-link" href="#main-content">`.
- **Remaining issue:** none. The always-visible overlap in the screenshot cannot reproduce against this CSS.
- **Recommended wave:** none — **do not implement** (program rule: never implement ALREADY FIXED).
- Fast Lane N/A · visual approval N/A · product decision no.

### Wave 2 — Bottom content clearance (audit PL-02 / PWA-04) — **ALREADY FIXED (shell) / PARTIALLY (verify virtualized archive)**
- **Original severity:** P0. **Screens:** /places, /profile, lists.
- **Latest evidence:** `globals.css` L38–46 defines a **single source of truth** exactly as Wave 2 demands: `--safe-bottom: env(safe-area-inset-bottom)`, `--bottom-nav-height`, `--bottom-nav-offset: max(gap, safe-bottom)` (no double-count), `--bottom-nav-clearance`, `--mobile-shell-bottom-clearance`. `.content` (L168) applies it as bottom padding; roomy variant used at L792/L1510/L3593.
- **Remaining issue:** the **virtualized ratings archive** on the profile scrolls inside its own container — confirm that container (not just `.content`) carries the clearance, or the last archive row can still tuck under the nav. This is the one residual to verify against a **fresh** standalone screenshot/deploy.
- **Recommended wave:** keep a **reduced Wave 2** only to confirm/patch the virtualized archive container; the app-shell part is done.
- Full Verification (if any change) · visual approval yes (fresh screenshot) · product decision no.

### Wave 3 — Loading / skeleton anatomy (audit PWA-02) — **STILL VALID** ✅
- **Original severity:** P1. **Screen:** /places (and any `LoadingState` card use).
- **Latest evidence:** `frontend/src/components/ui/LoadingState.tsx` renders `count` bare `<div class="ds-skeleton">` blocks with no internal anatomy (no icon tile, no title/meta lines, no rating slot). `ds-skeleton` CSS (L2139+) is a single pulsing block. This matches the audit's "blank broken blocks."
- **Remaining issue:** skeleton does not resemble the real `PlaceCard` (`__main` [title/meta/signals] + `PlaceImage`). **Caution:** `LoadingState` is a **shared primitive** with 8+ callers (profile text variant, lists, dialogs) — per `FAST_LANE_UI_PATCH_POLICY.md`, a change here is **not** pure Fast Lane and requires full E2E. Correct scope: add a **new opt-in `variant="place-card"`** (or a dedicated `PlaceCardSkeleton`) used only by the places list, leaving existing callers byte-identical.
- **Likely files:** `LoadingState.tsx` (or new `PlaceCardSkeleton.tsx`), `globals.css`, `PlaceLibraryPage.tsx`.
- **Recommended wave:** Wave 3 — **first real implementation** (decision-free).
- Full Release (shared primitive) · visual approval yes · product decision no.

### Wave 4 — Place card RTL anatomy (audit PL-01/PL-05) — **PARTIALLY FIXED**
- **Original severity:** P1. **Screen:** /places list.
- **Latest evidence:** `PlaceCard.tsx` is now a structured component: `ds-place-card__main` groups `__title` (BidiText) + `__meta` + `__signals` (rating), with `PlaceImage` as a sibling; the list renders `view="row"`. This is **not** the three-axis scatter in the stale screenshot — title/meta/rating are one group. The `BidiText` wrapper already isolates Latin names inside the line.
- **Remaining issue:** cannot confirm final right-anchoring / rating-slot side / truncation purely from markup — needs the `.ds-place-card--row` CSS review + a fresh screenshot. Likely a small polish, not a rebuild.
- **Recommended wave:** fold into a **reduced Wave 4** gated on fresh screenshot; may downgrade to ALREADY FIXED after visual confirm.
- Fast Lane · visual approval yes · product decision no.

### Wave 5 — Search / filter UX — **CANNOT VERIFY (partial)**
- **Original severity:** P1/P2 (SR-01/02/03, PL-04).
- **Latest evidence:** not fully inspected in Phase 0; `SearchField` + `PlaceLibraryPage` exist. The audit's SR-01 (search-scope honesty) was explicitly a "cannot verify" in the audit and remains so without behavior tests.
- **Recommended wave:** keep Wave 5, but **characterize current search behavior with tests first** (program already mandates this). Presentation-only parts (filter chip affordance PL-04) likely STILL VALID; semantics untouched.
- Fast Lane (presentation) · visual approval yes · product decision only if semantics change.

### Wave 6 — Add-place bottom sheet — **PARTIALLY FIXED / CANNOT VERIFY**
- The sheet was already the most disciplined screen in the audit (AD-03 was minor). Residuals (AD-01 select affordance, AD-02 validation) need a current read. Low priority.
- Fast Lane · visual approval yes · product decision no.

### Wave 7 — Rating input (audit RT-01/02/03/04) — **STILL VALID → NEEDS PRODUCT DECISION** ⛔
- **Original severity:** P1 (core flow). **Screen:** rating sheet.
- **Latest evidence:** `RatingControl.tsx` L52 still renders `{value ? formatOutOfTen(value) : "-/10"}` — **the "-/10" empty state persists** (RT-02 valid). Both a `type="range"` slider (L72) **and** a `ds-rating-control__star-row` (L83–94) are present — **competing mechanisms persist** (RT-03 valid). `aria-valuetext="Rating, X.X out of 10"` (L64) is intact — **EDR-002 must be preserved** by any change.
- **Remaining issue:** exactly the audit's RT-02/RT-03. But the program **correctly gates this on a recorded product decision** (single input model — Option A/B/C). No such decision exists yet (the earlier "الاعجابات تحذف" decided *likes*, not the rating model).
- **Recommended wave:** Wave 7 — **mark NEEDS DECISION**, do not implement; continue other waves.
- Full Release · visual approval yes · **product decision REQUIRED**.

### Wave 8 — Profile identity RTL/bidi (audit PWA-05) — **PARTIALLY FIXED**
- **Latest evidence:** `ProfileArchivePage.tsx` L332–357 groups eyebrow + `h2` name + `__bio` + `__actions` inside a single `profile-identity-card__copy` block (no longer four independent anchors in markup). `BidiText` isolates the name.
- **Remaining issue:** confirm the `.profile-identity-card__copy` CSS anchors all children to the inline-start (right) and that a pure-Latin name ("Turki") no longer left-detaches — needs CSS read + fresh screenshot. Also Wave 8 goal 7 (drop the redundant «الملف الشخصي» eyebrow) is a product/taste call.
- Fast Lane · visual approval yes · product decision (eyebrow removal) minor.

### Wave 9 — Profile stats / favorites / preview (audit PWA-07/08) — **PARTIALLY FIXED**
- **Latest evidence:** the «؟» is **not** a leaked glyph — `ProfileArchivePage.tsx` L813 is an intentional `<span aria-hidden="true">؟</span>` (a decorative placeholder inside a stat, e.g. an unknown/empty value). PWA-07 downgrades from "stray bug" to "clarify or remove an intentional element." Favorites empty-state height (PWA-08) still worth compressing — needs current CSS read.
- Fast Lane · visual approval yes · product decision no.

### Wave 10 — Place detail final polish — **MOSTLY ALREADY FIXED**
- The program's own released list already covers info-card removal, CTA hierarchy, CTA centering, rating-CTA placement, RTL menu clipping, owner/non-owner menu. The audit's PD-01…PD-05 were largely captured by that released work. Residual hero-height/title-wrap is a small polish at most; **CANNOT VERIFY** without a fresh detail screenshot on current main.
- Fast Lane · visual approval yes.

### Wave 11 — Accessibility/RTL sweep — **DEFERRED until 3/4/8/9 land**
- Meaningful only after the actual changes exist; nothing to sweep yet.

### Wave 12 — Physical Safari/PWA QA — **CANNOT VERIFY (needs your device)**
- Requires physical iPhone evidence at 320/390/430. Program verdict cannot be READY without it. Simulated (Playwright) screenshots are acceptable interim evidence for earlier waves but not for the final verdict.

---

## 2. Net Program Reduction

| Wave | Classification | Action |
|---|---|---|
| 1 Skip link (P0) | **ALREADY FIXED** | none |
| 2 Bottom clearance (P0) | **ALREADY FIXED** (shell) | verify virtualized archive only |
| 3 Skeleton (P1) | **STILL VALID** | **implement first** (Full Release, opt-in variant) |
| 4 Card RTL (P1) | **PARTIALLY FIXED** | confirm via screenshot; small polish |
| 5 Search | CANNOT VERIFY | characterize-first |
| 6 Add sheet | PARTIALLY/CANNOT VERIFY | low priority |
| 7 Rating (P1) | **STILL VALID → NEEDS DECISION** | **blocked on product decision** |
| 8 Identity bidi | PARTIALLY FIXED | confirm CSS + screenshot |
| 9 Stats/favorites | PARTIALLY FIXED | compress favorites empty; clarify «؟» |
| 10 Place detail | MOSTLY ALREADY FIXED | verify only |
| 11 A11y sweep | DEFERRED | after 3/4/8/9 |
| 12 Physical QA | CANNOT VERIFY | needs your device |

**Do NOT implement:** Waves 1, 2 (shell), 10 (verify-only). **Implement:** Wave 3 now; 4/8/9 as screenshot-confirmed polish. **Blocked:** Wave 7 (decision). **You-gated:** Wave 12 (device).

## 3. Single genuine product decision needed

**Rating input model (Wave 7).** Pick one and I implement it (preserving EDR-002 `aria-valuetext`):
- **A** — one stepped slider + large numeric value + −/+ controls, **no star row** (recommended; matches the /10 scale and one-handed use).
- **B** — direct 1–10 tappable scale, no slider, no stars.
- **C** — segmented step input.
All three remove "-/10" and collapse to a single mechanism. Everything else in the program can proceed without this.
