import { expect, type Page } from "@playwright/test";
import path from "node:path";

export type ResponsiveViewportName =
  | "mobile-small-320x568"
  | "mobile-standard-360x640"
  | "iphone-modern-390x844"
  | "iphone-large-430x932"
  | "tablet-portrait-768x1024"
  | "tablet-landscape-1024x768"
  | "desktop-1280x720"
  | "zoom-200-pressure";

export type ResponsiveViewport = {
  height: number;
  name: ResponsiveViewportName;
  width: number;
  zoomPressure?: boolean;
};

export type ResponsiveState = {
  load: () => Promise<void>;
  name: string;
};

export type ResponsiveAssertionOptions = {
  captureScreenshots?: boolean;
  evidenceDir?: string;
};

export const RESPONSIVE_VIEWPORTS: readonly ResponsiveViewport[] = [
  { height: 568, name: "mobile-small-320x568", width: 320 },
  { height: 640, name: "mobile-standard-360x640", width: 360 },
  { height: 844, name: "iphone-modern-390x844", width: 390 },
  { height: 932, name: "iphone-large-430x932", width: 430 },
  { height: 1024, name: "tablet-portrait-768x1024", width: 768 },
  { height: 768, name: "tablet-landscape-1024x768", width: 1024 },
  { height: 720, name: "desktop-1280x720", width: 1280 },
  { height: 422, name: "zoom-200-pressure", width: 195, zoomPressure: true }
];

export class ResponsiveViewportHarness {
  constructor(
    private readonly page: Page,
    private readonly options: ResponsiveAssertionOptions = {}
  ) {}

  async runMatrix(
    states: ResponsiveState[],
    viewports: readonly ResponsiveViewport[] = RESPONSIVE_VIEWPORTS
  ): Promise<void> {
    for (const viewport of viewports) {
      await this.setViewport(viewport);
      for (const state of states) {
        await state.load();
        await this.assertState(state.name, viewport);
      }
    }
  }

  async setViewport(viewport: ResponsiveViewport): Promise<void> {
    await this.page.setViewportSize({ height: viewport.height, width: viewport.width });
  }

  async assertState(stateName: string, viewport: ResponsiveViewport): Promise<void> {
    const label = `${stateName} ${viewport.name}`;
    try {
      await expect(this.page.locator("main")).toBeVisible({ timeout: 30_000 });
      await this.assertNoHorizontalOverflow(label);
      await this.assertVisibleHeadingNotClipped(label);
      await this.assertPrimaryActionsNotClipped(label);
      await this.assertCardsStayContained(label);
      await this.assertDialogsFit(label);
      await this.assertStickyUiDoesNotCoverContent(label);
      await this.assertBottomNavigation(label);
      await this.assertRtlLayoutStable(label);
    } catch (error) {
      await this.captureFailureScreenshot(stateName, viewport);
      throw error;
    }
  }

  async assertNoHorizontalOverflow(label: string): Promise<void> {
    const result = await this.page.evaluate(() => ({
      overflow: Math.ceil(document.documentElement.scrollWidth - window.innerWidth),
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    }));

    expect(result.overflow, `${label}: horizontal overflow ${JSON.stringify(result)}`).toBeLessThanOrEqual(1);
  }

  async assertVisibleHeadingNotClipped(label: string): Promise<void> {
    const clipped = await this.page.evaluate(() => {
      const visible = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      };
      return Array.from(document.querySelectorAll<HTMLElement>("h1,h2,[role='heading']"))
        .filter(visible)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            bottom: Math.round(rect.bottom),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            text: element.textContent?.trim().slice(0, 80) ?? "",
            top: Math.round(rect.top)
          };
        })
        .filter((rect) => rect.left < -1 || rect.right > window.innerWidth + 1 || rect.top < -1);
    });

    expect(clipped, `${label}: clipped heading`).toEqual([]);
  }

  async assertPrimaryActionsNotClipped(label: string): Promise<void> {
    const clipped = await this.page.evaluate(() => {
      const visible = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      };
      const labelFor = (element: HTMLElement) =>
        element.getAttribute("aria-label") ??
        element.getAttribute("title") ??
        element.textContent?.trim().slice(0, 80) ??
        element.tagName.toLowerCase();
      return Array.from(
        document.querySelectorAll<HTMLElement>(
          "main a[href],main button,main input,main select,main textarea,[role='dialog'] a[href],[role='dialog'] button"
        )
      )
        .filter(visible)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            bottom: Math.round(rect.bottom),
            label: labelFor(element),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top)
          };
        })
        .filter(
          (rect) =>
            rect.left < -1 ||
            rect.right > window.innerWidth + 1 ||
            rect.top < -1 ||
            (rect.top < window.innerHeight && rect.bottom > window.innerHeight + 1)
        )
    });

    expect(clipped, `${label}: clipped primary actions`).toEqual([]);
  }

  async assertCardsStayContained(label: string): Promise<void> {
    const overflowingCards = await this.page.evaluate(() => {
      const visible = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      };
      return Array.from(
        document.querySelectorAll<HTMLElement>(
          ".ds-place-card,.ds-list-card,.profile-rating-card,.place-detail-panel,.place-save-dialog__list,.card"
        )
      )
        .filter(visible)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            className: element.className,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            text: element.textContent?.trim().slice(0, 80) ?? ""
          };
        })
        .filter((rect) => rect.left < -1 || rect.right > window.innerWidth + 1);
    });

    expect(overflowingCards, `${label}: cards overflow viewport`).toEqual([]);
  }

  async assertDialogsFit(label: string): Promise<void> {
    const overflowingDialogs = await this.page.evaluate(() => {
      const visible = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      };
      return Array.from(document.querySelectorAll<HTMLElement>("[role='dialog'],[role='alertdialog']"))
        .filter(visible)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            bottom: Math.round(rect.bottom),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top)
          };
        })
        .filter(
          (rect) =>
            rect.left < -1 ||
            rect.right > window.innerWidth + 1 ||
            rect.top < -1 ||
            rect.bottom > window.innerHeight + 1
        )
    });

    expect(overflowingDialogs, `${label}: dialogs overflow viewport`).toEqual([]);
  }

  async assertStickyUiDoesNotCoverContent(label: string): Promise<void> {
    const overlap = await this.page.evaluate(() => {
      const visible = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      };
      const labelFor = (element: HTMLElement) =>
        element.getAttribute("aria-label") ??
        element.getAttribute("title") ??
        element.textContent?.trim().slice(0, 80) ??
        element.tagName.toLowerCase();
      const stickyElements = Array.from(
        document.querySelectorAll<HTMLElement>("[style*='position: fixed'],[style*='position: sticky']")
      ).filter(visible);
      const importantElements = Array.from(
        document.querySelectorAll<HTMLElement>("main a[href],main button,main input,main select,main textarea")
      ).filter(visible);

      return stickyElements.flatMap((sticky) => {
        const stickyRect = sticky.getBoundingClientRect();
        return importantElements
          .filter((element) => !sticky.contains(element))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const overlaps =
              stickyRect.left < rect.right &&
              stickyRect.right > rect.left &&
              stickyRect.top < rect.bottom &&
              stickyRect.bottom > rect.top;
            return overlaps
              ? {
                  element: labelFor(element),
                  sticky: sticky.className || sticky.tagName,
                  top: Math.round(rect.top)
                }
              : null;
          })
          .filter(Boolean);
      });
    });

    expect(overlap, `${label}: fixed/sticky UI covers important content`).toEqual([]);
  }

  async assertBottomNavigation(label: string): Promise<void> {
    const originalScroll = await this.page.evaluate(() => window.scrollY);
    await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await this.page.waitForTimeout(50);

    const result = await this.page.evaluate(() => {
      const visible = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      };
      const labelFor = (element: HTMLElement) =>
        element.getAttribute("aria-label") ??
        element.getAttribute("title") ??
        element.textContent?.trim().slice(0, 80) ??
        element.tagName.toLowerCase();
      const nav = document.querySelector<HTMLElement>(".app-nav");
      if (!nav) {
        return { exists: false };
      }

      const rect = nav.getBoundingClientRect();
      const style = getComputedStyle(nav);
      const links = Array.from(nav.querySelectorAll<HTMLElement>("a[href]")).filter(visible);
      const contentCandidates = Array.from(
        document.querySelectorAll<HTMLElement>(
          "main a[href],main button,main input,main textarea,main .ds-place-card,main .ds-list-card,main .place-detail-panel,main .ds-empty"
        )
      ).filter((element) => visible(element) && !nav.contains(element));
      const navTop = rect.top;
      const covered = contentCandidates
        .map((element) => {
          const itemRect = element.getBoundingClientRect();
          return itemRect.bottom > navTop - 2 && itemRect.top < rect.bottom
            ? {
                bottom: Math.round(itemRect.bottom),
                label: labelFor(element),
                navTop: Math.round(navTop)
              }
            : null;
        })
        .filter(Boolean);

      return {
        bottomGap: Math.round(window.innerHeight - rect.bottom),
        exists: true,
        linkCount: links.length,
        minLinkHeight: Math.min(...links.map((link) => link.getBoundingClientRect().height)),
        overlap: covered,
        position: style.position,
        safeAreaPadding: style.paddingBottom
      };
    });

    await this.page.evaluate((scrollY) => window.scrollTo(0, scrollY), originalScroll);

    if (!result.exists) {
      return;
    }

    expect(result.position, `${label}: bottom nav must be fixed`).toBe("fixed");
    expect(result.linkCount, `${label}: bottom nav reachable items`).toBeGreaterThan(0);
    expect(result.minLinkHeight, `${label}: bottom nav touch target height`).toBeGreaterThanOrEqual(40);
    expect(result.overlap, `${label}: bottom nav overlaps content`).toEqual([]);
    expect(result.bottomGap, `${label}: bottom nav is below viewport`).toBeGreaterThanOrEqual(0);
  }

  async assertRtlLayoutStable(label: string): Promise<void> {
    const result = await this.page.evaluate(() => {
      const visible = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      };
      const direction = getComputedStyle(document.documentElement).direction;
      const bidiOverflow = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".ds-bidi,.ds-number,.ds-place-card__title,.place-detail-hero h1,.place-detail-panel,.muted"
        )
      )
        .filter(visible)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            text: element.textContent?.trim().slice(0, 80) ?? ""
          };
        })
        .filter((rect) => rect.left < -1 || rect.right > window.innerWidth + 1);

      return { bidiOverflow, direction };
    });

    expect(result.direction, `${label}: document direction`).toBe("rtl");
    expect(result.bidiOverflow, `${label}: RTL/mixed text overflow`).toEqual([]);
  }

  async captureFailureScreenshot(stateName: string, viewport: ResponsiveViewport): Promise<void> {
    if (!this.options.captureScreenshots) {
      return;
    }

    const evidenceDir =
      this.options.evidenceDir ?? path.join("..", "docs", "qa-execution", "responsive-matrix-harness", "screenshots");
    const fileName = `${sanitizeFileName(stateName)}__${viewport.name}.png`;
    await this.page.screenshot({
      fullPage: true,
      path: path.join(evidenceDir, fileName)
    });
  }
}

export function standardResponsiveStates(states: ResponsiveState[]): ResponsiveState[] {
  return states;
}

function sanitizeFileName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
