import { expect, test } from "@playwright/test";

import { FeatureAccessibilityHarness } from "./support/accessibility-harness";
import { createPlacesAccessibilityStates } from "./support/places-accessibility-states";
import type { PlaceSubtype, PlaceType, PlacesDataset } from "./support/places-acceptance-harness";

test.describe("feature-state accessibility automation harness", () => {
  test("executes deterministic accessibility checks for a feature state", async ({ page }) => {
    await page.setContent(`
      <!doctype html>
      <html dir="rtl" lang="ar">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Accessibility Harness Fixture</title>
          <style>
            body {
              background: #ffffff;
              color: #111827;
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 24px;
            }
            a,
            button,
            input {
              font-size: 16px;
              min-height: 44px;
            }
            a:focus-visible,
            button:focus-visible,
            input:focus-visible {
              outline: 3px solid #047857;
              outline-offset: 3px;
            }
            header,
            main,
            nav {
              margin-block-end: 16px;
            }
            [role="dialog"] {
              background: #ffffff;
              border: 2px solid #111827;
              border-radius: 12px;
              inset: 20% auto auto 50%;
              padding: 16px;
              position: fixed;
              transform: translateX(-50%);
              width: min(320px, calc(100vw - 32px));
            }
            [hidden] {
              display: none;
            }
          </style>
        </head>
        <body>
          <header>
            <h1>قائمة الأماكن</h1>
            <nav aria-label="التنقل الرئيسي">
              <a href="#places" aria-current="page">الأماكن</a>
              <a href="#lists">القوائم</a>
            </nav>
          </header>
          <main id="places">
            <h2>إضافة مكان</h2>
            <form aria-label="نموذج إضافة مكان">
              <label for="place-name">اسم المكان</label>
              <input id="place-name" name="name" aria-describedby="place-name-error">
              <p id="place-name-error">اسم المكان مطلوب.</p>
              <button type="button" id="open-dialog">فتح خيارات المكان</button>
              <button type="button" id="announce">حفظ المسودة</button>
            </form>
            <section role="tablist" aria-label="خيارات التصنيف">
              <button type="button" role="tab" aria-selected="true">مطعم</button>
              <button type="button" role="tab" aria-selected="false">مقهى</button>
            </section>
            <p role="status" aria-live="polite" id="status-region">جاهز.</p>
          </main>
          <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" hidden>
            <h2 id="dialog-title">خيارات المكان</h2>
            <button type="button" id="dialog-primary">تأكيد</button>
            <button type="button" id="dialog-close">إغلاق</button>
          </div>
          <script>
            const opener = document.getElementById("open-dialog");
            const dialog = document.querySelector('[role="dialog"]');
            const closeButton = document.getElementById("dialog-close");
            const primaryButton = document.getElementById("dialog-primary");
            const announce = document.getElementById("announce");
            const statusRegion = document.getElementById("status-region");

            opener.addEventListener("click", () => {
              dialog.hidden = false;
              primaryButton.focus();
            });
            closeButton.addEventListener("click", () => {
              dialog.hidden = true;
              opener.focus();
            });
            dialog.addEventListener("keydown", (event) => {
              if (event.key !== "Tab") {
                return;
              }
              const controls = [primaryButton, closeButton];
              const index = controls.indexOf(document.activeElement);
              event.preventDefault();
              if (event.shiftKey) {
                controls[(index + controls.length - 1) % controls.length].focus();
              } else {
                controls[(index + 1) % controls.length].focus();
              }
            });
            announce.addEventListener("click", () => {
              statusRegion.textContent = "تم حفظ المسودة.";
            });
          </script>
        </body>
      </html>
    `);

    const harness = new FeatureAccessibilityHarness(page);

    await harness.assertLandmarksAndHeadings("synthetic feature state");
    await harness.assertRoles(
      [
        { locator: page.getByRole("navigation", { name: "التنقل الرئيسي" }), name: "التنقل الرئيسي", role: "navigation" },
        { locator: page.getByRole("heading", { name: "قائمة الأماكن" }), name: "قائمة الأماكن", role: "heading" },
        { locator: page.getByRole("button", { name: "فتح خيارات المكان" }), name: "فتح خيارات المكان", role: "button" }
      ],
      "synthetic feature state"
    );
    await harness.assertAccessibleNames(
      [{ locator: page.locator("#place-name"), name: "اسم المكان" }],
      "synthetic feature state"
    );
    await harness.assertKeyboardTraversal(
      [
        { name: "الأماكن", role: "link" },
        { name: "القوائم", role: "link" },
        { name: "اسم المكان", role: "textbox" },
        { name: "فتح خيارات المكان", role: "button" }
      ],
      "synthetic feature state"
    );
    await harness.assertFormLabelsAndErrors("synthetic feature state");
    await harness.assertAriaCurrentOrSelectedState("synthetic feature state");
    await harness.assertLiveRegion(
      {
        expectedText: "تم حفظ المسودة.",
        trigger: () => page.getByRole("button", { name: "حفظ المسودة" }).click()
      },
      "synthetic feature state"
    );

    const opener = page.getByRole("button", { name: "فتح خيارات المكان" });
    await opener.click();
    await harness.assertDialogFocusTrap(
      {
        close: () => page.getByRole("button", { name: "إغلاق" }).click(),
        dialog: page.getByRole("dialog", { name: "خيارات المكان" }),
        opener
      },
      "synthetic dialog state"
    );

    const snapshot = await harness.accessibilityTreeSnapshot(page.locator("main"));
    expect(snapshot).toContain("إضافة مكان");
    await harness.assertAxeSmoke("synthetic feature state");
  });

  test("provides deterministic Places accessibility state loaders", async ({ page }) => {
    const calls: string[] = [];
    const placesHarness = {
      loadAddToListState: async (placeId: string) => {
        calls.push(`add-to-list-state:${placeId}`);
      },
      loadCreatePlace: async (options: { name?: string; type?: PlaceType } = {}) => {
        calls.push(`create-place:${options.type}:${options.name}`);
      },
      loadFilterState: async (options: {
        query?: string;
        subtype: PlaceSubtype;
        type: Exclude<PlaceType, "ice_cream">;
      }) => {
        calls.push(`filter-state:${options.type}:${options.subtype}:${options.query}`);
      },
      loadPlaceDetail: async (placeId: string) => {
        calls.push(`place-detail:${placeId}`);
      },
      loadPlacesList: async (options: { query?: string; subtype?: PlaceSubtype; type?: PlaceType } = {}) => {
        calls.push(`places-list:${options.type}:${options.query}`);
      },
      loadRatingState: async (placeId: string) => {
        calls.push(`rating-state:${placeId}`);
      }
    };
    const dataset = {
      runId: "PLACE-A11Y",
      places: {
        restaurantBurger: { id: "place-burger" },
        restaurantItalian: { id: "place-italian" },
        restaurantUnrated: { id: "place-unrated" }
      }
    } as PlacesDataset;

    const states = createPlacesAccessibilityStates(page, placesHarness, dataset);

    expect(states.map((state) => state.name)).toEqual([
      "places-list",
      "place-detail",
      "create-place",
      "filter-state",
      "rating-state",
      "add-to-list-state"
    ]);

    for (const state of states) {
      await state.load();
    }

    expect(calls).toEqual([
      "places-list:restaurant:PLACE-A11Y",
      "place-detail:place-burger",
      "create-place:restaurant:PLACE-A11Y Long English Arabic Draft",
      "filter-state:cafe:coffee:PLACE-A11Y",
      "rating-state:place-italian",
      "add-to-list-state:place-unrated"
    ]);
  });
});
