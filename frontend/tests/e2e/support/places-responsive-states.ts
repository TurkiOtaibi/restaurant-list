import type { Page } from "@playwright/test";

import type { PlacesAcceptanceHarness, PlacesDataset } from "./places-acceptance-harness";
import type { ResponsiveState } from "./responsive-viewport-harness";

type PlacesResponsiveHarness = Pick<
  PlacesAcceptanceHarness,
  | "loadAddToListState"
  | "loadCreatePlace"
  | "loadFilterState"
  | "loadPlaceDetail"
  | "loadPlacesList"
  | "loadRatingState"
>;

export function createPlacesResponsiveStates(
  page: Page,
  placesHarness: PlacesResponsiveHarness,
  dataset: PlacesDataset
): ResponsiveState[] {
  return [
    {
      name: "places-list",
      load: () => placesHarness.loadPlacesList({ query: dataset.runId, type: "restaurant" })
    },
    {
      name: "place-detail",
      load: () => placesHarness.loadPlaceDetail(dataset.places.restaurantBurger.id)
    },
    {
      name: "create-place",
      load: () =>
        placesHarness.loadCreatePlace({
          name: `${dataset.runId} Long English Arabic Draft`,
          type: "restaurant"
        })
    },
    {
      name: "filter-state",
      load: () =>
        placesHarness.loadFilterState({
          query: dataset.runId,
          subtype: "coffee",
          type: "cafe"
        })
    },
    {
      name: "rating-state",
      load: () => placesHarness.loadRatingState(dataset.places.restaurantItalian.id)
    },
    {
      name: "add-to-list-state",
      load: () => placesHarness.loadAddToListState(dataset.places.restaurantUnrated.id)
    },
    {
      name: "lists-screen",
      load: async () => {
        await page.goto("/lists");
      }
    }
  ];
}
