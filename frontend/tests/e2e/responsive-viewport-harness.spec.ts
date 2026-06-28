import { expect, test } from "@playwright/test";

import { createPlacesResponsiveStates } from "./support/places-responsive-states";
import {
  RESPONSIVE_VIEWPORTS,
  ResponsiveViewportHarness,
  type ResponsiveState
} from "./support/responsive-viewport-harness";
import type { PlaceSubtype, PlaceType, PlacesDataset } from "./support/places-acceptance-harness";

test.describe("deterministic responsive viewport matrix harness", () => {
  test("executes reusable responsive assertions across the supported viewport matrix", async ({ page }) => {
    const responsive = new ResponsiveViewportHarness(page);
    const states: ResponsiveState[] = [
      {
        name: "synthetic-rtl-layout",
        load: async () => {
          await page.setContent(`
            <!doctype html>
            <html dir="rtl" lang="ar">
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
                <style>
                  * { box-sizing: border-box; }
                  html, body { margin: 0; min-height: 100%; overflow-x: hidden; }
                  body {
                    background: #071016;
                    color: #f8fafc;
                    font-family: Arial, sans-serif;
                  }
                  main {
                    margin: 0 auto;
                    max-width: 720px;
                    min-height: 120vh;
                    padding-block: 24px 160px;
                    padding-inline: 16px;
                  }
                  h1 { margin: 0 0 16px; font-size: clamp(24px, 8vw, 40px); line-height: 1.1; }
                  .ds-place-card,
                  .place-detail-panel,
                  .ds-list-card {
                    border: 1px solid rgba(148, 163, 184, 0.28);
                    border-radius: 16px;
                    margin-block: 12px;
                    max-width: 100%;
                    overflow-wrap: anywhere;
                    padding: 16px;
                  }
                  .ds-bidi,
                  .muted {
                    color: #cbd5e1;
                    overflow-wrap: anywhere;
                  }
                  button,
                  a {
                    min-height: 44px;
                    touch-action: manipulation;
                  }
                  main button {
                    border: 0;
                    border-radius: 12px;
                    display: inline-flex;
                    margin-block-start: 8px;
                    max-width: 100%;
                    padding-inline: 16px;
                  }
                  .app-nav {
                    align-items: stretch;
                    background: #111827;
                    border: 1px solid rgba(148, 163, 184, 0.24);
                    border-radius: 20px;
                    bottom: 12px;
                    box-shadow: 0 14px 38px rgba(0, 0, 0, 0.32);
                    display: flex;
                    gap: 6px;
                    inset-inline: 12px;
                    padding: 8px;
                    position: fixed;
                  }
                  .app-nav a {
                    align-items: center;
                    color: #cbd5e1;
                    display: flex;
                    flex: 1 1 0;
                    justify-content: center;
                    min-height: 48px;
                    min-width: 0;
                    overflow-wrap: anywhere;
                    text-decoration: none;
                  }
                </style>
              </head>
              <body>
                <main>
                  <h1>قائمة الأماكن</h1>
                  <section class="ds-place-card">
                    <strong class="ds-bidi">مطعم اختبار طويل جدا Long English Place Name With Arabic</strong>
                    <p class="muted">نص عربي طويل مع English mixed content يبقى داخل البطاقة بدون تمدد أفقي.</p>
                    <button type="button">إجراء أساسي</button>
                  </section>
                  <section class="place-detail-panel">
                    <p class="ds-bidi">تفاصيل قابلة للقراءة على أصغر عرض وضمن 200% viewport pressure.</p>
                  </section>
                  <section class="ds-list-card">
                    <p class="muted">بطاقة قائمة إضافية للتحقق من آخر المحتوى قبل شريط التنقل السفلي.</p>
                  </section>
                </main>
                <nav class="app-nav" aria-label="التنقل السفلي">
                  <a href="#profile">ملفي</a>
                  <a href="#places">الأماكن</a>
                  <a href="#lists">قوائمي</a>
                </nav>
              </body>
            </html>
          `);
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      }
    ];

    await responsive.runMatrix(states, RESPONSIVE_VIEWPORTS);
  });

  test("provides deterministic Places responsive state loaders", async ({ page }) => {
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
      runId: "PLACE-RESPONSIVE",
      places: {
        restaurantBurger: { id: "place-burger" },
        restaurantItalian: { id: "place-italian" },
        restaurantUnrated: { id: "place-unrated" }
      }
    } as PlacesDataset;

    const states = createPlacesResponsiveStates(page, placesHarness, dataset);

    expect(states.map((state) => state.name)).toEqual([
      "places-list",
      "place-detail",
      "create-place",
      "filter-state",
      "rating-state",
      "add-to-list-state",
      "lists-screen"
    ]);

    await states[0].load();
    await states[1].load();
    await states[2].load();
    await states[3].load();
    await states[4].load();
    await states[5].load();

    expect(calls).toEqual([
      "places-list:restaurant:PLACE-RESPONSIVE",
      "place-detail:place-burger",
      "create-place:restaurant:PLACE-RESPONSIVE Long English Arabic Draft",
      "filter-state:cafe:coffee:PLACE-RESPONSIVE",
      "rating-state:place-italian",
      "add-to-list-state:place-unrated"
    ]);
  });
});
