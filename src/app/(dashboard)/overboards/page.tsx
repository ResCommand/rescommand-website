"use client";

import { useEffect, useState } from "react";

interface OLine { id: number; quantity: number; fillings: string | null; toppings: string | null; product: { name: string } | null }
interface Ob { id: number; date: string; status: string; notes: string | null; lines: OLine[] }
const statusStyle: Record<string, string> = { SCHEDULED: "bg-[#EFF6FF] text-[#1A56DB]", IN_PROGRESS: "bg-[#FFFBEB] text-[#B45309]", COMPLETE: "bg-[#ECFDF5] text-[#059669]" };

export default function OverboardsPage() {
  const [obs, setObs] = useState<Ob[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/overboards").then(r => r.json()).then(setObs).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[#111827]">Overboard Calendar</h1><p className="text-sm text-[#6B7280] mt-0.5">Upcoming production runs</p></div>
      <div className="space-y-3">
        {obs.map(ob => (
          <div key={ob.id} className="bg-white rounded-lg border border-[#E5E7EB] p-4">
            <div className="flex items-center justify-between mb-3">
              <div><div className="text-sm font-semibold text-[#111827]">{new Date(ob.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
              {ob.notes && <div className="text-xs text-[#9CA3AF]">{ob.notes}</div>}</div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${statusStyle[ob.status] || "bg-[#F3F4F6] text-[#6B7280]"}`}>{ob.status.replace("_"," ")}</span>
            </div>
            {ob.lines.length > 0 && <div className="space-y-1.5">
              {ob.lines.map(l => (
                <div key={l.id} className="bg-[#F9FAFB] rounded-md px-3 py-2">
                  <div className="flex items-center justify-between text-sm"><span className="font-medium text-[#111827]">{l.product?.name}</span><span className="text-[#9CA3AF]">Qty: {l.quantity}</span></div>
                  {(l.fillings || l.toppings) && <div className="text-xs text-[#9CA3AF] mt-0.5">{l.fillings && `Fillings: ${l.fillings}`}{l.fillings && l.toppings && " · "}{l.toppings && `Toppings: ${l.toppings}`}</div>}
                </div>
              ))}
            </div>}
          </div>
        ))}
        {obs.length === 0 && <div className="text-center text-sm text-[#9CA3AF] py-12">No overboards scheduled</div>}
      </div>
    </div>
  );
}