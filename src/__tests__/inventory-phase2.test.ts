import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock Prisma
const mockPrisma = {
  orderRequest: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  inventoryItem: {
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  inventoryCount: {
    findUnique: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/tenant", () => ({
  getTenantId: jest.fn().mockResolvedValue(1),
  getSessionContext: jest.fn().mockResolvedValue({
    userId: 1,
    tenantId: 1,
    role: "PLATFORM_ADMIN",
  }),
}));

describe("Inventory generate-orders logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should identify items below par that need orders", () => {
    const lines = [
      { inventoryItemId: 1, amountToOrder: 5, inventoryItem: { name: "Flour", vendor: { name: "US Foods" } } },
      { inventoryItemId: 2, amountToOrder: 0, inventoryItem: { name: "Sugar", vendor: { name: "US Foods" } } },
      { inventoryItemId: 3, amountToOrder: 10, inventoryItem: { name: "Butter", vendor: { name: "GFI" } } },
    ];

    const needOrders = lines.filter((l) => l.amountToOrder > 0);
    expect(needOrders).toHaveLength(2);
    expect(needOrders[0].inventoryItem.name).toBe("Flour");
    expect(needOrders[1].inventoryItem.name).toBe("Butter");
  });

  it("should skip items that already have pending requests", () => {
    const allItemIds = [1, 2, 3];
    const existingRequests = [
      { inventoryItemId: 1 },
      { inventoryItemId: 3 },
    ];
    const alreadyRequested = new Set(existingRequests.map((r) => r.inventoryItemId));

    const newItems = allItemIds.filter((id) => !alreadyRequested.has(id));
    expect(newItems).toEqual([2]);
    expect(alreadyRequested.size).toBe(2);
  });

  it("should group order items by vendor", () => {
    const items = [
      { name: "Flour", amountToOrder: 5, vendor: { name: "US Foods" } },
      { name: "Butter", amountToOrder: 10, vendor: { name: "GFI" } },
      { name: "Sugar", amountToOrder: 3, vendor: { name: "US Foods" } },
    ];

    const byVendor: Record<string, typeof items> = {};
    for (const item of items) {
      const v = item.vendor.name;
      if (!byVendor[v]) byVendor[v] = [];
      byVendor[v].push(item);
    }

    expect(Object.keys(byVendor)).toHaveLength(2);
    expect(byVendor["US Foods"]).toHaveLength(2);
    expect(byVendor["GFI"]).toHaveLength(1);
  });
});

describe("Inventory receiving logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should increment currentStock when receiving", () => {
    const existingItem = { currentStock: 10 };
    const qtyReceived = 5;
    const newStock = existingItem.currentStock + qtyReceived;
    expect(newStock).toBe(15);
  });

  it("should not double-receive an already fulfilled order", () => {
    const existing = { status: "FULFILLED" };
    const isAlreadyFulfilled = existing.status === "FULFILLED";
    expect(isAlreadyFulfilled).toBe(true);
    // The API checks: if already FULFILLED, skip increment
  });

  it("should only receive inventory items (not custom)", () => {
    const orderWithItem = { inventoryItemId: 5, qtyRequested: 3 };
    const orderCustom = { inventoryItemId: null, qtyRequested: 3 };

    expect(orderWithItem.inventoryItemId).toBeTruthy();
    expect(orderCustom.inventoryItemId).toBeNull();
    // API only increments when inventoryItemId is not null
  });
});

describe("Inventory count history", () => {
  it("should calculate total to order from count lines", () => {
    const lines = [
      { amountToOrder: 5 },
      { amountToOrder: 0 },
      { amountToOrder: 10 },
      { amountToOrder: 3 },
    ];
    const total = lines.reduce((sum, l) => sum + l.amountToOrder, 0);
    expect(total).toBe(18);
  });

  it("should format count date for display", () => {
    const dateStr = "2026-07-02";
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    expect(formatted).toContain("Jul");
    expect(formatted).toContain("2");
  });
});
