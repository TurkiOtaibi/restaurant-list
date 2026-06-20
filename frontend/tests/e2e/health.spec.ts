import { expect, test } from "@playwright/test";

test("renders the product entry shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "سجل الأماكن" })).toBeVisible();
  await expect(page.getByRole("link", { name: "سجل" })).toBeVisible();
});

test("frontend health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toEqual({
    status: "ok",
    service: "restaurant-wishlist-frontend"
  });
});
