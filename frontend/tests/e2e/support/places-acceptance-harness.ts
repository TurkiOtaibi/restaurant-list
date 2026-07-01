import { expect, test as base, type BrowserContext, type Page } from "@playwright/test";

import { ensureE2eApiServer, stopE2eApiServer } from "./e2e-api-server";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:8000";
const SESSION_MARKER_KEY = "restaurantWishlist.hasSession";
const TEST_PASSWORD = "password123";

export type PlacesFeatureId =
  | "PLACE-001"
  | "PLACE-002"
  | "PLACE-003"
  | "PLACE-004"
  | "PLACE-005"
  | "PLACE-006"
  | "PLACE-007"
  | "PLACE-008"
  | "PLACE-009"
  | "PLACE-010"
  | "PLACE-011"
  | "PLACE-012"
  | "PLACE-013"
  | "PLACE-014"
  | "PLACE-015"
  | "PLACE-016"
  | "PLACE-017"
  | "PLACE-018"
  | "PLACE-019"
  | "PLACE-020"
  | "PLACE-HARNESS";

export type PlaceType = "restaurant" | "cafe" | "ice_cream";
export type RestaurantSubtype =
  | "burger"
  | "italian"
  | "american"
  | "steak"
  | "grill"
  | "shawarma"
  | "saudi"
  | "gulf"
  | "indian"
  | "asian"
  | "seafood"
  | "breakfast"
  | "healthy"
  | "other";
export type CafeSubtype = "coffee" | "tea";
export type PlaceSubtype = RestaurantSubtype | CafeSubtype;

export type ApiPlace = {
  id: string;
  name: string;
  type: PlaceType;
  subtype: PlaceSubtype | null;
  description: string | null;
  averageRating: number | null;
  ratingCount: number;
};

export type ApiList = {
  id: string;
  name: string;
  visibility: "public" | "private";
  placeCount: number;
};

export type PlacesDataset = {
  featureId: PlacesFeatureId;
  runId: string;
  user: {
    accessToken: string;
    displayName: string;
    email: string;
  };
  places: {
    restaurantBurger: ApiPlace;
    restaurantItalian: ApiPlace;
    restaurantUnrated: ApiPlace;
    cafeCoffee: ApiPlace;
    cafeTea: ApiPlace;
    iceCream: ApiPlace;
    mixedName: ApiPlace;
  };
  lists: {
    ownedPrivate: ApiList;
    ownedPublic: ApiList;
  };
};

type AuthResponse = {
  accessToken: string;
  user: {
    displayName: string;
    email: string;
    id: string;
  };
};

type PlacesFixtures = {
  placesHarness: PlacesAcceptanceHarness;
};

export const test = base.extend<PlacesFixtures>({
  placesHarness: async ({ context, page }, runFixture) => {
    await ensureE2eApiServer();
    const harness = new PlacesAcceptanceHarness(page, context);
    await runFixture(harness);
  }
});

test.afterAll(async () => {
  await stopE2eApiServer();
});

export { expect };

export class PlacesAcceptanceHarness {
  dataset: PlacesDataset | null = null;

  constructor(
    readonly page: Page,
    private readonly context: BrowserContext
  ) {}

  async resetFeature(featureId: PlacesFeatureId): Promise<PlacesDataset> {
    const runId = makeRunId(featureId);
    await this.page.goto("about:blank");
    await this.context.clearCookies();
    const user = await registerApiUser(runId);
    await installRefreshCookie(this.context, user.refreshCookie);
    await installSessionMarker(this.context);
    const dataset = await seedPlacesDataset(featureId, runId, user.accessToken);
    this.dataset = {
      featureId,
      runId,
      user: {
        accessToken: user.accessToken,
        displayName: user.displayName,
        email: user.email
      },
      ...dataset
    };
    return this.dataset;
  }

  async loadPlacesList(options: {
    type?: PlaceType;
    subtype?: PlaceSubtype;
    query?: string;
  } = {}): Promise<void> {
    const params = new URLSearchParams();
    params.set("type", options.type ?? "restaurant");
    if (options.subtype) {
      params.set("subtype", options.subtype);
    }
    if (options.query) {
      params.set("q", options.query);
    }

    await this.gotoFeatureState(`/places?${params.toString()}`);
    await expect(this.page.locator(".place-library-page")).toBeVisible({ timeout: 30_000 });
    await expect(this.page.locator(".place-memory-list, .ds-empty, .place-library-loading")).toBeVisible({
      timeout: 30_000
    });
  }

  async loadPlaceDetail(placeId: string): Promise<void> {
    await this.gotoFeatureState(`/places/${placeId}`);
    await expect(this.page.locator(".place-detail-page")).toBeVisible({ timeout: 30_000 });
    await expect(this.page.locator("#place-detail-title")).toBeVisible({ timeout: 30_000 });
  }

  async loadCreatePlace(options: { type?: PlaceType; name?: string } = {}): Promise<void> {
    const params = new URLSearchParams();
    params.set("type", options.type ?? "restaurant");
    if (options.name) {
      params.set("name", options.name);
    }

    await this.gotoFeatureState(`/places/new?${params.toString()}`);
    await expect(this.page.locator(".create-place-dialog")).toBeVisible({ timeout: 30_000 });
    await expect(this.page.locator("#place-name")).toBeVisible();
  }

  async loadFilterState(options: {
    type: Exclude<PlaceType, "ice_cream">;
    subtype: PlaceSubtype;
    query?: string;
  }): Promise<void> {
    await this.loadPlacesList(options);
    await expect(this.page).toHaveURL(new RegExp(`type=${options.type}`));
    await expect(this.page).toHaveURL(new RegExp(`subtype=${options.subtype}`));
  }

  async loadRatingState(placeId: string): Promise<void> {
    await this.gotoFeatureState(`/places/${placeId}/rate`);
    await expect(this.page.locator(".rate-place-dialog")).toBeVisible({ timeout: 30_000 });
  }

  async loadAddToListState(placeId: string): Promise<void> {
    await this.loadPlaceDetail(placeId);
    await this.page.locator(".place-detail-hero__actions button").first().click();
    await expect(this.page.locator(".place-save-dialog")).toBeVisible({ timeout: 30_000 });
  }

  placeCardByName(name: string) {
    return this.page.locator(".ds-place-card", { hasText: name });
  }

  private async gotoFeatureState(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }
}

async function registerApiUser(runId: string): Promise<{
  accessToken: string;
  displayName: string;
  email: string;
  refreshCookie: string;
}> {
  const email = `${runId}@example.com`;
  const displayName = `QA ${runId}`;
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    body: JSON.stringify({ displayName, email, password: TEST_PASSWORD }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Failed to register Places QA user: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as AuthResponse;
  return {
    accessToken: payload.accessToken,
    displayName,
    email,
    refreshCookie: extractRefreshCookie(response.headers)
  };
}

async function installRefreshCookie(context: BrowserContext, refreshCookie: string): Promise<void> {
  const apiUrl = new URL(API_BASE_URL);
  const [nameValue] = refreshCookie.split(";");
  const separator = nameValue.indexOf("=");
  if (separator < 1) {
    throw new Error(`Invalid refresh cookie header: ${refreshCookie}`);
  }

  await context.addCookies([
    {
      domain: apiUrl.hostname,
      httpOnly: true,
      name: nameValue.slice(0, separator),
      path: "/api/v1/auth",
      sameSite: "Lax",
      secure: apiUrl.protocol === "https:",
      value: nameValue.slice(separator + 1)
    }
  ]);
}

async function installSessionMarker(context: BrowserContext): Promise<void> {
  await context.addInitScript((key) => {
    window.localStorage.setItem(key, "1");
  }, SESSION_MARKER_KEY);
}

async function seedPlacesDataset(
  featureId: PlacesFeatureId,
  runId: string,
  accessToken: string
): Promise<Pick<PlacesDataset, "places" | "lists">> {
  const prefix = `${featureId} ${runId}`;
  const restaurantBurger = await createPlace(accessToken, {
    name: `${prefix} Burger Anchor`,
    type: "restaurant",
    subtype: "burger",
    description: "Deterministic burger fixture for Places acceptance QA."
  });
  const restaurantItalian = await createPlace(accessToken, {
    name: `${prefix} Casa Anchor`,
    type: "restaurant",
    subtype: "italian",
    description: "Deterministic Italian fixture for Places acceptance QA."
  });
  const restaurantUnrated = await createPlace(accessToken, {
    name: `${prefix} Unrated Anchor`,
    type: "restaurant",
    subtype: "other"
  });
  const mixedName = await createPlace(accessToken, {
    name: `${prefix} Five Guys KAFD Mixed Name`,
    type: "restaurant",
    subtype: "american"
  });
  const cafeCoffee = await createPlace(accessToken, {
    name: `${prefix} Coffee Anchor`,
    type: "cafe",
    subtype: "coffee"
  });
  const cafeTea = await createPlace(accessToken, {
    name: `${prefix} Tea Anchor`,
    type: "cafe",
    subtype: "tea"
  });
  const iceCream = await createPlace(accessToken, {
    name: `${prefix} Ice Cream Anchor`,
    type: "ice_cream",
    subtype: null
  });

  await ratePlace(accessToken, restaurantBurger.id, 9.5);
  await ratePlace(accessToken, restaurantItalian.id, 8.5);
  await ratePlace(accessToken, cafeCoffee.id, 7.5);

  const ownedPrivate = await createList(accessToken, `${prefix} Private List`, "private");
  const ownedPublic = await createList(accessToken, `${prefix} Public List`, "public");
  await addPlaceToList(accessToken, ownedPrivate.id, restaurantBurger.id);
  await addPlaceToList(accessToken, ownedPublic.id, restaurantItalian.id);

  return {
    lists: { ownedPrivate, ownedPublic },
    places: {
      cafeCoffee,
      cafeTea,
      iceCream,
      mixedName,
      restaurantBurger,
      restaurantItalian,
      restaurantUnrated
    }
  };
}

async function createPlace(
  accessToken: string,
  payload: {
    name: string;
    type: PlaceType;
    subtype: PlaceSubtype | null;
    description?: string;
  }
): Promise<ApiPlace> {
  return apiRequest<ApiPlace>("/places", accessToken, {
    body: JSON.stringify(payload),
    method: "POST"
  });
}

async function createList(
  accessToken: string,
  name: string,
  visibility: "public" | "private"
): Promise<ApiList> {
  return apiRequest<ApiList>("/lists", accessToken, {
    body: JSON.stringify({ name, visibility }),
    method: "POST"
  });
}

async function addPlaceToList(accessToken: string, listId: string, placeId: string): Promise<void> {
  await apiRequest(`/lists/${listId}/items`, accessToken, {
    body: JSON.stringify({ placeId }),
    method: "POST"
  });
}

async function ratePlace(accessToken: string, placeId: string, rating: number): Promise<void> {
  await apiRequest("/ratings", accessToken, {
    body: JSON.stringify({ placeId, rating }),
    method: "POST"
  });
}

async function apiRequest<T = unknown>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${accessToken}`);

  const url = `${API_BASE_URL}/api/v1${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (error) {
    throw new Error(`API request failed to reach ${options.method ?? "GET"} ${url}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new Error(`API request failed ${options.method ?? "GET"} ${path}: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as T;
}

function extractRefreshCookie(headers: Headers): string {
  const headerWithGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headerWithGetSetCookie.getSetCookie?.() ?? [headers.get("set-cookie")].filter(Boolean);
  const refreshCookie = cookies.find((cookie) => cookie.startsWith("restaurant_refresh_token="));
  if (!refreshCookie) {
    throw new Error("Auth API response did not include the refresh cookie.");
  }
  return refreshCookie;
}

function makeRunId(featureId: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${featureId.toLowerCase()}-${Date.now()}-${random}`.replace(/[^a-z0-9-]/g, "-");
}

export async function createApiUser(email: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    body: JSON.stringify({ displayName: "QA API User", email, password: TEST_PASSWORD }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Failed to create API user: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as AuthResponse;
  return payload.accessToken;
}

export async function createApiPlace(
  accessToken: string,
  name: string,
  type: PlaceType,
  subtype: PlaceSubtype | null
): Promise<ApiPlace> {
  return createPlace(accessToken, { name, type, subtype });
}

export async function rateApiPlace(
  accessToken: string,
  placeId: string,
  rating: number
): Promise<void> {
  await ratePlace(accessToken, placeId, rating);
}
