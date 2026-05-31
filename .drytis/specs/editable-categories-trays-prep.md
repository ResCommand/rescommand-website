# Task: Inventory Categories, Recipe Categories, Tray Editing, Prep List Editing

## Summary
Four related changes to make the production/inventory system fully editable.

## 1. Inventory Category Renaming + CRUD
**Current:** Sections are a Prisma enum (KITCHEN_REGULAR, KITCHEN_INFREQUENT, PACKAGING, BARISTA) — hardcoded, not editable.
**Change:** Convert inventory sections to a database table so users can rename, add, and delete categories.

### Files
- `prisma/schema.prisma` — New `InventorySection` model, remove `InventorySection` enum, update `InventoryItem`
- `src/app/api/inventory/sections/route.ts` — NEW: CRUD for sections
- `src/app/(dashboard)/inventory/page.tsx` — Dynamic sections from API, add rename/add/delete UI
- `src/app/(dashboard)/inventory/items/page.tsx` — Dynamic section dropdown from API
- `src/app/api/inventory/route.ts` — Update validation to use DB sections instead of enum

### Acceptance Criteria
- [ ] Users can rename existing inventory sections (e.g. "Kitchen — Regular" → "Kitchen — Daily Orders")
- [ ] Users can add new inventory sections
- [ ] Users can delete empty inventory sections
- [ ] Existing items keep their section assignment after rename
- [ ] Section order is preserved and reorderable

## 2. Recipe Category CRUD
**Current:** 4 hardcoded categories (base, filling, topping, general) in the frontend.
**Change:** Make recipe categories database-driven with add/edit/delete.

### Files
- `prisma/schema.prisma` — New `RecipeCategory` model
- `src/app/api/recipes/categories/route.ts` — NEW: CRUD for recipe categories
- `src/app/api/recipes/route.ts` — Update to use DB category IDs
- `src/app/(dashboard)/recipes/page.tsx` — Dynamic categories from API, add/edit/delete UI

### Acceptance Criteria
- [ ] Users can add new recipe categories
- [ ] Users can rename recipe categories
- [ [ ] Users can delete empty recipe categories
- [ ] Recipe form dropdown shows DB categories
- [ ] Category tabs update dynamically

## 3. Tray Editing + Manual Override
**Current:** Trays are read-only, derived from target and hardcoded flavor allocations.
**Change:** Allow manual tray adjustments that rebalance the total.

### Files
- `prisma/schema.prisma` — New `TrayOverride` model
- `src/app/api/production-targets/route.ts` — Save/load tray overrides
- `src/app/(dashboard)/production/page.tsx` — Editable tray inputs with auto-rebalance

### Acceptance Criteria
- [ ] Users can click a tray count and type a new number
- [ ] Adjusting one flavor shows a "surplus/shortage" indicator on other flavors
- [ ] Total tray count updates to reflect changes
- [ ] Tray overrides persist per date in the database
- [ ] Reset button to go back to suggested allocations

## 4. Prep List Full CRUD
**Current:** Prep items are a hardcoded constant of 28 items.
**Change:** Activate the existing `PrepStockItem` model with full CRUD UI.

### Files
- `prisma/schema.prisma` — Review/update `PrepStockItem` model
- `src/app/api/prep-items/route.ts` — NEW: CRUD for prep items
- `src/app/api/production-targets/route.ts` — Load prep list from DB instead of hardcoded constant
- `src/app/(dashboard)/production/page.tsx` — Add/edit/delete UI in Prep List tab

### Acceptance Criteria
- [ ] Users can add new prep items (name, category, amount, shelf life)
- [ ] Users can edit existing prep items
- [ ] Users can delete prep items
- [ ] Users can add/edit/delete prep categories
- [ ] Shelf life displays correctly
- [ ] Existing 28 items are seeded into the database