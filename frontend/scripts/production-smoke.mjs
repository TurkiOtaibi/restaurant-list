import { chromium } from "@playwright/test";

const REQUIRED_ENV = [
  "PROD_SMOKE_EMAIL",
  "PROD_SMOKE_PASSWORD",
  "PROD_FRONTEND_URL",
  "PROD_BACKEND_URL"
];

const checkConfigOnly = process.argv.includes("--check-config");
const mutationRequested = process.env.PROD_SMOKE_ALLOW_MUTATION === "1";

function readConfig() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
  const config = {
    email: process.env.PROD_SMOKE_EMAIL?.trim() ?? "",
    password: process.env.PROD_SMOKE_PASSWORD ?? "",
    frontendUrl: trimTrailingSlash(process.env.PROD_FRONTEND_URL?.trim() ?? ""),
    backendUrl: trimTrailingSlash(process.env.PROD_BACKEND_URL?.trim() ?? "")
  };
  return { config, missing };
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function frontendPath(config, path) {
  return `${config.frontendUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function requireOk(url, label) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${response.statusText}`);
  }
  return response;
}

async function gotoAndCheck(page, config, path, label) {
  await page.goto(frontendPath(config, path), { waitUntil: "networkidle", timeout: 45_000 });
  await page.locator("main").waitFor({ timeout: 20_000 });
  await assertNoHorizontalOverflow(page, label);
  await assertRtl(page, label);
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  if (metrics.scrollWidth > metrics.clientWidth || metrics.bodyScrollWidth > metrics.clientWidth) {
    throw new Error(
      `${label} has horizontal overflow: scrollWidth=${metrics.scrollWidth}, bodyScrollWidth=${metrics.bodyScrollWidth}, clientWidth=${metrics.clientWidth}`
    );
  }
}

async function assertRtl(page, label) {
  const dir = await page.evaluate(() => document.documentElement.dir);
  if (dir !== "rtl") {
    throw new Error(`${label} document direction is ${dir || "(empty)"}, expected rtl`);
  }
}

async function assertBodyIncludes(page, text, label) {
  const bodyText = await page.locator("body").innerText({ timeout: 15_000 });
  if (!bodyText.includes(text)) {
    throw new Error(`${label} did not include expected text: ${text}`);
  }
}

async function firstPlaceDetailHref(page) {
  return page.locator('a[href^="/places/"]').evaluateAll((links) => {
    const hrefs = links
      .map((link) => link.getAttribute("href"))
      .filter(Boolean);
    return hrefs.find((href) => /^\/places\/[^/?#]+$/.test(href ?? "")) ?? null;
  });
}

async function login(page, config) {
  await gotoAndCheck(page, config, "/login", "login page");
  await page.locator('input[name="email"]').fill(config.email);
  await page.locator('input[name="password"]').fill(config.password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((url) => url.pathname !== "/login", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForLoadState("networkidle", { timeout: 45_000 });

  const stillOnLogin = new URL(page.url()).pathname === "/login";
  const loginErrorVisible = await page
    .locator('[role="alert"], .ds-status-message')
    .filter({ hasText: /تعذر|خطأ|Invalid|failed/i })
    .first()
    .isVisible()
    .catch(() => false);

  if (stillOnLogin || loginErrorVisible) {
    throw new Error("Production smoke login failed or did not leave /login. Verify PROD_SMOKE_EMAIL and PROD_SMOKE_PASSWORD.");
  }
}

async function runSmoke() {
  const { config, missing } = readConfig();

  if (checkConfigOnly) {
    console.log("Production smoke script loaded.");
    if (missing.length > 0) {
      console.log(`Missing required env vars: ${missing.join(", ")}`);
      console.log("No production requests were made.");
      return;
    }
    console.log("All required env vars are present. No production requests were made.");
    return;
  }

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  if (mutationRequested) {
    throw new Error(
      "PROD_SMOKE_ALLOW_MUTATION=1 was set, but this smoke runner is intentionally read-only. Use a separately approved cleanup-capable mutation script."
    );
  }

  await requireOk(`${config.frontendUrl}/api/health`, "frontend health");
  await requireOk(`${config.backendUrl}/health/live`, "backend live");
  await requireOk(`${config.backendUrl}/health/ready`, "backend readiness");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    isMobile: true,
    locale: "ar-SA",
    viewport: { height: 844, width: 390 }
  });
  const page = await context.newPage();

  try {
    await login(page, config);

    await gotoAndCheck(page, config, "/profile", "profile");
    await assertBodyIncludes(page, "المفضلة", "profile favorites section");
    await assertBodyIncludes(page, "رغباتي", "profile wishlist section");

    await gotoAndCheck(page, config, "/places", "places");
    await assertBodyIncludes(page, "الأماكن", "places");
    const placeHref = await firstPlaceDetailHref(page);
    if (!placeHref) {
      throw new Error("No place detail link found on /places. Approved smoke account/catalog must expose at least one place.");
    }

    await gotoAndCheck(page, config, placeHref, "place detail");
    await gotoAndCheck(page, config, `${placeHref}/rate`, "rating flow");

    await gotoAndCheck(page, config, "/lists", "lists");
    await assertBodyIncludes(page, "قوائمي", "lists");

    await gotoAndCheck(page, config, "/lists/public", "public lists");

    console.log("Production authenticated smoke passed.");
  } finally {
    await context.close();
    await browser.close();
  }
}

runSmoke().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
