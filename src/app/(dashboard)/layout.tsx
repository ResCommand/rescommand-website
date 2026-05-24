"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  BarChart3, Package, ClipboardList, Calendar, Sparkles, Clock,
  Users, DollarSign, Home, Menu, X, LogOut,
} from "lucide-react";
import { useState } from "react";

function NavItem({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
        active
          ? "bg-foreground text-white"
          : "text-foreground hover:bg-[#F7F7F7]"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function DashboardNav() {
  const { data: session } = useSession();
  const role = session?.user?.role as string;
  const [mobileOpen, setMobileOpen] = useState(false);

  const employeeNav = [
    { href: "/employee", icon: Home, label: "Home" },
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
    { href: "/admin/users", icon: Users, label: "Team" },
  ];

  const ownerNav = [
    { href: "/owner", icon: DollarSign, label: "Financials" },
    { href: "/manager", icon: BarChart3, label: "Dashboard" },
    { href: "/inventory", icon: Package, label: "Inventory" },
    { href: "/production", icon: ClipboardList, label: "Par Sheets" },
    { href: "/overboards", icon: Calendar, label: "Overboards" },
    { href: "/cleaning", icon: Sparkles, label: "Cleaning" },
    { href: "/hours", icon: Clock, label: "Hours" },
    { href: "/admin/users", icon: Users, label: "Team" },
  ];

  const navItems = role === "OWNER" ? ownerNav : role === "MANAGER" ? managerNav : employeeNav;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#DDDDDD]">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍩</span>
            <span className="text-lg font-bold text-[#FF385C] tracking-tight">Duffers OS</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-full hover:bg-[#F7F7F7] transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed top-16 left-0 right-0 bottom-0 z-40 bg-white p-5 overflow-y-auto">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavItem key={item.href} {...item} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-[#DDDDDD] space-y-1">
              <Link
                href="/qr-sign"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-foreground hover:bg-[#F7F7F7] transition-colors"
              >
                📱 QR Sign
              </Link>
              <div className="px-3 py-3 mt-2">
                <div className="text-sm font-semibold">{session?.user?.name}</div>
                <div className="text-xs text-[#717171] mt-0.5">{role?.toLowerCase()}</div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-[#C13515] hover:bg-[#FFF0F0] transition-colors w-full"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-[260px] md:flex-col md:fixed md:inset-y-0 bg-white border-r border-[#DDDDDD]">
        <div className="p-6 pb-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-3xl">🍩</span>
            <div>
              <div className="text-lg font-bold text-[#FF385C] tracking-tight leading-none">Duffers OS</div>
              <div className="text-[11px] text-[#717171] font-medium mt-0.5 tracking-wide uppercase">Operations</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
        <div className="p-3 border-t border-[#DDDDDD] space-y-0.5">
          <Link
            href="/qr-sign"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-foreground hover:bg-[#F7F7F7] transition-colors"
          >
            📱 <span>QR Sign</span>
          </Link>
          <div className="px-3 py-3">
            <div className="text-sm font-semibold">{session?.user?.name}</div>
            <div className="text-xs text-[#717171] mt-0.5 capitalize">{role?.toLowerCase()}</div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium text-[#C13515] hover:bg-[#FFF0F0] transition-colors w-full"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardNav />
      <div className="md:pl-[260px] min-h-screen bg-white">
        <div className="pt-16 md:pt-0">
          <div className="px-5 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">
            {children}
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}