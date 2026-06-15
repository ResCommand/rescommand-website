import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

const saleSchema = z.object({
  totalAmount: z.number().min(0),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional(),
  lines: z.array(z.object({
    productName: z.string(),
    productId: z.number().optional().nullable(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    total: z.number().min(0),
  })).optional(),
});

export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();

  const body = await request.json();
  const parsed = saleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });const transaction = await prisma.transaction.create({
    data: { tenantId,
      userId,
      totalAmount: parsed.data.totalAmount,
      paymentMethod: parsed.data.paymentMethod as "CASH" | "CARD" | "OTHER" | undefined,
      notes: parsed.data.notes,
      lines: parsed.data.lines
        ? {
            create: parsed.data.lines.map((l) => ({
              productName: l.productName,
              productId: l.productId ?? undefined,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              total: l.total,
            })),
          }
        : undefined,
    },
    include: { lines: true },
  });

  return NextResponse.json(transaction, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const where: Record<string, unknown> = {};

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.createdAt = { gte: start, lte: end };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { lines: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(transactions);
}