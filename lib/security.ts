import type { RateLimitCheckResult } from "./rate-limit";

export const SECURITY_HEADERS = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "Origin-Agent-Cluster",
    value: "?1",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
] as const;

export function applySecurityHeaders(headers: Headers) {
  SECURITY_HEADERS.forEach(({ key, value }) => {
    headers.set(key, value);
  });
}

export function applyNoStoreHeaders(headers: Headers) {
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("Pragma", "no-cache");
}

export function applyRateLimitHeaders(
  headers: Headers,
  result: RateLimitCheckResult
) {
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(result.reset / 1000)));

  if (!result.success) {
    headers.set(
      "Retry-After",
      String(Math.max(Math.ceil((result.reset - Date.now()) / 1000), 1))
    );
  }
}
