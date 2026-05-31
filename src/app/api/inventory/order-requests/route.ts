import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/inventory/order-requests
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
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
// Supports two modes:
// 1. Existing item: { inventoryItemId, qtyRequested, notes }
// 2. Custom item: { customItemName, customVendorName?, customUnit?, qtyRequested, notes }
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
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userId = Number((session.user as { id?: string }).id);
  if (!userId) return NextResponse.json({ error: "User ID not found" }, { status: 400 });

  const data = parsed.data;

  let orderRequest;

  if (data.mode === "existing") {
    orderRequest = await prisma.orderRequest.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        qtyRequested: data.qtyRequested,
        requestedBy: userId,
        notes: data.notes,
        status: "PENDING",
      },
      include: {
        inventoryItem: { select: { id: true, name: true, unit: true, vendor: { select: { id: true, name: true } } } },
        requester: { select: { id: true, name: true } },
      },
    });
  } else {
    orderRequest = await prisma.orderRequest.create({
      data: {
        inventoryItemId: null,
        customItemName: data.customItemName,
        customVendorName: data.customVendorName || null,
        customUnit: data.customUnit || null,
        qtyRequested: data.qtyRequested,
        requestedBy: userId,
        notes: data.notes,
        status: "PENDING",
      },
      include: {
        inventoryItem: { select: { id: true, name: true, unit: true, vendor: { select: { id: true, name: true } } } },
        requester: { select: { id: true, name: true } },
      },
    });
  }

  return NextResponse.json(orderRequest, { status: 201 });
}

// PUT /api/inventory/order-requests — update status (approve, fulfill, cancel)
const updateSchema = z.object({
  id: z.number(),
  status: z.enum(["PENDING", "APPROVED", "ORDERED", "FULFILLED", "CANCELLED"]),
});

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userId = Number((session.user as { id?: string }).id);
  if (!userId) return NextResponse.json({ error: "User ID not found" }, { status: 400 });

  const updated = await prisma.orderRequest.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
    include: {
      inventoryItem: { select: { id: true, name: true, unit: true, vendor: { select: { id: true, name: true } } } },
      requester: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/inventory/order-requests — delete a request (MANAGER/OWNER only)
const deleteSchema = z.object({ id: z.number() });

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    await prisma.orderRequest.delete({ where: { id: parsed.data.id } });
  } catch {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}