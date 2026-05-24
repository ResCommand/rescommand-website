"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface P { id: number; name: string }
const inputClass = "w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm bg-white placeholder:text-[#9CA3AF]";
const labelClass = "block text-sm font-medium text-[#374151] mb-1";

export default function DonutEntryPage() {
  const [products, setProducts] = useState<P[]>([]);
  const [productId, setProductId] = useState("");
  const [made, setMade] = useState(0);
  const [sold, setSold] = useState(0);
  const [wasted, setWasted] = useState(0);
  const [period, setPeriod] = useState("AM");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetch("/api/products?type=DONUT").then(r => r.json()).then(setProducts); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/production", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: productId ? Number(productId) : null, made, sold, wasted, period, notes }) });
      if (res.ok) { toast.success("Logged 🍩"); setProductId(""); setMade(0); setSold(0); setWasted(0); setNotes(""); }
      else toast.error("Failed");
    } catch { toast.error("Error"); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-[#111827]">🍩 Log Donuts</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className={labelClass}>Donut Type</label>
          <select value={productId} onChange={e => setProductId(e.target.value)} className={inputClass}>
            <option value="">Select...</option>{products.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className={labelClass}>Made</label><input type="number" min={0} value={made} onChange={e => setMade(Number(e.target.value))} className={inputClass} /></div>
          <div><label className={labelClass}>Sold</label><input type="number" min={0} value={sold} onChange={e => setSold(Number(e.target.value))} className={inputClass} /></div>
          <div><label className={labelClass}>Waste</label><input type="number" min={0} value={wasted} onChange={e => setWasted(Number(e.target.value))} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Shift</label>
          <div className="flex gap-2">
            {["AM","PM"].map(p => (
              <button key={p} type="button" onClick={() => setPeriod(p)}
                className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${period === p ? "bg-[#1A56DB] text-white border-[#1A56DB]" : "bg-white text-[#374151] border-[#D1D5DB] hover:bg-[#F9FAFB]"}`}>
                {p} Shift
              </button>
            ))}
          </div></div>
        <div><label className={labelClass}>Notes</label><input type="text" placeholder="Optional..." value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} /></div>
        <button type="submit" disabled={submitting} className="w-full bg-[#1A56DB] hover:bg-[#1544B0] disabled:bg-[#1A56DB]/40 text-white font-medium py-2.5 rounded-md text-sm transition-colors">
          {submitting ? "Logging..." : "Log Donuts"}</button>
      </form>
    </div>
  );
}