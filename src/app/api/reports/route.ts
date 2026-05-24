import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Donuts sold
  const donutLogs = await prisma.donutLog.findMany({
    where: { createdAt: { gte: today } },
    include: { product: true },
  });
  const donutsSold = donutLogs.reduce((sum, l) => sum + l.sold, 0);
  const donutsMade = donutLogs.reduce((sum, l) => sum + l.made, 0);
  const overboard = Math.max(0, donutsMade - donutsSold);

  // Transactions
  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: today } },
    include: { lines: true },
  });
  let dozens = 0, halfDozens = 0, totalSales = 0;
  transactions.forEach((t) => {
    totalSales += t.totalAmount;
    t.lines.forEach((l) => {
      const name = l.productName.toLowerCase();
      if (name.includes("dozen") && !name.includes("half")) dozens += l.quantity;
      if (name.includes("half dozen")) halfDozens += l.quantity;
    });
  });

  // Drinks
  const drinkLogs = await prisma.drinkLog.findMany({ where: { createdAt: { gte: today } } });
  const drinkBreakdown: Record<string, number> = {};
  drinkLogs.forEach((d) => { drinkBreakdown[d.drinkType] = (drinkBreakdown[d.drinkType] || 0) + 1; });

  // Dogels and sandwiches
  const allLines = await prisma.transactionLine.findMany({
    where: { transaction: { createdAt: { gte: today } } },
  });
  let dogelsSold = 0, sandwichesSold = 0;
  allLines.forEach((l) => {
    const name = l.productName.toLowerCase();
    if (name.includes("dogel")) dogelsSold += l.quantity;
    if (name.includes("sandwich")) sandwichesSold += l.quantity;
  });

  // Overboard sales
  const overboardSchedules = await prisma.overboardSchedule.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    include: { lines: { include: { product: true } } },
  });
  let overboardsSold = 0, overboardRevenue = 0, overboardUpcharges = 0, upchargeRevenue = 0;
  overboardSchedules.forEach((s) => {
    s.lines.forEach((l) => {
      overboardsSold += l.quantitySold;
      overboardRevenue += l.quantitySold * l.unitPrice;
      overboardUpcharges += l.upchargesSold;
      upchargeRevenue += l.upchargesSold * l.upchargePrice;
    });
  });

  // Sales by hour
  const salesByHour: { hour: string; sales: number }[] = [];
  for (let h = 5; h <= 20; h++) {
    const hourStart = new Date(today); hourStart.setHours(h, 0, 0, 0);
    const hourEnd = new Date(today); hourEnd.setHours(h, 59, 59, 999);
    const hourSales = await prisma.transaction.aggregate({
      where: { createdAt: { gte: hourStart, lte: hourEnd } },
      _sum: { totalAmount: true },
    });
    salesByHour.push({ hour: h <= 12 ? `${h}am` : `${h - 12}pm`, sales: hourSales._sum.totalAmount || 0 });
  }

  // Employee hours
  const hours = await prisma.employeeHour.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    include: { user: { select: { name: true } } },
  });

  // COGS
  const productsSold = await prisma.donutLog.findMany({
    where: { createdAt: { gte: today } },
    include: { product: true },
  });
  const totalCost = productsSold.reduce((sum, l) => sum + (l.product?.cost || 0) * l.sold, 0);

  return NextResponse.json({
    donutsSold,
    overboard,
    dozens,
    halfDozens,
    drinksSold: drinkLogs.length,
    drinkBreakdown: Object.entries(drinkBreakdown).map(([name, count]) => ({ name, count })),
    dogelsSold,
    sandwichesSold,
    todaySales: parseFloat(totalSales.toFixed(2)),
    ticketCount: transactions.length,
    salesByHour,
    avgTicket: transactions.length > 0 ? parseFloat((totalSales / transactions.length).toFixed(2)) : 0,
    employeeHours: hours.map((h) => ({ name: h.user.name, hours: h.totalHours || 0 })),
    cogsPercent: totalSales > 0 ? parseFloat(((totalCost / totalSales) * 100).toFixed(1)) : 0,
    overboardsSold,
    overboardRevenue: parseFloat(overboardRevenue.toFixed(2)),
    overboardUpcharges,
    upchargeRevenue: parseFloat(upchargeRevenue.toFixed(2)),
  });
}