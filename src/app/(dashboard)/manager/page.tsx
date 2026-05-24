"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Cookie, Coffee, ShoppingBag, Clock, DollarSign, TrendingUp,
  Package, AlertTriangle,
} from "lucide-react";

interface KPIData {
  donutsSold: number;
  overboard: number;
  dozens: number;
  halfDozens: number;
  drinksSold: number;
  drinkBreakdown: { name: string; count: number }[];
  dogelsSold: number;
  sandwichesSold: number;
  todaySales: number;
  salesByHour: { hour: string; sales: number }[];
  avgTicket: number;
  employeeHours: { name: string; hours: number }[];
  cogsPercent: number;
}

export default function ManagerDashboard() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports?range=today")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-[#DDDDDD] rounded-2xl p-5 animate-pulse">
              <div className="h-3 bg-[#F7F7F7] rounded w-2/3 mb-3" />
              <div className="h-7 bg-[#F7F7F7] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard</div>;

  const kpiCards = [
    { label: "Donuts Sold", value: data.donutsSold, icon: Cookie, accent: "bg-[#FFF0F5]" },
    { label: "Overboard", value: data.overboard, icon: AlertTriangle, accent: "bg-[#FFF5F5]" },
    { label: "Dozens", value: data.dozens, icon: Package, accent: "bg-[#FFF8F0]" },
    { label: "Half Dozens", value: data.halfDozens, icon: Package, accent: "bg-[#FFFFF0]" },
    { label: "Drinks Sold", value: data.drinksSold, icon: Coffee, accent: "bg-[#F0FFF4]" },
    { label: "Dogels Sold", value: data.dogelsSold, icon: ShoppingBag, accent: "bg-[#FFFFF0]" },
    { label: "Sandwiches", value: data.sandwichesSold, icon: TrendingUp, accent: "bg-[#FFF0F0]" },
    { label: "Avg Ticket", value: `$${data.avgTicket.toFixed(2)}`, icon: DollarSign, accent: "bg-[#F0F8FF]" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[#717171] text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#FF385C]">
            ${data.todaySales.toFixed(2)}
          </div>
          <div className="text-xs font-semibold text-[#717171] uppercase tracking-wider">Today&apos;s Sales</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#DDDDDD] rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${kpi.accent}`}>
                <kpi.icon className="h-3.5 w-3.5 text-[#222222]" />
              </div>
              <span className="text-[11px] font-semibold text-[#717171] uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-[#222222]">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#DDDDDD] rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4">Sales by Hour</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.salesByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F7F7" />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#717171" }} />
              <YAxis tick={{ fontSize: 12, fill: "#717171" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DDDDDD",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="sales" fill="#FF385C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#DDDDDD] rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4">Drink Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.drinkBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F7F7" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#717171" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#717171" }} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DDDDDD",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="count" fill="#222222" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Hours */}
      <div className="bg-white border border-[#DDDDDD] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-[#717171]" />
          <h3 className="text-base font-bold">Employee Hours Today</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.employeeHours.map((emp) => (
            <div key={emp.name} className="bg-[#F7F7F7] rounded-xl p-4">
              <div className="text-sm font-semibold text-[#222222]">{emp.name}</div>
              <div className="text-xl font-bold text-[#FF385C] mt-1">{emp.hours.toFixed(1)}h</div>
            </div>
          ))}
          {data.employeeHours.length === 0 && (
            <div className="col-span-4 text-center text-[#717171] py-6 text-sm">No hours logged today</div>
          )}
        </div>
      </div>

      {/* COGS */}
      <div className="bg-white border border-[#DDDDDD] rounded-2xl p-6">
        <h3 className="text-base font-bold mb-2">COGS Summary</h3>
        <div className="flex items-baseline gap-3">
          <div className="text-4xl font-bold text-[#FF385C]">{data.cogsPercent.toFixed(1)}%</div>
          <div className="text-sm text-[#717171] font-medium">Cost of Goods Sold as % of Revenue</div>
        </div>
      </div>
    </div>
  );
}