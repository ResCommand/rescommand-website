import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Coffee, Cookie, ShoppingBag, Calendar, Sparkles, Clock,
} from "lucide-react";

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = Number((session.user as { id?: string })?.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayDonuts, todayDrinks, todaySales, myHours] = await Promise.all([
    prisma.donutLog.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { sold: true, made: true },
    }),
    prisma.drinkLog.count({
      where: { userId, createdAt: { gte: today } },
    }),
    prisma.transaction.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { totalAmount: true },
    }),
    prisma.employeeHour.findFirst({
      where: { userId, clockOut: null },
      orderBy: { clockIn: "desc" },
    }),
  ]);

  const quickLinks = [
    { href: "/entry/drinks", icon: Coffee, label: "Log Drinks", emoji: "☕", color: "bg-[#FFF8F0] hover:bg-[#FFF0E0]" },
    { href: "/entry/donuts", icon: Cookie, label: "Log Donuts", emoji: "🍩", color: "bg-[#FFF0F5] hover:bg-[#FFE5ED]" },
    { href: "/entry/sales", icon: ShoppingBag, label: "Log Sales", emoji: "💰", color: "bg-[#F0FFF4] hover:bg-[#E0FFE8]" },
    { href: "/entry/dogels", icon: ShoppingBag, label: "Log Dogels", emoji: "🥯", color: "bg-[#FFFFF0] hover:bg-[#FFFFE0]" },
    { href: "/entry/sandwiches", icon: ShoppingBag, label: "Log Sandwiches", emoji: "🥪", color: "bg-[#FFF0F0] hover:bg-[#FFE0E0]" },
    { href: "/overboards", icon: Calendar, label: "Overboards", emoji: "📅", color: "bg-[#F0F8FF] hover:bg-[#E0F0FF]" },
    { href: "/cleaning", icon: Sparkles, label: "Cleaning", emoji: "✨", color: "bg-[#F5FFF5] hover:bg-[#EAFFEA]" },
    { href: "/hours", icon: Clock, label: "My Hours", emoji: "⏰", color: "bg-[#F8F0FF] hover:bg-[#F0E8FF]" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-[#717171] text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Donuts Sold", value: todayDonuts._sum.sold || 0, accent: "text-[#FF385C]" },
          { label: "Drinks Logged", value: todayDrinks, accent: "text-[#00A699]" },
          { label: "Today's Sales", value: `$${(todaySales._sum.totalAmount || 0).toFixed(2)}`, accent: "text-[#222222]" },
          { label: "Clock Status", value: myHours ? "Clocked In" : "Clocked Out", accent: myHours ? "text-[#00A699]" : "text-[#717171]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
            <div className="text-xs font-semibold text-[#717171] uppercase tracking-wider mb-2">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.accent}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Entry */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Entry</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-[#DDDDDD] transition-all hover:shadow-md ${link.color}`}
            >
              <span className="text-2xl">{link.emoji}</span>
              <span className="text-sm font-semibold text-center text-[#222222]">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}