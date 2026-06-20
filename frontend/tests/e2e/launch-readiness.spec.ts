import fs from "node:fs";
import path from "node:path";

import { expect, type Page, type Route, test } from "@playwright/test";

const apiPattern = "http://localhost:8000/**";
const timestamp = "2026-06-19T00:00:00.000Z";
const axeSource = fs.readFileSync(
  path.resolve(process.cwd(), "node_modules", "axe-core", "axe.min.js"),
  "utf8"
);

type Place = {
  id: string;
  name: string;
  type: "restaurant" | "cafe";
  description: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
  ratingCount: number;
  currentUserRating: number | null;
  currentUserTried: boolean;
  currentUserListIds: string[];
  currentUserListNames: string[];
  currentUserListCount: number;
};

type UserList = {
  id: string;
  userId: string;
  name: string;
  visibility: "public" | "private";
  placeCount: number;
  createdAt: string;
  updatedAt: string;
};

type ListDetail = UserList & {
  items: Array<{ id: string; place: Place; createdAt: string }>;
};

type AxeViolation = {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical" | null;
  help: string;
  nodes: Array<{ target: string[]; failureSummary?: string }>;
};

type AxeResult = {
  violations: AxeViolation[];
};

declare global {
  interface Window {
    axe: {
      run: (context?: unknown, options?: unknown) => Promise<AxeResult>;
    };
  }
}

function makePlace(
  id: string,
  name: string,
  type: "restaurant" | "cafe",
  options: Partial<Pick<Place, "averageRating" | "currentUserRating" | "currentUserTried" | "ratingCount" | "currentUserListIds" | "currentUserListNames" | "currentUserListCount">> = {}
): Place {
  return {
    id,
    name,
    type,
    description: null,
    createdByUserId: "user-1",
    createdAt: timestamp,
    updatedAt: timestamp,
    averageRating: options.averageRating ?? null,
    currentUserRating: options.currentUserRating ?? null,
    currentUserTried: options.currentUserTried ?? false,
    currentUserListIds: options.currentUserListIds ?? [],
    currentUserListNames: options.currentUserListNames ?? [],
    currentUserListCount: options.currentUserListCount ?? 0,
    ratingCount: options.ratingCount ?? 0
  };
}

function makeList(
  id: string,
  name: string,
  items: ListDetail["items"],
  visibility: "public" | "private" = "private"
): ListDetail {
  return {
    id,
    userId: "user-1",
    name,
    visibility,
    placeCount: items.length,
    createdAt: timestamp,
    updatedAt: timestamp,
    items
  };
}

function listSummary(list: ListDetail): UserList {
  return {
    id: list.id,
    userId: list.userId,
    name: list.name,
    visibility: list.visibility,
    placeCount: list.items.length,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt
  };
}

async function setAuthenticated(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("restaurantWishlist.accessToken", "access-token");
  });
}

async function fulfillJson(route: Route, status: number, body: unknown) {
  const responseBody = Array.isArray(body)
    ? { data: body, meta: { limit: 100, offset: 0, total: body.length, sort: "created_at_desc" } }
    : body;

  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(responseBody)
  });
}

async function installApiMock(page: Page) {
  const restaurant = makePlace("place-1", "بيت الورد", "restaurant", {
    averageRating: 8.6,
    currentUserRating: 8,
    currentUserTried: true,
    currentUserListIds: ["list-1"],
    currentUserListNames: ["ليالي الرياض"],
    currentUserListCount: 1,
    ratingCount: 12
  });
  const cafe = makePlace("place-2", "Nara Cafe", "cafe", {
    averageRating: 9.1,
    ratingCount: 8
  });
  const list = makeList(
    "list-1",
    "ليالي الرياض",
    [{ id: "item-1", place: restaurant, createdAt: timestamp }],
    "public"
  );
  const places = [restaurant, cafe];
  const lists = [list];

  await page.route(apiPattern, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathName = url.pathname;
    const method = request.method();

    if (pathName === "/places" && method === "GET") {
      const query = url.searchParams.get("q")?.trim().toLowerCase();
      const result = query
        ? places.filter((place) => place.name.toLowerCase().includes(query))
        : places;
      return fulfillJson(route, 200, result);
    }

    if (pathName === "/lists" && method === "GET") {
      return fulfillJson(
        route,
        200,
        lists.map((candidate) => listSummary(candidate))
      );
    }

    if (pathName === "/lists/public" && method === "GET") {
      return fulfillJson(
        route,
        200,
        lists.filter((candidate) => candidate.visibility === "public").map(listSummary)
      );
    }

    if (pathName === "/profile" && method === "GET") {
      return fulfillJson(route, 200, {
        listCount: 1,
        triedRestaurantCount: 1,
        triedCafeCount: 0,
        ratingsCreatedCount: 1,
        userRatings: [
          {
            id: "rating-1",
            place: restaurant,
            rating: 8,
            notes: "ملاحظة خاصة",
            createdAt: timestamp,
            updatedAt: timestamp
          }
        ],
        triedPlaces: [restaurant]
      });
    }

    const publicListMatch = pathName.match(/^\/lists\/public\/([^/]+)$/);
    if (publicListMatch && method === "GET") {
      const found = lists.find((candidate) => candidate.id === publicListMatch[1]);
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "List not found." });
    }

    const listMatch = pathName.match(/^\/lists\/([^/]+)$/);
    if (listMatch && method === "GET") {
      const found = lists.find((candidate) => candidate.id === listMatch[1]);
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "List not found." });
    }

    const placeMatch = pathName.match(/^\/places\/([^/]+)$/);
    if (placeMatch && method === "GET") {
      const found = places.find((place) => place.id === placeMatch[1]);
      return fulfillJson(route, found ? 200 : 404, found ?? { detail: "Place not found." });
    }

    return fulfillJson(route, 404, { detail: "Unhandled mock route." });
  });
}

async function expectNoSeriousAxeViolations(page: Page) {
  const hasAxe = await page.evaluate(() => Boolean(window.axe));
  if (!hasAxe) {
    await page.addScriptTag({ content: axeSource });
  }
  const result = await page.evaluate(() =>
    window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
      }
    })
  );
  const blockingViolations = result.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical"
  );

  expect(
    blockingViolations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target.join(" "))
    }))
  ).toEqual([]);
}

test("launch readiness screens have no serious or critical automated accessibility violations", async ({
  page
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(axeSource);
  await installApiMock(page);

  for (const route of ["/login", "/register"]) {
    await page.goto(route);
    await expectNoSeriousAxeViolations(page);
  }

  await setAuthenticated(page);
  for (const route of ["/lists", "/restaurants", "/places/place-1", "/profile", "/lists/public"]) {
    await page.goto(route);
    await expectNoSeriousAxeViolations(page);
  }
});

test("launch readiness security headers are present", async ({ page }) => {
  const response = await page.goto("/health");

  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  expect(response?.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response?.headers()["permissions-policy"]).toContain("geolocation=()");
});
