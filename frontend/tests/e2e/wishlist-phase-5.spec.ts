import { expect, test, type Page, type Route } from "@playwright/test";

const now = new Date().toISOString();
const wishlistId = "wishlist-list";
const placeId = "wishlist-place";
const playwrightPort = process.env.PLAYWRIGHT_PORT ?? "3000";
const mockFrontendOrigin =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${playwrightPort}`;
const mockCorsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Origin": mockFrontendOrigin
};

test("place detail toggles wishlist membership in place", async ({ page }) => {
  await mockWishlistPlaceDetailApi(page);

  await page.goto(`/places/${placeId}`);

  await expect(page.getByRole("button", { name: "أضف إلى رغباتي" })).toBeVisible();
  await page.getByRole("button", { name: "أضف إلى رغباتي" }).click();
  await expect(page.getByRole("button", { name: "في رغباتي" })).toBeVisible();
  await expect(page.getByRole("status")).toBeVisible();

  await page.getByRole("button", { name: "في رغباتي" }).click();
  await expect(page.getByRole("button", { name: "أضف إلى رغباتي" })).toBeVisible();
  await expect(page.getByRole("status")).toBeVisible();
});

test("profile renders wishlist empty and populated rows", async ({ page }) => {
  await mockProfileApi(page, { wishlist: null });

  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "رغباتي" })).toBeVisible();
  await expect(page.getByText("أضف أماكن تود زيارتها من صفحة المكان.")).toBeVisible();
  await expect(page.locator(`a[href="/lists/${wishlistId}"]`)).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("الإعجابات");
  await expect(page.locator("body")).not.toContainText("جربته");

  await mockProfileApi(page, { wishlist: { id: wishlistId, placeCount: 2 } });
  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "رغباتي" })).toBeVisible();
  await expect(page.locator(`a[href="/lists/${wishlistId}"]`)).toBeVisible();
});

test("system list detail hides rename delete affordances and keeps visibility editing", async ({
  page
}) => {
  await mockSystemListDetailApi(page);

  await page.goto(`/lists/${wishlistId}`);

  await expect(page.locator(".collection-topbar__meta .ds-badge")).toHaveCount(2);
  await page.locator(".list-detail-header__actions .ds-action-menu__trigger").click();
  await expect(page.getByRole("menuitem")).toHaveCount(1);

  await page.getByRole("menuitem").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#edit-list-name")).toHaveCount(0);
  const visibilityGroup = page.getByRole("radiogroup", { name: "الخصوصية" });
  await expect(visibilityGroup).toBeVisible();

  const privateRadio = visibilityGroup.getByRole("radio", { name: "خاصة" });
  const publicRadio = visibilityGroup.getByRole("radio", { name: "عامة" });
  await expect(privateRadio).toHaveAttribute("aria-checked", "true");

  await privateRadio.focus();
  await page.keyboard.press("ArrowDown");
  await expect(publicRadio).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".collection-topbar__meta")).toContainText("عامة");
});

test("system list action menu supports keyboard and focus contract", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await mockSystemListDetailApi(page);

  await page.goto(`/lists/${wishlistId}`);

  const trigger = page.getByRole("button", { name: "إجراءات القائمة" });
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu", { name: "إجراءات القائمة" });
  const editItem = page.getByRole("menuitem", { name: "تعديل" });
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(editItem).toBeFocused();
  await expect(page.getByRole("menuitem")).toHaveCount(1);
  await assertMenuInsideViewport(page, menu);
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await page.keyboard.press("ArrowDown");
  await expect(editItem).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(editItem).toBeFocused();
  await page.keyboard.press("Home");
  await expect(editItem).toBeFocused();
  await page.keyboard.press("End");
  await expect(editItem).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press(" ");
  await expect(editItem).toBeFocused();
  await page.locator("main").click({ position: { x: 12, y: 12 } });
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.click();
  await expect(editItem).toBeFocused();
  await editItem.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#edit-list-name")).toHaveCount(0);
});

async function assertMenuInsideViewport(page: Page, menu: ReturnType<Page["getByRole"]>) {
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
}

async function hasNoHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
}

async function installSession(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });
}

async function fulfillMockJson(route: Route, payload: unknown, status = 200) {
  return route.fulfill({
    body: JSON.stringify(payload),
    contentType: "application/json",
    headers: mockCorsHeaders,
    status
  });
}

async function mockWishlistPlaceDetailApi(page: Page) {
  await installSession(page);
  let inWishlist = false;

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

    if (path === `/places/${placeId}`) {
      return route.fulfill({
        body: JSON.stringify(placePayload(inWishlist)),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/profile") {
      return route.fulfill({
        body: JSON.stringify(profilePayload({ wishlist: inWishlist ? { id: wishlistId, placeCount: 1 } : null })),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/wishlist/places" && request.method() === "POST") {
      inWishlist = true;
      return route.fulfill({
        body: JSON.stringify(wishlistListPayload(true)),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === `/wishlist/places/${placeId}` && request.method() === "DELETE") {
      inWishlist = false;
      return route.fulfill({
        body: JSON.stringify(wishlistListPayload(false)),
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

async function mockProfileApi(
  page: Page,
  { wishlist }: { wishlist: { id: string; placeCount: number } | null }
) {
  await installSession(page);
  await page.unroute("**/api/v1/**").catch(() => undefined);
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/v1", "");
    if (request.method() === "OPTIONS") {
      return route.fulfill({
        headers: mockCorsHeaders,
        status: 204
      });
    }
    if (path === "/auth/refresh") {
      return fulfillMockJson(route, { accessToken: "mock-access-token" });
    }
    if (path === "/profile") {
      return fulfillMockJson(route, profilePayload({ wishlist }));
    }
    return fulfillMockJson(route, { error: { code: "MOCK_NOT_FOUND", message: path } }, 404);
  });
}

async function mockSystemListDetailApi(page: Page) {
  await installSession(page);
  let visibility: "private" | "public" = "private";
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

    if (path === `/lists/${wishlistId}`) {
      return route.fulfill({
        body: JSON.stringify(wishlistListPayload(true, visibility)),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === `/lists/${wishlistId}/visibility` && request.method() === "PATCH") {
      const payload = request.postDataJSON() as { visibility: "private" | "public" };
      visibility = payload.visibility;
      return route.fulfill({
        body: JSON.stringify({ data: wishlistListPayload(true, visibility) }),
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

function profilePayload({
  wishlist
}: {
  wishlist: { id: string; placeCount: number } | null;
}) {
  return {
    averageRating: null,
    bio: null,
    displayName: "مستخدم سجل",
    favoritePlaces: [],
    listCount: wishlist ? 1 : 0,
    listsCount: wishlist ? 1 : 0,
    publicListsSummary: [],
    ratedCafeCount: 0,
    ratedIceCreamCount: 0,
    ratedRestaurantCount: 0,
    ratingsCount: 0,
    ratingsCreatedCount: 0,
    userRatings: [],
    wishlist
  };
}

function placePayload(inWishlist: boolean) {
  return {
    averageRating: null,
    createdAt: now,
    createdByUserId: "owner",
    currentUserIsCreator: false,
    currentUserListCount: inWishlist ? 1 : 0,
    currentUserListIds: inWishlist ? [wishlistId] : [],
    currentUserListNames: inWishlist ? ["رغباتي"] : [],
    currentUserRating: null,
    description: null,
    id: placeId,
    imageUrl: null,
    name: "مطعم الرغبات",
    ratingCount: 0,
    subtype: "burger",
    type: "restaurant",
    updatedAt: now
  };
}

function wishlistListPayload(withPlace: boolean, visibility: "private" | "public" = "private") {
  return {
    createdAt: now,
    id: wishlistId,
    isSystem: true,
    items: withPlace
      ? [
          {
            createdAt: now,
            id: "wishlist-item",
            listId: wishlistId,
            place: placePayload(true),
            placeId
          }
        ]
      : [],
    name: "رغباتي",
    placeCount: withPlace ? 1 : 0,
    updatedAt: now,
    visibility
  };
}
