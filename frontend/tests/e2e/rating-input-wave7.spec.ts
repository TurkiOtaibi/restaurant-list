import { expect, test, type Page, type Route } from "@playwright/test";

const now = new Date().toISOString();

function placePayload(rating: number | null) {
  return {
    averageRating: rating,
    createdAt: now,
    createdByUserId: "u",
    currentUserListCount: 0,
    currentUserListIds: [],
    currentUserListNames: [],
    currentUserRating: rating,
    description: null,
    id: "p1",
    imageUrl: null,
    name: "مطعم الاختبار",
    ratingCount: rating ? 1 : 0,
    subtype: "burger",
    type: "restaurant",
    updatedAt: now
  };
}

async function mockRateRoute(
  page: Page,
  rating: number | null,
  onRatingsWrite: (route: Route) => void
) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/api/v1", "");
    if (path === "/auth/refresh") {
      return route.fulfill({
        body: JSON.stringify({ accessToken: "mock" }),
        contentType: "application/json",
        status: 200
      });
    }
    if (path.startsWith("/ratings")) {
      onRatingsWrite(route);
      return route.fulfill({
        body: JSON.stringify({ id: "r1", notes: null, rating: 1 }),
        contentType: "application/json",
        status: 200
      });
    }
    if (path.startsWith("/places/")) {
      return route.fulfill({
        body: JSON.stringify(placePayload(rating)),
        contentType: "application/json",
        status: 200
      });
    }
    return route.fulfill({
      body: JSON.stringify({ detail: { code: "MOCK_NOT_FOUND", message: path } }),
      contentType: "application/json",
      status: 404
    });
  });
}

test("unset rating blocks save and never submits the native range value", async ({ page }) => {
  let ratingsCalls = 0;
  await mockRateRoute(page, null, () => {
    ratingsCalls += 1;
  });

  await page.goto("/places/p1/rate");
  const dialog = page.locator(".rate-place-dialog");
  await expect(dialog).toBeVisible();

  // Unset visual + accessibility state (checks #1 visual, #6).
  await expect(dialog.locator(".ds-rating-control__value")).toHaveText("لم تحدد تقييمًا");
  await expect(dialog).not.toContainText("-/10");
  await expect(dialog.locator(".ds-rating-control__star-row")).toHaveCount(0);
  await expect(dialog.locator("input[type='range']")).toHaveAttribute(
    "aria-valuetext",
    "لم تحدد تقييمًا"
  );

  // Saving while unset is rejected and issues no rating write (checks #1, #2).
  await page.getByRole("button", { name: "حفظ التقييم" }).click();
  await expect(page.getByText("اختر تقييمًا من 1 إلى 10.")).toBeVisible();
  expect(ratingsCalls).toBe(0);
});

test("plus control switches unset to selected and enables saving", async ({ page }) => {
  const captured: { body: { rating?: number } | null } = { body: null };
  await mockRateRoute(page, null, (route) => {
    captured.body = route.request().postDataJSON() as { rating?: number };
  });

  await page.goto("/places/p1/rate");
  const dialog = page.locator(".rate-place-dialog");
  await expect(dialog).toBeVisible();

  // First + interaction establishes an intentional selection of the minimum (check #3).
  await dialog.locator("button[aria-label='زد التقييم']").click();
  await expect(dialog.locator(".ds-rating-control__value")).toHaveText("1/10");
  await expect(dialog.locator("input[type='range']")).toHaveAttribute(
    "aria-valuetext",
    "Rating, 1.0 out of 10"
  );

  await page.getByRole("button", { name: "حفظ التقييم" }).click();
  await expect(page.getByText("تم حفظ التقييم.")).toBeVisible();
  expect(captured.body).not.toBeNull();
  expect(captured.body?.rating).toBe(1);
});

test("existing rating loads as selected with the EDR-002 value", async ({ page }) => {
  await mockRateRoute(page, 8.5, () => {
    /* no write expected */
  });

  await page.goto("/places/p1/rate");
  const dialog = page.locator(".rate-place-dialog");
  await expect(dialog).toBeVisible();

  // Existing rating loads as selected (check #4) with EDR-002 announcement preserved.
  await expect(dialog.locator(".ds-rating-control__value")).toHaveText("8.5/10");
  await expect(dialog.locator("input[type='range']")).toHaveAttribute(
    "aria-valuetext",
    "Rating, 8.5 out of 10"
  );
  await expect(dialog.locator(".ds-rating-control__star-row")).toHaveCount(0);
});
