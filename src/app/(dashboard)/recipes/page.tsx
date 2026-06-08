"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Settings, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import IconPicker from "@/components/IconPicker";
import ImportModal from "@/components/ImportModal";

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

// Default fallback categories — overridden by DB when loaded
const DEFAULT_CATEGORY_ORDER = ["base", "filling", "topping", "general"];
const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  base: "🧈 Base Recipes", filling: "🥧 Fillings & Creams", topping: "🎂 Toppings & Glazes", general: "📋 General",
};
const DEFAULT_CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
  base: { bg: "#FFF7ED", border: "#FED7AA" },
  filling: { bg: "#F5F3FF", border: "#DDD6FE" },
  topping: { bg: "#EFF6FF", border: "#BFDBFE" },
  general: { bg: "#F9FAFB", border: "#E5E7EB" },
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

  // Recipe category management
  const [showCatModal, setShowCatModal] = useState(false);
  const [dbCategories, setDbCategories] = useState<{ id: number; name: string; slug: string; icon: string; color: string; _count?: { recipes: number } }[]>([]);
  const [editCat, setEditCat] = useState<{ id: number; name: string; icon: string; color: string } | null>(null);
  const [catFormName, setCatFormName] = useState("");
  const [catFormIcon, setCatFormIcon] = useState("📋");
  const [catFormColor, setCatFormColor] = useState("#F9FAFB");

  const loadCategories = () => {
    fetch("/api/recipes/categories").then(r => r.json()).then(d => Array.isArray(d) && setDbCategories(d)).catch(() => {});
  };

  useEffect(() => { loadCategories(); }, []);

  // Derived category helpers — use DB when available, fallback to hardcoded
  const categoryOrder = dbCategories.length > 0
    ? dbCategories.map(c => c.slug)
    : DEFAULT_CATEGORY_ORDER;
  const categoryLabels: Record<string, string> = dbCategories.length > 0
    ? Object.fromEntries(dbCategories.map(c => [c.slug, `${c.icon} ${c.name}`]))
    : DEFAULT_CATEGORY_LABELS;
  const categoryColors: Record<string, { bg: string; border: string }> = dbCategories.length > 0
    ? Object.fromEntries(dbCategories.map(c => [c.slug, { bg: c.color || "#F9FAFB", border: "#E5E7EB" }]))
    : DEFAULT_CATEGORY_COLORS;

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("filling");
  const [formDescription, setFormDescription] = useState("");
  const [formYield, setFormYield] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formIngredients, setFormIngredients] = useState<Ingredient[]>([{ name: "", amount: "", unit: "" }]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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
      const ca = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (ca !== 0) return ca;
      return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
    });

  // Group by category
  const grouped = categoryOrder
    .map((key) => ({
      key,
      label: categoryLabels[key] || key,
      color: categoryColors[key] || { bg: "#F9FAFB", border: "#E5E7EB" },
      recipes: filtered.filter((r) => r.category === key),
    }))
    .filter((g) => g.recipes.length > 0);

  const categoryCounts: Record<string, number> = {};
  for (const slug of categoryOrder) {
    categoryCounts[slug] = recipes.filter((r) => r.category === slug).length;
  }

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

  const handleRecipeImport = (data: Record<string, unknown>) => {
    const d = data as {
      name?: string;
      category?: string;
      description?: string | null;
      yield?: string | null;
      ingredients?: { name: string; amount: string; unit: string }[];
      instructions?: string | null;
    };
    setFormName(d.name || "");
    setFormCategory(d.category || "general");
    setFormDescription(d.description || "");
    setFormYield(d.yield || "");
    setFormInstructions(d.instructions || "");
    setFormIngredients(
      d.ingredients && d.ingredients.length > 0
        ? d.ingredients.map((i) => ({ name: i.name || "", amount: i.amount || "", unit: i.unit || "" }))
        : [{ name: "", amount: "", unit: "" }]
    );
    setEditingRecipe(null);
    setShowAddForm(true);
    setFormError("");
    toast.success("Recipe extracted — review and save!");
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
        const errMsg = typeof data.error === "string"
          ? data.error
          : data.error?.fieldErrors
            ? Object.values(data.error.fieldErrors).flat().join(", ")
            : "Failed to save";
        throw new Error(errMsg);
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
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCatModal(true)}>
                <Settings size={14} /> Categories
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowImportModal(true)}
              >
                📷 Import
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { if (showAddForm) { resetForm(); } setShowAddForm(!showAddForm); }}
              >
                {showAddForm ? "✕ Cancel" : "+ Add Recipe"}
              </button>
            </div>
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
                {dbCategories.length > 0
                  ? dbCategories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)
                  : DEFAULT_CATEGORY_ORDER.map(key => <option key={key} value={key}>{DEFAULT_CATEGORY_LABELS[key]}</option>)
                }
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
          {categoryOrder.filter((k) => (categoryCounts[k] || 0) > 0).map((key) => (
            <button key={key} className={`tab ${activeCategory === key ? "active" : ""}`} onClick={() => setActiveCategory(key)}>
              {(categoryLabels[key] || key).replace(/^.{2}\s/, "")} ({categoryCounts[key] || 0})
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

      {/* Category Management Modal */}
      {showCatModal && (
        <div className="modal-backdrop" onClick={() => setShowCatModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Recipe Categories</h2>
            </div>
            <div className="modal-body">
              {/* Existing categories */}
              <div className="space-y-2" style={{ marginBottom: 16 }}>
                {dbCategories.map(c => (
                  <div key={c.id} className="list-item">
                    <span className="font-medium text-sm">{c.icon} {c.name}</span>
                    <span className="text-xs text-gray">{c._count?.recipes || 0} recipes</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditCat({ id: c.id, name: c.name, icon: c.icon, color: c.color }); setCatFormName(c.name); setCatFormIcon(c.icon); setCatFormColor(c.color); }} className="btn-icon"><Pencil size={12} /></button>
                      <button onClick={async () => {
                        if (!confirm(`Delete "${c.name}" category?`)) return;
                        const r = await fetch(`/api/recipes/categories?id=${c.id}`, { method: "DELETE" });
                        if (r.ok) { toast.success("Deleted"); loadCategories(); }
                        else { const d = await r.json(); toast.error(d.error || "Failed"); }
                      }} className="btn-icon" style={{ color: "#DC2626" }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {dbCategories.length === 0 && <p className="text-sm text-gray">No categories yet. Add one below.</p>}
              </div>
              {/* Add/Edit form */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!catFormName.trim()) return;
                try {
                  const method = editCat ? "PUT" : "POST";
                  const body = editCat ? { id: editCat.id, name: catFormName, icon: catFormIcon, color: catFormColor } : { name: catFormName, icon: catFormIcon, color: catFormColor };
                  const r = await fetch("/api/recipes/categories", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                  if (r.ok) { toast.success(editCat ? "Updated" : "Created"); setEditCat(null); setCatFormName(""); setCatFormIcon("📋"); setCatFormColor("#F9FAFB"); loadCategories(); }
                  else { const d = await r.json(); toast.error(d.error || "Failed"); }
                } catch { toast.error("Error"); }
              }} className="space-y-3">
                <div>
                  <label className="form-label">{editCat ? "Rename" : "New Category Name"}</label>
                  <input value={catFormName} onChange={e => setCatFormName(e.target.value)} required className="form-input" placeholder="e.g. Frostings" />
                </div>
                <div className="grid-2" style={{ gap: 8 }}>
                  <IconPicker value={catFormIcon} onChange={setCatFormIcon} />
                  <div>
                    <label className="form-label">Color</label>
                    <input type="color" value={catFormColor} onChange={e => setCatFormColor(e.target.value)} className="form-input" style={{ width: 50, height: 36, padding: 2 }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">{editCat ? "Update" : "Add Category"}</button>
                  {editCat && <button type="button" onClick={() => { setEditCat(null); setCatFormName(""); setCatFormIcon("📋"); setCatFormColor("#F9FAFB"); }} className="btn btn-secondary btn-sm">Cancel Edit</button>}
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCatModal(false)} className="btn btn-secondary">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Recipe Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Recipe"
        description="Upload a photo of a recipe card, production sheet, or written recipe. We'll extract the details for you to review."
        importEndpoint="/api/recipes/import"
        onImportComplete={handleRecipeImport}
      />
    </div>
  );
}