import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Next.js 16 proxy (formerly middleware.ts).
 * Uses edge-safe authConfig (NO Prisma/bcryptjs imports).
 */

const PUBLIC_PATHS = [
  "/login",
  "/qr-sign",
  "/entry/",
  "/api/auth/",
  "/signup",
  "/api/tenants",
  "/api/tenant-resolve",
  "/api/setup-users",
  "/api/fix-users",
  "/api/health",
];

const PLATFORM_PATHS = [
  "/signup",
  "/admin",
  "/api/tenants",
  "/api/tenant-resolve",
  "/api/platform",
];

function isTenantHost(hostname: string): boolean {
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return false;
  }
  if (hostname.endsWith(".drytis.dev")) {
    return false;
  }
  if (hostname.endsWith(".rescommand.com")) {
    return hostname !== "rescommand.com" && hostname !== "www.rescommand.com";
  }
  return true;
}

function extractSubdomain(hostname: string): string | null {
  const match = hostname.match(/^([a-z0-9-]+)\.rescommand\.com$/);
  if (match) return match[1];
  return null;
}

const { auth } = NextAuth(authConfig);

export default auth((request: NextRequest & { auth: unknown }) => {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || request.nextUrl.host;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isTenantSubdomain = isTenantHost(hostname);

  // Platform routes are always accessible
  if (PLATFORM_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Inject tenant context header for API routes
  if (isTenantSubdomain && pathname.startsWith("/api/")) {
    const slug = extractSubdomain(hostname);
    if (slug) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-tenant-slug", slug);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
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
