# Multi-Tenancy Architecture — ResCommand Platform

## Overview
ResCommand is a SaaS platform owned by Venturio LLC. Restaurants sign up, get their own subdomain (e.g. duffersdonutshop.rescommand.com), and operate independently. Duffers Donuts is tenant #1.

## Tenancy Model
- **Shared database** with `tenant_id` on every business-data row
- **Row-level isolation** via Prisma client extension (auto-filters all queries by tenant)
- **Subdomain routing**: *.rescommand.com → resolve hostname → inject tenant context
- **Custom domains** (future): ops.duffersdonutshop.com → CNAME to tenant

## Models

### Tenant
| Field | Type | Notes |
|-------|------|-------|
| id | Int (auto) | Primary key |
| name | String | "Duffers Donut Shop" |
| slug | String (unique) | "duffersdonutshop" — used for subdomain |
| domain | String? (unique) | Custom domain, e.g. "ops.duffersdonutshop.com" |
| businessType | String | DONUT_SHOP, BAKERY, CAFE, RESTAURANT, BAR, FOOD_TRUCK |
| plan | String | FREE, STARTER ($49), PROFESSIONAL ($99), ENTERPRISE ($199) |
| stripeCustomerId | String? | Stripe customer ID |
| active | Boolean | Can suspend tenants |
| logoUrl | String? | Tenant logo |
| primaryColor | String? | Brand color |
| settings | Json? | Per-tenant config |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### TenantUser (membership)
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| tenantId | Int | FK to Tenant |
| userId | Int | FK to User (global) |
| role | String | OWNER, MANAGER, EMPLOYEE |
| invitedBy | Int? | Who invited them |
| acceptedAt | DateTime? | null = pending invite |
| active | Boolean | |

### TenantSubscription (billing)
| Field | Type | Notes |
|-------|------|-------|
| id | Int | |
| tenantId | Int | FK to Tenant |
| stripeSubscriptionId | String | |
| stripePriceId | String | |
| status | String | active, past_due, canceled, trialing |
| currentPeriodStart | DateTime | |
| currentPeriodEnd | DateTime | |
| cancelAtPeriodEnd | Boolean | |

## Auth Flow
1. User visits duffersdonutshop.rescommand.com
2. Middleware resolves subdomain → Tenant record
3. NextAuth JWT includes: { sub: userId, tenantId, role, email }
4. All API routes use Prisma extension auto-scoping

## Subdomain Routing
- `rescommand.com` → Landing page / signup
- `rescommand.com/admin` → Super admin (Venturio only)
- `*.rescommand.com` → Tenant app (resolved by subdomain)
- Custom domains → Tenant app (resolved by domain lookup)

## Data Isolation
- Prisma client extension wraps all queries with `where: { tenantId }`
- Write operations inject `tenantId` from session
- Cross-tenant queries only in super admin routes
- No tenant_id on: Tenant, TenantUser, TenantSubscription (platform-level)

## Business Type Templates
Each business type seeds:
- Product categories + sample products
- Employee categories (FOH, BOH, etc.)
- Prep list items with shelf lives
- Par sheet defaults
- Module configs (which modules are enabled)
- Sample SOPs

## Onboarding Wizard (5 steps)
1. **Business Info**: Name, type selector, logo upload
2. **Pick Features**: Module toggles (pre-selected by type, user can change)
3. **Owner Account**: Name, email, password
4. **Add Team**: Invite team members (optional, can skip)
5. **Done**: Show subdomain URL, next steps

## API Surface
- POST /api/tenants — Create tenant (from wizard)
- GET /api/tenants/current — Get current tenant from subdomain
- PUT /api/tenants/current — Update tenant settings
- GET /api/admin/tenants — Super admin: list all tenants
- GET /api/admin/tenants/:id — Super admin: tenant detail
- POST /api/admin/tenants/:id/suspend — Suspend tenant
- POST /api/stripe/webhook — Stripe webhook handler
- POST /api/stripe/checkout — Create checkout session