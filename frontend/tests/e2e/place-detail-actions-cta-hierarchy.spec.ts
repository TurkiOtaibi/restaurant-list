import { expect, test, type Locator, type Page, type Route } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const now = new Date().toISOString();
const placeId = "place-detail-actions";
const screenshotsDir = join(
  process.cwd(),
  "..",
  "docs",
  "qa-execution",
  "place-detail-actions-cta-hierarchy",
  "screenshots"
);

test("public Place Detail keeps user actions in hero and rating card without top-right menu", async ({
  page
}) => {
  await mockPlaceDetailApi(page, { authenticated: false, creator: false });

  await capturePublicPlaceDetail(page, {
    height: 844,
    name: "place-detail-actions-hero-390x844.png",
    width: 390
  });
  await capturePublicPlaceDetail(page, {
    height: 568,
    name: "place-detail-actions-hero-320x568.png",
    width: 320
  });
  await capturePublicPlaceDetail(page, {
    height: 932,
    name: "place-detail-actions-hero-430x932.png",
    width: 430
  });
});

test("Place Detail owner menu contains only existing management actions", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await mockPlaceDetailApi(page, { authenticated: true, creator: true });

  await page.goto(`/places/${placeId}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".place-detail-page")).toBeVisible();

  const trigger = page.getByRole("button", { name: "خيارات إدارة المكان" });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const menu = page.getByRole("menu", { name: "خيارات إدارة المكان" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "تغيير الصورة" })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "إزالة الصورة" })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "أضف إلى قائمة" })).toHaveCount(0);
  await expect(menu.getByRole("menuitem", { name: "أضف إلى رغباتي" })).toHaveCount(0);
  await expect(menu.getByRole("menuitem", { name: "قيّم المكان" })).toHaveCount(0);
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, "place-detail-actions-menu-open-390x844.png");
});

test("Place Detail actions still open the existing flows", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await mockPlaceDetailApi(page, { authenticated: true, creator: false });

  await page.goto(`/places/${placeId}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".place-detail-page")).toBeVisible();

  await page.getByRole("button", { name: "أضف إلى قائمة" }).click();
  await expect(page.getByRole("dialog", { name: "أضف إلى قائمة" })).toBeVisible();
  await page.getByRole("button", { name: "إغلاق" }).click();
  await expect(page.getByRole("dialog", { name: "أضف إلى قائمة" })).toHaveCount(0);

  await page.getByRole("button", { name: "أضف إلى رغباتي" }).click();
  await expect(page.getByRole("button", { name: "في رغباتي" })).toBeVisible();

  const ratingLink = page.getByRole("link", { name: "قيّم المكان" });
  await expect(ratingLink).toHaveAttribute("href", `/places/${placeId}/rate`);
  await ratingLink.click();
  await expect(page).toHaveURL(new RegExp(`/places/${placeId}/rate$`), { timeout: 15_000 });
});

async function capturePublicPlaceDetail(
  page: Page,
  viewport: { height: number; name: string; width: number }
) {
  await page.setViewportSize({ height: viewport.height, width: viewport.width });
  await page.goto(`/places/${placeId}`, { waitUntil: "domcontentloaded" });

  await expect(page.locator(".place-detail-page")).toBeVisible();
  await expect(page.locator(".place-detail-hero")).toBeVisible();
  await expect(page.getByRole("heading", { name: "دخان الإصدار" })).toBeVisible();

  const heroActions = page.locator(".place-detail-hero__actions");
  const wishlistButton = heroActions.getByRole("button", { name: "أضف إلى رغباتي" });
  const addToListButton = heroActions.getByRole("button", { name: "أضف إلى قائمة" });
  await expect(wishlistButton).toBeVisible();
  await expect(addToListButton).toBeVisible();
  await expectCenteredButton(wishlistButton);
  await expectCenteredButton(addToListButton);

  await expect(page.locator(".place-detail-panel--rating")).toBeVisible();
  const ratingPanel = page.locator(".place-detail-panel--rating");
  await expect(ratingPanel.getByRole("heading", { name: "تقييمك" })).toBeVisible();
  await expect(ratingPanel.getByText("لم تضف تقييمًا لهذا المكان بعد.")).toBeVisible();
  await expect(ratingPanel.getByRole("link", { name: "قيّم المكان" })).toBeVisible();
  await expect(page.locator(".place-detail-hero").getByRole("link", { name: "قيّم المكان" })).toHaveCount(0);

  await expect(page.locator(".place-detail-topbar .ds-action-menu__trigger")).toHaveCount(0);
  await expect(page.locator(".app-nav")).toBeVisible();
  await expect.poll(() => hasNoHorizontalOverflow(page)).toBe(true);

  await captureScreenshot(page, viewport.name);
}

async function expectCenteredButton(button: Locator) {
  await expect(button).toHaveCSS("display", "flex");
  await expect(button).toHaveCSS("align-items", "center");
  await expect(button).toHaveCSS("justify-content", "center");
}

async function mockPlaceDetailApi(
  page: Page,
  {
    authenticated,
    creator
  }: {
    authenticated: boolean;
    creator: boolean;
  }
) {
  let inWishlist = false;

  if (authenticated) {
    await page.addInitScript(() => {
      window.localStorage.setItem("restaurantWishlist.hasSession", "1");
    });
  } else {
    await page.addInitScript(() => {
      window.localStorage.removeItem("restaurantWishlist.hasSession");
    });
  }

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/v1", "");

    if (path === "/auth/refresh") {
      return fulfillMockJson(
        route,
        authenticated ? { accessToken: "mock-access-token" } : { detail: { code: "UNAUTHENTICATED" } },
        authenticated ? 200 : 401
      );
    }

    if (path === `/places/${placeId}` && request.method() === "GET") {
      return fulfillMockJson(route, placePayload({ creator, inWishlist }));
    }

    if (path === "/profile" && request.method() === "GET") {
      return fulfillMockJson(route, profilePayload(inWishlist));
    }

    if (path === "/lists" && request.method() === "GET") {
      return fulfillMockJson(route, {
        data: [
          {
            createdAt: now,
            id: "list-one",
            isSystem: false,
            name: "قائمة الاختبار",
            placeCount: 0,
            updatedAt: now,
            visibility: "private"
          }
        ],
        meta: { limit: 50, offset: 0, sort: "updated_at", total: 1 }
      });
    }

    if (path === "/wishlist/places" && request.method() === "POST") {
      inWishlist = true;
      return fulfillMockJson(route, wishlistPayload(true));
    }

    if (path === `/wishlist/places/${placeId}` && request.method() === "DELETE") {
      inWishlist = false;
      return fulfillMockJson(route, wishlistPayload(false));
    }

    return fulfillMockJson(
      route,
      { detail: { code: "MOCK_NOT_FOUND", message: `${request.method()} ${path}` } },
      404
    );
  });
}

async function fulfillMockJson(route: Route, payload: unknown, status = 200) {
  return route.fulfill({
    body: JSON.stringify(payload),
    contentType: "application/json",
    status
  });
}

function placePayload({ creator, inWishlist }: { creator: boolean; inWishlist: boolean }) {
  return {
    averageRating: 9,
    createdAt: now,
    createdByUserId: "user-owner",
    currentUserIsCreator: creator,
    currentUserListCount: inWishlist ? 1 : 0,
    currentUserListIds: inWishlist ? ["wishlist-list"] : [],
    currentUserListNames: inWishlist ? ["رغباتي"] : [],
    currentUserRating: null,
    description: null,
    id: placeId,
    imageUrl: creator ? "https://example.com/place-image.webp" : null,
    name: "دخان الإصدار",
    ratingCount: 34,
    subtype: "burger",
    type: "restaurant",
    updatedAt: now
  };
}

function profilePayload(inWishlist: boolean) {
  return {
    averageRating: null,
    bio: null,
    displayName: "مستخدم الاختبار",
    favoritePlaces: [],
    listCount: inWishlist ? 1 : 0,
    listsCount: inWishlist ? 1 : 0,
    publicListsSummary: [],
    ratedCafeCount: 0,
    ratedIceCreamCount: 0,
    ratedRestaurantCount: 0,
    ratingsCount: 0,
    userRatings: [],
    wishlist: inWishlist ? { id: "wishlist-list", placeCount: 1 } : null
  };
}

function wishlistPayload(withPlace: boolean) {
  return {
    createdAt: now,
    id: "wishlist-list",
    isSystem: true,
    items: withPlace
      ? [
          {
            createdAt: now,
            id: "wishlist-item",
            listId: "wishlist-list",
            place: placePayload({ creator: false, inWishlist: true }),
            placeId
          }
        ]
      : [],
    name: "رغباتي",
    placeCount: withPlace ? 1 : 0,
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
