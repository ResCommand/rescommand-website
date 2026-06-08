import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Check if users already exist
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log(`Users: ${existing} already exist, skipping.`);
    return;
  }

  console.log("Seeding default users...");

  const passwordHash = await bcrypt.hash("password", 12);

  const users = [
    { name: "Shawn", email: "hello@duffersdonutshop.com", role: "OWNER" as const, isPlatformAdmin: true },
    { name: "Store Manager", email: "manager@duffers.com", role: "MANAGER" as const, isPlatformAdmin: false },
    { name: "Jane Employee", email: "employee@duffers.com", role: "EMPLOYEE" as const, isPlatformAdmin: false },
    { name: "Bob Baker", email: "bob@duffers.com", role: "EMPLOYEE" as const, isPlatformAdmin: false },
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
    // Link to tenant 1 (Duffers)
    await prisma.tenantUser.create({
      data: { tenantId: 1, userId: user.id, role: u.role },
    });
    console.log(`  Created: ${u.email} (${u.role})`);
  }

  console.log(`Seeded ${users.length} users.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());