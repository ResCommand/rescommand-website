"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag } from "lucide-react";

interface Product { id: number; name: string }

export default function SandwichEntryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [sold, setSold] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products?type=SANDWICH").then(r => r.json()).then(setProducts).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: 0,
          paymentMethod: null,
          notes: "Sandwich log",
          lines: [{ productName: products.find(p => p.id === Number(productId))?.name || "Sandwich", quantity: sold, unitPrice: 0, total: 0 }],
        }),
      });
      if (res.ok) {
        toast.success("Sandwiches logged! 🥪");
        setSold(0);
        setProductId("");
      } else {
        toast.error("Failed to log");
      }
    } catch { toast.error("Network error"); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🥪</span>
        <h1 className="text-xl font-bold">Log Sandwiches</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Sandwich Type</Label>
          <Select value={productId} onValueChange={(v) => v !== null && setProductId(v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select type..." /></SelectTrigger>
            <SelectContent>
              {products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sold">Quantity Sold</Label>
          <Input id="sold" type="number" min={0} value={sold} onChange={e => setSold(Number(e.target.value))} className="mt-1" />
        </div>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={submitting || !productId}>
          {submitting ? "Logging..." : "Log Sandwiches 🥪"}
        </Button>
      </form>
    </div>
  );
}