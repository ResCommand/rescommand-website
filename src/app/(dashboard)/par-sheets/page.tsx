"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckSquare, Download } from "lucide-react";

interface ParLine {
  product: { name: string };
  predicted: number;
  actual: number;
}

export default function ParSheetsPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const canEdit = role === "MANAGER" || role === "OWNER" || role === "PLATFORM_ADMIN";

  const [lines, setLines] = useState<ParLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actuals, setActuals] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/prediction")
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((d) => {
        if (Array.isArray(d)) setLines(d);
        else if (d?.lines) setLines(d.lines);
        else setLines([]);
      })
      .catch((e) => setError(e.message || "Failed to load par sheet data"))
      .finally(() => setLoading(false));
  }, []);

  const totalPredicted = lines.reduce((s, l) => s + l.predicted, 0);
  const totalActual = lines.reduce((s, l) => s + (actuals[l.product?.name] || l.actual || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1>Par Sheets</h1>
          <p className="text-sm text-gray">Loading par sheet data…</p>
        </div>
        <div className="card"><div className="empty-state">Loading…</div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1>Par Sheets</h1>
          <p className="text-sm text-gray">Daily production par levels</p>
        </div>
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No par sheet data yet</h3>
          <p className="text-sm text-gray" style={{ maxWidth: 400, margin: "0 auto" }}>
            {error}. Par sheets are generated from historical sales data. Once you have sales logs,
            predicted par levels will appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1>Par Sheets</h1>
          <p className="text-sm text-gray">Daily production par levels</p>
        </div>
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No par sheet for today</h3>
          <p className="text-sm text-gray" style={{ maxWidth: 400, margin: "0 auto" }}>
            Par sheets are generated automatically from your sales history. Start logging daily
            donut sales and production data to build up the prediction model.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Par Sheets</h1>
            <p className="text-sm text-gray">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} ·{" "}
              {lines.length} items · {totalPredicted} predicted total
            </p>
          </div>
          {canEdit && (
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Download size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
              Print
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="card" style={{ padding: 20 }}>
        <div className="grid-3">
          <div className="stat-card" style={{ border: "none", padding: 0 }}>
            <div className="stat-icon stat-icon-purple">📊</div>
            <div className="stat-value">{totalPredicted}</div>
            <div className="stat-label">Total Predicted</div>
          </div>
          <div className="stat-card" style={{ border: "none", padding: 0 }}>
            <div className="stat-icon stat-icon-green">✅</div>
            <div className="stat-value">{totalActual}</div>
            <div className="stat-label">Total Actual</div>
          </div>
          <div className="stat-card" style={{ border: "none", padding: 0 }}>
            <div className="stat-icon stat-icon-orange">📈</div>
            <div className="stat-value" style={{ color: totalActual - totalPredicted >= 0 ? "#059669" : "#DC2626" }}>
              {totalActual - totalPredicted >= 0 ? "+" : ""}{totalActual - totalPredicted}
            </div>
            <div className="stat-label">Variance</div>
          </div>
        </div>
      </div>

      {/* Par sheet table */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          <CheckSquare size={16} style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} />
          Par Levels by Product
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: "right" }}>Predicted (Par)</th>
                <th style={{ textAlign: "right" }}>Actual</th>
                <th style={{ textAlign: "right" }}>Variance</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => {
                const productName = l.product?.name || "—";
                const actualVal = actuals[productName] ?? l.actual ?? 0;
                const variance = actualVal - l.predicted;
                return (
                  <tr key={i}>
                    <td className="font-medium">{productName}</td>
                    <td style={{ textAlign: "right" }} className="font-semibold">{l.predicted}</td>
                    <td style={{ textAlign: "right" }}>
                      {canEdit ? (
                        <input
                          type="number"
                          className="form-input"
                          value={actualVal}
                          min={0}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            setActuals((prev) => ({ ...prev, [productName]: v }));
                          }}
                          style={{ width: 70, textAlign: "right", padding: "4px 8px", fontSize: 14 }}
                        />
                      ) : (
                        actualVal || "—"
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={variance < 0 ? "text-red" : "text-green"} style={{ fontWeight: 600 }}>
                        {variance > 0 ? "+" : ""}{variance}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: "2px solid #E5E7EB" }}>
                <td className="font-bold">Total</td>
                <td className="font-bold" style={{ textAlign: "right", color: "#7C3AED" }}>{totalPredicted}</td>
                <td className="font-bold" style={{ textAlign: "right", color: "#7C3AED" }}>{totalActual}</td>
                <td className="font-bold" style={{ textAlign: "right", color: totalActual - totalPredicted >= 0 ? "#059669" : "#DC2626" }}>
                  {totalActual - totalPredicted >= 0 ? "+" : ""}{totalActual - totalPredicted}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
