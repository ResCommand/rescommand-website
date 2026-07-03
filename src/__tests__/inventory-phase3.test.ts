import { describe, it, expect } from "@jest/globals";
import { parsePackSize, roundToPackSize } from "@/lib/packSize";

describe("parsePackSize", () => {
  it("parses leading number", () => {
    expect(parsePackSize("50 lb case")).toBe(50);
    expect(parsePackSize("12 ct")).toBe(12);
  });

  it("parses N x M format (takes first number)", () => {
    expect(parsePackSize("12 x 32 oz")).toBe(12);
    expect(parsePackSize("6 x 1 lb")).toBe(6);
  });

  it("parses N/M format (takes first number)", () => {
    expect(parsePackSize("6/4# cs")).toBe(6);
    expect(parsePackSize("24/2 oz cups")).toBe(24);
  });

  it("returns null for non-numeric strings", () => {
    expect(parsePackSize("case")).toBeNull();
    expect(parsePackSize(null)).toBeNull();
    expect(parsePackSize("")).toBeNull();
    expect(parsePackSize(undefined)).toBeNull();
  });

  it("handles decimal numbers", () => {
    expect(parsePackSize("2.5 lb bag")).toBe(2.5);
  });
});

describe("roundToPackSize", () => {
  it("rounds up to nearest pack multiple", () => {
    const result = roundToPackSize(40, "50 lb case");
    expect(result.qty).toBe(50);
    expect(result.cases).toBe(1);
    expect(result.rounded).toBe(true);
  });

  it("rounds up across multiple packs", () => {
    const result = roundToPackSize(110, "50 lb case");
    expect(result.qty).toBe(150);
    expect(result.cases).toBe(3);
  });

  it("returns exact when already a multiple", () => {
    const result = roundToPackSize(100, "50 lb case");
    expect(result.qty).toBe(100);
    expect(result.cases).toBe(2);
    expect(result.rounded).toBe(false);
  });

  it("returns original when no pack size", () => {
    const result = roundToPackSize(40, null);
    expect(result.qty).toBe(40);
    expect(result.cases).toBeNull();
    expect(result.rounded).toBe(false);
  });

  it("returns 0 when toOrder is 0", () => {
    const result = roundToPackSize(0, "50 lb case");
    expect(result.qty).toBe(0);
    expect(result.cases).toBeNull();
  });

  it("handles small pack sizes", () => {
    const result = roundToPackSize(7, "6 ct");
    expect(result.qty).toBe(12);
    expect(result.cases).toBe(2);
  });
});

describe("inventory valuation calculations", () => {
  it("calculates total value correctly", () => {
    const items = [
      { currentStock: 10, unitCost: 5.5 },
      { currentStock: 3, unitCost: 25.0 },
      { currentStock: 0, unitCost: 12.0 },
    ];
    const total = items.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0);
    expect(total).toBe(130);
  });

  it("calculates low stock value correctly", () => {
    const items = [
      { currentStock: 2, unitCost: 5.5, parLevel: 10, minStock: 3 }, // low
      { currentStock: 15, unitCost: 25.0, parLevel: 10, minStock: 3 }, // ok
      { currentStock: 1, unitCost: 12.0, parLevel: 8, minStock: 2 }, // low
    ];
    const lowStockValue = items
      .filter(i => i.parLevel > 0 && i.currentStock <= i.minStock && i.minStock > 0)
      .reduce((sum, i) => sum + i.currentStock * i.unitCost, 0);
    expect(lowStockValue).toBe(23);
  });

  it("groups by vendor correctly", () => {
    const items = [
      { value: 55, vendor: "US Foods" },
      { value: 75, vendor: "US Foods" },
      { value: 30, vendor: "GFI" },
    ];
    const byVendor: Record<string, number> = {};
    for (const item of items) {
      byVendor[item.vendor] = (byVendor[item.vendor] || 0) + item.value;
    }
    expect(byVendor["US Foods"]).toBe(130);
    expect(byVendor["GFI"]).toBe(30);
  });
});

describe("sorting comparators", () => {
  it("sorts strings ascending", () => {
    const items = ["Butter", "Apple", "Cherry"];
    const sorted = [...items].sort((a, b) => a.localeCompare(b));
    expect(sorted).toEqual(["Apple", "Butter", "Cherry"]);
  });

  it("sorts numbers descending", () => {
    const items = [10, 30, 20];
    const sorted = [...items].sort((a, b) => b - a);
    expect(sorted).toEqual([30, 20, 10]);
  });

  it("handles mixed ascending/descending toggle", () => {
    let dir: "asc" | "desc" = "asc";
    const toggle = () => { dir = dir === "asc" ? "desc" : "asc"; };
    expect(dir).toBe("asc");
    toggle();
    expect(dir).toBe("desc");
    toggle();
    expect(dir).toBe("asc");
  });
});
