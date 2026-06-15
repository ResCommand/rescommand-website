import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

const drinkSchema = z.object({
  drinkType: z.string().min(1),
  size: z.string().optional(),
  milkType: z.string().optional(),
  espressoShots: z.number().min(0).default(0),
  dialSetting: z.string().optional(),
  waste: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();

  const body = await request.json();
  const parsed = drinkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });const log = await prisma.drinkLog.create({
    data: { tenantId, userId, ...parsed.data },
  });

  return NextResponse.json(log, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const where: Record<string, unknown> = {};

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.createdAt = { gte: start, lte: end };
  }

  const logs = await prisma.drinkLog.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(logs);
}