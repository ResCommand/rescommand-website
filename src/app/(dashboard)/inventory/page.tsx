"use client";

import { useEffect, useState } from "react";
import { Package, AlertTriangle } from "lucide-react";

interface InventoryItem {
  id: number; name: string; category: string; unit: string; unitCost: number;
  parLevel: number; currentStock: number; minStock: number; reorderQty: number; supplier: string | null;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [tab, setTab] = useState<"FOH" | "BOH" | "LOW">("FOH");

  useEffect(() => {
    const url = tab === "LOW" ? "/api/inventory?lowStock=true" : `/api/inventory?category=${tab}`;
    fetch(url).then(r => r.json()).then(setItems).catch(() => {});
  }, [tab]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-[#717171] text-sm mt-1">Track stock levels and orders</p>
        </div>
        <div className="flex gap-2">
          {(["FOH","BOH","LOW"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === t ? "bg-[#222222] text-white" : "bg-[#F7F7F7] text-[#222222] hover:bg-[#EEEEEE]"
              }`}>
              {t === "LOW" ? "⚠️ Low Stock" : t === "FOH" ? "Front of House" : "Back of House"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => {
          const isLow = item.currentStock <= item.minStock;
          const pct = item.parLevel > 0 ? (item.currentStock / item.parLevel) * 100 : 0;
          return (
            <div key={item.id} className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-shadow ${isLow ? "border-[#C13515]/40" : "border-[#DDDDDD]"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-[#222222]">{item.name}</span>
                  {isLow && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF0F0] text-[#C13515]">
                      <AlertTriangle className="h-3 w-3" /> Low
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-[#717171] uppercase tracking-wider bg-[#F7F7F7] px-2.5 py-1 rounded-full">{item.category}</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                <div><div className="text-[11px] text-[#717171] font-semibold uppercase tracking-wider">On Hand</div><div className="font-bold text-[#222222] mt-0.5">{item.currentStock} {item.unit}</div></div>
                <div><div className="text-[11px] text-[#717171] font-semibold uppercase tracking-wider">Par</div><div className="font-bold text-[#222222] mt-0.5">{item.parLevel} {item.unit}</div></div>
                <div><div className="text-[11px] text-[#717171] font-semibold uppercase tracking-wider">Unit Cost</div><div className="font-bold text-[#222222] mt-0.5">${item.unitCost.toFixed(2)}</div></div>
                <div><div className="text-[11px] text-[#717171] font-semibold uppercase tracking-wider">Reorder</div><div className="font-bold text-[#222222] mt-0.5">{item.reorderQty} {item.unit}</div></div>
              </div>
              <div className="bg-[#F7F7F7] rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${pct < 30 ? "bg-[#C13515]" : pct < 60 ? "bg-[#FF385C]" : "bg-[#00A699]"}`}
                  style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div className="text-center text-[#717171] py-12 text-sm">No items found</div>}
      </div>
    </div>
  );
}