"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

interface HourEntry { id: number; clockIn: string; clockOut: string | null; totalHours: number | null; date: string; user?: { name: string; role: string } }

export default function HoursPage() {
  const { data: session } = useSession();
  const [hours, setHours] = useState<HourEntry[]>([]);
  const [clockedIn, setClockedIn] = useState(false);

  const loadHours = () => {
    fetch("/api/hours").then(r => r.json()).then(data => { setHours(Array.isArray(data) ? data : []); setClockedIn(Array.isArray(data) && data.some((h: HourEntry) => !h.clockOut)); }).catch(() => {});
  };
  useEffect(() => { loadHours(); }, []);

  async function clockIn() {
    try {
      const res = await fetch("/api/hours", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "clock_in" }) });
      if (res.ok) { toast.success("Clocked in ⏰"); loadHours(); }
      else { const d = await res.json(); toast.error(d.error); }
    } catch { toast.error("Network error"); }
  }

  async function clockOut() {
    try {
      const res = await fetch("/api/hours", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "clock_out" }) });
      if (res.ok) { toast.success("Clocked out 👋"); loadHours(); }
      else { const d = await res.json(); toast.error(d.error); }
    } catch { toast.error("Network error"); }
  }

  const role = (session?.user as { role?: string })?.role;
  const isManager = role === "MANAGER" || role === "OWNER";
  const todayH = hours.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).reduce((s, h) => s + (h.totalHours || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isManager ? "Team Hours" : "My Hours"}</h1>
        <p className="text-[#717171] text-sm mt-1">Clock in and track time</p>
      </div>

      {!isManager && (
        <div className="bg-white border border-[#DDDDDD] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-[#222222]">{clockedIn ? "🟢 Clocked In" : "🔴 Clocked Out"}</div>
            <div className="text-xs text-[#717171] mt-1">Today: {todayH.toFixed(1)}h</div>
          </div>
          {clockedIn ? (
            <button onClick={clockOut} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#222222] text-white hover:bg-[#444444] transition-colors flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Clock Out
            </button>
          ) : (
            <button onClick={clockIn} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#00A699] text-white hover:bg-[#009088] transition-colors flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Clock In
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {hours.map(h => (
          <div key={h.id} className="bg-white border border-[#DDDDDD] rounded-2xl p-5 flex items-center justify-between">
            <div>
              {isManager && h.user && <div className="text-sm font-bold text-[#222222]">{h.user.name}</div>}
              <div className="text-xs text-[#717171]">
                {new Date(h.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {h.clockOut ? new Date(h.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#FF385C]">{h.totalHours ? `${h.totalHours.toFixed(1)}h` : "—"}</div>
              <div className="text-[11px] text-[#717171]">{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
            </div>
          </div>
        ))}
        {hours.length === 0 && <div className="text-center text-[#717171] py-12 text-sm">No hours logged</div>}
      </div>
    </div>
  );
}