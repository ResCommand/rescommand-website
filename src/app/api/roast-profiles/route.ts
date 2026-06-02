import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/roast-profiles
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await prisma.roastProfile.findMany({
    orderBy: { name: "asc" },
    include: {
      greenCoffee: { select: { id: true, name: true, origin: true } },
      _count: { select: { roastLogs: true } },
    },
  });
  return NextResponse.json(profiles);
}

// POST
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, greenCoffeeId, targetWeightKg, chargeTemp, turnAroundPoint, firstCrack, developmentTime, dropTemp, totalDuration, roastLevel, notes } = body;
  if (!name || !greenCoffeeId) return NextResponse.json({ error: "Name and green coffee required" }, { status: 400 });

  const profile = await prisma.roastProfile.create({
    data: {
      name, greenCoffeeId: parseInt(greenCoffeeId),
      targetWeightKg: parseFloat(targetWeightKg) || 10,
      chargeTemp: chargeTemp ? parseFloat(chargeTemp) : null,
      turnAroundPoint: turnAroundPoint ? parseFloat(turnAroundPoint) : null,
      firstCrack: firstCrack ? parseFloat(firstCrack) : null,
      developmentTime: developmentTime ? parseFloat(developmentTime) : null,
      dropTemp: dropTemp ? parseFloat(dropTemp) : null,
      totalDuration: totalDuration ? parseFloat(totalDuration) : null,
      roastLevel: roastLevel || "MEDIUM",
      notes: notes || null,
    },
    include: { greenCoffee: { select: { name: true } } },
  });
  return NextResponse.json(profile, { status: 201 });
}

// PUT
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updateData: Record<string, unknown> = { ...data };
  if (data.greenCoffeeId) updateData.greenCoffeeId = parseInt(data.greenCoffeeId);
  const numFields = ["targetWeightKg", "chargeTemp", "turnAroundPoint", "firstCrack", "developmentTime", "dropTemp", "totalDuration"];
  for (const f of numFields) { if (data[f] !== undefined) updateData[f] = data[f] ? parseFloat(data[f]) : null; }

  const profile = await prisma.roastProfile.update({ where: { id }, data: updateData });
  return NextResponse.json(profile);
}

// DELETE
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.roastProfile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}