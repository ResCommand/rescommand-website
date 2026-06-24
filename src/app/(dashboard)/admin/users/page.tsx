"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Settings, Users, ToggleLeft, ToggleRight, Plus, Pencil, Trash2, Tag,
  LayoutGrid, Shield,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────
interface ModuleConfigItem {
  id: number; moduleKey: string; name: string; description: string | null;
  icon: string; enabled: boolean; sortOrder: number; group: string;
}

interface EmployeeCategory {
  id: number; name: string; color: string; sortOrder: number; active: boolean;
  _count?: { members: number };
}

interface TeamMember {
  id: number; email: string; name: string; role: string; phone: string | null;
  active: boolean; categoryId: number | null;
  category: { id: number; name: string; color: string } | null;
}

const GROUP_LABELS: Record<string, string> = {
  operations: "Operations", management: "Management", coffee: "Coffee", marketing: "Marketing",
};

const roleStyle: Record<string, string> = { OWNER: "badge-purple", MANAGER: "badge-blue", EMPLOYEE: "badge-green" };

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner — Full access to everything",
  MANAGER: "Manager — Can manage schedule, inventory, team (except settings)",
  EMPLOYEE: "Employee — Can view schedule, log entries, request time off",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isOwner = role === "OWNER" || role === "PLATFORM_ADMIN";
  const isManager = role === "MANAGER" || role === "OWNER" || role === "PLATFORM_ADMIN";

  const [activeTab, setActiveTab] = useState<"team" | "modules" | "permissions">("team");

  // Team state
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [editingCat, setEditingCat] = useState<EmployeeCategory | null>(null);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [memberRole, setMemberRole] = useState("EMPLOYEE"); const [phone, setPhone] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [catName, setCatName] = useState(""); const [catColor, setCatColor] = useState("#A855F7");

  // Modules state
  const [configs, setConfigs] = useState<ModuleConfigItem[]>([]);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadData = useCallback(() => {
    fetch("/api/users").then(r => r.json()).then(d => Array.isArray(d) && setTeam(d));
    fetch("/api/employee-categories").then(r => r.json()).then(d => Array.isArray(d) && setCategories(d)).catch(() => {});
    if (isOwner) {
      fetch("/api/module-config").then(r => r.json()).then(d => Array.isArray(d) && setConfigs(d));
    }
  }, [isOwner]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Team CRUD ───────────────────────────────────────────
  function openCreate() {
    setEditing(null); setName(""); setEmail(""); setPw(""); setMemberRole("EMPLOYEE"); setPhone(""); setCategoryId(null); setDialogOpen(true);
  }
  function openEdit(u: TeamMember) {
    setEditing(u); setName(u.name); setEmail(u.email); setPw(""); setMemberRole(u.role); setPhone(u.phone || ""); setCategoryId(u.categoryId); setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = editing
        ? { id: editing.id, name, email, role: memberRole, phone: phone || null, categoryId, ...(pw ? { password: pw } : {}) }
        : { name, email, password: pw, role: memberRole, phone: phone || undefined, categoryId };
      const r = await fetch("/api/users", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { toast.success(editing ? "Updated" : "Created"); setDialogOpen(false); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); } setSubmitting(false);
  }

  async function handleDelete(id: number, n: string) {
    try {
      const r = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (r.ok) { toast.success(`${n} deactivated`); setDelConfirm(null); loadData(); }
      else { const d = await r.json(); toast.error(d.error); }
    } catch { toast.error("Error"); }
  }

  // Category CRUD
  function openCatCreate() { setEditingCat(null); setCatName(""); setCatColor("#A855F7"); setCatDialogOpen(true); }
  function openCatEdit(c: EmployeeCategory) { setEditingCat(c); setCatName(c.name); setCatColor(c.color); setCatDialogOpen(true); }

  async function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editingCat ? "PUT" : "POST";
      const body = editingCat ? { id: editingCat.id, name: catName, color: catColor } : { name: catName, color: catColor };
      const r = await fetch("/api/employee-categories", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { toast.success(editingCat ? "Updated" : "Created"); setCatDialogOpen(false); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
  }

  async function handleCatDelete(id: number) {
    try {
      const r = await fetch(`/api/employee-categories?id=${id}`, { method: "DELETE" });
      if (r.ok) { toast.success("Category deleted"); loadData(); }
      else { const d = await r.json(); toast.error(d.error); }
    } catch { toast.error("Error"); }
  }

  // ─── Module toggles ──────────────────────────────────────
  const toggleModule = async (moduleKey: string, enabled: boolean) => {
    setToggling(moduleKey);
    try {
      const r = await fetch("/api/module-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleKey, enabled }),
      });
      if (r.ok) {
        setConfigs(configs.map(c => c.moduleKey === moduleKey ? { ...c, enabled } : c));
        toast.success(`${configs.find(c => c.moduleKey === moduleKey)?.name} ${enabled ? "enabled" : "disabled"}`);
      } else {
        const d = await r.json(); toast.error(d.error || "Failed");
      }
    } catch { toast.error("Error"); }
    setToggling(null);
  };

  const groups = [...new Set(configs.map(c => c.group))];

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Settings size={24} /> Admin</h1>
          <p className="page-subtitle">Manage team members, permissions, and feature toggles</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${activeTab === "team" ? "active" : ""}`} onClick={() => setActiveTab("team")}>
          <Users size={14} /> Team
        </button>
        {isOwner && (
          <button className={`tab ${activeTab === "modules" ? "active" : ""}`} onClick={() => setActiveTab("modules")}>
            <LayoutGrid size={14} /> Features
          </button>
        )}
        <button className={`tab ${activeTab === "permissions" ? "active" : ""}`} onClick={() => setActiveTab("permissions")}>
          <Shield size={14} /> Permissions
        </button>
      </div>

      {/* ═══ Team Tab ═════════════════════════════════════════ */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button onClick={openCatCreate} className="btn btn-secondary btn-sm"><Tag size={14} /> Categories</button>
            <button onClick={openCreate} className="btn btn-primary btn-sm"><Plus size={14} /> Add Member</button>
          </div>

          {/* Category bar */}
          {categories.length > 0 && (
            <div className="card" style={{ padding: "12px 16px" }}>
              <div className="flex items-center gap-3 flex-wrap">
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Categories:</span>
                {categories.map(c => (
                  <span key={c.id} className="flex items-center gap-1" style={{ fontSize: 12 }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color, display: "inline-block" }} />
                    <span style={{ color: "#6B7280" }}>{c.name}</span>
                    <button onClick={() => openCatEdit(c)} className="btn-icon" style={{ padding: 2 }}><Pencil size={10} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Member list */}
          <div className="card">
            {team.map(u => (
              <div key={u.id} className={`list-item ${!u.active ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="avatar">{u.name.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{u.name}</span>
                      <span className={`badge ${roleStyle[u.role] || ""}`}>{u.role}</span>
                      {u.category && (
                        <span className="badge" style={{ backgroundColor: `${u.category.color}20`, color: u.category.color, fontSize: 11 }}>
                          {u.category.name}
                        </span>
                      )}
                      {!u.active && <span className="badge badge-red">Inactive</span>}
                    </div>
                    <div className="text-xs text-gray">{u.email}{u.phone && ` · ${u.phone}`}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(u)} className="btn-icon"><Pencil size={14} /></button>
                  {isOwner && u.active && (delConfirm === u.id
                    ? <div className="flex gap-1"><button onClick={() => handleDelete(u.id, u.name)} className="btn btn-sm btn-danger">Yes</button><button onClick={() => setDelConfirm(null)} className="btn btn-sm btn-secondary">No</button></div>
                    : <button onClick={() => setDelConfirm(u.id)} className="btn-icon" style={{ color: "#DC2626" }}><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Features Tab (owner only) ═══════════════════════ */}
      {activeTab === "modules" && isOwner && (
        <div className="space-y-6">
          {groups.map(group => {
            const groupConfigs = configs.filter(c => c.group === group);
            return (
              <div key={group}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 8 }}>
                  {GROUP_LABELS[group] || group}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                  {groupConfigs.map(c => {
                    const locked = c.moduleKey === "dashboard" || c.moduleKey === "settings" || c.moduleKey === "notifications";
                    return (
                      <div key={c.id} className="card" style={{
                        padding: 16,
                        opacity: c.enabled ? 1 : 0.65,
                        borderLeft: `4px solid ${c.enabled ? "#059669" : "#D1D5DB"}`,
                        transition: "opacity 0.2s, border-color 0.2s",
                      }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span style={{ fontSize: 24 }}>{c.icon}</span>
                            <div>
                              <div className="font-semibold text-sm">{c.name}</div>
                              <div className="text-xs text-gray" style={{ marginTop: 2, maxWidth: 220 }}>{c.description}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleModule(c.moduleKey, !c.enabled)}
                            disabled={toggling === c.moduleKey || locked}
                            style={{
                              background: "none", border: "none",
                              cursor: locked ? "not-allowed" : "pointer",
                              padding: 0, opacity: locked ? 0.4 : 1,
                            }}
                            title={locked ? "This module is always on" : (c.enabled ? "Disable" : "Enable")}
                          >
                            {c.enabled
                              ? <ToggleRight size={36} style={{ color: "#059669" }} />
                              : <ToggleLeft size={36} style={{ color: "#9CA3AF" }} />
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="card" style={{ padding: 16, background: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <p className="text-sm" style={{ color: "#92400E" }}>
              <strong>💡 Tip:</strong> Disabled modules are hidden from the sidebar for all users. You can re-enable them anytime. Dashboard, Admin, and Notifications are always active.
            </p>
          </div>
        </div>
      )}

      {/* ═══ Permissions Tab ═════════════════════════════════ */}
      {activeTab === "permissions" && (
        <div className="space-y-4">
          <div className="card" style={{ padding: 16, background: "#F3EEFF", border: "1px solid #DDD6FE" }}>
            <p className="text-sm" style={{ color: "#6D28D9" }}>
              <strong>Role Permissions Reference</strong> — This shows what each role can access. Roles are assigned when adding or editing team members.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {Object.entries(ROLE_LABELS).map(([roleKey, desc]) => (
              <div key={roleKey} className="card" style={{ padding: 20, borderTop: `4px solid ${roleKey === "OWNER" ? "#7C3AED" : roleKey === "MANAGER" ? "#7C3AED" : "#059669"}` }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                  <span className={`badge ${roleStyle[roleKey]}`}>{roleKey}</span>
                </div>
                <p className="text-sm text-gray" style={{ marginBottom: 12 }}>{desc}</p>

                <div className="text-xs" style={{ color: "#374151" }}>
                  {roleKey === "OWNER" && (
                    <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                      <li>✅ Everything a Manager can do, plus:</li>
                      <li>✅ Toggle features on/off</li>
                      <li>✅ Deactivate team members</li>
                      <li>✅ Delete data permanently</li>
                      <li>✅ Financial reports & owner dashboard</li>
                      <li>✅ Change team member roles</li>
                    </ul>
                  )}
                  {roleKey === "MANAGER" && (
                    <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                      <li>✅ Everything an Employee can do, plus:</li>
                      <li>✅ Add/edit team members</li>
                      <li>✅ Create & publish schedules</li>
                      <li>✅ Approve/deny time-off requests</li>
                      <li>✅ Manage inventory & par levels</li>
                      <li>✅ Create & edit recipes, SOPs</li>
                      <li>✅ Send notifications</li>
                      <li>✅ Log roasts, manage green coffee</li>
                      <li>✅ Schedule social media posts</li>
                    </ul>
                  )}
                  {roleKey === "EMPLOYEE" && (
                    <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                      <li>✅ View own schedule</li>
                      <li>✅ Set availability & blocked days</li>
                      <li>✅ Request time off</li>
                      <li>✅ Log production counts</li>
                      <li>✅ View recipes & SOPs</li>
                      <li>✅ View & receive notifications</li>
                      <li>✅ View menu plans</li>
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Modals ══════════════════════════════════════════ */}

      {/* Add/Edit Member */}
      {dialogOpen && (
        <div className="modal-backdrop" onClick={() => setDialogOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? `Edit ${editing.name}` : "Add Team Member"}</h2></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-3">
                <div><label className="form-label">Name *</label><input value={name} onChange={e => setName(e.target.value)} required className="form-input" /></div>
                <div><label className="form-label">Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" /></div>
                <div><label className="form-label">{editing ? "New Password (leave blank to keep)" : "Password *"}</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} required={!editing} className="form-input" /></div>
                <div><label className="form-label">Role</label>
                  <div className="toggle-group">
                    {["EMPLOYEE", "MANAGER", ...(isOwner ? ["OWNER"] : [])].map(r => (
                      <button key={r} type="button" onClick={() => setMemberRole(r)} className={`toggle-btn capitalize ${memberRole === r ? "active" : ""}`}>{r.toLowerCase()}</button>
                    ))}
                  </div></div>
                {categories.length > 0 && (
                  <div>
                    <label className="form-label">Category</label>
                    <select value={categoryId ?? ""} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : null)} className="form-input">
                      <option value="">— None —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <div><label className="form-label">Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setDialogOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Dialog */}
      {catDialogOpen && (
        <div className="modal-backdrop" onClick={() => setCatDialogOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header"><h2>{editingCat ? "Edit Category" : "Add Category"}</h2></div>
            <form onSubmit={handleCatSubmit}>
              <div className="modal-body space-y-3">
                <div><label className="form-label">Name *</label><input value={catName} onChange={e => setCatName(e.target.value)} required className="form-input" placeholder="e.g. Front of House" /></div>
                <div>
                  <label className="form-label">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={catColor} onChange={e => setCatColor(e.target.value)} style={{ width: 40, height: 32, border: "none", cursor: "pointer" }} />
                    <span className="text-sm text-gray">{catColor}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {editingCat && (
                  <button type="button" onClick={() => { handleCatDelete(editingCat.id); setCatDialogOpen(false); }} className="btn btn-danger" style={{ marginRight: "auto" }}>Delete</button>
                )}
                <button type="button" onClick={() => setCatDialogOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCat ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}