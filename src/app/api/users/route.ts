import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["EMPLOYEE", "MANAGER", "OWNER"]),
  phone: z.string().nullable().optional(),
  categoryId: z.number().nullable().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["EMPLOYEE", "MANAGER", "OWNER"]).optional(),
  phone: z.string().nullable().optional(),
  active: z.boolean().optional(),
  categoryId: z.number().nullable().optional(),
});

// GET /api/users — list users for this tenant only
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  // Find users who are members of this tenant
  const tenantUsers = await prisma.tenantUser.findMany({
    where: { tenantId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          active: true,
          createdAt: true,
          categoryId: true,
          category: { select: { id: true, name: true, color: true } },
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  const users = tenantUsers.map((tu) => tu.user);
  return NextResponse.json(users);
}

// POST /api/users — create new user in this tenant
export async function POST(request: Request) {
  const { userId, tenantId, role: actingRole } = await getSessionContext();
  if (actingRole !== "MANAGER" && actingRole !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    // User exists — just add them to this tenant if not already a member
    const existingMembership = await prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId: existing.id } },
    });
    if (existingMembership) {
      return NextResponse.json({ error: "User already exists in this workspace" }, { status: 409 });
    }
    // Add existing user to this tenant
    await prisma.tenantUser.create({
      data: { tenantId, userId: existing.id, role: parsed.data.role },
    });
    return NextResponse.json(
      { id: existing.id, email: existing.email, name: existing.name, role: parsed.data.role },
      { status: 201 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      phone: parsed.data.phone,
      categoryId: parsed.data.categoryId,
      tenantMemberships: {
        create: { tenantId, role: parsed.data.role },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      active: true,
      createdAt: true,
      categoryId: true,
      category: { select: { id: true, name: true, color: true } },
    },
  });

  return NextResponse.json(user, { status: 201 });
}

// PUT /api/users — update user (must be in same tenant)
export async function PUT(request: Request) {
  const { tenantId, role: actingRole } = await getSessionContext();
  if (actingRole !== "MANAGER" && actingRole !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  // Verify user belongs to this tenant
  const membership = await prisma.tenantUser.findUnique({
    where: { tenantId_userId: { tenantId, userId: id } },
  });
  if (!membership) return NextResponse.json({ error: "User not in this workspace" }, { status: 403 });

  const parsed = updateUserSchema.safeParse(updates);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password as string, 10);
    delete data.password;
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      active: true,
      createdAt: true,
      categoryId: true,
      category: { select: { id: true, name: true, color: true } },
    },
  });

  return NextResponse.json(user);
}

// DELETE /api/users — deactivate user (must be in same tenant)
export async function DELETE(request: Request) {
  const { userId: sessionUserId, tenantId, role: actingRole } = await getSessionContext();
  if (actingRole !== "OWNER")
    return NextResponse.json({ error: "Only owners can delete users" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  if (Number(id) === sessionUserId)
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });

  // Verify user belongs to this tenant
  const membership = await prisma.tenantUser.findUnique({
    where: { tenantId_userId: { tenantId, userId: Number(id) } },
  });
  if (!membership) return NextResponse.json({ error: "User not in this workspace" }, { status: 403 });

  // Soft delete — deactivate
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { active: false },
    select: { id: true, email: true, name: true, role: true, active: true },
  });

  return NextResponse.json(user);
}