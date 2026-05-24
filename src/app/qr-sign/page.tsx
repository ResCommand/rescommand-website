"use client";

import { QRCodeSVG } from "qrcode.react";

const entries = [
  { label: "Log Drinks", desc: "Coffee, espresso, lattes", path: "/entry/drinks", emoji: "☕" },
  { label: "Log Donuts", desc: "Made, sold, waste", path: "/entry/donuts", emoji: "🍩" },
  { label: "Log Sales", desc: "Transactions & tickets", path: "/entry/sales", emoji: "💰" },
  { label: "Log Dogels", desc: "Plain, everything, etc.", path: "/entry/dogels", emoji: "🥯" },
  { label: "Log Sandwiches", desc: "Bacon, sausage, etc.", path: "/entry/sandwiches", emoji: "🥪" },
  { label: "Clock In / Out", desc: "Track your hours", path: "/hours", emoji: "⏰" },
];

export default function QRSignPage() {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-6 text-center">
        <div className="text-3xl mb-1">🍩</div>
        <h1 className="text-lg font-semibold text-[#111827]">Duffers OS</h1>
        <p className="text-sm text-[#9CA3AF]">Scan a code to get started</p>
      </div>
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {entries.map(e => (
            <div key={e.path} className="bg-white rounded-lg border border-[#E5E7EB] p-5 flex flex-col items-center gap-3">
              <div className="text-xl font-medium text-[#111827]">{e.emoji} {e.label}</div>
              <div className="text-xs text-[#9CA3AF]">{e.desc}</div>
              <QRCodeSVG value={`${base}${e.path}`} size={140} level="M" bgColor="#FFFFFF" fgColor="#111827" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}