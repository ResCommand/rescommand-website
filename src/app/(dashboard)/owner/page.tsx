import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as { role?: string })?.role;
  if (role !== "OWNER") redirect("/");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [todaySales, weekSales, monthSales, totalProducts, totalInventory] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: weekAgo } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: monthAgo } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.product.count({ where: { active: true } }),
      prisma.inventoryItem.aggregate({
        _sum: { currentStock: true, unitCost: true },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Owner Financials</h1>
        <p className="text-muted-foreground text-sm">
          Revenue and cost overview for Duffera Donuts
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              Today Revenue
            </div>
            <div className="text-2xl font-bold">
              ${(todaySales._sum.totalAmount || 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {todaySales._count} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              This Week
            </div>
            <div className="text-2xl font-bold">
              ${(weekSales._sum.totalAmount || 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {weekSales._count} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <PieChart className="h-3 w-3 text-purple-600" />
              This Month
            </div>
            <div className="text-2xl font-bold">
              ${(monthSales._sum.totalAmount || 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {monthSales._count} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingDown className="h-3 w-3 text-amber-600" />
              Inventory Value
            </div>
            <div className="text-2xl font-bold">
              ${(totalInventory._sum.unitCost || 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {totalProducts} active products
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <a href="/manager" className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors font-medium">
              📊 Manager Dashboard
            </a>
            <a href="/inventory" className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors font-medium">
              📦 Inventory & COGS
            </a>
            <a href="/production" className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors font-medium">
              📋 Par Sheets
            </a>
            <a href="/overboards" className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors font-medium">
              📅 Overboard Calendar
            </a>
            <a href="/admin/users" className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors font-medium">
              👥 Manage Users
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}