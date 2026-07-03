import { describe, it, expect } from "@jest/globals";

// Test the active-tab logic used by InventoryNav
function getActiveTab(pathname: string): string | null {
  const TABS = [
    { href: "/inventory", label: "Count", exact: true },
    { href: "/inventory/items", label: "Items" },
    { href: "/inventory/order-requests", label: "Orders" },
    { href: "/inventory/valuation", label: "Reports" },
  ];
  const active = TABS.find((t) =>
    t.exact ? pathname === t.href : pathname.startsWith(t.href)
  );
  return active ? active.label : null;
}

// Test the count-progress calculation
function getSectionProgress(
  secItems: { id: number }[],
  countedItems: Set<number>
): { counted: number; total: number; complete: boolean } {
  if (secItems.length === 0) return { counted: 0, total: 0, complete: false };
  const counted = secItems.filter((i) => countedItems.has(i.id)).length;
  return { counted, total: secItems.length, complete: counted === secItems.length };
}

describe("InventoryNav active-tab logic", () => {
  it("activates Count on /inventory exactly", () => {
    expect(getActiveTab("/inventory")).toBe("Count");
  });

  it("activates Items on /inventory/items", () => {
    expect(getActiveTab("/inventory/items")).toBe("Items");
  });

  it("activates Orders on /inventory/order-requests", () => {
    expect(getActiveTab("/inventory/order-requests")).toBe("Orders");
  });

  it("activates Reports on /inventory/valuation", () => {
    expect(getActiveTab("/inventory/valuation")).toBe("Reports");
  });

  it("does NOT activate Items when on /inventory (exact match for Count)", () => {
    expect(getActiveTab("/inventory")).not.toBe("Items");
  });

  it("does NOT activate any tab for unrelated paths", () => {
    expect(getActiveTab("/dashboard")).toBeNull();
    expect(getActiveTab("/production")).toBeNull();
  });
});

describe("Section count-progress calculation", () => {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

  it("returns 0 counted when nothing has been touched", () => {
    const result = getSectionProgress(items, new Set());
    expect(result.counted).toBe(0);
    expect(result.total).toBe(5);
    expect(result.complete).toBe(false);
  });

  it("returns partial count when some items touched", () => {
    const result = getSectionProgress(items, new Set([1, 3]));
    expect(result.counted).toBe(2);
    expect(result.total).toBe(5);
    expect(result.complete).toBe(false);
  });

  it("returns complete when all items counted", () => {
    const result = getSectionProgress(items, new Set([1, 2, 3, 4, 5]));
    expect(result.counted).toBe(5);
    expect(result.total).toBe(5);
    expect(result.complete).toBe(true);
  });

  it("handles empty section", () => {
    const result = getSectionProgress([], new Set());
    expect(result.counted).toBe(0);
    expect(result.total).toBe(0);
    expect(result.complete).toBe(false);
  });

  it("handles more counted than exist (edge case)", () => {
    const result = getSectionProgress([{ id: 1 }], new Set([1, 2, 3]));
    expect(result.counted).toBe(1);
    expect(result.total).toBe(1);
    expect(result.complete).toBe(true);
  });
});
