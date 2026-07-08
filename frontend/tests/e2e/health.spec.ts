import { expect, test } from "@playwright/test";

test("renders the product entry shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "سجل الأماكن" })).toBeVisible();
  await expect(page.getByRole("link", { name: "سجل" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ابدأ بدون حساب" })).toBeVisible();
  await expect(page.getByRole("link", { name: "تصفح الأماكن" })).toHaveAttribute(
    "href",
    "/places?type=restaurant"
  );
  await expect(page.getByRole("link", { name: "القوائم العامة" }).first()).toHaveAttribute(
    "href",
    "/lists/public"
  );
  await expect(page.getByRole("link", { name: "إنشاء حساب" })).toHaveAttribute(
    "href",
    "/register"
  );
  await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toHaveAttribute(
    "href",
    "/login"
  );
});

test("keyboard users can skip directly to page content", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "تجاوز إلى المحتوى" });
  await page.keyboard.press("Tab");

  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("frontend health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toEqual({
    status: "ok",
    service: "sijil-frontend"
  });
});

test("localized route metadata titles are exposed", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("سجل الأماكن | سجل");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "سجل | Restaurant List"
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "ar_SA");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://restaurant-list-web.onrender.com/icon-512.png"
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://restaurant-list-web.onrender.com"
  );
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest"
  );

  await page.goto("/login");
  await expect(page).toHaveTitle("تسجيل الدخول | سجل");

  await page.goto("/places?type=restaurant");
  await expect(page).toHaveTitle("الأماكن | سجل");
});

test("renders a branded Arabic not found page", async ({ page }) => {
  const response = await page.goto("/missing-page-for-qa");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { name: "لم نجد هذه الصفحة" })).toBeVisible();
  await expect(page.getByText("٤٠٤")).toBeVisible();
  await expect(page.getByRole("link", { name: "العودة إلى الأماكن" })).toHaveAttribute(
    "href",
    "/places"
  );
  await expect(page.getByRole("link", { name: "القوائم العامة" })).toHaveAttribute(
    "href",
    "/lists/public"
  );
});

test("Base UI switch pilot has an accessible name and keyboard toggle", async ({ page }) => {
  await page.goto("/health");

  const switchControl = page.getByRole("switch", { name: "تفعيل المعاينة" });
  await expect(switchControl).toBeVisible();
  await expect(switchControl).toHaveAttribute("aria-checked", "false");

  await switchControl.focus();
  await page.keyboard.press("Space");

  await expect(switchControl).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("المعاينة مفعلة محليًا فقط.")).toBeVisible();
});
