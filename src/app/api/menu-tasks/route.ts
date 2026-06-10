import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/menu-tasks?scheduleId=1
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const { searchParams } = new URL(request.url);
  const scheduleId = parseInt(searchParams.get("scheduleId") || "0");

  const where = scheduleId ? { scheduleId } : {};
  const tasks = await prisma.menuTask.findMany({
    where,
    include: { assignee: { select: { id: true, name: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(tasks);
}

// POST — create task
export async function POST(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { scheduleId, title, assignedTo, dueDate } = body;
  if (!scheduleId || !title) return NextResponse.json({ error: "scheduleId and title required" }, { status: 400 });

  // Get next sort order
  const maxSort = await prisma.menuTask.findFirst({
    where: { tenantId, scheduleId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const task = await prisma.menuTask.create({
    data: { tenantId,
      scheduleId,
      title: title.trim(),
      assignedTo: assignedTo || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      sortOrder: (maxSort?.sortOrder || 0) + 1,
    },
    include: { assignee: { select: { id: true, name: true } } },
  });
  return NextResponse.json(task, { status: 201 });
}

// PUT — toggle complete / update
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const body = await request.json();
  const { id, completed, title, assignedTo, dueDate } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (completed !== undefined) updateData.completed = completed;
  if (title !== undefined) updateData.title = title;
  if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

  const task = await prisma.menuTask.update({
    where: { tenantId, id },
    data: updateData,
    include: { assignee: { select: { id: true, name: true } } },
  });
  return NextResponse.json(task);
}

// DELETE
export async function DELETE(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.menuTask.delete({ where: { tenantId, id } });
  return NextResponse.json({ ok: true });
}