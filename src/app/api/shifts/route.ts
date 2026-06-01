import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/shifts?week=YYYY-MM-DD — shifts for a week
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const role = (session.user as { role?: string })?.role;
  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get("week"); // Monday YYYY-MM-DD

  let startDate: Date, endDate: Date;
  if (weekStart) {
    startDate = new Date(weekStart + "T00:00:00");
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
  } else {
    // Default to current week
    const now = new Date();
    const day = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
  }

  // Employees see only their own shifts; managers see all
  const where: Record<string, unknown> = {
    date: { gte: startDate, lt: endDate },
  };
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
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { userId: shiftUserId, date, startTime, endTime, position, notes, published, days } = body;

  if (!shiftUserId || !date || !startTime || !endTime)
    return NextResponse.json({ error: "userId, date, startTime, endTime required" }, { status: 400 });

  const creatorId = parseInt((session.user as { id?: string }).id || "0");

  // Support multi-day creation
  const datesToCreate = days ? days : [date];
  const shifts = [];

  for (const d of datesToCreate) {
    const shift = await prisma.shift.create({
      data: {
        userId: shiftUserId,
        date: new Date(d + "T00:00:00"),
        startTime,
        endTime,
        position: position || "GENERAL",
        notes: notes || null,
        published: published || false,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    shifts.push(shift);
  }

  // If published, notify the employee
  if (published) {
    for (const s of shifts) {
      await prisma.notification.create({
        data: {
          title: "New Shift Scheduled",
          message: `You've been scheduled for ${new Date(s.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}, ${s.startTime}–${s.endTime}${s.position !== "GENERAL" ? ` (${s.position})` : ""}.`,
          priority: "NORMAL",
          sentBy: creatorId,
          recipients: { create: [{ userId: shiftUserId,  }] },
        },
      });
    }
  }

  return NextResponse.json(shifts, { status: 201 });
}

// PUT /api/shifts — update shift
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const creatorId = parseInt((session.user as { id?: string }).id || "0");
  const oldShift = await prisma.shift.findUnique({ where: { id } });
  const wasPublished = oldShift?.published || false;

  const shift = await prisma.shift.update({
    where: { id },
    data,
    include: { user: { select: { id: true, name: true } } },
  });

  // If newly published or was published and details changed, notify
  if ((data.published && !wasPublished) || (wasPublished && (data.startTime || data.endTime || data.date))) {
    await prisma.notification.create({
      data: {
        title: wasPublished ? "Shift Updated" : "Schedule Published",
        message: `Your shift on ${new Date(shift.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} has been updated: ${shift.startTime}–${shift.endTime}${shift.position !== "GENERAL" ? ` (${shift.position})` : ""}.`,
        priority: "NORMAL",
        sentBy: creatorId,
        recipients: { create: [{ userId: shift.userId,  }] },
      },
    });
  }

  return NextResponse.json(shift);
}

// DELETE /api/shifts?id=X
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const creatorId = parseInt((session.user as { id?: string }).id || "0");
  const shift = await prisma.shift.findUnique({ where: { id } });

  if (shift?.published) {
    await prisma.notification.create({
      data: {
        title: "Shift Cancelled",
        message: `Your shift on ${new Date(shift.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}, ${shift.startTime}–${shift.endTime} has been cancelled.`,
        priority: "HIGH",
        sentBy: creatorId,
        recipients: { create: [{ userId: shift.userId,  }] },
      },
    });
  }

  await prisma.shift.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH /api/shifts — publish all unpublished shifts for a week
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { weekStart: ws } = body;
  if (!ws) return NextResponse.json({ error: "weekStart required" }, { status: 400 });

  const startDate = new Date(ws + "T00:00:00");
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const creatorId = parseInt((session.user as { id?: string }).id || "0");

  // Get all unpublished shifts for this week
  const unpublished = await prisma.shift.findMany({
    where: { date: { gte: startDate, lt: endDate }, published: false },
    include: { user: { select: { id: true, name: true } } },
  });

  if (unpublished.length === 0)
    return NextResponse.json({ published: 0 });

  // Publish them all
  await prisma.shift.updateMany({
    where: { date: { gte: startDate, lt: endDate }, published: false },
    data: { published: true },
  });

  // Notify each affected employee
  const byUser = new Map<number, typeof unpublished>();
  for (const s of unpublished) {
    if (!byUser.has(s.userId)) byUser.set(s.userId, []);
    byUser.get(s.userId)!.push(s);
  }

  for (const [userId, shifts] of byUser) {
    const shiftList = shifts.map(s =>
      `${new Date(s.date).toLocaleDateString("en-US", { weekday: "short" })} ${s.startTime}–${s.endTime}`
    ).join(", ");

    await prisma.notification.create({
      data: {
        title: "New Schedule Published",
        message: `You have ${shifts.length} new shift${shifts.length > 1 ? "s" : ""}: ${shiftList}`,
        priority: "NORMAL",
        sentBy: creatorId,
        recipients: { create: [{ userId,  }] },
      },
    });
  }

  return NextResponse.json({ published: unpublished.length });
}