import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

const donutLogSchema = z.object({
  productId: z.number().optional().nullable(),
  made: z.number().min(0).default(0),
  sold: z.number().min(0).default(0),
  wasted: z.number().min(0).default(0),
  period: z.enum(["AM", "PM"]).default("AM"),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();

  const body = await request.json();
  const parsed = donutLogSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });const log = await prisma.donutLog.create({
    data: { tenantId, userId, ...parsed.data },
  });

  return NextResponse.json(log, { status: 201 });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
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

  const logs = await prisma.donutLog.findMany({
    where,
    include: { product: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(logs);
}