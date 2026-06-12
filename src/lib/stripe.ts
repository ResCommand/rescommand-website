import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

// DEPRECATED: Plan pricing is now managed dynamically via the PlanPricing DB table.
// The admin platform (/platform → Pricing tab) and /api/platform/pricing are the source of truth.
// This constant is kept for reference only — do not import in new code.
export const PLANS = {
  FREE: { name: "Free", price: 0 },
  CORE: { name: "Core", price: 99 },
  OPERATOR: { name: "Operator", price: 199 },
} as const;

export type PlanKey = keyof typeof PLANS;