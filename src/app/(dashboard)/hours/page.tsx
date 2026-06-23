"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
interface H { id: number; clockIn: string; clockOut: string | null; totalHours: number | null; date: string; user?: { name: string } }
export default function HoursPage() {
  const { data: session } = useSession();
  const [hours, setHours] = useState<H[]>([]);
  const [clockedIn, setClockedIn] = useState(false);
  const loadHours = () => { fetch("/api/hours").then(r => r.json()).then(d => { const arr = Array.isArray(d) ? d : []; setHours(arr); setClockedIn(arr.some((h: H) => !h.clockOut)); }).catch(() => {}); };
  useEffect(() => { loadHours(); }, []);
  async function clock(action: string) {
    try { const r = await fetch("/api/hours", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (r.ok) { toast.success(action === "clock_in" ? "Clocked in ⏰" : "Clocked out 👋"); loadHours(); }
      else { const d = await r.json(); toast.error(d.error); } } catch { toast.error("Error"); }
  }
  const isMgr = ["MANAGER","OWNER"].includes((session?.user as { role?: string })?.role || "");
  return (
    <div className="space-y-6">
      <div className="page-header"><h1>{isMgr ? "Team Hours" : "My Hours"}</h1><p className="text-sm text-gray">Clock in and track time</p></div>
      {!isMgr && (
        <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="text-sm font-medium">{clockedIn ? "🟢 Clocked In" : "🔴 Clocked Out"}</div>
          {clockedIn
            ? <button onClick={() => clock("clock_out")} className="btn btn-sm" style={{ background: "#7C3AED", color: "#fff" }}><LogOut size={14} /> Out</button>
            : <button onClick={() => clock("clock_in")} className="btn btn-sm btn-primary"><LogIn size={14} /> In</button>}
        </div>
      )}
      <div className="card">
        {hours.map(h => (
          <div key={h.id} className="list-item">
            <div>
              {isMgr && h.user && <div className="font-medium text-sm">{h.user.name}</div>}
              <div className="text-xs text-gray">{new Date(h.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {h.clockOut ? new Date(h.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue">{h.totalHours ? `${h.totalHours.toFixed(1)}h` : "—"}</div>
              <div className="text-xs text-gray">{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
            </div>
          </div>
        ))}
        {hours.length === 0 && <div className="empty-state">No hours logged</div>}
      </div>
    </div>
  );
}