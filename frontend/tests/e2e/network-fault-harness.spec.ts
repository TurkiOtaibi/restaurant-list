import { expect, test } from "@playwright/test";

import { NetworkFaultHarness } from "./support/network-fault-harness";

test.describe("reusable network fault injection harness", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/health");
  });

  test("forces deterministic HTTP error responses", async ({ page }) => {
    const network = new NetworkFaultHarness(page);
    const controller = await network.sequence(network.apiPattern("/qa/status"), [
      network.forced500({ code: "INTERNAL_ERROR" }),
      network.forced401({ code: "UNAUTHENTICATED" }),
      network.forced403({ code: "FORBIDDEN" }),
      network.forced404({ code: "PLACE_NOT_FOUND" })
    ]);

    await expectStatus(page, "/api/v1/qa/status", 500, "INTERNAL_ERROR");
    await expectStatus(page, "/api/v1/qa/status", 401, "UNAUTHENTICATED");
    await expectStatus(page, "/api/v1/qa/status", 403, "FORBIDDEN");
    await expectStatus(page, "/api/v1/qa/status", 404, "PLACE_NOT_FOUND");
    expect(controller.calls()).toBe(4);
  });

  test("supports deterministic latency and successful delayed response", async ({ page }) => {
    const network = new NetworkFaultHarness(page);
    await network.sequence(network.apiPattern("/qa/delay"), [
      network.delayedJson(200, { data: [{ id: "delayed" }] }, 75)
    ]);

    const result = await browserFetch(page, "/api/v1/qa/delay");

    expect(result.status).toBe(200);
    expect(result.elapsedMs).toBeGreaterThanOrEqual(70);
    expect(result.body).toEqual({ data: [{ id: "delayed" }] });
  });

  test("supports retry success and retry failure sequences", async ({ page }) => {
    const network = new NetworkFaultHarness(page);
    await network.sequence(network.apiPattern("/qa/retry-success"), [
      ...network.retrySuccess(network.forced500({ code: "INTERNAL_ERROR" }), { ok: true })
    ]);
    await network.sequence(network.apiPattern("/qa/retry-failure"), [
      ...network.retryFailure(
        network.forced500({ code: "INTERNAL_ERROR" }),
        network.forced500({ code: "INTERNAL_ERROR" })
      )
    ]);

    await expectStatus(page, "/api/v1/qa/retry-success", 500, "INTERNAL_ERROR");
    const retrySuccess = await browserFetch(page, "/api/v1/qa/retry-success");
    expect(retrySuccess.status).toBe(200);
    expect(retrySuccess.body).toEqual({ ok: true });

    await expectStatus(page, "/api/v1/qa/retry-failure", 500, "INTERNAL_ERROR");
    await expectStatus(page, "/api/v1/qa/retry-failure", 500, "INTERNAL_ERROR");
  });

  test("supports malformed JSON and empty response body", async ({ page }) => {
    const network = new NetworkFaultHarness(page);
    await network.sequence(network.apiPattern("/qa/body-shapes"), [
      network.malformedJson(200),
      network.emptyBody(204)
    ]);

    const malformed = await browserFetch(page, "/api/v1/qa/body-shapes");
    expect(malformed.status).toBe(200);
    expect(malformed.parseError).toContain("JSON");

    const empty = await browserFetch(page, "/api/v1/qa/body-shapes");
    expect(empty.status).toBe(204);
    expect(empty.text).toBe("");
  });

  test("supports timeout network interruption and explicit abort", async ({ page }) => {
    const network = new NetworkFaultHarness(page);
    await network.sequence(network.apiPattern("/qa/abort"), [
      network.timeout(),
      network.networkInterruption(),
      network.abortRequest()
    ]);

    await expectFetchRejected(page, "/api/v1/qa/abort");
    await expectFetchRejected(page, "/api/v1/qa/abort");
    await expectFetchRejected(page, "/api/v1/qa/abort");
  });

  test("can repeat the final deterministic fault", async ({ page }) => {
    const network = new NetworkFaultHarness(page);
    await network.sequence(
      network.apiPattern("/qa/repeat"),
      [network.forced500({ code: "INTERNAL_ERROR" })],
      { repeatLast: true }
    );

    await expectStatus(page, "/api/v1/qa/repeat", 500, "INTERNAL_ERROR");
    await expectStatus(page, "/api/v1/qa/repeat", 500, "INTERNAL_ERROR");
  });
});

async function expectStatus(
  page: Parameters<typeof browserFetch>[0],
  path: string,
  status: number,
  code: string
) {
  const result = await browserFetch(page, path);
  expect(result.status).toBe(status);
  expect(result.body?.error?.code).toBe(code);
}

async function expectFetchRejected(page: Parameters<typeof browserFetch>[0], path: string) {
  const result = await browserFetch(page, path);
  expect(result.ok).toBe(false);
  expect(result.error).toBeTruthy();
}

async function browserFetch(page: import("@playwright/test").Page, path: string) {
  return page.evaluate(async (requestPath) => {
    const startedAt = performance.now();
    try {
      const response = await fetch(requestPath);
      const text = await response.text();
      let body: { error?: { code?: string }; [key: string]: unknown } | null = null;
      let parseError = "";
      if (text) {
        try {
          body = JSON.parse(text) as { error?: { code?: string }; [key: string]: unknown };
        } catch (error) {
          parseError = error instanceof Error ? error.message : String(error);
        }
      }
      return {
        body,
        elapsedMs: performance.now() - startedAt,
        ok: true,
        parseError,
        status: response.status,
        text
      };
    } catch (error) {
      return {
        elapsedMs: performance.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
        ok: false,
        status: 0,
        text: ""
      };
    }
  }, path);
}
