import { expect, test, type Locator, type Page } from "@playwright/test";

test("Base UI CreateListDialog close button supports click Enter Space and safe focus return", async ({
  page
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await mockListsApi(page);

  await page.goto("/lists/new");
  let dialog = await expectCreateListDialog(page);
  let closeButton = closeButtonIn(dialog);

  await expect(closeButton).toBeVisible();
  await closeButton.click();
  await expectDialogClosedWithCreateLinkFocused(page);

  await page.goto("/lists/new");
  dialog = await expectCreateListDialog(page);
  closeButton = closeButtonIn(dialog);
  await closeButton.focus();
  await page.keyboard.press("Enter");
  await expectDialogClosedWithCreateLinkFocused(page);

  await page.goto("/lists/new");
  dialog = await expectCreateListDialog(page);
  closeButton = closeButtonIn(dialog);
  await closeButton.focus();
  await page.keyboard.press("Space");
  await expectDialogClosedWithCreateLinkFocused(page);
});

test("Base UI CreateListDialog traps desktop keyboard focus and restores focus after Escape", async ({
  page
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await mockListsApi(page);

  await page.goto("/lists/new");
  const dialog = await expectCreateListDialog(page);
  await expect(page.getByLabel("اسم القائمة")).toBeFocused();

  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press("Tab");
    await expectFocusInside(dialog);
  }

  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press("Shift+Tab");
    await expectFocusInside(dialog);
  }

  await page.keyboard.press("Escape");
  await expectDialogClosedWithCreateLinkFocused(page);
});

async function expectCreateListDialog(page: Page) {
  const dialog = page.getByRole("dialog", { name: "أضف قائمة" });

  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("data-base-ui-dialog-surface", "true");
  await expect(page.locator(".ds-bottom-sheet")).toHaveCount(0);
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  return dialog;
}

function closeButtonIn(dialog: Locator) {
  return dialog.getByRole("button", { name: "إغلاق" });
}

async function expectFocusInside(dialog: Locator) {
  await expect
    .poll(() =>
      dialog.evaluate((element) =>
        document.activeElement ? element.contains(document.activeElement) : false
      )
    )
    .toBe(true);
}

async function expectDialogClosedWithCreateLinkFocused(page: Page) {
  await expect(page.getByRole("dialog", { name: "أضف قائمة" })).toHaveCount(0);
  await expect(page).toHaveURL(/\/lists\?focus=create-list$/);
  await expect(page.getByRole("link", { name: "أضف قائمة" })).toBeFocused();
  await expect(page.locator("[data-ds-dialog-root='true']")).toHaveCount(0);
}

async function mockListsApi(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });

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

    if (path === "/lists" && request.method() === "GET") {
      return route.fulfill({
        body: JSON.stringify({
          data: [],
          meta: { limit: 20, offset: 0, sort: "updated_desc", total: 0 }
        }),
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
}

async function hasNoHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
}
