import { describe, it, expect } from "@jest/globals";

// ─── Batch Calculation Logic ────────────────────────────────
const SMALL_BATCH = 46;
const LARGE_BATCH = 69;

function calculateBatches(target: number) {
  let bestLarge = 0, bestSmall = 0, bestTotal = Infinity, bestGap = Infinity;
  const maxLarge = Math.ceil(target / LARGE_BATCH);
  for (let l = maxLarge; l >= 0; l--) {
    const remainder = target - l * LARGE_BATCH;
    const s = remainder <= 0 ? 0 : Math.ceil(remainder / SMALL_BATCH);
    const total = l * LARGE_BATCH + s * SMALL_BATCH;
    if (total < target) continue;
    if (total > target * 1.15) continue;
    const gap = Math.abs(l - s);
    if (gap < bestGap || (gap === bestGap && total < bestTotal)) {
      bestLarge = l; bestSmall = s; bestTotal = total; bestGap = gap;
    }
  }
  if (bestTotal === Infinity) { bestLarge = Math.ceil(target / LARGE_BATCH); bestSmall = 0; bestTotal = bestLarge * LARGE_BATCH; }
  return { large: bestLarge, small: bestSmall, totalDonuts: bestTotal, overProduction: bestTotal - target };
}

describe("calculateBatches", () => {
  it("should balance both mixers for 400 donuts (Mon-Wed)", () => {
    const result = calculateBatches(400);
    expect(result.large).toBe(4);
    expect(result.small).toBe(3);
    expect(result.totalDonuts).toBe(4 * 69 + 3 * 46); // 276 + 138 = 414
    expect(result.overProduction).toBe(14);
    expect(result.totalDonuts).toBeGreaterThanOrEqual(400);
  });

  it("should balance both mixers for 500 donuts (Thursday)", () => {
    const result = calculateBatches(500);
    expect(result.large).toBe(4);
    expect(result.small).toBe(5);
    expect(result.totalDonuts).toBe(4 * 69 + 5 * 46); // 276 + 230 = 506
    expect(result.overProduction).toBe(6);
    expect(result.totalDonuts).toBeGreaterThanOrEqual(500);
  });

  it("should balance both mixers for 600 donuts (Friday)", () => {
    const result = calculateBatches(600);
    expect(result.large).toBe(5);
    expect(result.small).toBe(6);
    expect(result.totalDonuts).toBe(5 * 69 + 6 * 46); // 345 + 276 = 621
    expect(result.overProduction).toBe(21);
    expect(result.totalDonuts).toBeGreaterThanOrEqual(600);
  });

  it("should perfectly alternate for 900 donuts (Weekend/Holiday)", () => {
    const result = calculateBatches(900);
    expect(result.large).toBe(8);
    expect(result.small).toBe(8);
    expect(result.totalDonuts).toBe(8 * 69 + 8 * 46); // 552 + 368 = 920
    expect(result.overProduction).toBe(20);
    expect(result.totalDonuts).toBeGreaterThanOrEqual(900);
    // Both mixers run the same number of cycles
    expect(result.large).toBe(result.small);
  });

  it("should always produce at least the target number of donuts", () => {
    for (let t = 50; t <= 1000; t += 50) {
      const result = calculateBatches(t);
      expect(result.totalDonuts).toBeGreaterThanOrEqual(t);
    }
  });

  it("should never exceed 15% over-production for real targets (200+)", () => {
    for (let t = 200; t <= 1000; t += 50) {
      const result = calculateBatches(t);
      expect(result.totalDonuts).toBeLessThanOrEqual(t * 1.15);
    }
  });

  it("should never have negative batch counts", () => {
    for (let t = 50; t <= 1000; t += 50) {
      const result = calculateBatches(t);
      expect(result.large).toBeGreaterThanOrEqual(0);
      expect(result.small).toBeGreaterThanOrEqual(0);
    }
  });

  it("should handle exact large batch multiples", () => {
    const result = calculateBatches(69);
    expect(result.large).toBe(1);
    expect(result.small).toBe(0);
    expect(result.overProduction).toBe(0);
  });

  it("should handle exact small batch multiples", () => {
    const result = calculateBatches(46);
    expect(result.large).toBe(0);
    expect(result.small).toBe(1);
    expect(result.overProduction).toBe(0);
  });

  it("should keep batch counts balanced (gap <= 2)", () => {
    // For higher targets, both mixers should run similar numbers of batches
    [400, 500, 600, 700, 800, 900, 1000].forEach(t => {
      const result = calculateBatches(t);
      const gap = Math.abs(result.large - result.small);
      expect(gap).toBeLessThanOrEqual(2);
    });
  });
});

// ─── Tray Allocation ────────────────────────────────────────
const TRAY_SIZE = 28;

describe("Tray calculations", () => {
  it("should calculate total trays correctly for 400 donuts", () => {
    const trays = Math.ceil(400 / TRAY_SIZE);
    expect(trays).toBe(15); // 400/28 = 14.28 → 15
  });

  it("should calculate total trays correctly for 500 donuts", () => {
    const trays = Math.ceil(500 / TRAY_SIZE);
    expect(trays).toBe(18); // 500/28 = 17.86 → 18
  });

  it("should calculate total trays correctly for 600 donuts", () => {
    const trays = Math.ceil(600 / TRAY_SIZE);
    expect(trays).toBe(22); // 600/28 = 21.43 → 22
  });

  it("should calculate total trays correctly for 900 donuts", () => {
    const trays = Math.ceil(900 / TRAY_SIZE);
    expect(trays).toBe(33); // 900/28 = 32.14 → 33
  });
});

// ─── Day-of-Week Target Mapping ─────────────────────────────
const DAY_TARGETS: Record<string, number> = {
  "0": 900, // Sunday
  "1": 400, // Monday
  "2": 400, // Tuesday
  "3": 400, // Wednesday
  "4": 500, // Thursday
  "5": 600, // Friday
  "6": 900, // Saturday
};

describe("Day-of-week targets", () => {
  it("should map Monday (1) to 400", () => {
    expect(DAY_TARGETS["1"]).toBe(400);
  });

  it("should map Tuesday (2) to 400", () => {
    expect(DAY_TARGETS["2"]).toBe(400);
  });

  it("should map Wednesday (3) to 400", () => {
    expect(DAY_TARGETS["3"]).toBe(400);
  });

  it("should map Thursday (4) to 500", () => {
    expect(DAY_TARGETS["4"]).toBe(500);
  });

  it("should map Friday (5) to 600", () => {
    expect(DAY_TARGETS["5"]).toBe(600);
  });

  it("should map Saturday (6) to 900", () => {
    expect(DAY_TARGETS["6"]).toBe(900);
  });

  it("should map Sunday (0) to 900", () => {
    expect(DAY_TARGETS["0"]).toBe(900);
  });

  it("should have targets for all 7 days", () => {
    expect(Object.keys(DAY_TARGETS)).toHaveLength(7);
  });
});

// ─── Period Determination ────────────────────────────────────
function getPeriod(dayOfWeek: number): string {
  if (dayOfWeek === 0 || dayOfWeek === 6) return "weekend";
  if (dayOfWeek >= 1 && dayOfWeek <= 3) return "mon_wed";
  if (dayOfWeek === 4) return "thu";
  return "fri";
}

describe("Period determination", () => {
  it("should map Mon-Wed to mon_wed period", () => {
    expect(getPeriod(1)).toBe("mon_wed");
    expect(getPeriod(2)).toBe("mon_wed");
    expect(getPeriod(3)).toBe("mon_wed");
  });

  it("should map Thursday to thu period", () => {
    expect(getPeriod(4)).toBe("thu");
  });

  it("should map Friday to fri period", () => {
    expect(getPeriod(5)).toBe("fri");
  });

  it("should map weekend days to weekend period", () => {
    expect(getPeriod(0)).toBe("weekend");
    expect(getPeriod(6)).toBe("weekend");
  });
});

// ─── Sandwich Rounding Logic ─────────────────────────────────
// Round to nearest multiple of 5 (matches API logic)
function roundTo5(n: number): number {
  if (n === 0) return 0;
  return Math.round(n / 5) * 5;
}

describe("Sandwich batch rounding (roundTo5)", () => {
  it("should round 0 to 0", () => {
    expect(roundTo5(0)).toBe(0);
  });

  it("should round 1 to 0", () => {
    expect(roundTo5(1)).toBe(0);
  });

  it("should round 2 to 0", () => {
    expect(roundTo5(2)).toBe(0);
  });

  it("should round 3 to 5", () => {
    expect(roundTo5(3)).toBe(5);
  });

  it("should round 5 to 5", () => {
    expect(roundTo5(5)).toBe(5);
  });

  it("should round 6 to 5", () => {
    expect(roundTo5(6)).toBe(5);
  });

  it("should round 7 to 5", () => {
    expect(roundTo5(7)).toBe(5);
  });

  it("should round 8 to 10", () => {
    expect(roundTo5(8)).toBe(10);
  });

  it("should round 9 to 10", () => {
    expect(roundTo5(9)).toBe(10);
  });

  it("should round 14 to 15", () => {
    expect(roundTo5(14)).toBe(15);
  });

  it("should round 15 to 15", () => {
    expect(roundTo5(15)).toBe(15);
  });

  it("should round 16 to 15", () => {
    expect(roundTo5(16)).toBe(15);
  });

  it("should produce correct Thursday make-day totals (2wk + 2we)", () => {
    // Per-day raw: BEC Sandwich=5/5, BEC Wrap=3/4, SEC Sandwich=2/3, SEC Wrap=1/2
    // Thu (2wk+2we) raw: 20, 14, 10, 6 → rounded: 20, 15, 10, 5 = 50
    const items = [
      roundTo5(5 * 2 + 5 * 2),   // BEC Sandwich: 20 → 20
      roundTo5(3 * 2 + 4 * 2),   // BEC Wrap: 14 → 15
      roundTo5(2 * 2 + 3 * 2),   // SEC Sandwich: 10 → 10
      roundTo5(1 * 2 + 2 * 2),   // SEC Wrap: 6 → 5
    ];
    expect(items).toEqual([20, 15, 10, 5]);
    expect(items.reduce((a, b) => a + b, 0)).toBe(50);
  });

  it("should produce correct Monday make-day totals (3 weekdays)", () => {
    // Mon (3 weekdays) raw: 15, 9, 6, 3 → rounded: 15, 10, 5, 5 = 35
    const items = [
      roundTo5(5 * 3),   // BEC Sandwich: 15 → 15
      roundTo5(3 * 3),   // BEC Wrap: 9 → 10
      roundTo5(2 * 3),   // SEC Sandwich: 6 → 5
      roundTo5(1 * 3),   // SEC Wrap: 3 → 5
    ];
    expect(items).toEqual([15, 10, 5, 5]);
    expect(items.reduce((a, b) => a + b, 0)).toBe(35);
  });
});