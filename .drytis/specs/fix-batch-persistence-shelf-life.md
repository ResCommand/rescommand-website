# Task: Fix Batch Checkbox Persistence + Add Shelf Life to Prep List

## Summary
Two bugs reported by the user:
1. Batch checkboxes in the Par Sheets production page don't persist — checking them off and reopening the app loses all state
2. Prep schedule for icings/fillings needs a "good for X days" shelf life column

## Files Changed
- `prisma/schema.prisma` — Added `BatchCompletion` model with `date`, `batchIndex`, `mixerType`, `completedBy`
- `src/app/api/batch-completions/route.ts` — NEW: API for GET (load completions by date) and POST (toggle completion on/off)
- `src/app/api/production-targets/route.ts` — Added `shelfLifeHours` to each `PREP_LIST` item
- `src/app/(dashboard)/production/page.tsx` — Added batch persistence (load from API on date change, save on toggle), added shelf life column to Prep List tab

## Acceptance Criteria
- [ ] Batch checkboxes persist across page refreshes and app restarts
- [ ] Each date has its own set of batch completions
- [ ] Toggling a checkbox immediately saves to the database via API
- [ ] Reset button clears all completions for the current date
- [ ] Prep List tab shows a "Good For" column with color-coded shelf life badges
- [ ] Shelf life values are reasonable for each category (glazes: 2 days, icings: 2-3 days, jams: 7 days, syrups: 7-14 days)
- [ ] Build succeeds with no TypeScript errors
- [ ] No console errors on the production page