import { apiBaseUrl } from "./env";

const API_VERSION_PREFIX = "/api/v1";

export type User = {
  id: string;
  email: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type RefreshResponse = {
  accessToken: string;
};

export type Place = {
  id: string;
  name: string;
  type: "restaurant" | "cafe" | "ice_cream";
  subtype:
    | "burger"
    | "italian"
    | "american"
    | "steak"
    | "grill"
    | "shawarma"
    | "saudi"
    | "gulf"
    | "indian"
    | "asian"
    | "seafood"
    | "breakfast"
    | "healthy"
    | "other"
    | "coffee"
    | "tea"
    | null;
  description: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
  ratingCount: number;
  currentUserRating: number | null;
  currentUserTried: boolean;
  currentUserListIds: string[];
  currentUserListNames: string[];
  currentUserListCount: number;
};

export type UserList = {
  id: string;
  userId: string;
  name: string;
  visibility: "public" | "private";
  placeCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ListItem = {
  id: string;
  place: Place;
  createdAt: string;
};

export type ListDetail = UserList & {
  items: ListItem[];
};

export type Rating = {
  id: string;
  userId: string;
  placeId: string;
  rating: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileRating = {
  id: string;
  place: Place;
  rating: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Profile = {
  listCount: number;
  triedRestaurantCount: number;
  triedCafeCount: number;
  triedIceCreamCount: number;
  ratingsCreatedCount: number;
  userRatings: ProfileRating[];
  triedPlaces: Place[];
};

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
  skipRefresh?: boolean;
};

type ApiDetail = {
  detail?: { message?: string; code?: string } | Array<{ msg?: string }>;
};

export type CollectionMeta = {
  limit: number;
  offset: number;
  total: number;
  sort: string;
};

export type CollectionResponse<T> = {
  data: T[];
  meta: CollectionMeta;
};

// The access token is kept in memory only (never in localStorage/sessionStorage)
// so it is not exposed to persistent XSS exfiltration. The refresh token lives in
// an HttpOnly Secure cookie and is used to silently re-establish the session after
// a reload. A BroadcastChannel shares the in-memory token across tabs so they do
// not each refresh (which, with refresh-token rotation, could trigger reuse
// detection and log everyone out).
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

const authChannel: BroadcastChannel | null =
  typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel("restaurantWishlist.auth");

authChannel?.addEventListener("message", (event: MessageEvent) => {
  const data = event.data as { type?: string; token?: string } | null;
  if (data?.type === "token" && typeof data.token === "string") {
    accessToken = data.token;
  } else if (data?.type === "logout") {
    accessToken = null;
  }
});

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(extractErrorMessage(status, detail));
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function saveAccessToken(token: string): void {
  accessToken = token;
  authChannel?.postMessage({ type: "token", token });
}

export function clearTokens(): void {
  accessToken = null;
  authChannel?.postMessage({ type: "logout" });
}

/**
 * Returns the in-memory access token, performing a single silent refresh (shared
 * across tabs) if none is held yet — e.g. on the first request after a reload.
 * Returns null when the user has no valid session.
 */
export async function ensureSession(): Promise<string | null> {
  if (accessToken) {
    return accessToken;
  }
  return refreshAccessToken();
}

/**
 * Revokes the refresh token server-side (via the HttpOnly cookie) and clears the
 * in-memory token, broadcasting the logout to other tabs. The local session is
 * cleared even if the network call fails.
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest("/auth/logout", { method: "POST", auth: false, skipRefresh: true });
  } catch {
    // Ignore network/HTTP errors — clear the local session regardless.
  } finally {
    clearTokens();
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await performRequest(path, options);
  const data = await parseResponseBody(response);

  if (response.status === 401 && options.auth !== false && !options.skipRefresh) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      const retryResponse = await performRequest(path, { ...options, skipRefresh: true });
      const retryData = await parseResponseBody(retryResponse);
      if (!retryResponse.ok) {
        throw new ApiError(retryResponse.status, retryData);
      }
      return retryData as T;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}

export async function apiCollection<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<CollectionResponse<T>> {
  return apiRequest<CollectionResponse<T>>(path, options);
}

async function performRequest(path: string, options: ApiRequestOptions): Promise<Response> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  return fetch(`${apiBaseUrl}${versionedPath(path)}`, {
    ...options,
    credentials: "include",
    headers
  });
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = runRefreshWithLock().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// Serialize refresh across tabs with the Web Locks API when available, so only
// one tab rotates the refresh token at a time. Other tabs pick up the new token
// via the BroadcastChannel and skip refreshing.
async function runRefreshWithLock(): Promise<string | null> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  if (locks?.request) {
    return locks.request("restaurantWishlist.auth-refresh", performRefresh);
  }
  return performRefresh();
}

async function performRefresh(): Promise<string | null> {
  if (accessToken) {
    return accessToken;
  }

  try {
    const response = await apiRequest<RefreshResponse>("/auth/refresh", {
      method: "POST",
      auth: false,
      skipRefresh: true
    });
    saveAccessToken(response.accessToken);
    return response.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function extractErrorMessage(status: number, detail: unknown): string {
  const payload = detail as ApiDetail | undefined;

  if (Array.isArray(payload?.detail) && payload.detail[0]?.msg) {
    return payload.detail[0].msg;
  }

  if (payload?.detail && typeof payload.detail === "object" && "message" in payload.detail) {
    return payload.detail.message ?? `Request failed with status ${status}.`;
  }

  return `Request failed with status ${status}.`;
}

function versionedPath(path: string): string {
  if (path.startsWith(API_VERSION_PREFIX)) {
    return path;
  }
  return `${API_VERSION_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}
