"use client";

import { useState } from "react";
import { toast } from "sonner";

const inputClass = "w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm bg-white placeholder:text-[#9CA3AF]";
const labelClass = "block text-sm font-medium text-[#374151] mb-1";

export default function SalesEntryPage() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CARD");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ totalAmount: parseFloat(amount), paymentMethod: method, notes, lines: [{ productName: "Quick Sale", quantity: 1, unitPrice: parseFloat(amount), total: parseFloat(amount) }] }) });
      if (res.ok) { toast.success("Logged 💰"); setAmount(""); setNotes(""); }
      else toast.error("Failed");
    } catch { toast.error("Error"); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-[#111827]">💰 Log Sale</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className={labelClass}>Total ($) *</label><input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required className={`${inputClass} font-semibold text-base`} /></div>
        <div><label className={labelClass}>Payment</label>
          <div className="flex gap-2">
            {[["CARD","💳 Card"],["CASH","💵 Cash"]].map(([v,l]) => (
              <button key={v} type="button" onClick={() => setMethod(v)}
                className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${method === v ? "bg-[#1A56DB] text-white border-[#1A56DB]" : "bg-white text-[#374151] border-[#D1D5DB] hover:bg-[#F9FAFB]"}`}>{l}</button>
            ))}
          </div></div>
        <div><label className={labelClass}>Notes</label><input type="text" placeholder="Optional..." value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} /></div>
        <button type="submit" disabled={submitting || !amount} className="w-full bg-[#1A56DB] hover:bg-[#1544B0] disabled:bg-[#1A56DB]/40 text-white font-medium py-2.5 rounded-md text-sm transition-colors">{submitting ? "Logging..." : "Log Sale"}</button>
      </form>
    </div>
  );
}