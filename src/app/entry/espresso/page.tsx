"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function EspressoDialPage() {
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  // Regular espresso fields
  const [groundsWeight, setGroundsWeight] = useState("");
  const [grinderCoarseness, setGrinderCoarseness] = useState("");
  const [dispenseTime, setDispenseTime] = useState("");
  const [pullTime, setPullTime] = useState("");
  const [shotWeight, setShotWeight] = useState("");

  // Decaf fields
  const [decafGroundsWeight, setDecafGroundsWeight] = useState("");
  const [decafGrinderCoarseness, setDecafGrinderCoarseness] = useState("");
  const [decafDispenseTime, setDecafDispenseTime] = useState("");
  const [decafPullTime, setDecafPullTime] = useState("");
  const [decafShotWeight, setDecafShotWeight] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        groundsWeight: groundsWeight ? parseFloat(groundsWeight) : null,
        grinderCoarseness: grinderCoarseness || null,
        dispenseTime: dispenseTime ? parseFloat(dispenseTime) : null,
        pullTime: pullTime ? parseFloat(pullTime) : null,
        shotWeight: shotWeight ? parseFloat(shotWeight) : null,
        decafGroundsWeight: decafGroundsWeight ? parseFloat(decafGroundsWeight) : null,
        decafGrinderCoarseness: decafGrinderCoarseness || null,
        decafDispenseTime: decafDispenseTime ? parseFloat(decafDispenseTime) : null,
        decafPullTime: decafPullTime ? parseFloat(decafPullTime) : null,
        decafShotWeight: decafShotWeight ? parseFloat(decafShotWeight) : null,
        notes: notes || null,
      };
      const r = await fetch("/api/espresso-dial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        toast.success("Espresso dial logged ✓");
        setGroundsWeight(""); setGrinderCoarseness(""); setDispenseTime(""); setPullTime(""); setShotWeight("");
        setDecafGroundsWeight(""); setDecafGrinderCoarseness(""); setDecafDispenseTime(""); setDecafPullTime(""); setDecafShotWeight("");
        setNotes("");
      } else {
        const d = await r.json();
        toast.error(d.error || "Failed");
      }
    } catch { toast.error("Error"); }
    setSaving(false);
  }

  const inputStyle = "w-full px-3 py-2.5 border border-[#D1D5DB] rounded-md text-sm bg-white";
  const labelStyle = "block text-xs font-medium text-[#374151] mb-1";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">☕ Espresso Dial Log</h2>
        <p className="text-xs text-[#6B7280] mt-1">Log settings for correctly pulled shots every morning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Meridian Blend */}
        <div className="card" style={{ padding: 16 }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: "#1A56DB" }}>Meridian Blend Espresso</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className={labelStyle}>Grounds Weight (g)</label>
              <input type="number" step="0.1" value={groundsWeight} onChange={e => setGroundsWeight(e.target.value)} className={inputStyle} placeholder="e.g. 18.0" />
            </div>
            <div>
              <label className={labelStyle}>Grinder Coarseness</label>
              <input value={grinderCoarseness} onChange={e => setGrinderCoarseness(e.target.value)} className={inputStyle} placeholder="e.g. 3.5" />
            </div>
            <div>
              <label className={labelStyle}>Dispense Time (sec)</label>
              <input type="number" step="0.1" value={dispenseTime} onChange={e => setDispenseTime(e.target.value)} className={inputStyle} placeholder="e.g. 5.0" />
            </div>
            <div>
              <label className={labelStyle}>Pull Time (sec)</label>
              <input type="number" step="0.1" value={pullTime} onChange={e => setPullTime(e.target.value)} className={inputStyle} placeholder="e.g. 25" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label className={labelStyle}>Final Shot Weight (g)</label>
              <input type="number" step="0.1" value={shotWeight} onChange={e => setShotWeight(e.target.value)} className={inputStyle} placeholder="e.g. 36.0" />
            </div>
          </div>
        </div>

        {/* Decaf */}
        <div className="card" style={{ padding: 16 }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: "#7C3AED" }}>Decaf Espresso</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className={labelStyle}>Grounds Weight (g)</label>
              <input type="number" step="0.1" value={decafGroundsWeight} onChange={e => setDecafGroundsWeight(e.target.value)} className={inputStyle} placeholder="e.g. 18.0" />
            </div>
            <div>
              <label className={labelStyle}>Grinder Coarseness</label>
              <input value={decafGrinderCoarseness} onChange={e => setDecafGrinderCoarseness(e.target.value)} className={inputStyle} placeholder="e.g. 4.0" />
            </div>
            <div>
              <label className={labelStyle}>Dispense Time (sec)</label>
              <input type="number" step="0.1" value={decafDispenseTime} onChange={e => setDecafDispenseTime(e.target.value)} className={inputStyle} placeholder="e.g. 5.0" />
            </div>
            <div>
              <label className={labelStyle}>Pull Time (sec)</label>
              <input type="number" step="0.1" value={decafPullTime} onChange={e => setDecafPullTime(e.target.value)} className={inputStyle} placeholder="e.g. 25" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label className={labelStyle}>Final Shot Weight (g)</label>
              <input type="number" step="0.1" value={decafShotWeight} onChange={e => setDecafShotWeight(e.target.value)} className={inputStyle} placeholder="e.g. 36.0" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelStyle}>Notes</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} className={inputStyle} placeholder="Any observations..." />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: "100%", padding: "12px 16px", fontSize: 14 }}>
          {saving ? "Saving..." : "Log Dial Settings"}
        </button>
      </form>
    </div>
  );
}