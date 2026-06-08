const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log("Users: " + existing + " already exist, skipping.");
    return;
  }

  console.log("Seeding default users...");

  const passwordHash = await bcrypt.hash("password", 12);

  const users = [
    { name: "Shawn", email: "hello@duffersdonutshop.com", role: "OWNER", isPlatformAdmin: true },
    { name: "Store Manager", email: "manager@duffers.com", role: "MANAGER", isPlatformAdmin: false },
    { name: "Jane Employee", email: "employee@duffers.com", role: "EMPLOYEE", isPlatformAdmin: false },
    { name: "Bob Baker", email: "bob@duffers.com", role: "EMPLOYEE", isPlatformAdmin: false },
  ];

  for (const u of users) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        isPlatformAdmin: u.isPlatformAdmin,
      },
    });
    await prisma.tenantUser.create({
      data: { tenantId: 1, userId: user.id, role: u.role },
    });
    console.log("  Created: " + u.email + " (" + u.role + ")");
  }

  console.log("Seeded " + users.length + " users.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());