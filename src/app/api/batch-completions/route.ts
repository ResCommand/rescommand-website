import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/batch-completions?date=YYYY-MM-DD
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  if (!dateParam) return NextResponse.json({ error: "date query param required" }, { status: 400 });

  const targetDate = new Date(dateParam + "T00:00:00");
  if (isNaN(targetDate.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  const completions = await prisma.batchCompletion.findMany({
    where: { tenantId, date: targetDate },
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
export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();
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
    await prisma.batchCompletion.upsert({
      where: { tenantId_date_batchIndex: { tenantId, date: targetDate, batchIndex } },
      update: { mixerType, completedBy: userId ?? null },
      create: { tenantId, date: targetDate, batchIndex, mixerType, completedBy: userId ?? null },
    });
  } else {
    await prisma.batchCompletion.deleteMany({
      where: { tenantId, date: targetDate, batchIndex },
    });
  }

  return NextResponse.json({ success: true });
}