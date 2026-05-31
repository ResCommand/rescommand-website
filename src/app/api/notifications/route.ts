import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/notifications — Get notifications for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = parseInt((session.user as { id?: string })?.id || "0");

  // Get all notifications where user is a recipient, with read status
  const notifications = await prisma.notification.findMany({
    where: {
      recipients: { some: { userId } },
    },
    include: {
      sender: { select: { id: true, name: true } },
      reads: { where: { userId } },
      recipients: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const result = notifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    priority: n.priority,
    sender: n.sender,
    createdAt: n.createdAt,
    recipients: n.recipients,
  }));

  return NextResponse.json(result);
}

// POST /api/notifications — Send a new notification
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = parseInt((session.user as { id?: string })?.id || "0");
  const body = await request.json();
  const { title, message, priority, recipientUserIds, recipientCategoryIds } = body;

  if (!title?.trim() || !message?.trim())
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });

  // Resolve all recipient user IDs (deduplicated)
  const recipientSet = new Set<number>();

  // Add individual users
  if (Array.isArray(recipientUserIds)) {
    recipientUserIds.forEach((id: number) => recipientSet.add(id));
  }

  // Add users from employee categories
  if (Array.isArray(recipientCategoryIds) && recipientCategoryIds.length > 0) {
    const categoryUsers = await prisma.user.findMany({
      where: { categoryId: { in: recipientCategoryIds }, active: true },
      select: { id: true },
    });
    categoryUsers.forEach(u => recipientSet.add(u.id));
  }

  if (recipientSet.size === 0)
    return NextResponse.json({ error: "No recipients selected" }, { status: 400 });

  // Create notification with recipients
  const notification = await prisma.notification.create({
    data: {
      title: title.trim(),
      message: message.trim(),
      priority: priority || "normal",
      sentBy: userId,
      recipients: {
        create: Array.from(recipientSet).map(uid => ({ userId: uid })),
      },
    },
    include: {
      sender: { select: { name: true } },
      recipients: { select: { userId: true } },
    },
  });

  return NextResponse.json(notification, { status: 201 });
}

// PUT /api/notifications — Mark as read
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = parseInt((session.user as { id?: string })?.id || "0");

  const body = await request.json();
  const { notificationId, markAllRead } = body;

  if (markAllRead) {
    // Mark all unread notifications as read for this user
    const unread = await prisma.notification.findMany({
      where: {
        recipients: { some: { userId } },
        reads: { none: { userId } },
      },
      select: { id: true },
    });

    if (unread.length > 0) {
      await prisma.notificationRead.createMany({
        data: unread.map(n => ({ notificationId: n.id, userId })),
        skipDuplicates: true,
      });
    }
    return NextResponse.json({ success: true, marked: unread.length });
  }

  if (!notificationId)
    return NextResponse.json({ error: "notificationId required" }, { status: 400 });

  await prisma.notificationRead.upsert({
    where: { notificationId_userId: { notificationId, userId } },
    update: {},
    create: { notificationId, userId },
  });

  return NextResponse.json({ success: true });
}