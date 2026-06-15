import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

export async function GET() {
  const { userId, tenantId, role } = await getSessionContext();

  // Employees see their own, managers/owners see all
  const where: Record<string, unknown> = { tenantId };
  if (role === "EMPLOYEE") where.userId = userId;
  const blocks = await prisma.availabilityBlock.findMany({
    where,
    include: { user: { select: { id: true, name: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(blocks);
}

export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();
  const body = await request.json();
  const { dayOfWeek, startTime, endTime, reason } = body;

  if (dayOfWeek === undefined || dayOfWeek < -1 || dayOfWeek > 6)
    return NextResponse.json({ error: "Invalid day of week" }, { status: 400 });

  const block = await prisma.availabilityBlock.create({
    data: { tenantId, userId, dayOfWeek, startTime: startTime || null, endTime: endTime || null, reason: reason || null },
  });
  return NextResponse.json(block, { status: 201 });
}

export async function DELETE(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const where: Record<string, unknown> = { tenantId, id };
  if (role === "EMPLOYEE") where.userId = userId;

  await prisma.availabilityBlock.deleteMany({ where });
  return NextResponse.json({ ok: true });
}