import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/tray-overrides?date=YYYY-MM-DD
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  if (!dateParam) return NextResponse.json([]);

  const date = new Date(dateParam + "T00:00:00");
  const overrides = await prisma.trayOverride.findMany({
    where: { tenantId, date },
  });
  return NextResponse.json(overrides);
}

// POST /api/tray-overrides — Save a tray override (upsert)
export async function POST(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { date, flavor, trays } = body;
  if (!date || !flavor || trays === undefined) return NextResponse.json({ error: "date, flavor, trays required" }, { status: 400 });

  const targetDate = new Date(date + "T00:00:00");
  const override = await prisma.trayOverride.upsert({
    where: { tenantId_date_flavor: { tenantId, date: targetDate, flavor } },
    update: { trays },
    create: { tenantId, date: targetDate, flavor, trays },
  });
  return NextResponse.json(override);
}

// DELETE /api/tray-overrides?date=YYYY-MM-DD — Reset all overrides for a date
export async function DELETE(request: Request) {
  const { tenantId, role } = await getSessionContext();

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  if (!dateParam) return NextResponse.json({ error: "date required" }, { status: 400 });

  const date = new Date(dateParam + "T00:00:00");
  await prisma.trayOverride.deleteMany({ where: { tenantId, date } });
  return NextResponse.json({ success: true });
}