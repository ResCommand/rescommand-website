# Deployment Guide

## Architecture

```
Feature branch → PR to staging → CI (lint/test/build) → Merge → Railway staging
                                                                      ↓
                                                              QA verification
                                                                      ↓
                                                     PR staging → main → Railway prod
```

## Environments

| Environment | Branch | Railway Service | Domain | Database |
|---|---|---|---|---|
| Dev | feature branches | Drytis container | preview.drytis.dev | Local MySQL (seeded) |
| Staging | `staging` | Railway staging | staging.app.rescommand.com | Railway staging DB |
| Production | `main` | Railway production | app.rescommand.com | Railway prod DB |

## Workflow

### Making a change

1. **Branch off staging:**
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feature/your-feature
   ```

2. **Make changes, write tests, verify locally:**
   ```bash
   npm run build && npx jest --forceExit
   ```

3. **Push and open PR to staging:**
   ```bash
   git push origin feature/your-feature
   ```
   Open a PR on GitHub targeting `staging`. CI runs automatically.

4. **Merge to staging after CI passes.** Railway auto-deploys.

5. **QA on staging.** Verify the feature works at `staging.app.rescommand.com`.

6. **Promote to production:**
   - Open a PR from `staging` → `main`
   - CI runs again
   - Merge → Railway auto-deploys to production

### Branch protection rules (set up in GitHub settings)

**`main` branch:**
- Require pull request before merging
- Require status checks: `Lint`, `Unit Tests`, `Build`
- Require branches to be up to date before merging
- Do not allow force pushes

**`staging` branch:**
- Require pull request before merging
- Require status checks: `Lint`, `Unit Tests`, `Build`

### Setting up Railway staging service

1. In Railway, create a new service from the same repo
2. Set the deploy branch to `staging`
3. Add a MySQL database service for staging
4. Set environment variables:
   ```
   DATABASE_URL=<railway staging mysql url>
   AUTH_SECRET=<generate new secret>
   AUTH_URL=https://staging.app.rescommand.com
   AUTH_TRUST_HOST=true
   NODE_ENV=production
   STRIPE_SECRET_KEY=<test key for staging>
   STRIPE_WEBHOOK_SECRET=<staging webhook secret>
   STRIPE_PUBLISHABLE_KEY=<test publishable key>
   OPENAI_API_KEY=<key>
   OPENAI_BASE_URL=<base url>
   ```
5. Add custom domain `staging.app.rescommand.com`

## Database Migrations

All schema changes go through Prisma migrations:

1. **Edit `prisma/schema.prisma`**
2. **Create migration:**
   ```bash
   npx prisma migrate dev --name describe-the-change
   ```
3. **Commit both `schema.prisma` and the new `prisma/migrations/` files**
4. **Migrations apply automatically** on deploy via `prisma migrate deploy` in the setup script

Never use `prisma db push` in production. Never run raw SQL `ALTER TABLE` or `CREATE TABLE`.

## Secrets & Environment Variables

- Never commit `.env` files (they're in `.gitignore`)
- Use `.env.example` as a template for what variables are needed
- Railway stores all production secrets in its dashboard
- Generate a new `AUTH_SECRET` per environment: `openssl rand -base64 32`

## Rollback

If production breaks:

1. **Immediate:** Revert the merge commit on `main`, push, Railway auto-deploys
   ```bash
   git revert <merge-commit-sha>
   git push origin main
   ```

2. **Database rollback (if migration broke something):**
   - Railway keeps previous deployment available
   - For migrations: `npx prisma migrate resolve --rolled-back <migration-name>` (manual, case-by-case)

## Single Source of Truth

**GitHub is the only repo.** The Drytis Gitea repo is the dev environment's origin but all code should be pushed to GitHub for production deployment. To keep them in sync:

```bash
git fetch drytis main
git reset --hard drytis/main
git push origin main --force
```

Ideally, configure Drytis to push to GitHub automatically so this manual step is eliminated.
