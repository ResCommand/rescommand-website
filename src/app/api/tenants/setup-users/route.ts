import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Setup default users — accessible because /api/tenants is in PUBLIC_PATHS
// GET: creates users if none exist, resets passwords if ?reset=1
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceReset = url.searchParams.get("reset") === "1";

    const passwordHash = await bcrypt.hash("password", 12);

    const users = [
      { name: "Shawn", email: "hello@duffersdonutshop.com", role: "OWNER" as const, isPlatformAdmin: true },
      { name: "Store Manager", email: "manager@duffers.com", role: "MANAGER" as const, isPlatformAdmin: false },
      { name: "Jane Employee", email: "employee@duffers.com", role: "EMPLOYEE" as const, isPlatformAdmin: false },
      { name: "Bob Baker", email: "bob@duffers.com", role: "EMPLOYEE" as const, isPlatformAdmin: false },
    ];

    const existing = await prisma.user.count();
    if (existing > 0 && !forceReset) {
      return NextResponse.json({ message: "Users already exist", count: existing });
    }

    let created = 0;
    let updated = 0;

    for (const u of users) {
      const existingUser = await prisma.user.findUnique({ where: { email: u.email } });
      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash, role: u.role, isPlatformAdmin: u.isPlatformAdmin, active: true },
        });
        // Ensure tenant membership
        const existingTU = await prisma.tenantUser.findFirst({
          where: { tenantId: 1, userId: existingUser.id },
        });
        if (!existingTU) {
          await prisma.tenantUser.create({
            data: { tenantId: 1, userId: existingUser.id, role: u.role },
          });
        }
        updated++;
      } else {
        const user = await prisma.user.create({
          data: { name: u.name, email: u.email, passwordHash, role: u.role, isPlatformAdmin: u.isPlatformAdmin },
        });
        await prisma.tenantUser.create({
          data: { tenantId: 1, userId: user.id, role: u.role },
        });
        created++;
      }
    }

    // Set Duffers tenant to TEST plan
    await prisma.tenant.updateMany({ where: { slug: "duffersdonutshop" }, data: { plan: "TEST" } });

    return NextResponse.json({ created, updated, total: created + updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}