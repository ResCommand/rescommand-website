"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Coffee, Plus, Trash2, Pencil, FlaskConical, Leaf, Thermometer,
} from "lucide-react";
import { toast } from "sonner";

interface GreenCoffee {
  id: number; name: string; origin: string | null; farm: string | null;
  process: string | null; variety: string | null; elevation: string | null;
  grade: string | null; density: string | null; moisture: number | null;
  bagWeightKg: number; stockKg: number; costPerKg: number | null;
  notes: string | null; active: boolean;
  _count?: { roastLogs: number; roastProfiles: number };
}

interface RoastProfile {
  id: number; name: string; greenCoffeeId: number;
  targetWeightKg: number; chargeTemp: number | null; turnAroundPoint: number | null;
  firstCrack: number | null; developmentTime: number | null;
  dropTemp: number | null; totalDuration: number | null;
  roastLevel: string; notes: string | null;
  greenCoffee?: { id: number; name: string; origin: string | null };
  _count?: { roastLogs: number };
}

interface RoastLogItem {
  id: number; date: string; greenCoffeeId: number; profileId: number | null;
  greenWeightKg: number; roastedWeightKg: number; roastLevel: string;
  chargeTemp: number | null; firstCrackTime: number | null;
  dropTemp: number | null; totalDuration: number | null;
  notes: string | null; lossPercent: number | null; batchNumber: string | null;
  performedBy: number | null;
  greenCoffee: { id: number; name: string; origin: string | null };
  profile: { id: number; name: string } | null;
  performer: { id: number; name: string } | null;
}

const ROAST_LEVELS = ["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"];
const ROAST_COLORS: Record<string, string> = {
  LIGHT: "#FEF3C7", MEDIUM: "#FDE68A", MEDIUM_DARK: "#D97706", DARK: "#78350F",
};
const ROAST_TEXT: Record<string, string> = {
  LIGHT: "#92400E", MEDIUM: "#78350F", MEDIUM_DARK: "#FFF", DARK: "#FFF",
};

export default function RoastingPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isManager = role === "MANAGER" || role === "OWNER" || role === "PLATFORM_ADMIN";

  const [activeTab, setActiveTab] = useState<"green" | "profiles" | "logs">("green");
  const [greenCoffees, setGreenCoffees] = useState<GreenCoffee[]>([]);
  const [profiles, setProfiles] = useState<RoastProfile[]>([]);
  const [logs, setLogs] = useState<RoastLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Green coffee form
  const [showGreenForm, setShowGreenForm] = useState(false);
  const [editingGreen, setEditingGreen] = useState<GreenCoffee | null>(null);
  const [greenForm, setGreenForm] = useState({ name: "", origin: "", farm: "", process: "", variety: "", elevation: "", grade: "", density: "", moisture: "", bagWeightKg: "60", stockKg: "0", costPerKg: "", notes: "" });

  // Profile form
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<RoastProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", greenCoffeeId: "", targetWeightKg: "10", chargeTemp: "", turnAroundPoint: "", firstCrack: "", developmentTime: "", dropTemp: "", totalDuration: "", roastLevel: "MEDIUM", notes: "" });

  // Roast log form
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ date: "", greenCoffeeId: "", profileId: "", greenWeightKg: "", roastedWeightKg: "", roastLevel: "MEDIUM", chargeTemp: "", firstCrackTime: "", dropTemp: "", totalDuration: "", notes: "", batchNumber: "" });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gc, rp, rl] = await Promise.all([
        fetch("/api/green-coffee").then(r => r.json()),
        fetch("/api/roast-profiles").then(r => r.json()),
        fetch("/api/roast-logs").then(r => r.json()),
      ]);
      if (Array.isArray(gc)) setGreenCoffees(gc);
      if (Array.isArray(rp)) setProfiles(rp);
      if (rl?.logs) setLogs(rl.logs);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // ─── Green Coffee CRUD ───────────────────────────────────
  const openAddGreen = () => {
    setEditingGreen(null);
    setGreenForm({ name: "", origin: "", farm: "", process: "", variety: "", elevation: "", grade: "", density: "", moisture: "", bagWeightKg: "60", stockKg: "0", costPerKg: "", notes: "" });
    setShowGreenForm(true);
  };
  const openEditGreen = (g: GreenCoffee) => {
    setEditingGreen(g);
    setGreenForm({
      name: g.name, origin: g.origin || "", farm: g.farm || "", process: g.process || "",
      variety: g.variety || "", elevation: g.elevation || "", grade: g.grade || "",
      density: g.density || "", moisture: g.moisture?.toString() || "",
      bagWeightKg: g.bagWeightKg.toString(), stockKg: g.stockKg.toString(),
      costPerKg: g.costPerKg?.toString() || "", notes: g.notes || "",
    });
    setShowGreenForm(true);
  };
  const saveGreen = async () => {
    if (!greenForm.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/green-coffee", {
        method: editingGreen ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...greenForm, ...(editingGreen ? { id: editingGreen.id } : {}) }),
      });
      if (r.ok) { toast.success(editingGreen ? "Updated" : "Added"); setShowGreenForm(false); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setSaving(false);
  };
  const deleteGreen = async (id: number) => {
    if (!confirm("Archive this green coffee?")) return;
    await fetch(`/api/green-coffee?id=${id}`, { method: "DELETE" });
    toast.success("Archived"); loadData();
  };

  // ─── Profile CRUD ────────────────────────────────────────
  const openAddProfile = () => {
    setEditingProfile(null);
    setProfileForm({ name: "", greenCoffeeId: "", targetWeightKg: "10", chargeTemp: "", turnAroundPoint: "", firstCrack: "", developmentTime: "", dropTemp: "", totalDuration: "", roastLevel: "MEDIUM", notes: "" });
    setShowProfileForm(true);
  };
  const openEditProfile = (p: RoastProfile) => {
    setEditingProfile(p);
    setProfileForm({
      name: p.name, greenCoffeeId: p.greenCoffeeId.toString(),
      targetWeightKg: p.targetWeightKg.toString(),
      chargeTemp: p.chargeTemp?.toString() || "", turnAroundPoint: p.turnAroundPoint?.toString() || "",
      firstCrack: p.firstCrack?.toString() || "", developmentTime: p.developmentTime?.toString() || "",
      dropTemp: p.dropTemp?.toString() || "", totalDuration: p.totalDuration?.toString() || "",
      roastLevel: p.roastLevel, notes: p.notes || "",
    });
    setShowProfileForm(true);
  };
  const saveProfile = async () => {
    if (!profileForm.name || !profileForm.greenCoffeeId) { toast.error("Name and green coffee required"); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/roast-profiles", {
        method: editingProfile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profileForm, ...(editingProfile ? { id: editingProfile.id } : {}) }),
      });
      if (r.ok) { toast.success(editingProfile ? "Updated" : "Created"); setShowProfileForm(false); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setSaving(false);
  };
  const deleteProfile = async (id: number) => {
    if (!confirm("Delete this profile?")) return;
    await fetch(`/api/roast-profiles?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); loadData();
  };

  // ─── Roast Log CRUD ──────────────────────────────────────
  const openAddLog = () => {
    setLogForm({ date: new Date().toISOString().split("T")[0], greenCoffeeId: "", profileId: "", greenWeightKg: "", roastedWeightKg: "", roastLevel: "MEDIUM", chargeTemp: "", firstCrackTime: "", dropTemp: "", totalDuration: "", notes: "", batchNumber: "" });
    setShowLogForm(true);
  };
  const saveLog = async () => {
    if (!logForm.greenCoffeeId || !logForm.greenWeightKg || !logForm.roastedWeightKg) { toast.error("Green coffee, input and output weight required"); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/roast-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logForm),
      });
      if (r.ok) { toast.success("Roast logged — green coffee stock deducted"); setShowLogForm(false); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
    setSaving(false);
  };
  const deleteLog = async (id: number) => {
    if (!confirm("Delete this roast log?")) return;
    await fetch(`/api/roast-logs?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); loadData();
  };

  const totalStockKg = greenCoffees.reduce((s, g) => s + g.stockKg, 0);
  const totalRoasts = logs.length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Coffee size={24} /> Coffee Roasting</h1>
          <p className="page-subtitle">Manage green coffee, roast profiles, and roast logs</p>
        </div>
        <div className="flex gap-3" style={{ marginTop: 8 }}>
          <div className="stat-card" style={{ padding: "8px 16px", borderRadius: 8, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <div className="text-xs text-gray">Green Stock</div>
            <div className="font-semibold">{totalStockKg.toFixed(1)} kg</div>
          </div>
          <div className="stat-card" style={{ padding: "8px 16px", borderRadius: 8, background: "#F3EEFF", border: "1px solid #DDD6FE" }}>
            <div className="text-xs text-gray">Total Roasts</div>
            <div className="font-semibold">{totalRoasts}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${activeTab === "green" ? "active" : ""}`} onClick={() => setActiveTab("green")}><Leaf size={14} /> Green Coffee</button>
        <button className={`tab ${activeTab === "profiles" ? "active" : ""}`} onClick={() => setActiveTab("profiles")}><FlaskConical size={14} /> Roast Profiles</button>
        <button className={`tab ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}><Thermometer size={14} /> Roast Logs</button>
      </div>

      {/* ── Green Coffee Tab ───────────────────────────────── */}
      {activeTab === "green" && (
        <div className="space-y-4">
          {isManager && (
            <div className="flex justify-end">
              <button className="btn btn-primary btn-sm" onClick={openAddGreen}><Plus size={14} /> Add Green Coffee</button>
            </div>
          )}

          {showGreenForm && (
            <div className="card" style={{ padding: 20, border: "2px solid #7C3AED" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{editingGreen ? "Edit" : "Add"} Green Coffee</h3>
              <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Name *</label><input className="form-input" value={greenForm.name} onChange={e => setGreenForm({ ...greenForm, name: e.target.value })} placeholder="e.g. Ethiopia Yirgacheffe" /></div>
                <div><label className="form-label">Origin</label><input className="form-input" value={greenForm.origin} onChange={e => setGreenForm({ ...greenForm, origin: e.target.value })} placeholder="e.g. Ethiopia" /></div>
                <div><label className="form-label">Farm</label><input className="form-input" value={greenForm.farm} onChange={e => setGreenForm({ ...greenForm, farm: e.target.value })} /></div>
                <div><label className="form-label">Process</label><select className="form-input" value={greenForm.process} onChange={e => setGreenForm({ ...greenForm, process: e.target.value })}>
                  <option value="">Select</option><option>Washed</option><option>Natural</option><option>Honey</option><option>Wet-hulled</option><option>Anaerobic</option><option>Carbonic Maceration</option>
                </select></div>
                <div><label className="form-label">Variety</label><input className="form-input" value={greenForm.variety} onChange={e => setGreenForm({ ...greenForm, variety: e.target.value })} placeholder="e.g. Gesha, Bourbon" /></div>
                <div><label className="form-label">Elevation</label><input className="form-input" value={greenForm.elevation} onChange={e => setGreenForm({ ...greenForm, elevation: e.target.value })} placeholder="e.g. 1800-2000masl" /></div>
                <div><label className="form-label">Bag Weight (kg)</label><input type="number" step="0.1" className="form-input" value={greenForm.bagWeightKg} onChange={e => setGreenForm({ ...greenForm, bagWeightKg: e.target.value })} /></div>
                <div><label className="form-label">Stock (kg)</label><input type="number" step="0.1" className="form-input" value={greenForm.stockKg} onChange={e => setGreenForm({ ...greenForm, stockKg: e.target.value })} /></div>
                <div><label className="form-label">Cost/kg ($)</label><input type="number" step="0.01" className="form-input" value={greenForm.costPerKg} onChange={e => setGreenForm({ ...greenForm, costPerKg: e.target.value })} /></div>
                <div style={{ gridColumn: "1 / -1" }}><label className="form-label">Notes</label><input className="form-input" value={greenForm.notes} onChange={e => setGreenForm({ ...greenForm, notes: e.target.value })} /></div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowGreenForm(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveGreen} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          )}

          {greenCoffees.length === 0 ? (
            <div className="card"><div className="empty-state">No green coffee added yet</div></div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr><th>Name</th><th>Origin</th><th>Process</th><th>Variety</th><th>Stock (kg)</th><th>Cost/kg</th><th>Profiles</th>{isManager && <th></th>}</tr>
                </thead>
                <tbody>
                  {greenCoffees.map(g => (
                    <tr key={g.id}>
                      <td className="font-medium text-sm">{g.name}</td>
                      <td className="text-sm text-gray">{g.origin || "—"}</td>
                      <td className="text-sm text-gray">{g.process || "—"}</td>
                      <td className="text-sm text-gray">{g.variety || "—"}</td>
                      <td className="text-sm"><span style={{ fontWeight: 600, color: g.stockKg < 10 ? "#DC2626" : "#059669" }}>{g.stockKg.toFixed(1)}</span></td>
                      <td className="text-sm text-gray">{g.costPerKg ? `$${g.costPerKg.toFixed(2)}` : "—"}</td>
                      <td className="text-sm text-gray">{g._count?.roastProfiles || 0}</td>
                      {isManager && (
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => openEditGreen(g)} className="btn-icon" style={{ color: "#7C3AED" }}><Pencil size={14} /></button>
                            <button onClick={() => deleteGreen(g.id)} className="btn-icon" style={{ color: "#DC2626" }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Profiles Tab ───────────────────────────────────── */}
      {activeTab === "profiles" && (
        <div className="space-y-4">
          {isManager && (
            <div className="flex justify-end">
              <button className="btn btn-primary btn-sm" onClick={openAddProfile}><Plus size={14} /> New Profile</button>
            </div>
          )}

          {showProfileForm && (
            <div className="card" style={{ padding: 20, border: "2px solid #7C3AED" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{editingProfile ? "Edit" : "New"} Roast Profile</h3>
              <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Profile Name *</label><input className="form-input" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="e.g. Med Roast Ethiopian" /></div>
                <div><label className="form-label">Green Coffee *</label><select className="form-input" value={profileForm.greenCoffeeId} onChange={e => setProfileForm({ ...profileForm, greenCoffeeId: e.target.value })}>
                  <option value="">Select</option>
                  {greenCoffees.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select></div>
                <div><label className="form-label">Target Weight (kg)</label><input type="number" step="0.1" className="form-input" value={profileForm.targetWeightKg} onChange={e => setProfileForm({ ...profileForm, targetWeightKg: e.target.value })} /></div>
                <div><label className="form-label">Charge Temp (°F)</label><input type="number" className="form-input" value={profileForm.chargeTemp} onChange={e => setProfileForm({ ...profileForm, chargeTemp: e.target.value })} /></div>
                <div><label className="form-label">Turn Around (sec)</label><input type="number" className="form-input" value={profileForm.turnAroundPoint} onChange={e => setProfileForm({ ...profileForm, turnAroundPoint: e.target.value })} /></div>
                <div><label className="form-label">First Crack (sec)</label><input type="number" className="form-input" value={profileForm.firstCrack} onChange={e => setProfileForm({ ...profileForm, firstCrack: e.target.value })} /></div>
                <div><label className="form-label">Development Time (sec)</label><input type="number" className="form-input" value={profileForm.developmentTime} onChange={e => setProfileForm({ ...profileForm, developmentTime: e.target.value })} /></div>
                <div><label className="form-label">Drop Temp (°F)</label><input type="number" className="form-input" value={profileForm.dropTemp} onChange={e => setProfileForm({ ...profileForm, dropTemp: e.target.value })} /></div>
                <div><label className="form-label">Total Duration (sec)</label><input type="number" className="form-input" value={profileForm.totalDuration} onChange={e => setProfileForm({ ...profileForm, totalDuration: e.target.value })} /></div>
                <div><label className="form-label">Roast Level</label><select className="form-input" value={profileForm.roastLevel} onChange={e => setProfileForm({ ...profileForm, roastLevel: e.target.value })}>
                  {ROAST_LEVELS.map(l => <option key={l} value={l}>{l.replace("_", " ")}</option>)}
                </select></div>
                <div style={{ gridColumn: "1 / -1" }}><label className="form-label">Notes</label><input className="form-input" value={profileForm.notes} onChange={e => setProfileForm({ ...profileForm, notes: e.target.value })} /></div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowProfileForm(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          )}

          {profiles.length === 0 ? (
            <div className="card"><div className="empty-state">No roast profiles yet</div></div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {profiles.map(p => (
                <div key={p.id} className="card" style={{ padding: 16, borderLeft: `4px solid ${ROAST_COLORS[p.roastLevel] || "#E5E7EB"}` }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <h4 className="font-semibold text-sm">{p.name}</h4>
                    <span className="badge" style={{ background: ROAST_COLORS[p.roastLevel], color: ROAST_TEXT[p.roastLevel], fontSize: 10 }}>{p.roastLevel.replace("_", " ")}</span>
                  </div>
                  <div className="text-xs text-gray" style={{ marginBottom: 4 }}>☕ {p.greenCoffee?.name || "Unknown"}</div>
                  <div className="text-xs" style={{ color: "#6B7280" }}>
                    Batch: {p.targetWeightKg}kg
                    {p.chargeTemp && <> · Charge: {p.chargeTemp}°F</>}
                    {p.dropTemp && <> · Drop: {p.dropTemp}°F</>}
                    {p.totalDuration && <> · {Math.floor(p.totalDuration / 60)}:{String(Math.round(p.totalDuration % 60)).padStart(2, "0")}</>}
                  </div>
                  <div className="text-xs text-gray">{p._count?.roastLogs || 0} roasts logged</div>
                  {isManager && (
                    <div className="flex gap-1" style={{ marginTop: 8 }}>
                      <button onClick={() => openEditProfile(p)} className="btn btn-secondary btn-sm" style={{ padding: "2px 8px" }}><Pencil size={12} /></button>
                      <button onClick={() => deleteProfile(p.id)} className="btn btn-secondary btn-sm" style={{ padding: "2px 8px" }}><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Roast Logs Tab ──────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {isManager && (
            <div className="flex justify-end">
              <button className="btn btn-primary btn-sm" onClick={openAddLog}><Plus size={14} /> Log a Roast</button>
            </div>
          )}

          {showLogForm && (
            <div className="card" style={{ padding: 20, border: "2px solid #7C3AED" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Log a Roast</h3>
              <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Date *</label><input type="date" className="form-input" value={logForm.date} onChange={e => setLogForm({ ...logForm, date: e.target.value })} /></div>
                <div><label className="form-label">Green Coffee *</label><select className="form-input" value={logForm.greenCoffeeId} onChange={e => setLogForm({ ...logForm, greenCoffeeId: e.target.value })}>
                  <option value="">Select</option>
                  {greenCoffees.map(g => <option key={g.id} value={g.id}>{g.name} ({g.stockKg.toFixed(1)} kg)</option>)}
                </select></div>
                <div><label className="form-label">Profile</label><select className="form-input" value={logForm.profileId} onChange={e => setLogForm({ ...logForm, profileId: e.target.value })}>
                  <option value="">None</option>
                  {profiles.filter(p => !logForm.greenCoffeeId || p.greenCoffeeId === parseInt(logForm.greenCoffeeId)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select></div>
                <div><label className="form-label">Green Weight (kg) *</label><input type="number" step="0.1" className="form-input" value={logForm.greenWeightKg} onChange={e => setLogForm({ ...logForm, greenWeightKg: e.target.value })} /></div>
                <div><label className="form-label">Roasted Weight (kg) *</label><input type="number" step="0.1" className="form-input" value={logForm.roastedWeightKg} onChange={e => setLogForm({ ...logForm, roastedWeightKg: e.target.value })} /></div>
                <div><label className="form-label">Roast Level</label><select className="form-input" value={logForm.roastLevel} onChange={e => setLogForm({ ...logForm, roastLevel: e.target.value })}>
                  {ROAST_LEVELS.map(l => <option key={l} value={l}>{l.replace("_", " ")}</option>)}
                </select></div>
                <div><label className="form-label">Charge Temp (°F)</label><input type="number" className="form-input" value={logForm.chargeTemp} onChange={e => setLogForm({ ...logForm, chargeTemp: e.target.value })} /></div>
                <div><label className="form-label">First Crack (sec)</label><input type="number" className="form-input" value={logForm.firstCrackTime} onChange={e => setLogForm({ ...logForm, firstCrackTime: e.target.value })} /></div>
                <div><label className="form-label">Drop Temp (°F)</label><input type="number" className="form-input" value={logForm.dropTemp} onChange={e => setLogForm({ ...logForm, dropTemp: e.target.value })} /></div>
                <div><label className="form-label">Total Duration (sec)</label><input type="number" className="form-input" value={logForm.totalDuration} onChange={e => setLogForm({ ...logForm, totalDuration: e.target.value })} /></div>
                <div><label className="form-label">Batch #</label><input className="form-input" value={logForm.batchNumber} onChange={e => setLogForm({ ...logForm, batchNumber: e.target.value })} /></div>
                <div style={{ gridColumn: "1 / -1" }}><label className="form-label">Notes</label><input className="form-input" value={logForm.notes} onChange={e => setLogForm({ ...logForm, notes: e.target.value })} /></div>
              </div>
              {logForm.greenWeightKg && logForm.roastedWeightKg && (
                <div style={{ padding: "8px 12px", background: "#F0FDF4", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
                  Weight loss: {((parseFloat(logForm.greenWeightKg) - parseFloat(logForm.roastedWeightKg)) / parseFloat(logForm.greenWeightKg) * 100).toFixed(1)}%
                </div>
              )}
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowLogForm(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveLog} disabled={saving}>{saving ? "Saving..." : "Log Roast"}</button>
              </div>
            </div>
          )}

          {logs.length === 0 ? (
            <div className="card"><div className="empty-state">No roast logs yet</div></div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr><th>Date</th><th>Green Coffee</th><th>Profile</th><th>In (kg)</th><th>Out (kg)</th><th>Loss %</th><th>Level</th><th>By</th>{isManager && <th></th>}</tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id}>
                      <td className="text-sm">{new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                      <td className="font-medium text-sm">{l.greenCoffee?.name || "—"}</td>
                      <td className="text-sm text-gray">{l.profile?.name || "—"}</td>
                      <td className="text-sm">{l.greenWeightKg}</td>
                      <td className="text-sm">{l.roastedWeightKg}</td>
                      <td className="text-sm font-medium" style={{ color: "#D97706" }}>{l.lossPercent?.toFixed(1) || "—"}%</td>
                      <td><span className="badge" style={{ background: ROAST_COLORS[l.roastLevel], color: ROAST_TEXT[l.roastLevel], fontSize: 10 }}>{l.roastLevel.replace("_", " ")}</span></td>
                      <td className="text-sm text-gray">{l.performer?.name || "—"}</td>
                      {isManager && (
                        <td>
                          {(role === "OWNER" || role === "PLATFORM_ADMIN") && (
                            <button onClick={() => deleteLog(l.id)} className="btn-icon" style={{ color: "#DC2626" }}><Trash2 size={14} /></button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}