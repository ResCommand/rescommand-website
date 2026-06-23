"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface OrderRequest {
  id: number;
  inventoryItemId: number | null;
  qtyRequested: number;
  notes: string | null;
  status: string;
  createdAt: string;
  customItemName: string | null;
  customVendorName: string | null;
  customUnit: string | null;
  inventoryItem: {
    id: number;
    name: string;
    unit: string;
    unitCost: number;
    packSize: string | null;
    vendor: { id: number; name: string } | null;
  } | null;
  requester: { id: number; name: string };
  reviewer: { id: number; name: string } | null;
}

type FormMode = "custom";

export default function OrderRequestsPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Form state
  const [qty, setQty] = useState<string>("1");
  const [requestNotes, setRequestNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Custom item fields
  const [customName, setCustomName] = useState("");
  const [customVendor, setCustomVendor] = useState("");
  const [customUnit, setCustomUnit] = useState("");

  const { data: session } = useSession();
  const isManager = session?.user && ((session.user as { role?: string }).role === "MANAGER" || (session.user as { role?: string }).role === "OWNER");

  const fetchData = useCallback(async () => {
    try {
      const reqRes = await fetch("/api/inventory/order-requests").then((r) => r.json());
      setRequests(Array.isArray(reqRes) ? reqRes : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRequests =
    filterStatus === "ALL"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  const statusCounts = {
    PENDING: requests.filter((r) => r.status === "PENDING").length,
    APPROVED: requests.filter((r) => r.status === "APPROVED").length,
    ORDERED: requests.filter((r) => r.status === "ORDERED").length,
    FULFILLED: requests.filter((r) => r.status === "FULFILLED").length,
    CANCELLED: requests.filter((r) => r.status === "CANCELLED").length,
  };

  const resetForm = () => {
    setQty("1");
    setRequestNotes("");
    setCustomName("");
    setCustomVendor("");
    setCustomUnit("");
    setFormError("");
  };

  const submitRequest = async () => {
    if (!customName.trim() || !qty) {
      setFormError("Please enter an item name and quantity");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      mode: "custom" as const,
      customItemName: customName.trim(),
      customVendorName: customVendor.trim() || undefined,
      customUnit: customUnit.trim() || undefined,
      qtyRequested: parseFloat(qty),
      notes: requestNotes || undefined,
    };

    try {
      const res = await fetch("/api/inventory/order-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit");
      }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch("/api/inventory/order-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch {
      // ignore
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm("Delete this request? This cannot be undone.")) return;
    try {
      await fetch("/api/inventory/order-requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch {
      // ignore
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "badge-yellow",
      APPROVED: "badge-blue",
      ORDERED: "badge-purple",
      FULFILLED: "badge-green",
      CANCELLED: "badge-gray",
    };
    return map[status] || "badge-gray";
  };

  const getItemDisplay = (req: OrderRequest) => {
    if (req.inventoryItem) return req.inventoryItem.name;
    if (req.customItemName) return req.customItemName;
    return "Unknown Item";
  };

  const getVendorDisplay = (req: OrderRequest) => {
    if (req.inventoryItem?.vendor) return req.inventoryItem.vendor.name;
    if (req.customVendorName) return req.customVendorName;
    return null;
  };

  const getUnitDisplay = (req: OrderRequest) => {
    if (req.inventoryItem) return req.inventoryItem.unit;
    if (req.customUnit) return req.customUnit;
    return "units";
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header"><h1>Order Requests</h1></div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>🛒 Order Requests</h1>
            <p className="text-sm text-gray">
              Request items for order. {statusCounts.PENDING} pending approval.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
            >
              {showForm ? "✕ Cancel" : "+ New Request"}
            </button>
            <Link href="/inventory" className="btn btn-secondary btn-sm">
              ← Back to Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* New request form */}
      {showForm && (
        <div className="card mb-4" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Request a New Item</h3>
          <p className="text-sm text-gray" style={{ marginBottom: 12 }}>
            Need something that&apos;s not in our inventory list? Enter the details below and a manager will review it.
          </p>

          {formError && (
            <div style={{ background: "#FEF2F2", color: "#DC2626", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
              {formError}
            </div>
          )}

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Madagascar Vanilla Beans"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Vendor (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. US Foods, or a new vendor"
                value={customVendor}
                onChange={(e) => setCustomVendor(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                className="form-input"
                min="1"
                step="0.5"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                style={{ width: 120 }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Unit (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. case, lb, each"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Notes (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Need ASAP, for weekend rush..."
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={submitRequest}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 mb-4" style={{ overflowX: "auto", flexWrap: "nowrap" }}>
        <button
          className={`tab ${filterStatus === "ALL" ? "active" : ""}`}
          onClick={() => setFilterStatus("ALL")}
        >
          All ({requests.length})
        </button>
        <button
          className={`tab ${filterStatus === "PENDING" ? "active" : ""}`}
          onClick={() => setFilterStatus("PENDING")}
        >
          Pending ({statusCounts.PENDING})
        </button>
        <button
          className={`tab ${filterStatus === "APPROVED" ? "active" : ""}`}
          onClick={() => setFilterStatus("APPROVED")}
        >
          Approved ({statusCounts.APPROVED})
        </button>
        <button
          className={`tab ${filterStatus === "ORDERED" ? "active" : ""}`}
          onClick={() => setFilterStatus("ORDERED")}
        >
          Ordered ({statusCounts.ORDERED})
        </button>
        <button
          className={`tab ${filterStatus === "FULFILLED" ? "active" : ""}`}
          onClick={() => setFilterStatus("FULFILLED")}
        >
          Fulfilled ({statusCounts.FULFILLED})
        </button>
      </div>

      {/* Requests table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Vendor</th>
                <th>Qty</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const isCustom = !req.inventoryItem;
                const vendorDisplay = getVendorDisplay(req);
                const unitDisplay = getUnitDisplay(req);
                return (
                  <tr key={req.id}>
                    <td>
                      <div className="font-medium text-sm">
                        {getItemDisplay(req)}
                        {isCustom && <span className="badge badge-purple" style={{ marginLeft: 6, fontSize: 9 }}>NEW</span>}
                      </div>
                    </td>
                    <td>
                      {vendorDisplay ? (
                        <span className="badge badge-blue">{vendorDisplay}</span>
                      ) : (
                        <span className="text-xs text-gray">—</span>
                      )}
                    </td>
                    <td className="text-sm">{req.qtyRequested} {unitDisplay}</td>
                    <td className="text-sm">{req.requester.name}</td>
                    <td>
                      <span className={`badge ${statusBadge(req.status)}`}>{req.status}</span>
                    </td>
                    <td className="text-xs text-gray" style={{ maxWidth: 160 }}>{req.notes || "—"}</td>
                    <td className="text-xs text-gray">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {req.status === "PENDING" && (
                        <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: "#7C3AED", color: "#fff", padding: "3px 8px", fontSize: 11 }}
                            onClick={() => updateStatus(req.id, "APPROVED")}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: "#6B7280", color: "#fff", padding: "3px 8px", fontSize: 11 }}
                            onClick={() => updateStatus(req.id, "CANCELLED")}
                          >
                            Cancel
                          </button>
                          {isManager && (
                            <button
                              className="btn btn-sm"
                              style={{ background: "#DC2626", color: "#fff", padding: "3px 8px", fontSize: 11 }}
                              onClick={() => deleteRequest(req.id)}
                              title="Delete request"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      )}
                      {req.status === "APPROVED" && (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-sm"
                            style={{ background: "#7C3AED", color: "#fff", padding: "3px 8px", fontSize: 11 }}
                            onClick={() => updateStatus(req.id, "ORDERED")}
                          >
                            Mark Ordered
                          </button>
                          {isManager && (
                            <button
                              className="btn btn-sm"
                              style={{ background: "#DC2626", color: "#fff", padding: "3px 8px", fontSize: 11 }}
                              onClick={() => deleteRequest(req.id)}
                              title="Delete request"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      )}
                      {req.status === "ORDERED" && (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-sm"
                            style={{ background: "#059669", color: "#fff", padding: "3px 8px", fontSize: 11 }}
                            onClick={() => updateStatus(req.id, "FULFILLED")}
                          >
                            Fulfilled
                          </button>
                          {isManager && (
                            <button
                              className="btn btn-sm"
                              style={{ background: "#DC2626", color: "#fff", padding: "3px 8px", fontSize: 11 }}
                              onClick={() => deleteRequest(req.id)}
                              title="Delete request"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      )}
                      {(req.status === "FULFILLED" || req.status === "CANCELLED") && (
                        isManager ? (
                          <button
                            className="btn btn-sm"
                            style={{ background: "#DC2626", color: "#fff", padding: "3px 8px", fontSize: 11 }}
                            onClick={() => deleteRequest(req.id)}
                            title="Delete request"
                          >
                            🗑 Delete
                          </button>
                        ) : (
                          <span className="text-xs text-gray">—</span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={8}><div className="empty-state">No order requests</div></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}