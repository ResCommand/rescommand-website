"use client";

import { useEffect, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface CleaningTask { id: number; title: string; description: string | null; frequency: string; location: string | null; logs: { completedBy: number; completedAt: string; user: { name: string } }[] }

const freqStyle: Record<string, string> = { DAILY: "bg-[#F0F8FF] text-[#0066CC]", WEEKLY: "bg-[#FFF8F0] text-[#CC6600]", MONTHLY: "bg-[#F8F0FF] text-[#6600CC]" };

export default function CleaningPage() {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = () => { fetch("/api/cleaning").then(r => r.json()).then(setTasks).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { loadTasks(); }, []);

  async function markComplete(taskId: number) {
    try {
      const res = await fetch("/api/cleaning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId }) });
      if (res.ok) { toast.success("Done! ✨"); loadTasks(); }
    } catch { toast.error("Failed"); }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cleaning & Maintenance</h1>
        <p className="text-[#717171] text-sm mt-1">Daily tasks and upkeep</p>
      </div>
      <div className="space-y-3">
        {tasks.map(task => {
          const done = task.logs.length > 0;
          return (
            <div key={task.id} className={`bg-white border rounded-2xl p-5 transition-shadow hover:shadow-md ${done ? "border-[#00A699]/30 opacity-70" : "border-[#DDDDDD]"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-[#222222]">{task.title}</span>
                  {done && <Check className="h-4 w-4 text-[#00A699]" />}
                </div>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${freqStyle[task.frequency] || ""}`}>{task.frequency}</span>
                  {task.location && <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#717171] bg-[#F7F7F7]">{task.location}</span>}
                </div>
              </div>
              {task.description && <p className="text-sm text-[#717171] mb-3">{task.description}</p>}
              {done ? (
                <span className="text-xs text-[#00A699] font-semibold">✅ Done by {task.logs[0].user.name}</span>
              ) : (
                <button onClick={() => markComplete(task.id)}
                  className="mt-1 px-5 py-2 rounded-xl text-sm font-bold bg-[#00A699] text-white hover:bg-[#009088] transition-colors">
                  Mark Done ✨
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}