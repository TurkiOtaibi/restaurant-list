import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const now = new Date().toISOString();
const placeId = "rtl-menu-place";
const screenshotsDir = join(
  process.cwd(),
  "..",
  "docs",
  "qa-execution",
  "rtl-menu-viewport-collision",
  "screenshots"
);

test("Place Detail RTL action menu stays fully inside mobile viewports", async ({ page }) => {
  await mockPublicPlaceDetailApi(page);

  await capturePlaceDetailMenu(page, { height: 844, name: "place-detail-menu-open-390x844.png", width: 390 });
  await capturePlaceDetailMenu(page, { height: 568, name: "place-detail-menu-open-320x568.png", width: 320 });
  await capturePlaceDetailMenu(page, { height: 932, name: "place-detail-menu-open-430x932.png", width: 430 });
});

test("Place Detail action menu keeps keyboard close and focus restoration", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await mockPublicPlaceDetailApi(page);

  await page.goto(`/places/${placeId}`, { waitUntil: "domcontentloaded" });
  const trigger = page.locator(".place-detail-topbar .ds-action-menu__trigger");
  await expect(trigger).toBeVisible();

  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = page.locator(".place-detail-topbar .ds-action-menu__items");
  await expect(menu).toBeVisible();
  await expect(page.locator(".place-detail-topbar [role='menuitem']").first()).toBeFocused();
  await assertMenuInsideViewport(page, menu);

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(menu).toBeVisible();
  await page.locator("main").click({ position: { x: 12, y: 12 } });
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);
});

async function capturePlaceDetailMenu(
  page: Page,
  viewport: { height: number; name: string; width: number }
) {
  await page.setViewportSize({ height: viewport.height, width: viewport.width });
  await page.goto(`/places/${placeId}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".place-detail-page")).toBeVisible();

  const trigger = page.locator(".place-detail-topbar .ds-action-menu__trigger");
  await expect(trigger).toBeVisible();
  await trigger.click();

  const menu = page.locator(".place-detail-topbar .ds-action-menu__items");
  await expect(menu).toBeVisible();
  await assertMenuInsideViewport(page, menu);
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, viewport.name);
}

async function assertMenuInsideViewport(page: Page, menu: ReturnType<Page["locator"]>) {
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) {
    return;
  }

  expect(box.x).toBeGreaterThanOrEqual(8);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 8);
  expect(box.y).toBeGreaterThanOrEqual(0);

  const contentFits = await menu.evaluate((element) => {
    const menuFits = element.scrollWidth <= element.clientWidth + 1;
    const itemFits = Array.from(element.querySelectorAll("button")).every(
      (button) => button.scrollWidth <= button.clientWidth + 1
    );

    return menuFits && itemFits;
  });
  expect(contentFits).toBe(true);
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
      body: JSON.stringify({ detail: { code: "MOCK_NOT_FOUND", message: `${request.method()} ${path}` } }),
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
    currentUserIsCreator: true,
    currentUserListCount: 0,
    currentUserListIds: [],
    currentUserListNames: [],
    currentUserRating: null,
    description: null,
    id: placeId,
    imageUrl: null,
    name: "قائمة اختبار التموضع",
    ratingCount: 12,
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
