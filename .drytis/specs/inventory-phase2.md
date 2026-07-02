# Inventory Phase 2 — Workflow Connections

## Overview
Connect the disconnected inventory workflows: count → order, request from existing items, count history, and receiving flow.

## Features

### 1. Generate Orders from Count
After saving a count, show a "Generate Orders" button that creates OrderRequest records for every item below par, grouped by vendor.

**API**: POST /api/inventory/generate-orders
- Input: `{ date: string }` — uses the count for that date
- Logic: for each count line where `amountToOrder > 0`, create an OrderRequest (mode: existing) with `qtyRequested = amountToOrder`
- Skip items already pending (don't create duplicates for same item on same day)
- Returns: `{ created: N, skipped: M, orders: [...] }`

**UI**: On /inventory, after saving a count, show a "Generate Orders" button. Clicking it opens a modal showing items grouped by vendor with quantities. Confirm → creates orders → toast.

### 2. Request from Inventory (Item Picker)
On the Order Request form, add a toggle between "Custom Item" and "From Inventory". In "From Inventory" mode, show a searchable dropdown of inventory items. Selecting one auto-fills vendor and unit.

**UI**: On /inventory/order-requests New Request form:
- Two toggle buttons: "📋 From Inventory" / "✏️ Custom Item"
- From Inventory: searchable `<select>` of items → auto-fills vendor + unit + cost
- Custom Item: existing form (name, vendor dropdown, qty, unit)

### 3. Count History
Table of past counts with date, counter, item count, total to order. Click a count to expand line items.

**UI**: New page at /inventory/history
- Table: Date, Counted By, Items, Total To Order, Actions
- Click row → expand to show line items (item name, on hand, par, to order)
- Also accessible via sidebar "📜 History" button on /inventory

### 4. Receiving Flow
When an order is marked FULFILLED, increment the item's currentStock by qtyRequested. Show a "Mark Received" button on FULFILLED orders that does the increment.

**API**: PUT /api/inventory/order-requests with `{ id, status: "FULFILLED", received: true }`
- When `received: true`, increment `inventoryItem.currentStock += qtyRequested`
- Record `reviewedAt`

**UI**: On /inventory/order-requests:
- Orders show status badges: PENDING → APPROVED → ORDERED → FULFILLED
- FULFILLED orders show a "📥 Receive" button
- Clicking "Receive" shows "Received X units into inventory" confirmation

## Acceptance Criteria

### Generate Orders from Count
- [ ] POST /api/inventory/generate-orders creates OrderRequests for all items below par
- [ ] Skips items that already have a PENDING/APPROVED request for the same date
- [ ] Button appears on /inventory after count is saved
- [ ] Modal shows items grouped by vendor before confirming
- [ ] Toast shows "Created N orders" after success

### Request from Inventory
- [ ] Toggle between "From Inventory" and "Custom Item" on New Request form
- [ ] From Inventory mode shows searchable item list
- [ ] Selecting item auto-fills vendor and unit
- [ ] Submit creates an OrderRequest with mode=existing

### Count History
- [ ] /inventory/history page loads with past counts table
- [ ] Each row shows date, counter, item count, total to order
- [ ] Clicking a row expands to show line items
- [ ] Empty state shows CTA when no counts exist

### Receiving Flow
- [ ] "Receive" button on FULFILLED order requests
- [ ] Clicking it increments inventoryItem.currentStock by qtyRequested
- [ ] Received orders show "Received ✓" state
- [ ] Can't receive the same order twice

## Tests
- Unit: generate-orders skips duplicates
- Unit: receiving increments stock
- Unit: count history returns correct data
