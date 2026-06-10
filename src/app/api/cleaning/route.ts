import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const tasks = await prisma.cleaningTask.findMany({
    where: { tenantId, active: true },
    include: {
      logs: {
        where: { tenantId,
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        include: { user: { select: { name: true } } },
        orderBy: { completedAt: "desc" },
      },
    },
    orderBy: [{ frequency: "asc" }, { title: "asc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();

  const { taskId, notes } = await request.json();const log = await prisma.cleaningLog.create({
    data: { tenantId, taskId, completedBy: userId, notes },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(log, { status: 201 });
}