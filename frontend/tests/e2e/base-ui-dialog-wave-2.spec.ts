import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const screenshotsDir = join(
  process.cwd(),
  "..",
  "docs",
  "qa-execution",
  "base-ui-dialog-wave-2",
  "screenshots"
);

test("EditListDialog desktop uses Base UI Dialog and preserves validation and save", async ({
  page
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  const patchRequests = await mockEditListApi(page);

  await page.goto("/lists/base-ui-edit-list");
  await openEditListDialog(page);

  const dialog = page.getByRole("dialog", { name: "تعديل القائمة" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("data-base-ui-dialog-surface", "true");
  await expect(page.locator(".ds-modal[data-base-ui-dialog-surface='true']")).toBeVisible();
  await expect(page.locator(".ds-bottom-sheet")).toHaveCount(0);
  await expect(page.getByLabel("اسم القائمة")).toBeFocused();
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, "edit-list-dialog-desktop-open.png");

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    await expectFocusInside(dialog);
  }

  await page.getByLabel("اسم القائمة").fill("");
  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  await expect(page.getByText("الاسم مطلوب")).toBeVisible();
  await expect.poll(patchRequests).toBe(0);

  await page.getByLabel("اسم القائمة").fill("قائمة معدلة Base UI");
  await page.getByRole("button", { name: "حفظ", exact: true }).click();

  await expect.poll(patchRequests).toBe(1);
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "قائمة معدلة Base UI" })).toBeVisible();
  await expect(page.locator("[data-ds-dialog-root='true']")).toHaveCount(0);
});

test("EditListDialog mobile keeps the existing BottomSheet presentation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockEditListApi(page);

  await page.goto("/lists/base-ui-edit-list");
  await openEditListDialog(page);

  const dialog = page.getByRole("dialog", { name: "تعديل القائمة" });
  await expect(dialog).toBeVisible();
  await expect(page.locator(".ds-bottom-sheet")).toBeVisible();
  await expect(page.locator(".ds-bottom-sheet__grabber")).toBeVisible();
  await expect(page.locator("[data-base-ui-dialog-surface='true']")).toHaveCount(0);
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, "edit-list-dialog-bottom-sheet-390x844-open.png");

  await page.getByLabel("اسم القائمة").fill("");
  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  await expect(page.getByText("الاسم مطلوب")).toBeVisible();

  await page.getByRole("button", { name: "إلغاء" }).click();
  await expect(dialog).toHaveCount(0);
});

test("EditListDialog 320px mobile BottomSheet remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const patchRequests = await mockEditListApi(page);

  await page.goto("/lists/base-ui-edit-list");
  await openEditListDialog(page);

  await expect(page.getByRole("dialog", { name: "تعديل القائمة" })).toBeVisible();
  await expect(page.locator(".ds-bottom-sheet")).toBeVisible();
  await expect(page.locator("[data-base-ui-dialog-surface='true']")).toHaveCount(0);
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, "edit-list-dialog-bottom-sheet-320x568-open.png");

  await page.getByLabel("اسم القائمة").fill("قائمة هاتف Base UI");
  await page.getByRole("button", { name: "حفظ", exact: true }).click();

  await expect.poll(patchRequests).toBe(1);
  await expect(page.getByRole("heading", { name: "قائمة هاتف Base UI" })).toBeVisible();
});

async function openEditListDialog(page: Page) {
  await expect(page.getByRole("heading", { name: "قائمة Base UI" })).toBeVisible();
  await page.getByRole("button", { name: "إجراءات القائمة" }).click();
  await page.getByRole("menuitem", { name: "تعديل" }).click();
}

async function mockEditListApi(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });

  let patchRequests = 0;
  let currentList = listPayload();

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

    if (path === "/lists/base-ui-edit-list" && request.method() === "GET") {
      return route.fulfill({
        body: JSON.stringify(currentList),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/lists/base-ui-edit-list" && request.method() === "PATCH") {
      patchRequests += 1;
      const body = request.postDataJSON() as { name?: string };
      currentList = {
        ...currentList,
        name: body.name ?? currentList.name,
        updatedAt: new Date().toISOString()
      };
      return route.fulfill({
        body: JSON.stringify({
          createdAt: currentList.createdAt,
          id: currentList.id,
          isSystem: currentList.isSystem,
          name: currentList.name,
          placeCount: currentList.placeCount,
          updatedAt: currentList.updatedAt,
          visibility: currentList.visibility
        }),
        contentType: "application/json",
        status: 200
      });
    }

    return route.fulfill({
      body: JSON.stringify({
        detail: { code: "MOCK_NOT_FOUND", message: `${request.method()} ${path}` }
      }),
      contentType: "application/json",
      status: 404
    });
  });

  return () => patchRequests;
}

function listPayload() {
  const now = new Date().toISOString();

  return {
    createdAt: now,
    id: "base-ui-edit-list",
    isSystem: false,
    items: [],
    name: "قائمة Base UI",
    ownerDisplayName: "مستخدم الاختبار",
    placeCount: 0,
    updatedAt: now,
    visibility: "private"
  };
}

async function expectFocusInside(dialog: ReturnType<Page["getByRole"]>) {
  await expect
    .poll(() =>
      dialog.evaluate((element) =>
        document.activeElement ? element.contains(document.activeElement) : false
      )
    )
    .toBe(true);
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
