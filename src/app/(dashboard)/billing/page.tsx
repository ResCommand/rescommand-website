"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Check, X, CreditCard, ExternalLink, Crown, Sparkles, Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface PlanData {
  id: number; planKey: string; name: string; price: number;
  staffLimit: number | null; features: string | null; active: boolean;
  stripePriceId: string | null;
}

interface BillingData {
  tenant: {
    id: number; name: string; plan: string; active: boolean;
    stripeCustomerId: string | null; trialEndsAt: string | null; createdAt: string;
    _count: { members: number };
  } | null;
  subscription: {
    id: number; status: string; stripeSubscriptionId: string;
    currentPeriodStart: string; currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  plans: PlanData[];
}

const PLAN_COLORS: Record<string, string> = {
  TEST: "#6B7280", FREE: "#6B7280", CORE: "#3B82F6", OPERATOR: "#8B5CF6",
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  TEST: <span style={{ fontSize: 24 }}>🧪</span>,
  FREE: <span style={{ fontSize: 24 }}>🆓</span>,
  CORE: <Sparkles size={24} style={{ color: "#3B82F6" }} />,
  OPERATOR: <Crown size={24} style={{ color: "#8B5CF6" }} />,
};

export default function BillingPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing").then(r => r.json()).then(setData).catch(() => toast.error("Failed to load billing")).finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planKey: string) => {
    setUpgrading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const d = await res.json();
      if (d.url) window.location.href = d.url;
      else toast.success("Plan updated!");
    } catch { toast.error("Failed to start checkout"); }
    finally { setUpgrading(null); }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const d = await res.json();
      if (d.url) window.open(d.url, "_blank");
      else toast.error("No billing account found");
    } catch { toast.error("Failed to open portal"); }
    finally { setPortalLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "#6B7280" }}>
        <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
        Loading billing info...
      </div>
    );
  }

  if (!data?.tenant) return <div style={{ padding: 48, textAlign: "center" }}>No tenant found</div>;

  const currentPlan = data.plans.find(p => p.planKey === data.tenant!.plan);
  const staffCount = data.tenant._count?.members || 0;
  const isTrial = data.tenant.trialEndsAt && new Date(data.tenant.trialEndsAt) > new Date();

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Billing & Subscription</h1>
      <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Manage your ResCommand plan and payment details</p>

      {/* Current Plan Card */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 24, marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Current Plan</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{currentPlan?.name || data.tenant.plan}</span>
              <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${PLAN_COLORS[data.tenant.plan]}20`, color: PLAN_COLORS[data.tenant.plan] }}>
                {data.tenant.plan}
              </span>
              {isTrial && (
                <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#F59E0B20", color: "#F59E0B" }}>
                  TRIAL — ends {new Date(data.tenant.trialEndsAt!).toLocaleDateString()}
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
              {staffCount} of {currentPlan?.staffLimit || "∞"} staff members used
              {data.subscription && (
                <> · Renews {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}</>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: PLAN_COLORS[data.tenant.plan] }}>
              ${(currentPlan?.price || 0) / 100}<span style={{ fontSize: 14, fontWeight: 400, color: "#6B7280" }}>/mo</span>
            </div>
            {data.tenant.stripeCustomerId && (
              <button onClick={handlePortal} disabled={portalLoading}
                style={{ marginTop: 8, padding: "6px 12px", borderRadius: 6, border: "1px solid #D1D5DB", background: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: "#374151" }}
              >
                <CreditCard size={12} /> {portalLoading ? "Loading..." : "Manage Payment"}
              </button>
            )}
          </div>
        </div>

        {data.subscription?.cancelAtPeriodEnd && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#FEF3C7", borderRadius: 6, color: "#92400E", fontSize: 13 }}>
            ⚠️ Your subscription is set to cancel on {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}.
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Choose a Plan</h2>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.plans.filter(p => p.active && p.planKey !== 'TEST').length}, 1fr)`, gap: 16, marginBottom: 32 }}>
        {data.plans.filter(p => p.active && p.planKey !== 'TEST').map(plan => {
          const isCurrent = plan.planKey === data.tenant!.plan;
          const features = parseFeatures(plan.features);
          const isDowngrade = data.plans.findIndex(p => p.planKey === plan.planKey) < data.plans.findIndex(p => p.planKey === data.tenant!.plan);

          return (
            <div key={plan.planKey} style={{
              background: isCurrent ? "#EFF6FF" : "#fff",
              borderRadius: 12,
              border: `2px solid ${isCurrent ? "#2563EB" : "#E5E7EB"}`,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}>
              {isCurrent && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", padding: "2px 12px", background: "#2563EB", borderRadius: 10, fontSize: 10, fontWeight: 700, color: "#fff" }}>CURRENT</div>
              )}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>{PLAN_ICONS[plan.planKey] || "📦"}</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{plan.name}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: PLAN_COLORS[plan.planKey] }}>
                  {plan.price === 0 ? "Free" : `$${plan.price / 100}`}
                  {plan.price > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: "#6B7280" }}>/mo</span>}
                </div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>Up to {plan.staffLimit || "∞"} staff</div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {features.map((f: string, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151" }}>
                    <Check size={12} style={{ color: "#059669", flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              {isCurrent ? (
                <button disabled style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #D1D5DB", background: "#F9FAFB", color: "#9CA3AF", fontWeight: 600, fontSize: 13, cursor: "default" }}>
                  Current Plan
                </button>
              ) : (
                <button onClick={() => handleUpgrade(plan.planKey)} disabled={upgrading === plan.planKey}
                  style={{
                    width: "100%", padding: 10, borderRadius: 8, border: "none",
                    background: isDowngrade ? "#6B7280" : "#2563EB",
                    color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    opacity: upgrading === plan.planKey ? 0.6 : 1,
                  }}
                >
                  {upgrading === plan.planKey ? "Redirecting..." : isDowngrade ? "Downgrade" : "Upgrade"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>
        <p>Questions? Contact <a href="mailto:support@rescommand.com" style={{ color: "#2563EB" }}>support@rescommand.com</a></p>
        <p style={{ marginTop: 4 }}>© {new Date().getFullYear()} Venturio LLC. All rights reserved.</p>
      </div>
    </div>
  );
}

function parseFeatures(f: string | unknown | null): string[] {
  if (!f) return [];
  if (typeof f === "string") { try { return JSON.parse(f); } catch { return []; } }
  if (Array.isArray(f)) return f as string[];
  return [];
}