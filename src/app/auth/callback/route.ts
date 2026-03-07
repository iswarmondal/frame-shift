import { NextResponse } from "next/server";
import { getAllowedRequestOrigin } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const redirectTo = next.startsWith("/") ? next : "/dashboard";
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
