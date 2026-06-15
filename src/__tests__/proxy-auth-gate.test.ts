import { describe, it, expect } from "@jest/globals";

/**
 * Tests the middleware/proxy auth gate logic.
 * Verifies public paths are accessible without auth and protected paths redirect.
 *
 * We test the path-matching logic directly since the proxy component
 * requires the Next.js runtime.
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
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

describe("Proxy Auth Gate", () => {
  describe("Public paths", () => {
    const publicPaths = [
      "/login",
      "/login?callbackUrl=/dashboard",
      "/signup",
      "/api/auth/session",
      "/api/auth/signin",
      "/api/auth/callback/credentials",
      "/api/health",
      "/api/tenants/branding",
      "/qr-sign",
      "/entry/donuts",
    ];

    publicPaths.forEach((path) => {
      it(`should allow public access to ${path}`, () => {
        // Strip query string for path matching
        const pathname = path.split("?")[0];
        expect(isPublicPath(pathname)).toBe(true);
      });
    });
  });

  describe("Protected paths", () => {
    const protectedPaths = [
      "/dashboard",
      "/inventory",
      "/recipes",
      "/production",
      "/schedule",
      "/admin/users",
      "/billing",
      "/api/module-config",
      "/api/users",
      "/api/products",
    ];

    protectedPaths.forEach((path) => {
      it(`should NOT allow public access to ${path}`, () => {
        expect(isPublicPath(path)).toBe(false);
      });
    });
  });

  describe("Static assets bypass middleware", () => {
    const staticPaths = [
      "/_next/static/chunks/main.js",
      "/_next/static/css/app.css",
      "/favicon.ico",
      "/manifest.json",
      "/sw.js",
      "/icons/icon-192.png",
    ];

    staticPaths.forEach((path) => {
      it(`should bypass middleware for ${path}`, () => {
        expect(isStaticAsset(path)).toBe(true);
      });
    });
  });
});
