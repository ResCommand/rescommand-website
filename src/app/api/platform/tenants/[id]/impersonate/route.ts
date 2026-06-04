import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encode } from "next-auth/jwt";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.isPlatformAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const tenantId = parseInt(id);

  // Find the tenant owner to impersonate
  const membership = await prisma.tenantUser.findFirst({
    where: { tenantId, role: "OWNER" },
    include: { user: true, tenant: true },
  });

  if (!membership) return NextResponse.json({ error: "No owner found for this tenant" }, { status: 404 });

  // Create a JWT for the tenant owner
  const secret = process.env.NEXTAUTH_SECRET!;
  const token = await encode({
    secret,
    token: {
      sub: String(membership.user.id),
      email: membership.user.email,
      name: membership.user.name,
      role: membership.role,
      id: String(membership.user.id),
      tenantId: String(tenantId),
      tenantSlug: membership.tenant.slug,
      tenantName: membership.tenant.name,
      impersonatedBy: user.id,
    },
    maxAge: 60 * 60, // 1 hour
  });

  const domain = membership.tenant.domain || `${membership.tenant.slug}.rescommand.com`;
  const protocol = "https";
  const url = `${protocol}://${domain}/api/auth/impersonate?token=${token}`;

  return NextResponse.json({ url, tenantName: membership.tenant.name });
}