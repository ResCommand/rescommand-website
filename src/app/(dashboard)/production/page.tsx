"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

interface ParSheetLine {
  id: number;
  productId: number;
  parLevel: number;
  onHand: number;
  toMake: number;
  predicted: number;
  product: { id: number; name: string };
}

interface ParSheet {
  id: number;
  date: string;
  lines: ParSheetLine[];
}

export default function ProductionPage() {
  const [sheet, setSheet] = useState<ParSheet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prediction")
      .then((r) => r.json())
      .then((data) => setSheet(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Par Sheet</h1>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          Today&apos;s Par Sheet
        </h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Donut Type</th>
                  <th className="text-center py-2 px-3 font-medium">Predicted</th>
                  <th className="text-center py-2 px-3 font-medium">Par Level</th>
                  <th className="text-center py-2 px-3 font-medium">On Hand</th>
                  <th className="text-center py-2 px-3 font-medium">To Make</th>
                </tr>
              </thead>
              <tbody>
                {sheet?.lines.map((line) => (
                  <tr key={line.id} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="py-3 px-3 font-medium">{line.product?.name || "Unknown"}</td>
                    <td className="text-center py-3 px-3">{line.predicted}</td>
                    <td className="text-center py-3 px-3">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                        {line.parLevel}
                      </span>
                    </td>
                    <td className="text-center py-3 px-3">{line.onHand}</td>
                    <td className="text-center py-3 px-3">
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
                        {line.toMake}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!sheet?.lines || sheet.lines.length === 0) && (
            <div className="text-center text-muted-foreground py-4">
              No par sheet data. Generate predictions from the prediction engine.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}