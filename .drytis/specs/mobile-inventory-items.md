# Mobile-Responsive Inventory Items Page

## Problem
The `/inventory/items` page (Manage Items) does not fit on mobile screens. It renders an 8-column table with no mobile card alternative, unlike the main inventory page which already has a desktop table → mobile card toggle.

## Files to Change
- `/workspace/src/app/(dashboard)/inventory/items/page.tsx` — add mobile card view, fix form padding, fix header buttons

## Acceptance Criteria
- [ ] On mobile (≤768px), the items table is hidden and replaced with mobile cards showing key info per item
- [ ] Each mobile card shows: item name, vendor badge, section, unit cost, par level, on-hand stock, and an Edit button
- [ ] The desktop table remains unchanged for screens > 768px
- [ ] The add/edit form card uses reduced padding on mobile (12px instead of 20px)
- [ ] The page header buttons wrap properly on mobile
- [ ] Search input stretches full width on mobile
- [ ] No horizontal overflow on 375px viewport
- [ ] Desktop layout is unchanged

## Pattern to Follow
Match the existing `.inv-table-desktop` / `.inv-cards-mobile` pattern used in `/workspace/src/app/(dashboard)/inventory/page.tsx` lines 392–553. Use `.inv-card` class for card styling.