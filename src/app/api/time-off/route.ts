import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/time-off — own requests (employee) or all (manager)
export async function GET() {
  const { userId, tenantId, role } = await getSessionContext();

  const where: Record<string, unknown> = { tenantId };
  if (role === "EMPLOYEE") where.userId = userId;
  const requests = await prisma.timeOffRequest.findMany({
    where,
    include: {
      user: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

// POST /api/time-off — create request
export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();
  const body = await request.json();
  const { startDate, endDate, reason } = body;

  if (!startDate || !endDate)
    return NextResponse.json({ error: "Start and end dates required" }, { status: 400 });

  const req = await prisma.timeOffRequest.create({
    data: { tenantId,
      userId,
      startDate: new Date(startDate + "T00:00:00"),
      endDate: new Date(endDate + "T00:00:00"),
      reason: reason || null,
    },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(req, { status: 201 });
}

// PUT /api/time-off — approve/deny
export async function PUT(request: Request) {
  const { userId: currentUserId, tenantId, role } = await getSessionContext();
  const body = await request.json();
  const { id, status, startDate, endDate, reason } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Approve/deny flow (managers only)
  if (status) {
    if (!["APPROVED", "DENIED"].includes(status))
      return NextResponse.json({ error: "status must be APPROVED or DENIED" }, { status: 400 });

    const req = await prisma.timeOffRequest.update({
      where: { tenantId, id },
      data: { status, reviewedBy: currentUserId, reviewedAt: new Date() },
      include: { user: { select: { id: true, name: true } }, reviewer: { select: { id: true, name: true } } },
    });

    await prisma.notification.create({
      data: { tenantId,
        title: `Time-Off ${status === "APPROVED" ? "Approved" : "Denied"}`,
        message: `Your request for ${new Date(req.startDate).toLocaleDateString()} – ${new Date(req.endDate).toLocaleDateString()} has been ${status.toLowerCase()}.`,
        priority: status === "DENIED" ? "HIGH" : "NORMAL",
        sentBy: currentUserId,
        recipients: { create: [{ userId: req.userId }] },
      },
    });

    return NextResponse.json(req);
  }

  // Edit flow (own pending requests only)
  const existing = await prisma.timeOffRequest.findUnique({ where: { tenantId, id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== currentUserId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (existing.status !== "PENDING")
    return NextResponse.json({ error: "Can only edit pending requests" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (startDate) updateData.startDate = new Date(startDate + "T00:00:00");
  if (endDate) updateData.endDate = new Date(endDate + "T00:00:00");
  if (reason !== undefined) updateData.reason = reason || null;

  const updated = await prisma.timeOffRequest.update({
    where: { tenantId, id },
    data: updateData,
    include: { user: { select: { id: true, name: true } }, reviewer: { select: { id: true, name: true } } },
  });
  return NextResponse.json(updated);
}

// DELETE /api/time-off?id=X — cancel own pending request
export async function DELETE(request: Request) {
  const { userId, tenantId } = await getSessionContext();const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const req = await prisma.timeOffRequest.findUnique({ where: { tenantId, id } });
  if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (req.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (req.status !== "PENDING")
    return NextResponse.json({ error: "Can only cancel pending requests" }, { status: 400 });

  await prisma.timeOffRequest.delete({ where: { tenantId, id } });
  return NextResponse.json({ ok: true });
}