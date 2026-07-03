import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

// GET — return all sandwich types with their schedules and recipes
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const types = await prisma.sandwichType.findMany({
    where: { tenantId, active: true },
    orderBy: { sortOrder: "asc" },
    include: {
      schedule: { where: { tenantId } },
      recipes: { where: { tenantId } },
    },
  });

  return NextResponse.json(types);
}

// POST — create a new sandwich type
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();
  const body = await request.json();

  const { name, category } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const maxSort = await prisma.sandwichType.findFirst({
    where: { tenantId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const type = await prisma.sandwichType.create({
    data: {
      name: name.trim(),
      category: category || "sandwich",
      sortOrder: (maxSort?.sortOrder || 0) + 1,
      tenantId,
    },
  });

  return NextResponse.json(type, { status: 201 });
}

// PUT — update a sandwich type (name, category, schedule quantities, recipes)
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();
  const body = await request.json();
  const { id, name, category, schedules, recipes } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Update name/category if provided
  if (name !== undefined || category !== undefined) {
    await prisma.sandwichType.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(category !== undefined ? { category } : {}),
      },
    });
  }

  // Update schedule quantities: [{ dayOfWeek, quantity }]
  if (Array.isArray(schedules)) {
    for (const s of schedules) {
      const existing = await prisma.sandwichSchedule.findFirst({
        where: { sandwichTypeId: Number(id), dayOfWeek: s.dayOfWeek, tenantId },
      });
      if (existing) {
        await prisma.sandwichSchedule.update({
          where: { id: existing.id },
          data: { quantity: s.quantity },
        });
      } else {
        await prisma.sandwichSchedule.create({
          data: {
            sandwichTypeId: Number(id),
            dayOfWeek: s.dayOfWeek,
            quantity: s.quantity,
            tenantId,
          },
        });
      }
    }
  }

  // Update recipes: [{ ingredientName, quantityPerUnit, unit }]
  if (Array.isArray(recipes)) {
    await prisma.sandwichRecipe.deleteMany({
      where: { sandwichTypeId: Number(id), tenantId },
    });
    for (const r of recipes) {
      await prisma.sandwichRecipe.create({
        data: {
          sandwichTypeId: Number(id),
          ingredientName: r.ingredientName,
          quantityPerUnit: r.quantityPerUnit,
          unit: r.unit || "each",
          tenantId,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

// DELETE — soft-delete a sandwich type
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.sandwichType.update({
    where: { id: Number(id) },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
