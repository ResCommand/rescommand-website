"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Settings, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import IconPicker from "@/components/IconPicker";
import InventoryNav from "@/components/inventory/InventoryNav";
import { roundToPackSize } from "@/lib/packSize";

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
  const [countedItems, setCountedItems] = useState<Set<number>>(new Set());

  // Section management
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [secName, setSecName] = useState("");
  const [secIcon, setSecIcon] = useState("📦");

  // Vendor management
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorForm, setVendorForm] = useState({ name: "", role: "", mainUse: "", cadence: "", contactInfo: "" });

  // Generate Orders state
  const [showGenOrders, setShowGenOrders] = useState(false);
  const [genOrdersLoading, setGenOrdersLoading] = useState(false);
  const [genOrdersResult, setGenOrdersResult] = useState<{ created: number; skipped: number } | null>(null);

  // Slide-over edit drawer state
  const [editDrawerItem, setEditDrawerItem] = useState<InvItem | null>(null);
  const [drawerMode, setDrawerMode] = useState<"edit" | "create">("edit");
  const [editForm, setEditForm] = useState({
    name: "", category: "BOH", unit: "case", unitCost: 0, parLevel: 0,
    minStock: 0, currentStock: 0, packSize: "", sku: "", notes: "",
    suggestedCadence: "", vendorId: null as number | null,
    inventorySection: "kitchen_regular",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [showEditAdvanced, setShowEditAdvanced] = useState(false);

  const blankForm = () => ({
    name: "", category: "BOH", unit: "case", unitCost: 0, parLevel: 0,
    minStock: 0, currentStock: 0, packSize: "", sku: "", notes: "",
    suggestedCadence: "", vendorId: null as number | null,
    inventorySection: sections[0]?.slug || "kitchen_regular",
  });

  const openEditDrawer = (item: InvItem) => {
    setDrawerMode("edit");
    setEditDrawerItem(item);
    setEditForm({
      name: item.name, category: item.category, unit: item.unit,
      unitCost: item.unitCost, parLevel: item.parLevel, minStock: item.minStock,
      currentStock: item.currentStock,
      packSize: item.packSize || "", sku: item.sku || "", notes: item.notes || "",
      suggestedCadence: item.suggestedCadence || "", vendorId: item.vendor?.id ?? null,
      inventorySection: item.inventorySection || "kitchen_regular",
    });
    setShowEditAdvanced(!!(item.sku || item.packSize || item.suggestedCadence || item.notes));
    setEditError("");
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setEditDrawerItem(null);
    setEditForm(blankForm());
    setShowEditAdvanced(false);
    setEditError("");
  };

  const closeEditDrawer = () => {
    setEditDrawerItem(null);
    setDrawerMode("edit");
    setEditError("");
  };

  const deleteFromDrawer = async () => {
    if (!editDrawerItem) return;
    if (!confirm(`Delete "${editDrawerItem.name}"? This will hide it from inventory.`)) return;
    try {
      const res = await fetch(`/api/inventory?id=${editDrawerItem.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete");
      }
      toast.success("Deleted");
      setEditDrawerItem(null);
      loadData();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const saveEditDrawer = async () => {
    if (!editForm.name.trim()) { setEditError("Name is required"); return; }
    setEditSaving(true);
    setEditError("");
    try {
      const payload = {
        name: editForm.name.trim(),
        category: editForm.category,
        unit: editForm.unit,
        unitCost: editForm.unitCost,
        parLevel: editForm.parLevel,
        minStock: editForm.minStock,
        currentStock: editForm.currentStock,
        packSize: editForm.packSize || null,
        sku: editForm.sku || null,
        notes: editForm.notes || null,
        suggestedCadence: editForm.suggestedCadence || null,
        vendorId: editForm.vendorId,
        inventorySection: editForm.inventorySection,
        ...(drawerMode === "edit" && editDrawerItem ? { id: editDrawerItem.id } : {}),
      };
      const res = await fetch("/api/inventory", {
        method: drawerMode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = typeof data.error === "string" ? data.error : "Validation error — check your fields";
        throw new Error(msg);
      }
      toast.success(drawerMode === "edit" ? "Updated" : "Created");
      setEditDrawerItem(null);
      setDrawerMode("edit");
      loadData();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setEditSaving(false);
    }
  };

  // Weekly count state
  const [lines, setLines] = useState<Map<number, number>>(new Map());
  const [date, setDate] = useState<string>(formatDateISO(getMonday(new Date())));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [parEdits, setParEdits] = useState<Map<number, number>>(new Map());

  // Track refs for Enter-to-next-row keyboard navigation
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const setInputRef = useCallback((key: string, el: HTMLInputElement | null) => {
    if (el) inputRefs.current.set(key, el);
    else inputRefs.current.delete(key);
  }, []);

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
        if (secArr.length > 0) {
          const firstSlug = secArr[0].slug;
          setCollapsed(new Set(secArr.slice(1).map((sec: Section) => sec.slug)));
        }
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

  // Vendor CRUD
  function openVendorCreate() {
    setEditingVendor(null);
    setVendorForm({ name: "", role: "", mainUse: "", cadence: "", contactInfo: "" });
    setShowVendorModal(true);
  }
  function openVendorEdit(v: Vendor) {
    setEditingVendor(v);
    setVendorForm({
      name: v.name,
      role: v.role || "",
      mainUse: v.mainUse || "",
      cadence: v.cadence || "",
      contactInfo: "",
    });
    setShowVendorModal(true);
  }
  async function handleVendorSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, string> = { name: vendorForm.name };
    if (vendorForm.role) payload.role = vendorForm.role;
    if (vendorForm.mainUse) payload.mainUse = vendorForm.mainUse;
    if (vendorForm.cadence) payload.cadence = vendorForm.cadence;
    if (vendorForm.contactInfo) payload.contactInfo = vendorForm.contactInfo;
    try {
      const method = editingVendor ? "PUT" : "POST";
      const body = editingVendor ? { id: editingVendor.id, ...payload } : payload;
      const r = await fetch("/api/inventory/vendors", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (r.ok) {
        toast.success(editingVendor ? "Updated" : "Created");
        setShowVendorModal(false);
        setEditingVendor(null);
        setVendorForm({ name: "", role: "", mainUse: "", cadence: "", contactInfo: "" });
        loadData();
      }
      else { const d = await r.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Error"); }
  }

  async function handleVendorDelete(id: number) {
    try {
      const r = await fetch(`/api/inventory/vendors?id=${id}`, { method: "DELETE" });
      if (r.ok) { toast.success("Deleted"); loadData(); }
      else { const d = await r.json(); toast.error(d.error); }
    } catch { toast.error("Error"); }
  }

  function handleGenerateOrders() {
    setGenOrdersResult(null);
    setShowGenOrders(true);
  }

  async function confirmGenerateOrders() {
    setGenOrdersLoading(true);
    try {
      const res = await fetch("/api/inventory/generate-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate orders");
      setGenOrdersResult({ created: data.created, skipped: data.skipped });
      if (data.created > 0) toast.success(`Created ${data.created} order request(s)`);
      else toast.info("No items below par or all already requested");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setGenOrdersResult(null);
    } finally {
      setGenOrdersLoading(false);
    }
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
    const raw = Math.max(0, par - onHand);
    const { qty } = roundToPackSize(raw, i.packSize);
    return sum + qty;
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
    setCountedItems((prev) => new Set(prev).add(id));
    setSaved(false);
  };

  // Enter key → focus next row's On Hand input
  const handleEnterKey = (e: React.KeyboardEvent, itemId: number) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    // Find next item in the same flat sorted list
    const sortedIds = filtered.map(i => i.id);
    const idx = sortedIds.indexOf(itemId);
    if (idx >= 0 && idx < sortedIds.length - 1) {
      const nextId = sortedIds[idx + 1];
      const nextInput = inputRefs.current.get(`onhand-${nextId}`);
      nextInput?.focus();
      nextInput?.select();
    }
  };

  const parTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const updatePar = (id: number, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setParEdits((prev) => new Map(prev).set(id, num));
    setSaved(false);
    const existing = parTimers.current.get(id);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/inventory", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, parLevel: num }),
        });
      } catch {
        // silent — will reflect on next load
      }
      parTimers.current.delete(id);
    }, 800);
    parTimers.current.set(id, timer);
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

  // Track counted items per section
  const getSectionProgress = (secItems: InvItem[]) => {
    if (secItems.length === 0) return { counted: 0, total: 0 };
    const counted = secItems.filter(i => countedItems.has(i.id)).length;
    return { counted, total: secItems.length };
  };

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
      {/* Header — cleaned up: title + stats + single settings button */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Inventory</h1>
            <p className="text-sm text-gray">
              {items.length} items · {vendors.length} vendors
              {lowStockCount > 0 && (
                <span className="inv-status-low" style={{ marginLeft: 8, verticalAlign: "middle" }}>
                  {lowStockCount} low stock
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
            <button onClick={openCreateDrawer} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Item
            </button>
            <button onClick={() => setShowVendorModal(true)} className="btn btn-secondary btn-sm">
              <Settings size={14} /> Settings
            </button>
          </div>
        </div>
      </div>

      {/* Shared Tab Navigation */}
      <InventoryNav />

      {/* Sticky unsaved changes pill */}
      {!saved && countedItems.size > 0 && (
        <div className="inv-unsaved-pill">
          <span>⚠️ {countedItems.size} unsaved {countedItems.size === 1 ? "change" : "changes"}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={save}
            disabled={saving}
            style={{ marginLeft: "auto" }}
          >
            {saving ? "Saving..." : "Save Count"}
          </button>
        </div>
      )}

      {/* Count date + status bar */}
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
                  {totalToOrder.toLocaleString()} <span className="text-xs text-gray">units</span>
                </div>
              </div>
              <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />
              <div>
                {saved ? (
                  <span className="inv-status-ok">✓ Saved</span>
                ) : (
                  <span className="badge badge-gray" style={{ fontSize: 11, padding: "2px 8px" }}>
                    {countedItems.size > 0 ? `${countedItems.size} changed` : "No changes"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleGenerateOrders}
            >
              🛒 Generate Orders
            </button>
          </div>
        </div>
      </div>

      {/* At-par celebration */}
      {totalToOrder === 0 && items.length > 0 && (
        <div className="inv-all-at-par" style={{ marginBottom: 16 }}>
          <div className="inv-all-at-par-icon">✅</div>
          <div className="inv-all-at-par-title">All items at or above par!</div>
          <div className="inv-all-at-par-sub">No orders needed this cycle.</div>
        </div>
      )}

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
      <div className="form-group" style={{ maxWidth: 320, marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Collapsible sections */}
      {sectionGroups.map((section) => {
        const isCollapsed = collapsed.has(section.key);
        const sectionToOrder = section.items.reduce((sum, i) => {
          const par = getPar(i);
          if (par === 0) return sum;
          const onHand = lines.get(i.id) ?? i.currentStock;
          return sum + Math.max(0, par - onHand);
        }, 0);
        const progress = getSectionProgress(section.items);
        const allCounted = progress.counted === progress.total;
        return (
          <div key={section.key} className="inv-section-block">
            {/* Section header */}
            <div className="inv-section-header" onClick={() => toggleSection(section.key)}>
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
                <h2 className="inv-section-title">{section.label}</h2>
                <span style={{ fontSize: 12, color: "#6B7280" }}>
                  {section.items.length}
                </span>
                {/* Count progress badge */}
                {progress.counted > 0 && (
                  <span className={`inv-count-progress ${allCounted ? "inv-count-progress-complete" : ""}`}>
                    {allCounted ? "✓" : `${progress.counted}/${progress.total}`}
                  </span>
                )}
                {!isCollapsed && sectionToOrder > 0 && (
                  <span className="inv-status-order">{sectionToOrder} to order</span>
                )}
              </div>
              {isCollapsed && sectionToOrder > 0 && (
                <span className="inv-status-order" style={{ marginTop: 2, marginLeft: 8, flexShrink: 0 }}>to order</span>
              )}
            </div>

            {/* Section content (collapsible) */}
            {!isCollapsed && (
              <div className="card card-table" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -1 }}>
                {/* Desktop table — redesigned 6 columns */}
                <div className="table-wrapper inv-table-desktop">
                  <table className="inv-count-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ width: 110 }}>On Hand</th>
                        <th style={{ width: 120 }}>Par Level</th>
                        <th style={{ width: 130 }}>To Order</th>
                        <th style={{ width: 90 }}>Status</th>
                        <th style={{ width: 50 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => {
                        const par = getPar(item);
                        const onHand = lines.get(item.id) ?? item.currentStock;
                        const rawToOrder = par > 0 ? Math.max(0, par - onHand) : 0;
                        const { qty: toOrder, cases, rounded } = roundToPackSize(rawToOrder, item.packSize);
                        const isLow = par > 0 && onHand <= item.minStock && item.minStock > 0;
                        const dimmed = par === 0;
                        const atPar = par > 0 && toOrder === 0 && !isLow;
                        const rowClass = isLow ? "inv-row-low-stock" : atPar ? "inv-row-at-par" : "";
                        return (
                          <tr key={item.id} className={rowClass} style={{ opacity: dimmed ? 0.45 : undefined }}>
                            <td>
                              <div className="inv-item-name">{item.name}</div>
                              <div className="inv-item-subtitle">
                                {item.vendor && <span>{item.vendor.name}</span>}
                                {item.vendor && item.unitCost > 0 && <span>·</span>}
                                {item.unitCost > 0 && <span>${item.unitCost.toFixed(2)}/{item.unit}</span>}
                                {item.sku && <span>· SKU: {item.sku}</span>}
                              </div>
                            </td>
                            <td>
                              <input
                                ref={(el) => setInputRef(`onhand-${item.id}`, el)}
                                type="number"
                                className="inv-num-input"
                                min="0"
                                step="0.5"
                                inputMode="decimal"
                                placeholder="0"
                                value={onHand || ""}
                                onChange={(e) => updateLine(item.id, e.target.value)}
                                onKeyDown={(e) => handleEnterKey(e, item.id)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="inv-num-input"
                                style={{
                                  width: 70,
                                  color: par === 0 ? "var(--rc-text-light)" : undefined,
                                }}
                                min="0"
                                step="0.5"
                                inputMode="decimal"
                                placeholder="0"
                                value={par || ""}
                                onChange={(e) => updatePar(item.id, e.target.value)}
                                title={par === 0 ? "Set par level above 0 to track this item" : ""}
                              />
                              <span className="text-xs text-gray" style={{ marginLeft: 4 }}>{item.unit}</span>
                            </td>
                            <td>
                              {toOrder > 0 ? (
                                <div>
                                  <span className="inv-status-order">{toOrder} {item.unit}</span>
                                  {cases && rounded && (
                                    <div className="text-xs text-gray" style={{ marginTop: 2 }}>
                                      {cases} case{cases !== 1 ? "s" : ""} · {item.packSize}
                                    </div>
                                  )}
                                </div>
                              ) : dimmed ? (
                                <span className="inv-status-off">Off</span>
                              ) : (
                                <span className="text-xs text-gray">—</span>
                              )}
                            </td>
                            <td>
                              {isLow ? (
                                <span className="inv-status-low">Low</span>
                              ) : atPar ? (
                                <span className="inv-status-ok">✓ OK</span>
                              ) : toOrder > 0 ? (
                                <span className="inv-status-order">Order</span>
                              ) : (
                                <span className="inv-status-off">—</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn-icon"
                                onClick={() => openEditDrawer(item)}
                                title="Edit item"
                              >
                                <Pencil size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
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
                        className={`inv-card ${isLow ? "inv-row-low-stock" : ""}`}
                        style={{ opacity: dimmed ? 0.45 : 1, borderBottom: "1px solid #F1F3F5", padding: "12px 16px" }}
                      >
                        <div className="flex items-center justify-between mb-1" style={{ gap: 4 }}>
                          <div className="inv-item-name" style={{ flex: 1, marginRight: 4, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.name}
                          </div>
                          <button
                            className="btn-icon"
                            onClick={() => openEditDrawer(item)}
                            title="Edit item"
                            style={{ flexShrink: 0 }}
                          >
                            <Pencil size={14} />
                          </button>
                          {isLow && <span className="inv-status-low">Low</span>}
                          {toOrder > 0 && !isLow && <span className="inv-status-order">+{toOrder} {item.unit}</span>}
                          {!isLow && toOrder === 0 && par > 0 && <span className="inv-status-ok">✓</span>}
                        </div>
                        <div className="inv-item-subtitle" style={{ marginBottom: 8 }}>
                          {item.vendor && <span>{item.vendor.name}</span>}
                          {item.unitCost > 0 && <span>· ${item.unitCost.toFixed(2)}</span>}
                        </div>
                        <div className="flex items-center justify-between" style={{ gap: 8 }}>
                          <div className="flex items-center" style={{ gap: 8 }}>
                            <div>
                              <label className="text-xs text-gray" style={{ display: "block" }}>On Hand</label>
                              <input
                                ref={(el) => setInputRef(`onhand-${item.id}`, el)}
                                type="number"
                                className="inv-num-input"
                                style={{ width: 72, fontSize: 15 }}
                                min="0"
                                step="0.5"
                                inputMode="decimal"
                                placeholder="0"
                                value={onHand || ""}
                                onChange={(e) => updateLine(item.id, e.target.value)}
                                onKeyDown={(e) => handleEnterKey(e, item.id)}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray" style={{ display: "block" }}>Par</label>
                              <input
                                type="number"
                                className="inv-num-input"
                                style={{
                                  width: 60, fontSize: 15,
                                  color: par === 0 ? "var(--rc-text-light)" : undefined,
                                }}
                                min="0"
                                step="0.5"
                                inputMode="decimal"
                                placeholder="0"
                                value={par || ""}
                                onChange={(e) => updatePar(item.id, e.target.value)}
                              />
                            </div>
                          </div>
                          {toOrder > 0 && (
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <span className="inv-status-order" style={{ fontSize: 11 }}>
                                +{toOrder} {item.unit}
                              </span>
                              {item.unitCost > 0 && (
                                <div className="text-xs text-gray" style={{ marginTop: 2 }}>
                                  ≈ ${(toOrder * item.unitCost).toFixed(2)}
                                </div>
                              )}
                            </div>
                          )}
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

      {/* Section Management Modal */}
      {showSectionModal && (
        <div className="modal-backdrop" onClick={() => setShowSectionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>{editingSection ? "Edit Section" : "Manage Sections"}</h2>
            </div>
            <div className="modal-body">
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

      {/* Vendor Management Modal */}
      {showVendorModal && (
        <div className="modal-backdrop" onClick={() => setShowVendorModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>{editingVendor ? "Edit Vendor" : "Manage Vendors & Sections"}</h2>
            </div>
            <div className="modal-body">
              {/* Tabs within settings: Vendors / Sections */}
              {!editingVendor && !editingSection && (
                <div className="tabs" style={{ marginBottom: 16 }}>
                  <button
                    className={`tab active`}
                    style={{ cursor: "default" }}
                  >
                    Vendors
                  </button>
                  <button
                    className={`tab`}
                    onClick={() => { setShowVendorModal(false); setShowSectionModal(true); }}
                  >
                    Sections
                  </button>
                </div>
              )}
              {/* Existing vendors */}
              {!editingVendor && (
                <div className="space-y-2" style={{ marginBottom: 16 }}>
                  {vendors.map(v => (
                    <div key={v.id} className="list-item">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="font-medium text-sm">{v.name}</span>
                        {v.role && <span className="text-xs text-gray" style={{ marginLeft: 6 }}>{v.role}</span>}
                      </div>
                      <span className="text-xs text-gray">{v._count?.inventoryItems || 0} items</span>
                      <div className="flex gap-1">
                        <button onClick={() => openVendorEdit(v)} className="btn-icon"><Pencil size={12} /></button>
                        <button onClick={() => handleVendorDelete(v.id)} className="btn-icon" style={{ color: "#DC2626" }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Add/Edit form */}
              <form onSubmit={handleVendorSubmit} className="space-y-3">
                <div>
                  <label className="form-label">Vendor Name *</label>
                  <input value={vendorForm.name} onChange={e => setVendorForm(f => ({ ...f, name: e.target.value }))} required className="form-input" placeholder="e.g. US Foods" />
                </div>
                <div className="grid-2">
                  <div>
                    <label className="form-label">Role</label>
                    <input value={vendorForm.role} onChange={e => setVendorForm(f => ({ ...f, role: e.target.value }))} className="form-input" placeholder="Primary broadline vendor" />
                  </div>
                  <div>
                    <label className="form-label">Cadence</label>
                    <input value={vendorForm.cadence} onChange={e => setVendorForm(f => ({ ...f, cadence: e.target.value }))} className="form-input" placeholder="Weekly" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Main Use</label>
                  <input value={vendorForm.mainUse} onChange={e => setVendorForm(f => ({ ...f, mainUse: e.target.value }))} className="form-input" placeholder="Donut ingredients, dairy, supplies" />
                </div>
                <div>
                  <label className="form-label">Contact Info</label>
                  <input value={vendorForm.contactInfo} onChange={e => setVendorForm(f => ({ ...f, contactInfo: e.target.value }))} className="form-input" placeholder="Phone, email, or rep name" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">{editingVendor ? "Update" : "Add Vendor"}</button>
                  {editingVendor && <button type="button" onClick={() => { setEditingVendor(null); setVendorForm({ name: "", role: "", mainUse: "", cadence: "", contactInfo: "" }); }} className="btn btn-secondary btn-sm">Cancel Edit</button>}
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setShowVendorModal(false); setEditingVendor(null); setVendorForm({ name: "", role: "", mainUse: "", cadence: "", contactInfo: "" }); }} className="btn btn-secondary">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Orders Modal */}
      {showGenOrders && (
        <div className="modal-backdrop" onClick={() => { setShowGenOrders(false); setGenOrdersResult(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Generate Orders from Count</h2>
            </div>
            <div className="modal-body">
              {genOrdersResult ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 40 }}>✅</div>
                  <h3 style={{ marginTop: 12, fontSize: 18 }}>Orders Generated</h3>
                  <p className="text-sm text-gray" style={{ marginTop: 8 }}>
                    {genOrdersResult.created > 0
                      ? `Created ${genOrdersResult.created} order request${genOrdersResult.created !== 1 ? "s" : ""} for items below par.`
                      : "No new orders needed — all items are at par or already requested."}
                  </p>
                  {genOrdersResult.skipped > 0 && (
                    <p className="text-xs text-gray" style={{ marginTop: 4 }}>
                      Skipped {genOrdersResult.skipped} item(s) with existing requests
                    </p>
                  )}
                  <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
                    <a href="/inventory/order-requests" className="btn btn-primary btn-sm">View Requests</a>
                    <button onClick={() => { setShowGenOrders(false); setGenOrdersResult(null); }} className="btn btn-secondary btn-sm">Close</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">
                    Generate order requests for all items currently below par based on the saved count for{" "}
                    <strong>{date}</strong>.
                  </p>
                  {totalToOrder === 0 ? (
                    <div style={{ padding: 16, background: "#F0FDF4", borderRadius: 8, textAlign: "center" }}>
                      <span className="text-sm text-green">✓ All items are at or above par. No orders needed.</span>
                    </div>
                  ) : (
                    <div style={{ padding: 16, background: "#F3EEFF", borderRadius: 8 }}>
                      <div className="text-sm font-semibold" style={{ color: "#7C3AED" }}>
                        {totalToOrder.toLocaleString()} units to order across {vendors.length} vendors
                      </div>
                      <div className="text-xs text-gray" style={{ marginTop: 4 }}>
                        Items below par will have order requests created automatically.
                      </div>
                    </div>
                  )}
                  {!saved && (
                    <p className="text-xs text-gray" style={{ background: "#FFFBEB", padding: 8, borderRadius: 6 }}>
                      ⚠️ Tip: Save your count first to use the latest numbers.
                    </p>
                  )}
                </div>
              )}
            </div>
            {!genOrdersResult && (
              <div className="modal-footer">
                <button onClick={() => setShowGenOrders(false)} className="btn btn-secondary">Cancel</button>
                <button
                  onClick={confirmGenerateOrders}
                  disabled={genOrdersLoading}
                  className="btn btn-primary btn-sm"
                >
                  {genOrdersLoading ? "Generating..." : "Generate Orders"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-over Edit Drawer */}
      {(editDrawerItem || drawerMode === "create") && (
        <div className="drawer-backdrop" onClick={closeEditDrawer}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{drawerMode === "create" ? "Add New Item" : "Edit Item"}</h2>
              <button className="btn-icon" onClick={closeEditDrawer} title="Close">✕</button>
            </div>
            <div className="drawer-body">
              {editError && (
                <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
                  {editError}
                </div>
              )}
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Item Name *</label>
                  <input type="text" className="form-input" value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g. Beef Tallow" />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Vendor</label>
                  <select className="form-input" value={editForm.vendorId ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, vendorId: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">No Vendor</option>
                    {vendors.map(v => (<option key={v.id} value={v.id}>{v.name}</option>))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Section</label>
                  <select className="form-input" value={editForm.inventorySection}
                    onChange={(e) => setEditForm({ ...editForm, inventorySection: e.target.value })}>
                    {sections.length > 0
                      ? sections.map(s => (<option key={s.id} value={s.slug}>{s.icon} {s.name}</option>))
                      : (<>
                          <option value="kitchen_regular">🍳 Kitchen Regular</option>
                          <option value="kitchen_infrequent">🧂 Kitchen Infrequent</option>
                          <option value="packaging">📦 Packaging</option>
                          <option value="barista">☕ Barista</option>
                        </>)
                    }
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Unit</label>
                  <input type="text" className="form-input" value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    placeholder="e.g. case, lb, gal" />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Unit Cost ($)</label>
                  <input type="number" className="form-input" min="0" step="0.01" value={editForm.unitCost}
                    onChange={(e) => setEditForm({ ...editForm, unitCost: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Par Level</label>
                  <input type="number" className="form-input" min="0" step="0.5" value={editForm.parLevel}
                    onChange={(e) => setEditForm({ ...editForm, parLevel: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Min Stock (reorder trigger)</label>
                  <input type="number" className="form-input" min="0" step="0.5" value={editForm.minStock}
                    onChange={(e) => setEditForm({ ...editForm, minStock: parseFloat(e.target.value) || 0 })} />
                </div>
                {drawerMode === "create" && (
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Starting Stock</label>
                    <input type="number" className="form-input" min="0" step="0.5" value={editForm.currentStock}
                      onChange={(e) => setEditForm({ ...editForm, currentStock: parseFloat(e.target.value) || 0 })}
                      placeholder="0" />
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowEditAdvanced(!showEditAdvanced)}
                style={{
                  marginTop: 4, background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, color: "#7C3AED", padding: "4px 0",
                }}
              >
                {showEditAdvanced ? "▼ Hide advanced fields" : "▶ Show advanced fields"}
              </button>

              {showEditAdvanced && (
                <div className="grid-2" style={{ gap: 16, marginTop: 16 }}>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">SKU</label>
                    <input type="text" className="form-input" value={editForm.sku}
                      onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                      placeholder="e.g. 2880383" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Pack Size</label>
                    <input type="text" className="form-input" value={editForm.packSize}
                      onChange={(e) => setEditForm({ ...editForm, packSize: e.target.value })}
                      placeholder="e.g. 50 lb case" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Suggested Cadence</label>
                    <input type="text" className="form-input" value={editForm.suggestedCadence}
                      onChange={(e) => setEditForm({ ...editForm, suggestedCadence: e.target.value })}
                      placeholder="e.g. 2-3 cases/week" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Category</label>
                    <select className="form-input" value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                      <option value="FOH">Front of House</option>
                      <option value="BOH">Back of House</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>
                </div>
              )}
              {showEditAdvanced && (
                <div className="form-group" style={{ marginTop: 0, marginBottom: 0 }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Additional notes..." rows={3} />
                </div>
              )}
            </div>
            <div className="drawer-footer">
              {drawerMode === "edit" && editDrawerItem && (
                <button
                  className="btn btn-sm"
                  onClick={deleteFromDrawer}
                  style={{ marginRight: "auto", color: "#DC2626", borderColor: "#FCA5A5" }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={closeEditDrawer}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={saveEditDrawer} disabled={editSaving}>
                {editSaving ? "Saving..." : drawerMode === "create" ? "Add Item" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
