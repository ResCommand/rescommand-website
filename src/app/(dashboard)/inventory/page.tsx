"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  parLevel: number;
  currentStock: number;
  minStock: number;
  reorderQty: number;
  supplier: string | null;
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [tab, setTab] = useState<"FOH" | "BOH" | "LOW">("FOH");

  useEffect(() => {
    const url = tab === "LOW" ? "/api/inventory?lowStock=true" : `/api/inventory?category=${tab}`;
    fetch(url).then((r) => r.json()).then(setItems).catch(() => {});
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Inventory
        </h1>
      </div>

      <div className="flex gap-2">
        {(["FOH", "BOH", "LOW"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"
            }`}
          >
            {t === "LOW" ? "⚠️ Low Stock" : t === "FOH" ? "🏪 Front of House" : "🔪 Back of House"}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {items.map((item) => {
          const isLow = item.currentStock <= item.minStock;
          const stockPercent = item.parLevel > 0 ? (item.currentStock / item.parLevel) * 100 : 0;

          return (
            <Card key={item.id} className={isLow ? "border-red-300" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {isLow && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">On Hand</div>
                    <div className="font-medium">{item.currentStock} {item.unit}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Par Level</div>
                    <div className="font-medium">{item.parLevel} {item.unit}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Unit Cost</div>
                    <div className="font-medium">${item.unitCost.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Reorder Qty</div>
                    <div className="font-medium">{item.reorderQty} {item.unit}</div>
                  </div>
                </div>
                <div className="mt-2 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      stockPercent < 30 ? "bg-red-500" : stockPercent < 60 ? "bg-amber-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(100, stockPercent)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {items.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No items found</div>
        )}
      </div>
    </div>
  );
}