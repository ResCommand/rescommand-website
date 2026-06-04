import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tenants/branding/public — returns { brandName, platformName } without auth
// Uses the host header to resolve the tenant
export async function GET(request: Request) {
  // If authenticated, use session tenantId
  const session = await getServerSession(authOptions);
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

  // Unauthenticated — try to resolve from host header or domain
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Try custom domain match
  const tenantByDomain = await prisma.tenant.findFirst({
    where: { domain: hostname, active: true },
    select: { name: true, settings: true },
  });
  if (tenantByDomain) {
    const settings = (tenantByDomain.settings as Record<string, string>) || {};
    const brandName = settings.brandName || `${tenantByDomain.name} OS`;
    return NextResponse.json({ brandName, platformName: "ResCommand" });
  }

  // Try slug from subdomain (e.g. duffersdonutshop.rescommand.com)
  const parts = hostname.split(".");
  if (parts.length >= 2 && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
    const slug = parts[0];
    const tenantBySlug = await prisma.tenant.findFirst({
      where: { slug, active: true },
      select: { name: true, settings: true },
    });
    if (tenantBySlug) {
      const settings = (tenantBySlug.settings as Record<string, string>) || {};
      const brandName = settings.brandName || `${tenantBySlug.name} OS`;
      return NextResponse.json({ brandName, platformName: "ResCommand" });
    }
  }

  // Default — platform branding
  return NextResponse.json({ brandName: "ResCommand", platformName: "ResCommand" });
}