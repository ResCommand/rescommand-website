"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Product { id: number; name: string; category: string }

export default function WastePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [wasteQty, setWasteQty] = useState("");
  const [wasteReason, setWasteReason] = useState("EXPIRED");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(productId) || null,
          productType: "WASTE",
          made: 0,
          sold: 0,
          waste: parseFloat(wasteQty) || 0,
          period: "AM",
          notes: `Waste: ${wasteReason}${notes ? " — " + notes : ""}`,
        }),
      });
      if (r.ok) {
        toast.success("Waste logged ✓");
        setProductId(""); setWasteQty(""); setNotes("");
      } else {
        const d = await r.json();
        toast.error(d.error || "Failed");
      }
    } catch { toast.error("Error"); }
    setSaving(false);
  }

  const reasons = ["EXPIRED", "DROPPED", "OVERPRODUCTION", "QUALITY", "OTHER"];
  const inputStyle = "w-full px-3 py-2.5 border border-[#D1D5DB] rounded-md text-sm bg-white";
  const labelStyle = "block text-xs font-medium text-[#374151] mb-1";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">🗑️ Log Waste</h2>
        <p className="text-xs text-[#6B7280] mt-1">Record wasted product and reason</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelStyle}>Product *</label>
          <select value={productId} onChange={e => setProductId(e.target.value)} required className={inputStyle}>
            <option value="">Select...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelStyle}>Quantity Wasted *</label>
          <input type="number" min="1" step="0.5" value={wasteQty} onChange={e => setWasteQty(e.target.value)} required className={inputStyle} placeholder="0" />
        </div>

        <div>
          <label className={labelStyle}>Reason</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {reasons.map(r => (
              <button key={r} type="button" onClick={() => setWasteReason(r)}
                style={{
                  padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: wasteReason === r ? "1px solid #7C3AED" : "1px solid #D1D5DB",
                  background: wasteReason === r ? "#7C3AED" : "#fff",
                  color: wasteReason === r ? "#fff" : "#374151",
                }}
              >{r}</button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelStyle}>Notes</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} className={inputStyle} placeholder="Optional details" />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: "100%", padding: "12px 16px", fontSize: 14 }}>
          {saving ? "Saving..." : "Log Waste"}
        </button>
      </form>
    </div>
  );
}