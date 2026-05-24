"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cookie } from "lucide-react";

interface Product {
  id: number;
  name: string;
}

export default function DonutEntryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [made, setMade] = useState(0);
  const [sold, setSold] = useState(0);
  const [wasted, setWasted] = useState(0);
  const [period, setPeriod] = useState("AM");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products?type=DONUT")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productId ? Number(productId) : null,
          made,
          sold,
          wasted,
          period,
          notes,
        }),
      });
      if (res.ok) {
        toast.success("Donuts logged! 🍩");
        setProductId("");
        setMade(0);
        setSold(0);
        setWasted(0);
        setNotes("");
      } else {
        toast.error("Failed to log");
      }
    } catch {
      toast.error("Network error");
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Cookie className="h-5 w-5 text-orange-600" />
        <h1 className="text-xl font-bold">Log Donuts</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="product">Donut Type</Label>
          <Select value={productId} onValueChange={(v) => v !== null && setProductId(v)}>
            <SelectTrigger id="product" className="mt-1">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="made">Made</Label>
            <Input id="made" type="number" min={0} value={made} onChange={(e) => setMade(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="sold">Sold</Label>
            <Input id="sold" type="number" min={0} value={sold} onChange={(e) => setSold(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="wasted">Waste</Label>
            <Input id="wasted" type="number" min={0} value={wasted} onChange={(e) => setWasted(Number(e.target.value))} className="mt-1" />
          </div>
        </div>

        <div>
          <Label htmlFor="period">Shift</Label>
          <Select value={period} onValueChange={(v) => v !== null && setPeriod(v)}>
            <SelectTrigger id="period" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM Shift</SelectItem>
              <SelectItem value="PM">PM Shift</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" type="text" placeholder="Optional..." value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
        </div>

        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={submitting}>
          {submitting ? "Logging..." : "Log Donuts 🍩"}
        </Button>
      </form>
    </div>
  );
}