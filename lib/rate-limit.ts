import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import type { NextRequest } from "next/server";
import { env, hasDistributedRateLimitConfig } from "./env";
import { getClientIpFromHeaders } from "./request";

export type RateLimitCheckResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
};

const rateLimitWindowMs = env.apiRateLimitWindowSeconds * 1000;
const ephemeralCache = new Map<string, number>();
const inMemoryRequestLog = new Map<string, number[]>();

const distributedRateLimiter = hasDistributedRateLimitConfig()
  ? new Ratelimit({
      redis: new Redis({
        url: env.upstashRedisRestUrl ?? undefined,
        token: env.upstashRedisRestToken ?? undefined,
      }),
      limiter: Ratelimit.slidingWindow(
        env.apiRateLimitMaxRequests,
        `${env.apiRateLimitWindowSeconds} s`
      ),
      analytics: false,
      ephemeralCache,
      prefix: "ohenny-portfolio:api",
      timeout: 1000,
    })
  : null;

function createResolvedPendingPromise() {
  return Promise.resolve();
}

function applyInMemoryRateLimit(identifier: string): RateLimitCheckResult {
  const now = Date.now();
  const recentRequests = (inMemoryRequestLog.get(identifier) ?? []).filter(
    (timestamp) => now - timestamp < rateLimitWindowMs
  );
  const oldestRequest = recentRequests[0] ?? now;
  const reset = oldestRequest + rateLimitWindowMs;

  if (recentRequests.length >= env.apiRateLimitMaxRequests) {
    inMemoryRequestLog.set(identifier, recentRequests);

    return {
      success: false,
      limit: env.apiRateLimitMaxRequests,
      remaining: 0,
      reset,
      pending: createResolvedPendingPromise(),
    };
  }

  recentRequests.push(now);
  inMemoryRequestLog.set(identifier, recentRequests);

  return {
    success: true,
    limit: env.apiRateLimitMaxRequests,
    remaining: Math.max(env.apiRateLimitMaxRequests - recentRequests.length, 0),
    reset: recentRequests[0] + rateLimitWindowMs,
    pending: createResolvedPendingPromise(),
  };
}

export function buildApiRateLimitKey(
  request: Pick<NextRequest, "headers" | "nextUrl">
) {
  const ip = getClientIpFromHeaders(request.headers);

  return `${request.nextUrl.pathname}:${ip}`;
}

export async function limitApiRequest(
  identifier: string
): Promise<RateLimitCheckResult> {
  if (!distributedRateLimiter) {
    return applyInMemoryRateLimit(identifier);
  }

  try {
    const result = await distributedRateLimiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      pending: result.pending,
    };
  } catch (error) {
    console.error("Distributed rate limit failed, falling back to memory", error);

    return applyInMemoryRateLimit(identifier);
  }
}
