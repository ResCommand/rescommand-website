# Duffers OS — Multi-Tenant SaaS Architecture

## Overview
Transform Duffers OS from a single-restaurant app into a white-label SaaS platform
that any restaurant can sign up for, configure, and use as their own operations system.

## Multi-Tenancy Model: Shared Database with `tenant_id`

Every table gets a `tenant_id` column. All queries are scoped to the current tenant.
This is the most cost-effective approach and is used by Shopify, Toast, and Square.

### Why NOT separate databases or containers per tenant?
- Separate containers: $10-20/mo per tenant (not viable at scale)
- Separate databases: operational overhead, migration complexity
- Shared DB + tenant_id: $0 marginal cost, simple operations, proven pattern

## Core Concepts

### Tenant
A restaurant/business. Has its own branding, users, products, inventory, etc.
Identified by subdomain: `bobsbakery.duffersos.com`

### TenantUser
A user who belongs to a tenant. Has a role within that tenant.
A user can belong to multiple tenants (e.g., a consultant managing multiple restaurants).

### Business Type Templates
Pre-built configurations for different restaurant types that seed initial data:
- Product categories
- Par sheet templates
- Prep list items with shelf life
- Cleaning task templates
- SOP templates

---

## Database Schema Changes

### New Tables

```sql
-- Tenants (one per restaurant)
CREATE TABLE tenants (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(63) UNIQUE NOT NULL,     -- subdomain: "bobsbakery"
  name          VARCHAR(255) NOT NULL,            -- "Bob's Bakery"
  app_name      VARCHAR(255),                     -- "Bob's Bakery OS" (shown in UI)
  logo_url      VARCHAR(500),                     -- uploaded logo
  brand_color   VARCHAR(7) DEFAULT '#4F46E5',     -- primary accent color
  business_type ENUM('donut_shop','bakery','cafe','restaurant','bar','food_truck','other'),
  custom_domain VARCHAR(255),                     -- optional: ops.bobsbakery.com
  plan          ENUM('trial','starter','pro','enterprise') DEFAULT 'trial',
  plan_status   ENUM('active','past_due','canceled') DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  trial_ends_at DATETIME,
  settings      JSON,                             -- flexible tenant-level settings
  created_at    DATETIME DEFAULT NOW(),
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW()
);

-- Join table: users can belong to multiple tenants
CREATE TABLE tenant_users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id   INT NOT NULL REFERENCES tenants(id),
  user_id     INT NOT NULL REFERENCES users(id),
  role        ENUM('owner','manager','employee') NOT NULL,
  invited_at  DATETIME,
  accepted_at DATETIME,
  UNIQUE(tenant_id, user_id)
);

-- Tenant invitations
CREATE TABLE tenant_invitations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id   INT NOT NULL REFERENCES tenants(id),
  email       VARCHAR(255) NOT NULL,
  role        ENUM('owner','manager','employee') NOT NULL,
  token       VARCHAR(255) UNIQUE NOT NULL,
  expires_at  DATETIME NOT NULL,
  accepted_at DATETIME,
  created_at  DATETIME DEFAULT NOW()
);

-- Business type templates (global, shared across all tenants)
CREATE TABLE business_templates (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  business_type   ENUM('donut_shop','bakery','cafe','restaurant','bar','food_truck','other'),
  category        VARCHAR(100),          -- "product_categories", "prep_items", "cleaning_tasks", etc.
  name            VARCHAR(255),
  data            JSON,                  -- the actual template data
  sort_order      INT DEFAULT 0
);

-- Onboarding progress per tenant
CREATE TABLE onboarding_steps (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id   INT NOT NULL REFERENCES tenants(id),
  step        VARCHAR(100) NOT NULL,     -- "account", "identity", "business_type", "products", "par_sheets", "staff"
  completed   BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,
  UNIQUE(tenant_id, step)
);
```

### Existing Tables — Add `tenant_id`
Every existing table gets a new column:

```sql
ALTER TABLE users ADD tenant_id INT;
ALTER TABLE products ADD tenant_id INT;
ALTER TABLE product_categories ADD tenant_id INT;
ALTER TABLE transactions ADD tenant_id INT;
ALTER TABLE vendors ADD tenant_id INT;
ALTER TABLE inventory_items ADD tenant_id INT;
ALTER TABLE recipes ADD tenant_id INT;
ALTER TABLE cleaning_tasks ADD tenant_id INT;
ALTER TABLE cleaning_logs ADD tenant_id INT;
ALTER TABLE sops ADD tenant_id INT;
ALTER TABLE overboard_schedules ADD tenant_id INT;
ALTER TABLE holiday_schedules ADD tenant_id INT;
ALTER TABLE par_sheets ADD tenant_id INT;
ALTER TABLE production_target_overrides ADD tenant_id INT;
ALTER TABLE batch_completions ADD tenant_id INT;
ALTER TABLE drink_logs ADD tenant_id INT;
ALTER TABLE donut_logs ADD tenant_id INT;
ALTER TABLE espresso_dial_logs ADD tenant_id INT;
ALTER TABLE employee_hours ADD tenant_id INT;
-- etc.
```

All queries must include `WHERE tenant_id = ?`. Prisma middleware or a client extension
will enforce this automatically.

---

## Routing & Subdomain Architecture

### Subdomain Resolution
```
bobsbakery.duffersos.com  →  resolves tenant by slug "bobsbakery"
ops.bobsbakery.com        →  resolves tenant by custom_domain (if configured)
duffersos.com             →  landing page / marketing site
app.duffersos.com         →  signup / login portal
```

### Middleware Flow
1. Request arrives → extract subdomain from Host header
2. Look up tenant by slug (cached in Redis/memory)
3. Set `tenantId` on the request context
4. All DB queries scoped to that tenant

### Caddy Configuration
Single wildcard route:
```
*.duffersos.com {
  reverse_proxy localhost:3000
}
```

---

## Onboarding Wizard Flow

### Step 1: Account Creation
- Name, email, password
- Creates a User record (global, no tenant yet)

### Step 2: Restaurant Identity
- Restaurant name
- Choose a subdomain (slug) — live availability check
- Upload logo
- Pick brand color
- App name (defaults to "{Restaurant Name} OS")

### Step 3: Business Type
- Select from: Donut Shop, Bakery, Café, Restaurant, Bar, Food Truck, Other
- This determines which templates to seed

### Step 4: Product Setup
- Show template categories for their business type
- They can edit, add, remove categories and items
- Or start from scratch

### Step 5: Par Sheet Config
- Based on business type template, show default par sheet structure
- They customize categories, items, target amounts
- Prep list items with shelf life are pre-filled

### Step 6: Staff Setup
- Add employees by name (quick add) or email (sends invite)
- Assign roles: Owner, Manager, Employee

### Step 7: Done
- Their tenant is fully configured
- Redirect to their dashboard at `{slug}.duffersos.com`

---

## Authentication Changes

### Global Auth (Portal)
- `app.duffersos.com` — login/signup for the platform
- After login, user sees their list of tenants (if multiple)
- Selecting a tenant redirects to `{slug}.duffersos.com`

### Tenant Auth
- `{slug}.duffersos.com/login` — tenant-specific login page
- Shows tenant's logo and app name
- Authenticates against tenant_users join table
- Session includes `tenantId`

### Session Token
JWT payload extended:
```json
{
  "sub": "user_id",
  "tenantId": 42,
  "role": "owner",
  "tenantSlug": "bobsbakery"
}
```

---

## Customization System

### Per-Tenant Settings (stored in tenants.settings JSON)
```json
{
  "appName": "Bob's Bakery OS",
  "logoUrl": "/uploads/tenants/42/logo.png",
  "brandColor": "#8B4513",
  "businessType": "bakery",
  "roleNames": {
    "owner": "Owner",
    "manager": "Shift Lead",
    "employee": "Team Member"
  },
  "features": {
    "predictions": true,
    "overboards": true,
    "espresso": false,
    "sandwiches": true
  },
  "prepCategories": ["Doughs", "Fillings", "Glazes", "Toppings"],
  "parSheetColumns": ["item", "target", "actual", "variance"]
}
```

### Dynamic Branding
- Login page: tenant logo, app name, brand color
- Dashboard header: tenant logo
- Page title: "{appName} — {page}"
- Email notifications: from "{appName} <noreply@duffersos.com>"
- PWA manifest: generated per-tenant with their name and icon

---

## Prisma Multi-Tenant Strategy

### Approach: Prisma Client Extension
Use a Prisma client extension that automatically injects `tenant_id` into all queries:

```typescript
// lib/prisma-tenant.ts
function createTenantClient(tenantId: number) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query, model }) {
          // Inject tenant_id into where clauses
          if (args.where) {
            args.where.tenant_id = tenantId;
          }
          if (args.data) {
            args.data.tenant_id = tenantId;
          }
          return query(args);
        },
      },
    },
  });
}
```

This ensures every query is scoped — no risk of cross-tenant data leaks.

---

## API Route Changes

### Current Pattern
```
GET /api/products → returns all products
```

### New Pattern
```
GET /api/products → returns products WHERE tenant_id = currentTenant
```

Achieved by:
1. Middleware extracts tenant from subdomain
2. Sets `request.tenantId`
3. API routes use `createTenantClient(request.tenantId)` instead of raw `prisma`
4. All queries automatically scoped

---

## Billing Integration (Stripe)

### Plans
| Plan | Price | Features |
|---|---|---|
| **Trial** | Free, 14 days | Full access |
| **Starter** | $49/month | Up to 5 users, 1 location |
| **Pro** | $99/month | Unlimited users, 1 location, advanced reports |
| **Enterprise** | $199/month | Multiple locations, API access, priority support |

### Stripe Setup
- Stripe Checkout for signup
- Stripe Customer Portal for plan management
- Webhook handler for subscription events (created, updated, canceled, past_due)
- Plan enforcement middleware (check subscription status before allowing access)

---

## File Structure Changes

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Tenant-specific login
│   │   ├── signup/         # New tenant signup
│   │   └── invite/[token]/ # Employee invitation acceptance
│   ├── (portal)/
│   │   ├── dashboard/      # Tenant selection (if user has multiple)
│   │   ├── settings/       # Account settings
│   │   └── billing/        # Subscription management
│   ├── (tenant)/
│   │   ├── [tenant-slug]/  # All current dashboard routes, scoped to tenant
│   │   │   ├── production/
│   │   │   ├── inventory/
│   │   │   ├── recipes/
│   │   │   └── ...
│   ├── (onboarding)/
│   │   ├── setup/          # Setup wizard steps
│   │   └── welcome/        # Post-signup welcome
│   ├── (marketing)/
│   │   ├── page.tsx        # Landing page (duffersos.com)
│   │   ├── pricing/
│   │   └── features/
│   └── api/
│       ├── auth/
│       ├── tenants/        # Tenant CRUD
│       ├── billing/        # Stripe webhooks
│       ├── onboarding/     # Setup wizard API
│       └── [existing routes] # All scoped by tenant
├── lib/
│   ├── prisma.ts           # Base Prisma client
│   ├── prisma-tenant.ts    # Tenant-scoped client extension
│   ├── tenant-resolver.ts  # Subdomain → tenant lookup
│   ├── auth.ts             # NextAuth with tenant awareness
│   ├── stripe.ts           # Stripe helpers
│   └── templates.ts        # Business type template loader
├── components/
│   ├── branded/            # Brand-aware components (logo, colors)
│   ├── onboarding/         # Setup wizard components
│   └── [existing]
```

---

## Migration Strategy (Duffers → First SaaS Tenant)

1. Add `tenants` table and `tenant_users` table
2. Create tenant #1 for Duffers Donuts (slug: "duffers", business_type: donut_shop)
3. Add `tenant_id` column to all existing tables
4. Set all existing rows to `tenant_id = 1`
5. Deploy the tenant-resolving middleware
6. Map `ops.duffersdonutshop.com` → tenant #1 (same as current)
7. All existing functionality preserved — Duffers becomes the first customer

---

## Phased Implementation Plan

### Phase 1: Foundation (Weeks 1-3)
- Multi-tenant database schema + migration
- Tenant resolver middleware (subdomain routing)
- Prisma client extension for auto-scoping
- Migrate Duffers as tenant #1 (zero downtime)

### Phase 2: Onboarding (Weeks 3-5)
- Signup flow (account creation + tenant creation)
- Setup wizard (identity, business type, products, par sheets, staff)
- Business type templates (start with donut_shop and bakery)
- Invitation system for staff

### Phase 3: Customization (Weeks 5-7)
- Per-tenant branding (logo, app name, colors)
- Dynamic login page
- Dynamic PWA manifest
- Feature flags per tenant
- Editable prep list items and shelf life

### Phase 4: Billing (Weeks 7-9)
- Stripe integration (checkout, webhooks, portal)
- Plan definitions and enforcement
- Trial management
- Landing page + pricing page

### Phase 5: Launch Prep (Weeks 9-11)
- Email notifications (welcome, invite, receipt)
- Audit logging (who did what, when)
- Rate limiting
- Monitoring and alerting
- Documentation for restaurant owners

### Phase 6: Mobile App (Weeks 11-14)
- Capacitor wrapper for iOS + Android
- Push notifications
- Biometric login
- App Store + Google Play submission