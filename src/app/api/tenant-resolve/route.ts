import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tenant-resolve?slug=duffersdonutshop
// GET /api/tenant-resolve?domain=ops.duffersdonutshop.com
// Resolves a tenant by subdomain slug or custom domain
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const domain = searchParams.get("domain");

  if (!slug && !domain) {
    return NextResponse.json({ error: "slug or domain required" }, { status: 400 });
  }

  const where = slug ? { slug } : { domain };
  const tenant = await prisma.tenant.findFirst({
    where: { ...where, active: true },
    select: {
      id: true, name: true, slug: true, domain: true,
      businessType: true, plan: true, logoUrl: true,
      primaryColor: true, active: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json(tenant);
}