"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
interface U { id: number; email: string; name: string; role: string; phone: string | null; active: boolean }
const roleStyle: Record<string, string> = { OWNER: "badge-purple", MANAGER: "badge-blue", EMPLOYEE: "badge-green" };
export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<U[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<U | null>(null);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [role, setRole] = useState("EMPLOYEE"); const [phone, setPhone] = useState(""); const [submitting, setSubmitting] = useState(false);
  const load = () => { fetch("/api/users").then(r => r.json()).then(d => Array.isArray(d) && setUsers(d)); };
  useEffect(() => { load(); }, []);
  function openCreate() { setEditing(null); setName(""); setEmail(""); setPw(""); setRole("EMPLOYEE"); setPhone(""); setDialogOpen(true); }
  function openEdit(u: U) { setEditing(u); setName(u.name); setEmail(u.email); setPw(""); setRole(u.role); setPhone(u.phone || ""); setDialogOpen(true); }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = editing ? { id: editing.id, name, email, role, phone: phone || null, ...(pw ? { password: pw } : {}) } : { name, email, password: pw, role, phone: phone || undefined };
      const r = await fetch("/api/users", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { toast.success(editing ? "Updated" : "Created"); setDialogOpen(false); load(); } else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); } setSubmitting(false);
  }
  async function handleDelete(id: number, n: string) {
    try { const r = await fetch(`/api/users?id=${id}`, { method: "DELETE" }); if (r.ok) { toast.success(`${n} deactivated`); setDelConfirm(null); load(); } else { const d = await r.json(); toast.error(d.error); } } catch { toast.error("Error"); }
  }
  const isOwner = (session?.user as { role?: string })?.role === "OWNER";
  return (
    <div className="space-y-6">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}><h1>Team</h1><p className="text-sm text-gray">Manage accounts and roles</p></div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Add Member</button>
      </div>
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
                    {["EMPLOYEE","MANAGER", ...(isOwner ? ["OWNER"] : [])].map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)} className={`toggle-btn capitalize ${role === r ? "active" : ""}`}>{r.toLowerCase()}</button>
                    ))}
                  </div></div>
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
      <div className="card">
        {users.map(u => (
          <div key={u.id} className={`list-item ${!u.active ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="avatar">{u.name.charAt(0)}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{u.name}</span>
                  <span className={`badge ${roleStyle[u.role] || ""}`}>{u.role}</span>
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