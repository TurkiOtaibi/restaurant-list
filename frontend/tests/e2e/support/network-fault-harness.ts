import type { Page, Route } from "@playwright/test";

export type NetworkFaultAbortReason =
  | "aborted"
  | "connectionaborted"
  | "connectionfailed"
  | "connectionreset"
  | "failed"
  | "internetdisconnected"
  | "timedout";

export type NetworkFaultStep =
  | {
      body?: string;
      contentType?: string;
      delayMs?: number;
      headers?: Record<string, string>;
      status: number;
      type: "response";
    }
  | {
      delayMs?: number;
      reason: NetworkFaultAbortReason;
      type: "abort";
    }
  | {
      delayMs?: number;
      type: "passThrough";
    };

export type NetworkFaultRouteOptions = {
  repeatLast?: boolean;
};

export type NetworkFaultRouteController = {
  calls: () => number;
  dispose: () => Promise<void>;
};

export class NetworkFaultHarness {
  constructor(private readonly page: Page) {}

  async sequence(
    urlPattern: string | RegExp,
    steps: NetworkFaultStep[],
    options: NetworkFaultRouteOptions = {}
  ): Promise<NetworkFaultRouteController> {
    if (steps.length === 0) {
      throw new Error("Network fault sequence requires at least one step.");
    }

    let calls = 0;
    const handler = async (route: Route) => {
      const index = options.repeatLast ? Math.min(calls, steps.length - 1) : calls;
      calls += 1;
      const step = steps[index] ?? passThrough();
      await executeStep(route, step);
    };

    await this.page.route(urlPattern, handler);

    return {
      calls: () => calls,
      dispose: async () => {
        await this.page.unroute(urlPattern, handler);
      }
    };
  }

  httpStatus(
    status: 401 | 403 | 404 | 500,
    options: {
      body?: unknown;
      code?: string;
      delayMs?: number;
      message?: string;
      requestId?: string;
    } = {}
  ): NetworkFaultStep {
    return jsonResponse(status, options.body ?? errorEnvelope(status, options), options.delayMs);
  }

  forced500(options: FaultEnvelopeOptions = {}): NetworkFaultStep {
    return this.httpStatus(500, {
      code: options.code ?? "INTERNAL_ERROR",
      delayMs: options.delayMs,
      message: options.message ?? "Internal server error.",
      requestId: options.requestId
    });
  }

  forced401(options: FaultEnvelopeOptions = {}): NetworkFaultStep {
    return this.httpStatus(401, {
      code: options.code ?? "UNAUTHENTICATED",
      delayMs: options.delayMs,
      message: options.message ?? "Authentication is required.",
      requestId: options.requestId
    });
  }

  forced403(options: FaultEnvelopeOptions = {}): NetworkFaultStep {
    return this.httpStatus(403, {
      code: options.code ?? "FORBIDDEN",
      delayMs: options.delayMs,
      message: options.message ?? "Access is forbidden.",
      requestId: options.requestId
    });
  }

  forced404(options: FaultEnvelopeOptions = {}): NetworkFaultStep {
    return this.httpStatus(404, {
      code: options.code ?? "NOT_FOUND",
      delayMs: options.delayMs,
      message: options.message ?? "Resource was not found.",
      requestId: options.requestId
    });
  }

  delayedJson(status: number, body: unknown, delayMs: number): NetworkFaultStep {
    return jsonResponse(status, body, delayMs);
  }

  retrySuccess(firstFailure: NetworkFaultStep, successBody: unknown, delayMs = 0): NetworkFaultStep[] {
    return [firstFailure, jsonResponse(200, successBody, delayMs)];
  }

  retryFailure(firstFailure: NetworkFaultStep, secondFailure: NetworkFaultStep): NetworkFaultStep[] {
    return [firstFailure, secondFailure];
  }

  malformedJson(status = 200, delayMs = 0): NetworkFaultStep {
    return {
      body: "{ malformed-json",
      contentType: "application/json",
      delayMs,
      status,
      type: "response"
    };
  }

  emptyBody(status = 200, delayMs = 0): NetworkFaultStep {
    return {
      body: "",
      contentType: "application/json",
      delayMs,
      status,
      type: "response"
    };
  }

  timeout(delayMs = 0): NetworkFaultStep {
    return abort("timedout", delayMs);
  }

  networkInterruption(delayMs = 0): NetworkFaultStep {
    return abort("internetdisconnected", delayMs);
  }

  abortRequest(delayMs = 0): NetworkFaultStep {
    return abort("aborted", delayMs);
  }

  passThrough(delayMs = 0): NetworkFaultStep {
    return passThrough(delayMs);
  }

  apiPattern(path: string): RegExp {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return new RegExp(`/api/v1${escapeRegExp(normalized)}(?:\\\\?.*)?$`);
  }
}

type FaultEnvelopeOptions = {
  code?: string;
  delayMs?: number;
  message?: string;
  requestId?: string;
};

function jsonResponse(status: number, body: unknown, delayMs = 0): NetworkFaultStep {
  return {
    body: JSON.stringify(body),
    contentType: "application/json",
    delayMs,
    status,
    type: "response"
  };
}

function errorEnvelope(
  status: number,
  {
    code,
    message,
    requestId = "req_fault_harness"
  }: {
    code?: string;
    message?: string;
    requestId?: string;
  }
) {
  return {
    error: {
      code: code ?? `HTTP_${status}`,
      message: message ?? `Forced HTTP ${status}.`,
      requestId
    }
  };
}

function abort(reason: NetworkFaultAbortReason, delayMs = 0): NetworkFaultStep {
  return {
    delayMs,
    reason,
    type: "abort"
  };
}

function passThrough(delayMs = 0): NetworkFaultStep {
  return {
    delayMs,
    type: "passThrough"
  };
}

async function executeStep(route: Route, step: NetworkFaultStep): Promise<void> {
  if (step.delayMs && step.delayMs > 0) {
    await deterministicDelay(step.delayMs);
  }

  if (step.type === "abort") {
    await route.abort(step.reason);
    return;
  }

  if (step.type === "passThrough") {
    await route.continue();
    return;
  }

  await route.fulfill({
    body: step.body ?? "",
    contentType: step.contentType ?? "text/plain",
    headers: step.headers,
    status: step.status
  });
}

function deterministicDelay(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
