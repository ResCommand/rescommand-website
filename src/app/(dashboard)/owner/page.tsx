import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as { role?: string })?.role;
  if (role !== "OWNER") redirect("/");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

  const [todaySales, weekSales, monthSales, totalProducts, totalInventory] =
    await Promise.all([
      prisma.transaction.aggregate({ where: { createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true }),
      prisma.transaction.aggregate({ where: { createdAt: { gte: weekAgo } }, _sum: { totalAmount: true }, _count: true }),
      prisma.transaction.aggregate({ where: { createdAt: { gte: monthAgo } }, _sum: { totalAmount: true }, _count: true }),
      prisma.product.count({ where: { active: true } }),
      prisma.inventoryItem.aggregate({ _sum: { currentStock: true, unitCost: true } }),
    ]);

  const cards = [
    { label: "Today", sublabel: `${todaySales._count} transactions`, value: `$${(todaySales._sum.totalAmount || 0).toFixed(2)}`, icon: DollarSign, accent: "text-[#FF385C]" },
    { label: "This Week", sublabel: `${weekSales._count} transactions`, value: `$${(weekSales._sum.totalAmount || 0).toFixed(2)}`, icon: TrendingUp, accent: "text-[#00A699]" },
    { label: "This Month", sublabel: `${monthSales._count} transactions`, value: `$${(monthSales._sum.totalAmount || 0).toFixed(2)}`, icon: PieChart, accent: "text-[#222222]" },
    { label: "Inventory Value", sublabel: `${totalProducts} products`, value: `$${(totalInventory._sum.unitCost || 0).toFixed(2)}`, icon: TrendingDown, accent: "text-[#717171]" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financials</h1>
        <p className="text-[#717171] text-sm mt-1">Revenue and cost overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-[#DDDDDD] rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <c.icon className={`h-4 w-4 ${c.accent}`} />
              <span className="text-[11px] font-semibold text-[#717171] uppercase tracking-wider">{c.label}</span>
            </div>
            <div className={`text-2xl font-bold ${c.accent}`}>{c.value}</div>
            <div className="text-xs text-[#717171] mt-1">{c.sublabel}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#DDDDDD] rounded-2xl p-6">
        <h3 className="text-base font-bold mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: "/manager", label: "📊 Dashboard" },
            { href: "/inventory", label: "📦 Inventory & COGS" },
            { href: "/production", label: "📋 Par Sheets" },
            { href: "/overboards", label: "📅 Overboard Calendar" },
            { href: "/admin/users", label: "👥 Manage Team" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="p-4 rounded-xl bg-[#F7F7F7] hover:bg-[#EEEEEE] transition-colors font-semibold text-sm text-[#222222]"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}