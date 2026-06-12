import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Debug + fix endpoint - ensures the Duffers owner user exists with proper tenant membership
export async function GET() {
  try {
    // Check all users
    const allUsers = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, active: true } });
    
    // Check all tenants
    const allTenants = await prisma.tenant.findMany({ select: { id: true, name: true, slug: true, active: true } });
    
    // Check all tenant memberships
    const allMemberships = await prisma.tenantUser.findMany({
      include: { 
        user: { select: { email: true, name: true } },
        tenant: { select: { name: true, slug: true } },
      },
    });

    // Check specifically for our user
    const targetUser = await prisma.user.findUnique({
      where: { email: "hello@duffersdonutshop.com" },
      include: {
        tenantMemberships: {
          include: { tenant: { select: { id: true, name: true, slug: true, active: true } } },
        },
      },
    });

    return NextResponse.json({
      users: allUsers.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, active: u.active })),
      tenants: allTenants,
      memberships: allMemberships.map(m => ({ email: m.user.email, tenant: m.tenant.name, role: m.role })),
      targetUser: targetUser ? {
        found: true,
        id: targetUser.id,
        email: targetUser.email,
        active: targetUser.active,
        membershipCount: targetUser.tenantMemberships.length,
        memberships: targetUser.tenantMemberships.map(m => ({ tenant: m.tenant.name, active: m.tenant.active })),
      } : { found: false },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST - force create/fix the Duffers owner user
export async function POST() {
  try {
    const passwordHash = await bcrypt.hash("password", 12);

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

    // Upsert the owner user
    const existing = await prisma.user.findUnique({ where: { email: "hello@duffersdonutshop.com" } });
    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, role: "OWNER", isPlatformAdmin: true, active: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: "Shawn",
          email: "hello@duffersdonutshop.com",
          passwordHash,
          role: "OWNER",
          isPlatformAdmin: true,
        },
      });
    }

    // Ensure tenant membership exists
    const existingMembership = await prisma.tenantUser.findFirst({
      where: { tenantId: tenant.id, userId: user.id },
    });
    if (!existingMembership) {
      await prisma.tenantUser.create({
        data: { tenantId: tenant.id, userId: user.id, role: "OWNER" },
      });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
      message: "Owner user created/updated with tenant membership",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
