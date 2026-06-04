"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard, Package, ClipboardList, Calendar, Sparkles,
  Users, DollarSign, Menu, LogOut, QrCode, BookOpen, Coffee,
  ShoppingCart, ChefHat, Bell, CalendarClock, Settings, Thermometer,
  Megaphone,
} from "lucide-react";

const PLATFORM_NAME = "ResCommand";

const allNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "dashboard" },
  { href: "/espresso-dial", icon: Coffee, label: "Espresso Dial", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "espresso" },
  { href: "/owner", icon: DollarSign, label: "Financials", roles: ["OWNER"], moduleKey: "owner" },
  { href: "/inventory", icon: Package, label: "Inventory", roles: ["MANAGER", "OWNER"], moduleKey: "inventory" },
  { href: "/inventory/order-requests", icon: ShoppingCart, label: "Order Requests", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "inventory" },
  { href: "/recipes", icon: ChefHat, label: "Recipes", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "recipes" },
  { href: "/production", icon: ClipboardList, label: "Par Sheets", roles: ["MANAGER", "OWNER"], moduleKey: "production" },
  { href: "/schedule", icon: CalendarClock, label: "Schedule", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "schedule" },
  { href: "/overboards", icon: Calendar, label: "Menu Planning", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "overboards" },
  { href: "/sops", icon: BookOpen, label: "SOPs", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "sops" },
  { href: "/cleaning", icon: Sparkles, label: "Cleaning", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "operations" },
  { href: "/roasting", icon: Thermometer, label: "Roasting", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "roasting" },
  { href: "/social", icon: Megaphone, label: "Social Media", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "social" },
  { href: "/notifications", icon: Bell, label: "Notifications", roles: ["EMPLOYEE", "MANAGER", "OWNER"], moduleKey: "notifications" },
  { href: "/admin/users", icon: Users, label: "Admin", roles: ["MANAGER", "OWNER"], moduleKey: "settings" },
  { href: "/qr-sign", icon: QrCode, label: "QR Sign", roles: ["MANAGER", "OWNER"], moduleKey: "operations" },
  
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set());
  const [brandName, setBrandName] = useState<string>("");

  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";

  // Fetch branding on mount
  useEffect(() => {
    fetch("/api/tenants/branding")
      .then(r => r.json())
      .then(data => { if (data.brandName) setBrandName(data.brandName); })
      .catch(() => {});
  }, []);

  // Fetch enabled modules on mount
  useEffect(() => {
    fetch("/api/module-config")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEnabledModules(new Set(data.filter((c: { enabled: boolean; moduleKey: string }) => c.enabled).map((c: { moduleKey: string }) => c.moduleKey)));
        }
      })
      .catch(() => {
        // If fetch fails, show all modules
        setEnabledModules(new Set(allNav.map(n => n.moduleKey)));
      });
  }, []);

  // Filter by role AND enabled modules
  const nav = allNav.filter(n => {
    if (!n.roles.includes(role)) return false;
    // Always show items that don't have a moduleKey or whose module is enabled
    if (!n.moduleKey) return true;
    return enabledModules.has(n.moduleKey);
  });

  const initials = session?.user?.name?.split(" ").map(w => w[0]).join("") || "?";

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
        <h2>{brandName}</h2>
        <button onClick={() => signOut({ callbackUrl: "/login" })}><LogOut size={18} /></button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <nav className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-brand">
          <h2>{brandName}</h2>
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
        <div className="sidebar-poweredby">
          <span>Powered by {PLATFORM_NAME}</span>
        </div>
      </nav>

      {/* Main */}
      <main className="main-content">
        <div className="page-container">{children}</div>
        <footer className="app-footer">
          <span>{brandName} &middot; Powered by {PLATFORM_NAME}</span>
        </footer>
      </main>
    </div>
  );
}