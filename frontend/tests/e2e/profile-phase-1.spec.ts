import { expect, test, type Page } from "@playwright/test";

const now = new Date().toISOString();

type MockProfileOptions = {
  averageRating?: number | null;
  bio?: string | null;
  displayName?: string;
  ratings?: Array<{ id: string; name: string; rating: number; type: "restaurant" | "cafe" }>;
};

test("profile renders identity header stats and primary sections from profile contract", async ({ page }) => {
  await mockProfileApi(page, {
    bio: "أوثق الأماكن التي تستحق العودة.",
    displayName: "تركي العتيبي",
    ratings: [
      { id: "r1", name: "Five Guys", rating: 9, type: "restaurant" },
      { id: "r2", name: "قهوة الاختبار", rating: 8, type: "cafe" }
    ]
  });

  await page.goto("/profile");

  await expect(page.getByRole("heading", { level: 1, name: "صفحتي" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "تركي العتيبي" })).toBeVisible();
  await expect(page.getByText("أوثق الأماكن التي تستحق العودة.")).toBeVisible();
  await expect(page.getByLabel("التقييمات: 2")).toBeVisible();
  await expect(page.getByLabel("القوائم: 1")).toBeVisible();
  await expect(page.getByLabel("متوسط التقييم: 8.5/10")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "الأماكن التي قيّمتها" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "قوائمي" })).toBeVisible();
  await expect(page.getByRole("link", { name: "عرض القوائم" })).toHaveAttribute("href", "/lists");

  await page.getByRole("button", { name: "إجراءات صفحتي" }).click();
  await expect(page.getByRole("menuitem", { name: "تعديل الملف الشخصي" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "تسجيل الخروج" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Reviews");
  await expect(page.locator("body")).not.toContainText("قريبًا");
  await expect(page.locator("body")).not.toContainText("المفضلة");
  await expect(page.locator("body")).not.toContainText("قائمة الرغبات");
});

test("profile uses server average rating field to control the average tile", async ({ page }) => {
  await mockProfileApi(page, {
    averageRating: null,
    ratings: [{ id: "r1", name: "Five Guys", rating: 9, type: "restaurant" }]
  });

  await page.goto("/profile");

  await expect(page.getByLabel("التقييمات: 1")).toBeVisible();
  await expect(page.getByLabel("القوائم: 1")).toBeVisible();
  await expect(page.getByText("متوسط التقييم")).toHaveCount(0);
});

test("profile shows a friendly empty ratings state", async ({ page }) => {
  await mockProfileApi(page, { ratings: [] });

  await page.goto("/profile");

  await expect(page.getByRole("heading", { level: 2, name: "الأماكن التي قيّمتها" })).toBeVisible();
  await expect(page.getByText("لم تقيّم أي مكان بعد")).toBeVisible();
  await expect(page.getByRole("link", { name: "استكشف الأماكن" })).toHaveAttribute("href", "/places");
  await expect(page.getByLabel("التقييمات: 0")).toBeVisible();
  await expect(page.getByLabel("القوائم: 1")).toBeVisible();
  await expect(page.getByText("متوسط التقييم")).toHaveCount(0);
});

test("profile edit dialog opens from both entry points validates and updates in place", async ({
  page
}) => {
  await mockProfileApi(page, {
    bio: null,
    displayName: "تركي العتيبي",
    ratings: []
  });

  await page.goto("/profile");

  await page.getByRole("button", { name: "تعديل الملف الشخصي" }).click();
  await expect(page.getByRole("dialog", { name: "تعديل الملف الشخصي" })).toBeVisible();
  await page.getByLabel("الاسم").fill("   ");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText("الاسم مطلوب")).toBeVisible();

  await page.getByLabel("الاسم").fill("  نورة   السجل  ");
  await page.getByLabel("البايو").fill("  أقيّم الأماكن الهادئة.  ");
  await page.getByRole("button", { name: "حفظ" }).click();

  await expect(page.getByRole("dialog", { name: "تعديل الملف الشخصي" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 2, name: "نورة السجل" })).toBeVisible();
  await expect(page.getByText("أقيّم الأماكن الهادئة.")).toBeVisible();

  await page.getByRole("button", { name: "إجراءات صفحتي" }).click();
  await page.getByRole("menuitem", { name: "تعديل الملف الشخصي" }).click();
  await expect(page.getByRole("dialog", { name: "تعديل الملف الشخصي" })).toBeVisible();
  await expect(page.getByLabel("الاسم")).toHaveValue("نورة السجل");
  await page.getByRole("button", { name: "إغلاق تعديل الملف الشخصي" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "نورة السجل" })).toBeVisible();
});

async function mockProfileApi(page: Page, options: MockProfileOptions) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });

  let currentProfile = profilePayload(options);

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
      if (route.request().method() === "PATCH") {
        const payload = route.request().postDataJSON() as {
          bio?: string;
          displayName?: string;
        };
        currentProfile = {
          ...currentProfile,
          bio: payload.bio?.trim() || null,
          displayName: payload.displayName?.trim().replace(/\s+/g, " ") ?? currentProfile.displayName
        };
      }

      return route.fulfill({
        body: JSON.stringify(currentProfile),
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

function profilePayload({
  averageRating,
  bio = null,
  displayName = "تركي العتيبي",
  ratings = []
}: MockProfileOptions) {
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
  const computedAverage =
    userRatings.length > 0
      ? Number(
          (userRatings.reduce((total, rating) => total + rating.rating, 0) / userRatings.length).toFixed(1)
        )
      : null;

  return {
    averageRating: averageRating === undefined ? computedAverage : averageRating,
    bio,
    displayName,
    listsCount: 1,
    listCount: 1,
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
    ratingsCount: userRatings.length,
    ratingsCreatedCount: userRatings.length,
    userRatings
  };
}
