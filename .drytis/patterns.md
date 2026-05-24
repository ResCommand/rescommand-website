# Patterns — Duffera Donuts Ops

## Coding Standards
- TypeScript strict mode, no `any` types
- Functional React components with hooks
- Server Components by default, Client Components only when needed (`"use client"`)
- Prisma for all DB queries — no raw SQL
- API routes validate input with Zod schemas

## Naming
- Files: kebab-case (`drink-log-form.tsx`)
- Components: PascalCase (`DrinkLogForm`)
- DB tables: PascalCase in Prisma schema, mapped to snake_case in MySQL
- API routes: kebab-case folders (`/api/drink-logs/`)

## Error Handling
- API routes return `{ error: string }` with appropriate HTTP status
- Client shows toast notifications for errors (sonner)
- Form validation inline with clear messages

## Test Conventions
- Unit tests: `__tests__/` alongside source files
- Integration tests: `src/app/api/*/route.test.ts`
- Test framework: Jest + React Testing Library
- Mock Prisma client in unit tests

## UI Patterns
- Light theme only (warm, donut-shop aesthetic — cream/white bg, dark text, warm accents)
- Mobile-first responsive design
- shadcn/ui components throughout
- Cards for dashboard KPIs
- Bottom-sheet style forms on mobile
- Tab navigation on mobile, sidebar on desktop