// Seed users — runs as part of npm run seed
// Uses Prisma to upsert users (idempotent, safe to run on every deploy)
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
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
    console.log("Created tenant:", tenant.id);
  }
  const tenantId = tenant.id;

  const users = [
    { name: "Shawn", email: "hello@duffersdonutshop.com", role: "OWNER", isPlatformAdmin: true },
    { name: "Store Manager", email: "manager@duffers.com", role: "MANAGER", isPlatformAdmin: false },
    { name: "Jane Employee", email: "employee@duffers.com", role: "EMPLOYEE", isPlatformAdmin: false },
    { name: "Bob Baker", email: "bob@duffers.com", role: "EMPLOYEE", isPlatformAdmin: false },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, role: u.role, isPlatformAdmin: u.isPlatformAdmin, active: true },
      });
      // Ensure tenant membership
      const tu = await prisma.tenantUser.findFirst({ where: { tenantId, userId: existing.id } });
      if (!tu) {
        await prisma.tenantUser.create({ data: { tenantId, userId: existing.id, role: u.role } });
      }
    } else {
      const user = await prisma.user.create({
        data: { name: u.name, email: u.email, passwordHash, role: u.role, isPlatformAdmin: u.isPlatformAdmin },
      });
      await prisma.tenantUser.create({ data: { tenantId, userId: user.id, role: u.role } });
    }
  }

  // Set plan
  await prisma.tenant.updateMany({ where: { slug: "duffersdonutshop" }, data: { plan: "TEST" } });

  console.log("Users seeded successfully");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("User seed error:", e.message);
  process.exit(0); // Non-fatal
});