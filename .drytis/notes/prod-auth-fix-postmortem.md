# Production Auth Fix Postmortem

## Problem
Login appeared to do nothing — stayed on login screen with no error message.

## Root Causes (3 stacked issues)
1. **NEXTAUTH_URL was wrong** — defaulted to internal `prod-duffers-os-amefl9.drytis.dev` URL instead of `ops.duffersdonutshop.com`. Fixed by setting production env override.
2. **Middleware used getToken() from next-auth/jwt** — This function has a bug in the Edge Runtime behind reverse proxies. It derives `secureCookie=true` from NEXTAUTH_URL (https://), which changes the cookie name it looks for to `__Secure-next-auth.session-token`, but the actual cookie is named `next-auth.session-token`. Even with `secureCookie: false` override, getToken still returned null due to JWT decryption failure in the Edge Runtime.
3. **Edge Runtime lacks NEXTAUTH_SECRET** — The middleware manifest only includes Next.js internal env vars, not custom runtime vars. Without the secret, JWT decode always fails.

## Fix
Middleware now checks for session cookie presence only (`request.cookies.has("next-auth.session-token")`). Actual session verification happens server-side via `getServerSession()` in API routes and page components. This is sufficient because:
- Unauthenticated users have no session cookie → redirected to login
- Tampered cookies fail server-side verification → data is protected
- The middleware is just a fast first-gate check

## Key Lesson
Next.js Edge Runtime middleware does NOT have access to runtime env vars from .env files — only build-time-injected vars appear in the middleware manifest's `env` block. Never rely on `process.env.CUSTOM_VAR` in middleware for secrets needed for crypto operations.