# Inventory Phase 3 — Polish & Scale

## Overview
Sort/pagination, pack-size rounding, valuation report, and progressive disclosure form.

## Features

### 1. Column Sorting + Pagination on Manage Items
**File**: `src/app/(dashboard)/inventory/items/page.tsx`

- Click column headers (Item, Vendor, Section, Unit Cost, Par, On Hand) to sort ascending/descending
- Visual indicator: ▲/▼ on the active sort column
- Pagination: 20 items per page with Previous/Next + page numbers
- Default sort: Item name ascending (current behavior)

### 2. Pack-Size Rounding in "To Order" Calculation
**Files**: `src/app/(dashboard)/inventory/page.tsx`, `src/app/api/inventory/counts/route.ts`

- Parse the numeric portion of `packSize` (e.g. "50 lb case" → 50)
- If packSize exists and toOrder > 0, round toOrder UP to the nearest multiple of packSize
- Show "(X cases)" next to the rounded number
- If packSize is null/empty, show raw toOrder (current behavior)
- Example: par=50, onHand=10, toOrder=40, packSize=50 → "50 (1 case)"

### 3. Inventory Valuation Report
**New file**: `src/app/(dashboard)/inventory/valuation/page.tsx`

- Total inventory value = Σ(currentStock × unitCost) for all active items
- Breakdown by section (4 sections)
- Breakdown by vendor (5 vendors)
- Cards at top: Total Value, Items Tracked, Low Stock Value
- Table: Item, On Hand, Unit Cost, Total Value, % of Total
- Sortable by value descending
- Link from /inventory page header

### 4. Progressive Disclosure on Add/Edit Form
**File**: `src/app/(dashboard)/inventory/items/page.tsx`

- Split form into two sections:
  - **Essential** (always visible): Name, Vendor, Section, Unit, Unit Cost, Par Level, Min Stock
  - **Advanced** (collapsible): SKU, Pack Size, Suggested Cadence, Notes
- "Show advanced fields ▼" toggle link
- Default: advanced collapsed

## Acceptance Criteria

### Sorting + Pagination
- [ ] Click any sortable column header → toggles asc/desc
- [ ] ▲/▼ indicator on active column
- [ ] Max 20 items per page
- [ ] Previous disabled on page 1, Next disabled on last page
- [ ] Page numbers shown (1 2 3 ...)
- [ ] Search resets to page 1

### Pack-Size Rounding
- [ ] Items with packSize show rounded toOrder
- [ ] Items without packSize show raw toOrder
- [ ] "(X cases)" label shown when rounding applies
- [ ] Total to order uses rounded values
- [ ] Server-side count save stores the rounded amountToOrder

### Valuation Report
- [ ] /inventory/valuation page loads
- [ ] Total value card shows formatted currency
- [ ] Section breakdown table with values
- [ ] Vendor breakdown table with values
- [ ] Item-level table sortable by value
- [ ] "Valuation" button on /inventory header

### Progressive Disclosure
- [ ] Form shows only essential fields by default
- [ ] "Show advanced fields" expands SKU/Pack Size/Cadence/Notes
- [ ] Toggle collapses back
- [ ] Editing an item with advanced fields filled → auto-expand
- [ ] Advanced fields still save correctly

## Tests
- Unit: pack-size rounding logic (roundUpToPack helper)
- Unit: valuation total calculation
- Unit: sorting comparator (asc/desc for strings and numbers)
