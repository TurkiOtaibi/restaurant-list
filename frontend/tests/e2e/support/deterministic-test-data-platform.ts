import { E2E_TEST_PASSWORD, e2eApiRequest, registerE2eApiUser } from "./e2e-api-client";

export type DeterministicDatasetId =
  | "empty-catalog"
  | "places-20"
  | "places-60"
  | "places-100"
  | "places-200"
  | "places-500"
  | "places-1000"
  | "restaurant-only"
  | "cafe-only"
  | "mixed-categories"
  | "duplicate-places"
  | "duplicate-names"
  | "hidden-places"
  | "private-places"
  | "deleted-places"
  | "long-arabic-names"
  | "long-english-names"
  | "mixed-rtl-ltr"
  | "high-ratings"
  | "low-ratings"
  | "no-ratings"
  | "favorite-places"
  | "owned-places"
  | "shared-places"
  | "large-lists"
  | "multiple-pages"
  | "pagination-overlap"
  | "malformed-responses"
  | "private-field-scenarios"
  | "feature-place-001"
  | "feature-place-002"
  | "feature-place-004"
  | "feature-place-005";

export type DeterministicPlaceType = "restaurant" | "cafe" | "ice_cream";
export type DeterministicPlaceSubtype =
  | "american"
  | "burger"
  | "coffee"
  | "italian"
  | "other"
  | "tea";
export type DeterministicVisibilityState = "deleted" | "hidden" | "private" | "shared" | "visible";

export type DeterministicPlaceFixture = {
  description: string;
  duplicateGroup?: string;
  favorite?: boolean;
  fixtureId: string;
  name: string;
  owned?: boolean;
  rating?: number;
  shared?: boolean;
  subtype: DeterministicPlaceSubtype | null;
  type: DeterministicPlaceType;
  visibilityState: DeterministicVisibilityState;
};

export type DeterministicListFixture = {
  fixtureId: string;
  name: string;
  placeFixtureIds: string[];
  visibility: "private" | "public";
};

export type DeterministicMalformedResponseFixture = {
  body: string;
  contentType: string;
  fixtureId: string;
  status: number;
};

export type DeterministicDataset = {
  id: DeterministicDatasetId;
  lists: DeterministicListFixture[];
  malformedResponses: DeterministicMalformedResponseFixture[];
  namespace: string;
  places: DeterministicPlaceFixture[];
};

export type DeterministicDatasetOptions = {
  namespace?: string;
};

type DatasetRecipe = {
  categoryMode: "cafe" | "mixed" | "restaurant";
  count: number;
  duplicateNames?: boolean;
  listSize?: number;
  malformedResponses?: boolean;
  nameMode?: "arabic" | "english" | "mixed";
  privateFieldScenarios?: boolean;
  ratingMode?: "high" | "low" | "none" | "spread";
  visibilityState?: DeterministicVisibilityState;
};

export const DETERMINISTIC_DATASET_RECIPES: Record<DeterministicDatasetId, DatasetRecipe> = {
  "empty-catalog": { categoryMode: "mixed", count: 0 },
  "places-20": { categoryMode: "mixed", count: 20 },
  "places-60": { categoryMode: "mixed", count: 60 },
  "places-100": { categoryMode: "mixed", count: 100 },
  "places-200": { categoryMode: "mixed", count: 200 },
  "places-500": { categoryMode: "mixed", count: 500 },
  "places-1000": { categoryMode: "mixed", count: 1000 },
  "restaurant-only": { categoryMode: "restaurant", count: 60 },
  "cafe-only": { categoryMode: "cafe", count: 60 },
  "mixed-categories": { categoryMode: "mixed", count: 60 },
  "duplicate-places": { categoryMode: "mixed", count: 24, duplicateNames: true },
  "duplicate-names": { categoryMode: "mixed", count: 24, duplicateNames: true },
  "hidden-places": { categoryMode: "mixed", count: 24, visibilityState: "hidden" },
  "private-places": { categoryMode: "mixed", count: 24, visibilityState: "private" },
  "deleted-places": { categoryMode: "mixed", count: 24, visibilityState: "deleted" },
  "long-arabic-names": { categoryMode: "mixed", count: 24, nameMode: "arabic" },
  "long-english-names": { categoryMode: "mixed", count: 24, nameMode: "english" },
  "mixed-rtl-ltr": { categoryMode: "mixed", count: 24, nameMode: "mixed" },
  "high-ratings": { categoryMode: "mixed", count: 24, ratingMode: "high" },
  "low-ratings": { categoryMode: "mixed", count: 24, ratingMode: "low" },
  "no-ratings": { categoryMode: "mixed", count: 24, ratingMode: "none" },
  "favorite-places": { categoryMode: "mixed", count: 24 },
  "owned-places": { categoryMode: "mixed", count: 24, visibilityState: "visible" },
  "shared-places": { categoryMode: "mixed", count: 24, visibilityState: "shared" },
  "large-lists": { categoryMode: "mixed", count: 120, listSize: 100 },
  "multiple-pages": { categoryMode: "mixed", count: 120 },
  "pagination-overlap": { categoryMode: "mixed", count: 45 },
  "malformed-responses": { categoryMode: "mixed", count: 0, malformedResponses: true },
  "private-field-scenarios": { categoryMode: "mixed", count: 8, privateFieldScenarios: true },
  "feature-place-001": { categoryMode: "mixed", count: 8, nameMode: "mixed" },
  "feature-place-002": { categoryMode: "mixed", count: 20 },
  "feature-place-004": { categoryMode: "cafe", count: 12 },
  "feature-place-005": { categoryMode: "mixed", count: 16, ratingMode: "spread" }
};

export class DeterministicTestDataPlatform {
  buildDataset(id: DeterministicDatasetId, options: DeterministicDatasetOptions = {}): DeterministicDataset {
    return buildDeterministicDataset(id, options);
  }

  canSeedViaApi(id: DeterministicDatasetId): boolean {
    const recipe = DETERMINISTIC_DATASET_RECIPES[id];
    return !recipe.duplicateNames && ["shared", "visible"].includes(recipe.visibilityState ?? "visible");
  }

  async seedViaApi(id: DeterministicDatasetId, options: DeterministicDatasetOptions = {}): Promise<SeededDeterministicDataset> {
    if (!this.canSeedViaApi(id)) {
      throw new Error(`Dataset ${id} is synthetic-only and cannot be seeded through current product APIs.`);
    }

    const dataset = this.buildDataset(id, options);
    const user = await registerApiUser(dataset.namespace);
    const placeIdMap = new Map<string, string>();

    for (const place of dataset.places.filter((fixture) => fixture.visibilityState !== "deleted")) {
      const response = await apiRequest<SeededPlace>(user.accessToken, "/places", {
        body: JSON.stringify({
          description: place.description,
          name: place.name,
          subtype: place.subtype,
          type: place.type
        }),
        method: "POST"
      });
      placeIdMap.set(place.fixtureId, response.id);

      if (place.rating !== undefined) {
        await apiRequest(user.accessToken, "/ratings", {
          body: JSON.stringify({ placeId: response.id, rating: place.rating }),
          method: "POST"
        });
      }
    }

    const listIdMap = new Map<string, string>();
    for (const list of dataset.lists) {
      const response = await apiRequest<SeededList>(user.accessToken, "/lists", {
        body: JSON.stringify({ name: list.name, visibility: list.visibility }),
        method: "POST"
      });
      listIdMap.set(list.fixtureId, response.id);

      for (const placeFixtureId of list.placeFixtureIds) {
        const placeId = placeIdMap.get(placeFixtureId);
        if (placeId) {
          await apiRequest(user.accessToken, `/lists/${response.id}/items`, {
            body: JSON.stringify({ placeId }),
            method: "POST"
          });
        }
      }
    }

    return {
      dataset,
      listIdsByFixtureId: Object.fromEntries(listIdMap),
      placeIdsByFixtureId: Object.fromEntries(placeIdMap),
      user
    };
  }

  async cleanupSeededListsViaApi(seed: SeededDeterministicDataset): Promise<void> {
    for (const listId of Object.values(seed.listIdsByFixtureId)) {
      await apiRequest(seed.user.accessToken, `/lists/${listId}`, { method: "DELETE" });
    }
  }
}

export type SeededDeterministicDataset = {
  dataset: DeterministicDataset;
  listIdsByFixtureId: Record<string, string>;
  placeIdsByFixtureId: Record<string, string>;
  user: {
    accessToken: string;
    displayName: string;
    email: string;
  };
};

type SeededPlace = {
  id: string;
};

type SeededList = {
  id: string;
};

export function buildDeterministicDataset(
  id: DeterministicDatasetId,
  options: DeterministicDatasetOptions = {}
): DeterministicDataset {
  const recipe = DETERMINISTIC_DATASET_RECIPES[id];
  const namespace = sanitizeNamespace(options.namespace ?? `qa-${id}`);
  const places = Array.from({ length: recipe.count }, (_, index) => buildPlaceFixture(recipe, namespace, index));
  const visiblePlaceIds = places
    .filter((place) => place.visibilityState !== "deleted")
    .map((place) => place.fixtureId);

  return {
    id,
    lists: buildLists(recipe, namespace, visiblePlaceIds),
    malformedResponses: recipe.malformedResponses ? buildMalformedResponses(namespace) : [],
    namespace,
    places: recipe.privateFieldScenarios ? appendPrivateFieldScenarios(places, namespace) : places
  };
}

function buildPlaceFixture(
  recipe: DatasetRecipe,
  namespace: string,
  index: number
): DeterministicPlaceFixture {
  const type = placeTypeFor(recipe.categoryMode, index);
  const subtype = subtypeFor(type, index);
  const ordinal = String(index + 1).padStart(4, "0");
  const duplicateGroup = recipe.duplicateNames ? `duplicate-${Math.floor(index / 2) + 1}` : undefined;
  const baseName = recipe.duplicateNames ? `${namespace} Duplicate ${Math.floor(index / 2) + 1}` : `${namespace} ${ordinal}`;

  return {
    description: `Deterministic QA fixture ${ordinal} for ${namespace}.`,
    duplicateGroup,
    favorite: index % 5 === 0,
    fixtureId: `${namespace}-place-${ordinal}`,
    name: nameFor(recipe.nameMode, baseName, index),
    owned: index % 3 === 0,
    rating: ratingFor(recipe.ratingMode, index),
    shared: recipe.visibilityState === "shared" || index % 7 === 0,
    subtype,
    type,
    visibilityState: recipe.visibilityState ?? "visible"
  };
}

function buildLists(
  recipe: DatasetRecipe,
  namespace: string,
  placeFixtureIds: string[]
): DeterministicListFixture[] {
  if (placeFixtureIds.length === 0) {
    return [];
  }

  const listSize = Math.min(recipe.listSize ?? 8, placeFixtureIds.length);
  return [
    {
      fixtureId: `${namespace}-list-private`,
      name: `${namespace} Private QA List`,
      placeFixtureIds: placeFixtureIds.slice(0, listSize),
      visibility: "private"
    },
    {
      fixtureId: `${namespace}-list-public`,
      name: `${namespace} Public QA List`,
      placeFixtureIds: placeFixtureIds.slice(Math.max(0, placeFixtureIds.length - listSize)),
      visibility: "public"
    }
  ];
}

function buildMalformedResponses(namespace: string): DeterministicMalformedResponseFixture[] {
  return [
    {
      body: "{ malformed-json",
      contentType: "application/json",
      fixtureId: `${namespace}-malformed-json`,
      status: 200
    },
    {
      body: "",
      contentType: "application/json",
      fixtureId: `${namespace}-empty-body`,
      status: 200
    },
    {
      body: JSON.stringify({ createdByUserId: "qa-private-user", internalScore: 99 }),
      contentType: "application/json",
      fixtureId: `${namespace}-private-field-response`,
      status: 200
    }
  ];
}

function appendPrivateFieldScenarios(
  places: DeterministicPlaceFixture[],
  namespace: string
): DeterministicPlaceFixture[] {
  return places.map((place, index) => ({
    ...place,
    description: `${place.description} QA private-field probe ${namespace}-${index + 1}.`
  }));
}

function placeTypeFor(mode: DatasetRecipe["categoryMode"], index: number): DeterministicPlaceType {
  if (mode === "restaurant") {
    return "restaurant";
  }
  if (mode === "cafe") {
    return "cafe";
  }
  return (["restaurant", "cafe", "ice_cream"] as const)[index % 3];
}

function subtypeFor(
  type: DeterministicPlaceType,
  index: number
): DeterministicPlaceSubtype | null {
  if (type === "restaurant") {
    return (["burger", "italian", "american", "other"] as const)[index % 4];
  }
  if (type === "cafe") {
    return index % 2 === 0 ? "coffee" : "tea";
  }
  return null;
}

function ratingFor(mode: DatasetRecipe["ratingMode"], index: number): number | undefined {
  if (mode === "none") {
    return undefined;
  }
  if (mode === "high") {
    return [8.5, 9, 9.5, 10][index % 4];
  }
  if (mode === "low") {
    return [1, 1.5, 2, 2.5][index % 4];
  }
  if (mode === "spread") {
    return [1, 3.5, 5, 7.5, 10][index % 5];
  }
  return index % 2 === 0 ? [6, 7.5, 8.5, 9.5][index % 4] : undefined;
}

function nameFor(mode: DatasetRecipe["nameMode"], baseName: string, index: number): string {
  const arabic = `مطعم الاختبار الطويل رقم ${index + 1} فرع الرياض حي النخيل`;
  const english = `Very Long Deterministic English Place Name Number ${index + 1} Riyadh Branch`;
  if (mode === "arabic") {
    return `${baseName} ${arabic}`;
  }
  if (mode === "english") {
    return `${baseName} ${english}`;
  }
  if (mode === "mixed") {
    return `${baseName} ${arabic} ${english}`;
  }
  return `${baseName} Place`;
}

function sanitizeNamespace(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
}

async function registerApiUser(namespace: string): Promise<SeededDeterministicDataset["user"]> {
  const email = `${namespace}@example.com`;
  const displayName = `QA ${namespace}`;
  const user = await registerE2eApiUser({
    displayName,
    email,
    failureMessage: "Failed to register deterministic QA user",
    password: E2E_TEST_PASSWORD
  });
  return {
    accessToken: user.accessToken,
    displayName,
    email
  };
}

async function apiRequest<T = unknown>(
  accessToken: string,
  path: string,
  options: RequestInit
): Promise<T> {
  return e2eApiRequest<T>({
    accessToken,
    path,
    requestInit: options,
    responseFailureMessage: (method, requestPath, response, body) =>
      `Deterministic data API request failed ${method} ${requestPath}: ${response.status} ${body}`
  });
}
