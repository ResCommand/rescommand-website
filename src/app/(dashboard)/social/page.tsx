"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Megaphone, Plus, Trash2, Pencil, CheckCircle, Clock, Eye,
  Calendar, Send, X, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface SocialPostItem {
  id: number; title: string; description: string | null;
  platform: string; postDate: string | null; status: string;
  mediaUrl: string | null; linkUrl: string | null; notes: string | null;
  approvedBy: number | null; createdById: number;
  createdAt: string; updatedAt: string;
  createdByUser: { id: number; name: string };
  approvedByUser: { id: number; name: string } | null;
}

const PLATFORMS = ["ALL", "INSTAGRAM", "FACEBOOK", "TIKTOK", "TWITTER"];
const PLATFORM_ICONS: Record<string, string> = { ALL: "📱", INSTAGRAM: "📸", FACEBOOK: "📘", TIKTOK: "🎵", TWITTER: "🐦" };
const STATUS_COLORS: Record<string, string> = { DRAFT: "#E5E7EB", SCHEDULED: "#DBEAFE", PUBLISHED: "#D1FAE5", CANCELLED: "#FEE2E2" };
const STATUS_TEXT: Record<string, string> = { DRAFT: "#374151", SCHEDULED: "#1E40AF", PUBLISHED: "#065F46", CANCELLED: "#991B1B" };

export default function SocialMediaPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isManager = role === "MANAGER" || role === "OWNER";

  const [posts, setPosts] = useState<SocialPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPostItem | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", platform: "ALL", postDate: "", status: "DRAFT",
    mediaUrl: "", linkUrl: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  // Share modal
  const [sharePost, setSharePost] = useState<SocialPostItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social-posts");
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => {
    setEditingPost(null);
    setForm({ title: "", description: "", platform: "ALL", postDate: "", status: "DRAFT", mediaUrl: "", linkUrl: "", notes: "" });
    setShowForm(true);
  };

  const openEdit = (p: SocialPostItem) => {
    setEditingPost(p);
    setForm({
      title: p.title,
      description: p.description || "",
      platform: p.platform,
      postDate: p.postDate ? new Date(p.postDate).toISOString().split("T")[0] : "",
      status: p.status,
      mediaUrl: p.mediaUrl || "",
      linkUrl: p.linkUrl || "",
      notes: p.notes || "",
    });
    setShowForm(true);
  };

  const savePost = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/social-posts", {
        method: editingPost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...(editingPost ? { id: editingPost.id } : {}) }),
      });
      if (r.ok) { toast.success(editingPost ? "Updated" : "Created"); setShowForm(false); setEditingPost(null); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setSaving(false);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const r = await fetch("/api/social-posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (r.ok) { toast.success(`Marked as ${status}`); loadData(); }
    } catch { toast.error("Error"); }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/social-posts?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); loadData();
  };

  const filtered = filter === "all" ? posts : posts.filter(p => p.status === filter);
  const drafts = posts.filter(p => p.status === "DRAFT").length;
  const scheduled = posts.filter(p => p.status === "SCHEDULED").length;
  const published = posts.filter(p => p.status === "PUBLISHED").length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Megaphone size={24} /> Social Media Planner</h1>
          <p className="page-subtitle">Plan, schedule, and share social media content</p>
        </div>
        <div className="flex gap-3" style={{ marginTop: 8 }}>
          <div className="stat-card" style={{ padding: "8px 16px", borderRadius: 8, background: STATUS_COLORS.DRAFT, border: `1px solid #D1D5DB` }}>
            <div className="text-xs text-gray">Drafts</div>
            <div className="font-semibold">{drafts}</div>
          </div>
          <div className="stat-card" style={{ padding: "8px 16px", borderRadius: 8, background: STATUS_COLORS.SCHEDULED, border: "1px solid #93C5FD" }}>
            <div className="text-xs text-gray">Scheduled</div>
            <div className="font-semibold">{scheduled}</div>
          </div>
          <div className="stat-card" style={{ padding: "8px 16px", borderRadius: 8, background: STATUS_COLORS.PUBLISHED, border: "1px solid #6EE7B7" }}>
            <div className="text-xs text-gray">Published</div>
            <div className="font-semibold">{published}</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All ({posts.length})</button>
        <button className={`tab ${filter === "DRAFT" ? "active" : ""}`} onClick={() => setFilter("DRAFT")}>Drafts ({drafts})</button>
        <button className={`tab ${filter === "SCHEDULED" ? "active" : ""}`} onClick={() => setFilter("SCHEDULED")}>Scheduled ({scheduled})</button>
        <button className={`tab ${filter === "PUBLISHED" ? "active" : ""}`} onClick={() => setFilter("PUBLISHED")}>Published ({published})</button>
      </div>

      {/* Add button */}
      <div className="flex justify-end" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={14} /> New Post</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: 20, border: "2px solid #1A56DB", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{editingPost ? "Edit Post" : "New Social Media Post"}</h3>
          <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
            <div>
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. National Donut Day Post" />
            </div>
            <div>
              <label className="form-label">Platform</label>
              <select className="form-input" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_ICONS[p]} {p === "ALL" ? "All Platforms" : p}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Schedule Date</label>
              <input type="date" className="form-input" value={form.postDate} onChange={e => setForm({ ...form, postDate: e.target.value })} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Caption / Copy</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Write the social media caption here..." style={{ resize: "vertical" }} />
            </div>
            <div>
              <label className="form-label">Media URL</label>
              <input className="form-input" value={form.mediaUrl} onChange={e => setForm({ ...form, mediaUrl: e.target.value })} placeholder="Link to image/video" />
            </div>
            <div>
              <label className="form-label">Link URL</label>
              <input className="form-input" value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })} placeholder="Link to share (website, menu, etc.)" />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                {editingPost && <option value="PUBLISHED">Published</option>}
                {editingPost && <option value="CANCELLED">Cancelled</option>}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Internal Notes</label>
              <input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes for team (not posted)" />
            </div>
          </div>
          <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setEditingPost(null); }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={savePost} disabled={saving}>{saving ? "Saving..." : (editingPost ? "Update" : "Create Post")}</button>
          </div>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="card"><div className="empty-state">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state">No posts {filter !== "all" ? `with status "${filter}"` : "yet"}</div></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ padding: 0 }}>
              {/* Header */}
              <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #E5E7EB" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 18 }}>{PLATFORM_ICONS[p.platform] || "📱"}</span>
                    <div>
                      <div className="font-semibold text-sm">{p.title}</div>
                      <div className="text-xs text-gray">
                        {p.postDate ? new Date(p.postDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No date set"}
                      </div>
                    </div>
                  </div>
                  <span className="badge" style={{ background: STATUS_COLORS[p.status], color: STATUS_TEXT[p.status], fontSize: 10, fontWeight: 600 }}>
                    {p.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "12px 16px" }}>
                {p.description && (
                  <p className="text-sm" style={{ color: "#374151", marginBottom: 8, whiteSpace: "pre-wrap", maxHeight: 80, overflow: "hidden" }}>
                    {p.description}
                  </p>
                )}

                {p.mediaUrl && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: "#2563EB", marginBottom: 4 }}>
                    <ExternalLink size={10} /> Media attached
                  </div>
                )}

                {p.linkUrl && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: "#2563EB", marginBottom: 4 }}>
                    <ExternalLink size={10} /> {p.linkUrl.length > 40 ? p.linkUrl.substring(0, 40) + "..." : p.linkUrl}
                  </div>
                )}

                {p.notes && (
                  <div className="text-xs text-gray" style={{ marginTop: 4, padding: "4px 8px", background: "#F9FAFB", borderRadius: 4 }}>
                    📝 {p.notes}
                  </div>
                )}

                <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                  <div className="text-xs text-gray">
                    By {p.createdByUser?.name || "Unknown"}
                    {p.approvedByUser && <span> · Approved by {p.approvedByUser.name}</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: "8px 16px 12px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button className="btn btn-secondary btn-sm" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => openEdit(p)}>
                  <Pencil size={11} /> Edit
                </button>
                <button className="btn btn-secondary btn-sm" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => setSharePost(p)}>
                  <Eye size={11} /> Share
                </button>
                {isManager && p.status === "DRAFT" && (
                  <button className="btn btn-sm" style={{ padding: "2px 8px", fontSize: 11, background: "#DBEAFE", color: "#1E40AF" }} onClick={() => updateStatus(p.id, "SCHEDULED")}>
                    <Clock size={11} /> Schedule
                  </button>
                )}
                {isManager && p.status === "SCHEDULED" && (
                  <button className="btn btn-sm" style={{ padding: "2px 8px", fontSize: 11, background: "#D1FAE5", color: "#065F46" }} onClick={() => updateStatus(p.id, "PUBLISHED")}>
                    <Send size={11} /> Publish
                  </button>
                )}
                {isManager && (
                  <button className="btn btn-secondary btn-sm" style={{ padding: "2px 8px", fontSize: 11, marginLeft: "auto" }} onClick={() => deletePost(p.id)}>
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share modal */}
      {sharePost && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ maxWidth: 500, width: "100%", padding: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Share Post Details</h3>
              <button onClick={() => setSharePost(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="form-label" style={{ fontSize: 11 }}>Title</label>
                <div className="text-sm font-medium">{sharePost.title}</div>
              </div>
              {sharePost.description && (
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Caption</label>
                  <div className="text-sm" style={{ whiteSpace: "pre-wrap", background: "#F9FAFB", padding: 8, borderRadius: 6 }}>{sharePost.description}</div>
                </div>
              )}
              {sharePost.mediaUrl && (
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Media</label>
                  <a href={sharePost.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: "#2563EB" }}>{sharePost.mediaUrl}</a>
                </div>
              )}
              {sharePost.linkUrl && (
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Link</label>
                  <a href={sharePost.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: "#2563EB" }}>{sharePost.linkUrl}</a>
                </div>
              )}
              <div>
                <label className="form-label" style={{ fontSize: 11 }}>Platform</label>
                <div className="text-sm">{PLATFORM_ICONS[sharePost.platform]} {sharePost.platform === "ALL" ? "All Platforms" : sharePost.platform}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: 11 }}>Scheduled</label>
                <div className="text-sm">{sharePost.postDate ? new Date(sharePost.postDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "Not scheduled"}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: 11 }}>Notes</label>
                <div className="text-sm text-gray">{sharePost.notes || "None"}</div>
              </div>
            </div>
            <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => {
                navigator.clipboard.writeText(sharePost.description || sharePost.title);
                toast.success("Caption copied to clipboard!");
              }}>Copy Caption</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSharePost(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}