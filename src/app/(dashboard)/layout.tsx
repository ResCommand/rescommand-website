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
  Megaphone,
  ChevronDown,
  ChevronRight,
  Sandwich,
  Coffee,
  Pizza,
  Beaker,
} from "lucide-react";

/* ── Module keys (must match backend module-config) ── */
const ALL_MODULE_KEYS = [
  "dashboard",
  "inventory",
  "recipes",
  "schedule",
  "production",
  "parSheets",
  "roasting",
  "sandwiches",
  "laborCost",
  "overboards",
  "social",
  "sops",
  "marketing",
  "admin",
  "billing",
  "signup",
  "notifications",
] as const;

type ModuleKey = (typeof ALL_MODULE_KEYS)[number];

/* ── Nav items — supports nested children for sub-pages ── */
interface NavItem {
  href: string;
  emoji: string;
  icon: React.ElementType;
  label: string;
  section: string;
  roles: string[];
  moduleKey: ModuleKey;
  children?: NavItem[];
  isCategory?: boolean; // true = expandable section header, not a page
}

const allNav: NavItem[] = [
  // ── Main ──
  { href: "/dashboard", emoji: "📊", icon: LayoutDashboard, label: "Dashboard", section: "Main", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "dashboard" },
  { href: "/inventory", emoji: "📦", icon: Package, label: "Inventory", section: "Main", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "inventory" },
  { href: "/recipes", emoji: "📋", icon: ClipboardList, label: "Recipes", section: "Main", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "recipes" },
  { href: "/schedule", emoji: "📅", icon: Calendar, label: "Schedule", section: "Main", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "schedule" },

  // ── Production (expandable section) ──
  {
    href: "/production", emoji: "🎯", icon: Target, label: "Production", section: "Production",
    roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "production",
    isCategory: true,
    children: [
      { href: "/production", emoji: "🍩", icon: Target, label: "Donut Production", section: "Production", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "production" },
      { href: "/production/prep", emoji: "🧪", icon: Beaker, label: "Prep List", section: "Production", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "production" },
      { href: "/par-sheets", emoji: "✅", icon: CheckSquare, label: "Par Sheets", section: "Production", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "parSheets" },
      { href: "/roasting", emoji: "☕", icon: Coffee, label: "Coffee Roasting", section: "Production", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "roasting" },
      { href: "/entry/sandwiches", emoji: "🥪", icon: Sandwich, label: "Sandwiches & Bagels", section: "Production", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "sandwiches" },
    ],
  },

  // ── Insights ──
  { href: "/labor-cost", emoji: "💰", icon: DollarSign, label: "Labor Costs", section: "Insights", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "laborCost" },
  { href: "/overboards", emoji: "📈", icon: BarChart3, label: "Overboards", section: "Insights", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "overboards" },

  // ── Team ──
  { href: "/sops", emoji: "🎓", icon: GraduationCap, label: "Training / SOPs", section: "Team", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "sops" },
  { href: "/social", emoji: "💬", icon: MessageSquare, label: "Messages", section: "Team", roles: ["EMPLOYEE", "MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "social" },
  { href: "/marketing", emoji: "📣", icon: Megaphone, label: "Marketing", section: "Team", roles: ["MANAGER", "OWNER", "PLATFORM_ADMIN"], moduleKey: "marketing" },

  // ── Admin ──
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Production"]));
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
        const disabledKeys = new Set<string>();
        for (const c of d) {
          const key = c.moduleKey || c.key || "";
          if (key && c.enabled === false) disabledKeys.add(key);
        }
        const activeKeys = ALL_MODULE_KEYS.filter((k) => !disabledKeys.has(k));
        setEnabledModules(new Set(activeKeys as readonly ModuleKey[]));
      })
      .catch(() => {});
  }, []);

  const role = session?.user?.role as string | undefined;

  /* Filter nav by role AND enabledModules — including children */
  const filterNav = (items: NavItem[]): NavItem[] =>
    items
      .filter((n) => (!role || n.roles.includes(role)) && enabledModules.has(n.moduleKey))
      .map((n) => n.children ? { ...n, children: filterNav(n.children) } : n)
      .filter((n) => !n.isCategory || (n.children && n.children.length > 0)); // hide empty categories

  const filteredNav = filterNav(allNav);

  /* Group nav by section */
  const sections = filteredNav.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section); else next.add(section);
      return next;
    });
  };

  // Auto-expand section containing the active path
  useEffect(() => {
    for (const item of filteredNav) {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (c) => pathname === c.href || pathname.startsWith(c.href + "/")
        );
        if (hasActiveChild) {
          setExpandedSections((prev) => new Set([...prev, item.section]));
        }
      }
    }
  }, [pathname]);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

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

                // Expandable category (e.g., Production)
                if (item.isCategory && item.children && item.children.length > 0) {
                  const expanded = expandedSections.has(item.section);
                  const childActive = item.children.some((c) => isActive(c.href));
                  return (
                    <div key={item.href}>
                      <button
                        onClick={() => toggleSection(item.section)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 12px", borderRadius: 8, width: "100%",
                          fontSize: 13.5, fontWeight: 600,
                          color: childActive ? "#fff" : "#C4B5FD",
                          background: childActive ? "rgba(124, 58, 237, 0.15)" : "transparent",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span style={{ fontSize: 16, lineHeight: 1 }}>{item.emoji}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      {expanded && (
                        <div style={{ paddingLeft: 22, marginTop: 2 }}>
                          {item.children.map((child) => {
                            const active = isActive(child.href);
                            return (
                              <Link
                                key={child.href + child.label}
                                href={child.href}
                                className={active ? "active" : ""}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 8,
                                  padding: "7px 12px", borderRadius: 8,
                                  fontSize: 13, fontWeight: active ? 600 : 500,
                                  color: active ? "#fff" : "#C4B5FD",
                                }}
                              >
                                <span style={{ fontSize: 14, lineHeight: 1 }}>{child.emoji}</span>
                                <span>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular nav item
                const active = isActive(item.href);
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
