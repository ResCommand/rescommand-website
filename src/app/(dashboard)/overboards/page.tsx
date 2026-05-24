"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface OverboardLine {
  id: number;
  productId: number;
  quantity: number;
  fillings: string | null;
  toppings: string | null;
  product: { id: number; name: string } | null;
}

interface Overboard {
  id: number;
  date: string;
  status: string;
  notes: string | null;
  lines: OverboardLine[];
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  COMPLETE: "bg-green-100 text-green-800",
};

export default function OverboardsPage() {
  const [schedules, setSchedules] = useState<Overboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/overboards")
      .then((r) => r.json())
      .then(setSchedules)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Overboard Calendar</h1>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Overboard Calendar
        </h1>
        <div className="text-sm text-muted-foreground">Next 30 days</div>
      </div>

      <div className="space-y-3">
        {schedules.map((ob) => (
          <Card key={ob.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold">
                    {new Date(ob.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  {ob.notes && (
                    <div className="text-xs text-muted-foreground">{ob.notes}</div>
                  )}
                </div>
                <Badge className={statusColors[ob.status] || "bg-gray-100"}>
                  {ob.status.replace("_", " ")}
                </Badge>
              </div>

              {ob.lines.length > 0 && (
                <div className="space-y-2">
                  {ob.lines.map((line) => (
                    <div
                      key={line.id}
                      className="bg-muted/50 rounded-lg p-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {line.product?.name || "Unknown"}
                        </span>
                        <span className="text-muted-foreground">
                          Qty: {line.quantity}
                        </span>
                      </div>
                      {(line.fillings || line.toppings) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {line.fillings && `Fillings: ${line.fillings}`}
                          {line.fillings && line.toppings && " • "}
                          {line.toppings && `Toppings: ${line.toppings}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {schedules.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No overboards scheduled
          </div>
        )}
      </div>
    </div>
  );
}