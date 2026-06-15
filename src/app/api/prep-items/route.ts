import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const items = await prisma.prepItem.findMany({
    where: { tenantId, active: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { name, category, categoryColor, amount, shelfLifeHours } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const maxOrder = await prisma.prepItem.aggregate({ _max: { sortOrder: true } });

  const item = await prisma.prepItem.create({
    data: { tenantId,
      name: name.trim(),
      category: category || "General",
      categoryColor: categoryColor || "#F3F4F6",
      amount: amount || "",
      shelfLifeHours: shelfLifeHours || 0,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
  return NextResponse.json(item);
}

export async function PUT(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { id, name, category, categoryColor, amount, shelfLifeHours } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const item = await prisma.prepItem.update({
    where: { tenantId, id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category }),
      ...(categoryColor !== undefined && { categoryColor }),
      ...(amount !== undefined && { amount }),
      ...(shelfLifeHours !== undefined && { shelfLifeHours }),
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.prepItem.update({ where: { tenantId, id }, data: { active: false } });
  return NextResponse.json({ success: true });
}