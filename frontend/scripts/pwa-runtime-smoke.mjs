import { chromium } from "@playwright/test";

const DEFAULT_BASE_URL = "http://localhost:3200";
const baseUrl = trimTrailingSlash(process.env.PWA_SMOKE_URL ?? DEFAULT_BASE_URL);
const expectedOfflineHeading = "\u0623\u0646\u062a \u063a\u064a\u0631 \u0645\u062a\u0635\u0644";

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

async function assertFrontendReady() {
  const response = await fetch(`${baseUrl}/api/health`);
  if (!response.ok) {
    throw new Error(`Frontend health failed at ${baseUrl}/api/health: ${response.status}`);
  }
}

async function runPwaSmoke() {
  await assertFrontendReady();

  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: baseUrl,
    locale: "ar-SA",
    serviceWorkers: "allow"
  });

  try {
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "load" });

    const serviceWorkerState = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) {
        return { ready: false, registrations: 0, supported: false };
      }

      const ready = await Promise.race([
        navigator.serviceWorker.ready.then(() => true),
        new Promise((resolve) => setTimeout(() => resolve(false), 10_000))
      ]);
      const registrations = await navigator.serviceWorker.getRegistrations();
      return {
        ready,
        registrations: registrations.length,
        supported: true
      };
    });

    if (
      !serviceWorkerState.supported ||
      !serviceWorkerState.ready ||
      serviceWorkerState.registrations < 1
    ) {
      throw new Error(`Service worker not ready: ${JSON.stringify(serviceWorkerState)}`);
    }

    await context.setOffline(true);
    const offlinePage = await context.newPage();
    await offlinePage.goto(`/offline-runtime-probe-${Date.now()}`, {
      waitUntil: "domcontentloaded"
    });

    const heading = await offlinePage.getByRole("heading").innerText();
    if (heading !== expectedOfflineHeading) {
      throw new Error(
        `Offline fallback heading mismatch: ${JSON.stringify({
          actual: heading,
          expected: expectedOfflineHeading
        })}`
      );
    }

    console.log(
      JSON.stringify({
        baseUrl,
        offlineHeading: heading,
        serviceWorker: serviceWorkerState,
        status: "pass"
      })
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

runPwaSmoke().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
