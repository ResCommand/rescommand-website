"use client";
import { useState } from "react";
import { toast } from "sonner";
export default function SalesEntry() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try { const r = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ totalAmount: parseFloat(amount), paymentMethod }) });
      if (r.ok) { toast.success("Sale recorded ✓"); setAmount(""); } else { const d = await r.json(); toast.error(d.error || "Failed"); } } catch { toast.error("Error"); } setSaving(false);
  }
  const methods = ["CASH", "CARD", "MOBILE"];
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Record a Sale</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="form-label">Amount ($) *</label><input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required className="form-input" placeholder="0.00" /></div>
        <div><label className="form-label">Payment Method</label><div className="toggle-group">{methods.map(m => <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`toggle-btn ${paymentMethod === m ? "active" : ""}`}>{m}</button>)}</div></div>
        <button type="submit" disabled={saving} className="btn btn-primary btn-full">{saving ? "Saving..." : "Record Sale"}</button>
      </form>
    </div>
  );
}