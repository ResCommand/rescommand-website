import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

const schema = z.object({
  date: z.string(),
});

// POST /api/inventory/generate-orders
// Creates OrderRequests for all items below par in a given count, grouped by vendor.
// Skips items that already have a PENDING or APPROVED request.
export async function POST(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER" && role !== "PLATFORM_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const date = new Date(parsed.data.date);
  date.setUTCHours(0, 0, 0, 0);

  // Find the count for this date
  const count = await prisma.inventoryCount.findUnique({
    where: { tenantId_date: { tenantId, date } },
    include: {
      lines: {
        where: { amountToOrder: { gt: 0 } },
        include: {
          inventoryItem: {
            select: {
              id: true,
              name: true,
              unit: true,
              unitCost: true,
              parLevel: true,
              vendor: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!count) {
    return NextResponse.json(
      { error: "No count found for this date. Save a count first." },
      { status: 404 },
    );
  }

  // Get item IDs that already have pending/approved requests
  const existingRequests = await prisma.orderRequest.findMany({
    where: {
      tenantId,
      status: { in: ["PENDING", "APPROVED"] },
      inventoryItemId: { in: count.lines.map((l) => l.inventoryItemId) },
    },
    select: { inventoryItemId: true },
  });
  const alreadyRequested = new Set(
    existingRequests.map((r) => r.inventoryItemId),
  );

  // Create order requests for items not already requested
  let created = 0;
  let skipped = 0;
  const orders = [];

  for (const line of count.lines) {
    if (alreadyRequested.has(line.inventoryItemId)) {
      skipped++;
      continue;
    }

    const order = await prisma.orderRequest.create({
      data: {
        tenantId,
        inventoryItemId: line.inventoryItemId,
        qtyRequested: line.amountToOrder,
        requestedBy: userId,
        status: "PENDING",
        notes: `Auto-generated from count ${parsed.data.date}`,
      },
      include: {
        inventoryItem: {
          select: {
            id: true,
            name: true,
            unit: true,
            vendor: { select: { id: true, name: true } },
          },
        },
      },
    });

    orders.push(order);
    created++;
  }

  return NextResponse.json({ created, skipped, orders }, { status: 201 });
}
