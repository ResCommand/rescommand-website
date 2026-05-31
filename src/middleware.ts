import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/qr-sign",
  "/entry/",
  "/api/auth/",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") // static assets
  ) {
    return NextResponse.next();
  }

  // Check for auth token — NextAuth JWT strategy reads from the
  // next-auth.session-token cookie. Behind a reverse proxy (Caddy),
  // we must pass the secure cookie name because the proxy terminates TLS.
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // The cookie name NextAuth uses for JWT sessions
    cookieName: "next-auth.session-token",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next (static files)
     * - api/auth (NextAuth routes)
     * - static assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};