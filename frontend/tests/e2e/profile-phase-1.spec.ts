import { expect, test, type Page } from "@playwright/test";

const now = new Date().toISOString();

type MockFavoriteSource = {
  userRatings: Array<{
    place: {
      id: string;
      imageUrl: string | null;
      name: string;
      subtype: string | null;
      type: string;
    };
    rating: number;
  }>;
};

type MockProfileOptions = {
  averageRating?: number | null;
  bio?: string | null;
  displayName?: string;
  favoritePlaceIds?: string[];
  ratings?: Array<{
    id: string;
    imageUrl?: string | null;
    name: string;
    rating: number;
    type: "restaurant" | "cafe";
  }>;
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
  await expect(page.getByRole("heading", { level: 2, name: "آخر الأماكن التي قيّمتها" })).toBeVisible();
  await expect(page.getByRole("link", { name: "عرض كل الأماكن التي قيّمتها" })).toHaveAttribute(
    "href",
    "/profile/ratings"
  );
  await expect(page.getByRole("heading", { level: 2, name: "قوائمي" })).toBeVisible();
  await expect(page.getByRole("link", { name: "عرض القوائم" })).toHaveAttribute("href", "/lists");

  await page.getByRole("button", { name: "إجراءات صفحتي" }).click();
  await expect(page.getByRole("menuitem", { name: "تعديل الملف الشخصي" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "تسجيل الخروج" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Reviews");
  await expect(page.locator("body")).not.toContainText("قريبًا");
  await expect(page.getByRole("heading", { level: 2, name: "المفضلة" })).toBeVisible();
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

test("profile ratings preview is capped and full archive route keeps all ratings", async ({
  page
}) => {
  await mockProfileApi(page, {
    ratings: [
      { id: "r1", name: "مكان أول", rating: 9, type: "restaurant" },
      { id: "r2", name: "مكان ثاني", rating: 8, type: "cafe" },
      { id: "r3", name: "مكان ثالث", rating: 7, type: "restaurant" },
      { id: "r4", name: "مكان رابع", rating: 6, type: "cafe" },
      { id: "r5", name: "مكان خامس", rating: 5, type: "restaurant" }
    ]
  });

  await page.goto("/profile");

  await expect(page.getByRole("heading", { level: 2, name: "آخر الأماكن التي قيّمتها" })).toBeVisible();
  await expect(page.locator(".profile-rating-card--preview")).toHaveCount(4);
  await expect(page.getByText("مكان خامس")).toHaveCount(0);
  await expect(page.getByText("ملاحظتك الخاصة")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "عرض كل الأماكن التي قيّمتها" })).toHaveAttribute(
    "href",
    "/profile/ratings"
  );

  await page.goto("/profile/ratings");

  await expect(page.getByRole("heading", { level: 2, name: "الأماكن التي قيّمتها" })).toBeVisible();
  await expect(page.locator(".profile-rating-card")).toHaveCount(5);
  await expect(page.getByText("مكان خامس")).toBeVisible();
  await expect(page.getByRole("link", { name: "العودة إلى صفحتي" })).toHaveAttribute("href", "/profile");
});

test("profile ActionMenu wraps keyboard focus across multiple items", async ({ page }) => {
  await mockProfileApi(page, { ratings: [] });

  await page.goto("/profile");

  const trigger = page.getByRole("button", { name: "إجراءات صفحتي" });
  const editItem = page.getByRole("menuitem", { name: "تعديل الملف الشخصي" });
  const logoutItem = page.getByRole("menuitem", { name: "تسجيل الخروج" });

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(editItem).toBeFocused();
  await expect(page.getByRole("menu")).toBeVisible();

  await page.keyboard.press("ArrowUp");
  await expect(logoutItem).toBeFocused();
  await expect(page.getByRole("menu")).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await expect(editItem).toBeFocused();
  await expect(page.getByRole("menu")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("profile ActionMenu closes on Tab without executing an action", async ({ page }) => {
  await mockProfileApi(page, { ratings: [] });

  await page.goto("/profile");

  const trigger = page.getByRole("button", { name: "إجراءات صفحتي" });
  const editItem = page.getByRole("menuitem", { name: "تعديل الملف الشخصي" });

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(editItem).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/profile$/);
});

test("profile shows a friendly empty ratings state", async ({ page }) => {
  await mockProfileApi(page, { ratings: [] });

  await page.goto("/profile");

  await expect(page.getByRole("heading", { level: 2, name: "آخر الأماكن التي قيّمتها" })).toBeVisible();
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

test("profile favorites strip renders four manual favorites in order", async ({ page }) => {
  await mockProfileApi(page, {
    favoritePlaceIds: ["r3", "r1", "r4", "r2"],
    ratings: favoriteRatings()
  });

  await page.goto("/profile");

  await expect(page.getByRole("heading", { level: 2, name: "المفضلة" })).toBeVisible();
  const favorites = page.getByLabel("الأماكن المفضلة");
  await expect(favorites.getByRole("link")).toHaveCount(4);
  await expect(favorites.getByRole("link").nth(0)).toContainText("مفضل ثالث");
  await expect(favorites.getByRole("link").nth(1)).toContainText("مفضل أول");
  await expect(favorites.getByRole("link").nth(2)).toContainText("مفضل رابع");
  await expect(favorites.getByRole("link").nth(3)).toContainText("مفضل ثاني");
  await expect(favorites.getByRole("link").nth(0)).toHaveAttribute("href", "/places/place-r3");
  await expect(favorites.getByRole("link").nth(0).locator("img")).toHaveAttribute(
    "src",
    /favorite-r3/
  );
  await expect(favorites.getByRole("link").nth(1).locator(".ds-type-icon")).toBeVisible();
  await expect(favorites.getByText("9/10")).toBeVisible();
});

test("profile favorites empty states distinguish rated and unrated profiles", async ({ page }) => {
  await mockProfileApi(page, {
    ratings: favoriteRatings().slice(0, 1)
  });

  await page.goto("/profile");

  await expect(page.locator(".profile-favorite-placeholder")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "أضف مفضلتك الأولى" })).toBeVisible();

  await mockProfileApi(page, { ratings: [] });
  await page.goto("/profile");

  await expect(page.locator(".profile-favorite-placeholder")).toHaveCount(4);
  await expect(page.getByText("قيّم أماكن أولًا لتضيفها إلى المفضلة.")).toBeVisible();
  await expect(page.getByRole("button", { name: "أضف مفضلتك الأولى" })).toHaveCount(0);
});

test("profile favorites picker searches limits reorders and updates the strip", async ({ page }) => {
  await mockProfileApi(page, {
    ratings: favoriteRatings()
  });

  await page.goto("/profile");
  const searchInput = page.locator("#favorite-search");

  await page.getByRole("button", { name: "أضف مفضلتك الأولى" }).click();
  await expect(page.getByRole("dialog", { name: "تعديل المفضلة" })).toBeVisible();
  await page.getByLabel("البحث في الأماكن التي قيّمتها").fill("خامس");
  await expect(page.getByRole("checkbox", { name: /مفضل خامس/ })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /مفضل أول/ })).toHaveCount(0);

  await page.getByLabel("البحث في الأماكن التي قيّمتها").fill("");
  const firstFavorite = page.getByRole("checkbox", { name: /مفضل أول/ });
  await searchInput.fill("temporary");
  await searchInput.press("Escape");
  await expect(page.locator(".profile-favorites-dialog")).toHaveCount(0);
  await page.locator(".profile-favorites-empty button").click();
  await expect(searchInput).toHaveValue("");

  await expect(firstFavorite).toHaveAttribute("aria-checked", "false");
  await firstFavorite.focus();
  await page.keyboard.press("Space");
  await expect(firstFavorite).toHaveAttribute("aria-checked", "true");

  const secondFavorite = page.getByRole("checkbox", { name: /مفضل ثاني/ });
  await secondFavorite.click();
  await expect(secondFavorite).toHaveAttribute("aria-checked", "true");
  await secondFavorite.click();
  await expect(secondFavorite).toHaveAttribute("aria-checked", "false");
  await secondFavorite.click();
  await expect(secondFavorite).toHaveAttribute("aria-checked", "true");

  for (const name of ["مفضل ثالث", "مفضل رابع"]) {
    await page.getByRole("checkbox", { name: new RegExp(name) }).click();
  }
  await expect(page.getByText("اخترت 4 من 4")).toBeVisible();
  await page.getByRole("checkbox", { name: /مفضل خامس/ }).click();
  await expect(page.getByText("يمكنك اختيار ٤ أماكن كحد أقصى.")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /مفضل خامس/ })).toHaveAttribute(
    "aria-checked",
    "false"
  );

  await page.getByRole("button", { name: /ارفع مفضل رابع/ }).click();
  await page.getByRole("button", { name: "حفظ المفضلة" }).click();

  await expect(page.getByRole("dialog", { name: "تعديل المفضلة" })).toHaveCount(0);
  const favorites = page.getByLabel("الأماكن المفضلة");
  await expect(favorites.getByRole("link")).toHaveCount(4);
  await expect(favorites.getByRole("link").nth(0)).toContainText("مفضل أول");
  await expect(favorites.getByRole("link").nth(1)).toContainText("مفضل ثاني");
  await expect(favorites.getByRole("link").nth(2)).toContainText("مفضل رابع");
  await expect(favorites.getByRole("link").nth(3)).toContainText("مفضل ثالث");
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

    if (path === "/profile/favorites" && route.request().method() === "PUT") {
      const payload = route.request().postDataJSON() as { placeIds: string[] };
      currentProfile = {
        ...currentProfile,
        favoritePlaces: payload.placeIds.map((placeId) => favoriteFromRating(currentProfile, placeId))
      };
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
  favoritePlaceIds = [],
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
      currentUserIsCreator: true,
      currentUserRating: rating.rating,
      description: null,
      id: `place-${rating.id}`,
      imageUrl: rating.imageUrl ?? null,
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
    favoritePlaces: favoritePlaceIds.map((placeId) =>
      favoriteFromRating({ userRatings }, `place-${placeId}`)
    ),
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
    userRatings,
    wishlist: null
  };
}

function favoriteRatings() {
  return [
    { id: "r1", imageUrl: null, name: "مفضل أول", rating: 8, type: "restaurant" as const },
    { id: "r2", name: "مفضل ثاني", rating: 7.5, type: "cafe" as const },
    {
      id: "r3",
      imageUrl:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%230f8f59'/%3E%3C/svg%3E#favorite-r3",
      name: "مفضل ثالث",
      rating: 9,
      type: "restaurant" as const
    },
    { id: "r4", name: "مفضل رابع", rating: 8.5, type: "cafe" as const },
    { id: "r5", name: "مفضل خامس", rating: 6, type: "restaurant" as const }
  ];
}

function favoriteFromRating(
  profile: MockFavoriteSource,
  placeId: string
) {
  const rating = profile.userRatings.find((item) => item.place.id === placeId);
  if (!rating) {
    throw new Error(`Missing mocked rating for favorite ${placeId}`);
  }

  return {
    id: rating.place.id,
    imageUrl: rating.place.imageUrl,
    name: rating.place.name,
    rating: rating.rating,
    subtype: rating.place.subtype,
    type: rating.place.type
  };
}
