# Inventory Phase 1 Fixes

## Overview
Fix the four critical issues in the inventory system: section data mismatch, no item delete, no vendor CRUD, and dead `reorderQty` field.

## Files to Change
- `src/app/api/inventory/route.ts` — add DELETE method, add PUT validation
- `src/app/api/inventory/vendors/route.ts` — add POST, PUT, DELETE methods
- `src/app/(dashboard)/inventory/items/page.tsx` — add delete button + confirm, fix section display
- `src/app/(dashboard)/inventory/page.tsx` — fix section grouping/display, debounce par edits
- `src/app/(dashboard)/inventory/order-requests/page.tsx` — change vendor from free-text to dropdown
- `src/components/vendors/VendorModal.tsx` — new: vendor create/edit modal
- `src/app/(dashboard)/inventory/page.tsx` — add "Manage Vendors" entry point

## Acceptance Criteria

### 1. Section Data Mismatch Fix
- [ ] `/inventory/items` table correctly shows each item's assigned section name (not all "Kitchen — Regular Orders")
- [ ] `/inventory` main page section grouping matches item assignments
- [ ] Section filter on main page actually filters items

### 2. Item Delete / Deactivate
- [ ] DELETE method on `/api/inventory` soft-deletes (sets `active: false`)
- [ ] Delete button (trash icon) on each row in `/inventory/items` table
- [ ] Confirm dialog before deletion: "Delete '{itemName}'? This will hide it from inventory."
- [ ] Item disappears from list after delete
- [ ] Deleted items excluded from GET (already filtered by `active: true`)

### 3. Vendor CRUD
- [ ] POST method on `/api/inventory/vendors` creates vendor (name required, role/mainUse/cadence/contactInfo optional)
- [ ] PUT method updates vendor by id
- [ ] DELETE method soft-deletes vendor (sets `active: false`)
- [ ] "Manage Vendors" button on `/inventory` opens vendor management panel
- [ ] Vendor modal: create/edit form with name, role, main use, cadence, contact info
- [ ] New vendors appear in dropdowns on item form and order request form
- [ ] Order Request form uses vendor dropdown instead of free text

### 4. reorderQty Cleanup
- [ ] Remove `reorderQty` field from Add/Edit Item form
- [ ] Remove from display where shown
- [ ] Keep DB field (don't migrate) — just stop collecting it in the UI

### 5. Par Edit Debounce
- [ ] Inline par editing on `/inventory` debounces API call (500ms) instead of firing on every keystroke

## Tests
- Unit test: DELETE endpoint soft-deletes item (active: false)
- Unit test: vendor POST/PUT/DELETE work correctly
- Unit test: section grouping logic returns correct section names
- Integration test: item deleted from UI → not in GET list
