import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planKey } = await request.json();
  if (!planKey) return NextResponse.json({ error: "Plan key required" }, { status: 400 });

  const tenantId = (session.user as { tenantId?: string }).tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant context" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { id: parseInt(tenantId) } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const plan = await prisma.planPricing.findUnique({ where: { planKey } });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const origin = process.env.AUTH_URL || "http://localhost:3000";

  try {
    // Create or retrieve Stripe customer
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: tenant.name,
        metadata: { tenant_id: tenantId },
      });
      customerId = customer.id;
      await prisma.tenant.update({ where: { id: tenant.id }, data: { stripeCustomerId: customerId } });
    }

    // If plan is free, just update directly
    if (plan.price === 0) {
      await prisma.tenant.update({ where: { id: tenant.id }, data: { plan: planKey, trialEndsAt: null } });
      return NextResponse.json({ url: `${origin}/billing?success=true` });
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
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?canceled=true`,
      metadata: { tenant_id: tenantId, plan: planKey },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}