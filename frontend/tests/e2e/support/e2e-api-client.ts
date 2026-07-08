const E2E_API_PORT = process.env.E2E_API_PORT ?? "8000";

export const E2E_API_BASE_URL =
  process.env.E2E_API_BASE_URL ?? `http://localhost:${E2E_API_PORT}`;
export const E2E_TEST_PASSWORD = "password123";

type AuthResponse = {
  accessToken: string;
  user: {
    displayName: string;
    email: string;
    id?: string;
  };
};

export type E2eApiUser = {
  accessToken: string;
  displayName: string;
  email: string;
  refreshCookie?: string;
};

type RegisterE2eApiUserOptions = {
  displayName: string;
  email: string;
  failureMessage: string;
  includeRefreshCookie?: boolean;
  password?: string;
};

type E2eApiRequestOptions = {
  accessToken: string;
  path: string;
  requestInit: RequestInit;
  responseFailureMessage: (method: string, path: string, response: Response, body: string) => string;
  unreachableMessage?: (method: string, url: string, error: unknown) => string;
};

export async function registerE2eApiUser({
  displayName,
  email,
  failureMessage,
  includeRefreshCookie = false,
  password = E2E_TEST_PASSWORD
}: RegisterE2eApiUserOptions): Promise<E2eApiUser> {
  const response = await fetch(`${E2E_API_BASE_URL}/api/v1/auth/register`, {
    body: JSON.stringify({ displayName, email, password }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`${failureMessage}: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as AuthResponse;
  return {
    accessToken: payload.accessToken,
    displayName,
    email,
    refreshCookie: includeRefreshCookie ? extractRefreshCookie(response.headers) : undefined
  };
}

export async function e2eApiRequest<T = unknown>({
  accessToken,
  path,
  requestInit,
  responseFailureMessage,
  unreachableMessage
}: E2eApiRequestOptions): Promise<T> {
  const headers = new Headers(requestInit.headers);
  if (requestInit.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${accessToken}`);

  const method = requestInit.method ?? "GET";
  const url = `${E2E_API_BASE_URL}/api/v1${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...requestInit,
      headers
    });
  } catch (error) {
    if (unreachableMessage) {
      throw new Error(unreachableMessage(method, url, error));
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(responseFailureMessage(method, path, response, await response.text()));
  }

  return (await response.json()) as T;
}

export function extractRefreshCookie(headers: Headers): string {
  const headerWithGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headerWithGetSetCookie.getSetCookie?.() ?? [headers.get("set-cookie")].filter(Boolean);
  const refreshCookie = cookies.find((cookie) => cookie.startsWith("restaurant_refresh_token="));
  if (!refreshCookie) {
    throw new Error("Auth API response did not include the refresh cookie.");
  }
  return refreshCookie;
}
