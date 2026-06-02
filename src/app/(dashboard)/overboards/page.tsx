"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar, Plus, Trash2, CheckCircle, Circle, Pencil, X,
} from "lucide-react";
import { toast } from "sonner";

interface OverboardLine {
  id: number; productId: number; quantity: number; quantitySold: number;
  unitPrice: number; upchargePrice: number; upchargesSold: number;
  fillings: string | null; toppings: string | null;
  product: { name: string };
}

interface MenuTaskItem {
  id: number; title: string; completed: boolean; dueDate: string | null;
  assignedTo: number | null; sortOrder: number;
  assignee?: { id: number; name: string } | null;
}

interface MenuPlan {
  id: number; date: string; status: string; name: string | null; notes: string | null;
  lines: OverboardLine[];
  tasks: MenuTaskItem[];
}

interface TeamMember {
  id: number; name: string; role: string;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;
const statusStyle: Record<string, string> = { SCHEDULED: "badge-blue", IN_PROGRESS: "badge-yellow", COMPLETE: "badge-green" };

export default function MenuPlanningPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isManager = role === "MANAGER" || role === "OWNER";

  const [plans, setPlans] = useState<MenuPlan[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);

  // Task form state — keyed by schedule id
  const [taskInput, setTaskInput] = useState<Record<number, string>>({});
  const [addingTask, setAddingTask] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, usersRes] = await Promise.all([
        fetch("/api/overboards").then(r => r.json()),
        isManager ? fetch("/api/users").then(r => r.json()) : Promise.resolve([]),
      ]);
      if (Array.isArray(plansRes)) setPlans(plansRes);
      if (Array.isArray(usersRes)) setTeam(usersRes);
    } catch { /* ignore */ }
    setLoading(false);
  }, [isManager]);

  useEffect(() => { loadData(); }, [loadData]);

  const now = new Date();
  const upcoming = plans.filter(s => new Date(s.date) >= now || s.status !== "COMPLETE");
  const past = plans.filter(s => new Date(s.date) < now && s.status === "COMPLETE");
  const shown = tab === "upcoming" ? upcoming : past;

  // ─── Task CRUD ──────────────────────────────────────────
  const addTask = async (scheduleId: number) => {
    const title = taskInput[scheduleId]?.trim();
    if (!title) { toast.error("Enter a task title"); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/menu-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, title }),
      });
      if (r.ok) { toast.success("Task added"); setTaskInput({ ...taskInput, [scheduleId]: "" }); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setSaving(false);
  };

  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      const r = await fetch("/api/menu-tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, completed }),
      });
      if (r.ok) loadData();
    } catch { /* ignore */ }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await fetch(`/api/menu-tasks?id=${taskId}`, { method: "DELETE" });
      loadData();
    } catch { /* ignore */ }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Calendar size={24} /> Menu Planning</h1>
          <p className="page-subtitle">Plan menus, track tasks, and manage seasonal items</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${tab === "upcoming" ? "active" : ""}`} onClick={() => setTab("upcoming")}>Upcoming</button>
        <button className={`tab ${tab === "past" ? "active" : ""}`} onClick={() => setTab("past")}>Past</button>
      </div>

      {loading ? (
        <div className="card"><div className="empty-state">Loading...</div></div>
      ) : shown.length === 0 ? (
        <div className="card"><div className="empty-state">No menu plans {tab === "upcoming" ? "scheduled" : "completed"}</div></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
          {shown.map(s => {
            const totalSold = s.lines.reduce((sum, l) => sum + l.quantitySold, 0);
            const totalRev = s.lines.reduce((sum, l) => sum + l.quantitySold * l.unitPrice, 0);
            const totalUpcharges = s.lines.reduce((sum, l) => sum + l.upchargesSold, 0);
            const totalUpRev = s.lines.reduce((sum, l) => sum + l.upchargesSold * l.upchargePrice, 0);
            const tasksCompleted = s.tasks?.filter(t => t.completed).length || 0;
            const tasksTotal = s.tasks?.length || 0;

            return (
              <div key={s.id} className="card" style={{ padding: 0 }}>
                {/* Header */}
                <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #E5E7EB" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{s.name || `Menu Plan #${s.id}`}</div>
                      <div className="text-xs text-gray">{new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                    </div>
                    <span className={`badge ${statusStyle[s.status] || "badge-gray"}`}>{s.status.replace("_", " ")}</span>
                  </div>

                  {/* Sales summary */}
                  <div className="flex gap-2 mt-3" style={{ flexWrap: "wrap" }}>
                    <div className="badge badge-green">Sold: {totalSold}</div>
                    <div className="badge badge-blue">Revenue: {fmt(totalRev)}</div>
                    {totalUpcharges > 0 && <div className="badge badge-purple">Upcharges: {totalUpcharges}</div>}
                    {totalUpRev > 0 && <div className="badge badge-orange">Upcharge $: {fmt(totalUpRev)}</div>}
                  </div>
                </div>

                {/* Menu Items */}
                {s.lines && s.lines.length > 0 && (
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E7EB" }}>
                    <div className="text-xs font-semibold text-gray" style={{ marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Menu Items</div>
                    <table style={{ fontSize: 12 }}>
                      <thead><tr><th>Item</th><th>Qty</th><th>Sold</th><th>Price</th></tr></thead>
                      <tbody>
                        {s.lines.map((l, i) => (
                          <tr key={i}>
                            <td className="font-medium">{l.product?.name || "Item"}</td>
                            <td>{l.quantity}</td>
                            <td>{l.quantitySold}</td>
                            <td>{fmt(l.unitPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {s.lines.some(l => l.fillings || l.toppings) && (
                      <div style={{ marginTop: 8 }}>
                        <div className="text-xs text-gray">Fillings & Toppings:</div>
                        {s.lines.map((l, i) => (l.fillings || l.toppings) ? (
                          <div key={i} className="text-xs text-gray" style={{ paddingLeft: 8, borderLeft: "2px solid #E5E7EB", marginBottom: 4 }}>
                            {l.product?.name}: {l.fillings}{l.fillings && l.toppings ? " + " : ""}{l.toppings}
                          </div>
                        ) : null)}
                      </div>
                    )}
                  </div>
                )}

                {/* Tasks Checklist */}
                <div style={{ padding: "12px 16px" }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <div className="text-xs font-semibold text-gray" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Tasks {tasksTotal > 0 && <span style={{ color: tasksCompleted === tasksTotal ? "#059669" : "#6B7280" }}>({tasksCompleted}/{tasksTotal})</span>}
                    </div>
                    {isManager && (
                      <button className="btn btn-secondary btn-sm" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => setAddingTask(addingTask === s.id ? null : s.id)}>
                        <Plus size={12} /> Add Task
                      </button>
                    )}
                  </div>

                  {/* Add task input */}
                  {addingTask === s.id && (
                    <div className="flex gap-2" style={{ marginBottom: 8 }}>
                      <input
                        className="form-input"
                        style={{ fontSize: 12, padding: "4px 8px" }}
                        placeholder="e.g. Update menu, Request special ingredients, Send pics for socials"
                        value={taskInput[s.id] || ""}
                        onChange={e => setTaskInput({ ...taskInput, [s.id]: e.target.value })}
                        onKeyDown={e => e.key === "Enter" && addTask(s.id)}
                        autoFocus
                      />
                      <button className="btn btn-primary btn-sm" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => addTask(s.id)} disabled={saving}>Add</button>
                      <button className="btn btn-secondary btn-sm" style={{ padding: "4px 6px" }} onClick={() => setAddingTask(null)}><X size={12} /></button>
                    </div>
                  )}

                  {/* Task list */}
                  {s.tasks && s.tasks.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {s.tasks.map(t => (
                        <div key={t.id} className="flex items-center gap-2" style={{ padding: "4px 0", borderBottom: "1px solid #F3F4F6" }}>
                          <button
                            onClick={() => toggleTask(t.id, !t.completed)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                          >
                            {t.completed
                              ? <CheckCircle size={16} style={{ color: "#059669" }} />
                              : <Circle size={16} style={{ color: "#D1D5DB" }} />
                            }
                          </button>
                          <span className="text-sm" style={{ textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "#9CA3AF" : "#374151", flex: 1 }}>
                            {t.title}
                          </span>
                          {t.assignee && <span className="text-xs text-gray" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>@{t.assignee.name}</span>}
                          {isManager && (
                            <button onClick={() => deleteTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 0, flexShrink: 0 }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray" style={{ fontStyle: "italic" }}>No tasks yet</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}