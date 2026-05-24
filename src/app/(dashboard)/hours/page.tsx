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
      <div><h1 className="text-xl font-semibold text-[#111827]">{isMgr ? "Team Hours" : "My Hours"}</h1><p className="text-sm text-[#6B7280] mt-0.5">Clock in and track time</p></div>
      {!isMgr && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center justify-between">
          <div><div className="text-sm font-medium text-[#111827]">{clockedIn ? "🟢 Clocked In" : "🔴 Clocked Out"}</div></div>
          {clockedIn
            ? <button onClick={() => clock("clock_out")} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-[#111827] text-white hover:bg-[#374151]"><LogOut className="h-3.5 w-3.5" />Out</button>
            : <button onClick={() => clock("clock_in")} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-[#1A56DB] text-white hover:bg-[#1544B0]"><LogIn className="h-3.5 w-3.5" />In</button>}
        </div>
      )}
      <div className="bg-white rounded-lg border border-[#E5E7EB] divide-y divide-[#F3F4F6]">
        {hours.map(h => (
          <div key={h.id} className="px-4 py-3 flex items-center justify-between">
            <div>{isMgr && h.user && <div className="text-sm font-medium text-[#111827]">{h.user.name}</div>}
              <div className="text-xs text-[#9CA3AF]">{new Date(h.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {h.clockOut ? new Date(h.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now"}</div></div>
            <div className="text-right"><div className="text-sm font-semibold text-[#1A56DB]">{h.totalHours ? `${h.totalHours.toFixed(1)}h` : "—"}</div>
              <div className="text-[10px] text-[#9CA3AF]">{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div></div>
          </div>
        ))}
        {hours.length === 0 && <div className="p-8 text-center text-sm text-[#9CA3AF]">No hours logged</div>}
      </div>
    </div>
  );
}