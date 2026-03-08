import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type NextRequest } from "next/server";

const VIEW_API_PATH_PREFIX = "/api/video/";
const VIEW_API_PATH_SUFFIX = "/view";

/**
 * Get client IP from request using trusted Vercel/proxy headers.
 * Used in middleware and API routes for rate limiting and view recording.
 */
export function getClientIp(request: NextRequest): string {
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const xVercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (xVercelForwardedFor) return xVercelForwardedFor.trim();
  return "0.0.0.0";
}

/**
 * Match path like /api/video/<hash>/view and return the hash segment, or null.
 */
export function getViewApiHashFromPath(pathname: string): string | null {
  if (!pathname.startsWith(VIEW_API_PATH_PREFIX) || !pathname.endsWith(VIEW_API_PATH_SUFFIX))
    return null;
  const between = pathname.slice(
    VIEW_API_PATH_PREFIX.length,
    pathname.length - VIEW_API_PATH_SUFFIX.length
  );
  const trimmed = between.replace(/^\/|\/$/g, "");
  return trimmed.length > 0 ? trimmed : null;
}

export function isViewApiPath(pathname: string): boolean {
  return getViewApiHashFromPath(pathname) !== null;
}

let globalLimiter: Ratelimit | null = null;
let perVideoLimiter: Ratelimit | null = null;

function getLimiters(): {
  global: Ratelimit | null;
  perVideo: Ratelimit | null;
} {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { global: null, perVideo: null };

  if (!globalLimiter) {
    const redis = new Redis({ url, token });
    globalLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
    });
  }
  if (!perVideoLimiter) {
    const redis = new Redis({ url, token });
    perVideoLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
    });
  }
  return { global: globalLimiter, perVideo: perVideoLimiter };
}

/**
 * Check rate limits for POST /api/video/[hash]/view.
 * - Global: 60 requests per minute per IP to the view endpoint.
 * - Per-video: 5 requests per 10 minutes per IP per share hash.
 * Returns { limited: true } if either limit is exceeded; otherwise { limited: false }.
 * If Upstash env vars are not set, allows the request (no-op).
 */
export async function checkViewApiRateLimit(
  request: NextRequest,
  pathname: string
): Promise<{ limited: boolean }> {
  const ip = getClientIp(request);
  const hash = getViewApiHashFromPath(pathname);
  const { global, perVideo } = getLimiters();
  if (!global || !perVideo) return { limited: false };

  const [globalResult, perVideoResult] = await Promise.all([
    global.limit(`view-api:ip:${ip}`),
    hash ? perVideo.limit(`view-video:ip:${ip}:hash:${hash}`) : Promise.resolve({ success: true }),
  ]);

  if (!globalResult.success || !perVideoResult.success) {
    return { limited: true };
  }
  return { limited: false };
}
