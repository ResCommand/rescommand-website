"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ParLine { product: { name: string }; predicted: number; actual: number }
interface Cleaning { id: number; task: string; frequency: string; fohBoh: string }

export default function EmployeePage() {
  const { data: session } = useSession();
  const [parLines, setParLines] = useState<ParLine[]>([]);
  const [cleaning, setCleaning] = useState<Cleaning[]>([]);
  const name = session?.user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    fetch("/api/reports?type=today").then(r => r.json()).then(() => {}).catch(() => {});
    fetch("/api/prediction").then(r => r.json()).then(d => setParLines(Array.isArray(d) ? d.slice(0, 8) : [])).catch(() => {});
    fetch("/api/cleaning").then(r => r.json()).then(d => setCleaning(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const entryLinks = [
    { href: "/entry/drinks", icon: "☕", label: "Drinks", desc: "Log drinks & dialing" },
    { href: "/entry/donuts", icon: "🍩", label: "Donuts", desc: "Production & waste" },
    { href: "/entry/sales", icon: "💰", label: "Sales", desc: "Ring up orders" },
    { href: "/entry/dogels", icon: "🐶", label: "Dogels", desc: "Dog donuts" },
    { href: "/entry/sandwiches", icon: "🥪", label: "Sandwiches", desc: "Breakfast items" },
  ];

  return (
    <div className="space-y-6">
      <div className="section">
        <div className="card" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Good morning, {name} 👋</h1>
          <p className="text-gray text-sm">Here&apos;s your shift overview</p>
        </div>
      </div>

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