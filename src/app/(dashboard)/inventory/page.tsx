"use client";
import { useEffect, useState } from "react";

interface InvItem { id: number; name: string; fohBoh: string; currentStock: number; quantity: number; unit: string; minStock: number; unitCost: number }
export default function InventoryPage() {
  const [items, setItems] = useState<InvItem[]>([]);
  const [tab, setTab] = useState<"FOH" | "BOH">("FOH");
  useEffect(() => { fetch("/api/inventory").then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])).catch(() => {}); }, []);
  const filtered = items.filter(i => i.fohBoh === tab);
  return (
    <div className="space-y-6">
      <div className="page-header"><h1>Inventory</h1><p className="text-sm text-gray">Track stock levels and orders</p></div>
      <div className="tabs">
        <button className={`tab ${tab === "FOH" ? "active" : ""}`} onClick={() => setTab("FOH")}>Front of House</button>
        <button className={`tab ${tab === "BOH" ? "active" : ""}`} onClick={() => setTab("BOH")}>Back of House</button>
      </div>
      <div className="grid-3">
        {filtered.map(i => {
          const pct = i.minStock > 0 ? Math.min((i.quantity / i.minStock) * 100, 100) : 0;
          const color = pct < 30 ? "red" : pct < 70 ? "yellow" : "green";
          return (
            <div key={i.id} className="card" style={{ padding: 16 }}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm">{i.name}</div>
                {pct < 30 && <span className="badge badge-red">Low</span>}
              </div>
              <div className="text-xs text-gray mb-2">{i.currentStock ?? i.quantity} {i.unit} · ${(i.unitCost ?? 0).toFixed(2)}/{i.unit.replace(/s$/,"")}</div>
              <div className="progress-bar"><div className={`progress-bar-fill ${color}`} style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state">No items</div>}
      </div>
    </div>
  );
}