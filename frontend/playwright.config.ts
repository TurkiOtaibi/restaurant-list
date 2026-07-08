import { defineConfig, devices } from "@playwright/test";

const playwrightPort = process.env.PLAYWRIGHT_PORT ?? "3000";
const playwrightBaseUrl =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${playwrightPort}`;
const e2eApiPort = process.env.E2E_API_PORT ?? "8000";
const e2eApiBaseUrl = process.env.E2E_API_BASE_URL ?? `http://localhost:${e2eApiPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: playwrightBaseUrl,
    trace: "on-first-retry"
  },
  webServer: {
    command: `npm run dev -- --hostname localhost --port ${playwrightPort}`,
    env: {
      E2E_API_BASE_URL: e2eApiBaseUrl,
      E2E_API_PORT: e2eApiPort,
      E2E_FRONTEND_PORT: playwrightPort,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? e2eApiBaseUrl
    },
    url: playwrightBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
