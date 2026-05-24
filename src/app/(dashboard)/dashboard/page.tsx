"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Cleaning { id: number; task: string; frequency: string; fohBoh: string }
interface KPIs {
  donutsSold: number; overboard: number; dozens: number; halfDozens: number;
  drinksSold: number; drinkBreakdown: { name: string; count: number }[];
  dogelsSold: number; sandwichesSold: number;
  todaySales: number; avgTicket: number;
  overboardsSold: number; overboardRevenue: number;
  overboardUpcharges: number; upchargeRevenue: number;
}
interface Hourly { hour: string; sales: number }
interface ParLine { product: { name: string }; predicted: number; actual: number }

const fmt = (n: number | string | undefined | null) => n != null ? "$" + Number(n).toFixed(2) : "—";

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isManager = role === "MANAGER" || role === "OWNER";
  const name = session?.user?.name?.split(" ")[0] || "there";

  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [hourly, setHourly] = useState<Hourly[]>([]);
  const [parLines, setParLines] = useState<ParLine[]>([]);
  const [cleaning, setCleaning] = useState<Cleaning[]>([]);

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

  const entryLinks = [
    { href: "/entry/drinks", icon: "☕", label: "Drinks", desc: "Log drinks & dialing" },
    { href: "/entry/donuts", icon: "🍩", label: "Donuts", desc: "Production & waste" },
    { href: "/entry/sales", icon: "💰", label: "Sales", desc: "Ring up orders" },
    { href: "/entry/dogels", icon: "🐶", label: "Dogels", desc: "Dog donuts" },
    { href: "/entry/sandwiches", icon: "🥪", label: "Sandwiches", desc: "Breakfast items" },
  ];

  const stats = isManager ? [
    { label: "Donuts Sold", value: kpis?.donutsSold ?? "—", icon: "🍩", color: "stat-icon-orange" },
    { label: "Overboard", value: kpis?.overboard ?? "—", icon: "📋", color: "stat-icon-red" },
    { label: "Dozens", value: kpis?.dozens ?? "—", icon: "📦", color: "stat-icon-blue" },
    { label: "Half Dozens", value: kpis?.halfDozens ?? "—", icon: "📦", color: "stat-icon-purple" },
    { label: "Drinks", value: kpis?.drinksSold ?? "—", icon: "☕", color: "stat-icon-green" },
    { label: "Dogels", value: kpis?.dogelsSold ?? "—", icon: "🐶", color: "stat-icon-yellow" },
    { label: "Sandwiches", value: kpis?.sandwichesSold ?? "—", icon: "🥪", color: "stat-icon-blue" },
    { label: "Today's Sales", value: fmt(kpis?.todaySales), icon: "💰", color: "stat-icon-green" },
    { label: "Avg Ticket", value: fmt(kpis?.avgTicket), icon: "🧾", color: "stat-icon-purple" },
    { label: "Overboards Sold", value: kpis?.overboardsSold ?? "—", icon: "🛒", color: "stat-icon-orange" },
    { label: "Overboard Revenue", value: fmt(kpis?.overboardRevenue), icon: "💵", color: "stat-icon-green" },
    { label: "Upcharges Sold", value: kpis?.overboardUpcharges ?? "—", icon: "⬆️", color: "stat-icon-blue" },
    { label: "Upcharge Revenue", value: fmt(kpis?.upchargeRevenue), icon: "💲", color: "stat-icon-purple" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Good morning, {name} 👋</h1>
        <p className="text-gray text-sm">{isManager ? "Here's today's operations overview" : "Here's your shift overview"}</p>
      </div>

      {isManager && (
        <div className="section">
          <h3 className="section-title">Key Metrics</h3>
          <div className="grid-4">
            {stats.map(s => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isManager && (
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

      {isManager && kpis?.drinkBreakdown && kpis.drinkBreakdown.length > 0 && (
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