import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = (session.user as { tenantId?: string }).tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant context" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { id: parseInt(tenantId) } });
  if (!tenant?.stripeCustomerId) return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });

  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}