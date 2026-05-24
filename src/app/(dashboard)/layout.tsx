"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  BarChart3, Package, ClipboardList, Calendar, Sparkles, Clock,
  Users, DollarSign, Home, Menu, X, LogOut, ChevronDown,
} from "lucide-react";
import { useState } from "react";

function NavItem({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[#EFF6FF] text-[#1A56DB]"
          : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]"
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🍩</span>
            <span className="text-base font-semibold text-[#111827]">Duffers OS</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-[#F3F4F6]">
            {mobileOpen ? <X className="h-5 w-5 text-[#374151]" /> : <Menu className="h-5 w-5 text-[#374151]" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed top-14 left-0 right-0 bottom-0 z-40 bg-white p-4 overflow-y-auto">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavItem key={item.href} {...item} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-[#111827]">{session?.user?.name}</div>
                <div className="text-xs text-[#6B7280] capitalize">{role?.toLowerCase()}</div>
              </div>
              <Link href="/qr-sign" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB]">
                📱 QR Sign
              </Link>
              <button onClick={() => signOut()}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2] w-full">
                <LogOut className="h-[18px] w-[18px]" /> Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-[240px] md:flex-col md:fixed md:inset-y-0 bg-white border-r border-[#E5E7EB]">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[#E5E7EB]">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🍩</span>
            <div>
              <div className="text-base font-semibold text-[#111827] leading-none">Duffers OS</div>
              <div className="text-[10px] text-[#9CA3AF] font-medium mt-0.5 uppercase tracking-widest">Operations</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E7EB] space-y-1">
          <Link href="/qr-sign"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB]">
            📱 <span>QR Sign</span>
          </Link>
          <div className="px-3 py-2.5 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#111827]">{session?.user?.name}</div>
              <div className="text-xs text-[#9CA3AF] capitalize">{role?.toLowerCase()}</div>
            </div>
            <button onClick={() => signOut()} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2]">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardNav />
      <div className="md:pl-[240px] min-h-screen bg-[#F9FAFB]">
        <div className="pt-14 md:pt-0">
          <div className="px-5 md:px-8 py-6 md:py-8 max-w-[1100px] mx-auto">
            {children}
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}