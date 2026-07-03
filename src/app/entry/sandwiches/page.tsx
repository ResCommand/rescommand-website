"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface SandwichRecipe {
  id: number;
  ingredientName: string;
  quantityPerUnit: number;
  unit: string;
}

interface SandwichSchedule {
  id: number;
  dayOfWeek: number;
  quantity: number;
}

interface SandwichType {
  id: number;
  name: string;
  category: string;
  sortOrder: number;
  active: boolean;
  schedule: SandwichSchedule[];
  recipes: SandwichRecipe[];
}

const DAYS = [
  { num: 1, short: "Mon", label: "Monday" },
  { num: 2, short: "Tue", label: "Tuesday" },
  { num: 3, short: "Wed", label: "Wednesday" },
  { num: 4, short: "Thu", label: "Thursday" },
  { num: 5, short: "Fri", label: "Friday" },
  { num: 6, short: "Sat", label: "Saturday" },
  { num: 0, short: "Sun", label: "Sunday" },
];

const CATEGORY_LABELS: Record<string, string> = {
  sandwich: "🥪 Sandwiches",
  bagel: "🥯 Bagels",
  wrap: "🌯 Wraps",
};

const CATEGORY_COLORS: Record<string, string> = {
  sandwich: "#FEE2E2",
  bagel: "#FEF3C7",
  wrap: "#D1FAE5",
};

export default function SandwichPrepPage() {
  const [types, setTypes] = useState<SandwichType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1); // default Monday
  const [prepDays, setPrepDays] = useState<Set<number>>(new Set([1, 4])); // Mon, Thu
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editRecipes, setEditRecipes] = useState<SandwichRecipe[]>([]);
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCategory, setNewTypeCategory] = useState("sandwich");
  const [savingSchedule, setSavingSchedule] = useState<number | null>(null);

  const loadData = () => {
    fetch("/api/sandwiches")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTypes(data);
          // Infer prep days from schedules
          const days = new Set<number>();
          data.forEach((t: SandwichType) => {
            t.schedule.forEach((s: SandwichSchedule) => {
              if (s.quantity > 0) days.add(s.dayOfWeek);
            });
          });
          if (days.size > 0) setPrepDays(days);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  // Calculate total for a given day
  const dayTotal = (day: number) =>
    types.reduce((sum, t) => {
      const sched = t.schedule.find((s) => s.dayOfWeek === day);
      return sum + (sched?.quantity || 0);
    }, 0);

  // Ingredient breakdown for the selected day
  const ingredientBreakdown = useMemo(() => {
    const totals: Record<string, { qty: number; unit: string }> = {};
    types.forEach((t) => {
      const sched = t.schedule.find((s) => s.dayOfWeek === selectedDay);
      const qty = sched?.quantity || 0;
      if (qty === 0) return;
      t.recipes.forEach((r) => {
        const key = r.ingredientName;
        const totalNeeded = r.quantityPerUnit * qty;
        if (!totals[key]) {
          totals[key] = { qty: totalNeeded, unit: r.unit };
        } else {
          totals[key].qty += totalNeeded;
        }
      });
    });
    return Object.entries(totals)
      .map(([name, { qty, unit }]) => ({ name, qty, unit }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [types, selectedDay]);

  // Group types by category
  const grouped = useMemo(() => {
    const map: Record<string, SandwichType[]> = {};
    types.forEach((t) => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return map;
  }, [types]);

  const updateSchedule = async (typeId: number, day: number, quantity: number) => {
    setSavingSchedule(typeId);
    try {
      const res = await fetch("/api/sandwiches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: typeId, schedules: [{ dayOfWeek: day, quantity }] }),
      });
      if (!res.ok) throw new Error();
      // Update local state
      setTypes((prev) =>
        prev.map((t) => {
          if (t.id !== typeId) return t;
          const existingIdx = t.schedule.findIndex((s) => s.dayOfWeek === day);
          const newSchedule = [...t.schedule];
          if (existingIdx >= 0) {
            newSchedule[existingIdx] = { ...newSchedule[existingIdx], quantity };
          } else {
            newSchedule.push({ id: 0, dayOfWeek: day, quantity });
          }
          return { ...t, schedule: newSchedule };
        })
      );
      // Update prep days
      if (quantity > 0) setPrepDays((prev) => new Set(prev).add(day));
      else {
        // Check if any type still has qty > 0 on this day
        const stillHasItems = types.some((t) => {
          if (t.id === typeId) {
            return t.schedule.some((s) => s.dayOfWeek === day && s.quantity > 0);
          }
          return t.schedule.some((s) => s.dayOfWeek === day && s.quantity > 0);
        });
        if (!stillHasItems) {
          setPrepDays((prev) => {
            const next = new Set(prev);
            next.delete(day);
            return next;
          });
        }
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSavingSchedule(null);
    }
  };

  const openEditRecipes = (t: SandwichType) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditRecipes(t.recipes.length > 0 ? [...t.recipes] : [{ id: 0, ingredientName: "", quantityPerUnit: 1, unit: "each" }]);
  };

  const saveRecipes = async () => {
    if (!editingId) return;
    const cleanRecipes = editRecipes
      .filter((r) => r.ingredientName.trim())
      .map((r) => ({
        ingredientName: r.ingredientName.trim(),
        quantityPerUnit: r.quantityPerUnit,
        unit: r.unit || "each",
      }));
    try {
      const res = await fetch("/api/sandwiches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name: editName, recipes: cleanRecipes }),
      });
      if (!res.ok) throw new Error();
      toast.success("Recipes updated");
      setEditingId(null);
      loadData();
    } catch {
      toast.error("Failed to save");
    }
  };

  const addNewType = async () => {
    if (!newTypeName.trim()) return;
    try {
      const res = await fetch("/api/sandwiches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName.trim(), category: newTypeCategory }),
      });
      if (!res.ok) throw new Error();
      toast.success("Added");
      setShowAddType(false);
      setNewTypeName("");
      loadData();
    } catch {
      toast.error("Failed to add");
    }
  };

  const deleteType = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove it from the prep schedule.`)) return;
    try {
      const res = await fetch(`/api/sandwiches?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Sandwiches & Bagels</h1></div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Sandwiches & Bagels</h1>
            <p className="text-sm text-gray">
              Weekly prep planner · {types.length} types · {prepDays.size} prep days
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddType(true)}>
            <Plus size={14} /> Add Type
          </button>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-2" style={{ marginBottom: 24, flexWrap: "wrap" }}>
        {DAYS.map((d) => {
          const isPrepDay = prepDays.has(d.num);
          const isSelected = selectedDay === d.num;
          const total = dayTotal(d.num);
          return (
            <button
              key={d.num}
              onClick={() => setSelectedDay(d.num)}
              className="inv-tab-item"
              style={{
                borderBottomColor: isSelected ? "var(--rc-primary)" : "transparent",
                color: isSelected ? "var(--rc-primary)" : isPrepDay ? "var(--rc-text)" : "var(--rc-text-light)",
                fontWeight: isSelected ? 600 : 500,
                position: "relative",
                padding: "10px 20px",
                fontSize: 14,
                background: isSelected ? "var(--rc-primary-light)" : "transparent",
                borderRadius: "8px 8px 0 0",
              }}
            >
              {d.short}
              {total > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, marginLeft: 4,
                  background: isSelected ? "var(--rc-primary)" : "#E5E7EB",
                  color: isSelected ? "#fff" : "#6B7280",
                  padding: "1px 6px", borderRadius: 100,
                }}>
                  {total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sandwich types by category */}
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--rc-text)" }}>
            {CATEGORY_LABELS[cat] || cat}
          </h2>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="inv-count-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th style={{ width: 120 }}>{DAYS.find(d => d.num === selectedDay)?.label} Qty</th>
                  <th style={{ width: 100 }}>Total Units</th>
                  <th style={{ width: 80 }}>Ingredients</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => {
                  const dayQty = t.schedule.find((s) => s.dayOfWeek === selectedDay)?.quantity || 0;
                  const weeklyTotal = t.schedule.reduce((sum, s) => sum + s.quantity, 0);
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="inv-item-name">{t.name}</div>
                        <div className="inv-item-subtitle">
                          {t.recipes.length} ingredient{t.recipes.length !== 1 ? "s" : ""} · {t.category}
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="inv-num-input"
                          style={{ width: 80 }}
                          min="0"
                          value={dayQty || ""}
                          placeholder="0"
                          onChange={(e) => updateSchedule(t.id, selectedDay, parseInt(e.target.value) || 0)}
                          disabled={savingSchedule === t.id}
                        />
                      </td>
                      <td>
                        <span className="font-semibold text-sm">{weeklyTotal}</span>
                        <span className="text-xs text-gray"> /week</span>
                      </td>
                      <td>
                        {t.recipes.length > 0 ? (
                          <button
                            className="btn-icon"
                            onClick={() => openEditRecipes(t)}
                            title="Edit recipe"
                          >
                            <Pencil size={14} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEditRecipes(t)}
                            title="Add recipe"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => deleteType(t.id, t.name)}
                          style={{ color: "#DC2626" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {types.length === 0 && (
        <div className="card">
          <div className="empty-state">No sandwich types yet. Click "Add Type" to get started.</div>
        </div>
      )}

      {/* Ingredient Breakdown */}
      {ingredientBreakdown.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--rc-text)" }}>
            📋 Ingredient Breakdown for {DAYS.find(d => d.num === selectedDay)?.label}
          </h2>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="inv-count-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th style={{ width: 150 }}>Total Needed</th>
                </tr>
              </thead>
              <tbody>
                {ingredientBreakdown.map((ing) => (
                  <tr key={ing.name}>
                    <td className="inv-item-name">{ing.name}</td>
                    <td>
                      <span className="inv-status-order" style={{ fontSize: 13 }}>
                        {Number.isInteger(ing.qty) ? ing.qty : ing.qty.toFixed(1)} {ing.unit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Type Modal */}
      {showAddType && (
        <div className="drawer-backdrop" onClick={() => setShowAddType(false)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="drawer-header">
              <h2>Add Sandwich Type</h2>
              <button className="btn-icon" onClick={() => setShowAddType(false)}>✕</button>
            </div>
            <div className="drawer-body">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="e.g. Ham & Cheese Croissant"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="dropdown-label">Category</label>
                <select
                  className="form-input"
                  value={newTypeCategory}
                  onChange={(e) => setNewTypeCategory(e.target.value)}
                >
                  <option value="sandwich">🥪 Sandwich</option>
                  <option value="bagel">🥯 Bagel</option>
                  <option value="wrap">🌯 Wrap</option>
                </select>
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddType(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={addNewType}>Add Type</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Recipes Drawer */}
      {editingId && (
        <div className="drawer-backdrop" onClick={() => setEditingId(null)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Edit Recipe: {editName}</h2>
              <button className="btn-icon" onClick={() => setEditingId(null)}>✕</button>
            </div>
            <div className="drawer-body">
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <label className="form-label" style={{ marginBottom: 8 }}>Ingredients per unit</label>
              <p className="text-xs text-gray" style={{ marginBottom: 12 }}>
                How much of each ingredient goes into ONE sandwich/bagel/wrap.
              </p>

              {editRecipes.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1 }}
                    placeholder="Ingredient name"
                    value={r.ingredientName}
                    onChange={(e) => {
                      const next = [...editRecipes];
                      next[idx] = { ...next[idx], ingredientName: e.target.value };
                      setEditRecipes(next);
                    }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: 80 }}
                    min="0"
                    step="0.25"
                    placeholder="Qty"
                    value={r.quantityPerUnit || ""}
                    onChange={(e) => {
                      const next = [...editRecipes];
                      next[idx] = { ...next[idx], quantityPerUnit: parseFloat(e.target.value) || 0 };
                      setEditRecipes(next);
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: 80 }}
                    placeholder="unit"
                    value={r.unit}
                    onChange={(e) => {
                      const next = [...editRecipes];
                      next[idx] = { ...next[idx], unit: e.target.value };
                      setEditRecipes(next);
                    }}
                  />
                  <button
                    className="btn-icon"
                    onClick={() => setEditRecipes(editRecipes.filter((_, i) => i !== idx))}
                    style={{ color: "#DC2626" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditRecipes([...editRecipes, { id: 0, ingredientName: "", quantityPerUnit: 1, unit: "each" }])}
                style={{ marginTop: 8 }}
              >
                <Plus size={14} /> Add Ingredient
              </button>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={saveRecipes}>Save Recipe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
