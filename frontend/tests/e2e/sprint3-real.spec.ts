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

test("real frontend and api complete Sprint 3 auth, create, and name search flow", async ({
  page
}) => {
  test.setTimeout(60_000);

  const unique = Date.now();
  const email = `sprint3-${unique}@example.com`;
  const placeName = `مطعم الذاكرة ${unique}`;

  await page.goto("/register");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.getByRole("button", { name: "إنشاء حساب" }).click();
  await expect(page).toHaveURL(/\/lists$/, { timeout: 15_000 });

  await page.goto("/places/new?type=restaurant");
  await page.getByLabel("اسم المكان").fill(placeName);
  await page.getByRole("button", { name: "حفظ المكان" }).click();
  await expect(page.getByText("حفظنا")).toBeVisible();
  await page.getByRole("link", { name: "العودة للمطاعم" }).click();

  await expect(page.getByRole("heading", { name: placeName })).toBeVisible();
  await page.getByLabel("ابحث باسم مطعم").fill(placeName);
  await page.getByRole("button", { name: "ابحث" }).click();
  await expect(page.getByRole("status")).toContainText("نتيجة واحدة");
  await expect(page.getByRole("heading", { name: placeName })).toBeVisible();

  await page.getByLabel("ابحث باسم مطعم").fill("restaurant");
  await page.getByRole("button", { name: "ابحث" }).click();
  await expect(page.getByText("لا يوجد مطعم بهذا الاسم")).toBeVisible();
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
