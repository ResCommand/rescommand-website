"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import IconPicker from "@/components/IconPicker";

interface Vendor {
  id: number;
  name: string;
  role: string | null;
  mainUse: string | null;
  cadence: string | null;
  _count: { inventoryItems: number };
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
  inventorySection: string;
  inventorySectionId?: number | null;
  vendor: { id: number; name: string } | null;
}

interface Section {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
  active: boolean;
  _count?: { items: number };
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function InventoryPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<InvItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeVendor, setActiveVendor] = useState<number | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Section management
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [secName, setSecName] = useState("");
  const [secIcon, setSecIcon] = useState("📦");

  // Weekly count state
  const [lines, setLines] = useState<Map<number, number>>(new Map());
  const [date, setDate] = useState<string>(formatDateISO(getMonday(new Date())));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [parEdits, setParEdits] = useState<Map<number, number>>(new Map());

  const loadData = () => {
    Promise.all([
      fetch("/api/inventory/vendors").then((r) => r.json()),
      fetch("/api/inventory").then((r) => r.json()),
      fetch("/api/inventory/sections").then((r) => r.json()).catch(() => []),
    ])
      .then(([v, i, s]) => {
        const vendorArr = Array.isArray(v) ? v : [];
        const itemArr = Array.isArray(i) ? i : [];
        const secArr = Array.isArray(s) ? s : [];
        setVendors(vendorArr);
        setItems(itemArr);
        setSections(secArr);
        setCollapsed(new Set(secArr.map((sec: Section) => sec.slug)));
        const m = new Map<number, number>();
        itemArr.forEach((item: InvItem) => m.set(item.id, item.currentStock));
        setLines(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  // Section order from DB
  const sectionOrder = sections.map(s => s.slug);
  const sectionLabelMap = Object.fromEntries(sections.map(s => [s.slug, `${s.icon} ${s.name}`]));

  // Section CRUD
  function openSectionCreate() { setEditingSection(null); setSecName(""); setSecIcon("📦"); setShowSectionModal(true); }
  function openSectionEdit(s: Section) { setEditingSection(s); setSecName(s.name); setSecIcon(s.icon); setShowSectionModal(true); }

  async function handleSectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editingSection ? "PUT" : "POST";
      const body = editingSection ? { id: editingSection.id, name: secName, icon: secIcon } : { name: secName, icon: secIcon };
      const r = await fetch("/api/inventory/sections", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { toast.success(editingSection ? "Updated" : "Created"); setShowSectionModal(false); loadData(); }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
  }

  async function handleSectionDelete(id: number) {
    try {
      const r = await fetch(`/api/inventory/sections?id=${id}`, { method: "DELETE" });
      if (r.ok) { toast.success("Deleted"); loadData(); }
      else { const d = await r.json(); toast.error(d.error); }
    } catch { toast.error("Error"); }
  }

  const filtered = items
    .filter((i) => activeVendor === "ALL" || i.vendor?.id === activeVendor)
    .filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const sa = sectionOrder.indexOf(a.inventorySection || "kitchen_regular");
      const sb = sectionOrder.indexOf(b.inventorySection || "kitchen_regular");
      if (sa !== sb) return sa - sb;
      return a.name.localeCompare(b.name);
    });

  const getPar = (item: InvItem) => parEdits.get(item.id) ?? item.parLevel;

  const lowStockCount = items.filter((i) => {
    const onHand = lines.get(i.id) ?? i.currentStock;
    const par = getPar(i);
    return par > 0 && onHand <= i.minStock && i.minStock > 0;
  }).length;

  const totalToOrder = filtered.reduce((sum, i) => {
    const par = getPar(i);
    if (par === 0) return sum;
    const onHand = lines.get(i.id) ?? i.currentStock;
    return sum + Math.max(0, par - onHand);
  }, 0);

  const toggleSection = (section: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const updateLine = (id: number, value: string) => {
    const num = parseFloat(value) || 0;
    setLines((prev) => new Map(prev).set(id, num));
    setSaved(false);
  };

  const updatePar = async (id: number, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setParEdits((prev) => new Map(prev).set(id, num));
    setSaved(false);
    try {
      await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, parLevel: num }),
      });
    } catch {
      // silent — will reflect on next load
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/inventory/counts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          lines: items.map((item) => ({
            inventoryItemId: item.id,
            onHand: lines.get(item.id) ?? item.currentStock,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save count");
      }
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Build grouped sections from DB-driven sections
  const sectionGroups = sectionOrder
    .map((key) => ({
      key,
      label: sectionLabelMap[key] || key,
      items: filtered.filter((i) => (i.inventorySection || "kitchen_regular") === key),
    }))
    .filter((sec) => sec.items.length > 0);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Inventory</h1></div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Inventory</h1>
            <p className="text-sm text-gray">
              {items.length} items across {vendors.length} vendors
              {lowStockCount > 0 && (
                <span className="text-red" style={{ marginLeft: 8 }}>
                  {lowStockCount} low stock
                </span>
              )}
            </p>
          </div>
<div className="flex gap-2" style={{ flexWrap: "wrap" }}>
	            <button onClick={openSectionCreate} className="btn btn-secondary btn-sm">
	              <Settings size={14} /> Sections
	            </button>
	            <Link href="/inventory/items" className="btn btn-secondary btn-sm">
	              ⚙️ Manage Items
	            </Link>
	            <Link href="/inventory/order-requests" className="btn btn-secondary btn-sm">
	              🛒 Order Requests
	            </Link>
	          </div>
        </div>
      </div>

      {/* Count date + status bar — stacked on mobile */}
      <div className="inv-count-bar">
        <div className="inv-count-bar-row">
          <div className="form-group" style={{ marginBottom: 0, flex: "0 0 auto" }}>
            <label className="form-label">Count Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => { setDate(e.target.value); setSaved(false); }}
              style={{ width: 155 }}
            />
          </div>
          <div className="stat-card" style={{ padding: "8px 12px", margin: 0, flex: "1 1 auto", minWidth: 0 }}>
            <div className="flex items-center gap-2" style={{ flexWrap: "nowrap" }}>
              <div>
                <div className="text-xs text-gray">Items</div>
                <div className="font-semibold text-sm">{filtered.length}</div>
              </div>
              <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />
              <div>
                <div className="text-xs text-gray">To Order</div>
                <div className="font-semibold text-sm" style={{ color: totalToOrder > 0 ? "#EA580C" : "#059669" }}>
                  {totalToOrder}
                </div>
              </div>
              <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />
              <div>
                {saved ? (
                  <span className="badge badge-green" style={{ fontSize: 11, padding: "2px 8px" }}>✓ Saved</span>
                ) : (
                  <span className="badge badge-yellow" style={{ fontSize: 11, padding: "2px 8px" }}>Unsaved</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={save}
          disabled={saving}
          style={{ width: "100%", maxWidth: 220 }}
        >
          {saving ? "Saving..." : saved ? "✓ Save Again" : "💾 Save Count"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Vendor tabs */}
      <div className="inv-vendor-tabs">
        <button
          className={`tab ${activeVendor === "ALL" ? "active" : ""}`}
          onClick={() => setActiveVendor("ALL")}
        >
          All ({items.length})
        </button>
        {vendors.map((v) => (
          <button
            key={v.id}
            className={`tab ${activeVendor === v.id ? "active" : ""}`}
            onClick={() => setActiveVendor(v.id)}
          >
            {v.name} ({v._count.inventoryItems})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="form-group" style={{ maxWidth: 320 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Collapsible sectionGroups */}
      {sectionGroups.map((section) => {
        const isCollapsed = collapsed.has(section.key);
        const sectionToOrder = section.items.reduce((sum, i) => {
          const par = getPar(i);
          if (par === 0) return sum;
          const onHand = lines.get(i.id) ?? i.currentStock;
          return sum + Math.max(0, par - onHand);
        }, 0);
        return (
<div key={section.key} className="inv-section-block">
	            {/* Section header */}
	            <div
	              className="inv-section-header"
	              onClick={() => toggleSection(section.key)}
	            >
	              <div className="flex items-center gap-2" style={{ flexWrap: "wrap", minWidth: 0 }}>
	                <span
	                  style={{
	                    fontSize: 11,
	                    color: "#6B7280",
	                    transition: "transform 0.2s",
	                    display: "inline-block",
	                    transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
	                  }}
	                >
	                  ▼
	                </span>
	                <h2 className="inv-section-title">
	                  {section.label}
	                </h2>
	                <span style={{ fontSize: 12, color: "#6B7280" }}>
	                  {section.items.length}
	                </span>
	                {!isCollapsed && sectionToOrder > 0 && (
	                  <span className="badge badge-orange">{sectionToOrder} to order</span>
	                )}
	              </div>
	              {isCollapsed && sectionToOrder > 0 && (
	                <span className="badge badge-orange" style={{ marginTop: 2, marginLeft: 8, flexShrink: 0 }}>to order</span>
	              )}
	            </div>

            {/* Section content (collapsible) */}
            {!isCollapsed && (
              <div className="card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -1 }}>
                {/* Desktop table — hidden on mobile */}
                <div className="table-wrapper inv-table-desktop">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Vendor</th>
                        <th>Pack Size</th>
                        <th>Unit Cost</th>
                        <th style={{ width: 110 }}>On Hand</th>
                        <th>Par Level</th>
                        <th>To Order</th>
                        <th>Cadence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => {
                        const par = getPar(item);
                        const onHand = lines.get(item.id) ?? item.currentStock;
                        const toOrder = par > 0 ? Math.max(0, par - onHand) : 0;
                        const isLow = par > 0 && onHand <= item.minStock && item.minStock > 0;
                        const dimmed = par === 0;
                        return (
                          <tr key={item.id} style={{ opacity: dimmed ? 0.45 : 1 }}>
                            <td>
                              <div className="font-medium text-sm">{item.name}</div>
                              {item.sku && <div className="text-xs text-gray">SKU: {item.sku}</div>}
                            </td>
                            <td>
                              <span className="badge badge-blue">{item.vendor?.name || "—"}</span>
                            </td>
                            <td className="text-sm">{item.packSize || "—"}</td>
                            <td className="text-sm">
                              {item.unitCost > 0 ? `$${item.unitCost.toFixed(2)}` : "—"}
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-input"
                                style={{
                                  width: 90,
                                  padding: "5px 8px",
                                  fontSize: 13,
                                  borderColor: isLow ? "#DC2626" : undefined,
                                  background: isLow ? "#FEF2F2" : undefined,
                                }}
                                min="0"
                                step="0.5"
                                placeholder="0"
                                value={onHand || ""}
                                onChange={(e) => updateLine(item.id, e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-input"
                                style={{
                                  width: 70,
                                  padding: "5px 8px",
                                  fontSize: 13,
                                  borderColor: par === 0 ? "#D1D5DB" : undefined,
                                  color: par === 0 ? "#9CA3AF" : undefined,
                                }}
                                min="0"
                                step="0.5"
                                placeholder="0"
                                value={par || ""}
                                onChange={(e) => updatePar(item.id, e.target.value)}
                                title={par === 0 ? "Set par level above 0 to track this item" : ""}
                              />
                              <span className="text-xs text-gray" style={{ marginLeft: 2 }}>{item.unit}</span>
                            </td>
                            <td>
                              {toOrder > 0 ? (
                                <span className="badge badge-orange">{toOrder} {item.unit}</span>
                              ) : dimmed ? (
                                <span className="text-xs text-gray" style={{ fontStyle: "italic" }}>off</span>
                              ) : (
                                <span className="text-xs text-gray">—</span>
                              )}
                            </td>
                            <td className="text-xs text-gray" style={{ maxWidth: 140 }}>
                              {item.suggestedCadence || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list — hidden on desktop */}
<div className="inv-cards-mobile">
	                  {section.items.map((item) => {
	                    const par = getPar(item);
	                    const onHand = lines.get(item.id) ?? item.currentStock;
	                    const toOrder = par > 0 ? Math.max(0, par - onHand) : 0;
	                    const isLow = par > 0 && onHand <= item.minStock && item.minStock > 0;
	                    const dimmed = par === 0;
	                    return (
	                      <div
	                        key={item.id}
	                        className="inv-card"
	                        style={{ opacity: dimmed ? 0.45 : 1, borderBottom: "1px solid #F1F3F5" }}
	                      >
	                        <div className="flex items-center justify-between mb-1" style={{ gap: 4 }}>
	                          <div className="font-medium text-sm" style={{ flex: 1, marginRight: 4, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
	                          <span className="badge badge-blue" style={{ fontSize: 10, padding: "1px 6px", flexShrink: 0 }}>
	                            {item.vendor?.name || "—"}
	                          </span>
	                        </div>
	                        <div className="flex items-center justify-between" style={{ gap: 6 }}>
	                          <div className="flex items-center" style={{ gap: 6 }}>
	                            <div>
	                              <label className="text-xs text-gray" style={{ display: "block" }}>On Hand</label>
<input
                                type="number"
                                className="form-input"
                                style={{
                                  width: 64, padding: "4px 4px", fontSize: 14,
                                  borderColor: isLow ? "#DC2626" : undefined,
                                  background: isLow ? "#FEF2F2" : undefined,
                                }}
                                min="0" step="0.5" placeholder="0"
                                value={onHand || ""}
                                onChange={(e) => updateLine(item.id, e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray" style={{ display: "block" }}>Par</label>
                              <input
                                type="number"
                                className="form-input"
                                style={{
                                  width: 52, padding: "4px 4px", fontSize: 14,
                                  color: par === 0 ? "#9CA3AF" : undefined,
                                }}
                                min="0" step="0.5" placeholder="0"
                                value={par || ""}
                                onChange={(e) => updatePar(item.id, e.target.value)}
                              />
	                            </div>
	                          </div>
	                          <div style={{ textAlign: "right", flexShrink: 0 }}>
	                            {toOrder > 0 ? (
	                              <span className="badge badge-orange" style={{ fontSize: 11 }}>
	                                +{toOrder} {item.unit}
	                              </span>
	                            ) : dimmed ? (
	                              <span className="text-xs text-gray" style={{ fontStyle: "italic" }}>off</span>
	                            ) : (
	                              <span className="text-xs text-gray">✓</span>
	                            )}
	                            {item.unitCost > 0 && (
	                              <div className="text-xs text-gray" style={{ marginTop: 2 }}>
	                                ${item.unitCost.toFixed(2)}
	                              </div>
	                            )}
	                          </div>
	                        </div>
	                      </div>
	                    );
	                  })}
	                </div>
              </div>
            )}
          </div>
        );
      })}
      {sectionGroups.length === 0 && (
        <div className="card">
          <div className="empty-state">No items found</div>
        </div>
      )}

      {/* Bottom save button (mobile convenience) */}
      <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving..." : saved ? "✓ All Saved" : "💾 Save Changes"}
        </button>
      </div>

      {/* Section Management Modal */}
      {showSectionModal && (
        <div className="modal-backdrop" onClick={() => setShowSectionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>{editingSection ? "Edit Section" : "Manage Sections"}</h2>
            </div>
            <div className="modal-body">
              {/* Existing sections */}
              <div className="space-y-2" style={{ marginBottom: 16 }}>
                {sections.map(s => (
                  <div key={s.id} className="list-item">
                    <span className="font-medium text-sm">{s.icon} {s.name}</span>
                    <span className="text-xs text-gray">{s._count?.items || 0} items</span>
                    <div className="flex gap-1">
                      <button onClick={() => openSectionEdit(s)} className="btn-icon"><Pencil size={12} /></button>
                      <button onClick={() => handleSectionDelete(s.id)} className="btn-icon" style={{ color: "#DC2626" }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Add/Edit form */}
              <form onSubmit={handleSectionSubmit} className="space-y-3">
                <div>
                  <label className="form-label">{editingSection ? "Rename" : "New Section Name"}</label>
                  <input value={secName} onChange={e => setSecName(e.target.value)} required className="form-input" placeholder="e.g. Freezer Items" />
                </div>
                <IconPicker value={secIcon} onChange={setSecIcon} />
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">{editingSection ? "Update" : "Add Section"}</button>
                  {editingSection && <button type="button" onClick={() => { setEditingSection(null); setSecName(""); setSecIcon("📦"); }} className="btn btn-secondary btn-sm">Cancel Edit</button>}
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowSectionModal(false)} className="btn btn-secondary">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}