# Inventory Vendor Management — Task Spec

## Overview
Redesign the inventory section to organize items by vendor, enable weekly inventory counts (Monday recording), and allow staff to request items for order. Seed the database with all items from the Duffers Master Vendor Order List.

## Files to Create/Modify

### Database (Prisma)
- `prisma/schema.prisma` — Add `Vendor` model, `InventoryCount` + `InventoryCountLine`, `OrderRequest` models; add `vendorId` FK to `InventoryItem`; add fields for pack size, suggested cadence, SKU

### API Routes
- `src/app/api/inventory/route.ts` — Update GET to support vendor grouping
- `src/app/api/inventory/vendors/route.ts` — CRUD for vendors
- `src/app/api/inventory/counts/route.ts` — Create/list inventory counts (weekly snapshots)
- `src/app/api/inventory/order-requests/route.ts` — Staff order request CRUD

### Pages
- `src/app/(dashboard)/inventory/page.tsx` — Redesign: vendor-tabbed view, items table per vendor
- `src/app/(dashboard)/inventory/count/page.tsx` — Weekly inventory count entry
- `src/app/(dashboard)/inventory/order-requests/page.tsx` — Order request list + create
- `src/app/(dashboard)/inventory/items/page.tsx` — Manage individual items (add/edit)

### Seed
- `prisma/seed.ts` — Seed vendors and all inventory items from the document

## Acceptance Criteria

- [ ] Vendor model with name, role/description, cadence, contact info
- [ ] 5 vendors seeded: US Foods, Senn Brothers, GFI, Amazon, Aldi
- [ ] All inventory items from the vendor document seeded under correct vendor
- [ ] Each item has: name, vendorId, unit, unitCost, parLevel, packSize, suggestedCadence, sku, fohBoh, active
- [ ] Inventory page shows items grouped by vendor with tabs
- [ ] Each vendor section shows items in a table with: name, pack, unit cost, par level, on-hand, suggested cadence, notes
- [ ] Items below par highlighted with low-stock badge
- [ ] "Weekly Count" page lets staff enter on-hand quantities for all items (defaults to Monday)
- [ ] Staff can select the date (defaults to current Monday)
- [ ] Count entries save per item per date — can update if already exists for that date
- [ ] After count, system calculates "Amount to Order" = par_level − current_on_hand (if positive)
- [ ] "Order Requests" page lets any staff member request an item for order
- [ ] Order request has: item, qty requested, requested by, notes, status (PENDING/APPROVED/ORDERED)
- [ ] Manager/Owner can approve/fulfill order requests
- [ ] Mobile-first responsive layout
- [ ] Navigation updated with inventory sub-pages

## DB Schema Additions

### Vendor
- id, name, role (description), mainUse, cadence, dataConfidence, contactInfo, active, createdAt, updatedAt

### InventoryItem additions
- vendorId (FK to Vendor), packSize, suggestedCadence, sku, notes

### InventoryCount
- id, date, countedBy (FK User), notes, createdAt

### InventoryCountLine
- id, countId (FK), inventoryItemId (FK), onHand, amountToOrder

### OrderRequest
- id, inventoryItemId (FK), qtyRequested, requestedBy (FK User), notes, status (PENDING/APPROVED/FULFILLED/CANCELLED), reviewedBy (FK User?), reviewedAt, createdAt, updatedAt