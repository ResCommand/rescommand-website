import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./lib/prisma";

/**
 * Full auth configuration with database access.
 * Imported everywhere EXCEPT proxy.ts (which imports auth.config.ts for Edge compatibility).
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials" as const,
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            tenantMemberships: {
              where: { active: true },
              include: { tenant: { select: { id: true, name: true, slug: true, active: true } } },
            },
          },
        });

        if (!user || !user.active) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) return null;

        // Determine which tenant to use
        let targetTenant = user.tenantMemberships[0];
        const tenantId = credentials.tenantId as string | undefined;
        if (tenantId) {
          const found = user.tenantMemberships.find(
            (m) => m.tenant.id === parseInt(tenantId)
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
            } as const;
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
    },
  ],
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "authjs.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: "authjs.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: "authjs.pkce.code-verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
});

// Type augmentations for v5
declare module "next-auth" {
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

  interface User {
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
  }
}
