import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/signup-checkout
 *
 * Creates a Stripe Checkout session for a brand-new signup where the user
 * doesn't have an authenticated session yet. Called from the signup wizard
 * immediately after tenant creation.
 *
 * Body: { planKey: string, tenantId: number, email: string }
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { planKey, tenantId, email } = body;

  if (!planKey || !tenantId || !email) {
    return NextResponse.json({ error: "planKey, tenantId, and email are required" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: parseInt(tenantId) } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  // Security: only allow checkout for tenants created within the last 10 minutes
  // (prevents unauthorized checkout session creation for old tenants)
  const ageMs = Date.now() - new Date(tenant.createdAt).getTime();
  if (ageMs > 10 * 60 * 1000) {
    return NextResponse.json({ error: "Signup checkout only available for newly created tenants. Please log in and use billing." }, { status: 403 });
  }

  const plan = await prisma.planPricing.findUnique({ where: { planKey } });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  // Free plan — just update the tenant directly
  if (plan.price === 0) {
    await prisma.tenant.update({ where: { id: tenant.id }, data: { plan: planKey, trialEndsAt: null } });
    const origin = process.env.AUTH_URL || "http://localhost:3000";
    return NextResponse.json({ url: `${origin}/login?signup=success` });
  }

  const origin = process.env.AUTH_URL || "http://localhost:3000";

  try {
    // Create or retrieve Stripe customer
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: tenant.name,
        metadata: { tenant_id: String(tenantId) },
      });
      customerId = customer.id;
      await prisma.tenant.update({ where: { id: tenant.id }, data: { stripeCustomerId: customerId } });
    }

    // Find or create Stripe Price
    let stripePriceId = plan.stripePriceId;
    if (!stripePriceId) {
      const product = await stripe.products.create({
        name: `ResCommand ${plan.name}`,
        description: `ResCommand ${plan.name} plan — restaurant operations platform`,
        metadata: { planKey: plan.planKey },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: "usd",
        recurring: { interval: "month" },
      });

      stripePriceId = price.id;
      await prisma.planPricing.update({ where: { planKey }, data: { stripePriceId } });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${origin}/login?signup=success`,
      cancel_url: `${origin}/login?signup=success`,
      metadata: { tenant_id: String(tenantId), plan: planKey },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Signup Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
