# ResCommand System Architecture Guide

## How Everything Connects

```
User visits app.rescommand.com
        │
        ▼
┌─────────────────┐
│   Cloudflare     │  DNS + CDN (Free tier)
│   nameserver     │  CNAME: app → rescommand-production.up.railway.app
│   rescommand.com │  DNS only (grey cloud, no proxy)
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Railway               │  Hosting platform (~$20/mo)
│   rescommand service    │  Port 3000, Node.js 22
│   .up.railway.app       │  Auto-deploys from GitHub push
├─────────────────────────┤
│   MySQL service         │  Managed database
│   DATABASE_URL linked   │  Referenced as ${{MYSQL.MYSQL_URL}}
└─────────────────────────┘
         │ pulls code from
         ▼
┌─────────────────────────┐
│   GitHub                │  Code repository (Private)
│   jshawngarrison-ctrl/  │  Push to main → Railway auto-deploys
│   rescommand            │  No manual deploy needed
└─────────────────────────┘
```

## The Three Platforms

### 1. GitHub (Code Storage)
- **URL:** github.com/jshawngarrison-ctrl/rescommand
- **What it does:** Stores all source code
- **How to update:** Push code to `main` branch → Railway auto-deploys
- **Credentials:** Your GitHub account (jshawngarrison-ctrl)

### 2. Railway (Hosting)
- **URL:** railway.com/dashboard
- **What it does:** Runs the app + MySQL database
- **App URL:** rescommand-production.up.railway.app
- **Custom domain:** app.rescommand.com → Port 3000
- **How to update:** Automatic on GitHub push (takes ~3 min)
- **Environment variables:** Set in Railway → rescommand → Variables tab

### 3. Cloudflare (DNS + Domain)
- **URL:** dash.cloudflare.com
- **What it does:** Routes domain names to Railway
- **Domain:** rescommand.com
- **DNS record:** CNAME `app` → `rescommand-production.up.railway.app`
- **Proxy:** OFF (grey cloud, DNS only)

## Environment Variables (in Railway)

| Variable | What It Does | Value Source |
|----------|-------------|-------------|
| `DATABASE_URL` | MySQL connection string | Reference: ${{MYSQL.MYSQL_URL}} |
| `NEXTAUTH_SECRET` | Encrypts auth sessions | Random string |
| `NEXTAUTH_URL` | App's public URL | https://app.rescommand.com |
| `NODE_ENV` | Runtime mode | production |
| `PORT` | App listen port | 3000 |
| `OPENAI_API_KEY` | LLM access for import feature | Drytis LLM gateway key |
| `OPENAI_BASE_URL` | LLM gateway URL | https://llm.drytis.ai |
| `STRIPE_SECRET_KEY` | Stripe payments (test mode) | sk_test_... |
| `STRIPE_PUBLISHABLE_KEY` | Stripe frontend key | pk_test_... |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook validation | whsec_... |

## How to Deploy Code Updates

1. Make code changes in Drytis workspace
2. `git add -A && git commit -m "description" && git push origin main`
3. Push to GitHub: use the push_branch_and_open_pr tool targeting jshawngarrison-ctrl/rescommand
4. Railway auto-detects the push and rebuilds (~3 minutes)
5. No DNS changes, no IP updates, no manual steps
6. Verify: visit https://app.rescommand.com

## How to Add a Customer Domain (e.g., ops.duffersdonutshop.com)

1. In Railway → rescommand → Settings → Domains → "+ Custom Domain"
2. Enter the customer's domain (e.g., ops.duffersdonutshop.com)
3. Railway provides a CNAME target
4. Customer adds CNAME record at THEIR DNS provider: `ops → [Railway CNAME target]`
5. Set port to **3000** (not 8080!)
6. Done — no IP addresses ever

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (React 19, Turbopack) |
| Backend | Next.js API routes |
| Database | MySQL (Prisma ORM) |
| Auth | NextAuth.js (credentials, JWT sessions) |
| Payments | Stripe (test mode) |
| AI/LLM | Drytis LLM Gateway (OpenAI-compatible) |
| Hosting | Railway (auto-deploy from GitHub) |
| DNS | Cloudflare |

## Customer: Duffers Donuts

- **Domain:** ops.duffersdonutshop.com (still on Drytis, needs migration)
- **Login:** hello@duffersdonutshop.com / password
- **Plan:** TEST ($1/mo via Stripe test mode)
- **Branding:** "Duffers OS powered by ResCommand"

## Troubleshooting

### "502 Bad Gateway"
- App crashed or wrong port. Check Railway deploy logs.
- Ensure custom domain maps to **Port 3000** (not 8080)

### "Build failed" in Railway
- Check deploy logs for errors
- Common: missing env variable, TypeScript error, npm install failure

### App deploys but changes don't appear
- Railway may have cached the build. Try: Railway → Deployments → Redeploy

### Can't connect to database
- Ensure `DATABASE_URL` variable uses reference syntax: `${{MYSQL.MYSQL_URL}}`
- Check MySQL service is running in Railway

### Stripe webhooks not working
- Stripe webhook URL should be: https://app.rescommand.com/api/stripe/webhook
- Ensure STRIPE_WEBHOOK_SECRET matches the webhook endpoint in Stripe

### LLM import not working
- Check OPENAI_API_KEY and OPENAI_BASE_URL are set in Railway variables
- Test: https://app.rescommand.com/api/health should return {"status":"ok"}