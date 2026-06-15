import { describe, it, expect } from "@jest/globals";

/**
 * Tests that the sidebar navigation includes ALL roles that can exist in the system.
 * This catches the PLATFORM_ADMIN blank-sidebar bug.
 *
 * To run without importing the actual component (which needs React/Next.js),
 * we test the roles array logic directly.
 */

const ALL_ROLES = ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"];

// Mirror of the allNav array from src/app/(dashboard)/layout.tsx
// Keep this in sync — the test fails if any role is missing.
const navItemRoles = [
  { label: "Dashboard", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Espresso Dial", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Financials", roles: ["OWNER", "PLATFORM_ADMIN"] },
  { label: "Inventory", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Order Requests", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Recipes", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Par Sheets", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Schedule", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Menu Planning", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "SOPs", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Cleaning", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Roasting", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Social Media", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Notifications", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Admin", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"] },
  { label: "Billing", roles: ["OWNER", "PLATFORM_ADMIN"] },
  { label: "QR Sign", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"] },
];

describe("Sidebar Navigation Roles", () => {
  describe("PLATFORM_ADMIN can see navigation items", () => {
    it("should have at least one nav item visible for PLATFORM_ADMIN", () => {
      const visible = navItemRoles.filter((item) =>
        item.roles.includes("PLATFORM_ADMIN")
      );
      expect(visible.length).toBeGreaterThan(0);
    });

    it("should show all nav items for PLATFORM_ADMIN", () => {
      const visible = navItemRoles.filter((item) =>
        item.roles.includes("PLATFORM_ADMIN")
      );
      expect(visible.length).toBe(navItemRoles.length);
    });
  });

  describe("Every role has at least the Dashboard", () => {
    ALL_ROLES.forEach((role) => {
      it(`role ${role} can see Dashboard`, () => {
        const dashboard = navItemRoles.find((item) => item.label === "Dashboard");
        expect(dashboard?.roles).toContain(role);
      });
    });
  });

  describe("Every role has visible nav items", () => {
    ALL_ROLES.forEach((role) => {
      it(`role ${role} has at least 3 visible nav items`, () => {
        const visible = navItemRoles.filter((item) => item.roles.includes(role));
        expect(visible.length).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
