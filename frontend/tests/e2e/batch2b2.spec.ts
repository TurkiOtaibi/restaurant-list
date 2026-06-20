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
  options: Partial<Pick<Place, "averageRating" | "currentUserRating" | "currentUserTried" | "ratingCount" | "currentUserListIds" | "currentUserListNames" | "currentUserListCount">> = {}
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
    averageRating: options.averageRating ?? null,
    currentUserRating: options.currentUserRating ?? null,
    currentUserTried: options.currentUserTried ?? false,
    currentUserListIds: options.currentUserListIds ?? [],
    currentUserListNames: options.currentUserListNames ?? [],
    currentUserListCount: options.currentUserListCount ?? 0,
    ratingCount: options.ratingCount ?? 0
  };
}

function makeList(id: string, name: string, items: ListDetail["items"] = []): ListDetail {
  return {
    id,
    userId: "user-1",
    name,
    visibility: "private",
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

function updatePlaceRating(state: MockState, placeId: string, rating: number) {
  const place = state.places.find((candidate) => candidate.id === placeId);
  if (!place) {
    return;
  }

  place.averageRating = rating;
  place.ratingCount = Math.max(place.ratingCount, 1);
  place.currentUserRating = rating;
  place.currentUserTried = true;
  place.currentUserListIds = [];
  place.currentUserListNames = [];
  place.currentUserListCount = 0;
  state.lists.forEach((list) => {
    list.items = list.items.filter((item) => item.place.id !== placeId);
  });
}

async function installApiMock(page: Page, initialState: Partial<MockState>) {
  const state: MockState = {
    lists: initialState.lists ?? [],
    places: initialState.places ?? [],
    ratings: initialState.ratings ?? []
  };

  await page.route(apiPattern, async (route) => {
    const request = route.request();
    const path = apiPath(new URL(request.url()).pathname);
    const method = request.method();

    if (path === "/places" && method === "GET") {
      return fulfillJson(route, 200, state.places);
    }

    const placeMatch = path.match(/^\/places\/([^/]+)$/);
    if (placeMatch && method === "GET") {
      const found = state.places.find((place) => place.id === placeMatch[1]);
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "Place not found." });
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

    if (path === "/ratings" && method === "POST") {
      const payload = request.postDataJSON() as {
        placeId: string;
        rating: number;
        notes: string | null;
      };
      const created: Rating = {
        id: `rating-${state.ratings.length + 1}`,
        userId: "user-1",
        placeId: payload.placeId,
        rating: payload.rating,
        notes: payload.notes,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      state.ratings.push(created);
      updatePlaceRating(state, payload.placeId, payload.rating);
      return fulfillJson(route, 201, created);
    }

    const ratingMatch = path.match(/^\/ratings\/([^/]+)$/);
    if (ratingMatch && method === "PATCH") {
      const payload = request.postDataJSON() as { rating: number; notes: string | null };
      const existing = state.ratings.find((rating) => rating.placeId === ratingMatch[1]);
      if (!existing) {
        return fulfillJson(route, 404, { detail: "Rating not found." });
      }

      existing.rating = payload.rating;
      existing.notes = payload.notes;
      updatePlaceRating(state, existing.placeId, payload.rating);
      return fulfillJson(route, 200, existing);
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

test("place detail makes the user relationship more important than the place itself", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  const place = makePlace("place-1", "بيت الورد", "restaurant", {
    averageRating: 8.6,
    currentUserRating: 8,
    currentUserTried: true,
    currentUserListIds: ["list-1"],
    currentUserListNames: ["ليالي الرياض"],
    currentUserListCount: 1,
    ratingCount: 12
  });
  await installApiMock(page, {
    places: [place],
    lists: [makeList("list-1", "ليالي الرياض", [{ id: "item-1", place, createdAt: timestamp }])]
  });

  await page.goto("/places/place-1");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByText("محفوظ ومجرّب ومقيّم في ذوقك")).toBeVisible();
  await expect(page.getByRole("heading", { name: "بيت الورد" })).toBeVisible();
  await expect(page.getByText("إشاراتك الشخصية")).toBeVisible();
  await expect(page.getByText("ليالي الرياض")).toBeVisible();
  await expect(page.getByText("تقييمك 8/10").first()).toBeVisible();
  await expect(page.getByText("12 تقييمات")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);

  const bodyText = await page.locator("body").innerText();
  expect(bodyText.indexOf("محفوظ ومجرّب ومقيّم في ذوقك")).toBeLessThan(
    bodyText.indexOf("بيت الورد")
  );
});

test("rating creates tried status and removes the place from current shelves", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  const place = makePlace("place-1", "Nara Cafe", "cafe", { averageRating: 7.5, ratingCount: 4 });
  await installApiMock(page, {
    places: [place],
    lists: [makeList("list-1", "صباح هادئ", [{ id: "item-1", place, createdAt: timestamp }])]
  });

  await page.goto("/places/place-1/rate");
  await expect(page.getByRole("dialog", { name: "قيّم تجربتك" })).toBeVisible();
  await page.getByLabel(/8 من 10/).check();
  await page.getByLabel("ملاحظتك الخاصة").fill("طاولة هادئة");
  await page.getByRole("button", { name: "احفظ التقييم" }).click();

  await expect(page.getByText("حفظنا تقييمك. صار المكان مجربًا في ذوقك.")).toBeVisible();
  await expect(page.getByText("جربته")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);

  await page.getByRole("button", { name: "العودة لتفاصيل المكان" }).click();
  await expect(page).toHaveURL(/\/places\/place-1$/);
  await expect(page.getByText("جربته وقيّمته")).toBeVisible();
  await expect(page.getByText("تقييمك 8/10").first()).toBeVisible();
  await expect(page.getByText("ليس في رفوفك الآن")).toBeVisible();
});

test("rating update keeps tried status and uses update behavior", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  await installApiMock(page, {
    places: [
      makePlace("place-1", "بيت الورد", "restaurant", {
        averageRating: 6,
        currentUserRating: 6,
        currentUserTried: true,
        ratingCount: 1
      })
    ],
    ratings: [
      {
        id: "rating-1",
        userId: "user-1",
        placeId: "place-1",
        rating: 6,
        notes: null,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]
  });

  await page.goto("/places/place-1/rate");
  await page.getByLabel(/10 من 10/).check();
  await page.getByRole("button", { name: "حدّث التقييم" }).click();

  await expect(page.getByText("حفظنا تقييمك. صار المكان مجربًا في ذوقك.")).toBeVisible();
  await expect(page.getByText("تقييمك الحالي 10/10")).toBeVisible();
  await expect(page.getByText("جربته")).toBeVisible();
});
