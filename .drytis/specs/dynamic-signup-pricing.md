# Dynamic Signup Pricing — Pull from DB instead of hardcoded

## Problem
The signup page (`src/app/(auth)/signup/page.tsx`) hardcodes plan pricing in a `PLANS` constant at lines 38-66. The admin platform (`/platform`) already has a Pricing tab that edits the `PlanPricing` DB table via `/api/platform/pricing`. But changes made there don't affect the signup page because it ignores the DB entirely.

Similarly, `src/lib/stripe.ts` has a hardcoded `PLANS` constant that could drift from the DB.

The signup page shows 3 plans ($49, $99, $199) but the admin shows 2 ("Core $99" and "Operator $99") — the admin pricing changes aren't reflected at signup.

## Solution
1. **Signup page**: Fetch active, non-test plans from `/api/platform/pricing` (GET is already public, no auth required) on mount, and render those instead of the hardcoded `PLANS` array.
2. **Stripe checkout during signup**: The signup flow currently calls `/api/stripe/checkout` which requires auth (session). During signup, the user isn't authenticated yet. The signup wizard sends `planKey` + `tenantId` + `email` in its checkout call. We need a separate unauthenticated checkout endpoint or modify the existing one to handle the signup case.
3. **Fallback**: Keep the hardcoded `PLANS` as a fallback in case the API call fails, so signup still works if the DB is unreachable.

## Files to Change
1. `src/app/(auth)/signup/page.tsx` — Replace hardcoded PLANS with dynamic fetch from `/api/platform/pricing`
2. `src/app/api/stripe/checkout/route.ts` — Handle unauthenticated checkout for signup (accept tenantId + email in body when no session)
3. `src/lib/stripe.ts` — Remove or deprecate hardcoded `PLANS` constant (keep for backward compat only)

## Acceptance Criteria
- [ ] Signup page fetches plans from `/api/platform/pricing` on load
- [ ] Plans shown on signup reflect what's in the `PlanPricing` DB table (name, price, features, staff limit)
- [ ] Only active, non-test plans are shown (filter out TEST and inactive)
- [ ] If API call fails, gracefully falls back to hardcoded defaults
- [ ] Admin can change plan prices in the platform Pricing tab and those changes show on signup immediately
- [ ] Stripe checkout still works during signup (unauthenticated user)
- [ ] Billing page (in-dashboard) still works as before (it already reads from DB)
- [ ] Loading state shown while fetching plans

## Tests
- Unit: Plan parsing / filtering logic
- Integration: `/api/platform/pricing` GET returns active plans
- Integration: Signup flow with dynamic plans
