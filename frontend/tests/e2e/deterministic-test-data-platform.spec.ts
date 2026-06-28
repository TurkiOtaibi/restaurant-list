import { expect, test } from "@playwright/test";

import {
  buildDeterministicDataset,
  DeterministicTestDataPlatform
} from "./support/deterministic-test-data-platform";

test.describe("deterministic test data platform", () => {
  test("builds repeatable datasets with deterministic ordering and fixture ids", () => {
    const first = buildDeterministicDataset("places-20", { namespace: "QA Stable Dataset" });
    const second = buildDeterministicDataset("places-20", { namespace: "QA Stable Dataset" });

    expect(first).toEqual(second);
    expect(first.places).toHaveLength(20);
    expect(first.places[0]).toMatchObject({
      fixtureId: "qa-stable-dataset-place-0001",
      type: "restaurant"
    });
    expect(first.places[1]).toMatchObject({
      fixtureId: "qa-stable-dataset-place-0002",
      type: "cafe"
    });
    expect(first.places[2]).toMatchObject({
      fixtureId: "qa-stable-dataset-place-0003",
      type: "ice_cream"
    });
  });

  test("supports large and feature-specific reusable fixtures", () => {
    const large = new DeterministicTestDataPlatform().buildDataset("places-1000");
    const place004 = buildDeterministicDataset("feature-place-004");

    expect(large.places).toHaveLength(1000);
    expect(large.lists[0].placeFixtureIds).toHaveLength(8);
    expect(place004.places).toHaveLength(12);
    expect(place004.places.every((place) => place.type === "cafe")).toBe(true);
    expect(place004.places.every((place) => place.subtype === "coffee" || place.subtype === "tea")).toBe(true);
  });

  test("supports synthetic QA-only edge scenarios without production behavior changes", () => {
    const platform = new DeterministicTestDataPlatform();
    const malformed = buildDeterministicDataset("malformed-responses");
    const deleted = buildDeterministicDataset("deleted-places");
    const longArabic = buildDeterministicDataset("long-arabic-names");

    expect(malformed.malformedResponses.map((fixture) => fixture.fixtureId)).toEqual([
      "qa-malformed-responses-malformed-json",
      "qa-malformed-responses-empty-body",
      "qa-malformed-responses-private-field-response"
    ]);
    expect(deleted.places.every((place) => place.visibilityState === "deleted")).toBe(true);
    expect(longArabic.places[0].name).toContain("مطعم الاختبار الطويل");
    expect(platform.canSeedViaApi("deleted-places")).toBe(false);
    expect(platform.canSeedViaApi("duplicate-names")).toBe(false);
    expect(platform.canSeedViaApi("places-20")).toBe(true);
  });
});
