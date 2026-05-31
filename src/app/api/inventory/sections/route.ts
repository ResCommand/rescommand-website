import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sections = await prisma.inventorySection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, icon } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const maxOrder = await prisma.inventorySection.aggregate({ _max: { sortOrder: true } });

  const section = await prisma.inventorySection.create({
    data: { name: name.trim(), slug, icon: icon || "📦", sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 },
  });
  return NextResponse.json(section);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, name, icon } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const section = await prisma.inventorySection.update({
    where: { id },
    data: { ...(name && { name: name.trim() }), ...(icon && { icon }) },
  });
  return NextResponse.json(section);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const count = await prisma.inventoryItem.count({ where: { inventorySectionId: id } });
  if (count > 0) return NextResponse.json({ error: "Cannot delete section with items. Move items first." }, { status: 400 });

  await prisma.inventorySection.delete({ where: { id } });
  return NextResponse.json({ success: true });
}