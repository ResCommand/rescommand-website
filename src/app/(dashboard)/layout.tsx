"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  Coffee,
  Cookie,
  ShoppingBag,
  ClipboardList,
  BarChart3,
  Package,
  Calendar,
  Sparkles,
  Clock,
  Wrench,
  Home,
  Menu,
  X,
  LogOut,
  DollarSign,
  Users,
} from "lucide-react";
import { useState } from "react";

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function DashboardNav() {
  const { data: session } = useSession();
  const role = session?.user?.role as string;
  const [mobileOpen, setMobileOpen] = useState(false);

  const employeeNav = [
    { href: "/employee", icon: Home, label: "Dashboard" },
    { href: "/overboards", icon: Calendar, label: "Overboards" },
    { href: "/cleaning", icon: Sparkles, label: "Cleaning" },
    { href: "/hours", icon: Clock, label: "My Hours" },
  ];

  const managerNav = [
    { href: "/manager", icon: BarChart3, label: "Dashboard" },
    { href: "/inventory", icon: Package, label: "Inventory" },
    { href: "/production", icon: ClipboardList, label: "Par Sheets" },
    { href: "/overboards", icon: Calendar, label: "Overboards" },
    { href: "/cleaning", icon: Sparkles, label: "Cleaning" },
    { href: "/hours", icon: Clock, label: "Hours" },
  ];

  const ownerNav = [
    { href: "/owner", icon: DollarSign, label: "Financials" },
    { href: "/manager", icon: BarChart3, label: "Dashboard" },
    { href: "/inventory", icon: Package, label: "Inventory" },
    { href: "/production", icon: ClipboardList, label: "Par Sheets" },
    { href: "/overboards", icon: Calendar, label: "Overboards" },
    { href: "/cleaning", icon: Sparkles, label: "Cleaning" },
    { href: "/hours", icon: Clock, label: "Hours" },
    { href: "/admin/users", icon: Users, label: "Users" },
  ];

  const navItems =
    role === "OWNER" ? ownerNav : role === "MANAGER" ? managerNav : employeeNav;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-3 bg-card border-b border-border sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🍩</span>
          <span className="font-bold text-primary">Duffera Ops</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-accent"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-card/95 backdrop-blur-sm p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
          <hr className="my-2 border-border" />
          <Link
            href="/qr-sign"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent"
          >
            <Coffee className="h-4 w-4" />
            <span>QR Sign</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-accent w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍩</span>
            <div>
              <div className="font-bold text-primary text-sm">Duffera Donuts</div>
              <div className="text-xs text-muted-foreground">Operations</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/qr-sign"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent"
          >
            <Coffee className="h-4 w-4" />
            <span>QR Sign</span>
          </Link>
          <div className="px-3 py-2 text-xs text-muted-foreground">
            {session?.user?.name} • {role}
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-accent w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:pl-56 min-h-screen">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">{/* children rendered by layout */}</div>
      </main>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardNav />
      <div className="md:pl-56">
        <div className="p-4 md:p-6 max-w-7xl mx-auto pt-16 md:pt-6">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}