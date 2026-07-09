import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const now = new Date().toISOString();
const placeId = "detail-clean";
const screenshotsDir = join(
  process.cwd(),
  "..",
  "docs",
  "qa-execution",
  "place-detail-simplification",
  "screenshots"
);

test("public place detail keeps hero and rating summary without the information card", async ({
  page
}) => {
  await mockPublicPlaceDetailApi(page);

  await capturePlaceDetail(page, { height: 844, name: "place-detail-390x844.png", width: 390 });
  await capturePlaceDetail(page, { height: 568, name: "place-detail-320x568.png", width: 320 });
  await capturePlaceDetail(page, { height: 932, name: "place-detail-430x932.png", width: 430 });
});

test("private place detail actions still require login", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await mockPublicPlaceDetailApi(page);

  await page.goto(`/places/${placeId}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".place-detail-page")).toBeVisible();

  await page.locator(".place-detail-hero__actions button").first().click();
  await expect(page).toHaveURL(new RegExp(`/login\\?returnTo=%2Fplaces%2F${placeId}`));
});

async function capturePlaceDetail(
  page: Page,
  viewport: { height: number; name: string; width: number }
) {
  await page.setViewportSize({ height: viewport.height, width: viewport.width });
  await page.goto(`/places/${placeId}`, { waitUntil: "domcontentloaded" });

  await expect(page.locator(".place-detail-page")).toBeVisible();
  await expect(page.locator(".place-detail-hero")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "دخان الإصدار" })).toBeVisible();
  await expect(page.locator(".place-detail-panel--rating")).toBeVisible();
  await expect(page.getByRole("heading", { name: "تقييم المجتمع" })).toBeVisible();
  await expect(page.locator(".place-detail-info")).toHaveCount(0);
  await expect(page.getByText("العنوان", { exact: true })).toHaveCount(0);
  await expect(page.getByText("ساعات العمل", { exact: true })).toHaveCount(0);
  await expect(page.getByText("المسافة", { exact: true })).toHaveCount(0);
  await expect(page.getByText("رابط الخرائط", { exact: true })).toHaveCount(0);
  await expect(page.locator(".app-nav")).toBeVisible();
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, viewport.name);
}

async function mockPublicPlaceDetailApi(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("restaurantWishlist.hasSession");
  });
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/v1", "");

    if (path === `/places/${placeId}` && request.method() === "GET") {
      return route.fulfill({
        body: JSON.stringify(placePayload()),
        contentType: "application/json",
        status: 200
      });
    }

    return route.fulfill({
      body: JSON.stringify({ error: { code: "MOCK_NOT_FOUND", message: `${request.method()} ${path}` } }),
      contentType: "application/json",
      status: 404
    });
  });
}

function placePayload() {
  return {
    averageRating: 9,
    createdAt: now,
    createdByUserId: "user-owner",
    currentUserIsCreator: false,
    currentUserListCount: 0,
    currentUserListIds: [],
    currentUserListNames: [],
    currentUserRating: null,
    description: null,
    id: placeId,
    imageUrl: null,
    name: "دخان الإصدار",
    ratingCount: 34,
    subtype: "burger",
    type: "restaurant",
    updatedAt: now
  };
}

async function hasNoHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
}

async function captureScreenshot(page: Page, name: string) {
  mkdirSync(screenshotsDir, { recursive: true });
  await page.screenshot({
    fullPage: true,
    path: join(screenshotsDir, name)
  });
}
