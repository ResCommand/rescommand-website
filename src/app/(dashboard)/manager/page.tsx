"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ManagerPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [hourly, setHourly] = useState<{hour: string; sales: number}[]>([]);

  useEffect(() => {
    fetch("/api/reports?type=kpis").then(r => r.json()).then(d => setKpis(d)).catch(() => {});
    fetch("/api/reports?type=hourly").then(r => r.json()).then(d => setHourly(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const stats = [
    { label: "Donuts Sold", value: kpis?.donutsSold ?? "—", icon: "🍩", color: "stat-icon-orange" },
    { label: "Overboard", value: kpis?.overboard ?? "—", icon: "📋", color: "stat-icon-red" },
    { label: "Dozens", value: kpis?.dozens ?? "—", icon: "📦", color: "stat-icon-blue" },
    { label: "Half Dozens", value: kpis?.halfDozens ?? "—", icon: "📦", color: "stat-icon-purple" },
    { label: "Drinks", value: kpis?.drinks ?? "—", icon: "☕", color: "stat-icon-green" },
    { label: "Dogels", value: kpis?.dogels ?? "—", icon: "🐶", color: "stat-icon-yellow" },
    { label: "Sandwiches", value: kpis?.sandwiches ?? "—", icon: "🥪", color: "stat-icon-blue" },
    { label: "Today's Sales", value: kpis ? `$${kpis.sales}` : "—", icon: "💰", color: "stat-icon-green" },
    { label: "Avg Ticket", value: kpis?.avgTicket ? `$${kpis.avgTicket}` : "—", icon: "🧾", color: "stat-icon-purple" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="text-sm text-gray">Today&apos;s operations overview</p>
      </div>

      <div className="grid-3">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-container">
        <h3>Sales by Hour</h3>
        {hourly.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
              <Tooltip />
              <Bar dataKey="sales" fill="#1A56DB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">No sales data yet</div>
        )}
      </div>
    </div>
  );
}