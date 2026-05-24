"use client";

import { QRCodeSVG } from "qrcode.react";

const qrEntries = [
  { label: "☕ Log Drinks", path: "/entry/drinks", color: "bg-amber-50 border-amber-200" },
  { label: "🍩 Log Donuts", path: "/entry/donuts", color: "bg-orange-50 border-orange-200" },
  { label: "💰 Log Sales", path: "/entry/sales", color: "bg-yellow-50 border-yellow-200" },
  { label: "🐕 Log Dogels", path: "/entry/dogels", color: "bg-lime-50 border-lime-200" },
  { label: "🥪 Log Sandwiches", path: "/entry/sandwiches", color: "bg-red-50 border-red-200" },
  { label: "📋 All Entry", path: "/employee", color: "bg-blue-50 border-blue-200" },
];

export default function QRSignPage() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🍩</div>
        <h1 className="text-3xl font-bold text-amber-900">Duffers OS</h1>
        <p className="text-amber-700 text-lg mt-1">Scan to Log</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {qrEntries.map((entry) => (
          <div
            key={entry.path}
            className={`border-2 rounded-2xl p-6 flex flex-col items-center gap-4 ${entry.color}`}
          >
            <div className="text-lg font-bold text-gray-800 text-center">
              {entry.label}
            </div>
            <QRCodeSVG
              value={`${baseUrl}${entry.path}`}
              size={180}
              level="M"
              bgColor="#FFFFFF"
              fgColor="#3D2B1F"
              includeMargin
            />
          </div>
        ))}
      </div>
      <div className="text-center mt-8 text-sm text-gray-400">
        Duffers OS • {new Date().getFullYear()}
      </div>
    </div>
  );
}