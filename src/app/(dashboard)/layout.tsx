"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Package, ClipboardList, Calendar, Sparkles,
  Clock, Users, DollarSign, Menu, LogOut, QrCode, BookOpen,
} from "lucide-react";

const allNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["EMPLOYEE", "MANAGER", "OWNER"] },
  { href: "/owner", icon: DollarSign, label: "Financials", roles: ["OWNER"] },
  { href: "/inventory", icon: Package, label: "Inventory", roles: ["MANAGER", "OWNER"] },
  { href: "/production", icon: ClipboardList, label: "Par Sheets", roles: ["MANAGER", "OWNER"] },
  { href: "/overboards", icon: Calendar, label: "Overboards", roles: ["EMPLOYEE", "MANAGER", "OWNER"] },
  { href: "/sops", icon: BookOpen, label: "SOPs", roles: ["EMPLOYEE", "MANAGER", "OWNER"] },
  { href: "/cleaning", icon: Sparkles, label: "Cleaning", roles: ["EMPLOYEE", "MANAGER", "OWNER"] },
  { href: "/hours", icon: Clock, label: "Hours", roles: ["EMPLOYEE", "MANAGER", "OWNER"] },
  { href: "/admin/users", icon: Users, label: "Team", roles: ["MANAGER", "OWNER"] },
  { href: "/qr-sign", icon: QrCode, label: "QR Sign", roles: ["MANAGER", "OWNER"] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const nav = allNav.filter(n => n.roles.includes(role));
  const initials = session?.user?.name?.split(" ").map(w => w[0]).join("") || "?";

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
        <h2>Duffers OS</h2>
        <button onClick={() => signOut({ callbackUrl: "/login" })}><LogOut size={18} /></button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <nav className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-brand">
          <h2>Duffers OS</h2>
          <span>Operations</span>
        </div>
        <div className="sidebar-nav">
          {nav.map(n => {
            const Icon = n.icon;
            const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href + "/"));
            return (
              <a
                key={n.href}
                href={n.href}
                className={active ? "active" : ""}
                onClick={() => { router.push(n.href); setSidebarOpen(false); }}
              >
                <Icon size={18} />
                {n.label}
              </a>
            );
          })}
        </div>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{session?.user?.name || "User"}</div>
            <div className="sidebar-user-role">{role.toLowerCase()}</div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-icon" title="Sign out">
            <LogOut size={16} style={{ color: "#6B7280" }} />
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="main-content">
        <div className="page-container">{children}</div>
      </main>
    </div>
  );
}