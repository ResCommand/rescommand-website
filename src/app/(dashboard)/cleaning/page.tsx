"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Wrench, Check } from "lucide-react";
import { toast } from "sonner";

interface CleaningTask {
  id: number;
  title: string;
  description: string | null;
  frequency: string;
  location: string | null;
  logs: { completedBy: number; completedAt: string; user: { name: string } }[];
}

export default function CleaningPage() {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = () => {
    fetch("/api/cleaning")
      .then((r) => r.json())
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTasks(); }, []);

  async function markComplete(taskId: number) {
    try {
      const res = await fetch("/api/cleaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      if (res.ok) {
        toast.success("Task marked complete! ✨");
        loadTasks();
      }
    } catch {
      toast.error("Failed to mark complete");
    }
  }

  const freqColors: Record<string, string> = {
    DAILY: "bg-blue-100 text-blue-800",
    WEEKLY: "bg-amber-100 text-amber-800",
    MONTHLY: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Cleaning & Maintenance
        </h1>
      </div>

      {/* Cleaning Tasks */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Cleaning Tasks</h2>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 h-20" />
            ))}
          </div>
        ) : (
          tasks.map((task) => {
            const done = task.logs.length > 0;
            return (
              <Card key={task.id} className={done ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{task.title}</span>
                      {done && <Check className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={freqColors[task.frequency] || ""} variant="outline">
                        {task.frequency}
                      </Badge>
                      {task.location && (
                        <Badge variant="outline" className="text-xs">
                          {task.location}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {done ? (
                      <span className="text-xs text-green-600">
                        ✅ Done by {task.logs[0].user.name}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => markComplete(task.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Mark Done ✨
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}