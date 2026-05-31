"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Vendor {
  id: number;
  name: string;
}

interface InvItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  parLevel: number;
  currentStock: number;
  minStock: number;
  reorderQty: number;
  packSize: string | null;
  suggestedCadence: string | null;
  sku: string | null;
  notes: string | null;
  vendorId: number | null;
  vendor: { id: number; name: string } | null;
  inventorySection: string;
  active: boolean;
}

const SECTION_OPTIONS = [
  { value: "KITCHEN_REGULAR", label: "🍳 Kitchen — Regular" },
  { value: "KITCHEN_INFREQUENT", label: "🧂 Kitchen — Infrequent" },
  { value: "PACKAGING", label: "📦 Packaging & Supplies" },
  { value: "BARISTA", label: "☕ Barista & Coffee" },
];

const SECTION_LABELS: Record<string, string> = {
  KITCHEN_REGULAR: "Kitchen Regular",
  KITCHEN_INFREQUENT: "Kitchen Infrequent",
  PACKAGING: "Packaging",
  BARISTA: "Barista",
};

const emptyForm = {
  name: "",
  category: "BOH" as string,
  unit: "case",
  unitCost: 0,
  parLevel: 0,
  currentStock: 0,
  minStock: 0,
  reorderQty: 0,
  vendorId: null as number | null,
  packSize: "",
  suggestedCadence: "",
  sku: "",
  notes: "",
  inventorySection: "KITCHEN_REGULAR" as string,
};

export default function InventoryItemsPage() {
  const [items, setItems] = useState<InvItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, vendorsRes] = await Promise.all([
        fetch("/api/inventory").then((r) => r.json()),
        fetch("/api/inventory/vendors").then((r) => r.json()),
      ]);
      setItems(Array.isArray(itemsRes) ? itemsRes : []);
      setVendors(Array.isArray(vendorsRes) ? vendorsRes : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (item: InvItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      unitCost: item.unitCost,
      parLevel: item.parLevel,
      currentStock: item.currentStock,
      minStock: item.minStock,
      reorderQty: item.reorderQty,
      vendorId: item.vendorId,
      packSize: item.packSize || "",
      suggestedCadence: item.suggestedCadence || "",
      sku: item.sku || "",
      notes: item.notes || "",
      inventorySection: item.inventorySection || "KITCHEN_REGULAR",
    });
    setShowForm(true);
    setError("");
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  };

  const save = async () => {
    if (!form.name.trim()) { setError("Item name is required"); return; }
    setSaving(true);
    setError("");

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name.trim(),
      category: form.category,
      unit: form.unit,
      unitCost: form.unitCost,
      parLevel: form.parLevel,
      currentStock: form.currentStock,
      minStock: form.minStock,
      reorderQty: form.reorderQty,
      vendorId: form.vendorId || null,
      packSize: form.packSize || null,
      suggestedCadence: form.suggestedCadence || null,
      sku: form.sku || null,
      notes: form.notes || null,
      inventorySection: form.inventorySection,
    };

    try {
      const res = await fetch("/api/inventory", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Manage Items</h1></div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>📦 Manage Items</h1>
            <p className="text-sm text-gray">Add, edit, and organize inventory items by vendor.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={openNew}>
              + Add Item
            </button>
            <Link href="/inventory" className="btn btn-secondary btn-sm">
              ← Back to Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card mb-4" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            {editingId ? "Edit Item" : "Add New Item"}
          </h3>
          {error && (
            <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Beef Tallow"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Vendor</label>
              <select
                className="form-input"
                value={form.vendorId ?? ""}
                onChange={(e) => setForm({ ...form, vendorId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">No Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="FOH">Front of House</option>
                <option value="BOH">Back of House</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Unit</label>
              <input
                type="text"
                className="form-input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="e.g. case, each, lb"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pack Size</label>
              <input
                type="text"
                className="form-input"
                value={form.packSize}
                onChange={(e) => setForm({ ...form, packSize: e.target.value })}
                placeholder="e.g. 50 lb case"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">SKU</label>
              <input
                type="text"
                className="form-input"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. 2880383"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Unit Cost ($)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Par Level</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.5"
                value={form.parLevel}
                onChange={(e) => setForm({ ...form, parLevel: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Min Stock (reorder trigger)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.5"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reorder Qty</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.5"
                value={form.reorderQty}
                onChange={(e) => setForm({ ...form, reorderQty: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Stock</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.5"
                value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Suggested Cadence</label>
              <input
                type="text"
                className="form-input"
                value={form.suggestedCadence}
                onChange={(e) => setForm({ ...form, suggestedCadence: e.target.value })}
                placeholder="e.g. 2-3 cases/week"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Section</label>
              <select
                className="form-input"
                value={form.inventorySection}
                onChange={(e) => setForm({ ...form, inventorySection: e.target.value })}
              >
                {SECTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Notes</label>
            <textarea
              className="form-input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="form-group" style={{ maxWidth: 320, marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Items list */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Vendor</th>
                <th>Section</th>
                <th>Category</th>
                <th>Unit Cost</th>
                <th>Par</th>
                <th>On Hand</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-medium text-sm">{item.name}</div>
                    {item.sku && <div className="text-xs text-gray">SKU: {item.sku}</div>}
                  </td>
                  <td><span className="badge badge-blue">{item.vendor?.name || "—"}</span></td>
                  <td>
                    <span className="text-xs">{SECTION_LABELS[item.inventorySection || "KITCHEN_REGULAR"] || item.inventorySection}</span>
                  </td>
                  <td className="text-sm">{item.category}</td>
                  <td className="text-sm">{item.unitCost > 0 ? `$${item.unitCost.toFixed(2)}` : "—"}</td>
                  <td className="text-sm">{item.parLevel}</td>
                  <td className="text-sm">{item.currentStock} {item.unit}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEdit(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8}><div className="empty-state">No items found</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}