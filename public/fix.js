diff --git a/src/app/(auth)/login/page.tsx b/src/app/(auth)/login/page.tsx
index db37483..47cab2f 100644
--- a/src/app/(auth)/login/page.tsx
+++ b/src/app/(auth)/login/page.tsx
@@ -1,6 +1,7 @@
 "use client";
 import { signIn } from "next-auth/react";
-import { useState, useEffect } from "react";
+import { useState } from "react";
+import { Suspense } from "react";
 import { useSearchParams } from "next/navigation";
 
 export default function LoginPage() {
@@ -11,8 +12,6 @@ export default function LoginPage() {
   );
 }
 
-import { Suspense } from "react";
-
 function LoginFallback() {
   return (
     <div style={{
@@ -21,7 +20,6 @@ function LoginFallback() {
       display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
     }}>
       <div style={{ textAlign: "center", color: "#94A3B8" }}>
-        <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid #475569", borderTopColor: "#3B82F6", borderRadius: "50%", margin: "0 auto 16px" }} />
         <p>Loading...</p>
       </div>
     </div>
@@ -35,46 +33,13 @@ function LoginContent() {
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);
-  const [tenantName, setTenantName] = useState("");
-
-  useEffect(() => {
-    // Try to resolve tenant name from subdomain
-    const hostname = window.location.hostname;
-    const parts = hostname.split(".");
-    const platformHosts = ["rescommand.com", "www.rescommand.com", "app.rescommand.com"];
-    if (parts.length >= 2 && !hostname.includes("localhost") && !hostname.includes("127.0.0.1") && !hostname.endsWith(".drytis.dev") && !platformHosts.includes(hostname)) {
-      // Subdomain like duffersdonutshop.rescommand.com (not platform hosts)
-      const slug = parts[0];
-      // Capitalize slug for display
-      setTenantName(slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
-    }
-    // Also try fetching public branding for custom domains (e.g. ops.duffersdonutshop.com)
-    fetch("/api/tenants/branding/public")
-      .then(r => r.ok ? r.json() : null)
-      .then(data => { if (data?.brandName) setTenantName(data.brandName); })
-      .catch(() => {});
-  }, []);
 
   async function handleSubmit(e: React.FormEvent) {
     e.preventDefault();
     setError("");
     setLoading(true);
     try {
-      // If on a subdomain, resolve tenant and pass tenantId
-      let tenantId: string | undefined;
-      const hostname = window.location.hostname;
-      const parts = hostname.split(".");
-      const platformHosts = ["rescommand.com", "www.rescommand.com", "app.rescommand.com"];
-      if (parts.length >= 2 && !hostname.includes("localhost") && !hostname.includes("127.0.0.1") && !hostname.endsWith(".drytis.dev") && !platformHosts.includes(hostname)) {
-        try {
-          const res = await fetch("/api/tenant-resolve?slug=" + parts[0]);
-          if (res.ok) {
-            const data = await res.json();
-            if (data.id) tenantId = String(data.id);
-          }
-        } catch { /* ignore — login will still work without tenant context */ }
-      }
-      const res = await signIn("credentials", { email, password, tenantId, redirect: false });
+      const res = await signIn("credentials", { email, password, redirect: false });
       if (res?.error) setError("Invalid email or password");
       else window.location.href = callbackUrl;
     } catch {
@@ -83,8 +48,6 @@ function LoginContent() {
     setLoading(false);
   }
 
-  const brandName = tenantName || "ResCommand";
-
   return (
     <div style={{
       minHeight: "100vh",
@@ -93,11 +56,8 @@ function LoginContent() {
     }}>
       <div style={{ maxWidth: 400, width: "100%" }}>
         <div style={{ textAlign: "center", marginBottom: 32 }}>
-          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
-            {tenantName || "ResCommand"}
-          </h1>
-          {!tenantName && <p style={{ color: "#94A3B8", fontSize: 14 }}>Restaurant operations, simplified</p>}
-          {tenantName && <p style={{ color: "#94A3B8", fontSize: 14 }}>Sign in to your workspace</p>}
+          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>ResCommand</h1>
+          <p style={{ color: "#94A3B8", fontSize: 14 }}>Restaurant operations, simplified</p>
         </div>
 
         <div style={{ background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
@@ -156,4 +116,4 @@ function LoginContent() {
       </div>
     </div>
   );
-}
\ No newline at end of file
+}
diff --git a/src/app/(auth)/signup/page.tsx b/src/app/(auth)/signup/page.tsx
index 0918528..1c57853 100644
--- a/src/app/(auth)/signup/page.tsx
+++ b/src/app/(auth)/signup/page.tsx
@@ -284,7 +284,7 @@ export default function SignupPage() {
 
               <div style={{ marginBottom: 16, padding: "10px 14px", background: "#F0FDF4", borderRadius: 6, border: "1px solid #BBF7D0" }}>
                 <span style={{ fontSize: 13, color: "#374151" }}>Your URL: </span>
-                <span style={{ fontWeight: 600, color: "#059669" }}>{slugPreview}.rescommand.com</span>
+                <span style={{ fontWeight: 600, color: "#059669" }}>app.rescommand.com</span>
                 <div style={{ marginTop: 4 }}>
                   <input
                     className="form-input" style={{ fontSize: 13, padding: "6px 10px" }}
@@ -554,7 +554,7 @@ export default function SignupPage() {
                 <div style={{ fontSize: 12, color: "#374151", display: "flex", flexDirection: "column", gap: 4 }}>
                   <span>🏢 <strong>{form.name}</strong> — {BUSINESS_TYPES.find(b => b.key === form.businessType)?.label}</span>
                   <span>🏷️ <strong>{form.brandName || form.name}</strong> by ResCommand</span>
-                  <span>🌐 {slugPreview}.rescommand.com</span>
+                  <span>🌐 app.rescommand.com</span>
                   <span>💰 {plans.find(p => p.key === form.plan)?.name} — ${plans.find(p => p.key === form.plan)?.price}/mo</span>
                   <span>👤 {form.ownerName} ({form.ownerEmail})</span>
                   {form.teamMembers.length > 0 && <span>👥 {form.teamMembers.length} team member(s)</span>}
@@ -569,7 +569,7 @@ export default function SignupPage() {
               <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
               <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Welcome to ResCommand!</h2>
               <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
-                Your workspace is ready at <strong>{slugPreview}.rescommand.com</strong>
+                Your workspace is ready! Log in at <strong>app.rescommand.com</strong>
               </p>
               <div style={{ padding: 16, background: "#F0FDF4", borderRadius: 8, marginBottom: 24 }}>
                 <p style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>Next steps:</p>
diff --git a/src/app/(platform)/platform/page.tsx b/src/app/(platform)/platform/page.tsx
index e54dd96..e1a1e8a 100644
--- a/src/app/(platform)/platform/page.tsx
+++ b/src/app/(platform)/platform/page.tsx
@@ -300,7 +300,7 @@ export default function PlatformAdminPage() {
                       <span style={{ fontSize: 18 }}>{TYPE_ICONS[t.businessType] || "🏪"}</span>
                       <div>
                         <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
-                        <div style={{ fontSize: 11, color: "#64748B" }}>{t.slug}.rescommand.com</div>
+                        <div style={{ fontSize: 11, color: "#64748B" }}>/{t.slug}</div>
                       </div>
                     </div>
                     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
@@ -352,7 +352,7 @@ export default function PlatformAdminPage() {
                     >
                       <td style={{ padding: "10px 12px" }}>
                         <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
-                        <div style={{ fontSize: 11, color: "#64748B" }}>{t.slug}.rescommand.com</div>
+                        <div style={{ fontSize: 11, color: "#64748B" }}>/{t.slug}</div>
                       </td>
                       <td style={{ padding: "10px 12px", fontSize: 12 }}>
                         {TYPE_ICONS[t.businessType] || "🏪"} {t.businessType.replace(/_/g, " ")}
@@ -493,7 +493,7 @@ export default function PlatformAdminPage() {
               <Detail label="Staff Members">
                 <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedTenant.members}</span>
               </Detail>
-              <Detail label="Subdomain">{selectedTenant.slug}.rescommand.com</Detail>
+              <Detail label="Slug">{selectedTenant.slug}</Detail>
               <Detail label="Custom Domain">{selectedTenant.domain || "None"}</Detail>
               <Detail label="Stripe Customer">{selectedTenant.stripeCustomerId || "Not linked"}</Detail>
               <Detail label="Created">{new Date(selectedTenant.createdAt).toLocaleDateString()}</Detail>
diff --git a/src/app/api/platform/tenants/[id]/impersonate/route.ts b/src/app/api/platform/tenants/[id]/impersonate/route.ts
index be8179b..6ca4b6a 100644
--- a/src/app/api/platform/tenants/[id]/impersonate/route.ts
+++ b/src/app/api/platform/tenants/[id]/impersonate/route.ts
@@ -4,7 +4,7 @@ import { auth } from "@/auth";
 import { encode } from "next-auth/jwt";
 
 export async function POST(
-  _request: Request,
+  request: Request,
   { params }: { params: Promise<{ id: string }> }
 ) {
   const session = await auth();
@@ -43,9 +43,8 @@ export async function POST(
     salt: "authjs.session-token",
   });
 
-  const domain = membership.tenant.domain || `${membership.tenant.slug}.rescommand.com`;
-  const protocol = "https";
-  const url = `${protocol}://${domain}/api/auth/impersonate?token=${token}`;
+  // Single-domain: relative URL, same domain for all tenants
+  const url = `/api/auth/impersonate?token=${token}`;
 
   return NextResponse.json({ url, tenantName: membership.tenant.name });
-}
\ No newline at end of file
+}
diff --git a/src/app/api/tenant-resolve/route.ts b/src/app/api/tenant-resolve/route.ts
deleted file mode 100644
index 22428e4..0000000
--- a/src/app/api/tenant-resolve/route.ts
+++ /dev/null
@@ -1,31 +0,0 @@
-import { NextResponse } from "next/server";
-import { prisma } from "@/lib/prisma";
-
-// GET /api/tenant-resolve?slug=duffersdonutshop
-// GET /api/tenant-resolve?domain=ops.duffersdonutshop.com
-// Resolves a tenant by subdomain slug or custom domain
-export async function GET(request: Request) {
-  const { searchParams } = new URL(request.url);
-  const slug = searchParams.get("slug");
-  const domain = searchParams.get("domain");
-
-  if (!slug && !domain) {
-    return NextResponse.json({ error: "slug or domain required" }, { status: 400 });
-  }
-
-  const where = slug ? { slug } : { domain };
-  const tenant = await prisma.tenant.findFirst({
-    where: { ...where, active: true },
-    select: {
-      id: true, name: true, slug: true, domain: true,
-      businessType: true, plan: true, logoUrl: true,
-      primaryColor: true, active: true,
-    },
-  });
-
-  if (!tenant) {
-    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
-  }
-
-  return NextResponse.json(tenant);
-}
\ No newline at end of file
diff --git a/src/app/api/tenants/branding/public/route.ts b/src/app/api/tenants/branding/public/route.ts
index cd1d528..fbff047 100644
--- a/src/app/api/tenants/branding/public/route.ts
+++ b/src/app/api/tenants/branding/public/route.ts
@@ -2,9 +2,10 @@ import { NextResponse } from "next/server";
 import { auth } from "@/auth";
 import { prisma } from "@/lib/prisma";
 
-// GET /api/tenants/branding/public — returns { brandName, platformName } without auth
-// Uses the host header to resolve the tenant
-export async function GET(request: Request) {
+// GET /api/tenants/branding/public — returns { brandName, platformName }
+// Single-domain architecture: authenticated users get their tenant branding,
+// unauthenticated users get the default platform branding.
+export async function GET() {
   // If authenticated, use session tenantId
   const session = await auth();
   if (session?.user) {
@@ -22,36 +23,6 @@ export async function GET(request: Request) {
     }
   }
 
-  // Unauthenticated — try to resolve from host header or domain
-  const host = request.headers.get("host") || "";
-  const hostname = host.split(":")[0];
-
-  // Try custom domain match
-  const tenantByDomain = await prisma.tenant.findFirst({
-    where: { domain: hostname, active: true },
-    select: { name: true, settings: true },
-  });
-  if (tenantByDomain) {
-    const settings = (tenantByDomain.settings as Record<string, string>) || {};
-    const brandName = settings.brandName || `${tenantByDomain.name} OS`;
-    return NextResponse.json({ brandName, platformName: "ResCommand" });
-  }
-
-  // Try slug from subdomain (e.g. duffersdonutshop.rescommand.com)
-  const parts = hostname.split(".");
-  if (parts.length >= 2 && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
-    const slug = parts[0];
-    const tenantBySlug = await prisma.tenant.findFirst({
-      where: { slug, active: true },
-      select: { name: true, settings: true },
-    });
-    if (tenantBySlug) {
-      const settings = (tenantBySlug.settings as Record<string, string>) || {};
-      const brandName = settings.brandName || `${tenantBySlug.name} OS`;
-      return NextResponse.json({ brandName, platformName: "ResCommand" });
-    }
-  }
-
   // Default — platform branding
   return NextResponse.json({ brandName: "ResCommand", platformName: "ResCommand" });
-}
\ No newline at end of file
+}
diff --git a/src/app/api/tenants/route.ts b/src/app/api/tenants/route.ts
index 77518c7..4cd9422 100644
--- a/src/app/api/tenants/route.ts
+++ b/src/app/api/tenants/route.ts
@@ -149,7 +149,7 @@ export async function POST(request: Request) {
     id: tenant.id,
     name: tenant.name,
     slug: tenant.slug,
-    url: `${tenant.slug}.rescommand.com`,
+    url: `app.rescommand.com`,
   }, { status: 201 });
   } catch (err) {
     console.error("Tenant creation error:", err);
diff --git a/src/app/layout.tsx b/src/app/layout.tsx
index e91828f..ee34235 100644
--- a/src/app/layout.tsx
+++ b/src/app/layout.tsx
@@ -2,23 +2,26 @@ import type { Metadata } from "next";
 import "./globals.css";
 import { AuthProvider } from "@/components/auth-provider";
 import { Toaster } from "sonner";
+import { auth } from "@/auth";
 
 export const metadata: Metadata = {
-  title: "Duffers OS",
-  description: "Duffera Donuts Operations — inventory, counts, orders, and daily ops",
+  title: "ResCommand",
+  description: "Restaurant operations, simplified",
   manifest: "/manifest.json",
   appleWebApp: {
     capable: true,
     statusBarStyle: "default",
-    title: "Duffers OS",
+    title: "ResCommand",
   },
   openGraph: {
-    title: "Duffers OS",
-    description: "Duffera Donuts Operations",
+    title: "ResCommand",
+    description: "Restaurant operations, simplified",
   },
 };
 
-export default function RootLayout({ children }: { children: React.ReactNode }) {
+export default async function RootLayout({ children }: { children: React.ReactNode }) {
+  const session = await auth();
+
   return (
     <html lang="en">
       <head>
@@ -26,20 +29,14 @@ export default function RootLayout({ children }: { children: React.ReactNode })
         <meta name="mobile-web-app-capable" content="yes" />
       </head>
       <body>
-        <AuthProvider>{children}</AuthProvider>
+        <AuthProvider session={session}>{children}</AuthProvider>
         <Toaster position="bottom-right" />
         <script
           dangerouslySetInnerHTML={{
-            __html: `
-              if ('serviceWorker' in navigator) {
-                window.addEventListener('load', () => {
-                  navigator.serviceWorker.register('/sw.js');
-                });
-              }
-            `,
+            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js'); }); }`,
           }}
         />
       </body>
     </html>
   );
-}
\ No newline at end of file
+}
diff --git a/src/components/auth-provider.tsx b/src/components/auth-provider.tsx
index 2a4d3d5..f40b5ff 100644
--- a/src/components/auth-provider.tsx
+++ b/src/components/auth-provider.tsx
@@ -1,5 +1,13 @@
 "use client";
 import { SessionProvider } from "next-auth/react";
-export function AuthProvider({ children }: { children: React.ReactNode }) {
-  return <SessionProvider>{children}</SessionProvider>;
-}
\ No newline at end of file
+import type { Session } from "next-auth";
+
+export function AuthProvider({
+  children,
+  session,
+}: {
+  children: React.ReactNode;
+  session?: Session | null;
+}) {
+  return <SessionProvider session={session}>{children}</SessionProvider>;
+}
diff --git a/src/proxy.ts b/src/proxy.ts
index 408ffc5..acb8d59 100644
--- a/src/proxy.ts
+++ b/src/proxy.ts
@@ -5,7 +5,8 @@ import { authConfig } from "./auth.config";
 
 /**
  * Next.js 16 proxy (formerly middleware.ts).
- * Uses edge-safe authConfig (NO Prisma/bcryptjs imports).
+ * Single-domain architecture — no subdomain or custom domain parsing.
+ * Auth gate only: redirect to /login if no session cookie.
  */
 
 const PUBLIC_PATHS = [
@@ -15,44 +16,15 @@ const PUBLIC_PATHS = [
   "/api/auth/",
   "/signup",
   "/api/tenants",
-  "/api/tenant-resolve",
   "/api/setup-users",
   "/api/fix-users",
   "/api/health",
 ];
 
-const PLATFORM_PATHS = [
-  "/signup",
-  "/admin",
-  "/api/tenants",
-  "/api/tenant-resolve",
-  "/api/platform",
-];
-
-function isTenantHost(hostname: string): boolean {
-  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
-    return false;
-  }
-  if (hostname.endsWith(".drytis.dev")) {
-    return false;
-  }
-  if (hostname.endsWith(".rescommand.com")) {
-    return hostname !== "rescommand.com" && hostname !== "www.rescommand.com";
-  }
-  return true;
-}
-
-function extractSubdomain(hostname: string): string | null {
-  const match = hostname.match(/^([a-z0-9-]+)\.rescommand\.com$/);
-  if (match) return match[1];
-  return null;
-}
-
 const { auth } = NextAuth(authConfig);
 
 export default auth((request: NextRequest & { auth: unknown }) => {
   const { pathname } = request.nextUrl;
-  const hostname = request.headers.get("host") || request.nextUrl.host;
 
   // Allow static files and Next.js internals
   if (
@@ -63,23 +35,6 @@ export default auth((request: NextRequest & { auth: unknown }) => {
     return NextResponse.next();
   }
 
-  const isTenantSubdomain = isTenantHost(hostname);
-
-  // Platform routes are always accessible
-  if (PLATFORM_PATHS.some((p) => pathname.startsWith(p))) {
-    return NextResponse.next();
-  }
-
-  // Inject tenant context header for API routes
-  if (isTenantSubdomain && pathname.startsWith("/api/")) {
-    const slug = extractSubdomain(hostname);
-    if (slug) {
-      const requestHeaders = new Headers(request.headers);
-      requestHeaders.set("x-tenant-slug", slug);
-      return NextResponse.next({ request: { headers: requestHeaders } });
-    }
-  }
-
   // Allow public paths
   if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
     return NextResponse.next();
