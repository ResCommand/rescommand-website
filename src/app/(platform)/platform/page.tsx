"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Building2, Users, CreditCard, Settings, Eye, Ban, Check, AlertTriangle,
  TrendingUp, DollarSign, BarChart3, Search, ChevronRight, X, Save,
  ExternalLink, Clock, Shield,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────

interface TenantItem {
  id: number; name: string; slug: string; domain: string | null;
  businessType: string; plan: string; active: boolean;
  stripeCustomerId: string | null; trialEndsAt: string | null; createdAt: string;
  members: number; subscriptionStatus: string | null;
}

interface PlanItem {
  id: number; planKey: string; name: string; price: number;
  staffLimit: number | null; features: string | null; active: boolean;
  sortOrder: number; stripePriceId: string | null;
}

interface DashboardData {
  totalTenants: number; activeTenants: number; suspendedTenants: number;
  totalMRR: number; totalARR: number; totalMembers: number;
  recentSignups: number; trialTenants: number;
  planDistribution: Record<string, number>;
  tenants: TenantItem[];
  plans: PlanItem[];
}

// ─── Constants ────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  DONUT_SHOP: "🍩", BAKERY: "🥖", CAFE: "☕", RESTAURANT: "🍽️", BAR: "🍺", FOOD_TRUCK: "🚚",
};

const PLAN_COLORS: Record<string, string> = {
  FREE: "#6B7280", STARTER: "#3B82F6", PROFESSIONAL: "#8B5CF6", ENTERPRISE: "#F59E0B",
};

const TYPE_OPTIONS = ["DONUT_SHOP", "BAKERY", "CAFE", "RESTAURANT", "BAR", "FOOD_TRUCK"];
const PLAN_OPTIONS = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];

// ─── Component ────────────────────────────────────────────────

export default function PlatformAdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "tenants" | "pricing">("dashboard");
  const [search, setSearch] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanItem[] | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/platform/dashboard");
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setEditingPlan(d.plans);
      }
    } catch { toast.error("Failed to load dashboard data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Tenant Actions ───────────────────────────────────────

  const toggleActive = async (tenant: TenantItem) => {
    const action = tenant.active ? "Suspend" : "Activate";
    if (!confirm(`${action} "${tenant.name}"?`)) return;
    try {
      const res = await fetch(`/api/platform/tenants/${tenant.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !tenant.active }),
      });
      if (res.ok) { toast.success(`${action}d "${tenant.name}"`); load(); }
      else toast.error(`Failed to ${action.toLowerCase()}`);
    } catch { toast.error("Network error"); }
  };

  const changePlan = async (tenantId: number, plan: string) => {
    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) { toast.success("Plan updated"); load(); }
      else toast.error("Failed to update plan");
    } catch { toast.error("Network error"); }
  };

  const impersonate = async (tenantId: number) => {
    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}/impersonate`, { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        window.open(url, "_blank");
      } else toast.error("Failed to impersonate");
    } catch { toast.error("Network error"); }
  };

  const savePricing = async () => {
    if (!editingPlan) return;
    try {
      const res = await fetch("/api/platform/pricing", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans: editingPlan.map(p => ({
          ...p,
          features: typeof p.features === "string" ? JSON.parse(p.features || "[]") : p.features,
        })) }),
      });
      if (res.ok) { toast.success("Pricing saved"); load(); }
      else toast.error("Failed to save pricing");
    } catch { toast.error("Network error"); }
  };

  // ─── Filtered Tenants ─────────────────────────────────────

  const filtered = data?.tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase()) ||
    t.businessType.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // ─── Loading ──────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#94A3B8" }}>
          <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid #334155", borderTopColor: "#3B82F6", borderRadius: "50%", margin: "0 auto 16px" }} />
          <p>Loading ResCommand Platform...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div style={{ padding: 48, textAlign: "center", color: "#DC2626" }}>Failed to load data</div>;

  // ─── Render ───────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#E2E8F0" }}>
      {/* Header */}
      <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "12px 32px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>R</div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", lineHeight: 1.2 }}>ResCommand</h1>
              <p style={{ fontSize: 10, color: "#64748B" }}>Venturio LLC</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["dashboard", "tenants", "pricing"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                  background: activeTab === tab ? "#3B82F6" : "transparent",
                  color: activeTab === tab ? "#fff" : "#94A3B8",
                  fontWeight: activeTab === tab ? 600 : 400, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {tab === "dashboard" ? <BarChart3 size={14} /> : tab === "tenants" ? <Building2 size={14} /> : <CreditCard size={14} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {/* ─── Dashboard Tab ─────────────────────────────── */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
              <StatCard label="Active Tenants" value={data.activeTenants} icon={<Building2 size={18} />} color="#3B82F6" />
              <StatCard label="Monthly Revenue" value={`$${data.totalMRR.toLocaleString()}`} icon={<DollarSign size={18} />} color="#059669" />
              <StatCard label="Annual Revenue" value={`$${data.totalARR.toLocaleString()}`} icon={<TrendingUp size={18} />} color="#8B5CF6" />
              <StatCard label="Total Staff" value={data.totalMembers} icon={<Users size={18} />} color="#F59E0B" />
              <StatCard label="Recent Signups" value={data.recentSignups} sub="last 30 days" icon={<Clock size={18} />} color="#EC4899" />
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 32 }}>
              {/* Plan Distribution */}
              <div style={{ background: "#1E293B", borderRadius: 12, border: "1px solid #334155", padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: "#94A3B8" }}>Plan Distribution</h3>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-end", height: 160 }}>
                  {Object.entries(data.planDistribution).map(([plan, count]) => {
                    const max = Math.max(...Object.values(data.planDistribution), 1);
                    const pct = (count / max) * 100;
                    return (
                      <div key={plan} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: PLAN_COLORS[plan] || "#fff" }}>{count}</span>
                        <div style={{ width: "100%", background: "#334155", borderRadius: 6, height: Math.max(pct, 10) + "%", minHeight: 16, position: "relative" }}>
                          <div style={{ position: "absolute", inset: 0, background: PLAN_COLORS[plan] || "#3B82F6", borderRadius: 6, opacity: 0.8 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>{plan}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ background: "#1E293B", borderRadius: 12, border: "1px solid #334155", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#94A3B8" }}>Quick Stats</h3>
                <QuickStat label="Suspended" value={data.suspendedTenants} color={data.suspendedTenants > 0 ? "#DC2626" : "#475569"} />
                <QuickStat label="On Trial" value={data.trialTenants} color="#F59E0B" />
                <QuickStat label="Avg Staff/Tenant" value={data.activeTenants > 0 ? Math.round(data.totalMembers / data.activeTenants) : 0} color="#3B82F6" />
                <QuickStat label="ARPU" value={`$${data.activeTenants > 0 ? (data.totalMRR / data.activeTenants).toFixed(0) : 0}/mo`} color="#059669" />
              </div>
            </div>

            {/* Recent Tenants */}
            <div style={{ background: "#1E293B", borderRadius: 12, border: "1px solid #334155", padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#94A3B8" }}>Recent Tenants</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.tenants.slice(0, 5).map(t => (
                  <div key={t.id} onClick={() => { setSelectedTenant(t); setActiveTab("tenants"); }}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0F172A", borderRadius: 8, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#1a2744")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#0F172A")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{TYPE_ICONS[t.businessType] || "🏪"}</span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{t.slug}.rescommand.com</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${PLAN_COLORS[t.plan]}20`, color: PLAN_COLORS[t.plan] }}>{t.plan}</span>
                      <ChevronRight size={14} style={{ color: "#475569" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── Tenants Tab ──────────────────────────────── */}
        {activeTab === "tenants" && (
          <>
            {/* Search Bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search tenants by name, slug, or type..."
                  style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, border: "1px solid #334155", background: "#1E293B", color: "#E2E8F0", fontSize: 13, outline: "none" }}
                />
              </div>
              <span style={{ fontSize: 12, color: "#64748B" }}>{filtered.length} tenants</span>
            </div>

            {/* Tenants Table */}
            <div style={{ background: "#1E293B", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    <Th>Business</Th>
                    <Th>Type</Th>
                    <Th>Plan</Th>
                    <Th>Staff</Th>
                    <Th>MRR</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #1a2744", opacity: t.active ? 1 : 0.5, cursor: "pointer" }}
                      onClick={() => setSelectedTenant(t)}
                    >
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{t.slug}.rescommand.com</div>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>
                        {TYPE_ICONS[t.businessType] || "🏪"} {t.businessType.replace(/_/g, " ")}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <PlanBadge plan={t.plan} />
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{t.members}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#059669" }}>
                        ${getPlanPrice(data.plans, t.plan)}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <StatusBadge active={t.active} trial={t.trialEndsAt ? new Date(t.trialEndsAt) > new Date() : false} />
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 11, color: "#64748B" }}>
                        {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap" }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button onClick={() => impersonate(t.id)} style={iconBtnStyle} title="Impersonate">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => toggleActive(t)} style={{ ...iconBtnStyle, color: t.active ? "#DC2626" : "#059669" }} title={t.active ? "Suspend" : "Activate"}>
                          {t.active ? <Ban size={13} /> : <Check size={13} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: 48, textAlign: "center", color: "#475569" }}>No tenants found</div>
              )}
            </div>
          </>
        )}

        {/* ─── Pricing Tab ──────────────────────────────── */}
        {activeTab === "pricing" && editingPlan && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Plan Pricing</h3>
              <button onClick={savePricing} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Save size={14} /> Save Changes
              </button>
            </div>
            {editingPlan.map((plan, i) => (
              <div key={plan.planKey} style={{ background: "#1E293B", borderRadius: 12, border: `1px solid ${PLAN_COLORS[plan.planKey]}40`, padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 16, alignItems: "end" }}>
                  <Field label="Plan Key">
                    <input value={plan.planKey} disabled style={inputStyle} />
                  </Field>
                  <Field label="Display Name">
                    <input value={plan.name} onChange={e => { const p = [...editingPlan]; p[i] = { ...p[i], name: e.target.value }; setEditingPlan(p); }} style={inputStyle} />
                  </Field>
                  <Field label="Price (cents/month)">
                    <input type="number" value={plan.price} onChange={e => { const p = [...editingPlan]; p[i] = { ...p[i], price: parseInt(e.target.value) || 0 }; setEditingPlan(p); }} style={inputStyle} />
                    <span style={{ fontSize: 11, color: "#64748B" }}>${(plan.price / 100).toFixed(2)}/mo</span>
                  </Field>
                  <Field label="Staff Limit">
                    <input type="number" value={plan.staffLimit ?? ""} placeholder="Unlimited" onChange={e => { const p = [...editingPlan]; p[i] = { ...p[i], staffLimit: e.target.value ? parseInt(e.target.value) : null }; setEditingPlan(p); }} style={inputStyle} />
                  </Field>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94A3B8", cursor: "pointer", padding: "20px 0 0" }}>
                    <input type="checkbox" checked={plan.active} onChange={e => { const p = [...editingPlan]; p[i] = { ...p[i], active: e.target.checked }; setEditingPlan(p); }} />
                    Active
                  </label>
                </div>
                <Field label="Features (one per line)" style={{ marginTop: 12 }}>
                  <textarea
                    value={parseFeatures(plan.features).join("\n")}
                    onChange={e => { const p = [...editingPlan]; p[i] = { ...p[i], features: JSON.stringify(e.target.value.split("\n").filter(Boolean)) }; setEditingPlan(p); }}
                    rows={3}
                    style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  />
                </Field>
                {plan.stripePriceId && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                    <CreditCard size={10} /> Stripe Price: {plan.stripePriceId}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Tenant Detail Slide-Over ────────────────────── */}
      {selectedTenant && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedTenant(null)} />
          <div style={{ width: 420, background: "#1E293B", borderLeft: "1px solid #334155", overflow: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedTenant.name}</h2>
              <button onClick={() => setSelectedTenant(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Detail label="Status">
                <StatusBadge active={selectedTenant.active} trial={selectedTenant.trialEndsAt ? new Date(selectedTenant.trialEndsAt) > new Date() : false} />
              </Detail>
              <Detail label="Plan">
                <select
                  value={selectedTenant.plan}
                  onChange={e => { changePlan(selectedTenant.id, e.target.value); setSelectedTenant({ ...selectedTenant, plan: e.target.value }); }}
                  style={{ ...inputStyle, padding: "4px 8px", fontSize: 12 }}
                >
                  {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Detail>
              <Detail label="Business Type">
                <span style={{ fontSize: 12 }}>{TYPE_ICONS[selectedTenant.businessType]} {selectedTenant.businessType.replace(/_/g, " ")}</span>
              </Detail>
              <Detail label="Staff Members">
                <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedTenant.members}</span>
              </Detail>
              <Detail label="Subdomain">{selectedTenant.slug}.rescommand.com</Detail>
              <Detail label="Custom Domain">{selectedTenant.domain || "None"}</Detail>
              <Detail label="Stripe Customer">{selectedTenant.stripeCustomerId || "Not linked"}</Detail>
              <Detail label="Created">{new Date(selectedTenant.createdAt).toLocaleDateString()}</Detail>
              {selectedTenant.trialEndsAt && (
                <Detail label="Trial Ends">{new Date(selectedTenant.trialEndsAt).toLocaleDateString()}</Detail>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => impersonate(selectedTenant.id)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Shield size={14} /> Impersonate
              </button>
              <button onClick={() => toggleActive(selectedTenant)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${selectedTenant.active ? "#DC262640" : "#05966940"}`, background: selectedTenant.active ? "#DC262610" : "#05966910", color: selectedTenant.active ? "#DC2626" : "#059669", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {selectedTenant.active ? <><Ban size={14} /> Suspend</> : <><Check size={14} /> Activate</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────

function StatCard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div style={{ background: "#1E293B", padding: 20, borderRadius: 12, border: "1px solid #334155" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function QuickStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a2744" }}>
      <span style={{ fontSize: 13, color: "#94A3B8" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
  return <th style={{ padding: "10px 12px", textAlign: align || "left", fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</th>;
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${PLAN_COLORS[plan] || "#6B7280"}20`, color: PLAN_COLORS[plan] || "#6B7280" }}>
      {plan}
    </span>
  );
}

function StatusBadge({ active, trial }: { active: boolean; trial: boolean }) {
  if (trial) return <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#F59E0B20", color: "#F59E0B" }}>TRIAL</span>;
  if (active) return <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#05966920", color: "#059669" }}>ACTIVE</span>;
  return <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#DC262620", color: "#DC2626" }}>SUSPENDED</span>;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#E2E8F0" }}>{children}</div>
    </div>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #334155",
  background: "#0F172A", color: "#E2E8F0", fontSize: 13, outline: "none",
};

const iconBtnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "#64748B",
  padding: 4, borderRadius: 4,
};

function parseFeatures(f: string | Json | null): string[] {
  if (!f) return [];
  if (typeof f === "string") { try { return JSON.parse(f); } catch { return f.split("\n"); } }
  if (Array.isArray(f)) return f as string[];
  return [];
}

function getPlanPrice(plans: PlanItem[], planKey: string): string {
  const plan = plans.find(p => p.planKey === planKey);
  return plan ? (plan.price / 100).toFixed(0) : "0";
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };