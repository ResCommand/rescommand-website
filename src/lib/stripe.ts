import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

export const PLANS = {
  FREE: { name: "Free", price: 0 },
  STARTER: { name: "Starter", price: 49 },
  PROFESSIONAL: { name: "Professional", price: 99 },
  ENTERPRISE: { name: "Enterprise", price: 199 },
} as const;

export type PlanKey = keyof typeof PLANS;