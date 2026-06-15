import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/roast-logs
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const [logs, total] = await Promise.all([
    prisma.roastLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { date: "desc" },
      include: {
        greenCoffee: { select: { id: true, name: true, origin: true } },
        profile: { select: { id: true, name: true } },
        performer: { select: { id: true, name: true } },
      },
    }),
    prisma.roastLog.count(),
  ]);

  return NextResponse.json({ logs, total });
}

// POST — create roast log
export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();

  const body = await request.json();
  const { date, greenCoffeeId, profileId, greenWeightKg, roastedWeightKg, roastLevel, chargeTemp, firstCrackTime, dropTemp, totalDuration, notes, batchNumber } = body;

  if (!greenCoffeeId || !greenWeightKg || !roastedWeightKg)
    return NextResponse.json({ error: "Green coffee, input weight, and output weight required" }, { status: 400 });

  const lossPercent = ((parseFloat(greenWeightKg) - parseFloat(roastedWeightKg)) / parseFloat(greenWeightKg) * 100);// Deduct green coffee stock
  await prisma.greenCoffee.update({
    where: { tenantId, id: parseInt(greenCoffeeId) },
    data: { stockKg: { decrement: parseFloat(greenWeightKg) } },
  });

  const log = await prisma.roastLog.create({
    data: { tenantId,
      date: date ? new Date(date) : new Date(),
      greenCoffeeId: parseInt(greenCoffeeId),
      profileId: profileId ? parseInt(profileId) : null,
      greenWeightKg: parseFloat(greenWeightKg),
      roastedWeightKg: parseFloat(roastedWeightKg),
      roastLevel: roastLevel || "MEDIUM",
      chargeTemp: chargeTemp ? parseFloat(chargeTemp) : null,
      firstCrackTime: firstCrackTime ? parseFloat(firstCrackTime) : null,
      dropTemp: dropTemp ? parseFloat(dropTemp) : null,
      totalDuration: totalDuration ? parseFloat(totalDuration) : null,
      notes: notes || null,
      lossPercent: Math.round(lossPercent * 10) / 10,
      batchNumber: batchNumber || null,
      performedBy: userId,
    },
    include: {
      greenCoffee: { select: { name: true } },
      profile: { select: { name: true } },
    },
  });

  return NextResponse.json(log, { status: 201 });
}

// PUT — update roast log
export async function PUT(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (data.date) updateData.date = new Date(data.date);
  if (data.greenCoffeeId) updateData.greenCoffeeId = parseInt(data.greenCoffeeId);
  if (data.profileId !== undefined) updateData.profileId = data.profileId ? parseInt(data.profileId) : null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.batchNumber !== undefined) updateData.batchNumber = data.batchNumber || null;
  if (data.roastLevel) updateData.roastLevel = data.roastLevel;
  const numFields = ["greenWeightKg", "roastedWeightKg", "chargeTemp", "firstCrackTime", "dropTemp", "totalDuration"];
  for (const f of numFields) { if (data[f] !== undefined) updateData[f] = data[f] ? parseFloat(data[f]) : null; }

  // Recalculate loss percent
  if (data.greenWeightKg && data.roastedWeightKg) {
    updateData.lossPercent = Math.round(((parseFloat(data.greenWeightKg) - parseFloat(data.roastedWeightKg)) / parseFloat(data.greenWeightKg) * 100) * 10) / 10;
  }

  const log = await prisma.roastLog.update({ where: { tenantId, id }, data: updateData });
  return NextResponse.json(log);
}

// DELETE
export async function DELETE(request: Request) {
  const { tenantId, role } = await getSessionContext();
  if (role !== "OWNER")
    return NextResponse.json({ error: "Only owners can delete roast logs" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.roastLog.delete({ where: { tenantId, id } });
  return NextResponse.json({ ok: true });
}