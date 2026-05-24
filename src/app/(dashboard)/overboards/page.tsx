"use client";
import { useEffect, useState } from "react";

interface OverboardLine {
  id: number; productId: number; quantity: number; quantitySold: number;
  unitPrice: number; upchargePrice: number; upchargesSold: number;
  fillings: string | null; toppings: string | null;
  product: { name: string };
}
interface Overboard {
  id: number; date: string; status: string; name: string | null; notes: string | null;
  lines: OverboardLine[];
}

const fmt = (n: number) => `$${n.toFixed(2)}`;
const statusStyle: Record<string, string> = { SCHEDULED: "badge-blue", IN_PROGRESS: "badge-yellow", COMPLETE: "badge-green" };

export default function OverboardsPage() {
  const [schedules, setSchedules] = useState<Overboard[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => { fetch("/api/overboards").then(r => r.json()).then(d => setSchedules(Array.isArray(d) ? d : [])).catch(() => {}); }, []);

  const now = new Date();
  const upcoming = schedules.filter(s => new Date(s.date) >= now || s.status !== "COMPLETE");
  const past = schedules.filter(s => new Date(s.date) < now && s.status === "COMPLETE");
  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      <div className="page-header"><h1>Overboards</h1><p className="text-sm text-gray">Track fillings, toppings, sales, and upcharges</p></div>

      <div className="tabs">
        <button className={`tab ${tab === "upcoming" ? "active" : ""}`} onClick={() => setTab("upcoming")}>Upcoming</button>
        <button className={`tab ${tab === "past" ? "active" : ""}`} onClick={() => setTab("past")}>Past</button>
      </div>

      <div className="grid-2">
        {shown.map(s => {
          const totalSold = s.lines.reduce((sum, l) => sum + l.quantitySold, 0);
          const totalRev = s.lines.reduce((sum, l) => sum + l.quantitySold * l.unitPrice, 0);
          const totalUpcharges = s.lines.reduce((sum, l) => sum + l.upchargesSold, 0);
          const totalUpRev = s.lines.reduce((sum, l) => sum + l.upchargesSold * l.upchargePrice, 0);
          return (
            <div key={s.id} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm">{s.name || `Overboard #${s.id}`}</div>
                    <div className="text-xs text-gray">{new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                  </div>
                  <span className={`badge ${statusStyle[s.status] || "badge-gray"}`}>{s.status.replace("_", " ")}</span>
                </div>

                {/* Sales summary */}
                <div className="flex gap-3 mt-3" style={{ flexWrap: "wrap" }}>
                  <div className="badge badge-green">Sold: {totalSold}</div>
                  <div className="badge badge-blue">Revenue: {fmt(totalRev)}</div>
                  <div className="badge badge-purple">Upcharges: {totalUpcharges}</div>
                  {totalUpRev > 0 && <div className="badge badge-orange">Upcharge $: {fmt(totalUpRev)}</div>}
                </div>

                {/* Line items */}
                {s.lines && s.lines.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <table>
                      <thead><tr><th>Item</th><th>Qty</th><th>Sold</th><th>Price</th><th>Upcharges</th></tr></thead>
                      <tbody>
                        {s.lines.map((l, i) => (
                          <tr key={i}>
                            <td className="font-medium text-sm">{l.product?.name || "Item"}</td>
                            <td>{l.quantity}</td>
                            <td>{l.quantitySold}</td>
                            <td>{fmt(l.unitPrice)}</td>
                            <td>{l.upchargesSold} @ {fmt(l.upchargePrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {s.lines.some(l => l.fillings || l.toppings) && (
                      <div style={{ marginTop: 8 }}>
                        <div className="text-xs text-gray">Fillings & Toppings:</div>
                        {s.lines.map((l, i) => (l.fillings || l.toppings) ? (
                          <div key={i} className="text-xs text-gray" style={{ paddingLeft: 8, borderLeft: "2px solid #E5E7EB", marginBottom: 4 }}>
                            {l.product?.name}: {l.fillings}{l.fillings && l.toppings ? " + " : ""}{l.toppings}
                          </div>
                        ) : null)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {shown.length === 0 && <div className="empty-state">No overboards {tab === "upcoming" ? "scheduled" : "completed"}</div>}
      </div>
    </div>
  );
}