"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Invalid email or password"); setLoading(false); }
    else { router.push("/"); router.refresh(); }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="w-full max-w-[400px] mx-auto px-5">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🍩</div>
          <h1 className="text-xl font-semibold text-[#111827]">Sign in to Duffers OS</h1>
          <p className="text-sm text-[#6B7280] mt-1">Enter your credentials to continue</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-md px-3 py-2 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-md text-sm bg-white placeholder:text-[#9CA3AF]"
                placeholder="hello@duffersdonutshop.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-md text-sm bg-white placeholder:text-[#9CA3AF]"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#1A56DB] hover:bg-[#1544B0] disabled:bg-[#1A56DB]/50 text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}