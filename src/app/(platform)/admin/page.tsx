"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2, Users, CreditCard, Settings, Eye, Ban, Check, AlertTriangle,
  DollarSign, TrendingUp, BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface TenantItem {
  id: number; name: string; slug: string; domain: string | null;
  businessType: string; plan: string; active: boolean;
  stripeCustomerId: string | null; createdAt: string;
  _count: { members: number };
  subscription: { status: string } | null;
}

const PLAN_COLORS: Record<string, string> = {
  FREE: "#9CA3AF", STARTER: "#3B82F6", PROFESSIONAL: "#8B5CF6", ENTERPRISE: "#F59E0B",
};
const TYPE_ICONS: Record<string, string> = {
  DONUT_SHOP: "🍩", BAKERY: "🥖", CAFE: "☕", RESTAURANT: "🍽️", BAR: "🍺", FOOD_TRUCK: "🚚",
};
const PLAN_PRICES: Record<string, number> = {
  FREE: 0, STARTER: 49, PROFESSIONAL: 99, ENTERPRISE: 199,
};

export default function PlatformAdminPage() {
  const { data: session } = useSession();
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tenants" | "billing" | "settings">("tenants");

  useEffect(() => {
    fetch("/api/tenants").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setTenants(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activeTenants = tenants.filter(t => t.active);
  const totalMRR = activeTenants.reduce((sum, t) => sum + (PLAN_PRICES[t.plan] || 0), 0);
  const totalMembers = activeTenants.reduce((sum, t) => sum + (t._count?.members || 0), 0);

  const toggleActive = async (id: number, active: boolean) => {
    // This would call a platform admin API — for now just UI placeholder
    toast.info(`${active ? "Activated" : "Suspended"} tenant`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#E2E8F0" }}>
      {/* Header */}
      <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "16px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC" }}>
              <Building2 size={20} style={{ display: "inline", marginRight: 8 }} />
              ResCommand <span style={{ color: "#64748B", fontWeight: 400 }}>Platform</span>
            </h1>
            <p style={{ fontSize: 12, color: "#94A3B8" }}>Venturio LLC — Restaurant Operations Platform</p>
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>
            {session?.user?.email}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          <div style={{ background: "#1E293B", padding: 20, borderRadius: 8, border: "1px solid #334155" }}>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>Active Tenants</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{activeTenants.length}</div>
          </div>
          <div style={{ background: "#1E293B", padding: 20, borderRadius: 8, border: "1px solid #334155" }}>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>Monthly Recurring Revenue</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#059669" }}>${totalMRR.toLocaleString()}</div>
          </div>
          <div style={{ background: "#1E293B", padding: 20, borderRadius: 8, border: "1px solid #334155" }}>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>Total Staff Managed</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{totalMembers}</div>
          </div>
          <div style={{ background: "#1E293B", padding: 20, borderRadius: 8, border: "1px solid #334155" }}>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>Suspended</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: tenants.filter(t => !t.active).length > 0 ? "#DC2626" : "#475569" }}>
              {tenants.filter(t => !t.active).length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {(["tenants", "billing", "settings"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                background: activeTab === tab ? "#3B82F6" : "#1E293B",
                color: activeTab === tab ? "#fff" : "#94A3B8",
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab === "tenants" ? <Building2 size={14} /> : tab === "billing" ? <CreditCard size={14} /> : <Settings size={14} />}
              {" "}{tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tenants Tab */}
        {activeTab === "tenants" && (
          <div style={{ background: "#1E293B", borderRadius: 8, border: "1px solid #334155", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: "#94A3B8" }}>Business</th>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: "#94A3B8" }}>Type</th>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: "#94A3B8" }}>Plan</th>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: "#94A3B8" }}>Staff</th>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: "#94A3B8" }}>MRR</th>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: "#94A3B8" }}>Status</th>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: "#94A3B8" }}>Created</th>
                  <th style={{ padding: 12, textAlign: "right", fontSize: 12, color: "#94A3B8" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #334155", opacity: t.active ? 1 : 0.5 }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{t.slug}.rescommand.com</div>
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      {TYPE_ICONS[t.businessType] || "🏪"} {t.businessType.replace("_", " ")}
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${PLAN_COLORS[t.plan]}20`, color: PLAN_COLORS[t.plan] }}>
                        {t.plan}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>{t._count?.members || 0}</td>
                    <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: "#059669" }}>${PLAN_PRICES[t.plan] || 0}/mo</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: t.active ? "#05966920" : "#DC262620", color: t.active ? "#059669" : "#DC2626" }}>
                        {t.active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 12, color: "#64748B" }}>
                      {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: 12, textAlign: "right" }}>
                      <button onClick={() => toast.info("Impersonate coming soon")} style={{ background: "none", border: "none", cursor: "pointer", color: "#3B82F6", padding: 4 }} title="View as tenant">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => toggleActive(t.id, !t.active)} style={{ background: "none", border: "none", cursor: "pointer", color: t.active ? "#DC2626" : "#059669", padding: 4 }} title={t.active ? "Suspend" : "Activate"}>
                        {t.active ? <Ban size={14} /> : <Check size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tenants.length === 0 && (
              <div style={{ padding: 48, textAlign: "center", color: "#64748B" }}>No tenants yet. Share the signup link to get started!</div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div style={{ background: "#1E293B", borderRadius: 8, border: "1px solid #334155", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Stripe Integration</h3>
            <div style={{ padding: 24, background: "#334155", borderRadius: 8, textAlign: "center" }}>
              <CreditCard size={32} style={{ color: "#64748B", marginBottom: 12 }} />
              <p style={{ color: "#94A3B8", fontSize: 14 }}>Stripe integration will be configured in Phase 3.</p>
              <p style={{ color: "#64748B", fontSize: 12, marginTop: 8 }}>Current MRR is calculated from tenant plan assignments.</p>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, margin: "24px 0 16px" }}>Pricing Tiers</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {Object.entries(PLAN_PRICES).map(([plan, price]) => (
                <div key={plan} style={{ padding: 16, background: "#334155", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: PLAN_COLORS[plan] }}>{plan}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, margin: "8px 0" }}>${price}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>/month</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div style={{ background: "#1E293B", borderRadius: 8, border: "1px solid #334155", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Platform Settings</h3>
            <div style={{ padding: 24, background: "#334155", borderRadius: 8, textAlign: "center" }}>
              <Settings size={32} style={{ color: "#64748B", marginBottom: 12 }} />
              <p style={{ color: "#94A3B8", fontSize: 14 }}>Platform-wide settings coming soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}