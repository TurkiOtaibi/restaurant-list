import { expect, test, type Page } from "@playwright/test";

const now = new Date().toISOString();

type MockProfileOptions = {
  completeRatings?: boolean;
  ratings?: Array<{ id: string; name: string; rating: number; type: "restaurant" | "cafe" }>;
};

test("profile phase 1 renders identity header stats and primary sections", async ({ page }) => {
  await mockProfileApi(page, {
    ratings: [
      { id: "r1", name: "Five Guys", rating: 9, type: "restaurant" },
      { id: "r2", name: "قهوة الاختبار", rating: 8, type: "cafe" }
    ]
  });

  await page.goto("/profile");

  await expect(page.getByRole("heading", { level: 1, name: "صفحتي" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "تركي العتيبي" })).toBeVisible();
  await expect(page.getByLabel("التقييمات: 2")).toBeVisible();
  await expect(page.getByLabel("القوائم: 1")).toBeVisible();
  await expect(page.getByLabel("متوسط التقييم: 8.5/10")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "الأماكن التي قيّمتها" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "قوائمي" })).toBeVisible();
  await expect(page.getByRole("link", { name: "عرض القوائم" })).toHaveAttribute("href", "/lists");

  await page.getByRole("button", { name: "إجراءات صفحتي" }).click();
  await expect(page.getByRole("menuitem", { name: "تسجيل الخروج" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("تعديل الملف");
  await expect(page.locator("body")).not.toContainText("Reviews");
  await expect(page.locator("body")).not.toContainText("قريبًا");
});

test("profile phase 1 hides average tile when ratings archive is incomplete", async ({ page }) => {
  await mockProfileApi(page, {
    completeRatings: false,
    ratings: [{ id: "r1", name: "Five Guys", rating: 9, type: "restaurant" }]
  });

  await page.goto("/profile");

  await expect(page.getByLabel("التقييمات: 2")).toBeVisible();
  await expect(page.getByLabel("القوائم: 1")).toBeVisible();
  await expect(page.getByText("متوسط التقييم")).toHaveCount(0);
});

test("profile phase 1 shows a friendly empty ratings state", async ({ page }) => {
  await mockProfileApi(page, { ratings: [] });

  await page.goto("/profile");

  await expect(page.getByRole("heading", { level: 2, name: "الأماكن التي قيّمتها" })).toBeVisible();
  await expect(page.getByText("لم تقيّم أي مكان بعد")).toBeVisible();
  await expect(page.getByRole("link", { name: "استكشف الأماكن" })).toHaveAttribute("href", "/places");
  await expect(page.getByLabel("التقييمات: 0")).toBeVisible();
  await expect(page.getByLabel("القوائم: 1")).toBeVisible();
  await expect(page.getByText("متوسط التقييم")).toHaveCount(0);
});

async function mockProfileApi(page: Page, options: MockProfileOptions) {
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

    if (path === "/auth/logout") {
      return route.fulfill({
        body: JSON.stringify({}),
        contentType: "application/json",
        status: 200
      });
    }

    if (path === "/profile") {
      return route.fulfill({
        body: JSON.stringify(profilePayload(options)),
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

function profilePayload({ completeRatings = true, ratings = [] }: MockProfileOptions) {
  const userRatings = ratings.map((rating) => ({
    createdAt: now,
    id: rating.id,
    notes: null,
    place: {
      averageRating: rating.rating,
      createdAt: now,
      createdByUserId: "profile-user",
      currentUserListCount: 0,
      currentUserListIds: [],
      currentUserListNames: [],
      currentUserRating: rating.rating,
      description: null,
      id: `place-${rating.id}`,
      name: rating.name,
      ratingCount: 1,
      subtype: rating.type === "restaurant" ? "burger" : "coffee",
      type: rating.type,
      updatedAt: now
    },
    rating: rating.rating,
    updatedAt: now
  }));
  const ratingsCount = completeRatings ? userRatings.length : userRatings.length + 1;

  return {
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
    ratedCafeCount: userRatings.filter((rating) => rating.place.type === "cafe").length,
    ratedIceCreamCount: 0,
    ratedRestaurantCount: userRatings.filter((rating) => rating.place.type === "restaurant").length,
    ratingsCount,
    userRatings
  };
}
