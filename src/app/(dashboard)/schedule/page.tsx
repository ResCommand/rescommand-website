"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronLeft, ChevronRight, Calendar, Clock, Plus, Trash2,
  CheckCircle, XCircle, AlertTriangle, Send, Copy, Eye, Pencil,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────
interface ShiftItem {
  id: number; date: string; startTime: string; endTime: string;
  position: string; notes: string | null; published: boolean;
  userId: number; user: { id: number; name: string; role: string };
}

interface AvailBlock {
  id: number; dayOfWeek: number; startTime: string | null; endTime: string | null; reason: string | null;
  userId?: number; user?: { id: number; name: string };
}

interface TimeOffReq {
  id: number; startDate: string; endDate: string; reason: string | null;
  status: string; reviewedBy: number | null; reviewedAt: string | null;
  userId: number; user: { id: number; name: string };
  reviewer: { id: number; name: string } | null;
}

interface TeamMember {
  id: number; name: string; role: string; category?: { name: string; color: string } | null;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const POSITIONS = ["GENERAL", "OPENING", "CLOSING", "FOH", "BOH"];
const POSITION_COLORS: Record<string, string> = {
  GENERAL: "#F3F4F6", OPENING: "#DBEAFE", CLOSING: "#E0E7FF",
  FOH: "#FEF3C7", BOH: "#D1FAE5",
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function fmtDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export default function SchedulePage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isManager = role === "MANAGER" || role === "OWNER";

  const [activeTab, setActiveTab] = useState<"schedule" | "availability" | "timeoff">("schedule");
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [blocks, setBlocks] = useState<AvailBlock[]>([]);
  const [timeOffReqs, setTimeOffReqs] = useState<TimeOffReq[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Shift form
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [shiftForm, setShiftForm] = useState({ userId: 0, date: "", startTime: "06:00", endTime: "14:00", position: "GENERAL", notes: "" });
  const [saving, setSaving] = useState(false);

  // Availability form
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState({ dayOfWeek: 1, allDay: true, startTime: "09:00", endTime: "17:00", reason: "" });

  // Time-off form
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [toForm, setToForm] = useState({ startDate: "", endDate: "", reason: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const ws = fmtDate(weekStart);
      const [shiftsRes, blocksRes, toRes] = await Promise.all([
        fetch(`/api/shifts?week=${ws}`).then(r => r.json()),
        fetch("/api/availability").then(r => r.json()),
        fetch("/api/time-off").then(r => r.json()),
      ]);
      if (shiftsRes?.shifts) setShifts(shiftsRes.shifts);
      if (Array.isArray(blocksRes)) setBlocks(blocksRes);
      if (Array.isArray(toRes)) setTimeOffReqs(toRes);

      if (isManager) {
        const users = await fetch("/api/users").then(r => r.json());
        if (Array.isArray(users)) setTeam(users);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [weekStart, isManager]);

  useEffect(() => { loadData(); }, [loadData]);

  // Week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const isThisWeek = fmtDate(weekStart) === fmtDate(getMonday(new Date()));

  // Group shifts by date
  const shiftsByDate = new Map<string, ShiftItem[]>();
  for (const s of shifts) {
    const d = new Date(s.date).toISOString().split("T")[0];
    if (!shiftsByDate.has(d)) shiftsByDate.set(d, []);
    shiftsByDate.get(d)!.push(s);
  }

  // Check conflicts for a shift
  const hasConflict = (userId: number, date: string, startTime: string, endTime: string): string[] => {
    const conflicts: string[] = [];
    const dateObj = new Date(date + "T00:00:00");
    const dow = dateObj.getDay();

    // Check availability blocks
    for (const b of blocks) {
      if (b.dayOfWeek !== dow && b.dayOfWeek !== -1) continue;
      if (b.startTime === null) { conflicts.push("Blocked day"); break; }
      if (startTime < b.endTime! && endTime > b.startTime!) { conflicts.push("Blocked hours"); break; }
    }

    // Check approved time-off
    for (const t of timeOffReqs) {
      if (t.userId !== userId || t.status !== "APPROVED") continue;
      const start = new Date(t.startDate).getTime();
      const end = new Date(t.endDate).getTime() + 86400000;
      const mid = dateObj.getTime() + 43200000;
      if (mid >= start && mid < end) { conflicts.push("Approved time-off"); break; }
    }

    return conflicts;
  };

  // ─── Shift CRUD ──────────────────────────────────────────
  const saveShift = async () => {
    if (!shiftForm.userId || !shiftForm.date || !shiftForm.startTime || !shiftForm.endTime) {
      toast.error("Fill in all required fields"); return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...shiftForm, published: true }),
      });
      if (r.ok) { toast.success("Shift created"); setShowShiftForm(false); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setSaving(false);
  };

  const deleteShift = async (id: number) => {
    if (!confirm("Delete this shift?")) return;
    try {
      const r = await fetch(`/api/shifts?id=${id}`, { method: "DELETE" });
      if (r.ok) { toast.success("Deleted"); loadData(); }
    } catch { /* ignore */ }
  };

  const publishWeek = async () => {
    if (!confirm("Publish all unpublished shifts for this week? Employees will be notified.")) return;
    try {
      const r = await fetch("/api/shifts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart: fmtDate(weekStart) }),
      });
      const d = await r.json();
      if (d.published > 0) { toast.success(`${d.published} shifts published & notifications sent`); loadData(); }
      else toast.info("No unpublished shifts to publish");
    } catch { toast.error("Error"); }
  };

  // ─── Availability CRUD ───────────────────────────────────
  const saveBlock = async () => {
    try {
      const body = {
        dayOfWeek: blockForm.dayOfWeek,
        startTime: blockForm.allDay ? null : blockForm.startTime,
        endTime: blockForm.allDay ? null : blockForm.endTime,
        reason: blockForm.reason || null,
      };
      const r = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) { toast.success("Availability updated"); setShowBlockForm(false); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
  };

  const deleteBlock = async (id: number) => {
    try {
      await fetch(`/api/availability?id=${id}`, { method: "DELETE" });
      loadData();
    } catch { /* ignore */ }
  };

  // ─── Time-Off CRUD ───────────────────────────────────────
  const saveTimeOff = async () => {
    if (!toForm.startDate || !toForm.endDate) { toast.error("Select dates"); return; }
    try {
      const r = await fetch("/api/time-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toForm),
      });
      if (r.ok) { toast.success("Request submitted"); setShowTimeOffForm(false); setToForm({ startDate: "", endDate: "", reason: "" }); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
  };

  const reviewTimeOff = async (id: number, status: string) => {
    try {
      const r = await fetch("/api/time-off", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (r.ok) { toast.success(status === "APPROVED" ? "Approved" : "Denied"); loadData(); }
    } catch { toast.error("Error"); }
  };

  const cancelTimeOff = async (id: number) => {
    if (!confirm("Cancel this request?")) return;
    try {
      await fetch(`/api/time-off?id=${id}`, { method: "DELETE" });
      toast.success("Cancelled"); loadData();
    } catch { toast.error("Error"); }
  };

  // ─── Render ──────────────────────────────────────────────
  const userId = parseInt((session?.user as { id?: string })?.id || "0");
  const myShifts = shifts.filter(s => s.userId === userId);
  const unpublishedCount = shifts.filter(s => !s.published).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Calendar size={24} /> Schedule</h1>
          <p className="page-subtitle">{isManager ? "Manage employee schedules" : "View your schedule & manage availability"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${activeTab === "schedule" ? "active" : ""}`} onClick={() => setActiveTab("schedule")}>
          <Calendar size={14} /> Schedule
        </button>
        <button className={`tab ${activeTab === "availability" ? "active" : ""}`} onClick={() => setActiveTab("availability")}>
          <Clock size={14} /> My Availability
        </button>
        <button className={`tab ${activeTab === "timeoff" ? "active" : ""}`} onClick={() => setActiveTab("timeoff")}>
          {isManager ? <Eye size={14} /> : <Calendar size={14} />}
          {isManager ? "Time-Off Requests" : "Request Off"}
        </button>
      </div>

      {/* ── Schedule Tab ──────────────────────────────────── */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          {/* Week navigation */}
          <div className="card" style={{ padding: "12px 16px" }}>
            <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 8 }}>
              <div className="flex items-center gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft size={16} /></button>
                <span className="font-semibold text-sm">
                  Week of {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {addDays(weekStart, 6).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight size={16} /></button>
                {!isThisWeek && <button className="btn btn-ghost btn-sm" onClick={() => setWeekStart(getMonday(new Date()))} style={{ fontSize: 11 }}>Today</button>}
              </div>
              {isManager && (
                <div className="flex items-center gap-2">
                  {unpublishedCount > 0 && <span className="badge badge-orange">{unpublishedCount} draft</span>}
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    setShiftForm({ userId: team[0]?.id || 0, date: fmtDate(weekStart), startTime: "06:00", endTime: "14:00", position: "GENERAL", notes: "" });
                    setShowShiftForm(true);
                  }}><Plus size={14} /> Add Shift</button>
                  {unpublishedCount > 0 && (
                    <button className="btn btn-sm" style={{ background: "#059669", color: "#fff" }} onClick={publishWeek}>
                      <Send size={14} /> Publish Week
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add shift form */}
          {showShiftForm && isManager && (
            <div className="card" style={{ padding: 20, border: "2px solid #1A56DB" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Add Shift</h3>
              <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="form-label">Employee *</label>
                  <select className="form-input" value={shiftForm.userId} onChange={e => setShiftForm({ ...shiftForm, userId: parseInt(e.target.value) })}>
                    <option value={0}>Select employee</option>
                    {team.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={shiftForm.date} onChange={e => setShiftForm({ ...shiftForm, date: e.target.value })} min={fmtDate(weekStart)} max={fmtDate(addDays(weekStart, 6))} />
                </div>
                <div>
                  <label className="form-label">Position</label>
                  <select className="form-input" value={shiftForm.position} onChange={e => setShiftForm({ ...shiftForm, position: e.target.value })}>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Start Time *</label>
                  <input type="time" className="form-input" value={shiftForm.startTime} onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">End Time *</label>
                  <input type="time" className="form-input" value={shiftForm.endTime} onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Notes</label>
                  <input className="form-input" value={shiftForm.notes} onChange={e => setShiftForm({ ...shiftForm, notes: e.target.value })} placeholder="Optional" />
                </div>
              </div>
              {/* Conflict warning */}
              {shiftForm.userId && shiftForm.date && hasConflict(shiftForm.userId, shiftForm.date, shiftForm.startTime, shiftForm.endTime).length > 0 && (
                <div style={{ padding: "8px 12px", background: "#FEF3C7", borderRadius: 6, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={16} style={{ color: "#D97706" }} />
                  <span className="text-sm" style={{ color: "#92400E" }}>Conflict: {hasConflict(shiftForm.userId, shiftForm.date, shiftForm.startTime, shiftForm.endTime).join(", ")}</span>
                </div>
              )}
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowShiftForm(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveShift} disabled={saving}>{saving ? "Saving..." : "Create Shift"}</button>
              </div>
            </div>
          )}

          {/* Weekly grid */}
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, minWidth: 700 }}>
              {weekDates.map((d, i) => {
                const key = fmtDate(d);
                const dayShifts = shiftsByDate.get(key) || [];
                const isToday = key === fmtDate(new Date());
                return (
                  <div key={i} style={{ background: isToday ? "#EFF6FF" : "#fff", borderRadius: 8, border: isToday ? "2px solid #1A56DB" : "1px solid #E5E7EB", minHeight: 120 }}>
                    <div style={{ padding: "8px 10px", borderBottom: "1px solid #E5E7EB", textAlign: "center" }}>
                      <div className="text-xs" style={{ color: "#6B7280", fontWeight: 500 }}>{DAYS[d.getDay()]}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: isToday ? "#1A56DB" : "#374151" }}>{d.getDate()}</div>
                    </div>
                    <div style={{ padding: 4 }}>
                      {dayShifts.length === 0 && (
                        <div className="text-xs text-gray" style={{ padding: 4, textAlign: "center" }}>No shifts</div>
                      )}
                      {dayShifts.map(s => {
                        const conflicts = isManager ? hasConflict(s.userId, key, s.startTime, s.endTime) : [];
                        return (
                          <div key={s.id} style={{
                            padding: "4px 6px", margin: "2px 0", borderRadius: 4, fontSize: 11,
                            background: POSITION_COLORS[s.position] || "#F3F4F6",
                            borderLeft: conflicts.length > 0 ? "3px solid #DC2626" : s.published ? "3px solid #059669" : "3px solid #D97706",
                          }}>
                            <div className="font-medium" style={{ fontSize: 11 }}>{isManager ? s.user.name : ""}</div>
                            <div style={{ color: "#6B7280" }}>{s.startTime}–{s.endTime}</div>
                            {s.position !== "GENERAL" && <div className="text-xs" style={{ color: "#9CA3AF" }}>{s.position}</div>}
                            {!s.published && <div className="text-xs" style={{ color: "#D97706" }}>Draft</div>}
                            {isManager && (
                              <button onClick={() => deleteShift(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 0, marginTop: 2 }}>
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Availability Tab ───────────────────────────────── */}
      {activeTab === "availability" && (
        <div className="space-y-4">
          <div className="card" style={{ padding: "12px 16px" }}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray">Block days or hours you can never work. Managers will see these when scheduling.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowBlockForm(true)}><Plus size={14} /> Add Block</button>
            </div>
          </div>

          {showBlockForm && (
            <div className="card" style={{ padding: 20, border: "2px solid #1A56DB" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Add Availability Block</h3>
              <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="form-label">Day</label>
                  <select className="form-input" value={blockForm.dayOfWeek} onChange={e => setBlockForm({ ...blockForm, dayOfWeek: parseInt(e.target.value) })}>
                    <option value={-1}>Every Day</option>
                    {DAY_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-input" value={blockForm.allDay ? "all" : "hours"} onChange={e => setBlockForm({ ...blockForm, allDay: e.target.value === "all" })}>
                    <option value="all">All Day</option>
                    <option value="hours">Specific Hours</option>
                  </select>
                </div>
                {!blockForm.allDay && (
                  <>
                    <div>
                      <label className="form-label">Can&apos;t work from</label>
                      <input type="time" className="form-input" value={blockForm.startTime} onChange={e => setBlockForm({ ...blockForm, startTime: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Can&apos;t work until</label>
                      <input type="time" className="form-input" value={blockForm.endTime} onChange={e => setBlockForm({ ...blockForm, endTime: e.target.value })} />
                    </div>
                  </>
                )}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Reason (optional)</label>
                  <input className="form-input" value={blockForm.reason} onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })} placeholder="e.g. School, Another job" />
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowBlockForm(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveBlock}>Save</button>
              </div>
            </div>
          )}

          {/* Existing blocks */}
          {blocks.length === 0 ? (
            <div className="card"><div className="empty-state">No availability blocks set</div></div>
          ) : (
            <div className="card">
              {blocks.map(b => (
                <div key={b.id} className="list-item">
                  <div>
                    <span className="font-medium text-sm">{b.dayOfWeek === -1 ? "Every Day" : DAY_FULL[b.dayOfWeek]}</span>
                    <span className="text-sm text-gray" style={{ marginLeft: 8 }}>
                      {b.startTime === null ? "— All day" : `${b.startTime} – ${b.endTime}`}
                    </span>
                    {b.reason && <span className="text-xs text-gray" style={{ marginLeft: 8 }}>({b.reason})</span>}
                  </div>
                  <button onClick={() => deleteBlock(b.id)} className="btn-icon" style={{ color: "#DC2626" }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Time-Off Tab ───────────────────────────────────── */}
      {activeTab === "timeoff" && (
        <div className="space-y-4">
          {!isManager && (
            <div className="card" style={{ padding: "12px 16px" }}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray">Request specific dates off.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowTimeOffForm(true)}><Plus size={14} /> Request Off</button>
              </div>
            </div>
          )}

          {showTimeOffForm && (
            <div className="card" style={{ padding: 20, border: "2px solid #1A56DB" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Request Time Off</h3>
              <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="form-label">Start Date *</label>
                  <input type="date" className="form-input" value={toForm.startDate} onChange={e => setToForm({ ...toForm, startDate: e.target.value, endDate: toForm.endDate || e.target.value })} />
                </div>
                <div>
                  <label className="form-label">End Date *</label>
                  <input type="date" className="form-input" value={toForm.endDate} onChange={e => setToForm({ ...toForm, endDate: e.target.value })} min={toForm.startDate} />
                </div>
                <div>
                  <label className="form-label">Reason</label>
                  <input className="form-input" value={toForm.reason} onChange={e => setToForm({ ...toForm, reason: e.target.value })} placeholder="Optional" />
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowTimeOffForm(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveTimeOff}>Submit Request</button>
              </div>
            </div>
          )}

          {timeOffReqs.length === 0 ? (
            <div className="card"><div className="empty-state">No time-off requests</div></div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    {isManager && <th>Employee</th>}
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    {isManager && <th>Actions</th>}
                    {!isManager && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {timeOffReqs.map(r => {
                    const start = new Date(r.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const end = new Date(r.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    return (
                      <tr key={r.id}>
                        {isManager && <td className="font-medium text-sm">{r.user.name}</td>}
                        <td className="text-sm">{start === end ? start : `${start} – ${end}`}</td>
                        <td className="text-sm text-gray">{r.reason || "—"}</td>
                        <td>
                          <span className={`badge ${r.status === "APPROVED" ? "badge-green" : r.status === "DENIED" ? "badge-red" : "badge-orange"}`}>
                            {r.status}
                          </span>
                        </td>
                        {isManager && r.status === "PENDING" && (
                          <td>
                            <div className="flex gap-1">
                              <button onClick={() => reviewTimeOff(r.id, "APPROVED")} className="btn btn-sm" style={{ background: "#059669", color: "#fff", padding: "4px 8px" }}>
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button onClick={() => reviewTimeOff(r.id, "DENIED")} className="btn btn-sm" style={{ background: "#DC2626", color: "#fff", padding: "4px 8px" }}>
                                <XCircle size={12} /> Deny
                              </button>
                            </div>
                          </td>
                        )}
                        {!isManager && r.status === "PENDING" && (
                          <td>
                            <button onClick={() => cancelTimeOff(r.id)} className="btn btn-secondary btn-sm">Cancel</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}