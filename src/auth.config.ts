import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-compatible auth configuration.
 * Used in proxy.ts (Next.js 16 middleware) — MUST NOT import Prisma, bcryptjs,
 * or any Node.js-only API. The full config with DB access lives in src/auth.ts.
 */
export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant ID", type: "text" },
      },
      authorize: async () => null,
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
        token.tenantId = (user as { tenantId?: string }).tenantId;
        token.tenantSlug = (user as { tenantSlug?: string }).tenantSlug;
        token.tenantName = (user as { tenantName?: string }).tenantName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { tenantId?: string }).tenantId = token.tenantId as string;
        (session.user as { tenantSlug?: string }).tenantSlug = token.tenantSlug as string;
        (session.user as { tenantName?: string }).tenantName = token.tenantName as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
