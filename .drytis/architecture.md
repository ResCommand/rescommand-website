# Architecture — Duffera Donuts Ops

## Directory Structure
```
/workspace/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Sidebar/nav based on role
│   │   │   ├── page.tsx            # Redirect by role
│   │   │   ├── employee/page.tsx
│   │   │   ├── manager/page.tsx
│   │   │   ├── owner/page.tsx
│   │   │   ├── inventory/
│   │   │   ├── production/
│   │   │   ├── overboards/
│   │   │   ├── cleaning/
│   │   │   └── hours/
│   │   ├── entry/                  # Quick-entry screens (QR targets)
│   │   │   ├── drinks/page.tsx
│   │   │   ├── donuts/page.tsx
│   │   │   ├── sales/page.tsx
│   │   │   ├── dogels/page.tsx
│   │   │   └── sandwiches/page.tsx
│   │   ├── qr-sign/page.tsx        # Public QR code sign
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── sales/
│   │       ├── drinks/
│   │       ├── production/
│   │       ├── inventory/
│   │       ├── prediction/
│   │       ├── overboards/
│   │       ├── hours/
│   │       ├── cleaning/
│   │       ├── weather/
│   │       └── reports/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── charts/                 # Recharts wrappers
│   │   ├── forms/                  # Mobile data entry forms
│   │   ├── qr/                     # QR code components
│   │   └── layouts/                # Role-based nav
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── prediction.ts
│   │   ├── cogs.ts
│   │   └── weather.ts
│   └── types/
├── public/
└── package.json
```

## Data Flow
1. Employee scans QR code → lands on mobile-optimized entry form
2. Form submits to API route → validates → writes to DB
3. Manager dashboard reads from DB → aggregates KPIs → renders charts
4. Prediction engine runs nightly (or on-demand): fetches weather → reads history → calculates par levels → generates par sheet
5. Inventory orders flow: draft → submitted → received → stock updated → COGS recalculated

## Routing
- `/qr-sign` — Public, shows QR codes
- `/entry/*` — Authenticated (employee+), mobile forms
- `/employee` — Employee dashboard
- `/manager` — Manager KPI dashboard
- `/owner` — Owner financial dashboard
- `/inventory` — Inventory management (manager+)
- `/production` — Par sheets & prediction (manager+)
- `/overboards` — Overboard calendar (all roles)
- `/cleaning` — Cleaning/maintenance (all roles)
- `/hours` — Time tracking (all roles)