"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Product { id: number; name: string }

export default function DogelEntryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [sold, setSold] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetch("/api/products?type=DOGEL").then(r => r.json()).then(setProducts).catch(() => {}); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalAmount: 0, paymentMethod: null, notes: "Dogel log", lines: [{ productName: products.find(p => p.id === Number(productId))?.name || "Dogel", quantity: sold, unitPrice: 0, total: 0 }] }),
      });
      if (res.ok) { toast.success("Dogels logged! 🥯"); setSold(0); setProductId(""); }
      else { toast.error("Failed to log"); }
    } catch { toast.error("Network error"); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#FFFFF0] rounded-xl"><span className="text-lg">🥯</span></div>
        <h1 className="text-xl font-bold tracking-tight">Log Dogels</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Dogel Type</label>
          <select value={productId} onChange={e => setProductId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] bg-white focus:border-[#222222] focus:ring-0 transition-colors appearance-none">
            <option value="">Select type...</option>
            {products.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Quantity Sold</label>
          <input type="number" min={0} value={sold} onChange={e => setSold(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors" />
        </div>
        <button type="submit" disabled={submitting || !productId}
          className="w-full bg-[#FF385C] hover:bg-[#E0304F] disabled:bg-[#FF385C]/40 text-white font-bold py-3.5 rounded-xl text-[16px] transition-colors">
          {submitting ? "Logging..." : "Log Dogels 🥯"}
        </button>
      </form>
    </div>
  );
}