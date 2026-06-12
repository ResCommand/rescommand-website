import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Debug endpoint - checks auth-related data
export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "hello@duffersdonutshop.com" },
      include: {
        tenantMemberships: {
          where: { active: true },
          include: { tenant: { select: { id: true, name: true, slug: true, active: true } } },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
      role: user.role,
      isPlatformAdmin: user.isPlatformAdmin,
      membershipCount: user.tenantMemberships.length,
      memberships: user.tenantMemberships.map(m => ({
        tenantId: m.tenant.id,
        tenantName: m.tenant.name,
        tenantSlug: m.tenant.slug,
        tenantActive: m.tenant.active,
        role: m.role,
      })),
      hasPasswordHash: !!user.passwordHash,
      passwordHashPrefix: user.passwordHash?.substring(0, 10),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
