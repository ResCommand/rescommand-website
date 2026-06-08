import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time fix endpoint — resets all default user passwords and ensures tenant membership
export async function GET() {
  try {
    const passwordHash = await bcrypt.hash("password", 12);

    const users = [
      { name: "Shawn", email: "hello@duffersdonutshop.com", role: "OWNER" as const, isPlatformAdmin: true },
      { name: "Store Manager", email: "manager@duffers.com", role: "MANAGER" as const, isPlatformAdmin: false },
      { name: "Jane Employee", email: "employee@duffers.com", role: "EMPLOYEE" as const, isPlatformAdmin: false },
      { name: "Bob Baker", email: "bob@duffers.com", role: "EMPLOYEE" as const, isPlatformAdmin: false },
    ];

    let created = 0;
    let updated = 0;

    // Ensure tenant exists
    let tenant = await prisma.tenant.findFirst({ where: { slug: "duffersdonutshop" } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: "Duffers Donut Shop",
          slug: "duffersdonutshop",
          plan: "TEST",
          active: true,
          settings: { brandName: "Duffers OS" },
        },
      });
    }

    const tenantId = tenant.id;

    for (const u of users) {
      const existingUser = await prisma.user.findUnique({ where: { email: u.email } });
      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash, role: u.role, isPlatformAdmin: u.isPlatformAdmin, active: true },
        });
        const existingTU = await prisma.tenantUser.findFirst({ where: { tenantId, userId: existingUser.id } });
        if (!existingTU) {
          await prisma.tenantUser.create({ data: { tenantId, userId: existingUser.id, role: u.role } });
        }
        updated++;
      } else {
        const user = await prisma.user.create({
          data: { name: u.name, email: u.email, passwordHash, role: u.role, isPlatformAdmin: u.isPlatformAdmin },
        });
        await prisma.tenantUser.create({ data: { tenantId, userId: user.id, role: u.role } });
        created++;
      }
    }

    await prisma.tenant.updateMany({ where: { slug: "duffersdonutshop" }, data: { plan: "TEST" } });

    return NextResponse.json({ created, updated, total: created + updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}