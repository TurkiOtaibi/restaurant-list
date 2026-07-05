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
      body: JSON.stringify({ detail: { code: "MOCK_NOT_FOUND", message: path } }),
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
