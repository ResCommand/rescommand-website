import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Next.js 16 proxy (formerly middleware.ts).
 * Single-domain architecture — no subdomain or custom domain parsing.
 * Auth gate only: redirect to /login if no session cookie.
 */

const PUBLIC_PATHS = [
  "/login",
  "/qr-sign",
  "/entry/",
  "/api/auth/",
  "/signup",
  "/api/tenants",
  "/api/setup-users",
  "/api/fix-users",
  "/api/health",
  "/mockup",
];

const { auth } = NextAuth(authConfig);

export default auth((request: NextRequest & { auth: unknown }) => {
  const { pathname } = request.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for a session cookie (v5 uses authjs.* prefix)
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
