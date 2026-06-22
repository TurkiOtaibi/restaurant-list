import { apiBaseUrl } from "./env";

const ACCESS_TOKEN_KEY = "restaurantWishlist.accessToken";
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

let refreshPromise: Promise<string | null> | null = null;

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
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveAccessToken(accessToken: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
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
    refreshPromise = apiRequest<RefreshResponse>("/auth/refresh", {
      method: "POST",
      auth: false,
      skipRefresh: true
    })
      .then((response) => {
        saveAccessToken(response.accessToken);
        return response.accessToken;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
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
