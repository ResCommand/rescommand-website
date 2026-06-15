import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tenants/branding/public — returns { brandName, platformName }
// Single-domain architecture: authenticated users get their tenant branding,
// unauthenticated users get the default platform branding.
export async function GET() {
  // If authenticated, use session tenantId
  const session = await auth();
  if (session?.user) {
    const tenantId = parseInt((session.user as { tenantId?: string }).tenantId || "0");
    if (tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, settings: true },
      });
      if (tenant) {
        const settings = (tenant.settings as Record<string, string>) || {};
        const brandName = settings.brandName || `${tenant.name} OS`;
        return NextResponse.json({ brandName, platformName: "ResCommand" });
      }
    }
  }

  // Default — platform branding
  return NextResponse.json({ brandName: "ResCommand", platformName: "ResCommand" });
}
