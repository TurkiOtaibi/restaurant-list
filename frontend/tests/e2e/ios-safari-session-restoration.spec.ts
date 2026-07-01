import { expect, test } from "@playwright/test";

const sessionMarkerKey = "restaurantWishlist.hasSession";
const loginRequiredText = "سجل الدخول لعرض الأماكن";

test.describe("iOS Safari session restoration", () => {
  test("restores a missing in-memory access token before rendering protected places", async ({
    page
  }) => {
    let refreshCalls = 0;

    await installSessionMarker(page);
    await page.route("**/api/v1/auth/refresh", async (route) => {
      refreshCalls += 1;
      await route.fulfill({
        contentType: "application/json",
        json: { accessToken: "restored-access-token" },
        status: 200
      });
    });
    await page.route("**/api/v1/places?**", async (route) => {
      expect(route.request().headers().authorization).toBe("Bearer restored-access-token");
      await route.fulfill({
        contentType: "application/json",
        json: placesCollection("مطعم جلسة سفاري"),
        status: 200
      });
    });

    await page.goto("/places?type=restaurant");

    await expect(page.getByText(loginRequiredText)).toHaveCount(0);
    await expect(page.getByText("مطعم جلسة سفاري")).toBeVisible();
    expect(refreshCalls).toBe(1);
  });

  test("coalesces load, pageshow, focus, and visibility refresh triggers", async ({ page }) => {
    let refreshCalls = 0;
    let resolveRefresh!: () => void;
    const refreshStarted = new Promise<void>((resolve) => {
      resolveRefresh = resolve;
    });

    await installSessionMarker(page);
    await page.route("**/api/v1/auth/refresh", async (route) => {
      refreshCalls += 1;
      await refreshStarted;
      await route.fulfill({
        contentType: "application/json",
        json: { accessToken: "coalesced-access-token" },
        status: 200
      });
    });
    await page.route("**/api/v1/places?**", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: placesCollection("مطعم استعادة موحدة"),
        status: 200
      });
    });

    await page.goto("/places?type=restaurant");
    await expect.poll(() => refreshCalls).toBe(1);

    await page.evaluate(() => {
      window.dispatchEvent(new Event("pageshow"));
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect.poll(() => refreshCalls).toBe(1);
    await expect(page.getByText(loginRequiredText)).toHaveCount(0);

    resolveRefresh();
    await expect(page.getByText("مطعم استعادة موحدة")).toBeVisible();
    expect(refreshCalls).toBe(1);
  });

  test("refreshes once and retries the original protected request after 401", async ({
    page
  }) => {
    let refreshCalls = 0;
    let placesCalls = 0;

    await installSessionMarker(page);
    await page.route("**/api/v1/auth/refresh", async (route) => {
      refreshCalls += 1;
      await route.fulfill({
        contentType: "application/json",
        json: {
          accessToken: refreshCalls === 1 ? "initial-restored-token" : "retry-restored-token"
        },
        status: 200
      });
    });
    await page.route("**/api/v1/places?**", async (route) => {
      placesCalls += 1;
      if (placesCalls === 1) {
        expect(route.request().headers().authorization).toBe("Bearer initial-restored-token");
        await route.fulfill({
          contentType: "application/json",
          json: {
            error: {
              code: "INVALID_TOKEN",
              message: "Access token expired.",
              requestId: "test-request"
            }
          },
          status: 401
        });
        return;
      }

      expect(route.request().headers().authorization).toBe("Bearer retry-restored-token");
      await route.fulfill({
        contentType: "application/json",
        json: placesCollection("مطعم إعادة المحاولة"),
        status: 200
      });
    });

    await page.goto("/places?type=restaurant");

    await expect(page.getByText(loginRequiredText)).toHaveCount(0);
    await expect(page.getByText("مطعم إعادة المحاولة")).toBeVisible();
    expect(refreshCalls).toBe(2);
    expect(placesCalls).toBe(2);
  });

  test("clears the marker and shows login-required only after invalid refresh", async ({ page }) => {
    await installSessionMarker(page);
    await page.route("**/api/v1/auth/refresh", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          error: {
            code: "INVALID_REFRESH_TOKEN",
            message: "Refresh token is invalid or revoked.",
            requestId: "test-request"
          }
        },
        status: 401
      });
    });
    await page.route("**/api/v1/places?**", async (route) => {
      await route.fulfill({ status: 500, body: "places should not load" });
    });

    await page.goto("/places?type=restaurant");

    await expect(page.getByText(loginRequiredText)).toBeVisible();
    await expect
      .poll(() => page.evaluate((key) => window.localStorage.getItem(key), sessionMarkerKey))
      .toBeNull();
  });

  test("keeps the marker and avoids login-required on recoverable refresh failure", async ({
    page
  }) => {
    await installSessionMarker(page);
    await page.route("**/api/v1/auth/refresh", async (route) => {
      await route.abort("failed");
    });

    await page.goto("/places?type=restaurant");

    await expect(page.getByText(loginRequiredText)).toHaveCount(0);
    await expect(page.getByText("تعذر استعادة الجلسة. حاول مرة أخرى.")).toBeVisible();
    await expect
      .poll(() => page.evaluate((key) => window.localStorage.getItem(key), sessionMarkerKey))
      .toBe("1");
  });
});

async function installSessionMarker(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "1");
  }, sessionMarkerKey);
}

function placesCollection(name: string) {
  return {
    data: [
      {
        averageRating: null,
        createdAt: "2026-06-30T00:00:00Z",
        createdByUserId: "qa-user",
        currentUserListCount: 0,
        currentUserListIds: [],
        currentUserListNames: [],
        currentUserRating: null,
        description: null,
        id: "qa-place",
        name,
        ratingCount: 0,
        subtype: "burger",
        type: "restaurant",
        updatedAt: "2026-06-30T00:00:00Z"
      }
    ],
    meta: {
      limit: 20,
      offset: 0,
      sort: "rating_desc",
      total: 1
    }
  };
}
