import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tray-overrides?date=YYYY-MM-DD
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  if (!dateParam) return NextResponse.json([]);

  const date = new Date(dateParam + "T00:00:00");
  const overrides = await prisma.trayOverride.findMany({
    where: { date },
  });
  return NextResponse.json(overrides);
}

// POST /api/tray-overrides — Save a tray override (upsert)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { date, flavor, trays } = body;
  if (!date || !flavor || trays === undefined) return NextResponse.json({ error: "date, flavor, trays required" }, { status: 400 });

  const targetDate = new Date(date + "T00:00:00");
  const override = await prisma.trayOverride.upsert({
    where: { date_flavor: { date: targetDate, flavor } },
    update: { trays },
    create: { date: targetDate, flavor, trays },
  });
  return NextResponse.json(override);
}

// DELETE /api/tray-overrides?date=YYYY-MM-DD — Reset all overrides for a date
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  if (!dateParam) return NextResponse.json({ error: "date required" }, { status: 400 });

  const date = new Date(dateParam + "T00:00:00");
  await prisma.trayOverride.deleteMany({ where: { date } });
  return NextResponse.json({ success: true });
}