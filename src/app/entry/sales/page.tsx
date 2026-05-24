"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DollarSign } from "lucide-react";

export default function SalesEntryPage() {
  const [totalAmount, setTotalAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalAmount: parseFloat(totalAmount), paymentMethod, notes, lines: [{ productName: "Quick Sale", quantity: 1, unitPrice: parseFloat(totalAmount), total: parseFloat(totalAmount) }] }),
      });
      if (res.ok) { toast.success("Sale logged! 💰"); setTotalAmount(""); setNotes(""); }
      else { toast.error("Failed to log sale"); }
    } catch { toast.error("Network error"); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#F0FFF4] rounded-xl"><DollarSign className="h-5 w-5 text-[#00A699]" /></div>
        <h1 className="text-xl font-bold tracking-tight">Log Sale</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Total Amount ($) *</label>
          <input type="number" step="0.01" min="0" placeholder="0.00" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required
            className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171] text-lg font-semibold" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Payment Method</label>
          <div className="flex gap-2">
            {[["CARD","💳 Card"],["CASH","💵 Cash"],["OTHER","Other"]].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setPaymentMethod(val)}
                className={`flex-1 py-3 rounded-xl text-[14px] font-semibold border-2 transition-colors ${paymentMethod === val ? "border-[#222222] bg-[#222222] text-white" : "border-[#DDDDDD] text-[#222222] hover:bg-[#F7F7F7]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Notes</label>
          <input type="text" placeholder="Optional..." value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]" />
        </div>
        <button type="submit" disabled={submitting || !totalAmount}
          className="w-full bg-[#FF385C] hover:bg-[#E0304F] disabled:bg-[#FF385C]/40 text-white font-bold py-3.5 rounded-xl text-[16px] transition-colors">
          {submitting ? "Logging..." : "Log Sale 💰"}
        </button>
      </form>
    </div>
  );
}