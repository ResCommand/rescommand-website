# ResCommand Production Deployment Runbook

## Current Deployment
- **Domain:** ops.duffersdonutshop.com
- **Deployment ID:** 105
- **IP:** 135.148.170.200
- **SSL:** Let's Encrypt (Sep 6 2026)

## How to Push Code Updates

### Standard Update Flow
1. Make code changes in dev container
2. `git add -A && git commit -m "..." && git push origin main`
3. **Fresh deploy required** (persistent volume caches `.next`):
   - `stop_production(keep_ip=false)` — releases old IP
   - `deploy_to_production(domain, admin_email)` — gets new IP + fresh volume
   - Update DNS A record for `ops` to the new IP
   - Wait ~2-3 min for setup script (git pull, npm ci, prisma, seed, build)
   - Wait ~1 min for SSL cert provisioning (Let's Encrypt)
4. After deploy, hit `/api/tenants/fix-users` to ensure users are seeded
5. Verify: `curl -sf https://ops.duffersdonutshop.com/api/health`

### Important Notes
- **`redeploy_production` does NOT pick up new code** — the persistent volume caches the old `.next` build
- **`restart_production` does NOT pick up new code** — same reason
- **Only `stop + deploy` with `keep_ip=false`** gets a fresh volume
- This means **every code push changes the public IP** — DNS must be updated
- The setup script now includes user seeding (seed-users-runner.js) so users are auto-created

## User Accounts
- hello@duffersdonutshop.com / password (OWNER)
- manager@duffers.com / password (MANAGER)
- employee@duffers.com / password (EMPLOYEE)
- bob@duffers.com / password (EMPLOYEE)

## Setup Script Flow
1. git pull origin main
2. rm -rf .next (nuclear cache clear)
3. npm ci --prefer-offline (FATAL if fails)
4. prisma generate + db push (FATAL if fails)
5. npm run seed (includes inventory + user seeding, non-fatal)
6. npm run build (FATAL if fails)
7. Records BUILD_COMMIT in .next for verification

## Known Issues
- Prod terminal (prod_run_bash) is not reachable via API — can't debug in-container
- Health check endpoint exists at /api/health but middleware may not allow it through on first deploy
- Deployment shows "unhealthy" because health check endpoint requires auth (middleware issue)
- NEXTAUTH_URL must match the production domain for CSRF to work