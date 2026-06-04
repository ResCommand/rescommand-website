import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const plans = await prisma.planPricing.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(plans);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.isPlatformAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { plans } = body as { plans: Array<{
    planKey: string; name: string; price: number;
    staffLimit: number | null; features: string[]; active: boolean;
  }> };

  const results = [];
  for (const plan of plans) {
    const updated = await prisma.planPricing.upsert({
      where: { planKey: plan.planKey },
      update: {
        name: plan.name,
        price: plan.price,
        staffLimit: plan.staffLimit,
        features: plan.features ? JSON.stringify(plan.features) : undefined,
        active: plan.active,
      },
      create: {
        planKey: plan.planKey,
        name: plan.name,
        price: plan.price,
        staffLimit: plan.staffLimit,
        features: plan.features ? JSON.stringify(plan.features) : undefined,
        active: plan.active,
      },
    });
    results.push(updated);
  }

  return NextResponse.json(results);
}