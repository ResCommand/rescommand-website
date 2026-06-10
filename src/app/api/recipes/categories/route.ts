import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const categories = await prisma.recipeCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { recipes: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { name, icon, color } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const maxOrder = await prisma.recipeCategory.aggregate({ _max: { sortOrder: true } });

  const category = await prisma.recipeCategory.create({
    data: { tenantId,
      name: name.trim(), slug, icon: icon || "📋",
      color: color || "#F9FAFB", sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
  return NextResponse.json(category);
}

export async function PUT(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { id, name, icon, color } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const category = await prisma.recipeCategory.update({
    where: { tenantId, id },
    data: { ...(name && { name: name.trim() }), ...(icon && { icon }), ...(color && { color }) },
  });
  return NextResponse.json(category);
}

export async function DELETE(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const count = await prisma.recipe.count({ where: { tenantId, categoryId: id } });
  if (count > 0) return NextResponse.json({ error: "Cannot delete category with recipes. Move recipes first." }, { status: 400 });

  await prisma.recipeCategory.delete({ where: { tenantId, id } });
  return NextResponse.json({ success: true });
}