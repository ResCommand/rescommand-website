import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/tenants/branding — returns { brandName, platformName }
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

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
  const { tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER" && role !== "PLATFORM_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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