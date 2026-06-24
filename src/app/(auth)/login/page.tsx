"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1E1033 0%, #2D1B4E 50%, #7C3AED 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ textAlign: "center", color: "#C4B5FD" }}>
        <p>Loading...</p>
      </div>
    </div>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) setError("Invalid email or password");
      else window.location.href = callbackUrl;
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1E1033 0%, #2D1B4E 50%, #7C3AED 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "rgba(255,255,255,0.15)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 12,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>ResCommand</h1>
          <p style={{ color: "#C4B5FD", fontSize: 14, marginTop: 4 }}>Restaurant operations, simplified</p>
        </div>

        {/* Login card */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: 32,
          boxShadow: "0 8px 30px rgba(124, 58, 237, 0.25)",
        }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: "10px 14px", background: "#FEE2E2", borderRadius: 8,
                marginBottom: 16, color: "#991B1B", fontSize: 14, fontWeight: 500,
              }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Email</label>
              <input
                type="email"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  border: "1px solid #D1D5DB", fontSize: 14,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
                required
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Password</label>
                <a href="/forgot-password" style={{ fontSize: 12, color: "#7C3AED", fontWeight: 500, textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  border: "1px solid #D1D5DB", fontSize: 14,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; }}
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
                width: "100%", padding: "11px 16px", borderRadius: 12, border: "none",
                background: loading ? "#C4B5FD" : "#7C3AED", color: "#fff", fontWeight: 700,
                fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#6B7280" }}>
            New to ResCommand?{" "}
            <a href="/signup" style={{ color: "#7C3AED", fontWeight: 600, textDecoration: "none" }}>
              Create a workspace
            </a>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#A78BFA", fontSize: 11, marginTop: 16 }}>
          © {new Date().getFullYear()} Venturio LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}
