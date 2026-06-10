import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  // Get last 30 days of dial logs
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logs = await prisma.espressoDialLog.findMany({
    where: { tenantId, date: { gte: thirtyDaysAgo } },
    include: { user: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

const dialSchema = z.object({
  groundsWeight: z.coerce.number().nullable().optional(),
  grinderCoarseness: z.string().nullable().optional(),
  dispenseTime: z.coerce.number().nullable().optional(),
  pullTime: z.coerce.number().nullable().optional(),
  shotWeight: z.coerce.number().nullable().optional(),
  decafGroundsWeight: z.coerce.number().nullable().optional(),
  decafGrinderCoarseness: z.string().nullable().optional(),
  decafDispenseTime: z.coerce.number().nullable().optional(),
  decafPullTime: z.coerce.number().nullable().optional(),
  decafShotWeight: z.coerce.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const { userId, tenantId } = await getSessionContext();

  const body = await req.json();
  const parsed = dialSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });const log = await prisma.espressoDialLog.create({
    data: { tenantId, ...parsed.data, userId },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(log, { status: 201 });
}