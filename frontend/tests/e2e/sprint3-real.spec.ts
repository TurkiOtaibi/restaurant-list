import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { expect, test } from "@playwright/test";

let apiProcess: ChildProcessWithoutNullStreams | undefined;
let apiOutput = "";
let apiExited = false;

test.beforeAll(async () => {
  const backendScript = path.resolve(
    process.cwd(),
    "..",
    "backend",
    "scripts",
    "start_e2e_api.py"
  );

  apiProcess = spawn(process.env.PYTHON ?? "python", [backendScript], {
    env: { ...process.env },
    stdio: "pipe"
  });

  apiProcess.stdout.on("data", (chunk) => {
    apiOutput += chunk.toString();
  });
  apiProcess.stderr.on("data", (chunk) => {
    apiOutput += chunk.toString();
  });
  apiProcess.on("exit", (code, signal) => {
    apiExited = true;
    apiOutput += `\nAPI exited with code ${code ?? "null"} and signal ${signal ?? "null"}.`;
  });

  await waitForApi();
});

test.afterAll(() => {
  apiProcess?.kill();
});

test("real frontend and api complete auth, create, search, and detail flow", async ({ page }) => {
  test.setTimeout(60_000);

  const unique = Date.now();
  const email = `e2e-${unique}@example.com`;
  const placeName = `محل آيس كريم ${unique}`;

  // Register -> redirected to the lists shell.
  await page.goto("/register");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.getByRole("button", { name: "إنشاء حساب" }).click();
  await expect(page).toHaveURL(/\/lists$/, { timeout: 15_000 });

  // Create an ice-cream place (no subtype required) via the create dialog.
  await page.goto("/places/new?type=ice_cream");
  await page.getByLabel("اسم المكان").fill(placeName);
  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  await expect(page.getByText("تم حفظ المكان.")).toBeVisible();
  await page.getByRole("button", { name: "إلغاء" }).click();

  // The new place appears in the ice-cream library.
  await expect(page).toHaveURL(/\/places\?type=ice_cream/);
  await expect(page.getByText(placeName)).toBeVisible();

  // Name search finds exactly one result, and a miss shows the empty state.
  await page.getByRole("searchbox", { name: "بحث" }).fill(placeName);
  await page.getByRole("button", { name: "بحث" }).click();
  await expect(page.getByRole("status")).toContainText("1 نتيجة");
  await expect(page.getByText(placeName)).toBeVisible();

  await page.getByRole("searchbox", { name: "بحث" }).fill("zzzzzznomatch");
  await page.getByRole("button", { name: "بحث" }).click();
  await expect(page.getByText("لا توجد نتائج")).toBeVisible();

  // Open the place detail and confirm the rate affordance is present.
  await page.getByRole("searchbox", { name: "بحث" }).fill(placeName);
  await page.getByRole("button", { name: "بحث" }).click();
  await page.getByText(placeName).click();
  await expect(page).toHaveURL(/\/places\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: placeName })).toBeVisible();
  await expect(page.getByRole("link", { name: "قيّم المكان" })).toBeVisible();
});

async function waitForApi() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (apiExited) {
      throw new Error(apiOutput);
    }

    try {
      const response = await fetch("http://localhost:8000/health/live");
      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting while the Python process starts Uvicorn.
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for the real API.\n${apiOutput}`);
}
