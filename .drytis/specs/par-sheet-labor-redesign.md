# Par Sheet & Labor Cost Redesign

## Summary
1. Remove the Hours section (nav + page + API)
2. Add Labor Cost as % of sales (Day + MTD) to the dashboard
3. Redesign Par Sheet page to include:
   - **Batch Calculator**: How many small (2000g/46 donuts) and large (3000g/69 donuts) mixer batches to run, based on day-of-week targets (holiday = weekend target)
   - **Tray Allocation**: How many trays (28 donuts/tray) per donut flavor, based on the same targets

## Day-of-Week Donut Targets
| Day(s)               | Target |
|----------------------|--------|
| Mon–Wed              | 400    |
| Thursday              | 500    |
| Friday                | 600    |
| Sat–Sun & Holidays   | 900    |

## Mixer Batch Calculation
- Small mixer: 2000g batch → 46 donuts
- Large mixer: 3000g batch → 69 donuts
- Algorithm: maximize large batches, fill remainder with small, allow slight over-production

## Tray Allocation (from screenshot)
Per tray = 28 donuts. Flavors with their tray allocations per period:

| Flavor                      | Mon-Wed (15 trays) | Thu (19 trays) | Fri (22 trays) | Sat-Sun (32 trays) |
|-----------------------------|------|------|------|------|
| M&M                         | 1.5  | 1.5  | 2    | 3    |
| Fruity Pebble               | 1    | 1    | 1    | 2    |
| Cookies & Cream             | 1    | 1    | 1    | 2.5  |
| Vanilla                     | 2    | 2    | 2    | 2.5  |
| Chocolate                   | 2    | 2    | 2    | 3    |
| Strawberry                  | 1    | 2    | 2    | 2    |
| Maple                       | 1    | 1.5  | 2    | 3    |
| Blueberry Pie               | 1    | 1    | 1.5  | 2.5  |
| Boston Cream                | 0.5  | 0.5  | 1    | 2    |
| Brown Butter Cinnamon       | 0.5  | 1    | 1.5  | 2.5  |
| Lemon Glaze                 | 0.5  | 0.5  | 1    | 1    |
| Nutella Churro/Cin & Sugar  | 1    | 1.5  | 2    | 3    |
| OB (Overboard 1)            | 0.5  | 1    | 1    | 1    |
| OB 2                        | 0.5  | 1    | 1    | 1    |
| OB 3                        | 0.5  | 1    | 1    | 1    |

## Prep List (from screenshot)
| Category       | Item                            | Amount       |
|----------------|---------------------------------|-------------|
| Glazes         | Vanilla Glaze                   | 8-10 Qts    |
| Glazes         | Lemon Glaze                     | 8-10 Qts    |
| Glazes         | Brown Butter Cinnamon Glaze     | 8-10 Qts    |
| Icings         | Vanilla Icing                   | 3 #6 Pans   |
| Icings         | Maple Icing                     | 2 #6 Pans   |
| Icings         | Salted Caramel Icing            | 2 #6 Pans   |
| Icings         | Dark Choc. Ganache              | 2 #6 Pans   |
| Icings         | Strawberry Icing                | 2 #6 Pans   |
| Icings         | Blueberry Icing                 | 2 #6 Pans   |
| Jams/Creams    | Raspberry Jam                   | 2-4 Qts     |
| Jams/Creams    | Blueberry Jam                   | 2-3 Qts     |
| Jams/Creams    | Chocolate Cream                 | 2 Qts       |
| Jams/Creams    | Dulce Cream                     | 1 Qt        |
| Jams/Creams    | Milk Choc Ganache               | 1 Qt        |
| Jams/Creams    | Brulee Cream                    | 1 Qt        |
| Jams/Creams    | Lemon Curd                      | 2-3 Qts     |
| Jams/Creams    | Cheesecake Cream                | 2 Qts       |
| Jams/Creams    | Pastry Cream                    | 4-6 Qts     |
| Syrups/SF      | Vanilla Syrup                   | Full +2 qts |
| Syrups/SF      | Salted Caramel Syrup            | Full +2 qts |
| Syrups/SF      | Brown Butter Cinnamon Syrup     | Full +2 qts |
| Syrups/SF      | Mocha Syrup                     | Full +2 qts |
| Syrups/SF      | Blueberry Syrup                 | Full +2 qts |
| Syrups/SF      | Vanilla Sugar Free               | Full +2 qts |
| Syrups/SF      | Blueberry Sugar Free             | Full +2 qts |
| Syrups/SF      | Strawberry                      | Full +2 qts |
| Syrups/SF      | Strawberry Sugar Free            | 2-3 Bottles |
| Syrups/SF      | Caramel Sauce Bottle            | 2-3 Bottles |

## Acceptance Criteria
- [ ] Hours nav item removed from sidebar
- [ ] Hours page still exists but is not linked (or removed)
- [ ] Labor Cost % (today) shown on dashboard for MANAGER/OWNER
- [ ] Labor Cost % (MTD) shown on dashboard for MANAGER/OWNER
- [ ] Par Sheet page has "Batch Calculation" section showing small/large batches for today
- [ ] Batch calc is correct: maximize large, fill with small, slight over-production OK
- [ ] Holidays detected and trigger weekend target (900)
- [ ] Tray allocation table shown with correct flavor-to-tray mapping for today's period
- [ ] Prep list shown with color-coded categories
- [ ] Existing prediction/par sheet data still works
- [ ] All dashboard metrics (including Labor Cost) are customizable via the layout system