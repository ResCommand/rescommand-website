import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/green-coffee
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const coffees = await prisma.greenCoffee.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { roastLogs: true, roastProfiles: true } } },
  });
  return NextResponse.json(coffees);
}

// POST /api/green-coffee
export async function POST(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { name, origin, farm, process, variety, elevation, grade, density, moisture, bagWeightKg, stockKg, costPerKg, notes } = body;
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const coffee = await prisma.greenCoffee.create({
    data: { tenantId,
      name, origin: origin || null, farm: farm || null, process: process || null,
      variety: variety || null, elevation: elevation || null, grade: grade || null,
      density: density || null, moisture: moisture || null,
      bagWeightKg: parseFloat(bagWeightKg) || 60, stockKg: parseFloat(stockKg) || 0,
      costPerKg: costPerKg ? parseFloat(costPerKg) : null, notes: notes || null,
    },
  });
  return NextResponse.json(coffee, { status: 201 });
}

// PUT /api/green-coffee
export async function PUT(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  const fields = ["name", "origin", "farm", "process", "variety", "elevation", "grade", "density", "notes"];
  for (const f of fields) { if (data[f] !== undefined) updateData[f] = data[f] || null; }
  if (data.moisture !== undefined) updateData.moisture = parseFloat(data.moisture) || null;
  if (data.bagWeightKg !== undefined) updateData.bagWeightKg = parseFloat(data.bagWeightKg) || 60;
  if (data.stockKg !== undefined) updateData.stockKg = parseFloat(data.stockKg) || 0;
  if (data.costPerKg !== undefined) updateData.costPerKg = data.costPerKg ? parseFloat(data.costPerKg) : null;

  const coffee = await prisma.greenCoffee.update({ where: { tenantId, id }, data: updateData });
  return NextResponse.json(coffee);
}

// DELETE
export async function DELETE(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.greenCoffee.update({ where: { tenantId, id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}