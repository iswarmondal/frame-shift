import { NextResponse } from "next/server";
import { getRequestHost, getRequestOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = getRequestHost(request);

  if (origin && host && new URL(origin).host !== host) {
    return new NextResponse("CSRF check failed", { status: 403 });
  }

  // Fallback for browsers that don't send origin (like Safari for same-origin requests)
  // We can also check referer.
  if (!origin) {
    const referer = request.headers.get("referer");
    if (referer && host && new URL(referer).host !== host) {
      return new NextResponse("CSRF check failed", { status: 403 });
    }
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  const requestOrigin = getRequestOrigin(request);
  return NextResponse.redirect(`${requestOrigin}/`, { status: 302 });
}
