import { expect, test, type Page } from "@playwright/test";

const now = new Date().toISOString();

type MockPlace = {
  averageRating: number | null;
  createdAt: string;
  createdByUserId: string;
  currentUserListCount: number;
  currentUserListIds: string[];
  currentUserListNames: string[];
  currentUserIsCreator: boolean;
  currentUserRating: number | null;
  description: string | null;
  id: string;
  imageUrl: string | null;
  name: string;
  ratingCount: number;
  subtype: string | null;
  type: "restaurant" | "cafe" | "ice_cream";
  updatedAt: string;
};

function makePlace(
  id: string,
  name: string,
  type: MockPlace["type"],
  subtype: string | null,
  averageRating: number | null,
  ratingCount: number,
  currentUserRating: number | null = null
): MockPlace {
  return {
    averageRating,
    createdAt: now,
    createdByUserId: "user-owner",
    currentUserListCount: id === "p1" || id === "p4" ? 1 : 0,
    currentUserListIds: id === "p1" || id === "p4" ? ["list-pop"] : [],
    currentUserListNames: id === "p1" || id === "p4" ? ["برجر الرياض طويل الاسم"] : [],
    currentUserIsCreator: true,
    currentUserRating,
    description: null,
    id,
    imageUrl: id === "p1" ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%230f8f59'/%3E%3C/svg%3E" : null,
    name,
    ratingCount,
    subtype,
    type,
    updatedAt: now
  };
}

const places: MockPlace[] = [
  makePlace("p1", "Casa Nonna", "restaurant", "italian", 9.5, 42, 8.5),
  makePlace(
    "p2",
    "مطعم مأكولات بحرية ومشويات الخليج التقليدية",
    "restaurant",
    "seafood",
    8.8,
    31
  ),
  makePlace(
    "p3",
    "The Original Cheesecake Factory Restaurant & Bakery",
    "restaurant",
    "american",
    8.5,
    18
  ),
  makePlace(
    "p4",
    "مطعم Five Guys فرع King Abdullah Financial District",
    "restaurant",
    "burger",
    8,
    15
  ),
  makePlace("p5", "برجر بلا تقييم", "restaurant", "burger", null, 0),
  makePlace("p6", "قهوة مختصة", "cafe", "coffee", 9, 9, 7.5),
  makePlace("p7", "شاهي العصر", "cafe", "tea", 7.5, 4),
  makePlace("p8", "Ice Dot", "ice_cream", null, 8.5, 6),
  makePlace("p9", "مثلجات طويلة الاسم للاختبار", "ice_cream", null, null, 0)
];

const lists = [
  {
    createdAt: now,
    id: "list-pop",
    isSystem: false,
    name: "برجر الرياض طويل الاسم",
    ownerDisplayName: "تركي",
    placeCount: 5,
    updatedAt: now,
    userId: "user-owner",
    visibility: "public"
  },
  {
    createdAt: now,
    id: "list-empty",
    isSystem: false,
    name: "قائمة فارغة",
    ownerDisplayName: "تركي",
    placeCount: 0,
    updatedAt: now,
    userId: "user-owner",
    visibility: "private"
  },
  {
    createdAt: now,
    id: "list-en",
    isSystem: false,
    name: "The Original Cheesecake Factory Favorites",
    ownerDisplayName: "Turki",
    placeCount: 12,
    updatedAt: now,
    userId: "user-owner",
    visibility: "private"
  }
] as const;

const listDetail = {
  ...lists[0],
  items: places.slice(0, 5).map((place, index) => ({
    createdAt: now,
    id: `item-${index}`,
    place
  }))
};

const emptyListDetail = {
  ...lists[1],
  items: []
};

const profile = {
  averageRating: 8.0,
  bio: "ملف شخصي عربي قصير لاختبار الاستجابة.",
  displayName: "تركي العتيبي",
  favoritePlaces: [],
  listCount: 3,
  listsCount: 3,
  ratedCafeCount: 1,
  ratedIceCreamCount: 0,
  ratedRestaurantCount: 1,
  ratingsCount: 2,
  ratingsCreatedCount: 2,
  userRatings: [
    {
      createdAt: now,
      id: "r1",
      notes:
        "ملاحظة خاصة طويلة للاختبار تعرض كسطر أو سطرين فقط داخل الأرشيف ولا تكسر العرض في الشاشات الصغيرة.",
      place: places[0],
      rating: 8.5,
      updatedAt: now
    },
    {
      createdAt: now,
      id: "r2",
      notes: null,
      place: places[5],
      rating: 7.5,
      updatedAt: now
    }
  ]
};

const viewports = [
  { height: 568, name: "320x568", width: 320 },
  { height: 844, name: "390x844", width: 390 },
  { height: 932, name: "430x932", width: 430 },
  { height: 1180, name: "820x1180", width: 820 },
  { height: 1000, name: "1440x1000", width: 1440 }
];

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("responsive shell contains content at required viewports", async ({ page }) => {
  test.setTimeout(600_000);

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const path of [
      "/lists",
      "/places?type=restaurant",
      "/lists/list-pop",
      "/places/p1",
      "/places/p1/rate",
      "/profile",
      "/lists/public"
    ]) {
      await page.goto(path);
      await expect(page.locator("body")).not.toContainText(/[٠-٩۰-۹]/);
      await assertResponsiveGeometry(page, `${viewport.name} ${path}`);
    }
  }
});

test("long Arabic English and mixed names stay contained", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/places?type=restaurant");

  await expect(page.getByText("مطعم مأكولات بحرية ومشويات الخليج التقليدية")).toBeVisible();
  await expect(page.getByText("The Original Cheesecake Factory Restaurant & Bakery")).toBeVisible();
  await expect(page.getByText("مطعم Five Guys فرع King Abdullah Financial District")).toBeVisible();

  await assertResponsiveGeometry(page, "long mixed names");
  await assertNoCriticalInlineClipping(page);
});

test("dialogs sheets and menus remain usable on small mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });

  await page.goto("/lists/new");
  await page.getByRole("dialog").waitFor();
  await assertDialogFits(page, "create list sheet");
  await assertResponsiveGeometry(page, "create list sheet");

  await page.goto("/lists/list-pop");
  await expect(page.locator(".ds-action-menu__trigger").first()).toBeVisible();
  await page.locator(".ds-action-menu__trigger").first().click();
  await page.locator(".ds-action-menu__items button").first().click();
  await page.getByRole("dialog").waitFor();
  await assertDialogFits(page, "edit list dialog");
  await assertResponsiveGeometry(page, "edit list dialog");

  await page.goto("/lists/list-pop");
  await expect(page.locator(".list-action--primary").first()).toBeVisible();
  await page.locator(".list-action--primary").first().click();
  await page.getByRole("dialog").waitFor();
  await assertDialogFits(page, "add place sheet");
  await assertResponsiveGeometry(page, "add place sheet");
});

test("zoom pressure large text reduced motion and forced colors stay adaptive", async ({ browser }) => {
  const context = await browser.newContext({ locale: "ar-SA", viewport: { height: 422, width: 195 } });
  const page = await context.newPage();
  await mockApi(page);
  for (const path of ["/places?type=restaurant", "/profile", "/places/p1/rate"]) {
    await page.goto(path);
    await assertResponsiveGeometry(page, `200 percent pressure ${path}`);
  }
  await context.close();

  const textContext = await browser.newContext({ locale: "ar-SA", viewport: { height: 844, width: 390 } });
  const textPage = await textContext.newPage();
  await mockApi(textPage);
  await textPage.addStyleTag({ content: "html{font-size:200% !important}" });
  await textPage.goto("/places?type=restaurant");
  await assertResponsiveGeometry(textPage, "large text places");
  await textContext.close();

  const mediaContext = await browser.newContext({
    forcedColors: "active",
    locale: "ar-SA",
    reducedMotion: "reduce",
    viewport: { height: 844, width: 390 }
  });
  const mediaPage = await mediaContext.newPage();
  await mockApi(mediaPage);
  await mediaPage.goto("/profile");
  await assertResponsiveGeometry(mediaPage, "forced colors reduced motion profile");
  await mediaContext.close();
});

test("metadata contrast meets AA on dark surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/places?type=restaurant");
  await expect(page.locator(".ds-place-card__meta").first()).toBeVisible();

  const ratios = await page.evaluate(() => {
    function parseRgb(color: string): [number, number, number] {
      const values = color.match(/\d+(\.\d+)?/g)?.slice(0, 3).map(Number);
      if (!values || values.length < 3) {
        throw new Error(`Cannot parse color ${color}`);
      }
      return [values[0], values[1], values[2]];
    }

    function luminance([r, g, b]: [number, number, number]) {
      const [red, green, blue] = [r, g, b].map((value) => {
        const channel = value / 255;
        return channel <= 0.03928
          ? channel / 12.92
          : Math.pow((channel + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    }

    function contrast(foreground: string, background: string) {
      const first = luminance(parseRgb(foreground));
      const second = luminance(parseRgb(background));
      const lighter = Math.max(first, second);
      const darker = Math.min(first, second);
      return (lighter + 0.05) / (darker + 0.05);
    }

    return Array.from(document.querySelectorAll(".ds-place-card__meta, .muted")).map((element) => {
      const style = getComputedStyle(element);
      return contrast(style.color, getComputedStyle(document.body).backgroundColor);
    });
  });

  expect(ratios.length).toBeGreaterThan(0);
  expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5);
});

async function mockApi(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.hasSession", "1");
  });

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api/v1", "");
    const method = request.method();

    function fulfill(body: unknown, status = 200) {
      return route.fulfill({
        body: JSON.stringify(body),
        contentType: "application/json",
        status
      });
    }

    if (path === "/auth/refresh" || path === "/auth/login" || path === "/auth/register") {
      return fulfill({
        accessToken: "mock-access-token",
        user: { displayName: "تركي", email: "audit@example.com", id: "user-owner" }
      });
    }
    if (path === "/auth/logout") {
      return fulfill({});
    }
    if (path === "/lists" && method === "GET") {
      return fulfill(collection(lists));
    }
    if (path === "/lists/public") {
      return fulfill(collection([lists[0]]));
    }
    if (path === "/lists/public/list-pop" || path === "/lists/list-pop") {
      return fulfill(listDetail);
    }
    if (path === "/lists/list-empty") {
      return fulfill(emptyListDetail);
    }
    if (path.startsWith("/lists/") && method !== "GET") {
      return fulfill({});
    }
    if (path === "/places" && method === "GET") {
      return fulfill(collection(filterPlaces(url)));
    }
    if (path === "/places" && method === "POST") {
      return fulfill(places[0], 201);
    }
    if (path === "/places/p1") {
      return fulfill(places[0]);
    }
    if (path === "/profile") {
      return fulfill(profile);
    }
    if (path === "/ratings" || path.startsWith("/ratings/")) {
      return fulfill({
        createdAt: now,
        id: "rating-new",
        notes: null,
        placeId: "p1",
        rating: 8.5,
        updatedAt: now,
        userId: "user-owner"
      });
    }

    return fulfill({ error: { code: "MOCK_NOT_FOUND", message: `${method} ${path}` } }, 404);
  });
}

function collection<T>(data: readonly T[]) {
  return {
    data,
    meta: { limit: 100, offset: 0, sort: "rating_desc", total: data.length }
  };
}

function filterPlaces(url: URL) {
  const type = url.searchParams.get("type");
  const subtype = url.searchParams.get("subtype");
  const query = url.searchParams.get("q")?.trim().toLowerCase();

  if (query === "no-results") {
    return [];
  }

  return places
    .filter((place) => !type || place.type === type)
    .filter((place) => !subtype || place.subtype === subtype)
    .filter((place) => !query || place.name.toLowerCase().includes(query))
    .sort(
      (first, second) =>
        (second.averageRating ?? -1) - (first.averageRating ?? -1) ||
        second.ratingCount - first.ratingCount ||
        first.name.localeCompare(second.name)
    );
}

async function assertResponsiveGeometry(page: Page, label: string) {
  await page.waitForTimeout(100);
  const result = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - window.innerWidth;
    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href],button,input,select,textarea,[role="button"],[role="menuitem"],[role="radio"]'
      )
    )
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 1 &&
          rect.height > 1 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-disabled") !== "true"
        );
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          height: Math.round(rect.height),
          label: element.getAttribute("aria-label") ?? element.textContent?.trim().slice(0, 40) ?? "",
          tag: element.tagName.toLowerCase(),
          width: Math.round(rect.width)
        };
      })
      .filter((target) => Math.min(target.width, target.height) < 40);

    const nav = document.querySelector<HTMLElement>(".app-nav");
    let navOverlap = false;
    if (nav) {
      window.scrollTo(0, document.documentElement.scrollHeight);
      const navRect = nav.getBoundingClientRect();
      const last = Array.from(
        document.querySelectorAll<HTMLElement>(
          "main a,main button,main input,main textarea,main .ds-place-card,main .ds-list-card,main .profile-rating-card,main .ds-empty"
        )
      )
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 4 && rect.height > 4 && style.display !== "none" && style.visibility !== "hidden";
        })
        .at(-1);
      if (last) {
        const lastRect = last.getBoundingClientRect();
        navOverlap = lastRect.bottom > navRect.top - 2 && document.documentElement.scrollHeight > window.innerHeight;
      }
    }

    return {
      interactive,
      navOverlap,
      overflow,
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth
    };
  });

  expect(result.overflow, `${label}: document overflow ${JSON.stringify(result)}`).toBeLessThanOrEqual(1);
  expect(result.interactive, `${label}: small touch targets`).toEqual([]);
  expect(result.navOverlap, `${label}: bottom navigation overlap`).toBe(false);
}

async function assertNoCriticalInlineClipping(page: Page) {
  const clipped = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>(
        ".ds-bidi,.ds-number,.ds-place-card__score,.ds-place-card__title,.profile-rating-card h3"
      )
    )
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 1 &&
          rect.height > 1 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          (rect.left < -1 || rect.right > window.innerWidth + 1)
        );
      })
      .map((element) => ({
        className: element.className,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
        text: element.textContent?.trim().slice(0, 80)
      }))
  );

  expect(clipped).toEqual([]);
}

async function assertDialogFits(page: Page, label: string) {
  const dialogs = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"],[role="alertdialog"]')).map(
      (element) => {
        const rect = element.getBoundingClientRect();
        return {
          bottom: Math.round(rect.bottom),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          viewportHeight: window.innerHeight,
          viewportWidth: window.innerWidth
        };
      }
    )
  );

  expect(dialogs.length, `${label}: dialog exists`).toBeGreaterThan(0);
  for (const dialog of dialogs) {
    expect(dialog.left, `${label}: dialog left`).toBeGreaterThanOrEqual(-1);
    expect(dialog.top, `${label}: dialog top`).toBeGreaterThanOrEqual(-1);
    expect(dialog.right, `${label}: dialog right`).toBeLessThanOrEqual(dialog.viewportWidth + 1);
    expect(dialog.bottom, `${label}: dialog bottom`).toBeLessThanOrEqual(dialog.viewportHeight + 1);
  }
}
