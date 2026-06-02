"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, ChevronRight, ChevronLeft, Check, Loader2, Plus,
} from "lucide-react";

const BUSINESS_TYPES = [
  { key: "DONUT_SHOP", label: "Donut Shop", icon: "🍩", desc: "Donuts, drinks, pastries" },
  { key: "BAKERY", label: "Bakery", icon: "🥖", desc: "Breads, cakes, pastries" },
  { key: "CAFE", label: "Café / Coffee Shop", icon: "☕", desc: "Coffee, espresso, light fare" },
  { key: "RESTAURANT", label: "Restaurant", icon: "🍽️", desc: "Full service kitchen" },
  { key: "BAR", label: "Bar / Pub", icon: "🍺", desc: "Drinks, bar food" },
  { key: "FOOD_TRUCK", label: "Food Truck", icon: "🚚", desc: "Mobile food service" },
];

const MODULES = [
  { key: "production", name: "Production / Par Sheets", icon: "🏭" },
  { key: "inventory", name: "Inventory Management", icon: "📦" },
  { key: "recipes", name: "Recipes", icon: "📋" },
  { key: "schedule", name: "Employee Scheduling", icon: "📅" },
  { key: "sops", name: "SOPs", icon: "📖" },
  { key: "overboards", name: "Menu Planning", icon: "🍽️" },
  { key: "espresso", name: "Espresso Dialing", icon: "☕" },
  { key: "social", name: "Social Media Planner", icon: "📱" },
  { key: "roasting", name: "Coffee Roasting", icon: "🫘" },
];

// Which modules are auto-enabled per business type
const TYPE_DEFAULTS: Record<string, string[]> = {
  DONUT_SHOP: ["production", "inventory", "recipes", "schedule", "sops", "overboards", "espresso"],
  BAKERY: ["production", "inventory", "recipes", "schedule", "sops", "overboards"],
  CAFE: ["production", "inventory", "recipes", "schedule", "sops", "overboards", "espresso"],
  RESTAURANT: ["production", "inventory", "recipes", "schedule", "sops", "overboards"],
  BAR: ["inventory", "schedule", "sops"],
  FOOD_TRUCK: ["production", "inventory", "recipes", "schedule", "sops"],
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    businessType: "DONUT_SHOP",
    plan: "STARTER",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    modules: TYPE_DEFAULTS.DONUT_SHOP,
    teamMembers: [] as Array<{ name: string; email: string; role: string }>,
  });

  const [teamName, setTeamName] = useState("");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamRole, setTeamRole] = useState("EMPLOYEE");

  const steps = ["Business", "Features", "Account", "Team", "Done"];
  const slugPreview = form.slug || slugify(form.name) || "your-business";

  const toggleModule = (key: string) => {
    setForm({
      ...form,
      modules: form.modules.includes(key)
        ? form.modules.filter(m => m !== key)
        : [...form.modules, key],
    });
  };

  const addTeamMember = () => {
    if (!teamName || !teamEmail) return;
    setForm({ ...form, teamMembers: [...form.teamMembers, { name: teamName, email: teamEmail, role: teamRole }] });
    setTeamName(""); setTeamEmail("");
  };

  const handleBusinessTypeChange = (key: string) => {
    setForm({ ...form, businessType: key, modules: TYPE_DEFAULTS[key] || [] });
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: form.slug || slugify(form.name),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(4); // Show success
      } else {
        setError(data.error?.fieldErrors?.slug?.[0] || data.error?.fieldErrors?.ownerEmail?.[0] || data.error || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 640, width: "100%" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>ResCommand</h1>
          <p style={{ color: "#94A3B8", fontSize: 14 }}>Restaurant operations, simplified</p>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div style={{ display: "flex", gap: 4, marginBottom: 24, justifyContent: "center" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600,
                  background: i < step ? "#059669" : i === step ? "#3B82F6" : "#334155",
                  color: i <= step ? "#fff" : "#64748B",
                }}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < 4 && <span style={{ fontSize: 11, color: i <= step ? "#94A3B8" : "#475569", display: i === step ? "inline" : "none" }}>{s}</span>}
              </div>
            ))}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
          {error && (
            <div style={{ padding: "10px 14px", background: "#FEE2E2", borderRadius: 6, marginBottom: 16, color: "#991B1B", fontSize: 14 }}>
              {typeof error === "string" ? error : "Please check your inputs and try again."}
            </div>
          )}

          {/* Step 0: Business Info */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Tell us about your business</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>We'll customize ResCommand for your type of restaurant.</p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>Business Name *</label>
                <input
                  className="form-input" style={{ fontSize: 16, padding: "10px 14px" }}
                  placeholder="e.g. Duffers Donut Shop"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                />
              </div>

              <div style={{ marginBottom: 16, padding: "10px 14px", background: "#F0FDF4", borderRadius: 6, border: "1px solid #BBF7D0" }}>
                <span style={{ fontSize: 13, color: "#374151" }}>Your URL: </span>
                <span style={{ fontWeight: 600, color: "#059669" }}>{slugPreview}.rescommand.com</span>
                <div style={{ marginTop: 4 }}>
                  <input
                    className="form-input" style={{ fontSize: 13, padding: "6px 10px" }}
                    placeholder="Customize URL slug (optional)"
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value.replace(/[^a-z0-9-]/g, "") })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Business Type *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {BUSINESS_TYPES.map(bt => (
                    <button
                      key={bt.key}
                      onClick={() => handleBusinessTypeChange(bt.key)}
                      style={{
                        padding: 16, borderRadius: 8, border: `2px solid ${form.businessType === bt.key ? "#3B82F6" : "#E5E7EB"}`,
                        background: form.businessType === bt.key ? "#EFF6FF" : "#fff",
                        cursor: "pointer", textAlign: "center", transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 4 }}>{bt.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{bt.label}</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>{bt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Features */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Pick your features</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>We've pre-selected modules based on your business type. Adjust as needed.</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {MODULES.map(m => (
                  <button
                    key={m.key}
                    onClick={() => toggleModule(m.key)}
                    style={{
                      padding: 12, borderRadius: 8, border: `1px solid ${form.modules.includes(m.key) ? "#3B82F6" : "#E5E7EB"}`,
                      background: form.modules.includes(m.key) ? "#EFF6FF" : "#fff",
                      cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: form.modules.includes(m.key) ? "#2563EB" : "#9CA3AF" }}>
                        {form.modules.includes(m.key) ? "Enabled" : "Disabled"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Owner Account */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Create your account</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>You'll be the owner of this ResCommand workspace.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>Your Name *</label>
                  <input className="form-input" style={{ fontSize: 16, padding: "10px 14px" }} value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="Shawn Garrison" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>Email *</label>
                  <input type="email" className="form-input" style={{ fontSize: 16, padding: "10px 14px" }} value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} placeholder="hello@duffersdonutshop.com" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>Password *</label>
                  <input type="password" className="form-input" style={{ fontSize: 16, padding: "10px 14px" }} value={form.ownerPassword} onChange={e => setForm({ ...form, ownerPassword: e.target.value })} placeholder="Min 6 characters" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team Members (optional) */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Add your team</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Invite team members now, or add them later from the Admin panel.</p>

              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <input className="form-input" placeholder="Name" value={teamName} onChange={e => setTeamName(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
                <input type="email" className="form-input" placeholder="Email" value={teamEmail} onChange={e => setTeamEmail(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
                <select className="form-input" value={teamRole} onChange={e => setTeamRole(e.target.value)} style={{ width: 120 }}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
                <button className="btn btn-secondary btn-sm" onClick={addTeamMember}><Plus size={14} /> Add</button>
              </div>

              {form.teamMembers.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {form.teamMembers.map((m, i) => (
                    <div key={i} style={{ padding: "8px 12px", background: "#F9FAFB", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span className="font-medium text-sm">{m.name}</span>
                        <span className="text-xs text-gray" style={{ marginLeft: 8 }}>{m.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-blue" style={{ fontSize: 10 }}>{m.role}</span>
                        <button onClick={() => setForm({ ...form, teamMembers: form.teamMembers.filter((_, j) => j !== i) })} style={{ color: "#DC2626", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {form.teamMembers.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", background: "#F9FAFB", borderRadius: 8 }}>
                  <p className="text-sm text-gray">No team members added yet. You can always add them later.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Done! */}
          {step === 4 && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Welcome to ResCommand!</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
                Your workspace is ready at <strong>{slugPreview}.rescommand.com</strong>
              </p>
              <div style={{ padding: 16, background: "#F0FDF4", borderRadius: 8, marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>Next steps:</p>
                <ul style={{ textAlign: "left", fontSize: 13, color: "#374151", display: "flex", flexDirection: "column", gap: 4, paddingLeft: 20 }}>
                  <li>Log in with your email and password</li>
                  <li>Set up your inventory and par sheets</li>
                  <li>Add your team members from Admin</li>
                  <li>Create your first schedule</li>
                </ul>
              </div>
              <button className="btn btn-primary" onClick={() => router.push("/login")}>
                Go to Login <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 4 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep(Math.max(0, step - 1))}
                style={{ visibility: step === 0 ? "hidden" : "visible" }}
              >
                <ChevronLeft size={14} /> Back
              </button>

              {step < 3 ? (
                <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={
                  (step === 0 && !form.name) ||
                  (step === 2 && (!form.ownerName || !form.ownerEmail || !form.ownerPassword))
                }>
                  Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Workspace"}
                </button>
              )}
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#64748B", fontSize: 12, marginTop: 16 }}>
          By signing up, you agree to ResCommand's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}