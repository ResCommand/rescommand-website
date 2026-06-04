"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
const codes = [
  { href: "/entry/espresso", label: "Espresso Dial", desc: "Daily dial-in log", icon: "☕" },
  { href: "/entry/donuts", label: "Donut Production", desc: "Made, sold, waste", icon: "🍩" },
  { href: "/entry/waste", label: "Waste Log", desc: "Record waste & reason", icon: "🗑️" },
  { href: "/entry/sales", label: "Sales", desc: "Ring up orders", icon: "💰" },
  { href: "/entry/dogels", label: "Dogels", desc: "Dog donuts", icon: "🐶" },
  { href: "/entry/sandwiches", label: "Sandwiches", desc: "Breakfast items", icon: "🥪" },
];
export default function QRSignPage() {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const [brandName, setBrandName] = useState("ResCommand");

  useEffect(() => {
    fetch("/api/tenants/branding/public")
      .then(r => r.json())
      .then(data => { if (data?.brandName) setBrandName(data.brandName); })
      .catch(() => {});
  }, []);

  return (
    <div className="qr-sign-page">
      <div className="qr-sign-header">
        <h1>🍩 {brandName}</h1>
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
      <div className="qr-sign-footer">{brandName} · Powered by ResCommand</div>
    </div>
  );
}