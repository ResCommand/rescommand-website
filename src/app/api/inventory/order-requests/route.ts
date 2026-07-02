import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

// GET /api/inventory/order-requests
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { tenantId };
  if (status) where.status = status;

  const requests = await prisma.orderRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      inventoryItem: {
        select: { id: true, name: true, unit: true, unitCost: true, packSize: true, vendor: { select: { id: true, name: true } } },
      },
      requester: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(requests);
}

// POST /api/inventory/order-requests
const requestSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("existing"),
    inventoryItemId: z.number(),
    qtyRequested: z.number().min(1),
    notes: z.string().optional(),
  }),
  z.object({
    mode: z.literal("custom"),
    customItemName: z.string().min(1),
    customVendorName: z.string().optional(),
    customUnit: z.string().optional(),
    qtyRequested: z.number().min(1),
    notes: z.string().optional(),
  }),
]);

export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const baseData = { tenantId, qtyRequested: data.qtyRequested, requestedBy: userId, notes: data.notes, status: "PENDING" as const };

  let orderRequest;
  if (data.mode === "existing") {
    orderRequest = await prisma.orderRequest.create({
      data: { ...baseData, inventoryItemId: data.inventoryItemId },
      include: {
        inventoryItem: { select: { id: true, name: true, unit: true, vendor: { select: { id: true, name: true } } } },
        requester: { select: { id: true, name: true } },
      },
    });
  } else {
    orderRequest = await prisma.orderRequest.create({
      data: { ...baseData, inventoryItemId: null, customItemName: data.customItemName, customVendorName: data.customVendorName || null, customUnit: data.customUnit || null },
      include: {
        inventoryItem: { select: { id: true, name: true, unit: true, vendor: { select: { id: true, name: true } } } },
        requester: { select: { id: true, name: true } },
      },
    });
  }

  return NextResponse.json(orderRequest, { status: 201 });
}

// PUT /api/inventory/order-requests — update status
const updateSchema = z.object({
  id: z.number(),
  status: z.enum(["PENDING", "APPROVED", "ORDERED", "FULFILLED", "CANCELLED"]),
});

export async function PUT(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER" && role !== "PLATFORM_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.orderRequest.findFirst({ where: { id: parsed.data.id, tenantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.orderRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, reviewedBy: userId, reviewedAt: new Date() },
    include: {
      inventoryItem: { select: { id: true, name: true, unit: true, vendor: { select: { id: true, name: true } } } },
      requester: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/inventory/order-requests
const deleteSchema = z.object({ id: z.number() });

export async function DELETE(request: Request) {
  const { tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER" && role !== "PLATFORM_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.orderRequest.findFirst({ where: { id: parsed.data.id, tenantId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.orderRequest.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ success: true });
}