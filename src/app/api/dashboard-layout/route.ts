import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const layout = await prisma.dashboardLayout.findUnique({ where: { tenantId, userId } });

  return NextResponse.json(layout ? JSON.parse(layout.layout) : null);
}

export async function POST(req: Request) {
  const { userId, tenantId } = await getSessionContext();const layout = await req.json();

  const saved = await prisma.dashboardLayout.upsert({
    where: { tenantId, userId },
    update: { layout: JSON.stringify(layout) },
    create: { tenantId, userId, layout: JSON.stringify(layout) },
  });

  return NextResponse.json({ ok: true });
}