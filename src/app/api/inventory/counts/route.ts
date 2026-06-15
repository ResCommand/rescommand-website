import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

// GET /api/inventory/counts — list counts (most recent first)
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const counts = await prisma.inventoryCount.findMany({
    where: { tenantId },
    orderBy: { date: "desc" },
    take: 20,
    include: {
      counter: { select: { id: true, name: true } },
      lines: {
        where: { inventoryItem: { tenantId } },
        include: {
          inventoryItem: {
            select: { id: true, name: true, unit: true, parLevel: true, vendor: { select: { id: true, name: true } } },
          },
        },
        orderBy: { inventoryItem: { name: "asc" } },
      },
    },
  });

  return NextResponse.json(counts);
}

// POST /api/inventory/counts — create or update a count
const countLineSchema = z.object({
  inventoryItemId: z.number(),
  onHand: z.number().min(0),
});

const countSchema = z.object({
  date: z.string(), // ISO date string
  notes: z.string().optional(),
  lines: z.array(countLineSchema),
});

export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();

  const body = await request.json();
  const parsed = countSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const date = new Date(parsed.data.date);
  date.setUTCHours(0, 0, 0, 0);

  // Upsert the count (unique on tenantId + date)
  const existingCount = await prisma.inventoryCount.findUnique({
    where: { tenantId_date: { tenantId, date } },
  });

  let count;
  if (existingCount) {
    // Update: delete old lines, create new ones
    await prisma.inventoryCountLine.deleteMany({ where: { countId: existingCount.id } });
    count = await prisma.inventoryCount.update({
      where: { id: existingCount.id },
      data: {
        countedBy: userId,
        notes: parsed.data.notes,
        lines: {
          create: parsed.data.lines.map((line) => ({
            tenantId,
            inventoryItemId: line.inventoryItemId,
            onHand: line.onHand,
            amountToOrder: 0,
          })),
        },
      },
      include: {
        counter: { select: { id: true, name: true } },
        lines: { include: { inventoryItem: { select: { id: true, name: true, unit: true, parLevel: true } } } },
      },
    });
  } else {
    count = await prisma.inventoryCount.create({
      data: {
        tenantId,
        date,
        countedBy: userId,
        notes: parsed.data.notes,
        lines: {
          create: parsed.data.lines.map((line) => ({
            tenantId,
            inventoryItemId: line.inventoryItemId,
            onHand: line.onHand,
            amountToOrder: 0,
          })),
        },
      },
      include: {
        counter: { select: { id: true, name: true } },
        lines: { include: { inventoryItem: { select: { id: true, name: true, unit: true, parLevel: true } } } },
      },
    });
  }

  // Calculate amountToOrder = parLevel - onHand (if positive)
  for (const line of count.lines) {
    const parLevel = line.inventoryItem.parLevel;
    const amountToOrder = Math.max(0, parLevel - line.onHand);
    await prisma.inventoryCountLine.update({
      where: { id: line.id },
      data: { amountToOrder },
    });
  }

  // Update currentStock on each InventoryItem
  for (const line of parsed.data.lines) {
    await prisma.inventoryItem.update({
      where: { id: line.inventoryItemId },
      data: { currentStock: line.onHand },
    });
  }

  // Refetch with updated values
  const result = await prisma.inventoryCount.findUnique({
    where: { id: count.id },
    include: {
      counter: { select: { id: true, name: true } },
      lines: {
        include: {
          inventoryItem: {
            select: { id: true, name: true, unit: true, parLevel: true, vendor: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  return NextResponse.json(result, { status: existingCount ? 200 : 201 });
}