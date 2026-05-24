"use client";
import { useEffect, useState } from "react";
export default function ProductionPage() {
  const [lines, setLines] = useState<any[]>([]);
  useEffect(() => { fetch("/api/prediction").then(r => r.json()).then(d => setLines(Array.isArray(d) ? d : [])).catch(() => {}); }, []);
  return (
    <div className="space-y-6">
      <div className="page-header"><h1>Par Sheets</h1><p className="text-sm text-gray">Predicted vs actual production</p></div>
      <div className="card">
        <table>
          <thead><tr><th>Product</th><th>Predicted</th><th>Actual</th><th>Variance</th></tr></thead>
          <tbody>
            {lines.map((l, i) => {
              const v = l.actual - l.predicted;
              return <tr key={i}><td className="font-medium">{l.product?.name || "—"}</td><td>{l.predicted}</td><td>{l.actual || 0}</td>
                <td><span className={v < 0 ? "text-red" : "text-green"}>{v > 0 ? "+" : ""}{v}</span></td></tr>;
            })}
            {lines.length === 0 && <tr><td colSpan={4} className="empty-state">No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}