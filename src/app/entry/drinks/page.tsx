"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coffee } from "lucide-react";

const DRINK_TYPES = [
  "Drip Coffee", "Americano", "Latte", "Cappuccino",
  "Cold Brew", "Iced Coffee", "Tea", "Hot Chocolate",
  "Mocha", "Chai Latte", "Matcha Latte",
];

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
        body: JSON.stringify({
          drinkType,
          size,
          milkType,
          espressoShots,
          dialSetting,
          waste,
          notes,
        }),
      });
      if (res.ok) {
        toast.success("Drink logged! ☕");
        setDrinkType("");
        setSize("");
        setMilkType("");
        setEspressoShots(1);
        setDialSetting("");
        setWaste(0);
        setNotes("");
      } else {
        toast.error("Failed to log drink");
      }
    } catch {
      toast.error("Network error");
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Coffee className="h-5 w-5 text-amber-600" />
        <h1 className="text-xl font-bold">Log Drink</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="drinkType">Drink Type *</Label>
          <Select value={drinkType} onValueChange={(v) => v !== null && setDrinkType(v)}>
            <SelectTrigger id="drinkType" className="mt-1">
              <SelectValue placeholder="Select drink..." />
            </SelectTrigger>
            <SelectContent>
              {DRINK_TYPES.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="size">Size</Label>
            <Select value={size} onValueChange={(v) => v !== null && setSize(v)}>
              <SelectTrigger id="size" className="mt-1">
                <SelectValue placeholder="Size..." />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="milkType">Milk</Label>
            <Select value={milkType} onValueChange={(v) => v !== null && setMilkType(v)}>
              <SelectTrigger id="milkType" className="mt-1">
                <SelectValue placeholder="Milk..." />
              </SelectTrigger>
              <SelectContent>
                {MILK_TYPES.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="shots">Espresso Shots</Label>
            <Input
              id="shots"
              type="number"
              min={0}
              max={6}
              value={espressoShots}
              onChange={(e) => setEspressoShots(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dial">Dial Setting</Label>
            <Input
              id="dial"
              type="text"
              placeholder="e.g. 2.5"
              value={dialSetting}
              onChange={(e) => setDialSetting(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="waste">Waste / Spillage</Label>
          <Input
            id="waste"
            type="number"
            min={0}
            value={waste}
            onChange={(e) => setWaste(Number(e.target.value))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            type="text"
            placeholder="Optional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          disabled={submitting || !drinkType}
        >
          {submitting ? "Logging..." : "Log Drink ☕"}
        </Button>
      </form>
    </div>
  );
}