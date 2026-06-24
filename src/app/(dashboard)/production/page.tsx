"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChefHat, LayoutGrid, Beaker, ListChecks, Calendar, ChevronLeft, ChevronRight, Sandwich, Settings, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface BatchInfo {
  large: number;
  small: number;
  totalDonuts: number;
  overProduction: number;
}

interface TrayAllocation {
  name: string;
  trays: number;
  donuts: number;
}

interface PrepItem {
  category: string;
  categoryColor: string;
  name: string;
  amount: string;
  shelfLifeHours?: number;
}

interface SandwichMakeItem {
  name: string;
  quantity: number;
}

interface SandwichDailyBreakdown {
  date: string;
  dayLabel: string;
  isHoliday: boolean;
  isWeekend: boolean;
  items: { name: string; par: number }[];
}

interface SandwichDayInfo {
  isMakeDay: boolean;
  makeDayLabel: string | null;
  covers: string[];
  itemsToMake: SandwichMakeItem[];
  totalToMake: number;
  dailyBreakdown: SandwichDailyBreakdown[];
}

interface ProductionData {
  date: string;
  dayOfWeek: number;
  dayLabel: string;
  isHoliday: boolean;
  holidayName: string | null;
  target: number;
  period: string;
  batches: BatchInfo;
  traySize: number;
  totalTrays: number;
  trayAllocations: TrayAllocation[];
  prepList: PrepItem[];
  sandwichToday: SandwichDayInfo;
}

// Existing prediction data
interface ParLine {
  product: { name: string };
  predicted: number;
  actual: number;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDatePretty(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function ProductionPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isManager = role === "MANAGER" || role === "OWNER";

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<ProductionData | null>(null);
  const [parLines, setParLines] = useState<ParLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"batches" | "trays" | "sandwiches" | "prep" | "predictions">("batches");
  const [checkedBatches, setCheckedBatches] = useState<Set<number>>(new Set());
  const [customTarget, setCustomTarget] = useState<number | null>(null);
  const [targetSaved, setTargetSaved] = useState(false);
  const [batchesLoaded, setBatchesLoaded] = useState(false);
  const [trayOverrides, setTrayOverrides] = useState<Record<string, number>>({});
  const [traySaved, setTraySaved] = useState(false);

  const fetchProductionData = useCallback(async (date: Date) => {
    setLoading(true);
    const dateStr = formatDateISO(date);
    try {
      const [targets, predictions] = await Promise.all([
        fetch(`/api/production-targets?date=${dateStr}`).then(r => r.json()).catch(() => null),
        fetch("/api/prediction").then(r => r.json()).catch(() => []),
      ]);
      if (targets && !targets.error) setData(targets);
      else setData(null);
      if (Array.isArray(predictions)) setParLines(predictions);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductionData(selectedDate);
  }, [selectedDate, fetchProductionData]);

  // Load persisted batch completions for the selected date
  useEffect(() => {
    const dateStr = formatDateISO(selectedDate);
    fetch(`/api/batch-completions?date=${dateStr}`)
      .then(r => r.json())
      .then(data => {
        if (data?.completions) {
          const indices = data.completions.map((c: { batchIndex: number }) => c.batchIndex);
          setCheckedBatches(new Set(indices));
        } else {
          setCheckedBatches(new Set());
        }
        setBatchesLoaded(true);
      })
      .catch(() => {
        setCheckedBatches(new Set());
        setBatchesLoaded(true);
      });
  }, [selectedDate]);

  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = formatDateISO(selectedDate) === formatDateISO(new Date());

  // Reset custom target when date changes
  useEffect(() => {
    setCustomTarget(null);
    setTargetSaved(false);
    setTrayOverrides({});
    setTraySaved(false);
  }, [selectedDate]);

  // Toggle batch completion with persistence
  const toggleBatch = (index: number, mixerType: string) => {
    const dateStr = formatDateISO(selectedDate);
    const willBeChecked = !checkedBatches.has(index);
    // Optimistic local update
    setCheckedBatches(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    // Persist to database
    fetch("/api/batch-completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr, batchIndex: index, mixerType, completed: willBeChecked }),
    }).catch(() => {
      // Revert on error
      setCheckedBatches(prev => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    });
  };

  // Batch calculation (mirrors server-side logic)
  const SMALL_BATCH = 46;
  const LARGE_BATCH = 69;
  const TRAY_SIZE = 28;

  function calculateBatchesLocal(target: number) {
    let bestLarge = 0, bestSmall = 0, bestTotal = Infinity, bestGap = Infinity;
    const maxLarge = Math.ceil(target / LARGE_BATCH);
    for (let l = maxLarge; l >= 0; l--) {
      const remainder = target - l * LARGE_BATCH;
      const s = remainder <= 0 ? 0 : Math.ceil(remainder / SMALL_BATCH);
      const total = l * LARGE_BATCH + s * SMALL_BATCH;
      if (total < target) continue;
      if (total > target * 1.15) continue;
      const gap = Math.abs(l - s);
      if (gap < bestGap || (gap === bestGap && total < bestTotal)) {
        bestLarge = l; bestSmall = s; bestTotal = total; bestGap = gap;
      }
    }
    if (bestTotal === Infinity) {
      bestLarge = Math.ceil(target / LARGE_BATCH);
      bestSmall = 0;
      bestTotal = bestLarge * LARGE_BATCH;
    }
    return { large: bestLarge, small: bestSmall, totalDonuts: bestTotal, overProduction: bestTotal - target };
  }

  // Effective target: custom override or server default
  const effectiveTarget = customTarget !== null ? customTarget : (data?.target ?? 0);
  const effectiveBatches = calculateBatchesLocal(effectiveTarget);
  const effectiveTotalTrays = Math.ceil(effectiveTarget / TRAY_SIZE);

  // Scale tray allocations proportionally when target is overridden
  const effectiveTrayAllocations = (data?.trayAllocations ?? []).map(t => {
    if (customTarget === null || !data) return t;
    const ratio = effectiveTarget / (data.target || 1);
    const scaledTrays = Math.round(t.trays * ratio * 10) / 10;
    return { ...t, trays: scaledTrays, donuts: Math.round(scaledTrays * TRAY_SIZE) };
  });

  const saveTargetOverride = async () => {
    if (customTarget === null) return;
    try {
      const res = await fetch("/api/production-targets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: formatDateISO(selectedDate), target: customTarget }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setTargetSaved(true);
    } catch (e) {
      toast.error("Could not save target: " + (e instanceof Error ? e.message : "unknown error"));
    }
  };

  // Save all tray overrides for the current date
  const saveTrayOverrides = async () => {
    const dateStr = formatDateISO(selectedDate);
    try {
      // Delete existing overrides first
      await fetch(`/api/tray-overrides?date=${dateStr}`, { method: "DELETE" });
      // Save each override
      for (const [flavor, trays] of Object.entries(trayOverrides)) {
        await fetch("/api/tray-overrides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr, flavor, trays }),
        });
      }
      setTraySaved(true);
    } catch { /* ignore */ }
  };

  // Apply tray overrides to allocations
  const finalTrayAllocations = effectiveTrayAllocations.map(t => {
    const override = trayOverrides[t.name];
    return override !== undefined ? { ...t, trays: override, donuts: Math.round(override * TRAY_SIZE) } : t;
  });

  // ─── Prep item management state ────────────────────────
  const [showPrepForm, setShowPrepForm] = useState(false);
  const [editingPrepItem, setEditingPrepItem] = useState<PrepItem | null>(null);
  const [prepFormName, setPrepFormName] = useState("");
  const [prepFormAmount, setPrepFormAmount] = useState("");
  const [prepFormCategory, setPrepFormCategory] = useState("Glazes");
  const [prepFormNewCat, setPrepFormNewCat] = useState("");
  const [prepFormShelfLife, setPrepFormShelfLife] = useState(48);
  const [prepFormCatColor, setPrepFormCatColor] = useState("#F3EEFF");
  const [submittingPrep, setSubmittingPrep] = useState(false);
  const [showPrepCatModal, setShowPrepCatModal] = useState(false);
  const [editingPrepCategory, setEditingPrepCategory] = useState<string | null>(null);
  const [prepCatEditName, setPrepCatEditName] = useState("");
  const [prepCatEditColor, setPrepCatEditColor] = useState("#F3F4F6");
  const [showPrepCatEdit, setShowPrepCatEdit] = useState(false);

  const prepCategoriesList = data?.prepList
    ? [...new Set(data.prepList.map(i => i.category))]
    : ["Glazes", "Icings", "Jams/Creams", "Syrups/Sugar-Free"];

  const resetPrepForm = () => {
    setPrepFormName(""); setPrepFormAmount(""); setPrepFormCategory("Glazes");
    setPrepFormNewCat(""); setPrepFormShelfLife(48); setPrepFormCatColor("#F3EEFF");
    setEditingPrepItem(null);
  };

  const openEditPrepItem = (item: PrepItem, category: string) => {
    setEditingPrepItem(item);
    setPrepFormName(item.name);
    setPrepFormAmount(item.amount);
    setPrepFormCategory(category);
    setPrepFormShelfLife(item.shelfLifeHours || 0);
    setPrepFormCatColor(item.categoryColor || "#F3F4F6");
    setShowPrepForm(true);
  };

  const savePrepItem = async () => {
    if (!prepFormName.trim()) return;
    setSubmittingPrep(true);
    try {
      const cat = prepFormCategory === "__new__" ? prepFormNewCat.trim() : prepFormCategory;
      if (!cat) { setSubmittingPrep(false); return; }

      // For editing, find the DB item by name
      if (editingPrepItem) {
        // Find matching DB prep item
        const dbItems = await fetch("/api/prep-items").then(r => r.json());
        const match = Array.isArray(dbItems) ? dbItems.find((i: { name: string }) => i.name === editingPrepItem.name) : null;
        if (match) {
          await fetch("/api/prep-items", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: match.id, name: prepFormName.trim(), category: cat, categoryColor: prepFormCatColor, amount: prepFormAmount.trim(), shelfLifeHours: prepFormShelfLife }),
          });
        }
      } else {
        await fetch("/api/prep-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: prepFormName.trim(), category: cat, categoryColor: prepFormCatColor, amount: prepFormAmount.trim(), shelfLifeHours: prepFormShelfLife }),
        });
      }
      setShowPrepForm(false);
      resetPrepForm();
      fetchProductionData(selectedDate);
    } catch { /* ignore */ }
    setSubmittingPrep(false);
  };

  const deletePrepItem = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const dbItems = await fetch("/api/prep-items").then(r => r.json());
      const match = Array.isArray(dbItems) ? dbItems.find((i: { name: string }) => i.name === name) : null;
      if (match) {
        await fetch(`/api/prep-items?id=${match.id}`, { method: "DELETE" });
        fetchProductionData(selectedDate);
      }
    } catch { /* ignore */ }
  };

  const renamePrepCategory = async () => {
    if (!editingPrepCategory || !prepCatEditName.trim()) return;
    try {
      const dbItems = await fetch("/api/prep-items").then(r => r.json());
      const toUpdate = Array.isArray(dbItems) ? dbItems.filter((i: { category: string }) => i.category === editingPrepCategory) : [];
      for (const item of toUpdate) {
        await fetch("/api/prep-items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, category: prepCatEditName.trim(), categoryColor: prepCatEditColor }),
        });
      }
      setShowPrepCatEdit(false);
      setEditingPrepCategory(null);
      fetchProductionData(selectedDate);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Par Sheets</h1><p className="text-sm text-gray">Loading production data…</p></div>
        <div className="card"><div className="empty-state">Loading…</div></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Par Sheets</h1><p className="text-sm text-gray">Production planning</p></div>
        <div className="card"><div className="empty-state">No production data available</div></div>
      </div>
    );
  }

  // Group prep items by category
  const prepCategories = data.prepList.reduce<Record<string, PrepItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header with Date Picker */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Par Sheets</h1>
            <p className="text-sm text-gray">
              {data.dayLabel} &middot; Target: {data.target} donuts
              {data.isHoliday && <span className="badge badge-orange" style={{ marginLeft: 8 }}>{data.holidayName}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="card" style={{ padding: "12px 16px" }}>
        <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 8 }}>
          <div className="flex items-center gap-2">
            <button onClick={goToPrevDay} className="btn btn-ghost btn-sm" title="Previous day">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ color: "#6B7280" }} />
              <input
                type="date"
                value={formatDateISO(selectedDate)}
                onChange={(e) => {
                  const d = new Date(e.target.value + "T00:00:00");
                  if (!isNaN(d.getTime())) setSelectedDate(d);
                }}
                className="form-input"
                style={{ width: "auto", padding: "6px 10px", fontSize: 13 }}
              />
            </div>
            <button onClick={goToNextDay} className="btn btn-ghost btn-sm" title="Next day">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
            <span className="text-sm font-medium" style={{ color: "#374151" }}>
              {formatDatePretty(selectedDate)}
            </span>
            {!isToday && (
              <button onClick={goToToday} className="btn btn-sm btn-primary" style={{ padding: "4px 10px", fontSize: 12 }}>
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Summary Card */}
      <div className="card" style={{ padding: 20 }}>
        <div className="grid-4">
          <div className="stat-card" style={{ border: "none", padding: 0 }}>
            <div className="stat-icon stat-icon-orange">🎯</div>
            <div className="flex items-center justify-center gap-2">
              {isManager ? (
                <input
                  type="number"
                  className="form-input"
                  value={effectiveTarget}
                  min={0}
                  step={10}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setCustomTarget(isNaN(v) || v < 0 ? 0 : v);
                    setTargetSaved(false);
                  }}
                  style={{ width: 90, textAlign: "center", fontSize: 24, fontWeight: 700, padding: "4px 2px" }}
                />
              ) : (
                <div className="stat-value">{effectiveTarget}</div>
              )}
            </div>
            <div className="stat-label">
              Donut Target
              {customTarget !== null && customTarget !== data.target && (
                <span className="text-xs text-gray" style={{ display: "block" }}>
                  was {data.target}
                </span>
              )}
            </div>
            {isManager && customTarget !== null && !targetSaved && (
              <button
                className="btn btn-primary btn-sm"
                onClick={saveTargetOverride}
                style={{ marginTop: 6, fontSize: 11, padding: "3px 10px" }}
              >
                Save Target
              </button>
            )}
            {targetSaved && (
              <span className="text-xs" style={{ color: "#059669", marginTop: 4, display: "block" }}>✓ Saved</span>
            )}
          </div>
          <div className="stat-card" style={{ border: "none", padding: 0 }}>
            <div className="stat-icon stat-icon-blue">🫕</div>
            <div className="stat-value">{effectiveBatches.large}</div>
            <div className="stat-label">Large Batches (3000g)</div>
          </div>
          <div className="stat-card" style={{ border: "none", padding: 0 }}>
            <div className="stat-icon stat-icon-green">🥣</div>
            <div className="stat-value">{effectiveBatches.small}</div>
            <div className="stat-label">Small Batches (2000g)</div>
          </div>
          <div className="stat-card" style={{ border: "none", padding: 0 }}>
            <div className="stat-icon stat-icon-purple">📦</div>
            <div className="stat-value">{effectiveTotalTrays}</div>
            <div className="stat-label">Total Trays ({TRAY_SIZE}/tray)</div>
          </div>
        </div>
        {effectiveBatches.overProduction > 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#B45309", background: "#FFFBEB", padding: "6px 12px", borderRadius: 6 }}>
            ⚠️ {effectiveBatches.overProduction} over production ({effectiveBatches.totalDonuts} total from {effectiveBatches.large + effectiveBatches.small} batches)
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === "batches" ? "active" : ""}`} onClick={() => setActiveTab("batches")}>
          <ChefHat size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
          Batches
        </button>
        <button className={`tab ${activeTab === "trays" ? "active" : ""}`} onClick={() => setActiveTab("trays")}>
          <LayoutGrid size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
          Trays
        </button>
        <button className={`tab ${activeTab === "sandwiches" ? "active" : ""}`} onClick={() => setActiveTab("sandwiches")}>
          <Sandwich size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
          Sandwiches
        </button>
        <button className={`tab ${activeTab === "prep" ? "active" : ""}`} onClick={() => setActiveTab("prep")}>
          <Beaker size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
          Prep List
        </button>
        <button className={`tab ${activeTab === "predictions" ? "active" : ""}`} onClick={() => setActiveTab("predictions")}>
          <ListChecks size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 4 }} />
          Predictions
        </button>
      </div>

      {/* ── Batch Calculation Tab ────────────────────────── */}
      {activeTab === "batches" && (
        <div className="space-y-4">
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Mixer Schedule for {data.dayLabel}</h3>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Mixer</th>
                    <th>Batch Size</th>
                    <th>Donuts/Batch</th>
                    <th># of Batches</th>
                    <th>Total Donuts</th>
                  </tr>
                </thead>
<tbody>
	                  <tr>
	                    <td className="font-medium">Large Mixer</td>
	                    <td>3,000g</td>
	                    <td>69</td>
	                    <td className="font-semibold">{effectiveBatches.large}</td>
	                    <td>{effectiveBatches.large * 69}</td>
	                  </tr>
	                  <tr>
	                    <td className="font-medium">Small Mixer</td>
	                    <td>2,000g</td>
	                    <td>46</td>
	                    <td className="font-semibold">{effectiveBatches.small}</td>
	                    <td>{effectiveBatches.small * 46}</td>
	                  </tr>
	                  <tr style={{ borderTop: "2px solid #E5E7EB" }}>
	                    <td colSpan={3} className="font-semibold">Total</td>
	                    <td className="font-bold" style={{ color: "#7C3AED" }}>{effectiveBatches.large + effectiveBatches.small}</td>
	                    <td className="font-bold" style={{ color: "#7C3AED" }}>{effectiveBatches.totalDonuts}</td>
	                  </tr>
	                </tbody>
	              </table>
	            </div>
	            {effectiveBatches.overProduction > 0 && (
	              <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", borderRadius: 6, fontSize: 13, color: "#92400E" }}>
	                ⚠️ Over-production of {effectiveBatches.overProduction} donuts ({((effectiveBatches.overProduction / effectiveTarget) * 100).toFixed(1)}% above target)
	              </div>
	            )}
          </div>

          {/* Mixing order suggestion */}
          <div className="card" style={{ padding: 20 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recommended Mixing Order</h3>
              {checkedBatches.size > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={async () => {
                    const dateStr = formatDateISO(selectedDate);
                    // Uncheck all persisted batches
                    const indices = Array.from(checkedBatches);
                    for (const idx of indices) {
                      await fetch("/api/batch-completions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date: dateStr, batchIndex: idx, mixerType: "Large", completed: false }),
                      }).catch(() => {});
                    }
                    setCheckedBatches(new Set());
                  }}
                  style={{ fontSize: 11, color: "#6B7280" }}
                >
                  Reset ({checkedBatches.size} done)
                </button>
              )}
            </div>
            <p className="text-sm text-gray" style={{ marginBottom: 12 }}>Run both mixers simultaneously. Alternate batches to keep production flowing. Tap to check off completed batches.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
{(() => {
	                const order: { mixer: string; batch: number; grams: number; donuts: number }[] = [];
	                const totalLarge = effectiveBatches.large;
	                const totalSmall = effectiveBatches.small;
                const pairs = Math.min(totalLarge, totalSmall);
                for (let i = 0; i < pairs; i++) {
                  order.push({ mixer: "Large", batch: i + 1, grams: 3000, donuts: 69 });
                  order.push({ mixer: "Small", batch: i + 1, grams: 2000, donuts: 46 });
                }
                for (let i = pairs; i < totalLarge; i++) {
                  order.push({ mixer: "Large", batch: i + 1, grams: 3000, donuts: 69 });
                }
                for (let i = pairs; i < totalSmall; i++) {
                  order.push({ mixer: "Small", batch: i + 1, grams: 2000, donuts: 46 });
                }
                return order.map((o, i) => {
                  const checked = checkedBatches.has(i);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleBatch(i, o.mixer)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 6, cursor: "pointer",
                        background: checked ? "#F9FAFB" : (o.mixer === "Large" ? "#F3EEFF" : "#ECFDF5"),
                        border: `1px solid ${checked ? "#E5E7EB" : (o.mixer === "Large" ? "#DDD6FE" : "#A7F3D0")}`,
                        opacity: checked ? 0.45 : 1,
                        transition: "opacity 0.2s, background 0.2s",
                        textDecoration: checked ? "line-through" : "none",
                        textDecorationColor: "#9CA3AF",
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                        border: checked ? "2px solid #059669" : "2px solid #D1D5DB",
                        background: checked ? "#059669" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}>
                        {checked && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className={`badge ${o.mixer === "Large" ? "badge-blue" : "badge-green"}`}>
                        {o.mixer}
                      </span>
                      <span className="text-sm font-medium">Batch #{o.batch}</span>
                      <span className="text-sm text-gray">{o.grams.toLocaleString()}g → {o.donuts} donuts</span>
                    </div>
                  );
                });
})()}
	            </div>
{checkedBatches.size > 0 && (() => {
	              const order: { donuts: number }[] = [];
	              const totalLarge = effectiveBatches.large;
	              const totalSmall = effectiveBatches.small;
              const pairs = Math.min(totalLarge, totalSmall);
              for (let i = 0; i < pairs; i++) { order.push({ donuts: 69 }); order.push({ donuts: 46 }); }
              for (let i = pairs; i < totalLarge; i++) { order.push({ donuts: 69 }); }
              for (let i = pairs; i < totalSmall; i++) { order.push({ donuts: 46 }); }
              const doneDonuts = Array.from(checkedBatches).reduce((sum, idx) => sum + (order[idx]?.donuts || 0), 0);
              return (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#F0FDF4", borderRadius: 6, fontSize: 13, color: "#166534" }}>
                  ✅ {checkedBatches.size} of {order.length} batches done — {doneDonuts} donuts mixed
                </div>
              );
            })()}
          </div>
        </div>
      )}

{/* ── Tray Allocation Tab ──────────────────────────── */}
		      {activeTab === "trays" && (
		        <div className="space-y-4">
		          <div className="card" style={{ padding: 20 }}>
		            <div className="flex items-center justify-between mb-4" style={{ flexWrap: "wrap", gap: 8 }}>
		            <h3 style={{ fontSize: 15, fontWeight: 600 }}>
		              Tray Allocation — {effectiveTotalTrays} trays ({effectiveTarget} donuts ÷ {TRAY_SIZE}/tray)
		            </h3>
		            {isManager && Object.keys(trayOverrides).length > 0 && (
		              <button className="btn btn-ghost btn-sm" onClick={() => { setTrayOverrides({}); setTraySaved(false); }} style={{ fontSize: 11, color: "#6B7280" }}>
		                Reset to Default
		              </button>
		            )}
		            </div>
		          <div style={{ overflowX: "auto" }}>
		            <table>
		              <thead>
		                <tr>
		                  <th>Flavor</th>
		                  <th style={{ textAlign: "right" }}>Trays</th>
		                  <th style={{ textAlign: "right" }}>Donuts</th>
		                  <th style={{ textAlign: "right" }}>% of Total</th>
		                </tr>
		              </thead>
		              <tbody>
		                {finalTrayAllocations.map((t, i) => {
		                  const isOverridden = trayOverrides[t.name] !== undefined;
		                  const baseTrays = effectiveTrayAllocations[i]?.trays || t.trays;
		                  return (
		                    <tr key={i} style={{ background: isOverridden ? "#FFFBEB" : undefined }}>
		                      <td className="font-medium">
		                        {t.name}
		                        {isOverridden && <span className="text-xs" style={{ color: "#D97706", marginLeft: 4 }}>(was {baseTrays})</span>}
		                      </td>
		                      <td style={{ textAlign: "right" }}>
		                        {isManager ? (
		                          <input
		                            type="number"
		                            className="form-input"
		                            value={t.trays}
		                            min={0}
		                            step={0.5}
		                            onChange={(e) => {
		                              const val = parseFloat(e.target.value);
		                              if (isNaN(val) || val < 0) return;
		                              setTrayOverrides(prev => {
		                                const next = { ...prev, [t.name]: val };
		                                setTraySaved(false);
		                                return next;
		                              });
		                            }}
		                            style={{ width: 70, textAlign: "right", padding: "4px 8px", fontSize: 14, fontWeight: 600 }}
		                          />
		                        ) : (
		                          <span className="font-semibold">{t.trays}</span>
		                        )}
		                      </td>
		                      <td style={{ textAlign: "right" }}>{t.donuts}</td>
		                      <td style={{ textAlign: "right" }}>
		                        <span className="text-sm text-gray">{((t.donuts / effectiveTarget) * 100).toFixed(1)}%</span>
		                      </td>
		                    </tr>
		                  );
		                })}
		                <tr style={{ borderTop: "2px solid #E5E7EB" }}>
		                  <td className="font-bold">Total</td>
		                  <td style={{ textAlign: "right" }} className="font-bold text-blue">{finalTrayAllocations.reduce((s, t) => s + t.trays, 0).toFixed(1).replace(/\.0$/, "")}</td>
		                  <td style={{ textAlign: "right" }} className="font-bold text-blue">{finalTrayAllocations.reduce((s, t) => s + t.donuts, 0)}</td>
		                  <td style={{ textAlign: "right" }} className="text-sm text-gray">100%</td>
		                </tr>
		              </tbody>
		            </table>
		          </div>
		          {isManager && (
		            <div className="flex items-center gap-3" style={{ marginTop: 12, flexWrap: "wrap" }}>
		              <button className="btn btn-primary btn-sm" onClick={saveTrayOverrides} disabled={traySaved}>
		                {traySaved ? "✓ Trays Saved" : "💾 Save Tray Changes"}
		              </button>
		              {Object.keys(trayOverrides).length > 0 && (
		                <span className="text-xs text-gray">{Object.keys(trayOverrides).length} flavor{Object.keys(trayOverrides).length !== 1 ? "s" : ""} customized</span>
		              )}
		            </div>
		          )}
		        </div>
		      </div>
		    )}

      {/* ── Sandwiches Tab ────────────────────────────────── */}
      {activeTab === "sandwiches" && (
        <div className="space-y-4">
          {data.sandwichToday?.isMakeDay ? (
            <>
              {/* Make Day Banner */}
              <div className="card" style={{ padding: 20, background: "#F3EEFF", border: "1px solid #DDD6FE" }}>
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ fontSize: 20 }}>🥪</span>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#6D28D9" }}>
                    Sandwich Make Day — {data.sandwichToday.makeDayLabel}
                  </h3>
                </div>
                <p className="text-sm" style={{ color: "#A855F7" }}>
                  Making today for: {data.sandwichToday.covers.join(" · ")}
                </p>
              </div>

              {/* Sandwhiches to Make */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Sandwiches to Make Today</h3>
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Sandwich</th>
                        <th style={{ textAlign: "right" }}>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sandwichToday.itemsToMake.map((item, i) => (
                        <tr key={i}>
                          <td className="font-medium">{item.name}</td>
                          <td style={{ textAlign: "right" }} className="font-semibold">{item.quantity}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: "2px solid #E5E7EB" }}>
                        <td className="font-bold">Total Sandwiches</td>
                        <td style={{ textAlign: "right" }} className="font-bold text-blue">{data.sandwichToday.totalToMake}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daily Breakdown for this make batch */}
              {data.sandwichToday.dailyBreakdown.length > 0 && (
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Daily Breakdown</h3>
                  <div className="space-y-2">
                    {data.sandwichToday.dailyBreakdown.map((day, i) => {
                      const dayTotal = day.items.reduce((s, it) => s + it.par, 0);
                      return (
                        <div key={i} style={{
                          padding: "10px 14px",
                          borderRadius: 6,
                          background: day.isHoliday ? "#FEF3C7" : day.isWeekend ? "#FFF7ED" : "#F9FAFB",
                          border: `1px solid ${day.isHoliday ? "#FDE68A" : day.isWeekend ? "#FED7AA" : "#E5E7EB"}`,
                        }}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{day.dayLabel}</span>
                              {day.isHoliday && <span className="badge badge-orange" style={{ fontSize: 10, padding: "1px 6px" }}>Holiday</span>}
                              {day.isWeekend && !day.isHoliday && <span className="badge badge-purple" style={{ fontSize: 10, padding: "1px 6px" }}>Weekend</span>}
                            </div>
                            <span className="text-sm font-semibold text-blue">{dayTotal} total</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {day.items.map((item, j) => (
                              <span key={j} style={{
                                padding: "2px 8px",
                                borderRadius: 4,
                                background: "#fff",
                                border: "1px solid #E5E7EB",
                                fontSize: 12,
                              }}>
                                {item.name}: <strong>{item.par}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Not a make day */
            <div className="card" style={{ padding: 20 }}>
              <div className="empty-state">
                <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>🥪</span>
                <p className="font-medium" style={{ marginBottom: 4 }}>No sandwich prep today</p>
                <p className="text-sm text-gray">Sandwiches are made on Mondays and Thursdays.</p>
              </div>
            </div>
          )}

          {/* Schedule Reference — always visible */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Sandwich Make Schedule</h3>
            <p className="text-sm text-gray" style={{ marginBottom: 12 }}>
              Sandwiches are prepped in batches of 5 on make days and held for the following days.
            </p>
            <div className="space-y-3">
              <div style={{
                padding: "12px 16px",
                borderRadius: 6,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
              }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-green">Monday</span>
                  <span className="text-sm text-gray">→ covers Tuesday, Wednesday, Thursday</span>
                </div>
                <p className="text-xs text-gray">All weekday par unless a holiday falls in the range.</p>
              </div>
              <div style={{
                padding: "12px 16px",
                borderRadius: 6,
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
              }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-orange">Thursday</span>
                  <span className="text-sm text-gray">→ covers Friday, Saturday, Sunday, Monday</span>
                </div>
                <p className="text-xs text-gray">Includes weekend par. Holidays trigger weekend quantities.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Prep List Tab ────────────────────────────────── */}
      {activeTab === "prep" && (
        <div className="space-y-4">
          {isManager && (
            <div className="card" style={{ padding: "12px 16px" }}>
              <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowPrepForm(true)}>
                  + Add Prep Item
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowPrepCatModal(true)}>
                  <Settings size={14} /> Categories
                </button>
              </div>
            </div>
          )}

          {/* Add/Edit Prep Item Form */}
          {showPrepForm && isManager && (
            <div className="card" style={{ padding: 20, border: "2px solid #7C3AED" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                {editingPrepItem ? "Edit Prep Item" : "Add New Prep Item"}
              </h3>
              <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Item Name *</label>
                  <input type="text" className="form-input" value={prepFormName} onChange={e => setPrepFormName(e.target.value)} placeholder="e.g. Vanilla Glaze" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Amount</label>
                  <input type="text" className="form-input" value={prepFormAmount} onChange={e => setPrepFormAmount(e.target.value)} placeholder="e.g. 8-10 Qts" />
                </div>
              </div>
              <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={prepFormCategory} onChange={e => setPrepFormCategory(e.target.value)}>
                    {prepCategoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__new__">+ New Category</option>
                  </select>
                </div>
                {prepFormCategory === "__new__" && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">New Category Name</label>
                    <input type="text" className="form-input" value={prepFormNewCat} onChange={e => setPrepFormNewCat(e.target.value)} placeholder="e.g. Sauces" />
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Shelf Life (hours)</label>
                  <input type="number" className="form-input" value={prepFormShelfLife} onChange={e => setPrepFormShelfLife(parseInt(e.target.value) || 0)} min={0} placeholder="48" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category Color</label>
                  <input type="color" className="form-input" value={prepFormCatColor} onChange={e => setPrepFormCatColor(e.target.value)} style={{ height: 36, padding: 2 }} />
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowPrepForm(false); setEditingPrepItem(null); resetPrepForm(); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={savePrepItem} disabled={submittingPrep}>
                  {submittingPrep ? "Saving..." : editingPrepItem ? "Update" : "Add Item"}
                </button>
              </div>
            </div>
          )}

          {Object.entries(prepCategories).map(([category, items]) => (
            <div key={category} className="card">
              <div style={{ padding: "12px 20px", background: items[0]?.categoryColor || "#F3F4F6", borderRadius: "8px 8px 0 0", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{category}</h3>
                {isManager && (
                  <button onClick={() => { setEditingPrepCategory(category); setPrepCatEditName(category); setPrepCatEditColor(items[0]?.categoryColor || "#F3F4F6"); setShowPrepCatEdit(true); }} className="btn-icon" title="Rename category"><Pencil size={12} /></button>
                )}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: "right" }}>Amount to Prep</th>
                    <th style={{ textAlign: "right" }}>Good For</th>
                    {isManager && <th style={{ width: 80 }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const shelfDisplay = item.shelfLifeHours
                      ? item.shelfLifeHours >= 24
                        ? `${Math.floor(item.shelfLifeHours / 24)} day${item.shelfLifeHours >= 48 ? "s" : ""}`
                        : `${item.shelfLifeHours} hrs`
                      : "—";
                    const shelfColor = !item.shelfLifeHours ? "#9CA3AF"
                      : item.shelfLifeHours <= 48 ? "#DC2626"
                      : item.shelfLifeHours <= 72 ? "#D97706"
                      : "#059669";
                    return (
                      <tr key={i}>
                        <td className="font-medium">{item.name}</td>
                        <td style={{ textAlign: "right" }} className="font-semibold">{item.amount}</td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{
                            fontSize: 12, fontWeight: 500, color: shelfColor,
                            background: `${shelfColor}15`, padding: "2px 8px", borderRadius: 4,
                          }}>
                            {shelfDisplay}
                          </span>
                        </td>
                        {isManager && (
                          <td>
                            <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                              <button className="btn-icon" onClick={() => openEditPrepItem(item, category)} title="Edit"><Pencil size={12} /></button>
                              <button className="btn-icon" style={{ color: "#DC2626" }} onClick={() => deletePrepItem(item.name)} title="Delete"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
          <div className="card" style={{ padding: "12px 16px" }}>
            <div className="flex items-center gap-4" style={{ flexWrap: "wrap", fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>Shelf Life Guide:</span>
              <span className="flex items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#DC2626", display: "inline-block" }}></span>
                <span style={{ color: "#6B7280" }}>≤ 2 days — use quickly</span>
              </span>
              <span className="flex items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#D97706", display: "inline-block" }}></span>
                <span style={{ color: "#6B7280" }}>3 days — standard</span>
              </span>
              <span className="flex items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#059669", display: "inline-block" }}></span>
                <span style={{ color: "#6B7280" }}>7+ days — stable</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Predictions Tab (existing data) ──────────────── */}
      {activeTab === "predictions" && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Predicted vs Actual Production</h3>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: "right" }}>Predicted</th>
                  <th style={{ textAlign: "right" }}>Actual</th>
                  <th style={{ textAlign: "right" }}>Variance</th>
                </tr>
              </thead>
              <tbody>
                {parLines.map((l, i) => {
                  const v = l.actual - l.predicted;
                  return (
                    <tr key={i}>
                      <td className="font-medium">{l.product?.name || "—"}</td>
                      <td style={{ textAlign: "right" }}>{l.predicted}</td>
                      <td style={{ textAlign: "right" }}>{l.actual || 0}</td>
                      <td style={{ textAlign: "right" }}>
                        <span className={v < 0 ? "text-red" : "text-green"}>
                          {v > 0 ? "+" : ""}{v}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {parLines.length === 0 && (
                  <tr><td colSpan={4} className="empty-state">No prediction data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prep Category Rename Modal */}
      {showPrepCatEdit && editingPrepCategory && (
        <div className="modal-backdrop" onClick={() => setShowPrepCatEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <div className="modal-header"><h2>Rename "{editingPrepCategory}"</h2></div>
            <div className="modal-body space-y-3">
              <div>
                <label className="form-label">Category Name</label>
                <input className="form-input" value={prepCatEditName} onChange={e => setPrepCatEditName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Color</label>
                <input type="color" className="form-input" value={prepCatEditColor} onChange={e => setPrepCatEditColor(e.target.value)} style={{ height: 36, padding: 2 }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPrepCatEdit(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={renamePrepCategory}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Prep Category List Modal */}
      {showPrepCatModal && (
        <div className="modal-backdrop" onClick={() => setShowPrepCatModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header"><h2>Prep Categories</h2></div>
            <div className="modal-body">
              <div className="space-y-2">
                {prepCategoriesList.map(c => (
                  <div key={c} className="list-item">
                    <span className="font-medium text-sm">{c}</span>
                    <button onClick={() => {
                      const items = data?.prepList?.filter(i => i.category === c) || [];
                      setEditingPrepCategory(c);
                      setPrepCatEditName(c);
                      setPrepCatEditColor(items[0]?.categoryColor || "#F3F4F6");
                      setShowPrepCatModal(false);
                      setShowPrepCatEdit(true);
                    }} className="btn-icon"><Pencil size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPrepCatModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}