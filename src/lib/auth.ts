import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            tenantMemberships: {
              where: { active: true },
              include: { tenant: { select: { id: true, name: true, slug: true, active: true } } },
            },
          },
        });

        if (!user || !user.active) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        // Determine which tenant to use
        // If tenantId provided (login form), use that
        // Otherwise default to first active membership
        let targetTenant = user.tenantMemberships[0];
        if (credentials.tenantId) {
          const found = user.tenantMemberships.find(
            (m) => m.tenant.id === parseInt(credentials.tenantId!)
          );
          if (found) targetTenant = found;
        }

        // If no tenant membership found, allow login for platform admins
        if (!targetTenant) {
          if (user.isPlatformAdmin) {
            return {
              id: String(user.id),
              email: user.email,
              name: user.name,
              role: "PLATFORM_ADMIN",
              tenantId: undefined,
              tenantSlug: undefined,
              tenantName: undefined,
            };
          }
          return null;
        }

        if (!targetTenant.tenant.active) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.isPlatformAdmin ? "PLATFORM_ADMIN" : targetTenant.role,
          tenantId: String(targetTenant.tenant.id),
          tenantSlug: targetTenant.tenant.slug,
          tenantName: targetTenant.tenant.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
        token.tenantId = (user as { tenantId: string }).tenantId;
        token.tenantSlug = (user as { tenantSlug: string }).tenantSlug;
        token.tenantName = (user as { tenantName: string }).tenantName;
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
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  session: {
    strategy: "jwt",
  },
  // Trust the Caddy reverse proxy — it terminates TLS and forwards as HTTP.
  useSecureCookies: true,
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code-verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
};

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      tenantId?: string;
      tenantSlug?: string;
      tenantName?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
  }
}