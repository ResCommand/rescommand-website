import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sops = await prisma.sop.findMany({
    where: { active: true },
    include: {
      creator: { select: { name: true } },
      updater: { select: { name: true } },
    },
    orderBy: { category: "asc" },
  });

  return NextResponse.json(sops);
}

const sopSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["FOH", "BOH", "SAFETY", "CLEANING", "OPENING", "CLOSING", "GENERAL"]),
  content: z.string().default("<p></p>"),
  fileUrl: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = sopSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const sop = await prisma.sop.create({
    data: { ...parsed.data, createdBy: userId },
    include: { creator: { select: { name: true } } },
  });

  return NextResponse.json(sop, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const parsed = sopSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userId = parseInt((session.user as { id?: string }).id || "0");
  const sop = await prisma.sop.update({
    where: { id },
    data: { ...parsed.data, updatedBy: userId, version: { increment: 1 } },
    include: { creator: { select: { name: true } }, updater: { select: { name: true } } },
  });

  return NextResponse.json(sop);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "OWNER") return NextResponse.json({ error: "Forbidden — owner only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.sop.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}