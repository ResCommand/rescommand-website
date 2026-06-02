"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface ModuleConfigItem {
  id: number; moduleKey: string; name: string; description: string | null;
  icon: string; enabled: boolean; sortOrder: number; group: string;
}

const GROUP_LABELS: Record<string, string> = {
  operations: "Operations",
  management: "Management",
  coffee: "Coffee",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isOwner = role === "OWNER";

  const [configs, setConfigs] = useState<ModuleConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/module-config").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setConfigs(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

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
        const d = await r.json();
        toast.error(d.error || "Failed");
      }
    } catch { toast.error("Error"); }
    setToggling(null);
  };

  const groups = [...new Set(configs.map(c => c.group))];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Settings size={24} /> Settings</h1>
          <p className="page-subtitle">Configure which features are active for your restaurant</p>
        </div>
      </div>

      {!isOwner ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p className="text-gray">Only the restaurant owner can change module settings.</p>
        </div>
      ) : loading ? (
        <div className="card"><div className="empty-state">Loading...</div></div>
      ) : (
        <div className="space-y-6">
          {groups.map(group => {
            const groupConfigs = configs.filter(c => c.group === group);
            return (
              <div key={group}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 8 }}>
                  {GROUP_LABELS[group] || group}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                  {groupConfigs.map(c => (
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
                          disabled={toggling === c.moduleKey || c.moduleKey === "dashboard" || c.moduleKey === "settings" || c.moduleKey === "notifications"}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: (c.moduleKey === "dashboard" || c.moduleKey === "settings" || c.moduleKey === "notifications") ? "not-allowed" : "pointer",
                            padding: 0,
                            opacity: (c.moduleKey === "dashboard" || c.moduleKey === "settings" || c.moduleKey === "notifications") ? 0.4 : 1,
                          }}
                          title={(c.moduleKey === "dashboard" || c.moduleKey === "settings" || c.moduleKey === "notifications") ? "This module is always on" : (c.enabled ? "Disable" : "Enable")}
                        >
                          {c.enabled ? (
                            <ToggleRight size={36} style={{ color: "#059669" }} />
                          ) : (
                            <ToggleLeft size={36} style={{ color: "#9CA3AF" }} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="card" style={{ padding: 16, background: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <p className="text-sm" style={{ color: "#92400E" }}>
              <strong>💡 Tip:</strong> Disabled modules are hidden from the sidebar for all users. You can re-enable them anytime. Dashboard, Settings, and Notifications are always active.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}