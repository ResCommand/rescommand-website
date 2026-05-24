"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface User { id: number; email: string; name: string; role: string; phone: string | null; active: boolean; createdAt: string }

const roleStyle: Record<string, string> = { OWNER: "bg-[#F8F0FF] text-[#6600CC]", MANAGER: "bg-[#F0F8FF] text-[#0066CC]", EMPLOYEE: "bg-[#F0FFF4] text-[#008844]" };

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("EMPLOYEE");
  const [formPhone, setFormPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = () => { fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d); }).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { loadUsers(); }, []);

  function openCreate() { setEditingUser(null); setFormName(""); setFormEmail(""); setFormPassword(""); setFormRole("EMPLOYEE"); setFormPhone(""); setDialogOpen(true); }
  function openEdit(user: User) { setEditingUser(user); setFormName(user.name); setFormEmail(user.email); setFormPassword(""); setFormRole(user.role); setFormPhone(user.phone || ""); setDialogOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const body: Record<string, unknown> = editingUser
        ? { id: editingUser.id, name: formName, email: formEmail, role: formRole, phone: formPhone || null, ...(formPassword ? { password: formPassword } : {}) }
        : { name: formName, email: formEmail, password: formPassword, role: formRole, phone: formPhone || undefined };
      const res = await fetch("/api/users", { method: editingUser ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { toast.success(editingUser ? `${formName} updated` : `${formName} created`); setDialogOpen(false); loadUsers(); }
      else { const d = await res.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Network error"); }
    setSubmitting(false);
  }

  async function handleDelete(userId: number, userName: string) {
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) { toast.success(`${userName} deactivated`); setDeleteConfirm(null); loadUsers(); }
      else { const d = await res.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Network error"); }
  }

  const isOwner = (session?.user as { role?: string })?.role === "OWNER";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-[#717171] text-sm mt-1">Manage accounts and roles</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#FF385C] text-white hover:bg-[#E0304F] transition-colors">
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
            <h2 className="text-lg font-bold mb-5">{editingUser ? `Edit ${editingUser.name}` : "Add Team Member"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#222222] mb-1.5">Full Name *</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} required placeholder="Jane Doe"
                  className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#222222] mb-1.5">Email *</label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required placeholder="jane@duffers.com"
                  className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#222222] mb-1.5">{editingUser ? "New Password (leave blank to keep)" : "Password *"}</label>
                <input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} required={!editingUser} minLength={editingUser ? undefined : 6} placeholder={editingUser ? "••••••••" : "Min 6 characters"}
                  className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#222222] mb-1.5">Role *</label>
                <div className="flex gap-2">
                  {["EMPLOYEE","MANAGER", ...(isOwner ? ["OWNER"] : [])].map(r => (
                    <button key={r} type="button" onClick={() => setFormRole(r)}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-colors capitalize ${formRole === r ? "border-[#222222] bg-[#222222] text-white" : "border-[#DDDDDD] text-[#222222] hover:bg-[#F7F7F7]"}`}>
                      {r.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#222222] mb-1.5">Phone (optional)</label>
                <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold bg-[#FF385C] text-white hover:bg-[#E0304F] disabled:opacity-50 transition-colors">
                  {submitting ? "Saving..." : editingUser ? "Update" : "Create"}
                </button>
                <button type="button" onClick={() => setDialogOpen(false)} className="px-5 py-3 rounded-xl font-semibold border-2 border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User list */}
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-shadow ${user.active ? "border-[#DDDDDD]" : "border-[#DDDDDD] opacity-50"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#F7F7F7] flex items-center justify-center text-xl font-bold text-[#717171]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#222222]">{user.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${roleStyle[user.role] || ""}`}>{user.role}</span>
                    {!user.active && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF0F0] text-[#C13515]">Inactive</span>}
                  </div>
                  <div className="text-sm text-[#717171] mt-0.5">{user.email}{user.phone && ` · ${user.phone}`}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(user)} className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {isOwner && user.active && (
                  deleteConfirm === user.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(user.id, user.name)} className="px-4 py-2 rounded-xl text-sm font-bold bg-[#C13515] text-white">Confirm</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-[#DDDDDD]">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(user.id)} className="p-2 rounded-xl hover:bg-[#FFF0F0] transition-colors text-[#C13515]">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}