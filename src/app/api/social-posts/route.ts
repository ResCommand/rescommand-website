import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/social-posts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status ? { status } : {};
  const posts = await prisma.socialPost.findMany({
    where,
    include: {
      createdByUser: { select: { id: true, name: true } },
      approvedByUser: { select: { id: true, name: true } },
    },
    orderBy: [{ postDate: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(posts);
}

// POST — create post
export async function POST(request: Request) {
  const { userId, tenantId } = await getSessionContext();const body = await request.json();
  const { title, description, platform, postDate, status, mediaUrl, linkUrl, notes } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const post = await prisma.socialPost.create({
    data: { tenantId,
      title,
      description: description || null,
      platform: platform || "ALL",
      postDate: postDate ? new Date(postDate) : null,
      status: status || "DRAFT",
      mediaUrl: mediaUrl || null,
      linkUrl: linkUrl || null,
      notes: notes || null,
      createdById: userId,
    },
    include: {
      createdByUser: { select: { id: true, name: true } },
      approvedByUser: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(post, { status: 201 });
}

// PUT — update post (approve, schedule, edit)
export async function PUT(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.platform !== undefined) updateData.platform = data.platform;
  if (data.postDate !== undefined) updateData.postDate = data.postDate ? new Date(data.postDate) : null;
  if (data.status !== undefined) {
    updateData.status = data.status;
    // Track approval
    if ((data.status === "SCHEDULED" || data.status === "PUBLISHED") && (role === "MANAGER" || role === "OWNER")) {
      updateData.approvedBy = userId;
    }
  }
  if (data.mediaUrl !== undefined) updateData.mediaUrl = data.mediaUrl || null;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  const post = await prisma.socialPost.update({
    where: { tenantId, id },
    data: updateData,
    include: {
      createdByUser: { select: { id: true, name: true } },
      approvedByUser: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(post);
}

// DELETE
export async function DELETE(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.socialPost.delete({ where: { tenantId, id } });
  return NextResponse.json({ ok: true });
}