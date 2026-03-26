import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams, origin } = req.nextUrl;

  // If any non-callback route receives a PKCE ?code= (e.g. old email links pointing
  // to /dashboard), forward to /auth/callback so the client-side exchange runs.
  const code = searchParams.get("code");
  if (code && !pathname.startsWith("/auth/")) {
    const callbackUrl = new URL("/auth/callback", origin);
    callbackUrl.searchParams.set("code", code);
    return NextResponse.redirect(callbackUrl);
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refreshes the access token using the refresh token when expired.
  // This is what makes the 30-day "stay logged in" work in Server Components.
  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: [
    // Run on all routes except static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
