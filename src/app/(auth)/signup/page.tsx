"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, ChevronLeft, Check, Loader2, Plus,
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

const TYPE_DEFAULTS: Record<string, string[]> = {
  DONUT_SHOP: ["production", "inventory", "recipes", "schedule", "sops", "overboards", "espresso"],
  BAKERY: ["production", "inventory", "recipes", "schedule", "sops", "overboards"],
  CAFE: ["production", "inventory", "recipes", "schedule", "sops", "overboards", "espresso"],
  RESTAURANT: ["production", "inventory", "recipes", "schedule", "sops", "overboards"],
  BAR: ["inventory", "schedule", "sops"],
  FOOD_TRUCK: ["production", "inventory", "recipes", "schedule", "sops"],
};

// Fallback plans used when the API is unreachable
const FALLBACK_PLANS = [
  {
    key: "CORE",
    name: "Core",
    price: 99,
    period: "/month",
    desc: "1 location · up to 15 team members",
    features: ["Inventory & recipes", "Production sheets", "Employee scheduling", "SOPs", "AI recipe & inventory import", "Menu planning", "Email support"],
    highlight: false,
  },
  {
    key: "OPERATOR",
    name: "Operator",
    price: 199,
    period: "/month",
    desc: "Multiple locations · up to 35 team members",
    features: ["Everything in Core", "Multi-location support", "Social media planner", "Custom integrations", "Priority support", "Dedicated account manager"],
    highlight: true,
  },
];

interface PricingPlan {
  id: number;
  planKey: string;
  name: string;
  price: number; // cents
  staffLimit: number | null;
  features: string | string[] | null;
  active: boolean;
  sortOrder: number;
  stripePriceId: string | null;
}

function parseFeatures(f: string | string[] | null): string[] {
  if (!f) return [];
  if (Array.isArray(f)) return f;
  try { return JSON.parse(f); } catch { return []; }
}

// Convert DB PlanPricing rows into the display shape the signup wizard uses
function dbPlansToDisplay(plans: PricingPlan[]) {
  return plans.map((p, i) => ({
    key: p.planKey,
    name: p.name,
    price: p.price / 100, // convert cents to dollars
    period: "/month",
    desc: p.staffLimit ? `Up to ${p.staffLimit} staff` : "Unlimited staff",
    features: parseFeatures(p.features),
    highlight: i === plans.length - 1, // highlight the top tier (Operator)
  }));
}

const THEME_COLORS = [
  { name: "Violet", value: "#7C3AED" },
  { name: "Green", value: "#059669" },
  { name: "Indigo", value: "#4F46E5" },
  { name: "Red", value: "#DC2626" },
  { name: "Orange", value: "#EA580C" },
  { name: "Teal", value: "#0D9488" },
  { name: "Pink", value: "#DB2777" },
  { name: "Slate", value: "#475569" },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [plansLoading, setPlansLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    businessType: "DONUT_SHOP",
    plan: "CORE",
    brandName: "",
    theme: "dark" as "dark" | "light",
    primaryColor: "#7C3AED",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    modules: TYPE_DEFAULTS.DONUT_SHOP,
    teamMembers: [] as Array<{ name: string; email: string; role: string }>,
  });

  const [teamName, setTeamName] = useState("");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamRole, setTeamRole] = useState("EMPLOYEE");

  // Fetch active plans from the database (admin-managed pricing)
  useEffect(() => {
    fetch("/api/platform/pricing")
      .then(r => r.json())
      .then((data: PricingPlan[]) => {
        // Filter to active, non-TEST plans, sort by sortOrder
        const active = data
          .filter(p => p.active && p.planKey !== "TEST" && p.planKey !== "FREE")
          .sort((a, b) => a.sortOrder - b.sortOrder);
        if (active.length > 0) {
          const display = dbPlansToDisplay(active);
          setPlans(display);
          // If the current default isn't in the fetched plans, pick the first one
          const keys = display.map(p => p.key);
          if (!keys.includes(form.plan)) {
            setForm(f => ({ ...f, plan: keys[0] }));
          }
        }
      })
      .catch(() => {
        // Silently fall back to hardcoded plans
        console.warn("Failed to fetch plans from API, using fallback");
      })
      .finally(() => setPlansLoading(false));
  }, []);

  const steps = ["Business", "Features", "Plan", "Branding", "Account", "Team", "Done"];
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
      // Step 1: Create the tenant (workspace)
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: form.slug || slugify(form.name),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.fieldErrors?.slug?.[0] || data.error?.fieldErrors?.ownerEmail?.[0] || data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }

      // Step 2: Create Stripe checkout session for paid plans
      if (form.plan !== "FREE") {
        try {
          const checkoutRes = await fetch("/api/stripe/signup-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planKey: form.plan,
              tenantId: data.id,
              email: form.ownerEmail,
            }),
          });
          const checkoutData = await checkoutRes.json();
          if (checkoutRes.ok && checkoutData.url) {
            // Redirect to Stripe checkout
            window.location.href = checkoutData.url;
            return;
          }
          // If checkout fails, still show success — they can pay later
          console.error("Stripe checkout failed:", checkoutData.error);
        } catch (e) {
          console.error("Stripe checkout error:", e);
        }
      }

      // No Stripe redirect — show success
      setStep(6);
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1E1033 0%, #2D1B4E 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 640, width: "100%" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>ResCommand</h1>
          <p style={{ color: "#94A3B8", fontSize: 14 }}>Restaurant operations, simplified</p>
        </div>

        {/* Step indicator */}
        {step < 6 && (
          <div style={{ display: "flex", gap: 4, marginBottom: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {steps.slice(0, -1).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600,
                  background: i < step ? "#059669" : i === step ? "#A855F7" : "#334155",
                  color: i <= step ? "#fff" : "#64748B",
                }}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === step ? "#94A3B8" : "#475569", whiteSpace: "nowrap" }}>{s}</span>
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
                <span style={{ fontWeight: 600, color: "#059669" }}>app.rescommand.com</span>
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
                        padding: 16, borderRadius: 8, border: `2px solid ${form.businessType === bt.key ? "#A855F7" : "#E5E7EB"}`,
                        background: form.businessType === bt.key ? "#F3EEFF" : "#fff",
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
                      padding: 12, borderRadius: 8, border: `1px solid ${form.modules.includes(m.key) ? "#A855F7" : "#E5E7EB"}`,
                      background: form.modules.includes(m.key) ? "#F3EEFF" : "#fff",
                      cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: form.modules.includes(m.key) ? "#7C3AED" : "#9CA3AF" }}>
                        {form.modules.includes(m.key) ? "Enabled" : "Disabled"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Choose your plan</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Start with any plan. Upgrade or cancel anytime.</p>

              {plansLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                  <p>Loading plans...</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, gap: 12 }}>
                  {plans.map(plan => (
                  <button
                    key={plan.key}
                    onClick={() => setForm({ ...form, plan: plan.key })}
                    style={{
                      padding: 20, borderRadius: 10, border: `2px solid ${form.plan === plan.key ? "#A855F7" : "#E5E7EB"}`,
                      background: form.plan === plan.key ? "#F3EEFF" : "#fff",
                      cursor: "pointer", textAlign: "center", position: "relative", transition: "all 0.15s",
                    }}
                  >
                    {plan.highlight && (
                      <div style={{
                        position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                        background: "#A855F7", color: "#fff", fontSize: 10, fontWeight: 700,
                        padding: "2px 10px", borderRadius: 10,
                      }}>BEST VALUE</div>
                    )}
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
                      ${plan.price}<span style={{ fontSize: 14, fontWeight: 400, color: "#6B7280" }}>{plan.period}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>{plan.desc}</div>
                    <div style={{ textAlign: "left" }}>
                      {plan.features.map((f, i) => (
                        <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>
                          ✓ {f}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              )}
            </div>
          )}

          {/* Step 3: Branding */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Brand your system</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Give your ResCommand workspace a name and look that matches your restaurant.</p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>System Name *</label>
                <input
                  className="form-input" style={{ fontSize: 16, padding: "10px 14px" }}
                  placeholder="e.g. Duffers OS, Kitchen Command, The Bakery Hub"
                  value={form.brandName}
                  onChange={e => setForm({ ...form, brandName: e.target.value })}
                />
                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  This appears in your sidebar. Your system will show as "{form.brandName || 'Your Name'} by ResCommand"
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Theme</label>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setForm({ ...form, theme: "dark" })}
                    style={{
                      flex: 1, padding: 16, borderRadius: 8,
                      border: `2px solid ${form.theme === "dark" ? "#A855F7" : "#E5E7EB"}`,
                      background: form.theme === "dark" ? "#F3EEFF" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 40, height: 24, background: "#1E1033", borderRadius: 4, margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Dark Mode</div>
                  </button>
                  <button
                    onClick={() => setForm({ ...form, theme: "light" })}
                    style={{
                      flex: 1, padding: 16, borderRadius: 8,
                      border: `2px solid ${form.theme === "light" ? "#A855F7" : "#E5E7EB"}`,
                      background: form.theme === "light" ? "#F3EEFF" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 40, height: 24, background: "#F0F4FF", borderRadius: 4, margin: "0 auto 8px", border: "1px solid #E5E7EB" }} />
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Light Mode</div>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Accent Color</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {THEME_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setForm({ ...form, primaryColor: c.value })}
                      style={{
                        width: 36, height: 36, borderRadius: 18,
                        background: c.value,
                        border: form.primaryColor === c.value ? "3px solid #111827" : "3px solid transparent",
                        cursor: "pointer", outline: form.primaryColor === c.value ? "2px solid #A855F7" : "none",
                        outlineOffset: 2,
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: form.theme === "dark" ? "#1e293b" : "#F8FAFC", border: "1px solid #E5E7EB" }}>
                <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8 }}>Preview:</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: form.primaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                      {(form.brandName || form.name || "R")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: form.theme === "dark" ? "#fff" : "#111827" }}>
                      {form.brandName || "Your System"}
                    </div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>by ResCommand</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Owner Account */}
          {step === 4 && (
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
                  <input type="email" className="form-input" style={{ fontSize: 16, padding: "10px 14px" }} value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} placeholder="hello@yourrestaurant.com" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>Password *</label>
                  <input type="password" className="form-input" style={{ fontSize: 16, padding: "10px 14px" }} value={form.ownerPassword} onChange={e => setForm({ ...form, ownerPassword: e.target.value })} placeholder="Min 6 characters" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Team Members (optional) */}
          {step === 5 && (
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
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</span>
                        <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 8 }}>{m.email}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, background: "#F3EEFF", color: "#6D28D9", padding: "2px 8px", borderRadius: 10 }}>{m.role}</span>
                        <button onClick={() => setForm({ ...form, teamMembers: form.teamMembers.filter((_, j) => j !== i) })} style={{ color: "#DC2626", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {form.teamMembers.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", background: "#F9FAFB", borderRadius: 8 }}>
                  <p style={{ fontSize: 13, color: "#6B7280" }}>No team members added yet. You can always add them later.</p>
                </div>
              )}

              {/* Summary before submit */}
              <div style={{ marginTop: 20, padding: 16, background: "#F0FDF4", borderRadius: 8, border: "1px solid #BBF7D0" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>You're all set! Here's your summary:</p>
                <div style={{ fontSize: 12, color: "#374151", display: "flex", flexDirection: "column", gap: 4 }}>
                  <span>🏢 <strong>{form.name}</strong> — {BUSINESS_TYPES.find(b => b.key === form.businessType)?.label}</span>
                  <span>🏷️ <strong>{form.brandName || form.name}</strong> by ResCommand</span>
                  <span>🌐 app.rescommand.com</span>
                  <span>💰 {plans.find(p => p.key === form.plan)?.name} — ${plans.find(p => p.key === form.plan)?.price}/mo</span>
                  <span>👤 {form.ownerName} ({form.ownerEmail})</span>
                  {form.teamMembers.length > 0 && <span>👥 {form.teamMembers.length} team member(s)</span>}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Done! */}
          {step === 6 && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Welcome to ResCommand!</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
                Your workspace is ready! Log in at <strong>app.rescommand.com</strong>
              </p>
              <div style={{ padding: 16, background: "#F0FDF4", borderRadius: 8, marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>Next steps:</p>
                <ul style={{ textAlign: "left", fontSize: 13, color: "#374151", display: "flex", flexDirection: "column", gap: 4, paddingLeft: 20 }}>
                  <li>Log in with your email and password</li>
                  <li>Upload your logo in Settings</li>
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
          {step < 6 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep(Math.max(0, step - 1))}
                style={{ visibility: step === 0 ? "hidden" : "visible" }}
              >
                <ChevronLeft size={14} /> Back
              </button>

              {step < 5 ? (
                <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={
                  (step === 0 && !form.name) ||
                  (step === 4 && (!form.ownerName || !form.ownerEmail || !form.ownerPassword))
                }>
                  Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : `Create Workspace — $${plans.find(p => p.key === form.plan)?.price}/mo`}
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