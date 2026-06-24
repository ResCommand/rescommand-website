import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const userId = Number((session.user as { id?: string }).id);
  const role = (session.user as { role?: string }).role;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (role === "OWNER" || role === "MANAGER" || role === "PLATFORM_ADMIN") {
    // Get all employee hours
    const hours = await prisma.employeeHour.findMany({
      where: { tenantId, date: { gte: today } },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { clockIn: "desc" },
    });
    return NextResponse.json(hours);
  }

  // Employee sees own hours
  const hours = await prisma.employeeHour.findMany({
    where: { tenantId, userId, date: { gte: new Date(today.getTime() - 7 * 86400000) } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(hours);
}

export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();const { action } = await request.json(); // "clock_in" or "clock_out"

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (action === "clock_in") {
    const existing = await prisma.employeeHour.findFirst({
      where: { tenantId, userId, clockOut: null },
    });
    if (existing) return NextResponse.json({ error: "Already clocked in" }, { status: 400 });

    const hour = await prisma.employeeHour.create({
      data: { tenantId, userId, clockIn: now, date: today },
    });
    return NextResponse.json(hour, { status: 201 });
  }

  if (action === "clock_out") {
    const active = await prisma.employeeHour.findFirst({
      where: { tenantId, userId, clockOut: null },
      orderBy: { clockIn: "desc" },
    });
    if (!active) return NextResponse.json({ error: "Not clocked in" }, { status: 400 });

    const totalHours = (now.getTime() - active.clockIn.getTime()) / (1000 * 60 * 60);
    const hour = await prisma.employeeHour.update({
      where: { tenantId, id: active.id },
      data: { clockOut: now, totalHours: Math.round(totalHours * 100) / 100 },
    });
    return NextResponse.json(hour);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}