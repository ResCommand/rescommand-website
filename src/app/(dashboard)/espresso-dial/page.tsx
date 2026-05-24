"use client";
import { useEffect, useState } from "react";

interface DialLog {
  id: number; date: string; createdAt: string;
  groundsWeight: number | null; grinderCoarseness: string | null;
  dispenseTime: number | null; pullTime: number | null; shotWeight: number | null;
  decafGroundsWeight: number | null; decafGrinderCoarseness: string | null;
  decafDispenseTime: number | null; decafPullTime: number | null; decafShotWeight: number | null;
  notes: string | null;
  user: { name: string };
}

export default function EspressoDialPage() {
  const [logs, setLogs] = useState<DialLog[]>([]);

  useEffect(() => {
    fetch("/api/espresso-dial").then(r => r.json()).then(d => setLogs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Espresso Dial Log</h1>
        <p className="text-sm text-gray">Daily dial-in history — reference for preferred settings</p>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state" style={{ padding: 60 }}>No dial logs yet. Use the QR code or visit /entry/espresso to log your first dial-in.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>By</th>
                <th>Gounds (g)</th>
                <th>Coarseness</th>
                <th>Dispense (s)</th>
                <th>Pull (s)</th>
                <th>Shot (g)</th>
                <th>Decaf Gnds</th>
                <th>Decaf Pull</th>
                <th>Decaf Shot</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td className="font-medium text-sm">
                    {new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td>{l.user?.name || "—"}</td>
                  <td>{l.groundsWeight ?? "—"}</td>
                  <td>{l.grinderCoarseness ?? "—"}</td>
                  <td>{l.dispenseTime ?? "—"}</td>
                  <td>{l.pullTime ?? "—"}</td>
                  <td>{l.shotWeight ?? "—"}</td>
                  <td>{l.decafGroundsWeight ?? "—"}</td>
                  <td>{l.decafPullTime ?? "—"}</td>
                  <td>{l.decafShotWeight ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}