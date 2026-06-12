"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tenantName, setTenantName] = useState("");

  useEffect(() => {
    // Try to resolve tenant name from subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    const platformHosts = ["rescommand.com", "www.rescommand.com", "app.rescommand.com"];
    if (parts.length >= 2 && !hostname.includes("localhost") && !hostname.includes("127.0.0.1") && !hostname.endsWith(".drytis.dev") && !platformHosts.includes(hostname)) {
      // Subdomain like duffersdonutshop.rescommand.com (not platform hosts)
      const slug = parts[0];
      // Capitalize slug for display
      setTenantName(slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
    }
    // Also try fetching public branding for custom domains (e.g. ops.duffersdonutshop.com)
    fetch("/api/tenants/branding/public")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.brandName) setTenantName(data.brandName); })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // If on a subdomain, resolve tenant and pass tenantId
      let tenantId: string | undefined;
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const platformHosts = ["rescommand.com", "www.rescommand.com", "app.rescommand.com"];
      if (parts.length >= 2 && !hostname.includes("localhost") && !hostname.includes("127.0.0.1") && !hostname.endsWith(".drytis.dev") && !platformHosts.includes(hostname)) {
        try {
          const res = await fetch("/api/tenant-resolve?slug=" + parts[0]);
          if (res.ok) {
            const data = await res.json();
            if (data.id) tenantId = String(data.id);
          }
        } catch { /* ignore — login will still work without tenant context */ }
      }
      const res = await signIn("credentials", { email, password, tenantId, redirect: false });
      if (res?.error) setError("Invalid email or password");
      else window.location.href = "/";
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  const brandName = tenantName || "ResCommand";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
            {tenantName || "ResCommand"}
          </h1>
          {!tenantName && <p style={{ color: "#94A3B8", fontSize: 14 }}>Restaurant operations, simplified</p>}
          {tenantName && <p style={{ color: "#94A3B8", fontSize: 14 }}>Sign in to your workspace</p>}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: "10px 14px", background: "#FEE2E2", borderRadius: 6, marginBottom: 16, color: "#991B1B", fontSize: 14 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>Email</label>
              <input
                type="email"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 6, border: "1px solid #D1D5DB", fontSize: 14 }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
                required
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>Password</label>
              <input
                type="password"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 6, border: "1px solid #D1D5DB", fontSize: 14 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "10px 16px", borderRadius: 6, border: "none",
                background: loading ? "#93C5FD" : "#2563EB", color: "#fff", fontWeight: 600,
                fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#6B7280" }}>
            New to ResCommand?{" "}
            <a href="/signup" style={{ color: "#2563EB", fontWeight: 500, textDecoration: "none" }}>
              Create a workspace
            </a>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#64748B", fontSize: 11, marginTop: 16 }}>
          © {new Date().getFullYear()} Venturio LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}