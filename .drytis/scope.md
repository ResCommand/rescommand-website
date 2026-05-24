# Scope — Duffera Donuts Ops v1

## In Scope
1. **QR Sign Page** — Public page with 5-6 QR codes for employee quick-input screens
2. **Mobile Data Entry** — Drink logging (espresso dialing, type, milk, size, waste), donut production/sales/waste, dogels, breakfast sandwiches, ticket totals
3. **Employee Dashboard** — Quick entry forms, personal hours, today's par sheet, overboard schedule, cleaning tasks
4. **Manager Dashboard** — KPIs: donuts sold, overboard, dozens/half-dozens, drinks breakdown, dogels, sandwiches, employee hours, daily sales, sales-by-hour graph, avg ticket, COGS summary
5. **Owner Dashboard** — Financial overview, full COGS, all data access, user management
6. **Prediction Engine** — Historical sales + weather (Open-Meteo) + holiday schedule → recommended donut production per type → auto par sheet
7. **Par Sheets** — Daily generated from predictions, shows item/par/on-hand/to-make
8. **Inventory Management** — FoH/BoH categories, par levels, low-stock alerts, inventory orders with status tracking
9. **Prep Stock** — Prep items (icings, fillings, dough) with shelf life tracking
10. **COGS** — Ingredient cost → product cost → margin calculation
11. **Overboard Calendar** — 30+ day view, dates + types + required fillings/toppings, shared visibility
12. **Cleaning/Maintenance** — Recurring task templates, assignment, completion tracking, equipment log
13. **Hours Tracking** — Clock in/out, hours per employee per day/week

## Out of Scope (v1)
- Point-of-sale / payment processing
- Customer-facing ordering
- Supplier portal
- Multi-location support
- Push notifications
- Offline mode (beyond basic PWA caching)