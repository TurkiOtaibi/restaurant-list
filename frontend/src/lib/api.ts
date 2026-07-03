import { apiBaseUrl } from "./env";

const API_VERSION_PREFIX = "/api/v1";

export type User = {
  id: string;
  displayName: string;
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
  currentUserListIds: string[];
  currentUserListNames: string[];
  currentUserListCount: number;
};

export type UserList = {
  id: string;
  ownerDisplayName?: string;
  name: string;
  visibility: "public" | "private";
  placeCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ListItemPlace = Omit<Place, "createdByUserId" | "currentUserListIds" | "currentUserListNames">;

export type ListItem = {
  id: string;
  listId: string;
  placeId: string;
  place: ListItemPlace;
  createdAt: string;
};

export type ListDetail = UserList & {
  items: ListItem[];
};

export type DataResponse<T> = {
  data: T;
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

export type ProfilePublicListSummary = {
  id: string;
  name: string;
  ownerDisplayName: string;
  placeCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProfileFavoritePlace = {
  id: string;
  name: string;
  type: Place["type"];
  subtype: Place["subtype"];
  rating: number;
};

export type Profile = {
  displayName: string;
  bio: string | null;
  averageRating: number | null;
  listsCount: number;
  ratedRestaurantCount: number;
  ratedCafeCount: number;
  ratedIceCreamCount: number;
  ratingsCount: number;
  favoritePlaces: ProfileFavoritePlace[];
  userRatings: ProfileRating[];
  publicListsSummary: ProfilePublicListSummary[];
  listCount?: number;
  ratingsCreatedCount?: number;
};

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
  skipRefresh?: boolean;
};

type ApiDetail = {
  error?: { message?: string; code?: string };
  detail?: { message?: string; code?: string } | Array<{ msg?: string }>;
};

export type LogoutResult = {
  confirmed: boolean;
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
let lastSessionValidationAt = 0;
const sessionMarkerKey = "restaurantWishlist.hasSession";

export type AuthSessionState = "unknown" | "restoring" | "authenticated" | "unauthenticated";

let authSessionState: AuthSessionState = "unknown";

const authChannel: BroadcastChannel | null =
  typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel("restaurantWishlist.auth");

authChannel?.addEventListener("message", (event: MessageEvent) => {
  const data = event.data as { type?: string; token?: string } | null;
  if (data?.type === "token" && typeof data.token === "string") {
    accessToken = data.token;
    setAuthSessionState("authenticated");
  } else if (data?.type === "logout") {
    accessToken = null;
    setAuthSessionState("unauthenticated");
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

export class SessionRecoveryError extends Error {
  detail: unknown;

  constructor(detail: unknown) {
    super("Session recovery is temporarily unavailable.");
    this.name = "SessionRecoveryError";
    this.detail = detail;
  }
}

export function isSessionRecoveryError(caught: unknown): caught is SessionRecoveryError {
  return caught instanceof SessionRecoveryError;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getAuthSessionState(): AuthSessionState {
  return authSessionState;
}

export function saveAccessToken(token: string): void {
  accessToken = token;
  setAuthSessionState("authenticated");
  setSessionMarker();
  authChannel?.postMessage({ type: "token", token });
}

export function clearTokens(): void {
  accessToken = null;
  setAuthSessionState("unauthenticated");
  clearSessionMarker();
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
  if (typeof window !== "undefined" && !hasSessionMarker()) {
    setAuthSessionState("unauthenticated");
    return null;
  }
  return refreshAccessToken();
}

/**
 * Revokes the refresh token server-side (via the HttpOnly cookie) and clears the
 * in-memory token, broadcasting the logout to other tabs. The local session is
 * cleared even if the network call fails.
 */
export async function logout(): Promise<LogoutResult> {
  let confirmed = true;
  try {
    await apiRequest("/auth/logout", { method: "POST", auth: false, skipRefresh: true });
  } catch {
    confirmed = false;
    // Ignore network/HTTP errors — clear the local session regardless.
  } finally {
    clearTokens();
  }
  return { confirmed };
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await performRequest(path, options);
  const data = await parseResponseBody(response);

  if (response.status === 401 && options.auth !== false && !options.skipRefresh) {
    const refreshedToken = await refreshAccessToken(true);
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

async function refreshAccessToken(force = false): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = runRefreshWithLock(force).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// Serialize refresh across tabs with the Web Locks API when available, so only
// one tab rotates the refresh token at a time. Other tabs pick up the new token
// via the BroadcastChannel and skip refreshing.
async function runRefreshWithLock(force: boolean): Promise<string | null> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  if (locks?.request) {
    return locks.request("restaurantWishlist.auth-refresh", () => performRefresh(force));
  }
  return performRefresh(force);
}

async function performRefresh(force: boolean): Promise<string | null> {
  if (accessToken && !force) {
    return accessToken;
  }

  setAuthSessionState("restoring");

  try {
    const response = await apiRequest<RefreshResponse>("/auth/refresh", {
      method: "POST",
      auth: false,
      skipRefresh: true
    });
    saveAccessToken(response.accessToken);
    return response.accessToken;
  } catch (caught) {
    if (isAuthoritativeRefreshFailure(caught)) {
      clearTokens();
      return null;
    }

    setAuthSessionState(accessToken ? "authenticated" : "unknown");
    throw new SessionRecoveryError(caught);
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

  if (payload?.error?.message) {
    return payload.error.message;
  }

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

function installSessionRecoveryListeners(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const validateSession = () => {
    if (document.visibilityState === "hidden") {
      return;
    }

    if (accessToken) {
      return;
    }

    if (!accessToken && !hasSessionMarker()) {
      return;
    }

    if (refreshPromise) {
      return;
    }

    const now = Date.now();
    if (now - lastSessionValidationAt < 30_000) {
      return;
    }
    lastSessionValidationAt = now;
    void refreshAccessToken().catch(() => {
      // Recoverable foreground failures keep the session marker so the next
      // protected request can retry instead of forcing a premature logout.
    });
  };

  window.addEventListener("focus", validateSession);
  window.addEventListener("pageshow", validateSession);
  document.addEventListener("visibilitychange", validateSession);
  window.setTimeout(validateSession, 0);
}

installSessionRecoveryListeners();

function hasSessionMarker(): boolean {
  try {
    return window.localStorage.getItem(sessionMarkerKey) === "1";
  } catch {
    return false;
  }
}

function setAuthSessionState(state: AuthSessionState): void {
  authSessionState = state;
}

function isAuthoritativeRefreshFailure(caught: unknown): boolean {
  return caught instanceof ApiError && caught.status === 401;
}

function setSessionMarker(): void {
  try {
    window.localStorage.setItem(sessionMarkerKey, "1");
  } catch {
    // The in-memory access token remains usable; reload restoration needs storage.
  }
}

function clearSessionMarker(): void {
  try {
    window.localStorage.removeItem(sessionMarkerKey);
  } catch {
    // Ignore storage failures; the in-memory token is already cleared.
  }
}
