"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import ImportModal from "@/components/ImportModal";
import InventoryNav from "@/components/inventory/InventoryNav";
import { toast } from "sonner";

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

const DEFAULT_SECTION_OPTIONS = [
  { value: "kitchen_regular", label: "🍳 Kitchen — Regular" },
  { value: "kitchen_infrequent", label: "🧂 Kitchen — Infrequent" },
  { value: "packaging", label: "📦 Packaging & Supplies" },
  { value: "barista", label: "☕ Barista & Coffee" },
];

const DEFAULT_SECTION_LABELS: Record<string, string> = {
  kitchen_regular: "Kitchen Regular",
  kitchen_infrequent: "Kitchen Infrequent",
  packaging: "Packaging",
  barista: "Barista",
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
  inventorySection: "",
};

interface Section {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
  active: boolean;
}

export default function InventoryItemsPage() {
  const [items, setItems] = useState<InvItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

  // Sorting + pagination
  const [sortKey, setSortKey] = useState<keyof InvItem | "vendorName" | "sectionName">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Progressive disclosure
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Scroll to form when it opens
  const formRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, vendorsRes, sectionsRes] = await Promise.all([
        fetch("/api/inventory").then((r) => r.json()),
        fetch("/api/inventory/vendors").then((r) => r.json()),
        fetch("/api/inventory/sections").then((r) => r.json()).catch(() => []),
      ]);
      setItems(Array.isArray(itemsRes) ? itemsRes : []);
      setVendors(Array.isArray(vendorsRes) ? vendorsRes : []);
      setSections(Array.isArray(sectionsRes) ? sectionsRes : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Scroll to top when form opens
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  // Set default section when sections load and form is empty
  useEffect(() => {
    if (sections.length > 0 && !form.inventorySection) {
      setForm(f => ({ ...f, inventorySection: sections[0].slug }));
    }
  }, [sections, form.inventorySection]);

  // Build section lookup from DB sections (fallback to hardcoded)
  const sectionOptions = sections.length > 0
    ? sections.map(s => ({ value: s.slug, label: `${s.icon} ${s.name}` }))
    : DEFAULT_SECTION_OPTIONS;
  const sectionLabels: Record<string, string> = sections.length > 0
    ? Object.fromEntries(sections.map(s => [s.slug, s.name]))
    : DEFAULT_SECTION_LABELS;

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getSortValue = (item: InvItem): string | number => {
    switch (sortKey) {
      case "vendorName": return item.vendor?.name || "zzz";
      case "sectionName": return sectionLabels[item.inventorySection] || item.inventorySection;
      case "name": return item.name.toLowerCase();
      case "unitCost": return item.unitCost;
      case "parLevel": return item.parLevel;
      case "currentStock": return item.currentStock;
      default: return (item[sortKey] as string | number) ?? "";
    }
  };

  const filtered = items
    .filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = getSortValue(a);
      const vb = getSortValue(b);
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
      inventorySection: item.inventorySection || sections[0]?.slug || "",
    });
    // Auto-expand advanced if any of those fields have data
    setShowAdvanced(!!(item.sku || item.packSize || item.suggestedCadence || item.notes));
    setShowForm(true);
    setError("");
  };

  const openNew = () => {
    setEditingId(null);
    setShowAdvanced(false);
    // Default to most-used section
    const sectionCounts: Record<string, number> = {};
    items.forEach((i) => { sectionCounts[i.inventorySection] = (sectionCounts[i.inventorySection] || 0) + 1; });
    const mostUsed = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || sections[0]?.slug || "kitchen_regular";
    setForm({ ...emptyForm, inventorySection: mostUsed });
    setShowForm(true);
    setError("");
  };

  const handleInventoryImport = (data: Record<string, unknown>) => {
    const d = data as {
      items?: {
        name?: string;
        category?: string;
        unit?: string;
        unitCost?: number;
        parLevel?: number;
        minStock?: number;
        reorderQty?: number;
        packSize?: string;
        sku?: string;
        vendorName?: string | null;
        notes?: string | null;
      }[];
    };

    const items = d.items || [];
    if (items.length === 0) {
      toast.error("No items found in the image");
      return;
    }

    // For single item, fill the form directly
    if (items.length === 1) {
      const item = items[0];
      // Try to match vendor by name
      let vendorId: number | null = null;
      if (item.vendorName && vendors.length > 0) {
        const match = vendors.find(
          (v) => v.name.toLowerCase().includes(item.vendorName!.toLowerCase())
        );
        if (match) vendorId = match.id;
      }
      setForm({
        name: item.name || "",
        category: ["FOH", "BOH", "BOTH"].includes(item.category || "") ? item.category! : "BOH",
        unit: item.unit || "case",
        unitCost: item.unitCost || 0,
        parLevel: item.parLevel || 0,
        currentStock: 0,
        minStock: item.minStock || 0,
        reorderQty: item.reorderQty || 0,
        vendorId,
        packSize: item.packSize || "",
        suggestedCadence: "",
        sku: item.sku || "",
        notes: item.notes || "",
        inventorySection: sections.length > 0 ? sections[0].slug : "kitchen_regular",
      });
      setEditingId(null);
      setShowForm(true);
      setError("");
      toast.success("Item extracted — review and save!");
    } else {
      // Multiple items — create them all directly
      (async () => {
        let created = 0;
        for (const item of items) {
          try {
            await fetch("/api/inventory", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: item.name || "Unknown Item",
                category: ["FOH", "BOH", "BOTH"].includes(item.category || "") ? item.category : "BOH",
                unit: item.unit || "case",
                unitCost: item.unitCost || 0,
                parLevel: item.parLevel || 0,
                currentStock: 0,
                minStock: item.minStock || 0,
                reorderQty: item.reorderQty || 0,
                packSize: item.packSize || null,
                sku: item.sku || null,
                notes: item.notes || null,
                inventorySection: sections.length > 0 ? sections[0].slug : "kitchen_regular",
              }),
            });
            created++;
          } catch { /* skip failed */ }
        }
        toast.success(`Imported ${created} of ${items.length} items`);
        fetchData();
      })();
    }
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

  const handleDelete = async (item: InvItem) => {
    if (!confirm(`Delete "${item.name}"? This will hide it from inventory and counts.`)) return;
    try {
      const res = await fetch(`/api/inventory?id=${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete");
      }
      toast.success(`"${item.name}" deleted`);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
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
            <h1>Manage Items</h1>
            <p className="text-sm text-gray">Add, edit, and organize inventory items by vendor.</p>
          </div>
          <div className="inv-items-header-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowImportModal(true)}
            >
              📷 Import
            </button>
            <button className="btn btn-primary btn-sm" onClick={openNew}>
              + Add Item
            </button>
          </div>
        </div>
      </div>

      <InventoryNav />

      {/* Add/Edit form */}
      {showForm && (
        <div ref={formRef} className="card mb-4 inv-items-form-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            {editingId ? "Edit Item" : "Add New Item"}
          </h3>
          {error && (
            <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {/* Essential fields */}
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Item Name *</label>
              <input type="text" className="form-input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Beef Tallow" />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Vendor</label>
              <select className="form-input" value={form.vendorId ?? ""}
                onChange={(e) => setForm({ ...form, vendorId: e.target.value ? Number(e.target.value) : null })}>
                <option value="">No Vendor</option>
                {vendors.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Section</label>
              <select className="form-input" value={form.inventorySection}
                onChange={(e) => setForm({ ...form, inventorySection: e.target.value })}>
                {sectionOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Unit</label>
              <input type="text" className="form-input" value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="e.g. case, each, lb" />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Unit Cost ($)</label>
              <input type="number" className="form-input" min="0" step="0.01" value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Par Level</label>
              <input type="number" className="form-input" min="0" step="0.5" value={form.parLevel}
                onChange={(e) => setForm({ ...form, parLevel: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Min Stock (reorder trigger)</label>
              <input type="number" className="form-input" min="0" step="0.5" value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Stock</label>
              <input type="number" className="form-input" min="0" step="0.5" value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              marginTop: 12, background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: "#7C3AED", padding: "4px 0",
            }}
          >
            {showAdvanced ? "▼ Hide advanced fields" : "▶ Show advanced fields"}
          </button>

          {/* Advanced fields */}
          {showAdvanced && (
            <div className="grid-2" style={{ gap: 16, marginTop: 16 }}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">SKU</label>
                <input type="text" className="form-input" value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. 2880383" />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Pack Size</label>
                <input type="text" className="form-input" value={form.packSize}
                  onChange={(e) => setForm({ ...form, packSize: e.target.value })}
                  placeholder="e.g. 50 lb case" />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Suggested Cadence</label>
                <input type="text" className="form-input" value={form.suggestedCadence}
                  onChange={(e) => setForm({ ...form, suggestedCadence: e.target.value })}
                  placeholder="e.g. 2-3 cases/week" />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="FOH">Front of House</option>
                  <option value="BOH">Back of House</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            </div>
          )}
          {showAdvanced && (
            <div className="form-group" style={{ marginTop: 0, marginBottom: 0 }}>
              <label className="form-label">Notes</label>
              <textarea className="form-input" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes..." rows={3} />
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #F1F3F5", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="form-group inv-items-search" style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search items..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Items list — Desktop table */}
      <div className="card">
        <div className="table-wrapper inv-table-desktop">
          <table>
            <thead>
              <tr>
                {([
                  { key: "name", label: "Item" },
                  { key: "vendorName", label: "Vendor" },
                  { key: "sectionName", label: "Section" },
                  { key: "category", label: "Category" },
                  { key: "unitCost", label: "Unit Cost" },
                  { key: "parLevel", label: "Par" },
                  { key: "currentStock", label: "On Hand" },
                ] as const).map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span style={{ marginLeft: 2 }}>{sortDir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-medium text-sm">{item.name}</div>
                    {item.sku && <div className="text-xs text-gray">SKU: {item.sku}</div>}
                  </td>
                  <td><span className="badge badge-blue">{item.vendor?.name || "—"}</span></td>
                  <td>
                    <span className="text-xs">{sectionLabels[item.inventorySection] || item.inventorySection}</span>
                  </td>
                  <td className="text-sm">{item.category}</td>
                  <td className="text-sm">{item.unitCost > 0 ? `$${item.unitCost.toFixed(2)}` : "—"}</td>
                  <td className="text-sm">{item.parLevel}</td>
                  <td className="text-sm">{item.currentStock} {item.unit}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(item)}
                        style={{ color: "#DC2626" }}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={8}><div className="empty-state">No items found</div></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Items list — Mobile cards */}
        <div className="inv-cards-mobile">
          {paginated.map((item) => {
            const isLow = item.parLevel > 0 && item.currentStock <= item.minStock && item.minStock > 0;
            return (
              <div
                key={item.id}
                className="inv-card"
                style={{ borderBottom: "1px solid #F1F3F5" }}
              >
                <div className="flex items-center justify-between" style={{ gap: 4, marginBottom: 6 }}>
                  <div className="font-medium text-sm" style={{ flex: 1, marginRight: 4, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.name}
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: 10, padding: "1px 6px", flexShrink: 0 }}>
                    {item.vendor?.name || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between" style={{ gap: 6 }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <div>
                      <div className="text-xs text-gray">On Hand</div>
                      <div className="font-semibold text-sm" style={{ color: isLow ? "#DC2626" : undefined }}>
                        {item.currentStock} <span className="text-xs text-gray">{item.unit}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray">Par</div>
                      <div className="font-semibold text-sm">{item.parLevel}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray">Cost</div>
                      <div className="text-sm">{item.unitCost > 0 ? `$${item.unitCost.toFixed(2)}` : "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: 4 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEdit(item)}
                      style={{ flexShrink: 0 }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(item)}
                      style={{ flexShrink: 0, color: "#DC2626" }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                  <span className="text-xs text-gray">{sectionLabels[item.inventorySection] || item.inventorySection}</span>
                  <span className="text-xs text-gray">·</span>
                  <span className="text-xs text-gray">{item.category}</span>
                  {item.sku && (
                    <>
                      <span className="text-xs text-gray">·</span>
                      <span className="text-xs text-gray">SKU: {item.sku}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="empty-state">No items found</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  minWidth: 32, height: 32, borderRadius: 6, border: "none",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: p === currentPage ? "#7C3AED" : "#F3F4F6",
                  color: p === currentPage ? "#fff" : "#6B7280",
                }}
              >
                {p}
              </button>
            ))}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}

        {/* Item count footer */}
        <div style={{ textAlign: "center", padding: "8px 0 0", fontSize: 12, color: "#9CA3AF" }}>
          Showing {paginated.length} of {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </div>
      </div>

      {/* Import Inventory Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Inventory"
        description="Upload a photo of an invoice, order sheet, supply list, or product label. We'll extract the item details."
        importEndpoint="/api/inventory/import"
        onImportComplete={handleInventoryImport}
      />
    </div>
  );
}