"use client";

import { useEffect, useState } from "react";

interface Line { id: number; parLevel: number; onHand: number; toMake: number; predicted: number; product: { name: string } }
interface Sheet { lines: Line[] }

export default function ProductionPage() {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/prediction").then(r => r.json()).then(d => setSheet(d)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="space-y-6"><h1 className="text-xl font-semibold text-[#111827]">Par Sheet</h1><div className="animate-pulse bg-white rounded-lg border border-[#E5E7EB] p-6 h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[#111827]">Par Sheet</h1><p className="text-sm text-[#6B7280] mt-0.5">Today&apos;s production targets</p></div>
        <div className="text-sm text-[#9CA3AF]">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
      </div>
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="grid grid-cols-5 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <div>Type</div><div className="text-center">Predicted</div><div className="text-center">Par</div><div className="text-center">On Hand</div><div className="text-center">To Make</div>
        </div>
        {sheet?.lines.map((l, i) => (
          <div key={l.id} className={`grid grid-cols-5 items-center px-4 py-3 text-sm ${i % 2 ? "bg-[#FAFAFA]" : ""}`}>
            <div className="font-medium text-[#111827]">{l.product?.name}</div>
            <div className="text-center text-[#6B7280]">{l.predicted}</div>
            <div className="text-center"><span className="bg-[#111827] text-white text-xs font-semibold px-2 py-0.5 rounded">{l.parLevel}</span></div>
            <div className="text-center font-medium">{l.onHand}</div>
            <div className="text-center"><span className="bg-[#1A56DB] text-white text-xs font-semibold px-2 py-0.5 rounded">{l.toMake}</span></div>
          </div>
        ))}
        {(!sheet?.lines || !sheet.lines.length) && <div className="p-8 text-center text-sm text-[#9CA3AF]">No par sheet data</div>}
      </div>
    </div>
  );
}