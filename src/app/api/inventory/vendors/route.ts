import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

const vendorSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().nullable(),
  mainUse: z.string().optional().nullable(),
  cadence: z.string().optional().nullable(),
  contactInfo: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const vendors = await prisma.vendor.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { inventoryItems: { where: { active: true, tenantId } } } },
    },
  });

  return NextResponse.json(vendors);
}

export async function POST(request: Request) {
  const { tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER" && role !== "PLATFORM_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = vendorSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const vendor = await prisma.vendor.create({
    data: { ...parsed.data, tenantId },
  });

  return NextResponse.json(vendor, { status: 201 });
}

export async function PUT(request: Request) {
  const { tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER" && role !== "PLATFORM_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.vendor.findFirst({ where: { id, tenantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = vendorSchema.partial().safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const vendor = await prisma.vendor.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(vendor);
}

export async function DELETE(request: Request) {
  const { tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER" && role !== "PLATFORM_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.vendor.findFirst({ where: { id, tenantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check for active items assigned to this vendor
  const itemCount = await prisma.inventoryItem.count({
    where: { vendorId: id, active: true, tenantId },
  });
  if (itemCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete vendor with ${itemCount} active item(s). Reassign items first.` },
      { status: 409 },
    );
  }

  // Soft-delete
  await prisma.vendor.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
