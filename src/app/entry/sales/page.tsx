"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";

export default function SalesEntryPage() {
  const [totalAmount, setTotalAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: parseFloat(totalAmount),
          paymentMethod,
          notes,
          lines: [{ productName: "Quick Sale", quantity: 1, unitPrice: parseFloat(totalAmount), total: parseFloat(totalAmount) }],
        }),
      });
      if (res.ok) {
        toast.success("Sale logged! 💰");
        setTotalAmount("");
        setNotes("");
      } else {
        toast.error("Failed to log sale");
      }
    } catch {
      toast.error("Network error");
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h1 className="text-xl font-bold">Log Sale</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="amount">Total Amount ($) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="mt-1 text-lg"
            required
          />
        </div>

        <div>
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(v) => v !== null && setPaymentMethod(v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CARD">Card</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" type="text" placeholder="Optional..." value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={submitting || !totalAmount}>
          {submitting ? "Logging..." : "Log Sale 💰"}
        </Button>
      </form>
    </div>
  );
}