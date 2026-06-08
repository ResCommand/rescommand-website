import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time setup: creates default users for the Duffers tenant
export async function GET() {
  const key = new URL("http://localhost" ).searchParams;
  // Simple gate - only works if no users exist yet
  const existing = await prisma.user.count();
  if (existing > 0) return NextResponse.json({ error: "Users already exist", count: existing });

  const passwordHash = await bcrypt.hash("password", 12);

  const owner = await prisma.user.create({
    data: { name: "Shawn", email: "hello@duffersdonutshop.com", passwordHash, role: "OWNER" },
  });
  const manager = await prisma.user.create({
    data: { name: "Store Manager", email: "manager@duffers.com", passwordHash, role: "MANAGER" },
  });
  const employee = await prisma.user.create({
    data: { name: "Jane Employee", email: "employee@duffers.com", passwordHash, role: "EMPLOYEE" },
  });
  const bob = await prisma.user.create({
    data: { name: "Bob Baker", email: "bob@duffers.com", passwordHash, role: "EMPLOYEE" },
  });

  // Link all users to tenant 1
  for (const user of [owner, manager, employee, bob]) {
    await prisma.tenantUser.create({
      data: { tenantId: 1, userId: user.id, role: user.role },
    });
  }

  // Make owner a platform admin
  await prisma.user.update({ where: { id: owner.id }, data: { isPlatformAdmin: true } });

  return NextResponse.json({ created: 4, users: [owner.email, manager.email, employee.email, bob.email] });
}