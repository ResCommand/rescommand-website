import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const role = (session.user as { role?: string })?.role;

  // Employees see their own, managers/owners see all
  const where = role === "EMPLOYEE" ? { userId } : {};
  const blocks = await prisma.availabilityBlock.findMany({
    where,
    include: { user: { select: { id: true, name: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(blocks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const body = await request.json();
  const { dayOfWeek, startTime, endTime, reason } = body;

  if (dayOfWeek === undefined || dayOfWeek < -1 || dayOfWeek > 6)
    return NextResponse.json({ error: "Invalid day of week" }, { status: 400 });

  const block = await prisma.availabilityBlock.create({
    data: { userId, dayOfWeek, startTime: startTime || null, endTime: endTime || null, reason: reason || null },
  });
  return NextResponse.json(block, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const role = (session.user as { role?: string })?.role;
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  // Employees can only delete their own
  const where: { id: number; userId?: number } = { id };
  if (role === "EMPLOYEE") where.userId = userId;

  await prisma.availabilityBlock.deleteMany({ where });
  return NextResponse.json({ ok: true });
}