import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const categories = await prisma.employeeCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { members: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { name, color } = body;
  if (!name || !name.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const maxOrder = await prisma.employeeCategory.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  const category = await prisma.employeeCategory.create({
    data: { tenantId,
      name: name.trim(),
      color: color || "#3B82F6",
      sortOrder,
    },
  });
  return NextResponse.json(category);
}

export async function PUT(request: NextRequest) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { id, name, color } = body;
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const category = await prisma.employeeCategory.update({
    where: { tenantId, id },
    data: {
      ...(name && { name: name.trim() }),
      ...(color && { color }),
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(request: NextRequest) {
  const { tenantId, role } = await getSessionContext();

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const usersInCategory = await prisma.user.count({ where: { categoryId: id } });
  if (usersInCategory > 0)
    return NextResponse.json({ error: "Cannot delete category with assigned employees" }, { status: 400 });

  await prisma.employeeCategory.delete({ where: { tenantId, id } });
  return NextResponse.json({ success: true });
}