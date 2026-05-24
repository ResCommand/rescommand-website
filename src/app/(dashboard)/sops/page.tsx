"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, X } from "lucide-react";
import { toast } from "sonner";

interface Sop {
  id: number; title: string; category: string; content: string;
  version: number; active: boolean;
  creator: { name: string }; updater: { name: string } | null;
  createdAt: string; updatedAt: string;
}

const catLabels: Record<string, string> = {
  FOH: "Front of House", BOH: "Back of House", SAFETY: "Safety",
  CLEANING: "Cleaning", OPENING: "Opening", CLOSING: "Closing", GENERAL: "General",
};
const catStyle: Record<string, string> = {
  FOH: "badge-blue", BOH: "badge-green", SAFETY: "badge-red",
  CLEANING: "badge-purple", OPENING: "badge-yellow", CLOSING: "badge-orange", GENERAL: "badge-gray",
};
const categories = Object.keys(catLabels);

export default function SopsPage() {
  const { data: session } = useSession();
  const [sops, setSops] = useState<Sop[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedSop, setSelectedSop] = useState<Sop | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sop | null>(null);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const isMgr = ["MANAGER", "OWNER"].includes((session?.user as { role?: string })?.role || "");
  const isOwner = (session?.user as { role?: string })?.role === "OWNER";

  const load = () => {
    fetch("/api/sops").then(r => r.json()).then(d => Array.isArray(d) && setSops(d)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null); setTitle(""); setCategory("GENERAL"); setContent(""); setDialogOpen(true);
  }
  function openEdit(s: Sop) {
    setEditing(s); setTitle(s.title); setCategory(s.category); setContent(s.content); setDialogOpen(true);
  }
  function openView(s: Sop) {
    setSelectedSop(s);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const body = editing
        ? { id: editing.id, title, category, content }
        : { title, category, content };
      const r = await fetch("/api/sops", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) { toast.success(editing ? "SOP updated" : "SOP created"); setDialogOpen(false); load(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    try {
      const r = await fetch(`/api/sops?id=${id}`, { method: "DELETE" });
      if (r.ok) { toast.success("SOP removed"); setDelConfirm(null); load(); }
      else { const d = await r.json(); toast.error(d.error); }
    } catch { toast.error("Error"); }
  }

  const filtered = filter === "ALL" ? sops : sops.filter(s => s.category === filter);
  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter(s => s.category === cat);
    if (items.length > 0) acc.push({ category: cat, items });
    return acc;
  }, [] as { category: string; items: Sop[] }[]);

  return (
    <div className="space-y-6">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>SOPs</h1>
          <p className="text-sm text-gray">Standard Operating Procedures</p>
        </div>
        {isMgr && (
          <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> New SOP</button>
        )}
      </div>

      {/* Category filter */}
      <div className="tabs" style={{ flexWrap: "wrap" }}>
        <button className={`tab ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>All</button>
        {categories.map(c => (
          <button key={c} className={`tab ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{catLabels[c]}</button>
        ))}
      </div>

      {/* SOP list grouped by category */}
      {grouped.length === 0 ? (
        <div className="empty-state" style={{ padding: 60 }}>No SOPs yet{isMgr ? " — click New SOP to create one" : ""}</div>
      ) : (
        grouped.map(g => (
          <div key={g.category} className="section">
            <h3 className="section-title">{catLabels[g.category]}</h3>
            <div className="card">
              {g.items.map(s => (
                <div key={s.id} className="list-item" style={{ cursor: "pointer" }} onClick={() => openView(s)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-medium text-sm">{s.title}</div>
                    <div className="text-xs text-gray mt-1">
                      v{s.version} · by {s.updater?.name || s.creator?.name || "Unknown"} · {new Date(s.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${catStyle[s.category] || "badge-gray"}`}>{catLabels[s.category]}</span>
                    {isMgr && (
                      <button onClick={e => { e.stopPropagation(); openEdit(s); }} className="btn-icon"><Pencil size={14} /></button>
                    )}
                    {isOwner && (
                      delConfirm === s.id ? (
                        <div className="flex gap-1">
                          <button onClick={e => { e.stopPropagation(); handleDelete(s.id); }} className="btn btn-sm btn-danger">Yes</button>
                          <button onClick={e => { e.stopPropagation(); setDelConfirm(null); }} className="btn btn-sm btn-secondary">No</button>
                        </div>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); setDelConfirm(s.id); }} className="btn-icon" style={{ color: "#DC2626" }}><Trash2 size={14} /></button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* View SOP modal */}
      {selectedSop && (
        <div className="modal-backdrop" onClick={() => setSelectedSop(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <div>
                <h2>{selectedSop.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${catStyle[selectedSop.category]}`}>{catLabels[selectedSop.category]}</span>
                  <span className="text-xs text-gray">v{selectedSop.version}</span>
                </div>
              </div>
              <button onClick={() => setSelectedSop(null)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 14, color: "#374151" }}>
                {selectedSop.content}
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <div className="text-xs text-gray">
                By {selectedSop.updater?.name || selectedSop.creator?.name} · Updated {new Date(selectedSop.updatedAt).toLocaleDateString()}
              </div>
              <button onClick={() => setSelectedSop(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit SOP modal */}
      {dialogOpen && (
        <div className="modal-backdrop" onClick={() => setDialogOpen(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? `Edit: ${editing.title}` : "New SOP"}</h2></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-3">
                <div>
                  <label className="form-label">Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required className="form-input" placeholder="e.g. Morning Opening Procedure" />
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <div className="tabs" style={{ flexWrap: "wrap", marginBottom: 0 }}>
                    {categories.map(c => (
                      <button key={c} type="button" className={`tab ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{catLabels[c]}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Content *</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Write the SOP steps here..."
                    rows={12}
                    style={{ lineHeight: 1.7 }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setDialogOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}