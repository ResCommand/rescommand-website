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

  // Today's donuts sold
  const donutLogs = await prisma.donutLog.findMany({
    where: { createdAt: { gte: today } },
    include: { product: true },
  });

  const donutsSold = donutLogs.reduce((sum, l) => sum + l.sold, 0);
  const donutsMade = donutLogs.reduce((sum, l) => sum + l.made, 0);
  const overboard = donutsMade - donutsSold;

  // Count dozens and half-dozens from transactions
  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: today } },
    include: { lines: true },
  });

  let dozens = 0;
  let halfDozens = 0;
  let totalSales = 0;
  let ticketCount = transactions.length;

  transactions.forEach((t) => {
    totalSales += t.totalAmount;
    t.lines.forEach((l) => {
      const name = l.productName.toLowerCase();
      if (name.includes("dozen") && !name.includes("half")) dozens += l.quantity;
      if (name.includes("half dozen")) halfDozens += l.quantity;
    });
  });

  // Drinks
  const drinkLogs = await prisma.drinkLog.findMany({
    where: { createdAt: { gte: today } },
  });

  const drinkBreakdown: Record<string, number> = {};
  drinkLogs.forEach((d) => {
    drinkBreakdown[d.drinkType] = (drinkBreakdown[d.drinkType] || 0) + 1;
  });

  // Dogels and sandwiches from transaction lines
  const allLines = await prisma.transactionLine.findMany({
    where: { transaction: { createdAt: { gte: today } } },
  });

  let dogelsSold = 0;
  let sandwichesSold = 0;
  allLines.forEach((l) => {
    const name = l.productName.toLowerCase();
    if (name.includes("dogel")) dogelsSold += l.quantity;
    if (name.includes("sandwich")) sandwichesSold += l.quantity;
  });

  // Sales by hour
  const salesByHour: { hour: string; sales: number }[] = [];
  for (let h = 5; h <= 20; h++) {
    const hourStart = new Date(today);
    hourStart.setHours(h, 0, 0, 0);
    const hourEnd = new Date(today);
    hourEnd.setHours(h, 59, 59, 999);

    const hourSales = await prisma.transaction.aggregate({
      where: { createdAt: { gte: hourStart, lte: hourEnd } },
      _sum: { totalAmount: true },
    });

    salesByHour.push({
      hour: h <= 12 ? `${h}am` : `${h - 12}pm`,
      sales: hourSales._sum.totalAmount || 0,
    });
  }

  // Employee hours
  const hours = await prisma.employeeHour.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    include: { user: { select: { name: true } } },
  });

  const employeeHours = hours.map((h) => ({
    name: h.user.name,
    hours: h.totalHours || 0,
  }));

  // COGS (simplified: sum of product costs for items sold)
  const productsSold = await prisma.donutLog.findMany({
    where: { createdAt: { gte: today } },
    include: { product: true },
  });

  const totalCost = productsSold.reduce((sum, l) => sum + (l.product?.cost || 0) * l.sold, 0);
  const cogsPercent = totalSales > 0 ? (totalCost / totalSales) * 100 : 0;

  return NextResponse.json({
    donutsSold,
    overboard: Math.max(0, overboard),
    dozens,
    halfDozens,
    drinksSold: drinkLogs.length,
    drinkBreakdown: Object.entries(drinkBreakdown).map(([name, count]) => ({ name, count })),
    dogelsSold,
    sandwichesSold,
    todaySales: totalSales,
    salesByHour,
    avgTicket: ticketCount > 0 ? totalSales / ticketCount : 0,
    employeeHours,
    cogsPercent,
  });
}