import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const placeImageBaseUrl = process.env.NEXT_PUBLIC_PLACE_IMAGE_BASE_URL;

function originFromUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const connectSrc = [
  "'self'",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  apiBaseUrl
]
  .filter((value, index, values) => values.indexOf(value) === index)
  .join(" ");
const imgSrc = [
  "'self'",
  "data:",
  "blob:",
  originFromUrl(placeImageBaseUrl)
]
  .filter((value): value is string => Boolean(value))
  .filter((value, index, values) => values.indexOf(value) === index)
  .join(" ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src ${imgSrc}; connect-src ${connectSrc}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          }
        ]
      }
    ];
  },
  reactStrictMode: true
};

export default nextConfig;
