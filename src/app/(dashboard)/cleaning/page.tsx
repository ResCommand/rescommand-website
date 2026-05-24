"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
interface Task { id: number; task: string; frequency: string; fohBoh: string }
export default function CleaningPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const load = () => { fetch("/api/cleaning").then(r => r.json()).then(d => setTasks(Array.isArray(d) ? d : [])).catch(() => {}); };
  useEffect(() => { load(); }, []);
  async function complete(id: number) { const r = await fetch("/api/cleaning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: id }) }); if (r.ok) { toast.success("Done ✓"); load(); } }
  const fStyle: Record<string, string> = { DAILY: "badge-blue", WEEKLY: "badge-green", MONTHLY: "badge-purple" };
  return (
    <div className="space-y-6">
      <div className="page-header"><h1>Cleaning</h1><p className="text-sm text-gray">Tasks and maintenance schedule</p></div>
      <div className="card">
        {tasks.map(t => (
          <div key={t.id} className="list-item">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium text-sm">{t.task}</div>
                <div className="text-xs text-gray">{t.fohBoh === "FOH" ? "Front of House" : "Back of House"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${fStyle[t.frequency] || "badge-gray"}`}>{t.frequency}</span>
              <button className="btn btn-sm btn-secondary" onClick={() => complete(t.id)}>Done</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div className="empty-state">No tasks</div>}
      </div>
    </div>
  );
}