import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

test("UI dependency policy keeps Radix absent", () => {
  const dependencyFiles = `${readFileSync("package.json", "utf8")}\n${readFileSync(
    "package-lock.json",
    "utf8"
  )}`;

  expect(dependencyFiles).not.toContain("@radix-ui/");
  expect(dependencyFiles.toLowerCase()).not.toContain("radix-ui");
});
