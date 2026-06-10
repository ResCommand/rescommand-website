import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + 35);

  const schedules = await prisma.overboardSchedule.findMany({
    where: { tenantId, date: { gte: today, lte: future } },
    include: {
      lines: { include: { product: true } },
      tasks: { include: { assignee: { select: { id: true, name: true } } }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(schedules);
}

const overboardSchema = z.object({
  date: z.string(),
  notes: z.string().optional(),
  lines: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    fillings: z.string().optional(),
    toppings: z.string().optional(),
  })),
});

export async function POST(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = overboardSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const schedule = await prisma.overboardSchedule.create({
    data: { tenantId,
      date: new Date(parsed.data.date),
      notes: parsed.data.notes,
      lines: {
        create: parsed.data.lines,
      },
    },
    include: { lines: { include: { product: true } } },
  });

  return NextResponse.json(schedule, { status: 201 });
}

export async function PUT(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await request.json();

  const schedule = await prisma.overboardSchedule.update({
    where: { tenantId, id },
    data: { status },
  });

  return NextResponse.json(schedule);
}