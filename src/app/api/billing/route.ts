import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = (session.user as { tenantId?: string }).tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant context" }, { status: 400 });

  const [tenant, subscription, plans] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: parseInt(tenantId) },
      select: {
        id: true, name: true, plan: true, active: true,
        stripeCustomerId: true, trialEndsAt: true, createdAt: true,
        _count: { select: { members: true } },
      },
    }),
    prisma.tenantSubscription.findUnique({
      where: { tenantId: parseInt(tenantId) },
    }),
    prisma.planPricing.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return NextResponse.json({ tenant, subscription, plans });
}