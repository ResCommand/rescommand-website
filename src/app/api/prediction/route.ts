import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const role = (session.user as { role?: string }).role;
  if (role !== "MANAGER" && role !== "OWNER" && role !== "PLATFORM_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Check if we already have a par sheet for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let sheet = await prisma.parSheet.findUnique({
    where: { tenantId_date: { tenantId, date: today } },
    include: { lines: { include: { product: true } } },
  });

  if (!sheet) {
    // Generate one based on historical averages
    const donutCategory = await prisma.productCategory.findFirst({
      where: { tenantId, type: "DONUT" },
    });

    if (!donutCategory) return NextResponse.json({ lines: [] });

    const products = await prisma.product.findMany({
      where: { tenantId, categoryId: donutCategory.id, active: true },
    });

    const dayOfWeek = today.getDay();

    const lines = [];
    for (const product of products) {
      // Get average sales for this product on this day of week
      const pastLogs = await prisma.donutLog.findMany({
        where: { tenantId,
          productId: product.id,
          createdAt: {
            gte: new Date(today.getTime() - 30 * 86400000),
          },
        },
      });

      const avgSold = pastLogs.length > 0
        ? Math.ceil(pastLogs.reduce((sum, l) => sum + l.sold, 0) / Math.max(1, Math.ceil(pastLogs.length / 7)))
        : 20;

      // Apply weather/holiday factor (simplified)
      const weatherCache = await prisma.weatherCache.findFirst({
        where: { tenantId, date: today },
      });

      let factor = 1.0;
      if (weatherCache && weatherCache.precipitation > 0.5) factor *= 0.85;
      if (weatherCache && weatherCache.tempHigh < 40) factor *= 0.9;

      const holiday = await prisma.holidaySchedule.findFirst({
        where: { tenantId, date: today },
      });
      if (holiday) {
        if (holiday.impactLevel === "HIGH") factor *= 1.5;
        if (holiday.impactLevel === "MEDIUM") factor *= 1.2;
      }

      const predicted = Math.ceil(avgSold * factor);
      lines.push({
        productId: product.id,
        parLevel: predicted,
        onHand: 0,
        toMake: predicted,
        predicted,
      });
    }

    sheet = await prisma.parSheet.create({
      data: { tenantId,
        date: today,
        lines: { create: lines },
      },
      include: { lines: { include: { product: true } } },
    });
  }

  return NextResponse.json(sheet);
}

export async function PUT(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER" && role !== "PLATFORM_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { lineId, onHand } = await request.json();

  const line = await prisma.parSheetLine.update({
    where: { id: lineId },
    data: {
      onHand,
      toMake: Math.max(0, (await prisma.parSheetLine.findUnique({ where: { id: lineId } }))!.parLevel - onHand),
    },
    include: { product: true },
  });

  return NextResponse.json(line);
}