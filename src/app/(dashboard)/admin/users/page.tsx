"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface U { id: number; email: string; name: string; role: string; phone: string | null; active: boolean }
const roleStyle: Record<string, string> = { OWNER: "bg-[#F5F3FF] text-[#7C3AED]", MANAGER: "bg-[#EFF6FF] text-[#1A56DB]", EMPLOYEE: "bg-[#ECFDF5] text-[#059669]" };

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<U[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<U | null>(null);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => { fetch("/api/users").then(r => r.json()).then(d => Array.isArray(d) && setUsers(d)); };
  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setName(""); setEmail(""); setPw(""); setRole("EMPLOYEE"); setPhone(""); setDialogOpen(true); }
  function openEdit(u: U) { setEditing(u); setName(u.name); setEmail(u.email); setPw(""); setRole(u.role); setPhone(u.phone || ""); setDialogOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = editing
        ? { id: editing.id, name, email, role, phone: phone || null, ...(pw ? { password: pw } : {}) }
        : { name, email, password: pw, role, phone: phone || undefined };
      const r = await fetch("/api/users", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { toast.success(editing ? "Updated" : "Created"); setDialogOpen(false); load(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setSubmitting(false);
  }

  async function handleDelete(id: number, n: string) {
    try { const r = await fetch(`/api/users?id=${id}`, { method: "DELETE" }); if (r.ok) { toast.success(`${n} deactivated`); setDelConfirm(null); load(); } else { const d = await r.json(); toast.error(d.error); } } catch { toast.error("Error"); }
  }

  const isOwner = (session?.user as { role?: string })?.role === "OWNER";
  const ic = "w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm bg-white placeholder:text-[#9CA3AF]";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[#111827]">Team</h1><p className="text-sm text-[#6B7280] mt-0.5">Manage accounts and roles</p></div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-[#1A56DB] text-white hover:bg-[#1544B0]"><Plus className="h-4 w-4" />Add Member</button>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-5 z-10">
            <h2 className="text-base font-semibold text-[#111827] mb-4">{editing ? `Edit ${editing.name}` : "Add Member"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-xs font-medium text-[#374151] mb-1">Name *</label><input value={name} onChange={e => setName(e.target.value)} required className={ic} /></div>
              <div><label className="block text-xs font-medium text-[#374151] mb-1">Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={ic} /></div>
              <div><label className="block text-xs font-medium text-[#374151] mb-1">{editing ? "New Password" : "Password *"}</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} required={!editing} className={ic} /></div>
              <div><label className="block text-xs font-medium text-[#374151] mb-1">Role</label>
                <div className="flex gap-1.5">
                  {["EMPLOYEE","MANAGER", ...(isOwner ? ["OWNER"] : [])].map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)} className={`flex-1 py-1.5 rounded-md text-xs font-medium border capitalize transition-colors ${role === r ? "bg-[#1A56DB] text-white border-[#1A56DB]" : "bg-white text-[#374151] border-[#D1D5DB]"}`}>{r.toLowerCase()}</button>
                  ))}
                </div></div>
              <div><label className="block text-xs font-medium text-[#374151] mb-1">Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={ic} /></div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting} className="flex-1 py-2 rounded-md text-sm font-medium bg-[#1A56DB] text-white hover:bg-[#1544B0] disabled:opacity-50">{submitting ? "Saving..." : editing ? "Update" : "Create"}</button>
                <button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium border border-[#D1D5DB] hover:bg-[#F9FAFB]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-[#E5E7EB] divide-y divide-[#F3F4F6]">
        {users.map(u => (
          <div key={u.id} className={`px-4 py-3 flex items-center justify-between ${!u.active ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-sm font-semibold text-[#6B7280]">{u.name.charAt(0)}</div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#111827]">{u.name}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${roleStyle[u.role] || ""}`}>{u.role}</span>
                  {!u.active && <span className="text-[10px] font-medium text-[#DC2626]">Inactive</span>}
                </div>
                <div className="text-xs text-[#9CA3AF]">{u.email}{u.phone && ` · ${u.phone}`}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280]"><Pencil className="h-3.5 w-3.5" /></button>
              {isOwner && u.active && (delConfirm === u.id
                ? <div className="flex gap-1"><button onClick={() => handleDelete(u.id, u.name)} className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#DC2626] text-white">Yes</button><button onClick={() => setDelConfirm(null)} className="text-xs font-medium px-2.5 py-1 rounded-md border border-[#D1D5DB]">No</button></div>
                : <button onClick={() => setDelConfirm(u.id)} className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#DC2626]"><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}