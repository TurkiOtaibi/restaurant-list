export const DEFAULT_AUTH_DESTINATION = "/places";

const SAFE_ORIGIN = "https://restaurant-list.local";

export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const candidate = value.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(candidate, SAFE_ORIGIN);
    if (parsed.origin !== SAFE_ORIGIN) {
      return null;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function loginHrefForReturn(returnPath: string): string {
  const safePath = safeReturnPath(returnPath);
  return safePath ? `/login?returnTo=${encodeURIComponent(safePath)}` : "/login";
}

export function currentReturnPath(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}
