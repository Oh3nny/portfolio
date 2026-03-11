function sanitizeIdentifier(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(/[^a-zA-Z0-9:.,-]/g, "").slice(0, 128);
}

export function getClientIpFromHeaders(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const cloudflareIp = headers.get("cf-connecting-ip");
  const candidate =
    forwardedFor?.split(",")[0]?.trim() || realIp || cloudflareIp || "unknown";

  return sanitizeIdentifier(candidate) || "unknown";
}
