"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

interface HourEntry {
  id: number;
  clockIn: string;
  clockOut: string | null;
  totalHours: number | null;
  date: string;
  user?: { name: string; role: string };
}

export default function HoursPage() {
  const { data: session } = useSession();
  const [hours, setHours] = useState<HourEntry[]>([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadHours = () => {
    fetch("/api/hours")
      .then((r) => r.json())
      .then((data) => {
        setHours(Array.isArray(data) ? data : []);
        setClockedIn(Array.isArray(data) && data.some((h: HourEntry) => !h.clockOut));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadHours(); }, []);

  async function clockIn() {
    try {
      const res = await fetch("/api/hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clock_in" }),
      });
      if (res.ok) {
        toast.success("Clocked in! ⏰");
        loadHours();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to clock in");
      }
    } catch {
      toast.error("Network error");
    }
  }

  async function clockOut() {
    try {
      const res = await fetch("/api/hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clock_out" }),
      });
      if (res.ok) {
        toast.success("Clocked out! 👋");
        loadHours();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to clock out");
      }
    } catch {
      toast.error("Network error");
    }
  }

  const role = (session?.user as { role?: string })?.role;
  const isManager = role === "MANAGER" || role === "OWNER";

  const todayHours = hours
    .filter((h) => {
      const d = new Date(h.date).toDateString();
      return d === new Date().toDateString();
    })
    .reduce((sum, h) => sum + (h.totalHours || 0), 0);

  const weekHours = hours.reduce((sum, h) => sum + (h.totalHours || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          {isManager ? "All Hours" : "My Hours"}
        </h1>
      </div>

      {/* Clock In/Out */}
      {!isManager && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                {clockedIn ? "🟢 Currently Clocked In" : "🔴 Clocked Out"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Today: {todayHours.toFixed(1)}h • Week: {weekHours.toFixed(1)}h
              </div>
            </div>
            {clockedIn ? (
              <Button onClick={clockOut} variant="destructive" size="sm">
                <LogOut className="h-4 w-4 mr-1" />
                Clock Out
              </Button>
            ) : (
              <Button onClick={clockIn} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                <LogIn className="h-4 w-4 mr-1" />
                Clock In
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hours List */}
      <div className="space-y-2">
        {hours.map((h) => (
          <Card key={h.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  {isManager && h.user && (
                    <div className="text-sm font-medium">{h.user.name}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(h.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" → "}
                    {h.clockOut
                      ? new Date(h.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Now"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">
                    {h.totalHours ? `${h.totalHours.toFixed(1)}h` : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {hours.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No hours logged</div>
        )}
      </div>
    </div>
  );
}