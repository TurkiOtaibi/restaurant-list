import { expect, test } from "@playwright/test";

// These run without authentication and without API mocking: the protected
// surfaces must show a sign-in prompt rather than data, and the primary
// navigation must remain reachable.

test("primary navigation is present on the app shell", async ({ page }) => {
  await page.goto("/places");
  await expect(page.getByRole("link", { name: "قوائمي" })).toBeVisible();
  await expect(page.getByRole("link", { name: "الأماكن" })).toBeVisible();
  await expect(page.getByRole("link", { name: "صفحتي" })).toBeVisible();
});

test("places library prompts unauthenticated users to sign in", async ({ page }) => {
  await page.goto("/places");
  await expect(page.getByText("سجل الدخول لعرض الأماكن")).toBeVisible();
  await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toBeVisible();
});

test("profile archive prompts unauthenticated users to sign in", async ({ page }) => {
  await page.goto("/profile");
  await expect(page.getByText("سجّل الدخول لعرض صفحتك")).toBeVisible();
  await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toBeVisible();
});
