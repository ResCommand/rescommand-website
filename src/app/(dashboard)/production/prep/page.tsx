"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Beaker, Settings, Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface PrepItem {
  id?: number;
  name: string;
  category: string;
  categoryColor: string;
  amount: string;
  shelfLifeHours?: number;
}

export default function PrepListPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const [items, setItems] = useState<PrepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrepForm, setShowPrepForm] = useState(false);
  const [editingPrepItem, setEditingPrepItem] = useState<PrepItem | null>(null);
  const [prepFormName, setPrepFormName] = useState("");
  const [prepFormAmount, setPrepFormAmount] = useState("");
  const [prepFormCategory, setPrepFormCategory] = useState("");
  const [prepFormNewCat, setPrepFormNewCat] = useState("");
  const [prepFormShelfLife, setPrepFormShelfLife] = useState("");
  const [prepFormCatColor, setPrepFormCatColor] = useState("#7C3AED");
  const [submittingPrep, setSubmittingPrep] = useState(false);
  const [showPrepCatModal, setShowPrepCatModal] = useState(false);
  const [editingPrepCategory, setEditingPrepCategory] = useState<string | null>(null);
  const [prepCatEditName, setPrepCatEditName] = useState("");
  const [prepCatEditColor, setPrepCatEditColor] = useState("#7C3AED");

  const canEdit = true;

  const fetchPrepItems = async () => {
    try {
      const res = await fetch("/api/prep-items");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          // Fallback defaults
          setItems([
            { name: "Vanilla Glaze", category: "Glazes", categoryColor: "#A855F7", amount: "2x recipe" },
            { name: "Chocolate Glaze", category: "Glazes", categoryColor: "#A855F7", amount: "2x recipe" },
            { name: "Maple Glaze", category: "Glazes", categoryColor: "#A855F7", amount: "1x recipe" },
            { name: "Buttercream", category: "Fillings", categoryColor: "#F59E0B", amount: "5 lbs" },
            { name: "Bavarian Cream", category: "Fillings", categoryColor: "#F59E0B", amount: "3 lbs" },
          ]);
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchPrepItems(); }, []);

  // Group items by category
  const groupedItems = items.reduce<Record<string, PrepItem[]>>((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const resetPrepForm = () => {
    setPrepFormName("");
    setPrepFormAmount("");
    setPrepFormCategory("");
    setPrepFormNewCat("");
    setPrepFormShelfLife("");
    setPrepFormCatColor("#7C3AED");
    setEditingPrepItem(null);
  };

  const openEditPrepItem = (item: PrepItem) => {
    setEditingPrepItem(item);
    setPrepFormName(item.name);
    setPrepFormAmount(item.amount);
    setPrepFormCategory(item.category);
    setPrepFormShelfLife(item.shelfLifeHours ? String(item.shelfLifeHours) : "");
    setPrepFormCatColor(item.categoryColor || "#7C3AED");
    setShowPrepForm(true);
  };

  const savePrepItem = async () => {
    if (!prepFormName.trim()) return;
    setSubmittingPrep(true);
    try {
      const cat = prepFormNewCat.trim() || prepFormCategory || "Other";
      if (editingPrepItem) {
        const dbItems = await fetch("/api/prep-items").then(r => r.json());
        const match = Array.isArray(dbItems) ? dbItems.find((i: PrepItem) => i.name === editingPrepItem.name) : null;
        if (match?.id) {
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
      fetchPrepItems();
    } catch (e) {
      toast.error("Could not save prep item");
    }
    setSubmittingPrep(false);
  };

  const deletePrepItem = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const dbItems = await fetch("/api/prep-items").then(r => r.json());
      const match = Array.isArray(dbItems) ? dbItems.find((i: PrepItem) => i.name === name) : null;
      if (match?.id) {
        await fetch(`/api/prep-items?id=${match.id}`, { method: "DELETE" });
        fetchPrepItems();
      } else {
        setItems(prev => prev.filter(i => i.name !== name));
      }
    } catch { /* ignore */ }
  };

  const renamePrepCategory = async () => {
    if (!editingPrepCategory || !prepCatEditName.trim()) return;
    try {
      const dbItems = await fetch("/api/prep-items").then(r => r.json());
      const toUpdate = Array.isArray(dbItems) ? dbItems.filter((i: PrepItem) => i.category === editingPrepCategory) : [];
      for (const item of toUpdate) {
        await fetch("/api/prep-items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, category: prepCatEditName.trim(), categoryColor: prepCatEditColor }),
        });
      }
      setShowPrepCatEdit(false);
      setEditingPrepCategory(null);
      fetchPrepItems();
    } catch { /* ignore */ }
  };

  const setShowPrepCatEdit = (show: boolean) => {
    if (!show) { setShowPrepCatModal(false); setEditingPrepCategory(null); }
    else setShowPrepCatModal(true);
  };

  const [showPrepCatEditState, setShowPrepCatEditState] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Prep List</h1></div>
        <div className="card"><div className="empty-state">Loading...</div></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>🧪 Prep List</h1>
            <p className="text-gray">Daily prep items, grouped by category</p>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <button className="btn btn-primary btn-sm" onClick={() => { resetPrepForm(); setShowPrepForm(true); }}>
                <Plus size={14} /> Add Prep Item
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPrepCatModal(true)}>
                <Settings size={14} /> Categories
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      {Object.entries(groupedItems).map(([category, catItems]) => {
        const color = catItems[0]?.categoryColor || "#7C3AED";
        return (
          <div key={category} className="card" style={{ borderTop: `4px solid ${color}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3F4F6" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color }}>{category}</h3>
              {canEdit && (
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  setEditingPrepCategory(category);
                  setPrepCatEditName(category);
                  setPrepCatEditColor(color);
                  setShowPrepCatEditState(true);
                }}>
                  <Pencil size={12} /> Rename
                </button>
              )}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  {catItems.some(i => i.shelfLifeHours) && <th>Shelf Life</th>}
                  {canEdit && <th style={{ width: 80 }}></th>}
                </tr>
              </thead>
              <tbody>
                {catItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.amount}</td>
                    {catItems.some(i => i.shelfLifeHours) && (
                      <td className="text-sm text-gray">{item.shelfLifeHours ? `${item.shelfLifeHours}h` : "—"}</td>
                    )}
                    {canEdit && (
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-icon" onClick={() => openEditPrepItem(item)}><Pencil size={14} /></button>
                          <button className="btn btn-icon" onClick={() => deletePrepItem(item.name)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="card">
          <div className="empty-state">No prep items yet. Click &quot;Add Prep Item&quot; to get started.</div>
        </div>
      )}

      {/* Prep Item Modal */}
      {showPrepForm && (
        <div className="modal-backdrop" onClick={() => setShowPrepForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>{editingPrepItem ? "Edit Prep Item" : "Add Prep Item"}</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={prepFormName} onChange={e => setPrepFormName(e.target.value)} placeholder="e.g. Vanilla Glaze" />
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input className="form-input" value={prepFormAmount} onChange={e => setPrepFormAmount(e.target.value)} placeholder="e.g. 2x recipe, 5 lbs" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={prepFormCategory} onChange={e => setPrepFormCategory(e.target.value)}>
                  <option value="">Select existing...</option>
                  {Object.keys(groupedItems).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Or New Category</label>
                <input className="form-input" value={prepFormNewCat} onChange={e => setPrepFormNewCat(e.target.value)} placeholder="e.g. Icings" />
              </div>
              <div className="form-group">
                <label className="form-label">Category Color</label>
                <input type="color" value={prepFormCatColor} onChange={e => setPrepFormCatColor(e.target.value)} style={{ width: 48, height: 36, border: "1px solid #D1D5DB", borderRadius: 8, cursor: "pointer" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Shelf Life (hours)</label>
                <input className="form-input" type="number" value={prepFormShelfLife} onChange={e => setPrepFormShelfLife(e.target.value)} placeholder="e.g. 48" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPrepForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={savePrepItem} disabled={submittingPrep}>{submittingPrep ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Rename Modal */}
      {showPrepCatEditState && editingPrepCategory && (
        <div className="modal-backdrop" onClick={() => setShowPrepCatEditState(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <h2>Rename Category</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input className="form-input" value={prepCatEditName} onChange={e => setPrepCatEditName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input type="color" value={prepCatEditColor} onChange={e => setPrepCatEditColor(e.target.value)} style={{ width: 48, height: 36, border: "1px solid #D1D5DB", borderRadius: 8, cursor: "pointer" }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPrepCatEditState(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={renamePrepCategory}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Category List Modal */}
      {showPrepCatModal && !showPrepCatEditState && (
        <div className="modal-backdrop" onClick={() => setShowPrepCatModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <div className="flex items-center justify-between">
                <h2>Categories</h2>
                <button className="btn btn-icon" onClick={() => setShowPrepCatModal(false)}><X size={16} /></button>
              </div>
            </div>
            <div className="modal-body">
              {Object.keys(groupedItems).map(cat => {
                const color = groupedItems[cat][0]?.categoryColor || "#7C3AED";
                return (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{cat}</span>
                    <button className="btn btn-icon" onClick={() => {
                      setEditingPrepCategory(cat);
                      setPrepCatEditName(cat);
                      setPrepCatEditColor(color);
                      setShowPrepCatEditState(true);
                    }}><Pencil size={14} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
