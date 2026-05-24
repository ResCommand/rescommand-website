"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
export default function DonutsEntry() {
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [made, setMade] = useState("");
  const [sold, setSold] = useState("");
  const [waste, setWaste] = useState("0");
  const [period, setPeriod] = useState("AM");
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetch("/api/products?category=DONUT").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {}); }, []);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try { const r = await fetch("/api/production", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: parseInt(productId), made: parseInt(made), sold: parseInt(sold), waste: parseFloat(waste) || 0, period }) });
      if (r.ok) { toast.success("Logged ✓"); setProductId(""); setMade(""); setSold(""); setWaste("0"); } else { const d = await r.json(); toast.error(d.error || "Failed"); } } catch { toast.error("Error"); } setSaving(false);
  }
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Log Donut Production</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="form-label">Product *</label><select value={productId} onChange={e => setProductId(e.target.value)} required className="form-input"><option value="">Select...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="grid-3">
          <div><label className="form-label">Made *</label><input type="number" min="0" value={made} onChange={e => setMade(e.target.value)} required className="form-input" /></div>
          <div><label className="form-label">Sold *</label><input type="number" min="0" value={sold} onChange={e => setSold(e.target.value)} required className="form-input" /></div>
          <div><label className="form-label">Waste</label><input type="number" min="0" step="0.1" value={waste} onChange={e => setWaste(e.target.value)} className="form-input" /></div>
        </div>
        <div><label className="form-label">Period</label><div className="toggle-group"><button type="button" onClick={() => setPeriod("AM")} className={`toggle-btn ${period === "AM" ? "active" : ""}`}>AM</button><button type="button" onClick={() => setPeriod("PM")} className={`toggle-btn ${period === "PM" ? "active" : ""}`}>PM</button></div></div>
        <button type="submit" disabled={saving} className="btn btn-primary btn-full">{saving ? "Saving..." : "Log Production"}</button>
      </form>
    </div>
  );
}