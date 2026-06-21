import { expect, Page, Route, test } from "@playwright/test";

const apiPattern = "**/api/v1/**";
const timestamp = "2026-06-20T00:00:00.000Z";

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

function makePlace(
  id: string,
  name: string,
  type: Place["type"],
  subtype: string | null,
  rating?: { averageRating: number; ratingCount: number }
): Place {
  return {
    id,
    name,
    type,
    subtype,
    description: null,
    createdByUserId: "user-1",
    createdAt: timestamp,
    updatedAt: timestamp,
    averageRating: rating?.averageRating ?? null,
    ratingCount: rating?.ratingCount ?? 0,
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

async function installApiMock(page: Page) {
  const places = [
    makePlace("place-1", "ماكدونالدز", "restaurant", "burger", {
      averageRating: 8.4,
      ratingCount: 124
    }),
    makePlace("place-2", "مقهى صباح", "cafe", "coffee"),
    makePlace("place-3", "آيس كريم", "ice_cream", null)
  ];

  await page.route(apiPattern, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\/v1(?=\/)/, "");
    const method = request.method();

    if (path === "/auth/refresh" && method === "POST") {
      return fulfillJson(route, 200, { accessToken: "access-token" });
    }

    if (path === "/places" && method === "GET") {
      const type = url.searchParams.get("type");
      const query = url.searchParams.get("q")?.trim().toLowerCase();
      const filtered = places.filter((place) => {
        const typeMatches = !type || place.type === type;
        const queryMatches = !query || place.name.toLowerCase().includes(query);
        return typeMatches && queryMatches;
      });
      return fulfillJson(route, 200, filtered);
    }

    if (path === "/places" && method === "POST") {
      const payload = request.postDataJSON() as {
        name: string;
        subtype?: string | null;
        type: Place["type"];
      };
      const created = makePlace(
        `place-${places.length + 1}`,
        payload.name,
        payload.type,
        payload.type === "ice_cream" ? null : payload.subtype ?? null
      );
      places.push(created);
      return fulfillJson(route, 201, created);
    }

    if (path === "/ratings" && method === "POST") {
      const payload = request.postDataJSON() as {
        placeId: string;
        rating: number;
        notes: string | null;
      };
      const ratedPlace = places.find((place) => place.id === payload.placeId);
      if (ratedPlace) {
        ratedPlace.averageRating = payload.rating;
        ratedPlace.currentUserRating = payload.rating;
        ratedPlace.currentUserTried = true;
        ratedPlace.ratingCount = Math.max(1, ratedPlace.ratingCount);
      }
      return fulfillJson(route, 201, {
        id: "rating-1",
        userId: "user-1",
        placeId: payload.placeId,
        rating: payload.rating,
        notes: payload.notes,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    const placeMatch = path.match(/^\/places\/([^/]+)$/);
    if (placeMatch && method === "GET") {
      const found = places.find((place) => place.id === placeMatch[1]);
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "Not found." });
    }

    if (path === "/lists" && method === "GET") {
      return fulfillJson(route, 200, [
        {
          id: "list-1",
          userId: "user-1",
          name: "قائمة الغداء",
          visibility: "private",
          placeCount: 0,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ]);
    }

    return fulfillJson(route, 404, { detail: "Unhandled mock route." });
  });
}

test.beforeEach(async ({ page }) => {
  await setAuthenticated(page);
  await installApiMock(page);
});

test("places navigation uses one tab with internal type filters", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/places");

  const nav = page.getByRole("navigation", { name: "التنقل الرئيسي" });
  await expect(nav.getByRole("link", { name: /الأماكن/ })).toBeVisible();
  await expect(nav.getByText("المطاعم")).toHaveCount(0);
  await expect(nav.getByText("المقاهي")).toHaveCount(0);

  await expect(page.getByRole("heading", { name: "الأماكن" })).toBeVisible();
  await expect(page.getByRole("button", { name: "المطاعم" })).toBeVisible();
  await expect(page.getByRole("button", { name: "المقاهي" })).toBeVisible();
  await expect(page.getByRole("button", { name: "الآيس كريم" })).toBeVisible();
});

test("place cards are simple links to detail", async ({ page }) => {
  await page.goto("/places?type=restaurant");

  await expect(page.getByText("ماكدونالدز")).toBeVisible();
  await expect(page.getByText("مطعم")).toBeVisible();
  await expect(page.getByText("برجر")).toBeVisible();
  await expect(page.getByText("8.4")).toBeVisible();
  await expect(page.getByText("124")).toBeVisible();
  await expect(page.getByRole("button", { name: "أضف إلى قائمة" })).toHaveCount(0);

  const placeCard = page.locator('a[href="/places/place-1"]');
  await expect(placeCard).toHaveAttribute("href", "/places/place-1");
  await page.goto("/places/place-1");
  await expect(page).toHaveURL(/\/places\/place-1$/);
  await expect(page.getByRole("button", { name: "أضف إلى قائمة" })).toBeVisible();
  await expect(page.getByRole("link", { name: "قيّم المكان" })).toBeVisible();
});

test("add place requires subtype only for restaurants and cafes", async ({ page }) => {
  await page.goto("/places/new?type=restaurant");
  await page.getByLabel("اسم المكان").fill("مطعم جديد");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText("نوع المطعم مطلوب.")).toBeVisible();
  await page.getByLabel("نوع المطعم").selectOption("burger");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText("تم حفظ المكان.")).toBeVisible();

  await page.goto("/places/new?type=cafe");
  await page.getByLabel("اسم المكان").fill("مقهى جديد");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText("نوع المقهى مطلوب.")).toBeVisible();

  await page.goto("/places/new?type=ice_cream");
  await expect(page.getByLabel("نوع المطعم")).toHaveCount(0);
  await expect(page.getByLabel("نوع المقهى")).toHaveCount(0);
  await page.getByLabel("اسم المكان").fill("آيس كريم جديد");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText("تم حفظ المكان.")).toBeVisible();
});

test("visible UI removes banned copy and has no mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/places");

  const bodyText = await page.locator("body").innerText();
  for (const banned of [
    "ذوق",
    "رف",
    "رفوف",
    "يستحق",
    "علاقتك",
    "علاقة",
    "ينتظر سببًا",
    "ليست مجرد"
  ]) {
    expect(bodyText).not.toContain(banned);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("rating supports half steps and visible UI uses western numerals", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/places/place-1/rate");

  const slider = page.getByRole("slider", { name: "تقييمك" });
  await slider.fill("8.5");

  await expect(page.getByText("8.5/10")).toBeVisible();
  await page.getByRole("button", { name: "حفظ التقييم" }).click();
  await expect(page.getByText("تم حفظ التقييم.")).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/[٠-٩۰-۹]/);
});
