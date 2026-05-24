import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const fmt = (n: number) => `$${n.toFixed(2)}`;

export default async function OwnerPage() {
  const session = await getServerSession(authOptions);
  const [transactions, products, inventory] = await Promise.all([
    prisma.transaction.findMany({ where: { createdAt: { gte: new Date(new Date().toISOString().split('T')[0]) } } }),
    prisma.product.count(),
    prisma.inventoryItem.findMany(),
  ]);

  const todayRevenue = transactions.reduce((s, t) => s + t.totalAmount, 0);
  const txCount = transactions.length;
  const invValue = inventory.reduce((s, i) => s + (i.unitCost || 0) * (i.currentStock || 0), 0);

  // Overboard revenue
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const overboardSchedules = await prisma.overboardSchedule.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    include: { lines: true },
  });
  let overboardRevenue = 0, upchargeRevenue = 0;
  overboardSchedules.forEach(s => {
    s.lines.forEach(l => {
      overboardRevenue += l.quantitySold * l.unitPrice;
      upchargeRevenue += l.upchargesSold * l.upchargePrice;
    });
  });

  const cards = [
    { label: "Today's Revenue", value: fmt(todayRevenue), sub: `${txCount} transactions` },
    { label: "Overboard Revenue", value: fmt(overboardRevenue), sub: "From overboard sales" },
    { label: "Upcharge Revenue", value: fmt(upchargeRevenue), sub: "From upcharges" },
    { label: "Inventory Value", value: fmt(invValue), sub: `${products} products` },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Financials</h1>
        <p className="text-sm text-gray">Revenue and cost overview</p>
      </div>
      <div className="grid-4">
        {cards.map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-label" style={{ marginBottom: 4 }}>{c.label}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}