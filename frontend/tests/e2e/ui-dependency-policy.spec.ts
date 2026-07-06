import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ALLOWED_BASE_UI_IMPORTS = new Set([
  "@base-ui/react/checkbox",
  "@base-ui/react/field",
  "@base-ui/react/input",
  "@base-ui/react/switch",
  "@base-ui/react/tabs",
  "@base-ui/react/tooltip"
]);

test("UI dependency policy keeps Radix absent", () => {
  const dependencyFiles = `${readFileSync("package.json", "utf8")}\n${readFileSync(
    "package-lock.json",
    "utf8"
  )}`;

  expect(dependencyFiles).not.toContain("@radix-ui/");
  expect(dependencyFiles.toLowerCase()).not.toContain("radix-ui");
});

test("UI dependency policy limits Base UI imports to released primitives", () => {
  const sourceFiles = collectSourceFiles(["app", "src"]);
  const baseUiImports = sourceFiles.flatMap((filePath) =>
    Array.from(readFileSync(filePath, "utf8").matchAll(/from\s+["'](@base-ui\/react[^"']*)["']/g))
      .map((match) => ({
        filePath,
        importPath: match[1]
      }))
  );

  expect(baseUiImports).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ importPath: "@base-ui/react/checkbox" }),
      expect.objectContaining({ importPath: "@base-ui/react/field" }),
      expect.objectContaining({ importPath: "@base-ui/react/input" }),
      expect.objectContaining({ importPath: "@base-ui/react/switch" }),
      expect.objectContaining({ importPath: "@base-ui/react/tabs" }),
      expect.objectContaining({ importPath: "@base-ui/react/tooltip" })
    ])
  );

  for (const baseUiImport of baseUiImports) {
    expect(
      ALLOWED_BASE_UI_IMPORTS.has(baseUiImport.importPath),
      `${baseUiImport.importPath} is not approved for Wave 0 (${baseUiImport.filePath})`
    ).toBe(true);
  }
});

function collectSourceFiles(roots: string[]) {
  const files: string[] = [];

  for (const root of roots) {
    if (existsSync(root)) {
      collectSourceFilesFrom(root, files);
    }
  }

  return files;
}

function collectSourceFilesFrom(directory: string, files: string[]) {
  for (const entry of readdirSync(directory)) {
    const entryPath = join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      collectSourceFilesFrom(entryPath, files);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(entryPath);
    }
  }
}
