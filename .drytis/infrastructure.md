# Infrastructure — Duffera Donuts Ops

## Proxy Routes
- Caddy reverse proxy at `/` → port 3000 (Next.js production server)

## Background Services
- `next-server`: `npm run start` on port 3000

## Environment Variables
```
DATABASE_URL         — MySQL connection string (auto-tag)
NEXTAUTH_URL         — Site URL (auto-tag)
NEXTAUTH_SECRET      — Generated secret (static, is_secret)
NODE_ENV             — production
```

## Ports
- 3000 — Next.js production server

## Setup Script
```bash
cd /workspace
npm ci
npx prisma migrate deploy
npm run build
```

## External APIs
- Open-Meteo (free, no key) — weather data for prediction engine