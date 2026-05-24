import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["EMPLOYEE", "MANAGER", "OWNER"]),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["EMPLOYEE", "MANAGER", "OWNER"]).optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
});

// GET /api/users — list all users
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      active: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}

// POST /api/users — create new user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      phone: parsed.data.phone,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}

// PUT /api/users — update user
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const parsed = updateUserSchema.safeParse(updates);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // If password is being updated, hash it
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
    },
  });

  return NextResponse.json(user);
}

// DELETE /api/users — deactivate user (soft delete)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "OWNER")
    return NextResponse.json({ error: "Only owners can delete users" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  // Prevent self-deletion
  const sessionUserId = Number((session.user as { id?: string }).id);
  if (Number(id) === sessionUserId)
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });

  // Soft delete — deactivate instead of removing
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { active: false },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
    },
  });

  return NextResponse.json(user);
}