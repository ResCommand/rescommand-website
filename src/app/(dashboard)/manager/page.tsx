"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface KPI {
  donutsSold: number; overboard: number; dozens: number; halfDozens: number;
  drinksSold: number; drinkBreakdown: { name: string; count: number }[];
  dogelsSold: number; sandwichesSold: number; todaySales: number;
  salesByHour: { hour: string; sales: number }[]; avgTicket: number;
  employeeHours: { name: string; hours: number }[]; cogsPercent: number;
}

export default function ManagerDashboard() {
  const [data, setData] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports?range=today").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><h1 className="text-xl font-semibold text-[#111827]">Dashboard</h1><div className="grid grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-lg border border-[#E5E7EB] p-4 h-20 animate-pulse" />)}</div></div>;
  if (!data) return <div>Failed to load</div>;

  const kpis = [
    { label: "Donuts Sold", value: data.donutsSold },
    { label: "Overboard", value: data.overboard },
    { label: "Dozens", value: data.dozens },
    { label: "Half Dozens", value: data.halfDozens },
    { label: "Drinks Sold", value: data.drinksSold },
    { label: "Dogels Sold", value: data.dogelsSold },
    { label: "Sandwiches", value: data.sandwichesSold },
    { label: "Avg Ticket", value: `$${data.avgTicket.toFixed(2)}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-[#111827]">${data.todaySales.toFixed(2)}</div>
          <div className="text-xs text-[#9CA3AF] font-medium">Today&apos;s Sales</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-lg border border-[#E5E7EB] p-4">
            <div className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">{k.label}</div>
            <div className="text-xl font-semibold text-[#111827] mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Sales by Hour</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.salesByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", fontSize: "13px" }} />
              <Bar dataKey="sales" fill="#1A56DB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Drink Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.drinkBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#9CA3AF" }} width={90} />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", fontSize: "13px" }} />
              <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
        <h3 className="text-sm font-semibold text-[#111827] mb-3">Employee Hours Today</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.employeeHours.map(e => (
            <div key={e.name} className="bg-[#F9FAFB] rounded-lg p-3">
              <div className="text-sm font-medium text-[#111827]">{e.name}</div>
              <div className="text-lg font-semibold text-[#1A56DB]">{e.hours.toFixed(1)}h</div>
            </div>
          ))}
          {data.employeeHours.length === 0 && <div className="col-span-4 text-center text-[#9CA3AF] py-4 text-sm">No hours logged today</div>}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
        <h3 className="text-sm font-semibold text-[#111827]">COGS</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <div className="text-3xl font-semibold text-[#1A56DB]">{data.cogsPercent.toFixed(1)}%</div>
          <div className="text-sm text-[#9CA3AF]">cost of goods sold / revenue</div>
        </div>
      </div>
    </div>
  );
}