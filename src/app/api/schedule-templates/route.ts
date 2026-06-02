import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/schedule-templates
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.scheduleTemplate.findMany({
    include: {
      shifts: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
    orderBy: { isDefault: "desc" },
  });
  return NextResponse.json(templates);
}

// POST — create or update template
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, shifts } = body;

  // Upsert: if a default template exists, update it; otherwise create
  const existing = await prisma.scheduleTemplate.findFirst({ where: { isDefault: true } });

  if (existing) {
    // Delete old shifts and replace
    await prisma.templateShift.deleteMany({ where: { templateId: existing.id } });
    if (shifts?.length > 0) {
      await prisma.templateShift.createMany({
        data: shifts.map((s: { dayOfWeek: number; startTime: string; endTime: string; position: string; userId: number }) => ({
          templateId: existing.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          position: s.position || "GENERAL",
          userId: s.userId,
        })),
      });
    }
    if (name) {
      await prisma.scheduleTemplate.update({ where: { id: existing.id }, data: { name } });
    }
    const updated = await prisma.scheduleTemplate.findUnique({
      where: { id: existing.id },
      include: { shifts: { include: { user: { select: { id: true, name: true } } }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
    });
    return NextResponse.json(updated);
  }

  const template = await prisma.scheduleTemplate.create({
    data: {
      name: name || "Default Schedule",
      isDefault: true,
      shifts: {
        create: (shifts || []).map((s: { dayOfWeek: number; startTime: string; endTime: string; position: string; userId: number }) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          position: s.position || "GENERAL",
          userId: s.userId,
        })),
      },
    },
    include: { shifts: { include: { user: { select: { id: true, name: true } } } } },
  });
  return NextResponse.json(template, { status: 201 });
}

// PATCH — apply template to a specific week
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { weekStart: ws, templateId } = body;
  if (!ws) return NextResponse.json({ error: "weekStart required" }, { status: 400 });

  const monday = new Date(ws + "T00:00:00");
  const creatorId = parseInt((session.user as { id?: string }).id || "0");

  // Get template
  const template = templateId
    ? await prisma.scheduleTemplate.findUnique({ where: { id: templateId }, include: { shifts: true } })
    : await prisma.scheduleTemplate.findFirst({ where: { isDefault: true }, include: { shifts: true } });

  if (!template || template.shifts.length === 0)
    return NextResponse.json({ error: "No template found or template is empty" }, { status: 400 });

  // Create shifts for each template entry
  let created = 0;
  const notified = new Set<number>();

  for (const ts of template.shifts) {
    // Calculate the date for this dayOfWeek
    // Monday = 1, so offset = dayOfWeek - 1
    const shiftDate = new Date(monday);
    shiftDate.setDate(monday.getDate() + ((ts.dayOfWeek + 6) % 7)); // convert Sun=0 to Mon-based offset

    // Check if shift already exists for this user on this date
    const existing = await prisma.shift.findFirst({
      where: {
        userId: ts.userId,
        date: shiftDate,
        startTime: ts.startTime,
        endTime: ts.endTime,
      },
    });
    if (existing) continue;

    await prisma.shift.create({
      data: {
        userId: ts.userId,
        date: shiftDate,
        startTime: ts.startTime,
        endTime: ts.endTime,
        position: ts.position,
        published: true,
      },
    });
    created++;

    // Queue notification (once per user)
    if (!notified.has(ts.userId)) notified.add(ts.userId);
  }

  // Send one notification per user summarizing their new shifts
  for (const userId of notified) {
    const userShifts = template.shifts.filter(s => s.userId === userId);
    const summary = userShifts.map(s => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + ((s.dayOfWeek + 6) % 7));
      return `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][s.dayOfWeek]} ${s.startTime}–${s.endTime}`;
    }).join(", ");

    await prisma.notification.create({
      data: {
        title: "New Weekly Schedule",
        message: `Your schedule for the week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} has been published: ${summary}`,
        priority: "NORMAL",
        sentBy: creatorId,
        recipients: { create: [{ userId }] },
      },
    });
  }

  return NextResponse.json({ created, notified: notified.size });
}

// DELETE — clear template
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.scheduleTemplate.deleteMany({});
  return NextResponse.json({ ok: true });
}