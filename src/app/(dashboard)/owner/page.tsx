import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as { role?: string })?.role !== "OWNER") redirect("/");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

  const [todaySales, weekSales, monthSales, products, inventory] = await Promise.all([
    prisma.transaction.aggregate({ where: { createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true }),
    prisma.transaction.aggregate({ where: { createdAt: { gte: weekAgo } }, _sum: { totalAmount: true }, _count: true }),
    prisma.transaction.aggregate({ where: { createdAt: { gte: monthAgo } }, _sum: { totalAmount: true }, _count: true }),
    prisma.product.count({ where: { active: true } }),
    prisma.inventoryItem.aggregate({ _sum: { unitCost: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">Financials</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Revenue and cost overview</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today", sub: `${todaySales._count} transactions`, val: `$${(todaySales._sum.totalAmount || 0).toFixed(2)}` },
          { label: "This Week", sub: `${weekSales._count} transactions`, val: `$${(weekSales._sum.totalAmount || 0).toFixed(2)}` },
          { label: "This Month", sub: `${monthSales._count} transactions`, val: `$${(monthSales._sum.totalAmount || 0).toFixed(2)}` },
          { label: "Inventory Value", sub: `${products} products`, val: `$${(inventory._sum.unitCost || 0).toFixed(2)}` },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-lg border border-[#E5E7EB] p-5">
            <div className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">{c.label}</div>
            <div className="text-xl font-semibold text-[#111827] mt-1">{c.val}</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
        <h3 className="text-sm font-semibold text-[#111827] mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[["/manager","📊 Dashboard"],["/inventory","📦 Inventory"],["/production","📋 Par Sheets"],["/overboards","📅 Overboards"],["/admin/users","👥 Team"]].map(([href, label]) => (
            <a key={href} href={href} className="p-3 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] text-sm font-medium text-[#374151] transition-colors">{label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}