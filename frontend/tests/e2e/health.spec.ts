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
    service: "sijil-frontend"
  });
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
