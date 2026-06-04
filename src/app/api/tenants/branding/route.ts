import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tenants/branding — returns { brandName, platformName }
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = parseInt((session.user as { tenantId?: string }).tenantId || "0");
  if (!tenantId) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true, settings: true },
  });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const settings = (tenant.settings as Record<string, string>) || {};
  const brandName = settings.brandName || `${tenant.name} OS`;

  return NextResponse.json({ brandName, platformName: "ResCommand" });
}

// PUT /api/tenants/branding — update brandName
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tenantId = parseInt((session.user as { tenantId?: string }).tenantId || "0");
  if (!tenantId) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const body = await request.json();
  const brandName = (body.brandName as string)?.trim();
  if (!brandName) return NextResponse.json({ error: "brandName required" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });
  const settings = ((tenant?.settings as Record<string, string>) || {}) as Record<string, string>;
  settings.brandName = brandName;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { settings },
  });

  return NextResponse.json({ brandName, platformName: "ResCommand" });
}