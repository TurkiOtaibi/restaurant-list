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
  places: Place[];
  lists: ListDetail[];
  ratings: Rating[];
};

function makePlace(
  id: string,
  name: string,
  type: "restaurant" | "cafe" = "restaurant",
  currentUserRating: number | null = null
): Place {
  return {
    id,
    name,
    type,
    description: null,
    createdByUserId: "user-1",
    createdAt: timestamp,
    updatedAt: timestamp,
    averageRating: currentUserRating,
    ratingCount: currentUserRating ? 1 : 0,
    currentUserRating,
    currentUserTried: currentUserRating !== null,
    currentUserListIds: [],
    currentUserListNames: [],
    currentUserListCount: 0
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
  const selectedPlace = state.places.find((place) => place.id === placeId);
  if (!selectedPlace) {
    return;
  }
  selectedPlace.averageRating = rating;
  selectedPlace.ratingCount = 1;
  selectedPlace.currentUserRating = rating;
  selectedPlace.currentUserTried = true;
  selectedPlace.currentUserListIds = [];
  selectedPlace.currentUserListNames = [];
  selectedPlace.currentUserListCount = 0;
}

async function installApiMock(page: Page, initialState?: Partial<MockState>) {
  const state: MockState = {
    places: initialState?.places ?? [],
    lists: initialState?.lists ?? [],
    ratings: initialState?.ratings ?? []
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

    if (path === "/ratings" && method === "POST") {
      const payload = request.postDataJSON() as {
        placeId: string;
        rating: number;
        notes: string | null;
      };
      const existing = state.ratings.find((rating) => rating.placeId === payload.placeId);

      if (existing) {
        existing.rating = payload.rating;
        existing.notes = payload.notes;
        updatePlaceRating(state, payload.placeId, payload.rating);
        return fulfillJson(route, 201, existing);
      }

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
      state.lists.forEach((list) => {
        list.items = list.items.filter((item) => item.place.id !== payload.placeId);
      });
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

    if (path === "/profile" && method === "GET") {
      return fulfillJson(route, 200, {
        listCount: state.lists.length,
        triedRestaurantCount: state.ratings.filter((rating) => {
          const ratedPlace = state.places.find((place) => place.id === rating.placeId);
          return ratedPlace?.type === "restaurant";
        }).length,
        triedCafeCount: state.ratings.filter((rating) => {
          const ratedPlace = state.places.find((place) => place.id === rating.placeId);
          return ratedPlace?.type === "cafe";
        }).length,
        ratingsCreatedCount: state.ratings.length,
        userRatings: state.ratings.map((rating) => ({
          ...rating,
          place: state.places.find((place) => place.id === rating.placeId)
        })),
        triedPlaces: state.ratings.map((rating) =>
          state.places.find((place) => place.id === rating.placeId)
        )
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
      const found = state.lists.find((list) => list.id === ownerListMatch[1]);
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "List not found." });
    }

    const visibilityMatch = path.match(/^\/lists\/([^/]+)\/visibility$/);
    if (visibilityMatch && method === "PATCH") {
      const payload = request.postDataJSON() as { visibility: "public" | "private" };
      const found = state.lists.find((list) => list.id === visibilityMatch[1]);
      if (!found) {
        return fulfillJson(route, 404, { detail: "List not found." });
      }
      found.visibility = payload.visibility;
      return fulfillJson(route, 200, {
        id: found.id,
        userId: found.userId,
        name: found.name,
        visibility: found.visibility,
        placeCount: found.items.length,
        createdAt: found.createdAt,
        updatedAt: found.updatedAt
      });
    }

    return fulfillJson(route, 404, { detail: "Unhandled mock route." });
  });

  return state;
}

test("creates a rating and shows tried indicator", async ({ page }) => {
  await setAuthenticated(page);
  await installApiMock(page, {
    places: [makePlace("place-1", "Nara Cafe", "cafe")]
  });

  await page.goto("/places/place-1/rate");
  await expect(page.getByRole("dialog", { name: "قيّم تجربتك" })).toBeVisible();
  await page.getByLabel(/9 من 10/).check();
  await page.getByLabel("ملاحظتك الخاصة").fill("Quiet table");
  await page.getByRole("button", { name: "احفظ التقييم" }).click();

  await expect(page.getByText("حفظنا تقييمك. صار المكان مجربًا في ذوقك.")).toBeVisible();
  await expect(page.getByText("جربته")).toBeVisible();
  await expect(page.getByText("9.0")).toBeVisible();
});

test("updates an existing rating", async ({ page }) => {
  await setAuthenticated(page);
  await installApiMock(page, {
    places: [makePlace("place-1", "Nara Cafe", "cafe", 9)],
    ratings: [
      {
        id: "rating-1",
        userId: "user-1",
        placeId: "place-1",
        rating: 9,
        notes: "Quiet table",
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]
  });

  await page.goto("/places/place-1/rate");
  await expect(page.getByRole("dialog", { name: "قيّم تجربتك" })).toBeVisible();
  await page.getByLabel(/7 من 10/).check();
  await page.getByRole("button", { name: "حدّث التقييم" }).click();

  await expect(page.getByText("حفظنا تقييمك. صار المكان مجربًا في ذوقك.")).toBeVisible();
  await expect(page.getByText("تقييمك الحالي 7/10")).toBeVisible();
});

test("renders profile statistics and tried places", async ({ page }) => {
  await setAuthenticated(page);
  await installApiMock(page, {
    places: [makePlace("place-1", "Nara Cafe", "cafe", 8)],
    lists: [
      {
        id: "list-1",
        userId: "user-1",
        name: "Weekend",
        visibility: "private",
        createdAt: timestamp,
        updatedAt: timestamp,
        items: []
      }
    ],
    ratings: [
      {
        id: "rating-1",
        userId: "user-1",
        placeId: "place-1",
        rating: 8,
        notes: "Good",
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]
  });

  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "ملفي" })).toBeVisible();
  await expect(page.getByText("مقاهٍ مجربة")).toBeVisible();
  await expect(page.getByText("تقييمك 8/10").first()).toBeVisible();
  await expect(page.getByText("ملاحظتك الخاصة")).toBeVisible();
  await expect(page.getByText("Good")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nara Cafe", exact: true })).toBeVisible();
});

test("opens an authenticated public list", async ({ page }) => {
  await setAuthenticated(page);
  await installApiMock(page, {
    places: [makePlace("place-1", "Nara Cafe", "cafe", 8)],
    lists: [
      {
        id: "list-1",
        userId: "owner-1",
        name: "Public picks",
        visibility: "public",
        createdAt: timestamp,
        updatedAt: timestamp,
        items: [
          {
            id: "item-1",
            place: makePlace("place-1", "Nara Cafe", "cafe", 8),
            createdAt: timestamp
          }
        ]
      }
    ]
  });

  await page.goto("/lists/public");
  await expect(page.getByRole("heading", { name: "القوائم العامة" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public picks" })).toBeVisible();
  await page.goto("/lists/public/list-1");

  await expect(page).toHaveURL(/\/lists\/public\/list-1$/);
  await expect(page.getByRole("heading", { name: "Public picks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nara Cafe" })).toBeVisible();
  await expect(page.getByText("8.0 (1)")).toBeVisible();
});

test("changes owner list visibility", async ({ page }) => {
  await setAuthenticated(page);
  await installApiMock(page, {
    places: [],
    lists: [
      {
        id: "list-1",
        userId: "user-1",
        name: "Weekend",
        visibility: "private",
        createdAt: timestamp,
        updatedAt: timestamp,
        items: []
      }
    ]
  });

  await page.goto("/lists/list-1");
  await page.getByLabel("عام").click();

  await expect(page.getByText("تم تحديث ظهور القائمة إلى عام.")).toBeVisible();
});
