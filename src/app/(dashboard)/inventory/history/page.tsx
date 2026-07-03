"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InventoryNav from "@/components/inventory/InventoryNav";
import { Calendar } from "lucide-react";

interface CountLine {
  id: number;
  inventoryItemId: number;
  onHand: number;
  parLevel: number;
  amountToOrder: number;
  inventoryItem: {
    id: number;
    name: string;
    unit: string;
    vendor: { id: number; name: string } | null;
  } | null;
}

interface CountRecord {
  id: number;
  date: string;
  notes: string | null;
  createdAt: string;
  counter: { id: number; name: string } | null;
  _count: { lines: number };
  lines: CountLine[];
}

export default function CountHistoryPage() {
  const [counts, setCounts] = useState<CountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/inventory/counts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCounts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalToOrder = (lines: CountLine[]) =>
    lines.reduce((sum, l) => sum + l.amountToOrder, 0);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Count History</h1></div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Count History</h1>
            <p className="text-sm text-gray">
              {counts.length} past count{counts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <InventoryNav />

      {counts.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No counts yet</h3>
          <p className="text-sm text-gray" style={{ maxWidth: 400, margin: "0 auto 16px" }}>
            Once you save inventory counts, they&apos;ll appear here with full line-item details.
          </p>
          <Link href="/inventory" className="btn btn-primary btn-sm">Go to Inventory</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {counts.map((count) => {
            const isOpen = expanded.has(count.id);
            const total = totalToOrder(count.lines);
            return (
              <div key={count.id} className="card" style={{ overflow: "hidden" }}>
                {/* Row header */}
                <div
                  onClick={() => toggle(count.id)}
                  style={{ padding: "14px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <Calendar size={16} className="text-gray" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div className="font-semibold text-sm">
                        {new Date(count.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="text-xs text-gray">
                        {count.counter?.name || "Unknown"} · {count._count.lines} items
                        {total > 0 && <span style={{ color: "#EA580C", marginLeft: 6 }}>· {total.toLocaleString()} to order</span>}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: "#9CA3AF", flexShrink: 0 }}>{isOpen ? "−" : "+"}</span>
                </div>

                {/* Expanded line items */}
                {isOpen && count.lines.length > 0 && (
                  <div style={{ borderTop: "1px solid #F1F3F5", overflowX: "auto" }}>
                    <table style={{ fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#F9FAFB" }}>
                          <th>Item</th>
                          <th>Vendor</th>
                          <th style={{ textAlign: "right" }}>On Hand</th>
                          <th style={{ textAlign: "right" }}>Par</th>
                          <th style={{ textAlign: "right" }}>To Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {count.lines.map((line) => (
                          <tr key={line.id}>
                            <td className="font-medium">{line.inventoryItem?.name || "— (deleted)"}</td>
                            <td className="text-sm">{line.inventoryItem?.vendor?.name || "—"}</td>
                            <td style={{ textAlign: "right" }}>{line.onHand} {line.inventoryItem?.unit || ""}</td>
                            <td style={{ textAlign: "right" }}>{line.parLevel}</td>
                            <td style={{ textAlign: "right" }}>
                              <span style={{ fontWeight: 600, color: line.amountToOrder > 0 ? "#EA580C" : "#9CA3AF" }}>
                                {line.amountToOrder > 0 ? line.amountToOrder : "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {isOpen && count.lines.length === 0 && (
                  <div style={{ borderTop: "1px solid #F1F3F5", padding: 20, textAlign: "center" }}>
                    <span className="text-sm text-gray">No line items in this count</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
