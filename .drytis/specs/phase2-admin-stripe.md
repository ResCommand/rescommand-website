# Phase 2: ResCommand Admin Dashboard + Stripe Billing

## Overview
Build the full ResCommand platform admin dashboard with real Stripe integration, customer management, revenue analytics, pricing controls, and per-tenant billing.

## Tech Stack
- Stripe Node.js SDK (stripe)
- Recharts for revenue charts
- Existing Prisma + NextAuth multi-tenant foundation

## Features

### 1. Stripe Integration
- Connect Stripe account via env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- Create Stripe Products + Prices for each plan tier on setup
- Webhook handler for subscription events (checkout.completed, invoice.paid, customer.subscription.updated/deleted)
- Customer portal for tenants to manage payment methods

### 2. Platform Admin Dashboard (/admin)
**Access**: Super admin only (users with isPlatformAdmin flag or specific email domain)

**Dashboard Tab**:
- MRR / ARR cards
- Revenue trend chart (last 12 months)
- Active/churned tenants chart
- New signups this month
- Plan distribution pie chart

**Tenants Tab**:
- Full tenant list with search/filter
- Tenant detail view (click row → slide-over or modal)
  - Edit name, slug, domain, plan, business type
  - Suspend / Activate
  - Change plan (triggers Stripe subscription update)
  - Impersonate (log in as tenant owner)
  - View staff count, module usage, last login
- Bulk actions (suspend selected, export CSV)

**Billing Tab**:
- Connected Stripe account info
- Recent payments list
- Failed payments / past due
- Revenue by plan breakdown
- Invoice history

**Pricing Tab**:
- Edit plan names, prices, features
- Save updates to DB (and sync to Stripe if price changes)
- Add/remove plan tiers

### 3. Tenant Billing Page (/billing)
- Current plan display
- Plan comparison table
- Upgrade/downgrade buttons (→ Stripe Checkout)
- Payment method management (→ Stripe Customer Portal)
- Invoice history
- Cancel subscription

### 4. Subscription Flow
- New tenant signup → 14-day free trial (no card required)
- Trial ending → email reminder (future)
- Upgrade plan → Stripe Checkout Session
- Downgrade → takes effect at end of billing period
- Cancel → access until end of period, then suspended

## API Routes
- `/api/platform/dashboard` — GET stats (MRR, tenants, revenue)
- `/api/platform/tenants/[id]` — GET/PUT/PATCH tenant management
- `/api/platform/tenants/[id]/impersonate` — POST generate impersonation token
- `/api/platform/pricing` — GET/PUT plan pricing
- `/api/stripe/checkout` — POST create checkout session
- `/api/stripe/portal` — POST create customer portal session
- `/api/stripe/webhook` — POST handle Stripe webhooks
- `/api/billing` — GET current tenant's subscription info

## DB Changes
- Add `isPlatformAdmin` boolean to User model (default false)
- Add `stripeCustomerId` to Tenant (already exists)
- Add `trialEndsAt` to Tenant
- Add PlanPricing model (key, name, price, stripePriceId, features, active)
- Seed 4 default plans on first run

## Acceptance Criteria
- [ ] Stripe integration connects and creates products/prices
- [ ] Webhook handler processes subscription events
- [ ] Admin dashboard shows real MRR, tenant count, revenue charts
- [ ] Tenants can be managed (edit, suspend, activate, change plan)
- [ ] Pricing can be edited from admin
- [ ] Tenant billing page shows plan, allows upgrade via Stripe Checkout
- [ ] Customer portal link for payment method management
- [ ] New tenants get 14-day trial automatically
- [ ] Impersonation works for platform admins
- [ ] Build passes, deployed to production