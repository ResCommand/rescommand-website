"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  CheckSquare,
  Calendar,
  Target,
  DollarSign,
  BarChart3,
  Building2,
  Users,
  MessageSquare,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

/* ── Module keys (must match backend module-config) ── */
const ALL_MODULE_KEYS = [
  "dashboard",
  "inventory",
  "recipes",
  "parSheets",
  "schedule",
  "production",
  "laborCost",
  "overboards",
  "roasting",
  "social",
  "sops",
  "admin",
  "billing",
  "signup",
  "notifications",
] as const;

type ModuleKey = (typeof ALL_MODULE_KEYS)[number];

/* ── Nav items with emoji + Lucide fallback ── */
const allNav: {
  href: string;
  emoji: string;
  icon: React.ElementType;
  label: string;
  section: string;
  roles: string[];
  moduleKey: ModuleKey;
}[] = [
  { href: "/dashboard", emoji: "📊", icon: LayoutDashboard, label: "Dashboard", section: "Main", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "dashboard" },
  { href: "/inventory", emoji: "📦", icon: Package, label: "Inventory", section: "Main", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "inventory" },
  { href: "/recipes", emoji: "📋", icon: ClipboardList, label: "Recipes", section: "Main", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "recipes" },
  { href: "/par-sheets", emoji: "✅", icon: CheckSquare, label: "Par Sheets", section: "Main", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "parSheets" },
  { href: "/schedule", emoji: "📅", icon: Calendar, label: "Schedule", section: "Main", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "schedule" },
  { href: "/production", emoji: "🎯", icon: Target, label: "Production", section: "Main", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "production" },
  { href: "/labor-cost", emoji: "💰", icon: DollarSign, label: "Labor Costs", section: "Insights", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "laborCost" },
  { href: "/overboards", emoji: "📈", icon: BarChart3, label: "Overboards", section: "Insights", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "overboards" },
  { href: "/roasting", emoji: "☕", icon: BarChart3, label: "Roasting", section: "Insights", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "roasting" },
  { href: "/social", emoji: "💬", icon: MessageSquare, label: "Messages", section: "Team", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "social" },
  { href: "/sops", emoji: "🎓", icon: GraduationCap, label: "Training", section: "Team", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "sops" },
  { href: "/admin", emoji: "⚙️", icon: Settings, label: "Admin", section: "Admin", roles: ["OWNER", "PLATFORM_ADMIN"], moduleKey: "admin" },
  { href: "/billing", emoji: "💳", icon: DollarSign, label: "Billing", section: "Admin", roles: ["OWNER", "PLATFORM_ADMIN"], moduleKey: "billing" },
];

const PLATFORM_NAME = "ResCommand";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brandName, setBrandName] = useState(PLATFORM_NAME);
  const [enabledModules, setEnabledModules] = useState<Set<ModuleKey>>(new Set(ALL_MODULE_KEYS));
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Fetch branding */
  useEffect(() => {
    fetch("/api/tenants/branding")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.name) setBrandName(d.name); })
      .catch(() => {});
  }, []);

  /* Fetch module config — default to ALL enabled */
  useEffect(() => {
    fetch("/api/module-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!Array.isArray(d) || d.length === 0) return; // keep defaults
        // Build a set of disabled module keys from the API.
        // Only hide a nav item if the API explicitly says it's disabled.
        const disabledKeys = new Set<string>();
        for (const c of d) {
          const key = c.moduleKey || c.key || "";
          if (key && c.enabled === false) disabledKeys.add(key);
        }
        // Start from ALL keys, remove only explicitly disabled ones
        const activeKeys = ALL_MODULE_KEYS.filter((k) => !disabledKeys.has(k));
        setEnabledModules(new Set(activeKeys as readonly ModuleKey[]));
      })
      .catch(() => {}); // keep defaults on error
  }, []);

  const role = session?.user?.role as string | undefined;
  const filteredNav = allNav.filter(
    (n) => (!role || n.roles.includes(role)) && enabledModules.has(n.moduleKey)
  );

  /* Group nav by section */
  const sections = filteredNav.reduce<Record<string, typeof filteredNav>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <h2>{brandName}</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "#7C3AED",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2>{brandName}</h2>
              <span className="sidebar-brand-sub">by {PLATFORM_NAME}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} style={{ marginBottom: 8 }}>
              <div style={{
                padding: "8px 12px 4px",
                fontSize: 11, fontWeight: 600, color: "#A78BFA",
                textTransform: "uppercase" as const, letterSpacing: "0.05em",
              }}>
                {section}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "active" : ""}
                    onClick={() => setSidebarOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{item.emoji}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{session?.user?.name || "..."}</div>
            <div className="sidebar-user-role">{role?.replace("_", " ").toLowerCase() || "..."}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            style={{ color: "#7C6FA8", padding: 4, marginLeft: "auto" }}
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Powered by */}
        <div className="sidebar-poweredby">
          <span>⚡ Powered by {PLATFORM_NAME}</span>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <div className="page-container">{children}</div>
        <div className="app-footer">© {new Date().getFullYear()} {PLATFORM_NAME}</div>
      </div>
    </div>
  );
}
