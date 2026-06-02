import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/schedule-templates/copy-week
// Body: { sourceWeek: "2026-06-01", targetWeek: "2026-06-08" }
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { sourceWeek, targetWeek } = await request.json();
  if (!sourceWeek || !targetWeek)
    return NextResponse.json({ error: "sourceWeek and targetWeek required" }, { status: 400 });

  const srcMonday = new Date(sourceWeek + "T00:00:00");
  const tgtMonday = new Date(targetWeek + "T00:00:00");
  const creatorId = parseInt((session.user as { id?: string }).id || "0");

  // Fetch source week shifts
  const srcSunday = new Date(tgtMonday);
  srcSunday.setDate(srcSunday.getDate() + 7);

  const sourceShifts = await prisma.shift.findMany({
    where: {
      date: { gte: srcMonday, lt: new Date(srcMonday.getTime() + 7 * 86400000) },
    },
  });

  if (sourceShifts.length === 0)
    return NextResponse.json({ error: "No shifts found in source week" }, { status: 400 });

  // Calculate day offset
  const offsetMs = tgtMonday.getTime() - srcMonday.getTime();

  let created = 0;
  const notified = new Set<number>();

  for (const s of sourceShifts) {
    const newDate = new Date(s.date.getTime() + offsetMs);

    // Skip if shift already exists for this user on the target date
    const exists = await prisma.shift.findFirst({
      where: { userId: s.userId, date: newDate, startTime: s.startTime, endTime: s.endTime },
    });
    if (exists) continue;

    await prisma.shift.create({
      data: {
        userId: s.userId,
        date: newDate,
        startTime: s.startTime,
        endTime: s.endTime,
        position: s.position,
        notes: s.notes,
        published: false, // draft so manager can review before publishing
      },
    });
    created++;
    notified.add(s.userId);
  }

  // Send one notification per user
  for (const userId of notified) {
    await prisma.notification.create({
      data: {
        title: "Schedule Copied",
        message: `Shifts have been drafted for the week of ${tgtMonday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}. You'll be notified when they're published.`,
        priority: "NORMAL",
        sentBy: creatorId,
        recipients: { create: [{ userId }] },
      },
    });
  }

  return NextResponse.json({ created, notified: notified.size });
}