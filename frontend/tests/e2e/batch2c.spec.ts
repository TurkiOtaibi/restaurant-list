import { expect, Page, Route, test } from "@playwright/test";

const apiPattern = "**/api/v1/**";
const timestamp = "2026-06-19T00:00:00.000Z";

type Place = {
  id: string;
  name: string;
  type: "restaurant" | "cafe" | "ice_cream";
  subtype: string | null;
  description: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
  ratingCount: number;
  currentUserRating: number | null;
  currentUserTried: boolean;
  currentUserListIds: string[];
  currentUserListNames: string[];
  currentUserListCount: number;
};

type ListDetail = {
  id: string;
  userId: string;
  name: string;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
  items: Array<{ id: string; place: Place; createdAt: string }>;
};

type Rating = {
  id: string;
  userId: string;
  placeId: string;
  rating: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type MockState = {
  lists: ListDetail[];
  places: Place[];
  ratings: Rating[];
};

function makePlace(
  id: string,
  name: string,
  type: Place["type"],
  rating: number | null = null
): Place {
  return {
    id,
    name,
    type,
    subtype: type === "restaurant" ? "burger" : type === "cafe" ? "coffee" : null,
    description: null,
    createdByUserId: "user-1",
    createdAt: timestamp,
    updatedAt: timestamp,
    averageRating: rating,
    ratingCount: rating ? 1 : 0,
    currentUserRating: rating,
    currentUserTried: rating !== null,
    currentUserListIds: [],
    currentUserListNames: [],
    currentUserListCount: 0
  };
}

function makeList(
  id: string,
  name: string,
  visibility: "public" | "private",
  items: ListDetail["items"] = [],
  userId = "user-1"
): ListDetail {
  return {
    id,
    userId,
    name,
    visibility,
    createdAt: timestamp,
    updatedAt: timestamp,
    items
  };
}

async function setAuthenticated(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.accessToken", "access-token");
  });
}

async function fulfillJson(route: Route, status: number, body: unknown) {
  const responseBody = Array.isArray(body)
    ? { data: body, meta: { limit: 100, offset: 0, total: body.length, sort: "created_at_desc" } }
    : body;

  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(responseBody)
  });
}

function apiPath(path: string): string {
  return path.replace(/^\/api\/v1(?=\/)/, "");
}

async function installApiMock(page: Page, initialState?: Partial<MockState>) {
  const state: MockState = {
    lists: initialState?.lists ?? [],
    places: initialState?.places ?? [],
    ratings: initialState?.ratings ?? []
  };

  await page.route(apiPattern, async (route) => {
    const request = route.request();
    const path = apiPath(new URL(request.url()).pathname);
    const method = request.method();

    if (path === "/profile" && method === "GET") {
      return fulfillJson(route, 200, {
        listCount: state.lists.length,
        triedRestaurantCount: state.ratings.filter((rating) => {
          const place = state.places.find((candidate) => candidate.id === rating.placeId);
          return place?.type === "restaurant";
        }).length,
        triedCafeCount: state.ratings.filter((rating) => {
          const place = state.places.find((candidate) => candidate.id === rating.placeId);
          return place?.type === "cafe";
        }).length,
        ratingsCreatedCount: state.ratings.length,
        userRatings: state.ratings.map((rating) => ({
          ...rating,
          place: state.places.find((place) => place.id === rating.placeId)
        })),
        triedPlaces: state.ratings
          .map((rating) => state.places.find((place) => place.id === rating.placeId))
          .filter(Boolean)
      });
    }

    if (path === "/lists" && method === "GET") {
      return fulfillJson(
        route,
        200,
        state.lists
          .filter((list) => list.userId === "user-1")
          .map((list) => ({
            id: list.id,
            userId: list.userId,
            name: list.name,
            visibility: list.visibility,
            placeCount: list.items.length,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt
          }))
      );
    }

    if (path === "/lists/public" && method === "GET") {
      return fulfillJson(
        route,
        200,
        state.lists
          .filter((list) => list.visibility === "public")
          .map((list) => ({
            id: list.id,
            userId: list.userId,
            name: list.name,
            visibility: list.visibility,
            placeCount: list.items.length,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt
          }))
      );
    }

    const publicListMatch = path.match(/^\/lists\/public\/([^/]+)$/);
    if (publicListMatch && method === "GET") {
      const found = state.lists.find(
        (list) => list.id === publicListMatch[1] && list.visibility === "public"
      );
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "List not found." });
    }

    const ownerListMatch = path.match(/^\/lists\/([^/]+)$/);
    if (ownerListMatch && method === "GET") {
      const found = state.lists.find(
        (list) => list.id === ownerListMatch[1] && list.userId === "user-1"
      );
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "List not found." });
    }

    return fulfillJson(route, 404, { detail: "Unhandled mock route." });
  });

  return state;
}

async function expectNoEscapedUnicode(page: Page) {
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\\u[0-9a-fA-F]{4}/);
  expect(text).not.toMatch(/[طظ][\u00A0-\u00FF\u0192\u061B\u0679\u06BE\u201A-\u202E]/);
  expect(text).toMatch(/[\u0600-\u06FF]/);
}

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.client);
}

test("profile renders as a personal taste archive, not account settings", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  const restaurant = makePlace("place-1", "بيت الورد", "restaurant", 8);
  const cafe = makePlace("place-2", "Nara Cafe", "cafe", 9);
  await installApiMock(page, {
    places: [restaurant, cafe],
    ratings: [
      {
        id: "rating-1",
        userId: "user-1",
        placeId: restaurant.id,
        rating: 8,
        notes: "جلسة هادئة",
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        id: "rating-2",
        userId: "user-1",
        placeId: cafe.id,
        rating: 9,
        notes: null,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ],
    lists: [
      makeList("list-1", "ليالي الرياض", "public", [
        { id: "item-1", place: restaurant, createdAt: timestamp }
      ]),
      makeList("list-2", "خاص", "private")
    ]
  });

  await page.goto("/profile");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "ملفي" })).toBeVisible();
  await expect(page.getByText("أرشيف ذوقك")).toBeVisible();
  await expect(page.getByText("مطاعم مجربة")).toBeVisible();
  await expect(page.getByText("مقاهٍ مجربة")).toBeVisible();
  await expect(page.getByRole("heading", { name: "أماكن صارت جزءًا من ذوقك" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "الدرجات والملاحظات الخاصة" })).toBeVisible();
  await expect(page.getByText("ملاحظتك الخاصة")).toBeVisible();
  await expect(page.getByText("جلسة هادئة")).toBeVisible();
  await expect(page.getByRole("heading", { name: "ما يظهر للآخرين من قوائمك" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ليالي الرياض" })).toBeVisible();
  await expect(page.getByText("Account")).toHaveCount(0);
  await expect(page.getByText("Followers")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);
});

test("my lists exposes public lists as a secondary surface, not top-level navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  await installApiMock(page, {
    lists: [makeList("list-1", "ليالي الرياض", "public")]
  });

  await page.goto("/lists");

  await expect(page.getByRole("heading", { name: "قوائمي" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "القوائم العامة" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "التنقل الرئيسي" }).getByText("القوائم العامة")).toHaveCount(0);
  const publicListsLink = page.getByRole("link", { name: "افتح القوائم العامة" });
  await expect(publicListsLink).toHaveAttribute("href", "/lists/public");
  await page.goto("/lists/public", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/lists\/public$/);
});

test("public lists are authenticated, secondary, and not discovery surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  const place = makePlace("place-1", "Nara Cafe", "cafe", 8);
  await installApiMock(page, {
    places: [place],
    lists: [
      makeList(
        "list-1",
        "Public picks",
        "public",
        [{ id: "item-1", place, createdAt: timestamp }],
        "owner-1"
      )
    ]
  });

  await page.goto("/lists/public");

  await expect(page.getByRole("heading", { name: "القوائم العامة" })).toBeVisible();
  await expect(page.getByText("المستخدمون المسجلون فقط")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public picks" })).toBeVisible();
  await expect(page.getByText("مكان واحد")).toBeVisible();
  await expect(page.getByText("Trending")).toHaveCount(0);
  await expect(page.getByText("توصيات")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);
});

test("public list detail is read-only and never exposes private notes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  const place = makePlace("place-1", "Nara Cafe", "cafe", 8);
  await installApiMock(page, {
    places: [place],
    lists: [
      makeList(
        "list-1",
        "Public picks",
        "public",
        [{ id: "item-1", place, createdAt: timestamp }],
        "owner-1"
      )
    ]
  });

  await page.goto("/lists/public/list-1");

  await expect(page.getByRole("heading", { name: "Public picks" })).toBeVisible();
  await expect(page.getByText("عرض فقط")).toBeVisible();
  await expect(page.getByText("لا تظهر هنا ملاحظات خاصة")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nara Cafe" })).toBeVisible();
  await expect(page.getByRole("link", { name: "افتح المكان" })).toBeVisible();
  await expect(page.getByText("ملاحظتك الخاصة")).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "عام" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "أضف مكان" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);
});

test("guest access to public lists is rejected", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installApiMock(page);

  await page.goto("/lists/public");

  await expect(page.getByText("سجّل الدخول لعرض القوائم العامة.")).toBeVisible();
  await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "القوائم العامة" })).toBeVisible();
});
