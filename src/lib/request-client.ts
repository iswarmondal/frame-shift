import { isAllowedOrigin } from "@/lib/app-url";

const VIEWER_ID_COOKIE_NAME = "vid";

/**
 * Get client IP from a standard Request using trusted Vercel/proxy headers.
 * Use this in API route handlers; for NextRequest in middleware use getClientIp from rate-limit.
 */
export function getClientIpFromRequest(request: Request): string {
  const headers = request.headers;
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const xVercelForwardedFor = headers.get("x-vercel-forwarded-for");
  if (xVercelForwardedFor) return xVercelForwardedFor.trim();
  return "0.0.0.0";
}

/**
 * Parse Cookie header and return the value of the viewer-id cookie, or null if missing.
 */
export function getViewerIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((s) => s.trim());
  const prefix = `${VIEWER_ID_COOKIE_NAME}=`;
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      const value = part.slice(prefix.length).trim();
      return value.length > 0 ? value : null;
    }
  }
  return null;
}

/**
 * Get the canonical viewer identifier for dedupe/rate limiting.
 * Prefers first-party cookie "vid"; falls back to IP when cookie is not set.
 */
export function getViewerIdentity(request: Request): { viewerId: string; ip: string } {
  const ip = getClientIpFromRequest(request);
  const viewerId = getViewerIdFromRequest(request);
  return {
    viewerId: viewerId ?? ip,
    ip,
  };
}

/**
 * Get request origin from Origin header, or from Referer if Origin is missing.
 */
export function getOriginFromRequest(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (origin) return origin.trim();
  const referer = request.headers.get("referer");
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * Return true if the request has no origin or its origin is allowlisted (same-origin or APP_ORIGIN_ALLOWLIST).
 * Use this to reject cross-site abuse on public view API.
 */
export function isAllowedRequestOrigin(request: Request): boolean {
  const origin = getOriginFromRequest(request);
  if (!origin) return true;
  return isAllowedOrigin(origin);
}

export { VIEWER_ID_COOKIE_NAME };
