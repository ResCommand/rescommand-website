import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Coffee, Cookie, ShoppingBag, Calendar, Sparkles, Clock } from "lucide-react";

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const userId = Number((session.user as { id?: string })?.id);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [donuts, drinks, sales, hours] = await Promise.all([
    prisma.donutLog.aggregate({ where: { userId, createdAt: { gte: today } }, _sum: { sold: true } }),
    prisma.drinkLog.count({ where: { userId, createdAt: { gte: today } } }),
    prisma.transaction.aggregate({ where: { userId, createdAt: { gte: today } }, _sum: { totalAmount: true } }),
    prisma.employeeHour.findFirst({ where: { userId, clockOut: null }, orderBy: { clockIn: "desc" } }),
  ]);

  const quickLinks = [
    { href: "/entry/drinks", label: "Log Drinks", desc: "Coffee, espresso, lattes", emoji: "☕" },
    { href: "/entry/donuts", label: "Log Donuts", desc: "Made, sold, waste", emoji: "🍩" },
    { href: "/entry/sales", label: "Log Sales", desc: "Transactions & tickets", emoji: "💰" },
    { href: "/entry/dogels", label: "Log Dogels", desc: "Plain, everything, etc.", emoji: "🥯" },
    { href: "/entry/sandwiches", label: "Log Sandwiches", desc: "Bacon, sausage, etc.", emoji: "🥪" },
    { href: "/overboards", label: "Overboards", desc: "Upcoming schedule", emoji: "📅" },
    { href: "/cleaning", label: "Cleaning", desc: "Daily tasks", emoji: "✨" },
    { href: "/hours", label: "My Hours", desc: "Clock in & out", emoji: "⏰" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">Welcome back, {session.user?.name?.split(" ")[0]}!</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Donuts Sold", value: donuts._sum.sold || 0 },
          { label: "Drinks Logged", value: drinks },
          { label: "Today's Sales", value: `$${(sales._sum.totalAmount || 0).toFixed(2)}` },
          { label: "Status", value: hours ? "Clocked In" : "Clocked Out" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-[#E5E7EB] p-4">
            <div className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">{s.label}</div>
            <div className="text-xl font-semibold text-[#111827] mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Entry */}
      <div>
        <h2 className="text-base font-semibold text-[#111827] mb-3">Quick Entry</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="bg-white rounded-lg border border-[#E5E7EB] p-4 hover:shadow-sm transition-shadow group">
              <div className="text-2xl mb-2">{link.emoji}</div>
              <div className="text-sm font-medium text-[#111827] group-hover:text-[#1A56DB]">{link.label}</div>
              <div className="text-xs text-[#9CA3AF] mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}