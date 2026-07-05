import { expect, test } from "./support/places-acceptance-harness";

test.describe("focused authenticated Places acceptance harness", () => {
  test("loads list and filter states directly with deterministic authenticated data", async ({
    page,
    placesHarness
  }) => {
    const dataset = await placesHarness.resetFeature("PLACE-001");

    await placesHarness.loadPlacesList({ query: dataset.runId, type: "restaurant" });
    await expect(placesHarness.placeCardByName(dataset.places.restaurantBurger.name)).toBeVisible();

    await placesHarness.loadFilterState({
      query: dataset.runId,
      subtype: "coffee",
      type: "cafe"
    });
    await expect(placesHarness.placeCardByName(dataset.places.cafeCoffee.name)).toBeVisible();
    await expect(page.locator("body")).not.toContainText(dataset.places.restaurantBurger.name);
  });

  test("places type selector exposes Base UI tabs and preserves query behavior", async ({
    page,
    placesHarness
  }) => {
    const dataset = await placesHarness.resetFeature("PLACE-001");

    await placesHarness.loadPlacesList({ query: dataset.runId, type: "restaurant" });
    await page.waitForLoadState("networkidle");

    const tablist = page.getByRole("tablist", { name: "نوع المكان" });
    await expect(tablist).toBeVisible();

    const restaurantTab = page.getByRole("tab", { name: "المطاعم" });
    const cafeTab = page.getByRole("tab", { name: "المقاهي" });
    const iceCreamTab = page.getByRole("tab", { name: "الآيس كريم" });

    await expect(restaurantTab).toHaveAttribute("aria-selected", "true");
    await expect(cafeTab).toHaveAttribute("aria-selected", "false");
    await expect(iceCreamTab).toHaveAttribute("aria-selected", "false");

    const historyLength = await page.evaluate(() => window.history.length);
    await cafeTab.click();
    await expect(page).toHaveURL(/type=cafe/);
    await expect(page).toHaveURL(new RegExp(`q=${dataset.runId}`));
    await expect(cafeTab).toHaveAttribute("aria-selected", "true");
    await expect(placesHarness.placeCardByName(dataset.places.cafeCoffee.name)).toBeVisible();
    expect(await page.evaluate(() => window.history.length)).toBe(historyLength);

    await iceCreamTab.click();
    await expect(page).toHaveURL(/type=ice_cream/);
    await expect(page).toHaveURL(new RegExp(`q=${dataset.runId}`));
    await expect(iceCreamTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".place-subtype-filter__trigger")).toHaveCount(0);
    await expect(placesHarness.placeCardByName(dataset.places.iceCream.name)).toBeVisible();

    await page.goto(`/places?type=cafe&q=${dataset.runId}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("tab", { name: "المقاهي" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(placesHarness.placeCardByName(dataset.places.cafeCoffee.name)).toBeVisible();

    await page.getByRole("tab", { name: "المطاعم" }).focus();
    await expect(page.getByRole("tab", { name: "المطاعم" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { selected: true })).not.toHaveText("المطاعم");
    await expect(page).toHaveURL(/type=(cafe|ice_cream)/);
  });

  test("loads detail and create states directly with deterministic authenticated data", async ({
    page,
    placesHarness
  }) => {
    const dataset = await placesHarness.resetFeature("PLACE-001");

    await placesHarness.loadPlaceDetail(dataset.places.restaurantBurger.id);
    await expect(page.getByRole("heading", { name: dataset.places.restaurantBurger.name })).toBeVisible();

    await placesHarness.loadCreatePlace({
      name: `${dataset.runId} Draft Place`,
      type: "restaurant"
    });
    await expect(page.locator("#place-name")).toHaveValue(`${dataset.runId} Draft Place`);
  });

  test("loads rating and add-to-list states directly with deterministic authenticated data", async ({
    page,
    placesHarness
  }) => {
    const dataset = await placesHarness.resetFeature("PLACE-001");

    await placesHarness.loadRatingState(dataset.places.restaurantItalian.id);
    await expect(page.locator(".rate-place-dialog")).toBeVisible();

    await placesHarness.loadAddToListState(dataset.places.restaurantUnrated.id);
    await expect(page.locator(".place-save-dialog")).toBeVisible();
    await expect(page.getByText(dataset.lists.ownedPrivate.name)).toBeVisible();
  });
});
