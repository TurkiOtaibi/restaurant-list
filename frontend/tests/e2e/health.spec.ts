import { expect, test } from "@playwright/test";

test("renders the product entry shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "مكتبة ذوقك الشخصية" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ذوق" })).toBeVisible();
});

test("frontend health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toEqual({
    status: "ok",
    service: "restaurant-wishlist-frontend"
  });
});
