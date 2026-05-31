import { describe, it, expect } from "@jest/globals";

// ─── Labor Cost Calculation Logic ───────────────────────────
function computeLaborCostPercent(totalHours: number, hourlyRate: number, totalSales: number): number {
  if (totalSales <= 0) return 0;
  const laborCost = totalHours * hourlyRate;
  return parseFloat(((laborCost / totalSales) * 100).toFixed(1));
}

describe("Labor Cost % Calculation", () => {
  it("should return 0 when there are no sales", () => {
    expect(computeLaborCostPercent(8, 15, 0)).toBe(0);
  });

  it("should calculate today labor cost percentage correctly", () => {
    // 8 hours * $15 = $120 labor cost, $600 sales = 20%
    expect(computeLaborCostPercent(8, 15, 600)).toBe(20.0);
  });

  it("should calculate MTD labor cost percentage correctly", () => {
    // 160 hours * $15 = $2400 labor cost, $12000 MTD sales = 20%
    expect(computeLaborCostPercent(160, 15, 12000)).toBe(20.0);
  });

  it("should handle partial percentages", () => {
    // 4.5 hours * $15 = $67.50, $350 sales = 19.3%
    const result = computeLaborCostPercent(4.5, 15, 350);
    expect(result).toBe(19.3);
  });

  it("should handle zero hours (no one clocked in)", () => {
    expect(computeLaborCostPercent(0, 15, 500)).toBe(0);
  });

  it("should handle 100% labor cost edge case", () => {
    // 40 hours * $15 = $600, $600 sales = 100%
    expect(computeLaborCostPercent(40, 15, 600)).toBe(100.0);
  });

  it("should handle labor cost exceeding sales", () => {
    // 50 hours * $15 = $750, $300 sales = 250%
    expect(computeLaborCostPercent(50, 15, 300)).toBe(250.0);
  });
});