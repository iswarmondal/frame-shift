import { recordVideoView } from "@/lib/db/videos";
import {
  getViewerIdentity,
  isAllowedRequestOrigin,
} from "@/lib/request-client";
import { verifyViewToken } from "@/lib/view-token";
import { VIEW_RECORD_WATCHED_SECONDS } from "@/lib/view-tracking";
import { NextResponse } from "next/server";

/**
 * POST /api/video/[hash]/view — record a view (token + playback milestone + rate limiting).
 * Body: { token: string, watchedSeconds: number } — token from page; watchedSeconds must be >= threshold.
 * Returns 200 when token valid and view recorded/rate-limited/replay; 400 if playback threshold not met.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  if (!hash) {
    return NextResponse.json({ error: "Missing hash" }, { status: 400 });
  }

  let body: { token?: string; watchedSeconds?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid body; expected { token, watchedSeconds }" },
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

  const watchedSeconds =
    typeof body?.watchedSeconds === "number" ? body.watchedSeconds : undefined;
  if (
    watchedSeconds === undefined ||
    watchedSeconds < VIEW_RECORD_WATCHED_SECONDS
  ) {
    return NextResponse.json(
      {
        error: `Playback threshold not met; watch at least ${VIEW_RECORD_WATCHED_SECONDS} seconds`,
      },
      { status: 400 }
    );
  }

  if (!isAllowedRequestOrigin(request)) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      { status: 403 }
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
    const { viewerId, ip } = getViewerIdentity(request);
    const result = await recordVideoView(hash, payload.jti, ip, viewerId);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Failed to record video view:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
