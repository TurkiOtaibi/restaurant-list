import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const screenshotsDir = join(
  process.cwd(),
  "..",
  "docs",
  "qa-execution",
  "base-ui-dialog-wave-1",
  "screenshots"
);

test("CreateListDialog desktop uses Base UI Dialog and preserves validation and submit", async ({
  page
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  const createRequests = await mockCreateListApi(page);

  await page.goto("/lists/new");

  const dialog = page.getByRole("dialog", { name: "أضف قائمة" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("data-base-ui-dialog-surface", "true");
  await expect(page.locator(".ds-modal[data-base-ui-dialog-surface='true']")).toBeVisible();
  await expect(page.locator(".ds-bottom-sheet")).toHaveCount(0);
  await expect(page.getByLabel("اسم القائمة")).toBeFocused();
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, "create-list-dialog-desktop-open.png");

  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText("اسم القائمة مطلوب")).toBeVisible();

  await page.getByLabel("اسم القائمة").fill("قائمة اختبار Base UI");
  await page.getByRole("button", { name: "حفظ" }).click();

  await expect.poll(createRequests).toBe(1);
  await page.waitForURL(/\/lists\/base-ui-dialog-list$/, {
    timeout: 30_000,
    waitUntil: "domcontentloaded"
  });
  await expect(page).toHaveURL(/\/lists\/base-ui-dialog-list$/);
});

test("CreateListDialog mobile keeps the existing BottomSheet presentation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockCreateListApi(page);

  await page.goto("/lists/new");

  const dialog = page.getByRole("dialog", { name: "أضف قائمة" });
  await expect(dialog).toBeVisible();
  await expect(page.locator(".ds-bottom-sheet")).toBeVisible();
  await expect(page.locator(".ds-bottom-sheet__grabber")).toBeVisible();
  await expect(page.locator("[data-base-ui-dialog-surface='true']")).toHaveCount(0);
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, "create-list-dialog-bottom-sheet-390x844-open.png");

  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText("اسم القائمة مطلوب")).toBeVisible();

  await page.getByRole("button", { name: "إلغاء" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/lists\?focus=create-list$/);
});

test("CreateListDialog 320px mobile BottomSheet can still submit", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const createRequests = await mockCreateListApi(page);

  await page.goto("/lists/new");

  await expect(page.getByRole("dialog", { name: "أضف قائمة" })).toBeVisible();
  await expect(page.locator(".ds-bottom-sheet")).toBeVisible();
  await expect(page.locator("[data-base-ui-dialog-surface='true']")).toHaveCount(0);
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, "create-list-dialog-bottom-sheet-320x568-open.png");

  await page.getByLabel("اسم القائمة").fill("قائمة هاتف Base UI");
  await page.getByRole("button", { name: "حفظ" }).click();

  await expect.poll(createRequests).toBe(1);
  await expect(page).toHaveURL(/\/lists\/base-ui-dialog-list$/, { timeout: 15_000 });
});

async function mockCreateListApi(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });

  let createRequests = 0;

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/v1", "");

    if (path === "/auth/refresh") {
      return route.fulfill({
        body: JSON.stringify({ accessToken: "mock-access-token" }),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/lists" && request.method() === "POST") {
      createRequests += 1;
      return route.fulfill({
        body: JSON.stringify(listPayload()),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/lists/base-ui-dialog-list" && request.method() === "GET") {
      return route.fulfill({
        body: JSON.stringify(listPayload()),
        contentType: "application/json",
        status: 200
      });
    }

    return route.fulfill({
      body: JSON.stringify({
        error: { code: "MOCK_NOT_FOUND", message: `${request.method()} ${path}` }
      }),
      contentType: "application/json",
      status: 404
    });
  });

  return () => createRequests;
}

function listPayload() {
  const now = new Date().toISOString();

  return {
    createdAt: now,
    id: "base-ui-dialog-list",
    isSystem: false,
    items: [],
    name: "قائمة اختبار Base UI",
    ownerDisplayName: "مستخدم الاختبار",
    placeCount: 0,
    updatedAt: now,
    visibility: "private"
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
