import { describe, it, expect } from "@jest/globals";

// ─── Inline the pure functions from signup/page.tsx for testing ───

interface PricingPlan {
  id: number;
  planKey: string;
  name: string;
  price: number;
  staffLimit: number | null;
  features: string | string[] | null;
  active: boolean;
  sortOrder: number;
  stripePriceId: string | null;
}

function parseFeatures(f: string | string[] | null): string[] {
  if (!f) return [];
  if (Array.isArray(f)) return f;
  try { return JSON.parse(f); } catch { return []; }
}

function dbPlansToDisplay(plans: PricingPlan[]) {
  return plans.map((p, i) => ({
    key: p.planKey,
    name: p.name,
    price: p.price / 100,
    period: "/month",
    desc: p.staffLimit ? `Up to ${p.staffLimit} staff` : "Unlimited staff",
    features: parseFeatures(p.features),
    highlight: i === plans.length - 1,
  }));
}

describe("parseFeatures", () => {
  it("returns empty array for null", () => {
    expect(parseFeatures(null)).toEqual([]);
  });

  it("returns empty array for undefined-like empty string", () => {
    expect(parseFeatures("")).toEqual([]);
  });

  it("parses a JSON string array", () => {
    expect(parseFeatures('["A","B","C"]')).toEqual(["A", "B", "C"]);
  });

  it("returns a string array as-is", () => {
    expect(parseFeatures(["X", "Y"])).toEqual(["X", "Y"]);
  });

  it("returns empty array for invalid JSON string", () => {
    expect(parseFeatures("not json")).toEqual([]);
  });
});

describe("dbPlansToDisplay", () => {
  const mockPlans: PricingPlan[] = [
    {
      id: 2, planKey: "CORE", name: "Core", price: 9900,
      staffLimit: 15, features: '["Inventory","Scheduling"]',
      active: true, sortOrder: 1, stripePriceId: null,
    },
    {
      id: 3, planKey: "OPERATOR", name: "Operator", price: 19900,
      staffLimit: 35, features: ["Menu planning", "Social"],
      active: true, sortOrder: 2, stripePriceId: null,
    },
  ];

  it("converts cents to dollars", () => {
    const result = dbPlansToDisplay(mockPlans);
    expect(result[0].price).toBe(99);
    expect(result[1].price).toBe(199);
  });

  it("uses planKey as key", () => {
    const result = dbPlansToDisplay(mockPlans);
    expect(result.map(r => r.key)).toEqual(["CORE", "OPERATOR"]);
  });

  it("uses display name from DB", () => {
    const result = dbPlansToDisplay(mockPlans);
    expect(result.map(r => r.name)).toEqual(["Core", "Operator"]);
  });

  it("shows staff limit in desc when present", () => {
    const result = dbPlansToDisplay(mockPlans);
    expect(result[0].desc).toBe("Up to 15 staff");
    expect(result[1].desc).toBe("Up to 35 staff");
  });

  it("parses features from JSON string", () => {
    const result = dbPlansToDisplay(mockPlans);
    expect(result[0].features).toEqual(["Inventory", "Scheduling"]);
  });

  it("passes through array features", () => {
    const result = dbPlansToDisplay(mockPlans);
    expect(result[1].features).toEqual(["Menu planning", "Social"]);
  });

  it("highlights the last plan (Operator)", () => {
    const result = dbPlansToDisplay(mockPlans);
    expect(result[0].highlight).toBe(false);
    expect(result[1].highlight).toBe(true);
  });

  it("handles single plan", () => {
    const result = dbPlansToDisplay([mockPlans[0]]);
    expect(result[0].highlight).toBe(true);
  });

  it("handles empty array", () => {
    const result = dbPlansToDisplay([]);
    expect(result).toEqual([]);
  });
});

describe("plan filtering logic (signup page)", () => {
  const allPlans: PricingPlan[] = [
    { id: 5, planKey: "TEST", name: "Test", price: 100, staffLimit: null, features: null, active: true, sortOrder: -1, stripePriceId: null },
    { id: 1, planKey: "FREE", name: "Free", price: 0, staffLimit: 5, features: null, active: true, sortOrder: 0, stripePriceId: null },
    { id: 2, planKey: "CORE", name: "Core", price: 9900, staffLimit: 15, features: null, active: true, sortOrder: 1, stripePriceId: null },
    { id: 3, planKey: "OPERATOR", name: "Operator", price: 19900, staffLimit: 35, features: null, active: true, sortOrder: 2, stripePriceId: null },
    { id: 6, planKey: "ARCHIVED", name: "Archived Plan", price: 5000, staffLimit: 10, features: null, active: false, sortOrder: 4, stripePriceId: null },
  ];

  // Simulate the filter from signup page
  function filterPlans(plans: PricingPlan[]) {
    return plans
      .filter(p => p.active && p.planKey !== "TEST" && p.planKey !== "FREE")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  it("excludes TEST plan", () => {
    const result = filterPlans(allPlans);
    expect(result.find(p => p.planKey === "TEST")).toBeUndefined();
  });

  it("excludes FREE plan", () => {
    const result = filterPlans(allPlans);
    expect(result.find(p => p.planKey === "FREE")).toBeUndefined();
  });

  it("excludes inactive plans", () => {
    const result = filterPlans(allPlans);
    expect(result.find(p => p.planKey === "ARCHIVED")).toBeUndefined();
  });

  it("includes CORE and OPERATOR", () => {
    const result = filterPlans(allPlans);
    const keys = result.map(p => p.planKey);
    expect(keys).toEqual(["CORE", "OPERATOR"]);
  });

  it("respects sortOrder", () => {
    const result = filterPlans(allPlans);
    expect(result[0].sortOrder).toBeLessThan(result[1].sortOrder);
  });

  it("returns 2 plans from the full set", () => {
    const result = filterPlans(allPlans);
    expect(result).toHaveLength(2);
  });
});
