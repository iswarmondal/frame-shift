import { NextResponse } from "next/server";
import {
  getAllowedRequestOrigin,
  getRequestOrigin,
  isAllowedOrigin,
} from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const redirectTo = next.startsWith("/") ? next : "/dashboard";
  const originParam = searchParams.get("origin");
  const requestOrigin = getRequestOrigin(request.url);

  // When the origin param differs from the current host, the user started
  // the OAuth flow on a different domain (e.g. localhost). Forward the code
  // so the PKCE verifier cookie on that domain can complete the exchange.
  if (originParam && originParam !== requestOrigin) {
    if (!isAllowedOrigin(originParam)) {
      return new NextResponse("Origin not allowed", { status: 400 });
    }

    const forwardUrl = new URL("/auth/callback", originParam);
    if (code) forwardUrl.searchParams.set("code", code);
    forwardUrl.searchParams.set("next", redirectTo);
    return NextResponse.redirect(forwardUrl.toString());
  }

  let appOrigin: string;
  try {
    appOrigin = getAllowedRequestOrigin(request.url);
  } catch {
    return new NextResponse("Invalid auth callback origin", { status: 400 });
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${appOrigin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${appOrigin}/?error=auth`);
}
