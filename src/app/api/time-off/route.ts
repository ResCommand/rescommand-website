import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/time-off — own requests (employee) or all (manager)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const role = (session.user as { role?: string })?.role;

  const where = role === "EMPLOYEE" ? { userId } : {};
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
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const body = await request.json();
  const { startDate, endDate, reason } = body;

  if (!startDate || !endDate)
    return NextResponse.json({ error: "Start and end dates required" }, { status: 400 });

  const req = await prisma.timeOffRequest.create({
    data: {
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
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reviewerId = parseInt((session.user as { id?: string }).id || "0");
  const body = await request.json();
  const { id, status } = body;
  if (!id || !["APPROVED", "DENIED"].includes(status))
    return NextResponse.json({ error: "id and status (APPROVED/DENIED) required" }, { status: 400 });

  const req = await prisma.timeOffRequest.update({
    where: { id },
    data: { status, reviewedBy: reviewerId, reviewedAt: new Date() },
    include: { user: { select: { id: true, name: true } }, reviewer: { select: { id: true, name: true } } },
  });

  // Send notification to the employee
  await prisma.notification.create({
    data: {
      title: `Time-Off ${status === "APPROVED" ? "Approved" : "Denied"}`,
      message: `Your request for ${req.startDate.toLocaleDateString()} – ${req.endDate.toLocaleDateString()} has been ${status.toLowerCase()}.`,
      priority: status === "DENIED" ? "HIGH" : "NORMAL",
      sentBy: reviewerId,
      recipients: { create: [{ userId: req.userId,  }] },
    },
  });

  return NextResponse.json(req);
}

// DELETE /api/time-off?id=X — cancel own pending request
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const req = await prisma.timeOffRequest.findUnique({ where: { id } });
  if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (req.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (req.status !== "PENDING")
    return NextResponse.json({ error: "Can only cancel pending requests" }, { status: 400 });

  await prisma.timeOffRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}