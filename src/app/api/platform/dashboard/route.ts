import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.isPlatformAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [tenants, planPricings] = await Promise.all([
    prisma.tenant.findMany({
      include: {
        _count: { select: { members: true } },
        subscription: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.planPricing.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const activeTenants = tenants.filter(t => t.active);
  const planPriceMap: Record<string, number> = {};
  for (const p of planPricings) planPriceMap[p.planKey] = p.price;

  const totalMRR = activeTenants.reduce((sum, t) => sum + (planPriceMap[t.plan] || 0), 0) / 100;
  const totalMembers = activeTenants.reduce((sum, t) => sum + (t._count?.members || 0), 0);

  // Plan distribution
  const planDist: Record<string, number> = {};
  for (const t of tenants) {
    planDist[t.plan] = (planDist[t.plan] || 0) + 1;
  }

  // Recent signups (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSignups = tenants.filter(t => new Date(t.createdAt) >= thirtyDaysAgo).length;

  // Trial tenants
  const trialTenants = tenants.filter(t => t.trialEndsAt && new Date(t.trialEndsAt) > new Date()).length;

  return NextResponse.json({
    totalTenants: tenants.length,
    activeTenants: activeTenants.length,
    suspendedTenants: tenants.filter(t => !t.active).length,
    totalMRR,
    totalARR: totalMRR * 12,
    totalMembers,
    recentSignups,
    trialTenants,
    planDistribution: planDist,
    tenants: tenants.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      domain: t.domain,
      businessType: t.businessType,
      plan: t.plan,
      active: t.active,
      stripeCustomerId: t.stripeCustomerId,
      trialEndsAt: t.trialEndsAt,
      createdAt: t.createdAt,
      members: t._count?.members || 0,
      subscriptionStatus: t.subscription?.status || null,
    })),
    plans: planPricings,
  });
}