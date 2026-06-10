import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const vendors = await prisma.vendor.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { inventoryItems: { where: { active: true, tenantId } } } },
    },
  });

  return NextResponse.json(vendors);
}