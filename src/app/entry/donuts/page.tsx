"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Cookie } from "lucide-react";

interface Product { id: number; name: string }

export default function DonutEntryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [made, setMade] = useState(0);
  const [sold, setSold] = useState(0);
  const [wasted, setWasted] = useState(0);
  const [period, setPeriod] = useState("AM");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetch("/api/products?type=DONUT").then(r => r.json()).then(setProducts).catch(() => {}); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/production", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productId ? Number(productId) : null, made, sold, wasted, period, notes }),
      });
      if (res.ok) { toast.success("Donuts logged! 🍩"); setProductId(""); setMade(0); setSold(0); setWasted(0); setNotes(""); }
      else { toast.error("Failed to log"); }
    } catch { toast.error("Network error"); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#FFF8F0] rounded-xl"><Cookie className="h-5 w-5 text-[#FF385C]" /></div>
        <h1 className="text-xl font-bold tracking-tight">Log Donuts</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Donut Type</label>
          <select value={productId} onChange={e => setProductId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] bg-white focus:border-[#222222] focus:ring-0 transition-colors appearance-none">
            <option value="">Select type...</option>
            {products.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-2">Made</label>
            <input type="number" min={0} value={made} onChange={e => setMade(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-2">Sold</label>
            <input type="number" min={0} value={sold} onChange={e => setSold(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-2">Waste</label>
            <input type="number" min={0} value={wasted} onChange={e => setWasted(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Shift</label>
          <div className="flex gap-2">
            {["AM", "PM"].map(p => (
              <button key={p} type="button" onClick={() => setPeriod(p)}
                className={`flex-1 py-3 rounded-xl text-[15px] font-semibold border-2 transition-colors ${period === p ? "border-[#222222] bg-[#222222] text-white" : "border-[#DDDDDD] text-[#222222] hover:bg-[#F7F7F7]"}`}>
                {p} Shift
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Notes</label>
          <input type="text" placeholder="Optional..." value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]" />
        </div>
        <button type="submit" disabled={submitting}
          className="w-full bg-[#FF385C] hover:bg-[#E0304F] disabled:bg-[#FF385C]/40 text-white font-bold py-3.5 rounded-xl text-[16px] transition-colors">
          {submitting ? "Logging..." : "Log Donuts 🍩"}
        </button>
      </form>
    </div>
  );
}