import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.isPlatformAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id: parseInt(id) },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, role: true, isPlatformAdmin: true } } } },
      subscription: true,
      _count: {
        select: {
          products: true, inventoryItems: true, shifts: true, recipes: true,
          sops: true, socialPosts: true, roastLogs: true,
        },
      },
    },
  });

  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  return NextResponse.json(tenant);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.isPlatformAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { name, slug, domain, plan, active, businessType, trialEndsAt } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (domain !== undefined) data.domain = domain;
  if (plan !== undefined) data.plan = plan;
  if (active !== undefined) data.active = active;
  if (businessType !== undefined) data.businessType = businessType;
  if (trialEndsAt !== undefined) data.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;

  const tenant = await prisma.tenant.update({
    where: { id: parseInt(id) },
    data,
  });

  return NextResponse.json(tenant);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.isPlatformAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  // Soft delete: just suspend
  const tenant = await prisma.tenant.update({
    where: { id: parseInt(id) },
    data: { active: false },
  });

  return NextResponse.json(tenant);
}