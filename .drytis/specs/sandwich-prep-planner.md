# Sandwich & Bagel Prep Planner

## Goal
Replace the useless "log a count" page with a weekly prep planner that tells staff exactly what to make on each prep day and breaks down ingredients needed.

## Schema (new tables)
- `sandwich_types` — the types (Bacon Egg & Cheese, Sausage Egg & Cheese, Veggie Wrap, Plain Bagel, etc.)
- `sandwich_schedules` — quantity per type per day-of-week (Mon=24, Thu=24, etc.)
- `sandwich_recipes` — ingredients per type (eggs, bacon, cheese, etc.)

## Page Layout
- Top: day-of-week selector pills (Mon, Tue, Wed, Thu, Fri, Sat, Sun) — highlight active prep days
- Middle: table of sandwich types with editable quantity for the selected day
- Bottom: ingredient breakdown — "For Monday you need: 36 eggs, 24 bacon strips, 12 sausage patties, 36 cheese slices"

## Acceptance Criteria
- [ ] Day-of-week selector with active prep days highlighted
- [ ] Editable quantities per sandwich type per day
- [ ] Ingredient breakdown auto-calculates from recipes × quantities
- [ ] Can add/edit/delete sandwich types
- [ ] Can edit ingredient recipes per type
- [ ] All changes persist to DB
- [ ] Old production log form removed
