import { incrementVideoViewCount } from "@/lib/db/videos";
import { NextResponse } from "next/server";

/**
 * POST /api/video/[hash]/view — record a view for a public video.
 * Called from the client so it runs in request context (cookies() allowed).
 * Uses the standard server Supabase client (no separate anon path).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  if (!hash) {
    return NextResponse.json({ error: "Missing hash" }, { status: 400 });
  }
  try {
    await incrementVideoViewCount(hash);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to increment video view count:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
