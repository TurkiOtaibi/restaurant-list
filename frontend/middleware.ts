import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function buildContentSecurityPolicy(nonce: string): string {
  // Next's dev server (HMR / React Refresh) needs 'unsafe-eval'; production does not.
  const isDev = process.env.NODE_ENV !== "production";

  const connectSrc = ["'self'", "http://localhost:8000", "http://127.0.0.1:8000", apiBaseUrl]
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(" ");

  const scriptSrc = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", isDev ? "'unsafe-eval'" : ""]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; ");
}

export function middleware(request: NextRequest): NextResponse {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildContentSecurityPolicy(nonce);

  // Next reads the nonce from the request CSP header and applies it to its own
  // scripts, so we set it on both the forwarded request and the response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" }
      ]
    }
  ]
};
