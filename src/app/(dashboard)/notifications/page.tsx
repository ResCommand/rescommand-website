"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Check, CheckCheck, Trash2, Send, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface NotificationRecipient {
  id: number;
  read: boolean;
  readAt: string | null;
  user: { id: number; name: string; email: string };
}

interface Notification {
  id: number;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
  sender: { id: number; name: string };
  recipients: NotificationRecipient[];
}

interface EmployeeCategory {
  id: number;
  name: string;
  color: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  category?: { id: number; name: string } | null;
  employeeCategory?: { id: number; name: string } | null;
}

const priorityStyles: Record<string, string> = {
  LOW: "badge-green",
  MEDIUM: "badge-blue",
  HIGH: "badge-orange",
  URGENT: "badge-red",
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isManager = role === "MANAGER" || role === "OWNER";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);

  // Compose form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [sendType, setSendType] = useState<"individual" | "category">("individual");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [sending, setSending] = useState(false);

  // Data for compose
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch { toast.error("Failed to load notifications"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadComposeData = async () => {
    try {
      const [usersRes, catsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/employee-categories"),
      ]);
      if (usersRes.ok) setTeamMembers(await usersRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
    } catch { /* ignore */ }
  };

  const openCompose = () => {
    setShowCompose(true);
    setTitle(""); setMessage(""); setPriority("MEDIUM");
    setSelectedUserIds([]); setSelectedCategoryIds([]);
    setSendType("individual");
    loadComposeData();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const body: Record<string, unknown> = { title, message, priority };
      if (sendType === "individual") {
        body.recipientUserIds = selectedUserIds;
      } else {
        body.recipientCategoryIds = selectedCategoryIds;
      }
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Notification sent!");
        setShowCompose(false);
        load();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to send");
      }
    } catch { toast.error("Error sending notification"); }
    setSending(false);
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (res.ok) { toast.success("All marked as read"); load(); }
    } catch { toast.error("Error"); }
  };

  const markOneRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "PUT" });
      if (res.ok) load();
    } catch { /* ignore */ }
  };

  const deleteNotification = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Deleted"); load(); }
    } catch { toast.error("Error deleting"); }
  };

  const toggleUserId = (id: number) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleCategoryId = (id: number) => {
    setSelectedCategoryIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const unreadCount = notifications.filter(n => n.recipients.some(r => !r.read)).length;

  return (
    <div className="space-y-6">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Notifications</h1>
          <p className="text-sm text-gray">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-secondary">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
          {isManager && (
            <button onClick={openCompose} className="btn btn-primary">
              <Send size={16} /> Send Notification
            </button>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="modal-backdrop" onClick={() => setShowCompose(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>Send Notification</h2>
            </div>
            <form onSubmit={handleSend}>
              <div className="modal-body space-y-3">
                <div>
                  <label className="form-label">Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required className="form-input" placeholder="e.g. Schedule change tomorrow" />
                </div>
                <div>
                  <label className="form-label">Message *</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} required className="form-input" rows={3} placeholder="Write your message..." />
                </div>
                <div>
                  <label className="form-label">Priority</label>
                  <div className="toggle-group">
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => (
                      <button key={p} type="button" onClick={() => setPriority(p)} className={`toggle-btn ${priority === p ? "active" : ""}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Send to</label>
                  <div className="toggle-group">
                    <button type="button" onClick={() => setSendType("individual")} className={`toggle-btn ${sendType === "individual" ? "active" : ""}`}>
                      <UserPlus size={14} /> Individuals
                    </button>
                    <button type="button" onClick={() => setSendType("category")} className={`toggle-btn ${sendType === "category" ? "active" : ""}`}>
                      <Users size={14} /> By Category
                    </button>
                  </div>
                </div>
                {sendType === "individual" ? (
                  <div>
                    <label className="form-label">Select Team Members</label>
                    <div className="space-y-1" style={{ maxHeight: 200, overflowY: "auto" }}>
                      {teamMembers.filter(u => u.active !== false).map(u => (
                        <label key={u.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-sm">
                          <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUserId(u.id)} />
                          <span>{u.name}</span>
                          <span className="badge badge-gray text-xs">{u.role.toLowerCase()}</span>
                          {(u.employeeCategory || u.category) && <span className="text-xs text-gray">{(u.employeeCategory || u.category)?.name}</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="form-label">Select Categories</label>
                    <div className="space-y-1">
                      {categories.map(c => (
                        <label key={c.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-sm">
                          <input type="checkbox" checked={selectedCategoryIds.includes(c.id)} onChange={() => toggleCategoryId(c.id)} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                          <span>{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCompose(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={sending || (sendType === "individual" ? selectedUserIds.length === 0 : selectedCategoryIds.length === 0)} className="btn btn-primary">
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification List */}
      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <Bell size={32} style={{ margin: "0 auto 12px", display: "block", color: "#D1D5DB" }} />
          <p style={{ color: "#6B7280" }}>No notifications yet</p>
        </div>
      ) : (
        <div className="card">
          {notifications.map(n => {
            const myRecipient = n.recipients.find(r => String(r.user.id) === String((session?.user as { id?: string })?.id));
            const isUnread = myRecipient && !myRecipient.read;
            return (
              <div key={n.id} className={`list-item ${isUnread ? "bg-blue-50" : ""}`} style={{ borderLeft: isUnread ? "3px solid #3B82F6" : "3px solid transparent" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1">
                    {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    <span className="font-medium text-sm">{n.title}</span>
                    <span className={`badge ${priorityStyles[n.priority] || "badge-gray"}`}>{n.priority}</span>
                  </div>
                  <p className="text-sm text-gray" style={{ marginBottom: 4 }}>{n.message}</p>
                  <div className="flex items-center gap-3 text-xs text-gray">
                    <span>From: {n.sender.name}</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    {n.recipients.length > 1 && <span>{n.recipients.length} recipients</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isUnread && (
                    <button onClick={() => markOneRead(n.id)} className="btn-icon" title="Mark as read">
                      <Check size={16} />
                    </button>
                  )}
                  {isManager && (
                    <button onClick={() => deleteNotification(n.id)} className="btn-icon" style={{ color: "#DC2626" }} title="Delete">
                      <Trash2 size={14} />
                    </button>
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