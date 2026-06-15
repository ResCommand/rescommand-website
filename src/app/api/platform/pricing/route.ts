import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const plans = await prisma.planPricing.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(plans);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.isPlatformAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { plans } = body as { plans: Array<{
    planKey: string; name: string; price: number;
    staffLimit: number | null; features: string[]; active: boolean;
  }> };

  // Delete plans that are no longer in the submitted list
  const submittedKeys = plans.map(p => p.planKey);
  const existingPlans = await prisma.planPricing.findMany({ select: { planKey: true } });
  for (const existing of existingPlans) {
    if (!submittedKeys.includes(existing.planKey)) {
      await prisma.planPricing.delete({ where: { planKey: existing.planKey } });
    }
  }

  // Upsert all submitted plans with sortOrder
  const results = [];
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    const updated = await prisma.planPricing.upsert({
      where: { planKey: plan.planKey },
      update: {
        name: plan.name,
        price: plan.price,
        staffLimit: plan.staffLimit,
        features: plan.features ? JSON.stringify(plan.features) : undefined,
        active: plan.active,
        sortOrder: i,
      },
      create: {
        planKey: plan.planKey,
        name: plan.name,
        price: plan.price,
        staffLimit: plan.staffLimit,
        features: plan.features ? JSON.stringify(plan.features) : undefined,
        active: plan.active,
        sortOrder: i,
      },
    });
    results.push(updated);
  }

  return NextResponse.json(results);
}
