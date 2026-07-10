import { expect, test, type Page } from "@playwright/test";

const now = new Date().toISOString();

test("ResponsiveDialog isolates the page, traps focus, and restores focus on close", async ({
  page
}) => {
  await mockProfileApi(page);
  await page.goto("/profile");

  const trigger = page.getByRole("button", { name: "تعديل الملف الشخصي" });
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "تعديل الملف الشخصي" });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("الاسم")).toBeFocused();
  await expect(page.locator("[data-ds-dialog-root='true']")).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => document.body.style.overflowY)).toBe("hidden");
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.body.children)
          .filter((element) => !(element as HTMLElement).dataset.dsDialogRoot)
          .every(
            (element) =>
              (element as HTMLElement & { inert?: boolean }).inert === true &&
              element.getAttribute("aria-hidden") === "true"
          )
      )
    )
    .toBe(true);

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    await expect
      .poll(() =>
        dialog.evaluate((element) =>
          document.activeElement ? element.contains(document.activeElement) : false
        )
      )
      .toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("[data-ds-dialog-root='true']")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflowY)).toBe("");
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.body.children).every(
          (element) =>
            (element as HTMLElement & { inert?: boolean }).inert !== true &&
            element.getAttribute("aria-hidden") !== "true"
        )
      )
    )
    .toBe(true);
});

test("ResponsiveDialog close button keeps the existing profile edit behavior intact", async ({
  page
}) => {
  await mockProfileApi(page);
  await page.goto("/profile");

  const trigger = page.getByRole("button", { name: "تعديل الملف الشخصي" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "تعديل الملف الشخصي" });
  await expect(dialog).toBeVisible();
  await page.getByLabel("الاسم").fill("اسم مؤقت");
  await page.getByRole("button", { name: "إغلاق تعديل الملف الشخصي" }).click();

  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("heading", { level: 2, name: "تركي العتيبي" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "اسم مؤقت" })).toHaveCount(0);
});

test("ResponsiveDialog confirm-close keeps unsaved create-list edits inside the dialog", async ({
  page
}) => {
  await mockProfileApi(page);
  await page.goto("/lists/new");

  const dialog = page.getByRole("dialog", { name: "أضف قائمة" });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("اسم القائمة")).toBeFocused();

  await page.getByLabel("اسم القائمة").fill("قائمة مؤقتة");
  await page.keyboard.press("Escape");

  const notice = dialog.getByRole("alert");
  await expect(notice).toContainText("هناك تغييرات غير محفوظة. إغلاق؟");
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/lists\/new$/);

  await page.getByRole("button", { name: "متابعة التحرير" }).click();
  await expect(notice).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("اسم القائمة")).toHaveValue("قائمة مؤقتة");

  await page.keyboard.press("Escape");
  await expect(dialog.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "تجاهل وإغلاق" }).click();

  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/lists\?focus=create-list$/);
  await expect(page.locator("[data-ds-dialog-root='true']")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflowY)).toBe("");
});

test("ResponsiveDialog alertdialog keeps destructive list deletion behind cancel", async ({
  page
}) => {
  const deleteRequests = await mockNormalListDetailApi(page);
  await page.goto("/lists/normal-list");

  await page.getByRole("button", { name: "إجراءات القائمة" }).click();
  await page.getByRole("menuitem", { name: "حذف" }).click();

  const alertDialog = page.getByRole("alertdialog", { name: "حذف القائمة" });
  await expect(alertDialog).toBeVisible();
  await expect(page.getByRole("button", { name: "إلغاء" })).toBeFocused();
  await expect(alertDialog.getByRole("button", { name: "حذف" })).toBeVisible();

  await page.getByRole("button", { name: "إلغاء" }).click();

  await expect(alertDialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/lists\/normal-list$/);
  await expect.poll(deleteRequests).toBe(0);
  await expect(page.locator("[data-ds-dialog-root='true']")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflowY)).toBe("");
});

async function mockProfileApi(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/api/v1", "");

    if (path === "/auth/refresh") {
      return route.fulfill({
        body: JSON.stringify({ accessToken: "mock-access-token" }),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/profile") {
      return route.fulfill({
        body: JSON.stringify(profilePayload()),
        contentType: "application/json",
        status: 200
      });
    }

    return route.fulfill({
      body: JSON.stringify({ error: { code: "MOCK_NOT_FOUND", message: path } }),
      contentType: "application/json",
      status: 404
    });
  });
}

function profilePayload() {
  return {
    averageRating: null,
    bio: "أختبر تجربة النوافذ والحركة بلوحة مفاتيح.",
    displayName: "تركي العتيبي",
    favoritePlaces: [],
    listCount: 1,
    listsCount: 1,
    publicListsSummary: [
      {
        createdAt: now,
        id: "public-list",
        name: "قائمة عامة",
        ownerDisplayName: "تركي العتيبي",
        placeCount: 2,
        updatedAt: now
      }
    ],
    ratedCafeCount: 0,
    ratedIceCreamCount: 0,
    ratedRestaurantCount: 0,
    ratingsCount: 0,
    ratingsCreatedCount: 0,
    userRatings: [],
    wishlist: null
  };
}

async function mockNormalListDetailApi(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });

  let deleteRequests = 0;

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

    if (path === "/lists/normal-list" && request.method() === "GET") {
      return route.fulfill({
        body: JSON.stringify(normalListPayload()),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/lists/normal-list" && request.method() === "DELETE") {
      deleteRequests += 1;
      return route.fulfill({
        body: JSON.stringify({ error: { code: "MOCK_DELETE_CALLED", message: path } }),
        contentType: "application/json",
        status: 500
      });
    }

    return route.fulfill({
      body: JSON.stringify({ error: { code: "MOCK_NOT_FOUND", message: `${request.method()} ${path}` } }),
      contentType: "application/json",
      status: 404
    });
  });

  return () => deleteRequests;
}

function normalListPayload() {
  return {
    createdAt: now,
    id: "normal-list",
    isSystem: false,
    items: [],
    name: "قائمة للحذف",
    ownerDisplayName: "تركي العتيبي",
    placeCount: 0,
    updatedAt: now,
    visibility: "private"
  };
}
