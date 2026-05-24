"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
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
      else window.location.href = "/";
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">🍩</div>
          <h1>Sign in to Duffers OS</h1>
          <p>Enter your credentials to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@duffersdonutshop.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8, padding: "10px 16px" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}