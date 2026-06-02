import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/qr-sign",
  "/entry/",
  "/api/auth/",
  "/signup",
  "/api/tenants",        // Tenant provisioning (onboarding)
  "/api/tenant-resolve", // Subdomain resolution
];

// Platform paths (rescommand.com root — no tenant context)
const PLATFORM_PATHS = [
  "/signup",
  "/admin",
  "/api/tenants",
  "/api/tenant-resolve",
  "/api/platform",
];

export async function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;
  const hostname = request.headers.get("host") || host;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Detect if this is a subdomain request vs platform (root domain)
  // In dev: localhost is the platform, subdomains aren't used
  // In prod: rescommand.com = platform, *.rescommand.com = tenant
  const isTenantSubdomain = isTenantHost(hostname);

  // Platform routes are always accessible
  if (PLATFORM_PATHS.some(p => pathname.startsWith(p))) {
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
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for a session cookie
  const hasSession =
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function isTenantHost(hostname: string): boolean {
  // In development, treat localhost as platform (no subdomain routing)
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return false;
  }

  // *.drytis.dev = current dev/preview environment, treat as single-tenant for now
  if (hostname.endsWith(".drytis.dev")) {
    return false;
  }

  // *.rescommand.com = tenant subdomain
  if (hostname.endsWith(".rescommand.com")) {
    // But rescommand.com itself (no subdomain) = platform
    return hostname !== "rescommand.com" && hostname !== "www.rescommand.com";
  }

  // Custom domain = always a tenant
  // (will be resolved by API route, not middleware)
  return true;
}

function extractSubdomain(hostname: string): string | null {
  // Extract subdomain from *.rescommand.com
  const match = hostname.match(/^([a-z0-9-]+)\.rescommand\.com$/);
  if (match) return match[1];

  // For custom domains, return null (resolved by API)
  return null;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};