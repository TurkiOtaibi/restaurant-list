import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { expect, test } from "@playwright/test";

import { PlacesAcceptanceHarness } from "./support/places-acceptance-harness";

let apiProcess: ChildProcessWithoutNullStreams | undefined;
let apiOutput = "";
let apiExited = false;

test.beforeAll(async () => {
  const backendScript = path.resolve(
    process.cwd(),
    "..",
    "backend",
    "scripts",
    "start_e2e_api.py"
  );

  apiProcess = spawn(process.env.PYTHON ?? "python", [backendScript], {
    env: { ...process.env },
    stdio: "pipe"
  });

  apiProcess.stdout.on("data", (chunk) => {
    apiOutput += chunk.toString();
  });
  apiProcess.stderr.on("data", (chunk) => {
    apiOutput += chunk.toString();
  });
  apiProcess.on("exit", (code, signal) => {
    apiExited = true;
    apiOutput += `\nAPI exited with code ${code ?? "null"} and signal ${signal ?? "null"}.`;
  });

  await waitForApi();
});

test.afterAll(() => {
  apiProcess?.kill();
});

test("real frontend and api complete auth, create, search, and detail flow", async ({ page }) => {
  test.setTimeout(180_000);

  const unique = Date.now();
  const email = `e2e-${unique}@example.com`;
  const placeName = `محل آيس كريم ${unique}`;

  // Register -> redirected to the lists shell.
  await page.goto("/register");
  await page.getByLabel("اسم العرض").fill(`مستخدم ${unique}`);
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.getByRole("button", { name: "إنشاء حساب" }).click();
  await expect(page).toHaveURL(/\/lists$/, { timeout: 15_000 });

  // Create an ice-cream place (no subtype required) via the create dialog.
  await page.goto("/places/new?type=ice_cream");
  await page.getByLabel("اسم المكان").fill(placeName);
  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  await expect(page.getByText("تم حفظ المكان.")).toBeVisible();

  // The new place appears in the ice-cream library.
  await page.goto("/places?type=ice_cream");
  await expect(page).toHaveURL(/\/places\?type=ice_cream/);
  await expect(page.getByText(placeName)).toBeVisible();

  // Reload: the access token is held in memory only, so this proves it is
  // silently re-established from the HttpOnly refresh cookie (no sign-in prompt).
  await page.reload();
  await expect(page.getByText(placeName)).toBeVisible();
  await expect(page.getByText("سجل الدخول لعرض الأماكن")).toHaveCount(0);

  // Name search finds exactly one result, and a miss shows the empty state.
  await page.getByRole("searchbox", { name: "بحث" }).fill(placeName);
  await page.getByRole("button", { name: "بحث", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1 نتيجة");
  await expect(page.getByText(placeName)).toBeVisible();

  await page.getByRole("searchbox", { name: "بحث" }).fill("zzzzzznomatch");
  await page.getByRole("button", { name: "بحث", exact: true }).click();
  await expect(page.getByText("لا توجد نتائج")).toBeVisible();

  // Open the place detail and confirm the rate affordance is present.
  await page.getByRole("searchbox", { name: "بحث" }).fill(placeName);
  await page.getByRole("button", { name: "بحث", exact: true }).click();
  const placeLink = page.getByRole("link", { name: new RegExp(placeName) });
  await placeLink.scrollIntoViewIfNeeded();
  await Promise.all([
    page.waitForURL(/\/places\/[0-9a-f-]+$/, { timeout: 30_000 }),
    placeLink.click()
  ]);
  await expect(page.getByRole("heading", { name: placeName })).toBeVisible();
  await expect(page.getByRole("link", { name: "قيّم المكان" })).toBeVisible();
});

test("real frontend and api complete list edit add remove delete and profile flow", async ({
  page
}) => {
  test.setTimeout(240_000);

  const unique = Date.now();
  const email = `lists-${unique}@example.com`;
  const displayName = `مالك ${unique}`;
  const placeName = `مطعم برجر الاختبار ${unique}`;
  const listName = `قائمة الاختبار ${unique}`;
  const editedListName = `قائمة معدلة ${unique}`;

  await page.goto("/register");
  await page.getByLabel("اسم العرض").fill(displayName);
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.getByRole("button", { name: "إنشاء حساب" }).click();
  await expect(page).toHaveURL(/\/lists$/, { timeout: 15_000 });

  await page.goto("/places/new?type=restaurant");
  await page.getByLabel("اسم المكان").fill(placeName);
  await page.getByLabel("نوع المطعم").selectOption("burger");
  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  await expect(page.getByText("تم حفظ المكان.")).toBeVisible();
  await page.goto("/places?type=restaurant");
  await expect(page).toHaveURL(/\/places\?type=restaurant/);

  await page.goto("/lists/new");
  await page.getByLabel("اسم القائمة").fill(listName);
  await page.getByLabel("عامة").check();
  const createListResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/lists") &&
      response.request().method() === "POST",
    { timeout: 15_000 }
  );
  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  const createListResponse = await createListResponsePromise;
  expect(createListResponse.status()).toBe(201);
  await expect(page).toHaveURL(/\/lists\/[0-9a-f-]+$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: listName })).toBeVisible();
  await expect(page.getByText("عامة")).toBeVisible();

  await page.goto("/lists/public");
  await expect(page.getByText(listName)).toBeVisible();
  await expect(page.getByText(`بواسطة: ${displayName}`)).toBeVisible();
  await page.getByRole("link", { name: new RegExp(listName) }).click();
  await expect(page.getByText(`بواسطة: ${displayName}`)).toBeVisible();
  await page.goto("/lists");
  await page.getByRole("link", { name: new RegExp(listName) }).click();

  await page.getByRole("button", { name: "إجراءات القائمة" }).click();
  await page.getByRole("menuitem", { name: "تعديل" }).click();
  await page.getByLabel("اسم القائمة").fill(editedListName);
  await page.getByLabel("خاصة").check();
  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  await expect(page.getByRole("heading", { name: editedListName })).toBeVisible();
  await expect(page.getByText("خاصة")).toBeVisible();

  await page.getByRole("button", { name: "أضف مكانًا" }).click();
  await page.getByRole("searchbox", { name: "بحث" }).fill(placeName);
  await page.getByRole("button", { name: "أضف" }).click();
  await expect(page.getByText("تمت إضافة المكان إلى القائمة.")).toBeVisible();
  await page.getByRole("button", { name: "إغلاق" }).click();
  await expect(page.getByRole("dialog", { name: "أضف مكانًا" })).toBeHidden();
  await expect(page.getByRole("link", { name: new RegExp(placeName) })).toBeVisible();

  await page.getByRole("button", { name: new RegExp(`إزالة ${placeName}`) }).click();
  await expect(page.getByText("لا توجد أماكن")).toBeVisible();

  await page.getByRole("button", { name: "أضف أول مكان" }).click();
  await page.getByRole("searchbox", { name: "بحث" }).fill(placeName);
  await page.getByRole("button", { name: "أضف" }).click();
  await expect(page.getByText("تمت إضافة المكان إلى القائمة.")).toBeVisible();
  await page.getByRole("button", { name: "إغلاق" }).click();
  await expect(page.getByRole("dialog", { name: "أضف مكانًا" })).toBeHidden();
  const listPlaceLink = page.getByRole("link", { name: new RegExp(placeName) });
  await listPlaceLink.scrollIntoViewIfNeeded();
  await Promise.all([
    page.waitForURL(/\/places\/[0-9a-f-]+$/, { timeout: 30_000 }),
    listPlaceLink.click()
  ]);

  await page.getByRole("link", { name: "قيّم المكان" }).click();
  await page.getByLabel("تقييمك").fill("8.5");
  await page.getByLabel("ملاحظتك").fill("ملاحظة خاصة للاختبار");
  await page.getByRole("button", { name: "حفظ التقييم" }).click();
  await expect(page.getByText("تم حفظ التقييم.")).toBeVisible();
  await page.getByRole("button", { name: "إلغاء" }).click();
  await expect(page.getByText("تقييمك الحالي 8.5/10")).toBeVisible();

  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "صفحتي" })).toBeVisible();
  await expect(page.getByText(placeName)).toBeVisible();
  await expect(page.getByText("ملاحظة خاصة للاختبار")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/[٠-٩۰-۹]/);

  await page.goto(`/lists`);
  await page.getByRole("link", { name: new RegExp(editedListName) }).click();
  await page.getByRole("button", { name: "إجراءات القائمة" }).click();
  await page.getByRole("menuitem", { name: "حذف" }).click();
  await expect(page.getByRole("alertdialog", { name: "حذف القائمة" })).toBeVisible();
  await page.getByRole("button", { name: "حذف" }).click();
  await expect(page).toHaveURL(/\/lists$/);
  await expect(page.getByText(editedListName)).toHaveCount(0);
});

test("real places library covers subtype filters sorting layout bidi and errors", async ({
  context,
  page
}) => {
  test.setTimeout(240_000);

  const unique = Date.now();
  const raterA = await createApiUser(`rater-a-${unique}@example.com`);
  const raterB = await createApiUser(`rater-b-${unique}@example.com`);
  const prefix = `Sort ${unique}`;
  const topName = `${prefix} A Casa Nonna`;
  const tiedMoreName = `${prefix} B Burger Two Ratings`;
  const tiedFewerName = `${prefix} C Burger One Rating`;
  const lowerName = `${prefix} D Grill Lower`;
  const unratedMixedName = `${prefix} مطعم Five Guys فرع King Abdullah Financial District`;
  const cafeName = `${prefix} Coffee Room`;
  const iceCreamName = `${prefix} Ice Cream`;

  const top = await createApiPlace(raterA, topName, "restaurant", "italian");
  const tiedMore = await createApiPlace(raterA, tiedMoreName, "restaurant", "burger");
  const tiedFewer = await createApiPlace(raterA, tiedFewerName, "restaurant", "burger");
  const lower = await createApiPlace(raterA, lowerName, "restaurant", "grill");
  const unratedMixed = await createApiPlace(raterA, unratedMixedName, "restaurant", "burger");
  await createApiPlace(raterA, cafeName, "cafe", "coffee");
  await createApiPlace(raterA, iceCreamName, "ice_cream", null);

  await rateApiPlace(raterA, top.id, 9.5);
  await rateApiPlace(raterA, tiedMore.id, 9.0);
  await rateApiPlace(raterB, tiedMore.id, 9.0);
  await rateApiPlace(raterA, tiedFewer.id, 9.0);
  await rateApiPlace(raterA, lower.id, 8.0);

  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("localhost:8000")) {
      apiRequests.push(request.url());
    }
  });

  const placesHarness = new PlacesAcceptanceHarness(page, context);
  await placesHarness.resetFeature("PLACE-007");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/places?type=restaurant");
  await expect(page).toHaveURL(/\/places/);
  await expect(page.getByRole("searchbox", { name: "بحث" })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("searchbox", { name: "بحث" }).fill(prefix);
  await page.getByRole("searchbox", { name: "بحث" }).press("Enter");
  await expect(page).toHaveURL(/q=/);
  await expect(page.locator(".ds-place-card--row")).toHaveCount(5, { timeout: 30_000 });
  await expect(page.locator(".ds-place-card--row .ds-place-card__title")).toHaveText([
    topName,
    tiedMoreName,
    tiedFewerName,
    lowerName,
    unratedMixedName
  ]);
  await expect(page.locator(".ds-place-card--row").first()).toHaveAttribute("href", /\/places\//);
  // Each row now shows a single deterministic place-type glyph.
  await expect(page.locator(".ds-place-card--row .ds-type-icon")).toHaveCount(5);
  await expect(page.locator("body")).not.toContainText(/[٠-٩۰-۹]/);
  await expect(page.locator(".ds-place-card--row").first().locator(".ds-place-card__score")).toContainText("9.5");

  // The type glyph is deterministic by place type; re-running the same search
  // keeps the first result's type icon present.
  await page.getByRole("searchbox", { name: "بحث" }).press("Enter");
  await expect(page.locator(".ds-place-card--row")).toHaveCount(5, { timeout: 30_000 });
  await expect(page.locator(".ds-place-card--row").first().locator(".ds-type-icon")).toBeVisible();

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const innerWidth = await page.evaluate(() => window.innerWidth);
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  await expect(page.locator(".ds-place-card--row", { hasText: unratedMixed.name })).toBeVisible();

  await page.locator(".place-subtype-filter__trigger").click();
  await page.getByRole("radio").nth(1).click();
  await expect(page).toHaveURL(/subtype=burger/);
  await expect(page.locator(".ds-place-card--row .ds-place-card__title")).toHaveText([
    tiedMoreName,
    tiedFewerName,
    unratedMixedName
  ]);

  await page.locator(".place-type-filters button").nth(1).click();
  await expect(page).toHaveURL(/type=cafe/);
  await expect(page).not.toHaveURL(/subtype=burger/);
  await page.locator(".place-subtype-filter__trigger").click();
  await page.getByRole("radio").nth(1).click();
  await expect(page).toHaveURL(/subtype=coffee/);
  await page.getByRole("searchbox", { name: "بحث" }).fill(prefix);
  await page.getByRole("searchbox", { name: "بحث" }).press("Enter");
  await expect(page.locator(".ds-place-card--row .ds-place-card__title")).toHaveText([cafeName]);

  await page.locator(".place-type-filters button").nth(2).click();
  await expect(page).toHaveURL(/type=ice_cream/);
  await expect(page.locator(".place-subtype-filter__trigger")).toHaveCount(0);
  await page.getByRole("searchbox", { name: "بحث" }).fill(prefix);
  await page.getByRole("searchbox", { name: "بحث" }).press("Enter");
  await expect(page.locator(".ds-place-card--row .ds-place-card__title")).toHaveText([iceCreamName]);

  await page.getByRole("searchbox", { name: "بحث" }).fill(`No Match ${unique}`);
  await page.getByRole("searchbox", { name: "بحث" }).press("Enter");
  await expect(page.locator(".ds-empty__title")).toBeVisible();
  await expect(page.getByRole("button", { name: "عرض الكل" })).toBeVisible();

  await page.locator(".place-type-filters button").nth(0).click();
  await expect(page).toHaveURL(/type=restaurant/);
  await page.getByRole("link", { name: "أضف مكانًا" }).click();
  await expect(page).toHaveURL(/\/places\/new/);
  await page.getByLabel("اسم المكان").fill(topName);
  await page.getByLabel("نوع المطعم").selectOption("italian");
  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  await expect(page.locator(".ds-status--error")).toBeVisible();

  expect(apiRequests.some((url) => url.includes("/api/v1/places"))).toBeTruthy();
  expect(apiRequests.some((url) => /localhost:8000\/places/.test(url))).toBeFalsy();
});

test("technical shell stories expose manifest headers and legacy redirects", async ({
  page,
  request
}) => {
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  await expect(manifest.json()).resolves.toMatchObject({
    name: "سجل",
    short_name: "سجل",
    display: "standalone"
  });

  const health = await request.get("/health");
  expect(health.headers()["x-content-type-options"]).toBe("nosniff");
  expect(health.headers()["x-frame-options"]).toBe("DENY");
  expect(health.headers()["content-security-policy"]).toContain("default-src 'self'");

  await page.goto("/restaurants");
  await expect(page).toHaveURL(/\/places\?type=restaurant/);
  await page.goto("/cafes");
  await expect(page).toHaveURL(/\/places\?type=cafe/);
});

async function waitForApi() {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    if (apiExited) {
      throw new Error(apiOutput);
    }

    try {
      // Gate on readiness (DB-backed), not liveness, so the API can actually
      // serve a database-backed request before the test proceeds. This mirrors
      // the production healthCheckPath and avoids racing the first cold request.
      const response = await fetch("http://localhost:8000/health/ready");
      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting while the Python process starts Uvicorn.
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for the real API.\n${apiOutput}`);
}

type ApiPlaceType = "restaurant" | "cafe" | "ice_cream";
type ApiPlaceSubtype = "burger" | "italian" | "grill" | "coffee" | null;

async function createApiUser(email: string): Promise<string> {
  const response = await fetch("http://localhost:8000/api/v1/auth/register", {
    body: JSON.stringify({ displayName: "مستخدم اختبار", email, password: "password123" }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Failed to create API user: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as { accessToken: string };
  return payload.accessToken;
}

async function createApiPlace(
  token: string,
  name: string,
  type: ApiPlaceType,
  subtype: ApiPlaceSubtype
): Promise<{ id: string; name: string }> {
  const response = await fetch("http://localhost:8000/api/v1/places", {
    body: JSON.stringify({ name, type, subtype }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Failed to create API place: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as { id: string; name: string };
}

async function rateApiPlace(token: string, placeId: string, rating: number): Promise<void> {
  const response = await fetch("http://localhost:8000/api/v1/ratings", {
    body: JSON.stringify({ placeId, rating }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Failed to rate API place: ${response.status} ${await response.text()}`);
  }
}
