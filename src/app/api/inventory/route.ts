import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

const inventorySchema = z.object({
  name: z.string().min(1),
  category: z.enum(["FOH", "BOH", "BOTH"]),
  unit: z.string().min(1),
  unitCost: z.number().min(0),
  parLevel: z.number().min(0),
  currentStock: z.number().min(0),
  minStock: z.number().min(0),
  reorderQty: z.number().min(0),
  supplier: z.string().optional(),
  vendorId: z.number().optional().nullable(),
  packSize: z.string().optional().nullable(),
  suggestedCadence: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  inventorySection: z.string().optional().default("kitchen_regular"),
  inventorySectionId: z.number().optional().nullable(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const vendorId = searchParams.get("vendorId");
  const lowStock = searchParams.get("lowStock");

  const where: Record<string, unknown> = { tenantId, active: true };
  if (category) where.category = category;
  if (vendorId) where.vendorId = Number(vendorId);
  if (lowStock === "true") where.currentStock = { lte: prisma.inventoryItem.fields.minStock };

  const items = await prisma.inventoryItem.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      vendor: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = inventorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await prisma.inventoryItem.create({
    data: { ...parsed.data, tenantId },
    include: { vendor: { select: { id: true, name: true } } },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: Request) {
  const { tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...data } = body;

  // Verify item belongs to this tenant
  const existing = await prisma.inventoryItem.findFirst({ where: { id, tenantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const item = await prisma.inventoryItem.update({
    where: { id },
    data,
    include: { vendor: { select: { id: true, name: true } } },
  });

  return NextResponse.json(item);
}