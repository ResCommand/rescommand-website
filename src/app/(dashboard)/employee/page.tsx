import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Coffee,
  Cookie,
  ShoppingBag,
  ClipboardList,
  Calendar,
  Sparkles,
  Clock,
  TrendingUp,
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
    { href: "/entry/drinks", icon: Coffee, label: "Log Drinks", color: "bg-amber-100 text-amber-800" },
    { href: "/entry/donuts", icon: Cookie, label: "Log Donuts", color: "bg-orange-100 text-orange-800" },
    { href: "/entry/sales", icon: ShoppingBag, label: "Log Sales", color: "bg-yellow-100 text-yellow-800" },
    { href: "/entry/dogels", icon: ShoppingBag, label: "Log Dogels", color: "bg-lime-100 text-lime-800" },
    { href: "/entry/sandwiches", icon: ClipboardList, label: "Log Sandwiches", color: "bg-red-100 text-red-800" },
    { href: "/overboards", icon: Calendar, label: "Overboard Schedule", color: "bg-blue-100 text-blue-800" },
    { href: "/cleaning", icon: Sparkles, label: "Cleaning Tasks", color: "bg-teal-100 text-teal-800" },
    { href: "/hours", icon: Clock, label: "My Hours", color: "bg-purple-100 text-purple-800" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {session.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Today's quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <TrendingUp className="h-3 w-3" />
            Donuts Sold
          </div>
          <div className="text-2xl font-bold">{todayDonuts._sum.sold || 0}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Coffee className="h-3 w-3" />
            Drinks Logged
          </div>
          <div className="text-2xl font-bold">{todayDrinks}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <ShoppingBag className="h-3 w-3" />
            Today&apos;s Sales
          </div>
          <div className="text-2xl font-bold">
            ${(todaySales._sum.totalAmount || 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Clock className="h-3 w-3" />
            Clock Status
          </div>
          <div className="text-sm font-bold">
            {myHours ? "🟢 Clocked In" : "🔴 Clocked Out"}
          </div>
        </div>
      </div>

      {/* Quick entry links */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Entry</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:shadow-md transition-shadow ${link.color}`}
            >
              <link.icon className="h-6 w-6" />
              <span className="text-sm font-medium text-center">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}