import { expect, Page, Route, test } from "@playwright/test";

const apiPattern = "http://localhost:8000/**";
const timestamp = "2026-06-19T00:00:00.000Z";

type Place = {
  id: string;
  name: string;
  type: "restaurant" | "cafe";
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

type MockState = {
  lists: ListDetail[];
  places: Place[];
};

function makePlace(
  id: string,
  name: string,
  type: "restaurant" | "cafe",
  options: Partial<Pick<Place, "averageRating" | "currentUserRating" | "currentUserTried" | "ratingCount" | "currentUserListIds" | "currentUserListNames" | "currentUserListCount">> = {}
): Place {
  return {
    id,
    name,
    type,
    description: null,
    createdByUserId: "user-1",
    createdAt: timestamp,
    updatedAt: timestamp,
    averageRating: options.averageRating ?? null,
    currentUserRating: options.currentUserRating ?? null,
    currentUserTried: options.currentUserTried ?? false,
    currentUserListIds: options.currentUserListIds ?? [],
    currentUserListNames: options.currentUserListNames ?? [],
    currentUserListCount: options.currentUserListCount ?? 0,
    ratingCount: options.ratingCount ?? 0
  };
}

function makeList(
  id: string,
  name: string,
  items: ListDetail["items"] = [],
  visibility: "public" | "private" = "private"
): ListDetail {
  return {
    id,
    userId: "user-1",
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
    places: initialState?.places ?? []
  };

  await page.route(apiPattern, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = apiPath(url.pathname);
    const method = request.method();

    if (path === "/places" && method === "GET") {
      const query = url.searchParams.get("q")?.trim().toLowerCase();
      const places = query
        ? state.places.filter((place) => place.name.toLowerCase().includes(query))
        : state.places;
      return fulfillJson(route, 200, places);
    }

    const placeMatch = path.match(/^\/places\/([^/]+)$/);
    if (placeMatch && method === "GET") {
      const found = state.places.find((place) => place.id === placeMatch[1]);
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "Place not found." });
    }

    if (path === "/places" && method === "POST") {
      const payload = request.postDataJSON() as { name: string; type: "restaurant" | "cafe" };
      const normalizedName = payload.name.trim().replace(/\s+/g, " ");
      const duplicate = state.places.some(
        (place) => place.name.toLowerCase() === normalizedName.toLowerCase()
      );

      if (duplicate) {
        return fulfillJson(route, 409, {
          detail: { code: "DUPLICATE_PLACE_NAME", message: "Place name already exists." }
        });
      }

      const created = makePlace(`place-${state.places.length + 1}`, normalizedName, payload.type);
      state.places.push(created);
      return fulfillJson(route, 201, created);
    }

    if (path === "/lists" && method === "GET") {
      return fulfillJson(
        route,
        200,
        state.lists.map((list) => ({
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

    const listMatch = path.match(/^\/lists\/([^/]+)$/);
    if (listMatch && method === "GET") {
      const found = state.lists.find((list) => list.id === listMatch[1]);
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "List not found." });
    }

    const itemCollectionMatch = path.match(/^\/lists\/([^/]+)\/items$/);
    if (itemCollectionMatch && method === "POST") {
      const list = state.lists.find((candidate) => candidate.id === itemCollectionMatch[1]);
      const payload = request.postDataJSON() as { placeId: string };
      const selectedPlace = state.places.find((candidate) => candidate.id === payload.placeId);

      if (!list || !selectedPlace) {
        return fulfillJson(route, 404, { detail: "Not found." });
      }

      const existingItem = list.items.find((item) => item.place.id === selectedPlace.id);
      if (existingItem) {
        return fulfillJson(route, 200, existingItem);
      }

      const item = {
        id: `item-${list.items.length + 1}`,
        place: selectedPlace,
        createdAt: timestamp
      };
      list.items.push(item);
      return fulfillJson(route, 201, item);
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

test("restaurants show places as personal taste artifacts, not a directory", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  const restaurant = makePlace("place-1", "بيت الورد", "restaurant", {
    averageRating: 8.6,
    currentUserRating: 8,
    currentUserTried: true,
    currentUserListIds: ["list-1"],
    currentUserListNames: ["ليالي الرياض"],
    currentUserListCount: 1,
    ratingCount: 12
  });
  const cafe = makePlace("place-2", "Nara Cafe", "cafe", { averageRating: 9.1, ratingCount: 8 });
  await installApiMock(page, {
    places: [restaurant, cafe],
    lists: [makeList("list-1", "ليالي الرياض", [{ id: "item-1", place: restaurant, createdAt: timestamp }])]
  });

  await page.goto("/restaurants");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "المطاعم" })).toBeVisible();
  await expect(page.getByText("محفوظ وجربته وقيّمته")).toBeVisible();
  await expect(page.getByRole("heading", { name: "بيت الورد" })).toBeVisible();
  await expect(page.getByText("Nara Cafe")).toHaveCount(0);
  await expect(page.getByText("محفوظ في رف واحد")).toBeVisible();
  await expect(page.getByText("جربته", { exact: true })).toBeVisible();
  await expect(page.getByText("تقييمك 8/10")).toBeVisible();
  await expect(page.getByText("12 تقييمات")).toBeVisible();
  await expect(page.locator("select")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);

  const relationshipLink = page.getByRole("link", { name: "راجع العلاقة" });
  await relationshipLink.scrollIntoViewIfNeeded();
  await expect(relationshipLink).toHaveAttribute("href", "/places/place-1");
  await page.goto("/places/place-1", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "بيت الورد" })).toBeVisible();
  await expect(page.getByText("إشاراتك الشخصية")).toBeVisible();
});

test("cafes use the shared library pattern without showing restaurants", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  await installApiMock(page, {
    places: [
      makePlace("place-1", "بيت الورد", "restaurant"),
      makePlace("place-2", "Nara Cafe", "cafe", { averageRating: 9.1, ratingCount: 8 })
    ],
    lists: []
  });

  await page.goto("/cafes");

  await expect(page.getByRole("heading", { name: "المقاهي" })).toBeVisible();
  await expect(page.getByText("مقاهٍ تحتفظ بلحظتها")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nara Cafe" })).toBeVisible();
  await expect(page.getByText("بيت الورد")).toHaveCount(0);
  await expect(page.getByText("ينتظر سببًا للحفظ")).toBeVisible();
  await expect(page.getByText("لم تضف علاقتك به بعد")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);
});

test("place library search matches names only and keeps relationship context first", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  const savedRestaurant = makePlace("place-1", "بيت الورد", "restaurant", {
    averageRating: 8.6,
    currentUserRating: 8,
    currentUserTried: true,
    currentUserListIds: ["list-1"],
    currentUserListNames: ["ليالي الرياض"],
    currentUserListCount: 1,
    ratingCount: 12
  });
  await installApiMock(page, {
    places: [
      savedRestaurant,
      makePlace("place-2", "Quiet Table", "restaurant"),
      makePlace("place-3", "Nara Cafe", "cafe")
    ],
    lists: [
      makeList("list-1", "ليالي الرياض", [
        { id: "item-1", place: savedRestaurant, createdAt: timestamp }
      ])
    ]
  });

  await page.goto("/restaurants");

  await page.getByLabel("ابحث باسم مطعم").fill("الورد");
  await page.getByRole("button", { name: "ابحث" }).click();
  await expect(page.getByRole("status")).toContainText("نتيجة واحدة");
  await expect(page.getByRole("heading", { name: "بيت الورد" })).toBeVisible();
  await expect(page.getByText("محفوظ وجربته وقيّمته")).toBeVisible();
  await expect(page.getByText("Quiet Table")).toHaveCount(0);

  await page.getByLabel("ابحث باسم مطعم").fill("restaurant");
  await page.getByRole("button", { name: "ابحث" }).click();
  await expect(page.getByText("لا يوجد مطعم بهذا الاسم")).toBeVisible();
  await expect(page.getByText(/لا يعرض توصيات أو تصنيفات خارج الاسم/)).toBeVisible();
  await expect(page.getByText("Quiet Table")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);
});

test("add to list saves one place to one selected shelf", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  const restaurant = makePlace("place-1", "بيت الورد", "restaurant", {
    averageRating: 8.6,
    ratingCount: 12
  });
  await installApiMock(page, {
    places: [restaurant],
    lists: [makeList("list-1", "ليالي الرياض")]
  });

  await page.goto("/restaurants");
  await page.getByRole("button", { name: "حفظ في رف" }).click();
  await expect(page.getByRole("dialog", { name: "احفظ في رف" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ليالي الرياض" })).toBeVisible();
  await page.getByRole("button", { name: "احفظ هنا" }).click();
  await expect(page.getByText("حفظناه في ليالي الرياض.")).toBeVisible();
  await page.getByRole("button", { name: "إغلاق" }).click();
  await expect(page.getByLabel("علاقتك بهذا المكان").getByText("محفوظ في رف واحد")).toBeVisible();
});

test("create place uses Arabic modal or sheet and handles duplicates", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  await installApiMock(page);

  await page.goto("/places/new?type=cafe");

  await expect(page.getByRole("dialog", { name: "أضف مكانًا" })).toBeVisible();
  await expect(page.getByLabel("اسم المكان")).toBeFocused();
  await expect(page.getByLabel("مقهى")).toBeChecked();
  await expect(page.locator("select")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);

  await page.getByRole("button", { name: "حفظ المكان" }).click();
  await expect(page.getByText("اسم المكان مطلوب.")).toBeVisible();

  await page.getByLabel("اسم المكان").fill("Nara Cafe");
  await page.getByRole("button", { name: "حفظ المكان" }).click();
  await expect(page.getByText("حفظنا")).toBeVisible();
  await expect(page.getByText("Nara Cafe")).toBeVisible();

  await page.getByLabel("اسم المكان").fill("nara cafe");
  await page.getByLabel("مطعم").click();
  await page.getByRole("button", { name: "حفظ المكان" }).click();
  await expect(page.getByText("هذا المكان موجود بالفعل في مكتبة الأماكن.")).toBeVisible();
});
