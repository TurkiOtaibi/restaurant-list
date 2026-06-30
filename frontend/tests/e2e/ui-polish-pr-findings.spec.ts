import { expect, test } from "./support/places-acceptance-harness";

const TEST_PASSWORD = "password123";

async function dispatchInstallPrompt(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "dismissed"; platform: string }>;
    };
    event.prompt = async () => undefined;
    event.userChoice = Promise.resolve({ outcome: "dismissed", platform: "web" });
    window.dispatchEvent(event);
  });
}

test.describe("PR review UI polish findings", () => {
  test("renders bottom-sheet grabber on mobile sheets without adding one to desktop modals", async ({
    page,
    placesHarness
  }) => {
    let dataset = await placesHarness.resetFeature("PLACE-HARNESS");

    await page.setViewportSize({ height: 844, width: 390 });
    await placesHarness.loadRatingState(dataset.places.restaurantBurger.id);
    await expect(page.locator(".ds-bottom-sheet .ds-bottom-sheet__grabber")).toBeVisible();

    dataset = await placesHarness.resetFeature("PLACE-HARNESS");
    await page.setViewportSize({ height: 768, width: 1024 });
    await placesHarness.loadRatingState(dataset.places.restaurantBurger.id);
    await expect(page.locator(".ds-modal")).toBeVisible();
    await expect(page.locator(".ds-modal .ds-bottom-sheet__grabber")).toHaveCount(0);
  });

  test("keeps place row focus visible while row content remains contained", async ({
    page,
    placesHarness
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await placesHarness.resetFeature("PLACE-HARNESS");
    await placesHarness.loadPlacesList({ type: "restaurant" });

    const firstRow = page.locator(".ds-place-card--row").first();
    await firstRow.focus();
    await expect(firstRow).toBeFocused();

    const focusStyle = await firstRow.evaluate((element) => {
      const rowStyle = window.getComputedStyle(element);
      const titleStyle = window.getComputedStyle(
        element.querySelector<HTMLElement>(".ds-place-card__title")!
      );
      return {
        outlineOffset: rowStyle.outlineOffset,
        overflow: rowStyle.overflow,
        titleOverflow: titleStyle.overflow
      };
    });

    expect(focusStyle).toMatchObject({
      outlineOffset: "-4px",
      overflow: "visible",
      titleOverflow: "hidden"
    });
  });

  test("uses shared rating display variants and keeps the rating sheet value singular", async ({
    page,
    placesHarness
  }) => {
    const dataset = await placesHarness.resetFeature("PLACE-HARNESS");

    await placesHarness.loadPlacesList({ type: "restaurant" });
    await expect(
      page
        .locator(".ds-place-card--row", { hasText: dataset.places.restaurantBurger.name })
        .locator(".ds-place-card__score")
    ).toContainText("9.5");

    await placesHarness.loadPlaceDetail(dataset.places.restaurantBurger.id);
    await expect(page.locator(".place-detail-panel--rating .ds-rating-display")).toContainText("9.5/10");

    await placesHarness.loadRatingState(dataset.places.restaurantBurger.id);
    await expect(page.locator(".rate-place-dialog .ds-rating-control__value")).toHaveText("9.5/10");
    await expect(page.locator(".rate-place-dialog .ds-rating-display")).toHaveCount(0);
    await expect(page.locator(".rate-place-dialog input[type='range']")).toHaveAttribute(
      "aria-valuetext",
      "Rating, 9.5 out of 10"
    );
  });

  test("suppresses install prompt on auth routes and supports dismissal on app routes", async ({
    page,
    placesHarness
  }) => {
    const dataset = await placesHarness.resetFeature("PLACE-HARNESS");

    await page.goto("/login?returnTo=%2Fplaces");
    await page.locator('input[type="email"]').fill(dataset.user.email);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/places/);

    await dispatchInstallPrompt(page);
    await expect(page.locator(".install-app-prompt")).toBeVisible();
    await expect(page.locator(".install-app-prompt[role='status']")).toHaveCount(0);
    await expect(page.locator(".install-app-prompt button")).toHaveCount(2);

    await page.locator(".install-app-prompt button").last().click();
    await expect(page.locator(".install-app-prompt")).toHaveCount(0);

    await page.goto("/login");
    await dispatchInstallPrompt(page);
    await expect(page.locator(".install-app-prompt")).toHaveCount(0);
  });
});
