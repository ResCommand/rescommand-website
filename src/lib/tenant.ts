import { auth } from "@/auth";

/**
 * Extract tenantId from the current session.
 * Throws if unauthenticated — use this in protected API routes.
 */
export async function getTenantId(): Promise<number> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const tenantId = (session.user as { tenantId?: string | number })?.tenantId;
  if (!tenantId) throw new Error("No tenant context");
  return typeof tenantId === "string" ? parseInt(tenantId) : tenantId;
}

/**
 * Extract both userId and tenantId from the current session.
 */
export async function getSessionContext(): Promise<{ userId: number; tenantId: number; role: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const user = session.user as { id?: string; tenantId?: string | number; role?: string };
  return {
    userId: parseInt(user.id || "0"),
    tenantId: typeof user.tenantId === "string" ? parseInt(user.tenantId) : (user.tenantId || 0),
    role: user.role || "EMPLOYEE",
  };
}
