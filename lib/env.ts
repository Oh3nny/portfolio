function readTrimmedEnv(name: string) {
  const value = process.env[name]?.trim();

  return value ? value : null;
}

function readPositiveIntegerEnv(
  name: string,
  fallback: number,
  minimum = 1,
  maximum = Number.MAX_SAFE_INTEGER
) {
  const rawValue = readTrimmedEnv(name);

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < minimum || parsedValue > maximum) {
    return fallback;
  }

  return parsedValue;
}

export const env = {
  openAiApiKey: readTrimmedEnv("OPENAI_API_KEY"),
  openAiModel: readTrimmedEnv("OPENAI_MODEL") ?? "gpt-5-nano",
  apiRateLimitMaxRequests: readPositiveIntegerEnv(
    "API_RATE_LIMIT_MAX_REQUESTS",
    12,
    1,
    500
  ),
  apiRateLimitWindowSeconds: readPositiveIntegerEnv(
    "API_RATE_LIMIT_WINDOW_SECONDS",
    300,
    1,
    86_400
  ),
  upstashRedisRestUrl:
    readTrimmedEnv("UPSTASH_REDIS_REST_URL") ??
    readTrimmedEnv("KV_REST_API_URL"),
  upstashRedisRestToken:
    readTrimmedEnv("UPSTASH_REDIS_REST_TOKEN") ??
    readTrimmedEnv("KV_REST_API_TOKEN"),
} as const;

export function hasDistributedRateLimitConfig() {
  return Boolean(env.upstashRedisRestUrl && env.upstashRedisRestToken);
}
