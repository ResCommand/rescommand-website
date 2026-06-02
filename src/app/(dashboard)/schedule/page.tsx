"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronLeft, ChevronRight, Calendar, Clock, Plus, Trash2,
  CheckCircle, XCircle, AlertTriangle, Send, Copy, Eye, Pencil,
  LayoutTemplate, Save, RotateCcw,
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

interface TemplateShiftItem {
  id?: number; dayOfWeek: number; startTime: string; endTime: string; position: string; userId: number;
  user?: { id: number; name: string };
}

interface ScheduleTemplateItem {
  id: number; name: string; isDefault: boolean;
  shifts: TemplateShiftItem[];
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

  const [activeTab, setActiveTab] = useState<"schedule" | "availability" | "timeoff" | "templates">("schedule");
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [blocks, setBlocks] = useState<AvailBlock[]>([]);
  const [timeOffReqs, setTimeOffReqs] = useState<TimeOffReq[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Shift form
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [shiftForm, setShiftForm] = useState({ userId: 0, date: "", startTime: "06:00", endTime: "14:00", position: "GENERAL", notes: "" });
  const [saving, setSaving] = useState(false);

  // Availability form
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState({ dayOfWeek: 1, allDay: true, startTime: "09:00", endTime: "17:00", reason: "" });

  // Time-off form
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState<TimeOffReq | null>(null);
  const [toForm, setToForm] = useState({ startDate: "", endDate: "", reason: "" });

  // Template state
  const [template, setTemplate] = useState<ScheduleTemplateItem | null>(null);
  const [templateShifts, setTemplateShifts] = useState<TemplateShiftItem[]>([]);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateName, setTemplateName] = useState("Default Schedule");

  // Copy week state
  const [showCopyWeek, setShowCopyWeek] = useState(false);
  const [copyTargetWeek, setCopyTargetWeek] = useState("");
  const [copying, setCopying] = useState(false);

  // Apply template state
  const [showApplyTemplate, setShowApplyTemplate] = useState(false);
  const [applying, setApplying] = useState(false);

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

  const loadTemplate = useCallback(async () => {
    try {
      const res = await fetch("/api/schedule-templates");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const t = data[0];
        setTemplate(t);
        setTemplateName(t.name);
        setTemplateShifts(t.shifts.map((s: TemplateShiftItem) => ({
          dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime,
          position: s.position, userId: s.userId, user: s.user,
        })));
      } else {
        setTemplate(null);
        setTemplateShifts([]);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (isManager && activeTab === "templates") loadTemplate(); }, [isManager, activeTab, loadTemplate]);

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

    for (const b of blocks) {
      if (b.dayOfWeek !== dow && b.dayOfWeek !== -1) continue;
      if (b.startTime === null) { conflicts.push("Blocked day"); break; }
      if (startTime < b.endTime! && endTime > b.startTime!) { conflicts.push("Blocked hours"); break; }
    }

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
  const openEditShift = (s: ShiftItem) => {
    setEditingShift(s);
    setShiftForm({
      userId: s.userId,
      date: fmtDate(new Date(s.date)),
      startTime: s.startTime,
      endTime: s.endTime,
      position: s.position,
      notes: s.notes || "",
    });
    setShowShiftForm(true);
  };

  const openAddShift = () => {
    setEditingShift(null);
    setShiftForm({ userId: team[0]?.id || 0, date: fmtDate(weekStart), startTime: "06:00", endTime: "14:00", position: "GENERAL", notes: "" });
    setShowShiftForm(true);
  };

  const saveShift = async () => {
    if (!shiftForm.userId || !shiftForm.date || !shiftForm.startTime || !shiftForm.endTime) {
      toast.error("Fill in all required fields"); return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/shifts", {
        method: editingShift ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...shiftForm, ...(editingShift ? { id: editingShift.id } : { published: true }) }),
      });
      if (r.ok) { toast.success(editingShift ? "Shift updated" : "Shift created"); setShowShiftForm(false); setEditingShift(null); loadData(); }
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

  // ─── Template CRUD ───────────────────────────────────────
  const addTemplateShift = () => {
    if (team.length === 0) { toast.error("No team members"); return; }
    setTemplateShifts([...templateShifts, {
      dayOfWeek: 1, startTime: "06:00", endTime: "14:00", position: "GENERAL", userId: team[0].id,
    }]);
  };

  const updateTemplateShift = (idx: number, field: string, value: string | number) => {
    const updated = [...templateShifts];
    updated[idx] = { ...updated[idx], [field]: value };
    setTemplateShifts(updated);
  };

  const removeTemplateShift = (idx: number) => {
    setTemplateShifts(templateShifts.filter((_, i) => i !== idx));
  };

  const saveTemplate = async () => {
    setTemplateSaving(true);
    try {
      const r = await fetch("/api/schedule-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName, shifts: templateShifts }),
      });
      if (r.ok) { toast.success("Template saved"); loadTemplate(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setTemplateSaving(false);
  };

  const applyTemplate = async () => {
    if (!confirm(`Apply template to week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}? This will create shifts for all template entries.`)) return;
    setApplying(true);
    try {
      const r = await fetch("/api/schedule-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart: fmtDate(weekStart) }),
      });
      const d = await r.json();
      if (r.ok) { toast.success(`${d.created} shifts created, ${d.notified} employees notified`); setShowApplyTemplate(false); loadData(); }
      else { toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setApplying(false);
  };

  const copyWeek = async () => {
    if (!copyTargetWeek) { toast.error("Select a target week"); return; }
    setCopying(true);
    try {
      const r = await fetch("/api/schedule-templates/copy-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceWeek: fmtDate(weekStart), targetWeek: copyTargetWeek }),
      });
      const d = await r.json();
      if (r.ok) { toast.success(`${d.created} shifts copied as drafts to target week`); setShowCopyWeek(false); setCopyTargetWeek(""); }
      else { toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setCopying(false);
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
        {isManager && (
          <button className={`tab ${activeTab === "templates" ? "active" : ""}`} onClick={() => setActiveTab("templates")}>
            <LayoutTemplate size={14} /> Templates
          </button>
        )}
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
                <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                  {unpublishedCount > 0 && <span className="badge badge-orange">{unpublishedCount} draft</span>}
                  <button className="btn btn-primary btn-sm" onClick={openAddShift}><Plus size={14} /> Add Shift</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowCopyWeek(true)}><Copy size={14} /> Copy Week</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowApplyTemplate(true)}><LayoutTemplate size={14} /> Apply Template</button>
                  {unpublishedCount > 0 && (
                    <button className="btn btn-sm" style={{ background: "#059669", color: "#fff" }} onClick={publishWeek}>
                      <Send size={14} /> Publish Week
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Copy Week Modal */}
          {showCopyWeek && (
            <div className="card" style={{ padding: 20, border: "2px solid #1A56DB" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}><Copy size={16} /> Copy Week</h3>
              <p className="text-sm text-gray" style={{ marginBottom: 12 }}>
                Copy all shifts from the week of <strong>{weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong> to another week. Copied shifts are created as drafts.
              </p>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Target Week (Monday) *</label>
                <input type="date" className="form-input" value={copyTargetWeek} onChange={e => setCopyTargetWeek(e.target.value)} />
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowCopyWeek(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={copyWeek} disabled={copying}>{copying ? "Copying..." : "Copy Shifts"}</button>
              </div>
            </div>
          )}

          {/* Apply Template Modal */}
          {showApplyTemplate && (
            <div className="card" style={{ padding: 20, border: "2px solid #1A56DB" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}><LayoutTemplate size={16} /> Apply Template</h3>
              <p className="text-sm text-gray" style={{ marginBottom: 12 }}>
                Apply your default schedule template to the week of <strong>{weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>. 
                Shifts that already exist for an employee on that day/time will be skipped. All new shifts are published immediately and employees are notified.
              </p>
              {!template && <div className="text-sm" style={{ color: "#D97706", marginBottom: 12 }}>⚠ No template saved yet. Go to the Templates tab to create one.</div>}
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowApplyTemplate(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={applyTemplate} disabled={applying || !template}>{applying ? "Applying..." : "Apply Template"}</button>
              </div>
            </div>
          )}

          {/* Add shift form */}
          {showShiftForm && isManager && (
            <div className="card" style={{ padding: 20, border: "2px solid #1A56DB" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{editingShift ? "Edit Shift" : "Add Shift"}</h3>
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
                <button className="btn btn-primary btn-sm" onClick={saveShift} disabled={saving}>{saving ? "Saving..." : (editingShift ? "Update Shift" : "Create Shift")}</button>
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
                              <div className="flex gap-1" style={{ marginTop: 2 }}>
                                <button onClick={() => openEditShift(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563EB", padding: 0 }}>
                                  <Pencil size={10} />
                                </button>
                                <button onClick={() => deleteShift(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 0 }}>
                                  <Trash2 size={10} />
                                </button>
                              </div>
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
          <div className="card" style={{ padding: "12px 16px" }}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray">{isManager ? "All time-off requests. Approve or deny below." : "Request specific dates off."}</p>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingTimeOff(null); setToForm({ startDate: "", endDate: "", reason: "" }); setShowTimeOffForm(true); }}><Plus size={14} /> Request Off</button>
            </div>
          </div>

          {showTimeOffForm && (
            <div className="card" style={{ padding: 20, border: "2px solid #1A56DB" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{editingTimeOff ? "Edit Request" : "Request Time Off"}</h3>
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
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowTimeOffForm(false); setEditingTimeOff(null); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={async () => {
                  if (editingTimeOff) {
                    try {
                      const r = await fetch("/api/time-off", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: editingTimeOff.id, startDate: toForm.startDate, endDate: toForm.endDate, reason: toForm.reason }),
                      });
                      if (r.ok) { toast.success("Updated"); setShowTimeOffForm(false); setEditingTimeOff(null); loadData(); }
                      else { const d = await r.json(); toast.error(d.error || "Failed"); }
                    } catch { toast.error("Error"); }
                  } else {
                    saveTimeOff();
                  }
                }}>{editingTimeOff ? "Update Request" : "Submit Request"}</button>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timeOffReqs.map(r => {
                    const start = new Date(r.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const end = new Date(r.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const isOwn = r.userId === userId;
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
                        <td>
                          <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
                            {isManager && r.status === "PENDING" && (
                              <>
                                <button onClick={() => reviewTimeOff(r.id, "APPROVED")} className="btn btn-sm" style={{ background: "#059669", color: "#fff", padding: "4px 8px" }}>
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button onClick={() => reviewTimeOff(r.id, "DENIED")} className="btn btn-sm" style={{ background: "#DC2626", color: "#fff", padding: "4px 8px" }}>
                                  <XCircle size={12} /> Deny
                                </button>
                              </>
                            )}
                            {r.status === "PENDING" && isOwn && (
                              <>
                                <button onClick={() => {
                                  setEditingTimeOff(r);
                                  setToForm({ startDate: fmtDate(new Date(r.startDate)), endDate: fmtDate(new Date(r.endDate)), reason: r.reason || "" });
                                  setShowTimeOffForm(true);
                                }} className="btn btn-secondary btn-sm"><Pencil size={12} /> Edit</button>
                                <button onClick={() => cancelTimeOff(r.id)} className="btn btn-secondary btn-sm">Cancel</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Templates Tab ──────────────────────────────────── */}
      {activeTab === "templates" && isManager && (
        <div className="space-y-4">
          <div className="card" style={{ padding: "12px 16px" }}>
            <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 8 }}>
              <div>
                <p className="text-sm text-gray">Define a default weekly schedule. Apply it to any week with one click, or copy an existing week&apos;s shifts.</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-primary btn-sm" onClick={addTemplateShift}><Plus size={14} /> Add Shift Slot</button>
                <button className="btn btn-sm" style={{ background: "#059669", color: "#fff" }} onClick={saveTemplate} disabled={templateSaving}>
                  <Save size={14} /> {templateSaving ? "Saving..." : "Save Template"}
                </button>
                {template && (
                  <button className="btn btn-secondary btn-sm" onClick={async () => {
                    if (!confirm("Delete this template?")) return;
                    await fetch("/api/schedule-templates", { method: "DELETE" });
                    setTemplate(null); setTemplateShifts([]);
                    toast.success("Template deleted");
                  }}><Trash2 size={14} /> Delete</button>
                )}
              </div>
            </div>
          </div>

          {/* Template name */}
          <div className="card" style={{ padding: "12px 16px" }}>
            <div className="flex items-center gap-3">
              <label className="form-label" style={{ marginBottom: 0, whiteSpace: "nowrap" }}>Template Name</label>
              <input className="form-input" value={templateName} onChange={e => setTemplateName(e.target.value)} style={{ maxWidth: 300 }} />
            </div>
          </div>

          {/* Template shift editor — grid by day */}
          {templateShifts.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <LayoutTemplate size={32} style={{ color: "#9CA3AF", marginBottom: 8 }} />
                <p>No shift slots yet. Click &quot;Add Shift Slot&quot; to define recurring shifts.</p>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, minWidth: 800 }}>
                {DAY_FULL.map((dayName, dow) => {
                  const dayShifts = templateShifts.filter(s => s.dayOfWeek === dow);
                  return (
                    <div key={dow} style={{ background: "#fff", borderRadius: 8, border: "1px solid #E5E7EB", minHeight: 80 }}>
                      <div style={{ padding: "8px 10px", borderBottom: "1px solid #E5E7EB", textAlign: "center", background: "#F9FAFB", borderRadius: "8px 8px 0 0" }}>
                        <div className="text-xs font-semibold" style={{ color: "#374151" }}>{dayName}</div>
                      </div>
                      <div style={{ padding: 4 }}>
                        {dayShifts.length === 0 && (
                          <div className="text-xs text-gray" style={{ padding: 4, textAlign: "center" }}>—</div>
                        )}
                        {dayShifts.map((s, idx) => {
                          const globalIdx = templateShifts.indexOf(s);
                          return (
                            <div key={idx} style={{
                              padding: "4px 6px", margin: "2px 0", borderRadius: 4, fontSize: 11,
                              background: POSITION_COLORS[s.position] || "#F3F4F6",
                              position: "relative",
                            }}>
                              <div className="font-medium" style={{ fontSize: 11 }}>{team.find(t => t.id === s.userId)?.name || "Unassigned"}</div>
                              <div style={{ color: "#6B7280" }}>{s.startTime}–{s.endTime}</div>
                              {s.position !== "GENERAL" && <div className="text-xs" style={{ color: "#9CA3AF" }}>{s.position}</div>}
                              <button onClick={() => removeTemplateShift(globalIdx)} style={{ position: "absolute", top: 2, right: 2, background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 0 }}>
                                <Trash2 size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Template shift list (editable) */}
          {templateShifts.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Edit Shift Slots</h3>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Employee</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Position</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateShifts.map((s, idx) => (
                      <tr key={idx}>
                        <td>
                          <select className="form-input" value={s.dayOfWeek} onChange={e => updateTemplateShift(idx, "dayOfWeek", parseInt(e.target.value))} style={{ minWidth: 90 }}>
                            {DAY_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
                          </select>
                        </td>
                        <td>
                          <select className="form-input" value={s.userId} onChange={e => updateTemplateShift(idx, "userId", parseInt(e.target.value))} style={{ minWidth: 120 }}>
                            <option value={0}>Select</option>
                            {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="time" className="form-input" value={s.startTime} onChange={e => updateTemplateShift(idx, "startTime", e.target.value)} style={{ width: 100 }} />
                        </td>
                        <td>
                          <input type="time" className="form-input" value={s.endTime} onChange={e => updateTemplateShift(idx, "endTime", e.target.value)} style={{ width: 100 }} />
                        </td>
                        <td>
                          <select className="form-input" value={s.position} onChange={e => updateTemplateShift(idx, "position", e.target.value)} style={{ minWidth: 100 }}>
                            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </td>
                        <td>
                          <button onClick={() => removeTemplateShift(idx)} className="btn-icon" style={{ color: "#DC2626" }}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="card" style={{ padding: "12px 16px" }}>
            <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 8 }}>
              <p className="text-sm text-gray">Apply this template to the current week from the Schedule tab, or use &quot;Copy Week&quot; to duplicate an existing week.</p>
              <button className="btn btn-primary btn-sm" onClick={() => { setActiveTab("schedule"); setShowApplyTemplate(true); }}>
                <LayoutTemplate size={14} /> Go Apply to Current Week
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}