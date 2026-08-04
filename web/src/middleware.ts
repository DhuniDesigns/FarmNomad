import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REFRESH_COOKIE_NAME = "farmnomad_refresh";

/**
 * Lightweight, server-side route gate for Phase 3.2. Only checks whether the
 * refresh cookie is *present* — not whether it's still valid — since
 * verifying a JWT signature here would mean duplicating JwtService in Edge
 * middleware. Real authorization is enforced by the backend on every
 * protected API call; this just stops an obviously signed-out visitor from
 * loading platform UI at all, and PlatformShell (client-side) handles the
 * rest via BootstrapAuth's refresh attempt. See docs/DECISIONS.md.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(REFRESH_COOKIE_NAME);
  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/listings/:path*", "/orders/:path*", "/organisation/:path*", "/admin/:path*", "/settings/:path*"]
};
