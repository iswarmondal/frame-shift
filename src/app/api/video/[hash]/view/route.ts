import { recordVideoView } from "@/lib/db/videos";
import { verifyViewToken } from "@/lib/view-token";
import { NextResponse } from "next/server";

function getClientIp(request: Request): string {
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
 * POST /api/video/[hash]/view — record a view (with token + rate limiting).
 * Body: { token: string } — short-lived signed token from the page render.
 * Returns 200 always when token is valid (recorded, rate-limited, or replay).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  if (!hash) {
    return NextResponse.json({ error: "Missing hash" }, { status: 400 });
  }

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid body; expected { token }" },
      { status: 400 }
    );
  }

  const token =
    typeof body?.token === "string" ? body.token.trim() : undefined;
  if (!token) {
    return NextResponse.json(
      { error: "Missing token; view must be triggered from the video page" },
      { status: 400 }
    );
  }

  const payload = verifyViewToken(token, hash);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  try {
    const ip = getClientIp(request);
    const result = await recordVideoView(hash, payload.jti, ip);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Failed to record video view:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
