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
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FF385C]">
      <div className="w-full max-w-[420px] mx-auto px-6">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🍩</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Duffers OS</h1>
          <p className="text-white/80 text-sm mt-2 font-medium">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-[#FFF0F0] border border-[#FFD4D4] text-[#C13515] rounded-xl px-4 py-3 text-sm mb-5 font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#222222] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]"
                placeholder="hello@duffersdonutshop.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#222222] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF385C] hover:bg-[#E0304F] disabled:bg-[#FF385C]/50 text-white font-bold py-3.5 px-5 rounded-xl text-[16px] transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-white/60 text-xs mt-6">
          Duffers Donut Shop • Operations Portal
        </p>
      </div>
    </div>
  );
}