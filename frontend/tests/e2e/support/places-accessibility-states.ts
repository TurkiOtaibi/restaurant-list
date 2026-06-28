import type { Page } from "@playwright/test";

import type { PlacesAcceptanceHarness, PlacesDataset } from "./places-acceptance-harness";
import { createPlacesResponsiveStates } from "./places-responsive-states";
import type { ResponsiveState } from "./responsive-viewport-harness";

type PlacesAccessibilityHarness = Pick<
  PlacesAcceptanceHarness,
  | "loadAddToListState"
  | "loadCreatePlace"
  | "loadFilterState"
  | "loadPlaceDetail"
  | "loadPlacesList"
  | "loadRatingState"
>;

export type AccessibilityFeatureState = ResponsiveState;

export function createPlacesAccessibilityStates(
  page: Page,
  placesHarness: PlacesAccessibilityHarness,
  dataset: PlacesDataset
): AccessibilityFeatureState[] {
  return createPlacesResponsiveStates(page, placesHarness, dataset).filter((state) =>
    ["places-list", "place-detail", "create-place", "filter-state", "rating-state", "add-to-list-state"].includes(
      state.name
    )
  );
}
