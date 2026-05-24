"use client";

import { useState } from "react";
import { toast } from "sonner";

const DRINKS = ["Drip Coffee","Americano","Latte","Cappuccino","Cold Brew","Iced Coffee","Tea","Hot Chocolate","Mocha","Chai Latte","Matcha Latte"];
const SIZES = ["Small","Medium","Large"];
const MILKS = ["Whole","Oat","Almond","Soy","None"];

const inputClass = "w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm bg-white placeholder:text-[#9CA3AF]";
const labelClass = "block text-sm font-medium text-[#374151] mb-1";

export default function DrinkEntryPage() {
  const [drinkType, setDrinkType] = useState("");
  const [size, setSize] = useState("");
  const [milk, setMilk] = useState("");
  const [shots, setShots] = useState(1);
  const [dial, setDial] = useState("");
  const [waste, setWaste] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/drinks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ drinkType, size, milkType: milk, espressoShots: shots, dialSetting: dial, waste, notes }) });
      if (res.ok) { toast.success("Logged ☕"); setDrinkType(""); setSize(""); setMilk(""); setShots(1); setDial(""); setWaste(0); setNotes(""); }
      else toast.error("Failed");
    } catch { toast.error("Error"); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-[#111827]">☕ Log Drink</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className={labelClass}>Drink Type *</label>
          <select value={drinkType} onChange={e => setDrinkType(e.target.value)} required className={inputClass}>
            <option value="">Select...</option>{DRINKS.map(d => <option key={d}>{d}</option>)}
          </select></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Size</label><select value={size} onChange={e => setSize(e.target.value)} className={inputClass}><option value="">Size...</option>{SIZES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label className={labelClass}>Milk</label><select value={milk} onChange={e => setMilk(e.target.value)} className={inputClass}><option value="">Milk...</option>{MILKS.map(m => <option key={m}>{m}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Espresso Shots</label><input type="number" min={0} max={6} value={shots} onChange={e => setShots(Number(e.target.value))} className={inputClass} /></div>
          <div><label className={labelClass}>Dial Setting</label><input type="text" placeholder="e.g. 2.5" value={dial} onChange={e => setDial(e.target.value)} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Waste</label><input type="number" min={0} value={waste} onChange={e => setWaste(Number(e.target.value))} className={inputClass} /></div>
        <div><label className={labelClass}>Notes</label><input type="text" placeholder="Optional..." value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} /></div>
        <button type="submit" disabled={submitting || !drinkType}
          className="w-full bg-[#1A56DB] hover:bg-[#1544B0] disabled:bg-[#1A56DB]/40 text-white font-medium py-2.5 rounded-md text-sm transition-colors">
          {submitting ? "Logging..." : "Log Drink"}</button>
      </form>
    </div>
  );
}