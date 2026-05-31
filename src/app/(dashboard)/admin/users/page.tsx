"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

interface EmployeeCategory {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
  active: boolean;
  _count?: { members: number };
}

interface U {
  id: number; email: string; name: string; role: string; phone: string | null;
  active: boolean; categoryId: number | null;
  category: { id: number; name: string; color: string } | null;
}

const roleStyle: Record<string, string> = { OWNER: "badge-purple", MANAGER: "badge-blue", EMPLOYEE: "badge-green" };

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<U[]>([]);
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editing, setEditing] = useState<U | null>(null);
  const [editingCat, setEditingCat] = useState<EmployeeCategory | null>(null);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [role, setRole] = useState("EMPLOYEE"); const [phone, setPhone] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Category form
  const [catName, setCatName] = useState(""); const [catColor, setCatColor] = useState("#3B82F6");

  const isOwner = (session?.user as { role?: string })?.role === "OWNER";

  const load = () => {
    fetch("/api/users").then(r => r.json()).then(d => Array.isArray(d) && setUsers(d));
    fetch("/api/employee-categories").then(r => r.json()).then(d => Array.isArray(d) && setCategories(d)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null); setName(""); setEmail(""); setPw(""); setRole("EMPLOYEE"); setPhone(""); setCategoryId(null); setDialogOpen(true);
  }
  function openEdit(u: U) {
    setEditing(u); setName(u.name); setEmail(u.email); setPw(""); setRole(u.role); setPhone(u.phone || ""); setCategoryId(u.categoryId); setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = editing
        ? { id: editing.id, name, email, role, phone: phone || null, categoryId, ...(pw ? { password: pw } : {}) }
        : { name, email, password: pw, role, phone: phone || undefined, categoryId };
      const r = await fetch("/api/users", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { toast.success(editing ? "Updated" : "Created"); setDialogOpen(false); load(); } else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); } setSubmitting(false);
  }

  async function handleDelete(id: number, n: string) {
    try {
      const r = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (r.ok) { toast.success(`${n} deactivated`); setDelConfirm(null); load(); }
      else { const d = await r.json(); toast.error(d.error); }
    } catch { toast.error("Error"); }
  }

  // Category CRUD
  function openCatCreate() { setEditingCat(null); setCatName(""); setCatColor("#3B82F6"); setCatDialogOpen(true); }
  function openCatEdit(c: EmployeeCategory) { setEditingCat(c); setCatName(c.name); setCatColor(c.color); setCatDialogOpen(true); }

  async function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editingCat ? "PUT" : "POST";
      const body = editingCat ? { id: editingCat.id, name: catName, color: catColor } : { name: catName, color: catColor };
      const r = await fetch("/api/employee-categories", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { toast.success(editingCat ? "Updated" : "Created"); setCatDialogOpen(false); load(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
  }

  async function handleCatDelete(id: number) {
    try {
      const r = await fetch(`/api/employee-categories?id=${id}`, { method: "DELETE" });
      if (r.ok) { toast.success("Category deleted"); load(); }
      else { const d = await r.json(); toast.error(d.error); }
    } catch { toast.error("Error"); }
  }

  return (
    <div className="space-y-6">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Team</h1>
          <p className="text-sm text-gray">Manage accounts, roles, and categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCatCreate} className="btn btn-secondary"><Tag size={16} /> Categories</button>
          <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Add Member</button>
        </div>
      </div>

      {/* Employee Categories */}
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

      {/* User Dialog */}
      {dialogOpen && (
        <div className="modal-backdrop" onClick={() => setDialogOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? `Edit ${editing.name}` : "Add Member"}</h2></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-3">
                <div><label className="form-label">Name *</label><input value={name} onChange={e => setName(e.target.value)} required className="form-input" /></div>
                <div><label className="form-label">Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" /></div>
                <div><label className="form-label">{editing ? "New Password" : "Password *"}</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} required={!editing} className="form-input" /></div>
                <div><label className="form-label">Role</label>
                  <div className="toggle-group">
                    {["EMPLOYEE", "MANAGER", ...(isOwner ? ["OWNER"] : [])].map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)} className={`toggle-btn capitalize ${role === r ? "active" : ""}`}>{r.toLowerCase()}</button>
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

      {/* User List */}
      <div className="card">
        {users.map(u => (
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
  );
}