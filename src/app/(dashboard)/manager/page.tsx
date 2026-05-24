"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import {
  Cookie, Coffee, ShoppingBag, Clock, DollarSign, TrendingUp,
  Package, Users, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const { data: session } = useSession();
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports?range=today")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard data</div>;

  const kpiCards = [
    { label: "Donuts Sold", value: data.donutsSold, icon: Cookie, color: "text-amber-600" },
    { label: "Overboard", value: data.overboard, icon: AlertTriangle, color: "text-red-500" },
    { label: "Dozens", value: data.dozens, icon: Package, color: "text-orange-600" },
    { label: "Half Dozens", value: data.halfDozens, icon: Package, color: "text-yellow-600" },
    { label: "Drinks Sold", value: data.drinksSold, icon: Coffee, color: "text-blue-600" },
    { label: "Dogels Sold", value: data.dogelsSold, icon: ShoppingBag, color: "text-lime-600" },
    { label: "Sandwiches Sold", value: data.sandwichesSold, icon: TrendingUp, color: "text-red-600" },
    { label: "Avg Ticket", value: `$${data.avgTicket.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            ${data.todaySales.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">Today&apos;s Sales</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <kpi.icon className={`h-3 w-3 ${kpi.color}`} />
                {kpi.label}
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales by Hour */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.salesByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFBF5",
                    border: "1px solid #F5E6D3",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="sales" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Drink Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drink Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.drinkBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFBF5",
                    border: "1px solid #F5E6D3",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#B45309" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Employee Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Employee Hours Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.employeeHours.map((emp) => (
              <div key={emp.name} className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm font-medium">{emp.name}</div>
                <div className="text-lg font-bold">{emp.hours.toFixed(1)}h</div>
              </div>
            ))}
            {data.employeeHours.length === 0 && (
              <div className="col-span-4 text-center text-muted-foreground py-4">
                No hours logged today
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* COGS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">COGS Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">{data.cogsPercent.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Cost of Goods Sold as % of Revenue</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}