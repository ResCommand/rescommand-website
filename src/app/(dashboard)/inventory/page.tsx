"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface Item { id: number; name: string; category: string; unit: string; unitCost: number; parLevel: number; currentStock: number; minStock: number; reorderQty: number }

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [tab, setTab] = useState<"FOH"|"BOH"|"LOW">("FOH");

  useEffect(() => {
    fetch(tab === "LOW" ? "/api/inventory?lowStock=true" : `/api/inventory?category=${tab}`).then(r => r.json()).then(setItems);
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[#111827]">Inventory</h1><p className="text-sm text-[#6B7280] mt-0.5">Track stock levels and orders</p></div>
        <div className="flex gap-1 bg-[#F3F4F6] rounded-lg p-0.5">
          {[["FOH","Front"],["BOH","Back"],["LOW","Low Stock"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k as "FOH"|"BOH"|"LOW")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === k ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#E5E7EB] divide-y divide-[#F3F4F6]">
        {items.map(item => {
          const low = item.currentStock <= item.minStock;
          const pct = item.parLevel > 0 ? (item.currentStock / item.parLevel) * 100 : 0;
          return (
            <div key={item.id} className="p-4 hover:bg-[#FAFAFA]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#111827]">{item.name}</span>
                  {low && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded"><AlertTriangle className="h-3 w-3" />Low</span>}
                </div>
                <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">{item.category}</span>
              </div>
              <div className="grid grid-cols-4 gap-3 text-xs mb-2">
                <div><span className="text-[#9CA3AF]">On Hand</span><div className="font-medium text-[#111827]">{item.currentStock} {item.unit}</div></div>
                <div><span className="text-[#9CA3AF]">Par</span><div className="font-medium text-[#111827]">{item.parLevel} {item.unit}</div></div>
                <div><span className="text-[#9CA3AF]">Cost</span><div className="font-medium text-[#111827]">${item.unitCost.toFixed(2)}</div></div>
                <div><span className="text-[#9CA3AF]">Reorder</span><div className="font-medium text-[#111827]">{item.reorderQty} {item.unit}</div></div>
              </div>
              <div className="bg-[#F3F4F6] rounded-full h-1.5"><div className={`h-1.5 rounded-full transition-all ${pct < 30 ? "bg-[#DC2626]" : pct < 60 ? "bg-[#F59E0B]" : "bg-[#10B981]"}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
            </div>
          );
        })}
        {items.length === 0 && <div className="p-8 text-center text-sm text-[#9CA3AF]">No items found</div>}
      </div>
    </div>
  );
}