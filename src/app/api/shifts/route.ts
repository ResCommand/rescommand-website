import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/shifts?week=YYYY-MM-DD — shifts for a week
export async function GET(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get("week");

  let startDate: Date, endDate: Date;
  if (weekStart) {
    startDate = new Date(weekStart + "T00:00:00");
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
  } else {
    const now = new Date();
    const day = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
  }

  const where: Record<string, unknown> = { tenantId, date: { gte: startDate, lt: endDate } };
  if (role === "EMPLOYEE") where.userId = userId;

  const shifts = await prisma.shift.findMany({
    where,
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ shifts, weekStart: startDate.toISOString().split("T")[0] });
}

// POST /api/shifts — create shift(s)
export async function POST(request: Request) {
  const { userId: creatorId, tenantId } = await getSessionContext();

  const body = await request.json();
  const { userId: shiftUserId, date, startTime, endTime, position, notes, published, days } = body;

  if (!shiftUserId || !date || !startTime || !endTime)
    return NextResponse.json({ error: "userId, date, startTime, endTime required" }, { status: 400 });

  const datesToCreate = days ? days : [date];
  const shifts = [];

  for (const d of datesToCreate) {
    const shift = await prisma.shift.create({
      data: { tenantId, userId: shiftUserId, date: new Date(d + "T00:00:00"), startTime, endTime, position: position || "GENERAL", notes: notes || null, published: published || false },
      include: { user: { select: { id: true, name: true } } },
    });
    shifts.push(shift);
  }

  if (published) {
    for (const s of shifts) {
      await prisma.notification.create({
        data: { tenantId, title: "New Shift Scheduled", message: `You've been scheduled for ${new Date(s.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}, ${s.startTime}–${s.endTime}${s.position !== "GENERAL" ? ` (${s.position})` : ""}.`, priority: "NORMAL", sentBy: creatorId, recipients: { create: [{ userId: shiftUserId }] } },
      });
    }
  }

  return NextResponse.json(shifts, { status: 201 });
}

// PUT /api/shifts — update shift
export async function PUT(request: Request) {
  const { userId: creatorId, tenantId } = await getSessionContext();

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const oldShift = await prisma.shift.findUnique({ where: { id } });
  const wasPublished = oldShift?.published || false;

  const shift = await prisma.shift.update({ where: { id }, data, include: { user: { select: { id: true, name: true } } } });

  if ((data.published && !wasPublished) || (wasPublished && (data.startTime || data.endTime || data.date))) {
    await prisma.notification.create({
      data: { tenantId, title: wasPublished ? "Shift Updated" : "Schedule Published", message: `Your shift on ${new Date(shift.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} has been updated: ${shift.startTime}–${shift.endTime}${shift.position !== "GENERAL" ? ` (${shift.position})` : ""}.`, priority: "NORMAL", sentBy: creatorId, recipients: { create: [{ userId: shift.userId }] } },
    });
  }

  return NextResponse.json(shift);
}

// DELETE /api/shifts?id=X
export async function DELETE(request: Request) {
  const { userId: creatorId, tenantId } = await getSessionContext();

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const shift = await prisma.shift.findUnique({ where: { id } });

  if (shift?.published) {
    await prisma.notification.create({
      data: { tenantId, title: "Shift Cancelled", message: `Your shift on ${new Date(shift.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}, ${shift.startTime}–${shift.endTime} has been cancelled.`, priority: "HIGH", sentBy: creatorId, recipients: { create: [{ userId: shift.userId }] } },
    });
  }

  await prisma.shift.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH /api/shifts — publish all unpublished shifts for a week
export async function PATCH(request: Request) {
  const { userId: creatorId, tenantId } = await getSessionContext();

  const body = await request.json();
  const { weekStart: ws } = body;
  if (!ws) return NextResponse.json({ error: "weekStart required" }, { status: 400 });

  const startDate = new Date(ws + "T00:00:00");
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const unpublished = await prisma.shift.findMany({
    where: { tenantId, date: { gte: startDate, lt: endDate }, published: false },
    include: { user: { select: { id: true, name: true } } },
  });

  if (unpublished.length === 0) return NextResponse.json({ published: 0 });

  await prisma.shift.updateMany({
    where: { tenantId, date: { gte: startDate, lt: endDate }, published: false },
    data: { published: true },
  });

  const byUser = new Map<number, typeof unpublished>();
  for (const s of unpublished) {
    if (!byUser.has(s.userId)) byUser.set(s.userId, []);
    byUser.get(s.userId)!.push(s);
  }

  for (const [uid, userShifts] of byUser) {
    const shiftList = userShifts.map(s => `${new Date(s.date).toLocaleDateString("en-US", { weekday: "short" })} ${s.startTime}–${s.endTime}`).join(", ");
    await prisma.notification.create({
      data: { tenantId, title: "New Schedule Published", message: `You have ${userShifts.length} new shift${userShifts.length > 1 ? "s" : ""}: ${shiftList}`, priority: "NORMAL", sentBy: creatorId, recipients: { create: [{ userId: uid }] } },
    });
  }

  return NextResponse.json({ published: unpublished.length });
}