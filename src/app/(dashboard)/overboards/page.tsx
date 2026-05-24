"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

interface OverboardLine { id: number; productId: number; quantity: number; fillings: string | null; toppings: string | null; product: { id: number; name: string } | null }
interface Overboard { id: number; date: string; status: string; notes: string | null; lines: OverboardLine[] }

const statusStyle: Record<string, string> = {
  SCHEDULED: "bg-[#F0F8FF] text-[#0066CC]",
  IN_PROGRESS: "bg-[#FFF8F0] text-[#CC6600]",
  COMPLETE: "bg-[#F0FFF4] text-[#008844]",
};

export default function OverboardsPage() {
  const [schedules, setSchedules] = useState<Overboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/overboards").then(r => r.json()).then(setSchedules).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overboard Calendar</h1>
        <p className="text-[#717171] text-sm mt-1">Upcoming production runs</p>
      </div>
      <div className="space-y-4">
        {schedules.map(ob => (
          <div key={ob.id} className="bg-white border border-[#DDDDDD] rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-[#222222]">
                  {new Date(ob.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
                {ob.notes && <div className="text-xs text-[#717171] mt-0.5">{ob.notes}</div>}
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusStyle[ob.status] || "bg-[#F7F7F7] text-[#717171]"}`}>
                {ob.status.replace("_", " ")}
              </span>
            </div>
            {ob.lines.length > 0 && (
              <div className="space-y-2">
                {ob.lines.map(line => (
                  <div key={line.id} className="bg-[#F7F7F7] rounded-xl p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#222222]">{line.product?.name || "Unknown"}</span>
                      <span className="text-[#717171] font-medium">Qty: {line.quantity}</span>
                    </div>
                    {(line.fillings || line.toppings) && (
                      <div className="text-xs text-[#717171] mt-1">
                        {line.fillings && `Fillings: ${line.fillings}`}
                        {line.fillings && line.toppings && " · "}
                        {line.toppings && `Toppings: ${line.toppings}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {schedules.length === 0 && <div className="text-center text-[#717171] py-12 text-sm">No overboards scheduled</div>}
      </div>
    </div>
  );
}