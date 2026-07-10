import { expect, test } from "@playwright/test";

// These run without authentication and without API mocking. Public browsing
// surfaces must remain reachable, while private account surfaces still prompt
// for sign-in.

test("primary navigation is present on the app shell", async ({ page }) => {
  await page.goto("/places");
  await expect(page.getByRole("link", { name: "قوائمي" })).toBeVisible();
  await expect(page.getByRole("link", { name: "الأماكن" })).toBeVisible();
  await expect(page.getByRole("link", { name: "بحث" })).toHaveAttribute(
    "href",
    "/places?type=restaurant&focus=search"
  );
  await expect(page.getByRole("link", { name: "صفحتي" })).toBeVisible();
});

test("places library is publicly browsable without a sign-in wall", async ({ page }) => {
  await page.goto("/places?type=restaurant&focus=search");
  await expect(page.locator('.app-nav__link[href="/places?type=restaurant&focus=search"]')).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(page.locator('.app-nav__link[href="/places"]')).not.toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "الأماكن" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "بحث" })).toBeFocused();
  await page.locator('.place-library-search input[type="search"]').fill("zzzz-public-search");
  await page.locator('.place-library-search button[type="submit"]').click();
  await expect(page).toHaveURL(/q=zzzz-public-search/);
  await expect(page.locator('.app-nav__link[href="/places?type=restaurant&focus=search"]')).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(page.getByText(/سجل الدخول لعرض الأماكن/)).toHaveCount(0);
});

test("public-list library is publicly browsable without a sign-in wall", async ({ page }) => {
  await page.goto("/lists/public");
  await expect(page.locator("#public-lists-title")).toBeVisible();
  await expect(page.getByText(/تسجيل الدخول/)).toHaveCount(0);
});

test("profile archive prompts unauthenticated users to sign in", async ({ page }) => {
  await page.goto("/profile");
  await expect(page.getByText("سجّل الدخول لعرض صفحتك")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toBeVisible();
});
