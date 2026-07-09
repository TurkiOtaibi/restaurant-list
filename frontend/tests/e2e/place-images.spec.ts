import { expect, test, type Page } from "@playwright/test";

const now = new Date().toISOString();
const imageDataUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%230f8f59'/%3E%3C/svg%3E";

test("place image surfaces render images and fall back to type tiles", async ({ page }) => {
  await page.route("**/broken-favorite.webp", async (route) => {
    await route.fulfill({ body: "", status: 404 });
  });
  await mockProfileApi(page);

  await page.goto("/profile");

  const favorites = page.getByLabel("الأماكن المفضلة");
  await expect(favorites.getByRole("link").nth(0).locator("img")).toHaveAttribute("src", imageDataUrl);
  await expect(favorites.getByRole("link").nth(1).locator(".ds-type-icon")).toBeVisible();
  await expect(favorites.getByRole("link").nth(2).locator(".ds-type-icon")).toBeVisible();
});

test("creator can upload a place image and non-creator cannot see image management", async ({
  page
}) => {
  await mockPlaceDetailApi(page, { creator: true, imageUrl: null });

  await page.goto("/places/image-place");
  await page.getByRole("button", { name: "خيارات إدارة المكان" }).click();
  await page.getByRole("menuitem", { name: "تعديل" }).click();
  await expect(page.getByRole("dialog", { name: "أضف صورة" })).toBeVisible();

  await page.locator("#place-image-file").setInputFiles({
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64"
    ),
    mimeType: "image/png",
    name: "place.png"
  });
  await expect(page.locator(".place-image-dialog__preview img")).toBeVisible();
  await page.getByRole("button", { name: "حفظ الصورة" }).click();

  await expect(page.getByRole("dialog", { name: "أضف صورة" })).toHaveCount(0);
  await expect(page.locator(".place-detail-hero__art img")).toHaveAttribute("src", /uploaded-place/);

  await page.getByRole("button", { name: "خيارات إدارة المكان" }).click();
  await page.getByRole("menuitem", { name: "حذف" }).click();
  await expect(page.locator(".place-detail-hero__art.ds-type-icon")).toBeVisible();

  await mockPlaceDetailApi(page, { creator: false, imageUrl: null });
  await page.goto("/places/image-place");
  await expect(page.getByRole("button", { name: "خيارات إدارة المكان" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "تعديل" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "حذف" })).toHaveCount(0);
});

async function mockProfileApi(page: Page) {
  await installSession(page);
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

async function mockPlaceDetailApi(
  page: Page,
  { creator, imageUrl }: { creator: boolean; imageUrl: string | null }
) {
  await installSession(page);
  let currentPlace = placePayload({ creator, imageUrl });

  await page.unroute("**/api/v1/**").catch(() => undefined);
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api/v1", "");

    if (path === "/auth/refresh") {
      return route.fulfill({
        body: JSON.stringify({ accessToken: "mock-access-token" }),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/places/image-place" && request.method() === "GET") {
      return route.fulfill({
        body: JSON.stringify(currentPlace),
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

    if (path === "/places/image-place/image" && request.method() === "PUT") {
      currentPlace = placePayload({ creator: true, imageUrl: `${imageDataUrl}#uploaded-place` });
      return route.fulfill({
        body: JSON.stringify(currentPlace),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/places/image-place/image" && request.method() === "DELETE") {
      currentPlace = placePayload({ creator: true, imageUrl: null });
      return route.fulfill({
        body: JSON.stringify(currentPlace),
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

async function installSession(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });
}

function profilePayload() {
  return {
    averageRating: 8.5,
    bio: null,
    displayName: "تركي العتيبي",
    favoritePlaces: [
      {
        id: "favorite-image",
        imageUrl: imageDataUrl,
        name: "مفضل بصورة",
        rating: 9,
        subtype: "burger",
        type: "restaurant"
      },
      {
        id: "favorite-fallback",
        imageUrl: null,
        name: "مفضل بلا صورة",
        rating: 8,
        subtype: "coffee",
        type: "cafe"
      },
      {
        id: "favorite-broken",
        imageUrl: "/broken-favorite.webp",
        name: "مفضل بصورة تالفة",
        rating: 7,
        subtype: "burger",
        type: "restaurant"
      }
    ],
    listCount: 0,
    listsCount: 0,
    publicListsSummary: [],
    ratedCafeCount: 0,
    ratedIceCreamCount: 0,
    ratedRestaurantCount: 1,
    ratingsCount: 1,
    ratingsCreatedCount: 1,
    userRatings: [
      {
        createdAt: now,
        id: "rating-image",
        notes: null,
        place: placePayload({ creator: true, imageUrl: imageDataUrl }),
        rating: 8.5,
        updatedAt: now
      }
    ],
    wishlist: null
  };
}

function placePayload({ creator, imageUrl }: { creator: boolean; imageUrl: string | null }) {
  return {
    averageRating: 8.5,
    createdAt: now,
    createdByUserId: "image-owner",
    currentUserIsCreator: creator,
    currentUserListCount: 0,
    currentUserListIds: [],
    currentUserListNames: [],
    currentUserRating: 8.5,
    description: null,
    id: "image-place",
    imageUrl,
    name: "مطعم الصور",
    ratingCount: 1,
    subtype: "burger",
    type: "restaurant",
    updatedAt: now
  };
}
