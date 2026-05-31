import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/batch-completions?date=YYYY-MM-DD
// Returns all completed batch indices for a given date
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  if (!dateParam) return NextResponse.json({ error: "date query param required" }, { status: 400 });

  const targetDate = new Date(dateParam + "T00:00:00");
  if (isNaN(targetDate.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  const completions = await prisma.batchCompletion.findMany({
    where: { date: targetDate },
    orderBy: { batchIndex: "asc" },
  });

  return NextResponse.json({
    completions: completions.map(c => ({
      id: c.id,
      batchIndex: c.batchIndex,
      mixerType: c.mixerType,
      completedBy: c.completedBy,
      createdAt: c.createdAt,
    })),
  });
}

// POST /api/batch-completions
// Toggle a batch completion on or off for a given date + batchIndex
// Body: { date: "YYYY-MM-DD", batchIndex: number, mixerType: "Large"|"Small", completed: boolean }
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string })?.id || "0") || null;
  const body = await request.json();
  const { date, batchIndex, mixerType, completed } = body;

  if (!date || typeof batchIndex !== "number" || !mixerType) {
    return NextResponse.json({ error: "date, batchIndex, and mixerType required" }, { status: 400 });
  }

  if (mixerType !== "Large" && mixerType !== "Small") {
    return NextResponse.json({ error: "mixerType must be 'Large' or 'Small'" }, { status: 400 });
  }

  if (batchIndex < 0 || batchIndex > 50) {
    return NextResponse.json({ error: "batchIndex out of range" }, { status: 400 });
  }

  const targetDate = new Date(date + "T00:00:00");
  if (isNaN(targetDate.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  if (completed) {
    // Create completion record (upsert to handle race conditions)
    await prisma.batchCompletion.upsert({
      where: { date_batchIndex: { date: targetDate, batchIndex } },
      update: { mixerType, completedBy: userId ?? null },
      create: { date: targetDate, batchIndex, mixerType, completedBy: userId ?? null },
    });
  } else {
    // Remove completion record
    await prisma.batchCompletion.deleteMany({
      where: { date: targetDate, batchIndex },
    });
  }

  return NextResponse.json({ success: true });
}