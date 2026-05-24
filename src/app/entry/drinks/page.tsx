"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Coffee } from "lucide-react";

const DRINK_TYPES = ["Drip Coffee","Americano","Latte","Cappuccino","Cold Brew","Iced Coffee","Tea","Hot Chocolate","Mocha","Chai Latte","Matcha Latte"];
const SIZES = ["Small", "Medium", "Large"];
const MILK_TYPES = ["Whole", "Oat", "Almond", "Soy", "None"];

export default function DrinkEntryPage() {
  const [drinkType, setDrinkType] = useState("");
  const [size, setSize] = useState("");
  const [milkType, setMilkType] = useState("");
  const [espressoShots, setEspressoShots] = useState(1);
  const [dialSetting, setDialSetting] = useState("");
  const [waste, setWaste] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drinkType, size, milkType, espressoShots, dialSetting, waste, notes }),
      });
      if (res.ok) {
        toast.success("Drink logged! ☕");
        setDrinkType(""); setSize(""); setMilkType(""); setEspressoShots(1); setDialSetting(""); setWaste(0); setNotes("");
      } else { toast.error("Failed to log drink"); }
    } catch { toast.error("Network error"); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#FFF0F5] rounded-xl">
          <Coffee className="h-5 w-5 text-[#FF385C]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Log Drink</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Drink Type *</label>
          <select value={drinkType} onChange={(e) => setDrinkType(e.target.value)} required
            className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] bg-white focus:border-[#222222] focus:ring-0 transition-colors appearance-none">
            <option value="">Select drink...</option>
            {DRINK_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-2">Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] bg-white focus:border-[#222222] focus:ring-0 transition-colors appearance-none">
              <option value="">Size...</option>
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-2">Milk</label>
            <select value={milkType} onChange={(e) => setMilkType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] bg-white focus:border-[#222222] focus:ring-0 transition-colors appearance-none">
              <option value="">Milk...</option>
              {MILK_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-2">Espresso Shots</label>
            <input type="number" min={0} max={6} value={espressoShots} onChange={(e) => setEspressoShots(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-2">Dial Setting</label>
            <input type="text" placeholder="e.g. 2.5" value={dialSetting} onChange={(e) => setDialSetting(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Waste / Spillage</label>
          <input type="number" min={0} value={waste} onChange={(e) => setWaste(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#222222] mb-2">Notes</label>
          <input type="text" placeholder="Optional notes..." value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#DDDDDD] rounded-xl text-[15px] focus:border-[#222222] focus:ring-0 transition-colors placeholder:text-[#717171]" />
        </div>

        <button type="submit" disabled={submitting || !drinkType}
          className="w-full bg-[#FF385C] hover:bg-[#E0304F] disabled:bg-[#FF385C]/40 text-white font-bold py-3.5 rounded-xl text-[16px] transition-colors">
          {submitting ? "Logging..." : "Log Drink ☕"}
        </button>
      </form>
    </div>
  );
}