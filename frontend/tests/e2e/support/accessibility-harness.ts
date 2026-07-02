import { expect, type Locator, type Page } from "@playwright/test";
import axeSource from "axe-core";

export type KeyboardTraversalStep = {
  name: string | RegExp;
  role?: string;
};

export type AccessibilityRoleExpectation = {
  locator: Locator;
  name?: string | RegExp;
  role: string;
};

export type AccessibilityNameExpectation = {
  locator: Locator;
  name: string | RegExp;
};

export type FocusTrapOptions = {
  close?: () => Promise<void>;
  dialog: Locator;
  opener: Locator;
};

export type LiveRegionOptions = {
  expectedText: string | RegExp;
  trigger: () => Promise<void>;
};

type AxeViolation = {
  description: string;
  id: string;
  impact: string | null;
  nodes: Array<{ target: string[] }>;
};

export class FeatureAccessibilityHarness {
  constructor(private readonly page: Page) {}

  async assertKeyboardTraversal(expected: KeyboardTraversalStep[], label: string): Promise<void> {
    await this.page.keyboard.press("Tab");
    const actual: KeyboardTraversalStep[] = [];

    for (let index = 0; index < expected.length; index += 1) {
      actual.push(await this.activeElementSummary());
      if (index < expected.length - 1) {
        await this.assertFocusedElementHasVisibleIndicator(`${label} step ${index + 1}`);
        await this.page.keyboard.press("Tab");
      }
    }

    for (let index = 0; index < expected.length; index += 1) {
      const expectedStep = expected[index];
      const actualStep = actual[index];
      expect(actualStep.role, `${label} focus step ${index + 1} role`).toBe(expectedStep.role);
      if (typeof expectedStep.name === "string") {
        expect(actualStep.name, `${label} focus step ${index + 1} name`).toBe(expectedStep.name);
      } else {
        expect(actualStep.name, `${label} focus step ${index + 1} name`).toMatch(expectedStep.name);
      }
    }
  }

  async assertFocusedElementHasVisibleIndicator(label: string): Promise<void> {
    const result = await this.page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) {
        return { focused: false };
      }

      const style = getComputedStyle(element);
      const outlineWidth = Number.parseFloat(style.outlineWidth || "0");
      const boxShadow = style.boxShadow || "";
      const borderColor = style.borderColor || "";
      const backgroundColor = style.backgroundColor || "";

      return {
        backgroundColor,
        borderColor,
        boxShadow,
        focused: true,
        outlineStyle: style.outlineStyle,
        outlineWidth
      };
    });

    expect(result.focused, `${label}: no focused HTMLElement`).toBe(true);
    if (!result.focused) {
      return;
    }
    expect(
      (result.outlineWidth ?? 0) > 0 ||
        result.boxShadow !== "none" ||
        result.borderColor !== "rgba(0, 0, 0, 0)" ||
        result.backgroundColor !== "rgba(0, 0, 0, 0)",
      `${label}: focused element lacks a visible indicator`
    ).toBe(true);
  }

  async assertFocusOrder(expectedNames: Array<string | RegExp>, label: string): Promise<void> {
    const summaries = await this.collectTabOrder(expectedNames.length);
    expect(summaries, `${label}: focus order length`).toHaveLength(expectedNames.length);

    for (let index = 0; index < expectedNames.length; index += 1) {
      const expectedName = expectedNames[index];
      const actualName = summaries[index].name;
      if (typeof expectedName === "string") {
        expect(actualName, `${label}: focus order ${index + 1}`).toBe(expectedName);
      } else {
        expect(actualName, `${label}: focus order ${index + 1}`).toMatch(expectedName);
      }
    }
  }

  async assertRoles(expectations: AccessibilityRoleExpectation[], label: string): Promise<void> {
    for (const expectation of expectations) {
      const summary = await this.elementSummary(expectation.locator);
      expect(summary.role, `${label}: role`).toBe(expectation.role);
      if (expectation.name !== undefined) {
        if (typeof expectation.name === "string") {
          expect(summary.name, `${label}: accessible name`).toBe(expectation.name);
        } else {
          expect(summary.name, `${label}: accessible name`).toMatch(expectation.name);
        }
      }
    }
  }

  async assertAccessibleNames(expectations: AccessibilityNameExpectation[], label: string): Promise<void> {
    for (const expectation of expectations) {
      const summary = await this.elementSummary(expectation.locator);
      if (typeof expectation.name === "string") {
        expect(summary.name, `${label}: accessible name`).toBe(expectation.name);
      } else {
        expect(summary.name, `${label}: accessible name`).toMatch(expectation.name);
      }
    }
  }

  async accessibilityTreeSnapshot(locator: Locator = this.page.locator("body")): Promise<string> {
    const locatorWithSnapshot = locator as Locator & { ariaSnapshot?: () => Promise<string> };
    if (typeof locatorWithSnapshot.ariaSnapshot === "function") {
      return locatorWithSnapshot.ariaSnapshot();
    }

    return JSON.stringify(await this.elementSummary(locator), null, 2);
  }

  async assertDialogFocusTrap(options: FocusTrapOptions, label: string): Promise<void> {
    await expect(options.dialog, `${label}: dialog visible`).toBeVisible();
    const dialogHandle = await options.dialog.elementHandle();
    if (!dialogHandle) {
      throw new Error(`${label}: dialog element was not available.`);
    }

    await this.page.keyboard.press("Tab");
    for (let index = 0; index < 4; index += 1) {
      const isInsideDialog = await this.page.evaluate((dialog) => {
        const active = document.activeElement;
        return active instanceof HTMLElement && dialog.contains(active);
      }, dialogHandle);
      expect(isInsideDialog, `${label}: focus escaped dialog on Tab ${index + 1}`).toBe(true);
      await this.assertFocusedElementHasVisibleIndicator(`${label} dialog focus ${index + 1}`);
      await this.page.keyboard.press("Tab");
    }

    if (options.close) {
      await options.close();
      await expect(options.opener, `${label}: focus returns to opener`).toBeFocused();
    }
  }

  async assertFocusRestoration(opener: Locator, open: () => Promise<void>, close: () => Promise<void>, label: string): Promise<void> {
    await opener.focus();
    await expect(opener, `${label}: opener focused before open`).toBeFocused();
    await open();
    await close();
    await expect(opener, `${label}: opener focused after close`).toBeFocused();
  }

  async assertFormLabelsAndErrors(label: string): Promise<void> {
    const result = await this.page.evaluate(() => {
      const controlSelector = "input:not([type='hidden']),textarea,select";
      return Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(controlSelector))
        .filter((control) => {
          const rect = control.getBoundingClientRect();
          const style = getComputedStyle(control);
          return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden";
        })
        .map((control) => {
          const id = control.id;
          const labelledBy = control.getAttribute("aria-labelledby");
          const describedBy = control.getAttribute("aria-describedby");
          const labelElement = id ? document.querySelector(`label[for='${CSS.escape(id)}']`) : null;
          const wrappingLabel = control.closest("label");
          const ariaLabel = control.getAttribute("aria-label");
          const missingDescriptionTargets =
            describedBy
              ?.split(/\s+/)
              .filter(Boolean)
              .filter((targetId) => !document.getElementById(targetId)) ?? [];

          return {
            id,
            missingDescriptionTargets,
            name: control.getAttribute("name") ?? "",
            tagName: control.tagName.toLowerCase(),
            validLabel: Boolean(ariaLabel || labelledBy || labelElement || wrappingLabel)
          };
        });
    });

    expect(
      result.filter((control) => !control.validLabel),
      `${label}: form controls without labels`
    ).toEqual([]);
    expect(
      result.filter((control) => control.missingDescriptionTargets.length > 0),
      `${label}: form controls with broken aria-describedby references`
    ).toEqual([]);
  }

  async assertLandmarksAndHeadings(label: string): Promise<void> {
    const result = await this.page.evaluate(() => {
      const mainCount = document.querySelectorAll("main,[role='main']").length;
      const navCount = document.querySelectorAll("nav,[role='navigation']").length;
      const headings = Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3,[role='heading']"))
        .map((heading) => heading.textContent?.trim() ?? "")
        .filter(Boolean);

      return { headings, mainCount, navCount };
    });

    expect(result.mainCount, `${label}: main landmark`).toBeGreaterThanOrEqual(1);
    expect(result.navCount, `${label}: navigation landmark`).toBeGreaterThanOrEqual(1);
    expect(result.headings.length, `${label}: headings`).toBeGreaterThanOrEqual(1);
  }

  async assertAriaCurrentOrSelectedState(label: string): Promise<void> {
    const invalid = await this.page.evaluate(() => {
      const validCurrentValues = new Set(["page", "step", "location", "date", "time", "true", "false"]);
      return Array.from(document.querySelectorAll<HTMLElement>("[aria-current],[aria-selected]"))
        .map((element) => ({
          ariaCurrent: element.getAttribute("aria-current"),
          ariaSelected: element.getAttribute("aria-selected"),
          label:
            element.getAttribute("aria-label") ??
            element.getAttribute("title") ??
            element.textContent?.trim().slice(0, 80) ??
            element.tagName.toLowerCase()
        }))
        .filter(
          (element) =>
            (element.ariaCurrent !== null && !validCurrentValues.has(element.ariaCurrent)) ||
            (element.ariaSelected !== null && !["true", "false"].includes(element.ariaSelected))
        );
    });

    expect(invalid, `${label}: invalid aria-current/aria-selected values`).toEqual([]);
  }

  async assertLiveRegion(options: LiveRegionOptions, label: string): Promise<void> {
    const liveRegion = this.page.locator("[aria-live], [role='status'], [role='alert']").first();
    await expect(liveRegion, `${label}: live region exists`).toBeAttached();
    await options.trigger();
    await expect(liveRegion, `${label}: live region update`).toContainText(options.expectedText);
  }

  async assertAxeSmoke(label: string): Promise<void> {
    await this.page.addScriptTag({ content: axeSource.source });
    const violations = await this.page.evaluate(async () => {
      const axeRunner = (window as typeof window & {
        axe?: {
          run: (context?: unknown, options?: unknown) => Promise<{ violations: AxeViolation[] }>;
        };
      }).axe;
      if (!axeRunner) {
        throw new Error("axe-core did not load.");
      }

      const result = await axeRunner.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
        }
      });
      return result.violations.map((violation) => ({
        description: violation.description,
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({ target: node.target }))
      }));
    });

    expect(violations, `${label}: axe smoke violations`).toEqual([]);
  }

  async collectTabOrder(count: number): Promise<KeyboardTraversalStep[]> {
    const order: KeyboardTraversalStep[] = [];
    await this.page.keyboard.press("Tab");
    for (let index = 0; index < count; index += 1) {
      order.push(await this.activeElementSummary());
      await this.page.keyboard.press("Tab");
    }
    return order;
  }

  async activeElementSummary(): Promise<KeyboardTraversalStep> {
    const handle = await this.page.evaluateHandle(() => document.activeElement);
    try {
      return await this.page.evaluate(summarizeElementForBrowser, handle);
    } finally {
      await handle.dispose();
    }
  }

  async elementSummary(locator: Locator): Promise<KeyboardTraversalStep> {
    const handle = await locator.elementHandle();
    if (!handle) {
      throw new Error("Element was not available for accessibility summary.");
    }

    return this.page.evaluate(summarizeElementForBrowser, handle);
  }
}

function summarizeElementForBrowser(element: Element | null): KeyboardTraversalStep {
  const accessibleNameForBrowser = (target: HTMLElement): string => {
    const labelledBy = target.getAttribute("aria-labelledby");
    if (labelledBy) {
      const value = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
      if (value) {
        return value;
      }
    }

    const ariaLabel = target.getAttribute("aria-label");
    if (ariaLabel) {
      return ariaLabel.trim();
    }

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      if (target.labels && target.labels.length > 0) {
        return Array.from(target.labels)
          .map((label) => label.textContent?.trim() ?? "")
          .filter(Boolean)
          .join(" ");
      }
    }

    return target.textContent?.trim().replace(/\s+/g, " ") ?? "";
  };

  const roleForBrowser = (target: HTMLElement): string | undefined => {
    const explicit = target.getAttribute("role");
    if (explicit) {
      return explicit;
    }
    const tagName = target.tagName.toLowerCase();
    if (tagName === "a" && target.hasAttribute("href")) {
      return "link";
    }
    if (tagName === "button") {
      return "button";
    }
    if (tagName === "main") {
      return "main";
    }
    if (tagName === "nav") {
      return "navigation";
    }
    if (/^h[1-6]$/.test(tagName)) {
      return "heading";
    }
    if (tagName === "dialog") {
      return "dialog";
    }
    if (tagName === "select") {
      return "combobox";
    }
    if (tagName === "textarea") {
      return "textbox";
    }
    if (tagName === "input") {
      const type = (target.getAttribute("type") ?? "text").toLowerCase();
      if (["button", "submit", "reset"].includes(type)) {
        return "button";
      }
      if (type === "checkbox") {
        return "checkbox";
      }
      if (type === "radio") {
        return "radio";
      }
      if (type === "range") {
        return "slider";
      }
      return "textbox";
    }
    return undefined;
  };

  if (!(element instanceof HTMLElement)) {
    return { name: "", role: undefined };
  }
  return { name: accessibleNameForBrowser(element), role: roleForBrowser(element) };
}
