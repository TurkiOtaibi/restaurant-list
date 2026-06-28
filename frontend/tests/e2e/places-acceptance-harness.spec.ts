import { expect, test } from "./support/places-acceptance-harness";

test.describe("focused authenticated Places acceptance harness", () => {
  test("loads Places feature states directly with deterministic authenticated data", async ({
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

    await placesHarness.loadPlaceDetail(dataset.places.restaurantBurger.id);
    await expect(page.getByRole("heading", { name: dataset.places.restaurantBurger.name })).toBeVisible();

    await placesHarness.loadCreatePlace({
      name: `${dataset.runId} Draft Place`,
      type: "restaurant"
    });
    await expect(page.locator("#place-name")).toHaveValue(`${dataset.runId} Draft Place`);

    await placesHarness.loadRatingState(dataset.places.restaurantItalian.id);
    await expect(page.locator(".rate-place-dialog")).toBeVisible();

    await placesHarness.loadAddToListState(dataset.places.restaurantUnrated.id);
    await expect(page.locator(".place-save-dialog")).toBeVisible();
    await expect(page.getByText(dataset.lists.ownedPrivate.name)).toBeVisible();
  });
});
