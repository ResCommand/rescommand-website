import { describe, it, expect } from "@jest/globals";

/**
 * Tests that the single-domain architecture is properly enforced.
 * No subdomain or custom-domain resolution logic should remain.
 */

describe("Single-Domain Architecture", () => {
  const fs = require("fs");

  describe("proxy.ts has no subdomain logic", () => {
    const source = fs.readFileSync("src/proxy.ts", "utf-8");

    it("should not contain isTenantHost function", () => {
      expect(source).not.toMatch(/function\s+isTenantHost/);
    });

    it("should not contain extractSubdomain function", () => {
      expect(source).not.toMatch(/function\s+extractSubdomain/);
    });

    it("should not inject x-tenant-slug header", () => {
      expect(source).not.toMatch(/x-tenant-slug/);
    });
  });

  describe("login page has no hostname parsing", () => {
    const source = fs.readFileSync(
      "src/app/(auth)/login/page.tsx",
      "utf-8"
    );

    it("should not parse window.location.hostname", () => {
      expect(source).not.toMatch(/window\.location\.hostname/);
    });

    it("should not fetch tenant-resolve", () => {
      expect(source).not.toMatch(/tenant-resolve/);
    });
  });

  describe("tenant-resolve route is removed", () => {
    it("should not exist as a file", () => {
      let exists = false;
      try {
        fs.accessSync("src/app/api/tenant-resolve/route.ts");
        exists = true;
      } catch {
        // expected
      }
      expect(exists).toBe(false);
    });
  });
});
