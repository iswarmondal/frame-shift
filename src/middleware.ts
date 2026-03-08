import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  checkViewApiRateLimit,
  isViewApiPath,
} from "@/lib/rate-limit";
import { VIEWER_ID_COOKIE_NAME } from "@/lib/request-client";

const PROTECTED_PREFIX = "/dashboard";
const PUBLIC_VIDEO_PREFIX = "/video/";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limit POST /api/video/[hash]/view before hitting the route or Supabase
  if (
    request.method === "POST" &&
    isViewApiPath(pathname)
  ) {
    const { limited } = await checkViewApiRateLimit(request, pathname);
    if (limited) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`);

  if (isProtected) {
    if (!user) {
      const redirect = new URL("/login", request.url);
      redirect.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirect);
    }
  }

  // Set first-party viewer-id cookie for public video pages so view API can dedupe by viewer
  if (
    pathname.startsWith(PUBLIC_VIDEO_PREFIX) &&
    !pathname.startsWith("/api/") &&
    !request.cookies.get(VIEWER_ID_COOKIE_NAME)?.value
  ) {
    response.cookies.set(VIEWER_ID_COOKIE_NAME, crypto.randomUUID(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
