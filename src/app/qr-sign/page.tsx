"use client";
import { QRCodeSVG } from "qrcode.react";
const codes = [
  { href: "/entry/drinks", label: "Drinks", desc: "Log drinks & dialing", icon: "☕" },
  { href: "/entry/donuts", label: "Donuts", desc: "Production & waste", icon: "🍩" },
  { href: "/entry/sales", label: "Sales", desc: "Ring up orders", icon: "💰" },
  { href: "/entry/dogels", label: "Dogels", desc: "Dog donuts", icon: "🐶" },
  { href: "/entry/sandwiches", label: "Sandwiches", desc: "Breakfast items", icon: "🥪" },
  { href: "/hours", label: "Clock In/Out", desc: "Hours & time tracking", icon: "⏰" },
];
export default function QRSignPage() {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div className="qr-sign-page">
      <div className="qr-sign-header">
        <h1>🍩 Duffers OS</h1>
        <p>Scan a code to get started</p>
      </div>
      <div className="qr-sign-grid">
        {codes.map(c => (
          <div key={c.href} className="qr-sign-card">
            <QRCodeSVG value={`${base}${c.href}`} size={140} />
            <h3>{c.icon} {c.label}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
      <div className="qr-sign-footer">Duffers OS · Employee Portal</div>
    </div>
  );
}