"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp, Package, AlertTriangle } from "lucide-react";

interface InvItem {
  id: number;
  name: string;
  unit: string;
  unitCost: number;
  currentStock: number;
  parLevel: number;
  minStock: number;
  packSize: string | null;
  inventorySection: string;
  vendor: { id: number; name: string } | null;
}

export default function ValuationPage() {
  const [items, setItems] = useState<InvItem[]>([]);
  const [sections, setSections] = useState<{ slug: string; name: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/inventory").then((r) => r.json()),
      fetch("/api/inventory/sections").then((r) => r.json()).catch(() => []),
    ])
      .then(([itemData, secData]) => {
        setItems(Array.isArray(itemData) ? itemData : []);
        setSections(Array.isArray(secData) ? secData.map((s: { slug: string; name: string; icon: string }) => ({ slug: s.slug, name: s.name, icon: s.icon })) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sectionLabel = (slug: string) => {
    const s = sections.find((sec) => sec.slug === slug);
    return s ? `${s.icon} ${s.name}` : slug;
  };

  const { totalValue, trackedCount, lowStockValue, bySection, byVendor, byItem } = useMemo(() => {
    let tv = 0;
    let tc = 0;
    let lsv = 0;

    const secMap: Record<string, { value: number; count: number }> = {};
    const venMap: Record<string, { value: number; count: number }> = {};
    const itemList: { name: string; section: string; vendor: string; stock: number; unit: string; unitCost: number; value: number }[] = [];

    for (const item of items) {
      const value = item.currentStock * item.unitCost;
      tv += value;
      if (item.parLevel > 0) tc++;
      if (item.parLevel > 0 && item.currentStock <= item.minStock && item.minStock > 0) lsv += value;

      const secKey = item.inventorySection || "other";
      if (!secMap[secKey]) secMap[secKey] = { value: 0, count: 0 };
      secMap[secKey].value += value;
      secMap[secKey].count++;

      const venKey = item.vendor?.name || "Unassigned";
      if (!venMap[venKey]) venMap[venKey] = { value: 0, count: 0 };
      venMap[venKey].value += value;
      venMap[venKey].count++;

      itemList.push({
        name: item.name,
        section: item.inventorySection,
        vendor: item.vendor?.name || "Unassigned",
        stock: item.currentStock,
        unit: item.unit,
        unitCost: item.unitCost,
        value,
      });
    }

    itemList.sort((a, b) => b.value - a.value);

    return {
      totalValue: tv,
      trackedCount: tc,
      lowStockValue: lsv,
      bySection: secMap,
      byVendor: venMap,
      byItem: itemList,
    };
  }, [items]);

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pct = (val: number) => totalValue > 0 ? `${((val / totalValue) * 100).toFixed(1)}%` : "—";

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Inventory Valuation</h1></div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>💰 Inventory Valuation</h1>
            <p className="text-sm text-gray">
              Current stock value across {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/inventory" className="btn btn-secondary btn-sm">
            <ChevronLeft size={14} /> Back to Inventory
          </Link>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-icon stat-icon-purple">💵</div>
          <div className="stat-value">{fmt(totalValue)}</div>
          <div className="stat-label">Total Inventory Value</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon stat-icon-blue"><Package size={18} /></div>
          <div className="stat-value">{trackedCount}</div>
          <div className="stat-label">Tracked Items (par &gt; 0)</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon stat-icon-orange"><AlertTriangle size={18} /></div>
          <div className="stat-value">{fmt(lowStockValue)}</div>
          <div className="stat-label">Low Stock Value</div>
        </div>
      </div>

      {/* By Section */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
          <TrendingUp size={16} style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} />
          Value by Section
        </h3>
        <table>
          <thead>
            <tr><th>Section</th><th style={{ textAlign: "right" }}>Items</th><th style={{ textAlign: "right" }}>Value</th><th style={{ textAlign: "right" }}>% of Total</th></tr>
          </thead>
          <tbody>
            {Object.entries(bySection)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([key, data]) => (
                <tr key={key}>
                  <td className="font-medium">{sectionLabel(key)}</td>
                  <td style={{ textAlign: "right" }}>{data.count}</td>
                  <td style={{ textAlign: "right" }} className="font-semibold">{fmt(data.value)}</td>
                  <td style={{ textAlign: "right" }} className="text-sm text-gray">{pct(data.value)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* By Vendor */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Value by Vendor</h3>
        <table>
          <thead>
            <tr><th>Vendor</th><th style={{ textAlign: "right" }}>Items</th><th style={{ textAlign: "right" }}>Value</th><th style={{ textAlign: "right" }}>% of Total</th></tr>
          </thead>
          <tbody>
            {Object.entries(byVendor)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([key, data]) => (
                <tr key={key}>
                  <td className="font-medium">{key}</td>
                  <td style={{ textAlign: "right" }}>{data.count}</td>
                  <td style={{ textAlign: "right" }} className="font-semibold">{fmt(data.value)}</td>
                  <td style={{ textAlign: "right" }} className="text-sm text-gray">{pct(data.value)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Item-level detail */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Value by Item (Top 30)</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Item</th><th>Section</th><th>Vendor</th>
                <th style={{ textAlign: "right" }}>On Hand</th>
                <th style={{ textAlign: "right" }}>Unit Cost</th>
                <th style={{ textAlign: "right" }}>Total Value</th>
                <th style={{ textAlign: "right" }}>%</th>
              </tr>
            </thead>
            <tbody>
              {byItem.slice(0, 30).map((item, i) => (
                <tr key={i}>
                  <td className="font-medium text-sm">{item.name}</td>
                  <td className="text-xs text-gray">{sectionLabel(item.section)}</td>
                  <td className="text-sm">{item.vendor}</td>
                  <td style={{ textAlign: "right" }} className="text-sm">{item.stock} {item.unit}</td>
                  <td style={{ textAlign: "right" }} className="text-sm">{item.unitCost > 0 ? fmt(item.unitCost) : "—"}</td>
                  <td style={{ textAlign: "right" }} className="font-semibold text-sm">{fmt(item.value)}</td>
                  <td style={{ textAlign: "right" }} className="text-xs text-gray">{pct(item.value)}</td>
                </tr>
              ))}
              {byItem.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state">No items found</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
        {byItem.length > 30 && (
          <div style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", paddingTop: 12 }}>
            Showing top 30 of {byItem.length} items by value
          </div>
        )}
      </div>
    </div>
  );
}
