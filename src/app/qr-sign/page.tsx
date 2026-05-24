"use client";

import { QRCodeSVG } from "qrcode.react";

const qrEntries = [
  { label: "☕ Log Drinks", path: "/entry/drinks", accent: "border-[#FF385C]" },
  { label: "🍩 Log Donuts", path: "/entry/donuts", accent: "border-[#E0304F]" },
  { label: "💰 Log Sales", path: "/entry/sales", accent: "border-[#00A699]" },
  { label: "🥯 Log Dogels", path: "/entry/dogels", accent: "border-[#222222]" },
  { label: "🥪 Log Sandwiches", path: "/entry/sandwiches", accent: "border-[#717171]" },
  { label: "⏰ Clock In/Out", path: "/hours", accent: "border-[#FF385C]" },
];

export default function QRSignPage() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#222222] text-white px-6 py-8 text-center">
        <div className="text-4xl mb-2">🍩</div>
        <h1 className="text-3xl font-bold tracking-tight">Duffers OS</h1>
        <p className="text-white/60 text-sm mt-2 font-medium">Scan a code to get started</p>
      </div>

      {/* QR Grid */}
      <div className="max-w-[900px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {qrEntries.map((entry) => (
            <div
              key={entry.path}
              className={`border-2 ${entry.accent} rounded-2xl p-6 flex flex-col items-center gap-4 bg-white hover:shadow-lg transition-shadow`}
            >
              <div className="text-base font-bold text-[#222222] text-center">{entry.label}</div>
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <QRCodeSVG
                  value={`${baseUrl}${entry.path}`}
                  size={160}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#222222"
                  includeMargin={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-8 text-xs text-[#717171] font-medium">
        Duffers OS • {new Date().getFullYear()}
      </div>
    </div>
  );
}