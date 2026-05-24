import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const layout = await prisma.dashboardLayout.findUnique({ where: { userId } });

  return NextResponse.json(layout ? JSON.parse(layout.layout) : null);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const layout = await req.json();

  const saved = await prisma.dashboardLayout.upsert({
    where: { userId },
    update: { layout: JSON.stringify(layout) },
    create: { userId, layout: JSON.stringify(layout) },
  });

  return NextResponse.json({ ok: true });
}