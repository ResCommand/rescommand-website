import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OwnerPage() {
  const session = await getServerSession(authOptions);
  const [sales, products, inventory] = await Promise.all([
    prisma.transaction.findMany({ where: { createdAt: { gte: new Date(new Date().toISOString().split('T')[0]) } } }),
    prisma.product.count(),
    prisma.inventoryItem.findMany(),
  ]);

  const revenue = sales.reduce((s, d) => s + d.totalAmount, 0);
  const txCount = sales.length;
  const invValue = inventory.reduce((s, i) => s + (i.unitCost || 0) * (i.currentStock || 0), 0);

  const cards = [
    { label: "Today", value: `$${revenue.toFixed(2)}`, sub: `${txCount} transactions` },
    { label: "This Week", value: `$${revenue.toFixed(2)}`, sub: `${txCount} transactions` },
    { label: "This Month", value: `$${revenue.toFixed(2)}`, sub: `${txCount} transactions` },
    { label: "Inventory Value", value: `$${invValue.toFixed(2)}`, sub: `${products} products` },
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