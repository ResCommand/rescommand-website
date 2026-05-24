"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";

interface ParSheetLine { id: number; productId: number; parLevel: number; onHand: number; toMake: number; predicted: number; product: { id: number; name: string } }
interface ParSheet { id: number; date: string; lines: ParSheetLine[] }

export default function ProductionPage() {
  const [sheet, setSheet] = useState<ParSheet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prediction").then(r => r.json()).then(d => setSheet(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><h1 className="text-2xl font-bold tracking-tight">Par Sheet</h1><div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-[#F7F7F7] rounded-2xl p-5 h-20" />)}</div></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Par Sheet</h1>
          <p className="text-[#717171] text-sm mt-1">Today&apos;s production targets</p>
        </div>
        <div className="text-sm text-[#717171] font-medium">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="bg-white border border-[#DDDDDD] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 gap-0 text-[11px] font-bold text-[#717171] uppercase tracking-wider px-5 py-3 bg-[#F7F7F7] border-b border-[#DDDDDD]">
          <div>Donut Type</div><div className="text-center">Predicted</div><div className="text-center">Par Level</div><div className="text-center">On Hand</div><div className="text-center">To Make</div>
        </div>
        {sheet?.lines.map((line, i) => (
          <div key={line.id} className={`grid grid-cols-5 gap-0 items-center px-5 py-4 text-sm ${i % 2 === 0 ? "" : "bg-[#FAFAFA]"} ${i < (sheet?.lines.length || 0) - 1 ? "border-b border-[#F0F0F0]" : ""}`}>
            <div className="font-semibold text-[#222222]">{line.product?.name || "Unknown"}</div>
            <div className="text-center text-[#717171]">{line.predicted}</div>
            <div className="text-center"><span className="inline-block bg-[#222222] text-white px-2.5 py-0.5 rounded-full text-xs font-bold">{line.parLevel}</span></div>
            <div className="text-center font-semibold">{line.onHand}</div>
            <div className="text-center"><span className="inline-block bg-[#FF385C] text-white px-2.5 py-0.5 rounded-full text-xs font-bold">{line.toMake}</span></div>
          </div>
        ))}
        {(!sheet?.lines || sheet.lines.length === 0) && (
          <div className="text-center text-[#717171] py-8 text-sm">No par sheet data</div>
        )}
      </div>
    </div>
  );
}