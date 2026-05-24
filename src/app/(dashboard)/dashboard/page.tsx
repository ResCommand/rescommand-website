"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Settings, GripVertical, Eye, EyeOff, X, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface KPIs {
  donutsSold: number; overboard: number; dozens: number; halfDozens: number;
  drinksSold: number; drinkBreakdown: { name: string; count: number }[];
  dogelsSold: number; sandwichesSold: number;
  todaySales: number; ticketCount: number; avgTicket: number;
  overboardsSold: number; overboardRevenue: number;
  overboardUpcharges: number; upchargeRevenue: number;
}
interface Hourly { hour: string; sales: number }
interface ParLine { product: { name: string }; predicted: number; actual: number }
interface Cleaning { id: number; task: string; frequency: string; fohBoh: string }

const fmt = (n: number | string | undefined | null) => n != null ? "$" + Number(n).toFixed(2) : "—";

// All possible metrics with role visibility defaults
const ALL_METRICS = [
  { id: "donutsSold", label: "Donuts Sold", icon: "🍩", color: "stat-icon-orange", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.donutsSold },
  { id: "overboard", label: "Overboard", icon: "📋", color: "stat-icon-red", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.overboard },
  { id: "dozens", label: "Dozens", icon: "📦", color: "stat-icon-blue", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.dozens },
  { id: "halfDozens", label: "Half Dozens", icon: "📦", color: "stat-icon-purple", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.halfDozens },
  { id: "drinksSold", label: "Drinks", icon: "☕", color: "stat-icon-green", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.drinksSold },
  { id: "drinkBreakdown", label: "Drink Breakdown", icon: "🍵", color: "stat-icon-green", roles: ["MANAGER", "OWNER"], getValue: () => null, isSection: true },
  { id: "dogelsSold", label: "Dogels", icon: "🐶", color: "stat-icon-yellow", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.dogelsSold },
  { id: "sandwichesSold", label: "Sandwiches", icon: "🥪", color: "stat-icon-blue", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.sandwichesSold },
  { id: "todaySales", label: "Today's Sales", icon: "💰", color: "stat-icon-green", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => fmt(k.todaySales) },
  { id: "ticketCount", label: "Tickets", icon: "🧾", color: "stat-icon-blue", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.ticketCount },
  { id: "avgTicket", label: "Avg Ticket", icon: "📊", color: "stat-icon-purple", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => fmt(k.avgTicket) },
  { id: "overboardsSold", label: "Overboards Sold", icon: "🛒", color: "stat-icon-orange", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.overboardsSold },
  { id: "overboardRevenue", label: "Overboard Revenue", icon: "💵", color: "stat-icon-green", roles: ["OWNER"], getValue: (k: KPIs) => fmt(k.overboardRevenue) },
  { id: "upchargesSold", label: "Upcharges Sold", icon: "⬆️", color: "stat-icon-blue", roles: ["MANAGER", "OWNER"], getValue: (k: KPIs) => k.overboardUpcharges },
  { id: "upchargeRevenue", label: "Upcharge Revenue", icon: "💲", color: "stat-icon-purple", roles: ["OWNER"], getValue: (k: KPIs) => fmt(k.upchargeRevenue) },
  { id: "salesByHour", label: "Sales by Hour", icon: "📈", color: "stat-icon-green", roles: ["MANAGER", "OWNER"], getValue: () => null, isChart: true },
];

interface LayoutItem { id: string; visible: boolean }
type Layout = LayoutItem[];

function getDefaultLayout(role: string): Layout {
  return ALL_METRICS
    .filter(m => m.roles.includes(role))
    .map(m => ({ id: m.id, visible: true }));
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isManager = role === "MANAGER" || role === "OWNER";
  const name = session?.user?.name?.split(" ")[0] || "there";

  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [hourly, setHourly] = useState<Hourly[]>([]);
  const [parLines, setParLines] = useState<ParLine[]>([]);
  const [cleaning, setCleaning] = useState<Cleaning[]>([]);
  const [layout, setLayout] = useState<Layout>([]);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    // Load saved layout
    const defaultLayout = getDefaultLayout(role);
    fetch("/api/dashboard-layout").then(r => r.json()).then(saved => {
      if (Array.isArray(saved) && saved.length > 0) {
        // Merge: keep order from saved, add any new metrics, remove deleted
        const savedIds = new Set(saved.map((s: LayoutItem) => s.id));
        const merged = [
          ...saved,
          ...defaultLayout.filter(d => !savedIds.has(d.id)),
        ].filter(m => defaultLayout.some(d => d.id === m.id));
        setLayout(merged);
      } else {
        setLayout(defaultLayout);
      }
      setLayoutLoaded(true);
    }).catch(() => { setLayout(defaultLayout); setLayoutLoaded(true); });
  }, [role]);

  useEffect(() => {
    if (isManager) {
      fetch("/api/reports").then(r => r.json()).then(d => {
        setKpis(d);
        setHourly(Array.isArray(d.salesByHour) ? d.salesByHour : []);
      }).catch(() => {});
    }
    fetch("/api/prediction").then(r => r.json()).then(d => setParLines(Array.isArray(d) ? d.slice(0, 8) : [])).catch(() => {});
    fetch("/api/cleaning").then(r => r.json()).then(d => setCleaning(Array.isArray(d) ? d : [])).catch(() => {});
  }, [isManager]);

  const saveLayout = useCallback(async (newLayout: Layout) => {
    setLayout(newLayout);
    try { await fetch("/api/dashboard-layout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newLayout) }); } catch {}
  }, []);

  function toggleVisibility(id: string) {
    const newLayout = layout.map(l => l.id === id ? { ...l, visible: !l.visible } : l);
    saveLayout(newLayout);
  }

  function moveMetric(fromIdx: number, toIdx: number) {
    const newLayout = [...layout];
    const [moved] = newLayout.splice(fromIdx, 1);
    newLayout.splice(toIdx, 0, moved);
    saveLayout(newLayout);
    setDragIdx(null);
    setDragOverIdx(null);
  }

  function resetLayout() {
    const defaultLayout = getDefaultLayout(role);
    saveLayout(defaultLayout);
    toast.success("Layout reset to default");
  }

  const entryLinks = [
    { href: "/entry/drinks", icon: "☕", label: "Drinks", desc: "Log drinks & dialing" },
    { href: "/entry/donuts", icon: "🍩", label: "Donuts", desc: "Production & waste" },
    { href: "/entry/sales", icon: "💰", label: "Sales", desc: "Ring up orders" },
    { href: "/entry/dogels", icon: "🐶", label: "Dogels", desc: "Dog donuts" },
    { href: "/entry/sandwiches", icon: "🥪", label: "Sandwiches", desc: "Breakfast items" },
  ];

  const visibleMetrics = layout.filter(l => l.visible);
  const getMetric = (id: string) => ALL_METRICS.find(m => m.id === id);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="card" style={{ padding: 24 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Good morning, {name} 👋</h1>
            <p className="text-gray text-sm">{isManager ? "Here's today's operations overview" : "Here's your shift overview"}</p>
          </div>
          {isManager && layoutLoaded && (
            <button onClick={() => setCustomizeOpen(!customizeOpen)} className={`btn ${customizeOpen ? "btn-primary" : "btn-secondary btn-sm"}`}>
              <Settings size={16} /> {customizeOpen ? "Done" : "Customize"}
            </button>
          )}
        </div>
      </div>

      {/* Customize panel */}
      {customizeOpen && (
        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Arrange &amp; Toggle Metrics</h3>
            <button onClick={resetLayout} className="btn btn-ghost btn-sm"><RotateCcw size={14} /> Reset</button>
          </div>
          <p className="text-xs text-gray mb-3">Drag to reorder. Click the eye to show/hide.</p>
          <div className="space-y-2">
            {layout.map((item, idx) => {
              const metric = getMetric(item.id);
              if (!metric) return null;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
                  onDrop={() => { if (dragIdx !== null && dragIdx !== idx) moveMetric(dragIdx, idx); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", borderRadius: 6,
                    border: dragOverIdx === idx ? "2px solid #1A56DB" : "1px solid #E5E7EB",
                    background: dragOverIdx === idx ? "#EFF6FF" : "#fff",
                    opacity: item.visible ? 1 : 0.5,
                    cursor: "grab",
                  }}
                >
                  <GripVertical size={16} style={{ color: "#9CA3AF", cursor: "grab" }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{metric.icon} {metric.label}</span>
                  <button onClick={() => toggleVisibility(item.id)} className="btn-icon" style={{ color: item.visible ? "#059669" : "#9CA3AF" }}>
                    {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metric cards */}
      {isManager && layoutLoaded && visibleMetrics.length > 0 && (
        <div className="section">
          <h3 className="section-title">Key Metrics</h3>
          <div className="grid-4">
            {visibleMetrics.map(item => {
              const metric = getMetric(item.id);
              if (!metric || metric.isChart || metric.isSection) return null;
              return (
                <div key={item.id} className="stat-card">
                  <div className={`stat-icon ${metric.color}`}>{metric.icon}</div>
                  <div className="stat-value">{kpis ? metric.getValue(kpis) : "—"}</div>
                  <div className="stat-label">{metric.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sales by Hour chart */}
      {isManager && layoutLoaded && visibleMetrics.some(l => l.id === "salesByHour") && (
        <div className="section">
          <div className="chart-container">
            <h3>Sales by Hour</h3>
            {hourly.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={(v: number) => "$" + v.toFixed(2)} />
                  <Tooltip formatter={((v: any) => "$" + Number(v).toFixed(2)) as any} />
                  <Bar dataKey="sales" fill="#1A56DB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No sales data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Drink breakdown */}
      {isManager && kpis?.drinkBreakdown && kpis.drinkBreakdown.length > 0 && layoutLoaded && visibleMetrics.some(l => l.id === "drinkBreakdown") && (
        <div className="section">
          <h3 className="section-title">Drink Breakdown</h3>
          <div className="card">
            <table>
              <thead><tr><th>Drink</th><th>Count</th></tr></thead>
              <tbody>
                {kpis.drinkBreakdown.map((d, i) => <tr key={i}><td className="font-medium">{d.name}</td><td>{d.count}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Entry — everyone */}
      <div className="section">
        <h3 className="section-title">Quick Entry</h3>
        <div className="quick-entry-grid">
          {entryLinks.map(l => (
            <a key={l.href} href={l.href} className="quick-entry-card">
              <div className="icon">{l.icon}</div>
              <h3>{l.label}</h3>
              <p>{l.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Par Sheet */}
      <div className="section">
        <h3 className="section-title">Today&apos;s Par Sheet</h3>
        <div className="card">
          <table>
            <thead><tr><th>Product</th><th>Predicted</th><th>Actual</th></tr></thead>
            <tbody>
              {parLines.map((l, i) => (
                <tr key={i}><td>{l.product?.name || "—"}</td><td className="font-semibold">{l.predicted}</td><td>{l.actual || 0}</td></tr>
              ))}
              {parLines.length === 0 && <tr><td colSpan={3} className="text-center text-gray" style={{ padding: 24 }}>No par data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cleaning Tasks */}
      <div className="section">
        <h3 className="section-title">Cleaning Tasks</h3>
        <div className="card">
          {cleaning.slice(0, 6).map(t => (
            <div key={t.id} className="list-item">
              <div>
                <div className="font-medium text-sm">{t.task}</div>
                <div className="text-xs text-gray">{t.fohBoh === "FOH" ? "Front of House" : "Back of House"}</div>
              </div>
              <span className={`badge ${t.frequency === "DAILY" ? "badge-blue" : t.frequency === "WEEKLY" ? "badge-green" : "badge-purple"}`}>{t.frequency}</span>
            </div>
          ))}
          {cleaning.length === 0 && <div className="empty-state">No tasks</div>}
        </div>
      </div>
    </div>
  );
}