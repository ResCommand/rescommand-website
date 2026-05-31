"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Recipe {
  id: number;
  name: string;
  category: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: string | null;
  yield: string | null;
  sortOrder: number;
  active: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  base: "🧈 Base Recipes",
  filling: "🥧 Fillings & Creams",
  topping: "🎂 Toppings & Glazes",
  general: "📋 General",
};
const CATEGORY_ORDER = ["base", "filling", "topping", "general"];
const CATEGORY_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  base: { bg: "#FFF7ED", border: "#FED7AA", badge: "badge-orange" },
  filling: { bg: "#F5F3FF", border: "#DDD6FE", badge: "badge-purple" },
  topping: { bg: "#EFF6FF", border: "#BFDBFE", badge: "badge-blue" },
  general: { bg: "#F9FAFB", border: "#E5E7EB", badge: "badge-gray" },
};

export default function RecipesPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "EMPLOYEE";
  const isManager = role === "MANAGER" || role === "OWNER";

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("filling");
  const [formDescription, setFormDescription] = useState("");
  const [formYield, setFormYield] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formIngredients, setFormIngredients] = useState<Ingredient[]>([{ name: "", amount: "", unit: "" }]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch("/api/recipes").then((r) => r.json());
      setRecipes(Array.isArray(res) ? res : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const filtered = recipes
    .filter((r) => activeCategory === "ALL" || r.category === activeCategory)
    .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.ingredients.some((ing) => ing.name.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const ca = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      if (ca !== 0) return ca;
      return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
    });

  // Group by category
  const grouped = CATEGORY_ORDER
    .map((key) => ({
      key,
      label: CATEGORY_LABELS[key] || key,
      color: CATEGORY_COLORS[key] || CATEGORY_COLORS.general,
      recipes: filtered.filter((r) => r.category === key),
    }))
    .filter((g) => g.recipes.length > 0);

  const categoryCounts: Record<string, number> = {
    base: recipes.filter((r) => r.category === "base").length,
    filling: recipes.filter((r) => r.category === "filling").length,
    topping: recipes.filter((r) => r.category === "topping").length,
    general: recipes.filter((r) => r.category === "general").length,
  };

  const resetForm = () => {
    setFormName("");
    setFormCategory("filling");
    setFormDescription("");
    setFormYield("");
    setFormInstructions("");
    setFormIngredients([{ name: "", amount: "", unit: "" }]);
    setFormError("");
    setEditingRecipe(null);
  };

  const openEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormName(recipe.name);
    setFormCategory(recipe.category);
    setFormDescription(recipe.description || "");
    setFormYield(recipe.yield || "");
    setFormInstructions(recipe.instructions || "");
    setFormIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: "", amount: "", unit: "" }]);
    setShowAddForm(true);
    setFormError("");
  };

  const submitForm = async () => {
    const validIngredients = formIngredients.filter((i) => i.name.trim());
    if (!formName.trim() || validIngredients.length === 0) {
      setFormError("Recipe name and at least one ingredient are required");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      name: formName.trim(),
      category: formCategory,
      description: formDescription.trim() || null,
      yield: formYield.trim() || null,
      instructions: formInstructions.trim() || null,
      ingredients: validIngredients,
      sortOrder: editingRecipe?.sortOrder || 0,
    };

    try {
      const res = await fetch("/api/recipes", {
        method: editingRecipe ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRecipe ? { id: editingRecipe.id, ...payload } : payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      setShowAddForm(false);
      resetForm();
      fetchRecipes();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRecipe = async (id: number) => {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    try {
      await fetch("/api/recipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setExpandedRecipe(null);
      fetchRecipes();
    } catch {
      // ignore
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setFormIngredients((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addIngredientRow = () => {
    setFormIngredients((prev) => [...prev, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredientRow = (index: number) => {
    setFormIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Recipes</h1></div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>📖 Recipes</h1>
            <p className="text-sm text-gray">{recipes.length} recipes in the book</p>
          </div>
          {isManager && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { if (showAddForm) { resetForm(); } setShowAddForm(!showAddForm); }}
            >
              {showAddForm ? "✕ Cancel" : "+ Add Recipe"}
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit form */}
      {showAddForm && isManager && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            {editingRecipe ? "Edit Recipe" : "Add New Recipe"}
          </h3>
          {formError && (
            <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
              {formError}
            </div>
          )}
          <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Recipe Name *</label>
              <input type="text" className="form-input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Maple Bacon Icing" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-input" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                <option value="base">🧈 Base Recipe</option>
                <option value="filling">🥧 Filling / Cream</option>
                <option value="topping">🎂 Topping / Glaze</option>
                <option value="general">📋 General</option>
              </select>
            </div>
          </div>
          <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <input type="text" className="form-input" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Brief description" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Yield</label>
              <input type="text" className="form-input" value={formYield} onChange={(e) => setFormYield(e.target.value)} placeholder="e.g. Makes 1 quart" />
            </div>
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Ingredients *</label>
            {formIngredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                <input type="text" className="form-input" placeholder="Ingredient" value={ing.name}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  style={{ flex: 2 }} />
                <input type="text" className="form-input" placeholder="Amount" value={ing.amount}
                  onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                  style={{ flex: 1 }} />
                <input type="text" className="form-input" placeholder="Unit" value={ing.unit}
                  onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                  style={{ width: 80 }} />
                {formIngredients.length > 1 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => removeIngredientRow(i)} style={{ color: "#DC2626", padding: "4px 8px" }}>✕</button>
                )}
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addIngredientRow} style={{ marginTop: 4 }}>+ Add Ingredient</button>
          </div>

          <div className="form-group">
            <label className="form-label">Instructions</label>
            <textarea className="form-input" rows={3} value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)} placeholder="Step-by-step instructions..." />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowAddForm(false); resetForm(); }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={submitForm} disabled={submitting}>
              {submitting ? "Saving..." : editingRecipe ? "Update Recipe" : "Save Recipe"}
            </button>
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="form-group" style={{ marginBottom: 0, flex: "1 1 200px", maxWidth: 320 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search recipes or ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2" style={{ flexWrap: "nowrap", overflowX: "auto" }}>
          <button className={`tab ${activeCategory === "ALL" ? "active" : ""}`} onClick={() => setActiveCategory("ALL")}>
            All ({recipes.length})
          </button>
          {CATEGORY_ORDER.filter((k) => categoryCounts[k] > 0).map((key) => (
            <button key={key} className={`tab ${activeCategory === key ? "active" : ""}`} onClick={() => setActiveCategory(key)}>
              {CATEGORY_LABELS[key].replace(/^.{2}\s/, "")} ({categoryCounts[key]})
            </button>
          ))}
        </div>
      </div>

      {/* Recipe cards grouped by category */}
      {grouped.map((group) => (
        <div key={group.key} style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", color: "#374151" }}>
            {group.label}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {group.recipes.map((recipe) => {
              const isExpanded = expandedRecipe === recipe.id;
              return (
                <div
                  key={recipe.id}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    border: `1px solid ${group.color.border}`,
                    overflow: "hidden",
                  }}
                >
                  {/* Card header */}
                  <div
                    style={{
                      padding: "14px 16px",
                      background: group.color.bg,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="font-medium text-sm" style={{ marginBottom: 2 }}>{recipe.name}</div>
                      {recipe.description && (
                        <div className="text-xs text-gray" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{recipe.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                      {recipe.yield && <span className="text-xs text-gray">{recipe.yield}</span>}
                      <span
                        style={{
                          fontSize: 10,
                          color: "#6B7280",
                          transition: "transform 0.2s",
                          display: "inline-block",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ padding: "12px 16px" }}>
                      {/* Ingredients */}
                      <div style={{ marginBottom: 12 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Ingredients
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {recipe.ingredients.map((ing, i) => (
                            <div key={i} className="flex justify-between text-sm" style={{ padding: "3px 0", borderBottom: "1px solid #F3F4F6" }}>
                              <span className="font-medium">{ing.name}</span>
                              <span className="text-gray">
                                {ing.amount} {ing.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      {recipe.instructions && (
                        <div style={{ marginBottom: 12 }}>
                          <h4 style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                            Instructions
                          </h4>
                          <p className="text-sm" style={{ lineHeight: 1.6, color: "#374151" }}>{recipe.instructions}</p>
                        </div>
                      )}

                      {/* Manager actions */}
                      {isManager && (
                        <div className="flex gap-2" style={{ justifyContent: "flex-end", borderTop: "1px solid #F3F4F6", paddingTop: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(recipe)}>
                            ✏️ Edit
                          </button>
                          <button className="btn btn-sm" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }} onClick={() => deleteRecipe(recipe.id)}>
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {grouped.length === 0 && (
        <div className="card">
          <div className="empty-state">
            {search ? `No recipes matching "${search}"` : "No recipes found"}
          </div>
        </div>
      )}
    </div>
  );
}