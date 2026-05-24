"use client";
import { useState } from "react";
import { toast } from "sonner";
export default function SandwichesEntry() {
  const [count, setCount] = useState("1");
  const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try { const r = await fetch("/api/production", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: null, productType: "SANDWICH", made: parseInt(count), sold: parseInt(count), waste: 0, period: "AM" }) });
      if (r.ok) { toast.success("Sandwich logged ✓"); setCount("1"); } else { const d = await r.json(); toast.error(d.error || "Failed"); } } catch { toast.error("Error"); } setSaving(false);
  }
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Log Sandwiches</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="form-label">Count *</label><input type="number" min="1" value={count} onChange={e => setCount(e.target.value)} required className="form-input" /></div>
        <button type="submit" disabled={saving} className="btn btn-primary btn-full">{saving ? "Saving..." : "Log Sandwiches"}</button>
      </form>
    </div>
  );
}