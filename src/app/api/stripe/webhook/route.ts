import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Disable body parsing — Stripe needs the raw body
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("Stripe webhook error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const tenantId = session.metadata?.tenant_id;
      const stripeCustomerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (tenantId) {
        await prisma.tenant.update({
          where: { id: parseInt(tenantId) },
          data: {
            stripeCustomerId,
            plan: session.metadata?.plan || "STARTER",
          },
        });

        // Create or update subscription record
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Record<string, unknown>;
          const subData = sub as { current_period_start: number; current_period_end: number; cancel_at_period_end: boolean; items?: { data?: { price?: { id?: string } }[] } };
          await prisma.tenantSubscription.upsert({
            where: { tenantId: parseInt(tenantId) },
            update: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: subData.items?.data?.[0]?.price?.id || "",
              status: String(sub.status),
              currentPeriodStart: new Date(subData.current_period_start * 1000),
              currentPeriodEnd: new Date(subData.current_period_end * 1000),
              cancelAtPeriodEnd: subData.cancel_at_period_end,
            },
            create: {
              tenantId: parseInt(tenantId),
              stripeSubscriptionId: subscriptionId,
              stripePriceId: subData.items?.data?.[0]?.price?.id || "",
              status: String(sub.status),
              currentPeriodStart: new Date(subData.current_period_start * 1000),
              currentPeriodEnd: new Date(subData.current_period_end * 1000),
              cancelAtPeriodEnd: subData.cancel_at_period_end,
            },
          });
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subRaw = event.data.object as unknown as Record<string, unknown>;
      const subData2 = subRaw as { current_period_start: number; current_period_end: number; cancel_at_period_end: boolean; id: string; items?: { data?: { price?: { id?: string } }[] }; status: string; customer: string };
      const customerId = subData2.customer as string;

      const tenant = await prisma.tenant.findFirst({ where: { stripeCustomerId: customerId } });
      if (tenant) {
        await prisma.tenantSubscription.upsert({
          where: { tenantId: tenant.id },
          update: {
            status: subData2.status,
            currentPeriodStart: new Date(subData2.current_period_start * 1000),
            currentPeriodEnd: new Date(subData2.current_period_end * 1000),
            cancelAtPeriodEnd: subData2.cancel_at_period_end,
          },
          create: {
            tenantId: tenant.id,
            stripeSubscriptionId: subData2.id,
            stripePriceId: subData2.items?.data?.[0]?.price?.id || "",
            status: subData2.status,
            currentPeriodStart: new Date(subData2.current_period_start * 1000),
            currentPeriodEnd: new Date(subData2.current_period_end * 1000),
            cancelAtPeriodEnd: subData2.cancel_at_period_end,
          },
        });

        // If subscription canceled/expired, suspend tenant
        if (subData2.status === "canceled" || subData2.status === "unpaid") {
          await prisma.tenant.update({ where: { id: tenant.id }, data: { active: false } });
        }
        // If reactivated
        if (subData2.status === "active") {
          await prisma.tenant.update({ where: { id: tenant.id }, data: { active: true } });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const customerId = sub.customer as string;
      const tenant = await prisma.tenant.findFirst({ where: { stripeCustomerId: customerId } });
      if (tenant) {
        await prisma.tenant.update({ where: { id: tenant.id }, data: { active: false } });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;
      console.warn(`Payment failed for customer ${customerId}`);
      // Could send notification email here in the future
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}