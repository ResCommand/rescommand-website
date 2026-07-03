# Inventory UX Redesign

## Goal
Reskin the inventory section from a 6-button header + scattered pages into a unified 3-tab layout with cleaner tables, better visual hierarchy, and polished interactions.

## Files to Change
- `src/components/inventory/InventoryNav.tsx` — NEW shared tab bar
- `src/app/(dashboard)/inventory/page.tsx` — count page redesign
- `src/app/(dashboard)/inventory/items/page.tsx` — items page (add tab bar)
- `src/app/(dashboard)/inventory/order-requests/page.tsx` — orders page (add tab bar)
- `src/app/(dashboard)/inventory/history/page.tsx` — history page (add tab bar)
- `src/app/(dashboard)/inventory/valuation/page.tsx` — valuation page (add tab bar)
- `src/app/globals.css` — new inventory design tokens + utility classes

## Acceptance Criteria

### Phase 1: Shared Tab Navigation + Header Cleanup
- [ ] InventoryNav component renders on all 5 inventory pages
- [ ] Active tab highlighted based on current route
- [ ] Header on count page reduced to title + stats + single settings button
- [ ] Duplicate bottom save button removed
- [ ] Unsaved changes shown as sticky pill that's always visible

### Phase 2: Table Redesign
- [ ] Count table reduced to 6 columns (Item, On Hand, Par, To Order, Status, Cadence)
- [ ] Vendor shown as subtitle under item name (not separate column)
- [ ] Pack size shown as subtitle under To Order badge
- [ ] Low-stock rows have 3px red left border
- [ ] At-par items show green checkmark
- [ ] Each section header shows "X/Y counted" progress
- [ ] Celebratory "All items at par" message when totalToOrder === 0

### Phase 3: Polish
- [ ] Consistent color semantics (red=problem, orange=action, green=good, purple=info)
- [ ] Card tables have inner padding (12px horizontal)
- [ ] Enter key on On Hand input moves focus to next row
- [ ] Mobile inputs ≥ 48px wide with inputmode="decimal"
- [ ] All buttons use Lucide icons, emojis only for section headers

### Phase 4: Tests
- [ ] Unit tests for InventoryNav active-tab logic
- [ ] Unit tests for count-progress calculation
- [ ] All existing 138 tests still pass
