"use client";
import { useEffect, useState } from "react";
export default function OverboardsPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  useEffect(() => { fetch("/api/overboards").then(r => r.json()).then(d => setSchedules(Array.isArray(d) ? d : [])).catch(() => {}); }, []);
  const statusStyle: Record<string, string> = { SCHEDULED: "badge-blue", RUNNING: "badge-yellow", COMPLETED: "badge-green" };
  return (
    <div className="space-y-6">
      <div className="page-header"><h1>Overboards</h1><p className="text-sm text-gray">Upcoming fillings and toppings schedule</p></div>
      <div className="grid-2">
        {schedules.map(s => (
          <div key={s.id} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{s.name || `Overboard #${s.id}`}</div>
                <span className={`badge ${statusStyle[s.status] || "badge-gray"}`}>{s.status}</span>
              </div>
              <div className="text-xs text-gray">{s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "No date"}</div>
              {s.lines && s.lines.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {s.lines.map((l: any, i: number) => <div key={i} className="text-xs text-gray" style={{ paddingLeft: 8, borderLeft: "2px solid #E5E7EB", marginBottom: 4 }}>{l.filling || l.item || "Item"}</div>)}
                </div>
              )}
            </div>
          </div>
        ))}
        {schedules.length === 0 && <div className="empty-state">No overboards scheduled</div>}
      </div>
    </div>
  );
}