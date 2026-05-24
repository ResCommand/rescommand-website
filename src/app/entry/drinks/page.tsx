"use client";
import { useState } from "react";
import { toast } from "sonner";
export default function DrinksEntry() {
  const [drinkType, setDrinkType] = useState("");
  const [size, setSize] = useState("");
  const [espressoShots, setEspressoShots] = useState("2");
  const [dialSetting, setDialSetting] = useState("");
  const [waste, setWaste] = useState("0");
  const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try { const r = await fetch("/api/drinks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ drinkType, size, espressoShots: parseInt(espressoShots), dialSetting, waste: parseFloat(waste) || 0 }) });
      if (r.ok) { toast.success("Drink logged ✓"); setDrinkType(""); setSize(""); setDialSetting(""); setWaste("0"); } else { const d = await r.json(); toast.error(d.error || "Failed"); } } catch { toast.error("Error"); } setSaving(false);
  }
  const drinkTypes = ["Espresso", "Latte", "Cappuccino", "Americano", "Mocha", "Drip Coffee", "Cold Brew", "Tea", "Hot Chocolate", "Other"];
  const sizes = ["Small", "Medium", "Large"];
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Log a Drink</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="form-label">Drink Type *</label><select value={drinkType} onChange={e => setDrinkType(e.target.value)} required className="form-input"><option value="">Select...</option>{drinkTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="form-label">Size</label><div className="toggle-group">{sizes.map(s => <button key={s} type="button" onClick={() => setSize(s)} className={`toggle-btn ${size === s ? "active" : ""}`}>{s}</button>)}</div></div>
        <div><label className="form-label">Espresso Shots</label><div className="toggle-group">{["0","1","2","3","4"].map(n => <button key={n} type="button" onClick={() => setEspressoShots(n)} className={`toggle-btn ${espressoShots === n ? "active" : ""}`}>{n}</button>)}</div></div>
        <div><label className="form-label">Dial Setting</label><input value={dialSetting} onChange={e => setDialSetting(e.target.value)} className="form-input" placeholder="e.g. 2.0" /></div>
        <div><label className="form-label">Waste (oz)</label><input type="number" step="0.1" value={waste} onChange={e => setWaste(e.target.value)} className="form-input" /></div>
        <button type="submit" disabled={saving} className="btn btn-primary btn-full">{saving ? "Saving..." : "Log Drink"}</button>
      </form>
    </div>
  );
}