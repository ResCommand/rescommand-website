# Duffera Donuts Ops — v1 Specification

## Overview
Mobile-first operations PWA for Duffera Donuts. Three user roles: Employee, Manager, Owner.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui — light theme only
- **Database**: MySQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials provider, role-based)
- **Charts**: Recharts
- **QR Codes**: qrcode.react
- **Weather**: Open-Meteo API (free, no key needed)

## Key Decisions
- Mobile-first: all data entry forms optimized for phone screens
- QR sign page: public page with 5-6 QR codes that deep-link to employee input screens
- Light theme only — clean, simple UI
- Prediction engine: rule-based with weather + holiday + historical data
- FoH/BoH split on inventory via category flag
- COGS calculated from ingredient costs → product costs