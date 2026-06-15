import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

export async function GET() {
  const session = await auth();
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