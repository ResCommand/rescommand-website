import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time setup: creates default users for the Duffers tenant
// Public endpoint - gated by checking if users already exist
export async function GET() {
  try {
    const existing = await prisma.user.count();
    if (existing > 0) return NextResponse.json({ message: "Users already exist", count: existing });

    const passwordHash = await bcrypt.hash("password", 12);

    const users = [
      { name: "Shawn", email: "hello@duffersdonutshop.com", role: "OWNER" as const, isPlatformAdmin: true },
      { name: "Store Manager", email: "manager@duffers.com", role: "MANAGER" as const, isPlatformAdmin: false },
      { name: "Jane Employee", email: "employee@duffers.com", role: "EMPLOYEE" as const, isPlatformAdmin: false },
      { name: "Bob Baker", email: "bob@duffers.com", role: "EMPLOYEE" as const, isPlatformAdmin: false },
    ];

    for (const u of users) {
      const user = await prisma.user.create({
        data: { name: u.name, email: u.email, passwordHash, role: u.role, isPlatformAdmin: u.isPlatformAdmin },
      });
      await prisma.tenantUser.create({
        data: { tenantId: 1, userId: user.id, role: u.role },
      });
    }

    return NextResponse.json({ created: users.length, emails: users.map(u => u.email) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}