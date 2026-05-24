"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
interface P { id: number; name: string }
const inputClass = "w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm bg-white";
const labelClass = "block text-sm font-medium text-[#374151] mb-1";

export default function DogelEntryPage() {
  const [products, setProducts] = useState<P[]>([]);
  const [pid, setPid] = useState("");
  const [sold, setSold] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { fetch("/api/products?type=DOGEL").then(r => r.json()).then(setProducts); }, []);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try { const r = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ totalAmount: 0, paymentMethod: null, notes: "Dogel log", lines: [{ productName: products.find(p => p.id === Number(pid))?.name || "Dogel", quantity: sold, unitPrice: 0, total: 0 }] }) });
      if (r.ok) { toast.success("Logged 🥯"); setSold(0); setPid(""); } else toast.error("Failed"); } catch { toast.error("Error"); }
    setSubmitting(false);
  }
  return (<div className="space-y-5"><h1 className="text-lg font-semibold text-[#111827]">🥯 Log Dogels</h1><form onSubmit={handleSubmit} className="space-y-4">
    <div><label className={labelClass}>Type</label><select value={pid} onChange={e => setPid(e.target.value)} className={inputClass}><option value="">Select...</option>{products.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</select></div>
    <div><label className={labelClass}>Quantity</label><input type="number" min={0} value={sold} onChange={e => setSold(Number(e.target.value))} className={inputClass} /></div>
    <button type="submit" disabled={submitting || !pid} className="w-full bg-[#1A56DB] hover:bg-[#1544B0] disabled:bg-[#1A56DB]/40 text-white font-medium py-2.5 rounded-md text-sm transition-colors">{submitting ? "Logging..." : "Log Dogels"}</button>
  </form></div>);
}