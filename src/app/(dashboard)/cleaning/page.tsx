"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface Task { id: number; title: string; description: string | null; frequency: string; location: string | null; logs: { user: { name: string } }[] }
const freqStyle: Record<string, string> = { DAILY: "bg-[#EFF6FF] text-[#1A56DB]", WEEKLY: "bg-[#FFFBEB] text-[#B45309]", MONTHLY: "bg-[#F5F3FF] text-[#7C3AED]" };

export default function CleaningPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const loadTasks = () => { fetch("/api/cleaning").then(r => r.json()).then(setTasks).catch(() => {}); };
  useEffect(() => { loadTasks(); }, []);

  async function markDone(id: number) {
    try { const r = await fetch("/api/cleaning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: id }) });
      if (r.ok) { toast.success("Done ✨"); loadTasks(); } } catch { toast.error("Failed"); }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[#111827]">Cleaning & Maintenance</h1><p className="text-sm text-[#6B7280] mt-0.5">Daily tasks and upkeep</p></div>
      <div className="space-y-3">
        {tasks.map(t => {
          const done = t.logs.length > 0;
          return (
            <div key={t.id} className={`bg-white rounded-lg border p-4 ${done ? "border-[#D1FAE5] opacity-60" : "border-[#E5E7EB]"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-sm font-medium text-[#111827]">{t.title}</span>{done && <Check className="h-4 w-4 text-[#059669]" />}</div>
                <div className="flex gap-1.5">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${freqStyle[t.frequency] || ""}`}>{t.frequency}</span>
                  {t.location && <span className="text-[10px] font-medium text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded">{t.location}</span>}
                </div>
              </div>
              {t.description && <p className="text-xs text-[#9CA3AF] mb-2">{t.description}</p>}
              {done ? <span className="text-xs text-[#059669] font-medium">✅ {t.logs[0].user.name}</span>
                : <button onClick={() => markDone(t.id)} className="text-xs font-medium text-[#1A56DB] hover:text-[#1544B0]">Mark Done</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}