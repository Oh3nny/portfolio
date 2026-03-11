import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildApiRateLimitKey, limitApiRequest } from "@/lib/rate-limit";
import {
  applyNoStoreHeaders,
  applyRateLimitHeaders,
  applySecurityHeaders,
} from "@/lib/security";

const CHAT_RATE_LIMIT_REPLY =
  "you're sending messages too quickly. wait a minute and try again.";

function buildRateLimitResponse(pathname: string) {
  if (pathname === "/api/chat") {
    return { reply: CHAT_RATE_LIMIT_REPLY };
  }

  return { error: "Too many requests. Please try again shortly." };
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const rateLimit = await limitApiRequest(buildApiRateLimitKey(request));

  event.waitUntil(rateLimit.pending);

  if (!rateLimit.success) {
    const response = NextResponse.json(buildRateLimitResponse(request.nextUrl.pathname), {
      status: 429,
    });

    applySecurityHeaders(response.headers);
    applyNoStoreHeaders(response.headers);
    applyRateLimitHeaders(response.headers, rateLimit);

    return response;
  }

  const response = NextResponse.next();

  applySecurityHeaders(response.headers);
  applyNoStoreHeaders(response.headers);
  applyRateLimitHeaders(response.headers, rateLimit);

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
