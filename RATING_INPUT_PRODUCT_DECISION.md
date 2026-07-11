# RATING_INPUT_PRODUCT_DECISION.md

Date: 2026-07-10 · Status: **Approved (Option A)** · Program: Places + PWA UI/UX Excellence — Wave 7.

## Decision

The place rating input is a **single stepped slider** with a **large numeric value** and **precise −/+ controls**. The ten-star row and the `-/10` placeholder are removed. No competing rating mechanisms.

## Approved UX contract (implemented)

- **Primary input:** one `type="range"` slider, min **1**, max **10**, step **0.5** (half-steps are already supported by the rating contract; unchanged).
- **Numeric display:** large current value `X.X/10` (e.g. `8.5/10`). Never `-/10`.
- **Unset state:** deliberate label **«لم تحدد تقييمًا»** in a muted (non-error) style — not a broken value.
- **Precision controls:** circular **−** and **+** buttons, 44×44px, synchronized with the slider. **−** disabled at unset and at the minimum; **+** disabled at the maximum. From the unset state, **+** establishes the minimum (1).
- **Removed:** the entire ten-star selection row, the star-referencing instruction, and every duplicate/competing selector.
- **Copy (no stars):** «اسحب المؤشر أو استخدم زري الزيادة والنقصان لتحديد تقييمك.»
- **Visual:** large numeric value is the main feedback; slider is primary input; −/+ are secondary. Dark premium identity and RTL preserved. Sheet remains usable with the software keyboard.
- **Notes:** remain optional and private; unchanged. Rating still does **not** affect list or wishlist membership (RatePlaceDialog save flow untouched).

## EDR-002 conflict — resolution (needs your sign-off)

The Wave 7 brief asked for an **Arabic `aria-valuetext`**, but **EDR-002 mandates the English `aria-valuetext = "Rating, X.X out of 10"`** and a CI test (`ui-polish-pr-findings.spec.ts`) asserts it. These conflict.

**Resolved in favor of EDR-002** (the brief also says "preserve EDR-002"):
- **Set value →** English EDR-002 format `Rating, X.X out of 10` (unchanged; keeps the ratified contract + test green).
- **Unset state →** Arabic `aria-valuetext = "لم تحدد تقييمًا"` (a state EDR-002 does not cover — a genuine SR improvement: screen-reader users now know no rating is selected).
- Added `aria-valuenow`; native range exposes min/max. SR users can determine minimum, maximum, current value, and the unset state.

> **Please confirm** this resolution. If you instead want the value announcement itself in Arabic, that is an **EDR-002 amendment** and must update the EDR + its test — a separate change, not silently in this PR.

## Accessibility

- Slider Arabic accessible name «تقييمك»; visible focus ring retained; keyboard Arrow keys adjust the value; no keyboard trap.
- −/+ buttons have Arabic accessible names («زد التقييم» / «أنقص التقييم»), 44×44px, disabled states conveyed.

## Verification

- lint / typecheck / build ✅.
- Screenshots captured: unset, 8.5/10, min(1), max(10); widths 320/390/430 — **no horizontal overflow** at any state/width.
- CI (backend E2E harness) runs the extended `ui-polish-pr-findings` test: preserves EDR-002 value/scale/valuetext, and now asserts the star row is gone, the −/+ controls exist, and `-/10` is absent.
- Full backend-dependent E2E is authoritative on CI (not runnable in the review sandbox).
