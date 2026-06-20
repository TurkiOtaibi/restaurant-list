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

type MockState = {
  lists: ListDetail[];
  places: Place[];
};

function makePlace(id: string, name: string, type: Place["type"] = "restaurant"): Place {
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
    const path = apiPath(new URL(request.url()).pathname);
    const method = request.method();

    if ((path === "/auth/login" || path === "/auth/register") && method === "POST") {
      return fulfillJson(route, 200, {
        user: { id: "user-1", email: "new@example.com" },
        accessToken: "access-token"
      });
    }

    if (path === "/places" && method === "GET") {
      return fulfillJson(route, 200, state.places);
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

    if (path === "/lists" && method === "POST") {
      const payload = request.postDataJSON() as { name: string };
      const created = makeList(`list-${state.lists.length + 1}`, payload.name);
      state.lists.push(created);
      return fulfillJson(route, 201, {
        id: created.id,
        userId: created.userId,
        name: created.name,
        visibility: created.visibility,
        placeCount: created.items.length,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt
      });
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

    const listMatch = path.match(/^\/lists\/([^/]+)$/);
    if (listMatch && method === "GET") {
      const found = state.lists.find((list) => list.id === listMatch[1]);
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "List not found." });
    }

    return fulfillJson(route, 404, { detail: "Unhandled mock route." });
  });

  return state;
}

async function expectNoLegacyPanel(page: Page) {
  await expect(page.locator(".panel")).toHaveCount(0);
  await expect(page.locator(".panel-compact")).toHaveCount(0);
}

async function expectNoEscapedUnicode(page: Page) {
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\\u[0-9a-fA-F]{4}/);
  expect(text).not.toMatch(/[طظ][\u00A0-\u00FF\u0192\u061B\u0679\u06BE\u201A-\u202E]/);
  expect(text).toMatch(/[\u0600-\u06FF]/);
}

async function expectArabicFirst(page: Page) {
  const text = await page.locator("body").innerText();
  expect(text).toMatch(/[\u0600-\u06FF]/);
  expect(text).not.toMatch(/Your lists|Create list|Login|Register|Private|Public|Add place|Back to lists/);
}

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.client);
}

async function expectFinalVisualSystem(page: Page) {
  const styles = await page.evaluate(() => {
    const primaryButton = document.querySelector(".ds-button:not(.ds-button--secondary)");
    const bodyStyles = window.getComputedStyle(document.body);
    const buttonStyles = primaryButton ? window.getComputedStyle(primaryButton) : null;

    return {
      background: bodyStyles.backgroundColor,
      buttonBackground: buttonStyles?.backgroundColor ?? "",
      fontFamily: bodyStyles.fontFamily
    };
  });

  expect(styles.fontFamily).toContain("IBM Plex Sans Arabic");
  expect(styles.background).toBe("rgb(251, 247, 238)");
  expect(["rgb(47, 80, 56)", "rgb(36, 63, 43)"]).toContain(styles.buttonBackground);
}

test("login and register use Arabic-first auth anatomy", async ({ page }) => {
  await installApiMock(page);

  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByLabel("البريد الإلكتروني")).toBeFocused();
  await expect(page.getByRole("heading", { name: "تسجيل الدخول" })).toBeVisible();
  await expectNoLegacyPanel(page);
  await expectNoEscapedUnicode(page);
  await expectArabicFirst(page);
  await expectFinalVisualSystem(page);

  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.getByText("أدخل بريدًا صحيحًا.")).toBeVisible();

  await page.getByLabel("البريد الإلكتروني").fill("new@example.com");
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page).toHaveURL(/\/lists$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "قوائمي" })).toBeVisible();

  await page.goto("/register");
  await expect(page.getByLabel("البريد الإلكتروني")).toBeFocused();
  await expect(page.getByRole("heading", { name: "إنشاء حساب" })).toBeVisible();
  await expectNoLegacyPanel(page);
  await expectNoEscapedUnicode(page);
  await expectArabicFirst(page);
  await expectFinalVisualSystem(page);
  await page.getByLabel("البريد الإلكتروني").fill("new@example.com");
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.getByRole("button", { name: "إنشاء حساب" }).click();
  await expect(page).toHaveURL(/\/lists$/, { timeout: 15000 });
});

test("my lists renders empty and populated personal taste library states", async ({ page }) => {
  await setAuthenticated(page);
  await installApiMock(page);

  await page.goto("/lists");
  await expect(page.getByRole("heading", { name: "قوائمي" })).toBeVisible();
  await expect(page.getByText("مكتبة ذوقك", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "أضف قائمة" })).toBeVisible();
  await expect(page.getByText("مكتبتك جاهزة لأول رف")).toBeVisible();
  await expectNoLegacyPanel(page);
  await expectNoEscapedUnicode(page);
  await expectArabicFirst(page);
  await expectFinalVisualSystem(page);

  const place = makePlace("place-1", "SALT", "restaurant");
  await page.unroute(apiPattern);
  await installApiMock(page, {
    places: [place],
    lists: [makeList("list-1", "Weekend picks", [{ id: "item-1", place, createdAt: timestamp }])]
  });

  await page.goto("/lists");
  await expect(page.getByRole("link", { name: /Weekend picks/ })).toBeVisible();
  await expect(page.getByText("مكان واحد")).toBeVisible();
  await expect(page.getByText("خاص", { exact: true })).toBeVisible();
  await expect(page.getByText("أماكن محفوظة")).toBeVisible();
  await expectNoEscapedUnicode(page);
  await expectArabicFirst(page);
});

test("create list uses accessible modal or sheet with focus safety and unsaved protection", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  await installApiMock(page);

  await page.goto("/lists");
  await expect(page.getByText("مكتبتك جاهزة لأول رف")).toBeVisible();
  const createListLink = page.getByRole("link", { name: "أضف قائمة" });
  await expect(createListLink).toHaveAttribute("href", "/lists/new");
  await page.goto("/lists/new", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/lists\/new$/);
  const dialog = page.getByRole("dialog", { name: "أضف قائمة" });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("اسم القائمة")).toBeFocused();
  await expect(page.getByLabel("خاص")).toBeChecked();
  await expect(page.getByText("لا تظهر إلا لك.")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);
  await expectArabicFirst(page);

  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "إغلاق" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("اسم القائمة")).toBeFocused();

  await page.getByRole("button", { name: "حفظ القائمة" }).click();
  await expect(page.getByText("الاسم مطلوب.")).toBeVisible();
  await expect(page.getByLabel("اسم القائمة")).toBeFocused();

  await page.getByLabel("اسم القائمة").fill("Late night");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "متابعة التحرير" }).click();
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "تجاهل وإغلاق" }).click();
  await expect(page).toHaveURL(/\/lists\?focus=create-list$/);
  await expect(page.getByRole("link", { name: "أضف قائمة" })).toBeFocused();

  await page.goto("/lists/new");
  await expect(page.getByRole("dialog", { name: "أضف قائمة" })).toBeVisible();
  await page.getByLabel("اسم القائمة").fill("Late night");
  await page.getByRole("radio", { name: /عام/ }).check();
  await expect(page.getByRole("radio", { name: /عام/ })).toBeChecked();
  await page.getByRole("button", { name: "حفظ القائمة" }).scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "حفظ القائمة" }).click();
  await expect(page).toHaveURL(/\/lists\/list-1$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Late night" })).toBeVisible();
});

test("list detail prioritizes collection content and uses add-place dialog", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setAuthenticated(page);
  const place = makePlace("place-1", "Nara Cafe", "cafe");
  await installApiMock(page, {
    places: [place],
    lists: [makeList("list-1", "Weekend picks")]
  });

  await page.goto("/lists/list-1");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.getByRole("heading", { name: "Weekend picks" })).toBeVisible();
  await expect(page.getByText("لا توجد أماكن")).toBeVisible();
  await expect(page.getByText("هذه القائمة تنتظر أول مكان")).toBeVisible();
  await expect(page.locator("select")).toHaveCount(0);
  await expectNoLegacyPanel(page);
  await expectNoHorizontalOverflow(page);
  await expectNoEscapedUnicode(page);
  await expectArabicFirst(page);

  const addButtonBox = await page.getByRole("button", { name: "أضف أول مكان" }).boundingBox();
  expect(addButtonBox?.height).toBeGreaterThanOrEqual(44);

  await page.getByRole("button", { name: "أضف أول مكان" }).click();
  await expect(page.getByRole("dialog", { name: "أضف مكان" })).toBeVisible();
  await expect(page.getByLabel("ابحث باسم المكان")).toBeFocused();
  await page.getByLabel("ابحث باسم المكان").fill("Nara");
  await expect(page.getByRole("heading", { name: "Nara Cafe" })).toBeVisible();
  await page.getByRole("button", { name: "أضف" }).click();
  await expect(page.getByText("تمت إضافة المكان إلى القائمة.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nara Cafe" })).toBeVisible();
  await expect(page.getByRole("button", { name: "موجود" })).toBeDisabled();

  await page.getByRole("button", { name: "إغلاق" }).click();
  await page.getByLabel("عام").click();
  await expect(page.getByText("تم تحديث ظهور القائمة إلى عام.")).toBeVisible();
  await expectNoEscapedUnicode(page);
});
