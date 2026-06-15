import { describe, it, expect } from "@jest/globals";

/**
 * Tests the auth configuration structure to catch issues like:
 * - Missing session prop in SessionProvider (caused blank login page)
 * - Missing role fields in JWT/session callbacks
 * - Cookie naming mismatches between proxy.ts and auth.ts
 */

describe("Auth Configuration", () => {
  describe("AuthProvider session prop", () => {
    it("AuthProvider component should accept a session prop", () => {
      // Read the source file to verify the session prop exists
      const fs = require("fs");
      const source = fs.readFileSync(
        "src/components/auth-provider.tsx",
        "utf-8"
      );

      // The component must accept a session prop and pass it to SessionProvider
      expect(source).toMatch(/session\??\s*[:\?]/);
      expect(source).toMatch(/SessionProvider.*session=/);
    });

    it("RootLayout should pass session to AuthProvider", () => {
      const fs = require("fs");
      const source = fs.readFileSync("src/app/layout.tsx", "utf-8");

      // Layout must be async and call auth()
      expect(source).toMatch(/async\s+function\s+RootLayout/);
      expect(source).toMatch(/await\s+auth\(\)/);
      // And pass session to AuthProvider
      expect(source).toMatch(/AuthProvider.*session=/);
    });
  });

  describe("Cookie naming consistency", () => {
    it("proxy.ts should check authjs.session-token cookie", () => {
      const fs = require("fs");
      const source = fs.readFileSync("src/proxy.ts", "utf-8");
      expect(source).toMatch(/authjs\.session-token/);
      expect(source).toMatch(/__Secure-authjs\.session-token/);
    });
  });

  describe("Auth callbacks preserve required fields", () => {
    it("auth.config.ts should map all session fields from token", () => {
      const fs = require("fs");
      const source = fs.readFileSync("src/auth.config.ts", "utf-8");

      // JWT callback must populate role, id, tenantId, tenantSlug, tenantName
      expect(source).toMatch(/token\.role/);
      expect(source).toMatch(/token\.id/);
      expect(source).toMatch(/token\.tenantId/);
      expect(source).toMatch(/token\.tenantSlug/);
      expect(source).toMatch(/token\.tenantName/);

      // Session callback must copy them to session.user
      expect(source).toMatch(/session\.user.*role.*token\.role/);
      expect(source).toMatch(/session\.user.*id.*token\.id/);
      expect(source).toMatch(/session\.user.*tenantId.*token\.tenantId/);
    });
  });
});
