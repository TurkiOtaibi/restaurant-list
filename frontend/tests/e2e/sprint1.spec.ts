import { expect, Page, Route, test } from "@playwright/test";

const apiPattern = "**/api/v1/**";

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

type MockState = {
  places: Place[];
  lists: ListDetail[];
};

const timestamp = "2026-06-18T00:00:00.000Z";

function place(id: string, name: string, type: Place["type"] = "restaurant"): Place {
  return {
    id,
    name,
    type,
    subtype: type === "restaurant" ? "burger" : type === "cafe" ? "coffee" : null,
    description: null,
    createdByUserId: "user-1",
    createdAt: timestamp,
    updatedAt: timestamp,
    averageRating: null,
    ratingCount: 0,
    currentUserRating: null,
    currentUserTried: false,
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
async function installApiMock(page: Page, initialState?: Partial<MockState>) {
  const state: MockState = {
    places: initialState?.places ?? [],
    lists: initialState?.lists ?? []
  };

  await page.route(apiPattern, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = apiPath(url.pathname);

    if (path === "/auth/register" && method === "POST") {
      return fulfillJson(route, 201, {
        user: { id: "user-1", email: "new@example.com" },
        accessToken: "access-token"
      });
    }

    if (path === "/auth/login" && method === "POST") {
      return fulfillJson(route, 200, {
        user: { id: "user-1", email: "new@example.com" },
        accessToken: "access-token"
      });
    }

    if (path === "/auth/refresh" && method === "POST") {
      return fulfillJson(route, 200, {
        accessToken: "access-token"
      });
    }

    if (path === "/places" && method === "GET") {
      return fulfillJson(route, 200, state.places);
    }

    if (path === "/places" && method === "POST") {
      const payload = request.postDataJSON() as { name: string; type: Place["type"] };
      const normalizedName = payload.name.trim().replace(/\s+/g, " ");
      const duplicate = state.places.some(
        (candidate) => candidate.name.toLowerCase() === normalizedName.toLowerCase()
      );

      if (duplicate) {
        return fulfillJson(route, 409, {
          detail: {
            code: "DUPLICATE_PLACE_NAME",
            message: "Place name already exists."
          }
        });
      }

      const created = place(`place-${state.places.length + 1}`, normalizedName, payload.type);
      state.places.push(created);
      return fulfillJson(route, 201, created);
    }

    if (path === "/lists" && method === "GET") {
      if (request.headers().authorization === "Bearer expired-token") {
        return fulfillJson(route, 401, {
          detail: { code: "INVALID_TOKEN", message: "Token is invalid or expired." }
        });
      }

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

    if (path === "/lists" && method === "POST") {
      const payload = request.postDataJSON() as { name: string };
      const created: ListDetail = {
        id: `list-${state.lists.length + 1}`,
        userId: "user-1",
        name: payload.name,
        visibility: "private",
        createdAt: timestamp,
        updatedAt: timestamp,
        items: []
      };
      state.lists.push(created);
      return fulfillJson(route, 201, created);
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

    const itemMatch = path.match(/^\/lists\/([^/]+)\/items\/([^/]+)$/);
    if (itemMatch && method === "DELETE") {
      const list = state.lists.find((candidate) => candidate.id === itemMatch[1]);
      if (list) {
        list.items = list.items.filter((item) => item.place.id !== itemMatch[2]);
      }
      return fulfillJson(route, 200, { deleted: true });
    }

    return fulfillJson(route, 404, { detail: "Unhandled mock route." });
  });

  return state;
}

test("rejects list access without authentication", async ({ page }) => {
  await page.goto("/lists");

  await expect(page.getByText("سجّل الدخول لعرض قوائمك.")).toBeVisible();
});

test("registers and redirects to lists", async ({ page }) => {
  await installApiMock(page);

  await page.goto("/register");
  await page.getByLabel("البريد الإلكتروني").fill("new@example.com");
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.getByRole("button", { name: "إنشاء حساب" }).click();

  await expect(page).toHaveURL(/\/lists$/);
  await expect(page.getByRole("heading", { name: "قوائمي" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("restaurantWishlist.refreshToken")))
    .toBeNull();
});

test("logs in and redirects to lists", async ({ page }) => {
  await installApiMock(page);

  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill("new@example.com");
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();

  await expect(page).toHaveURL(/\/lists$/);
  await expect(page.getByRole("heading", { name: "قوائمي" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("restaurantWishlist.refreshToken")))
    .toBeNull();
});

test("refreshes an expired access token without storing refresh token in localStorage", async ({
  page
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.accessToken", "expired-token");
  });
  await installApiMock(page);

  await page.goto("/lists");

  await expect(page.getByRole("heading", { name: "قوائمي" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("restaurantWishlist.accessToken")))
    .toBe("access-token");
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("restaurantWishlist.refreshToken")))
    .toBeNull();
});

test("creates a place and rejects a duplicate place", async ({ page }) => {
  await setAuthenticated(page);
  await installApiMock(page);

  await page.goto("/places/new?type=cafe");
  await page.getByLabel("اسم المكان").fill("Nara Cafe");
  await page.getByLabel("مقهى").click();
  await page.getByRole("button", { name: "حفظ المكان" }).click();

  await expect(page.getByText("حفظنا")).toBeVisible();
  await expect(page.getByText("Nara Cafe")).toBeVisible();

  await page.getByLabel("اسم المكان").fill("nara cafe");
  await page.getByLabel("مطعم").click();
  await page.getByRole("button", { name: "حفظ المكان" }).click();

  await expect(page.getByText("هذا المكان موجود بالفعل في مكتبة الأماكن.")).toBeVisible();
});

test("creates a list and treats duplicate place adds as already saved", async ({ page }) => {
  await setAuthenticated(page);
  await installApiMock(page, {
    places: [place("place-1", "Nara Cafe", "cafe")]
  });

  await page.goto("/lists/new");
  await page.getByLabel("اسم القائمة").fill("Weekend picks");
  await page.getByRole("button", { name: "حفظ القائمة" }).click();

  await expect(page).toHaveURL(/\/lists\/list-1$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Weekend picks" })).toBeVisible();

  await page.getByRole("button", { name: "أضف مكان" }).first().click();
  await page.getByLabel("ابحث باسم المكان").fill("Nara");
  await page.getByRole("button", { name: "أضف" }).click();

  await expect(page.getByRole("heading", { name: "Nara Cafe" })).toBeVisible();
  await expect(page.getByRole("button", { name: "موجود" })).toBeDisabled();
});
