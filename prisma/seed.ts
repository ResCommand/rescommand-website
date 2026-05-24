import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo users
  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@dufferadonuts.com" },
    update: {},
    create: {
      email: "owner@dufferadonuts.com",
      name: "Duffera Owner",
      passwordHash,
      role: Role.OWNER,
      active: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@dufferadonuts.com" },
    update: {},
    create: {
      email: "manager@dufferadonuts.com",
      name: "Store Manager",
      passwordHash,
      role: Role.MANAGER,
      active: true,
    },
  });

  const employee1 = await prisma.user.upsert({
    where: { email: "employee@dufferadonuts.com" },
    update: {},
    create: {
      email: "employee@dufferadonuts.com",
      name: "Jane Employee",
      passwordHash,
      role: Role.EMPLOYEE,
      active: true,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: "bob@dufferadonuts.com" },
    update: {},
    create: {
      email: "bob@dufferadonuts.com",
      name: "Bob Baker",
      passwordHash,
      role: Role.EMPLOYEE,
      active: true,
    },
  });

  // Create product categories
  const donutCat = await prisma.productCategory.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Donuts", type: "DONUT", fohBoh: "BOTH" },
  });

  const drinkCat = await prisma.productCategory.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "Drinks", type: "DRINK", fohBoh: "FOH" },
  });

  const dogelCat = await prisma.productCategory.upsert({
    where: { id: 3 },
    update: {},
    create: { name: "Dogels", type: "DOGEL", fohBoh: "BOTH" },
  });

  const sandwichCat = await prisma.productCategory.upsert({
    where: { id: 4 },
    update: {},
    create: { name: "Breakfast Sandwiches", type: "SANDWICH", fohBoh: "BOTH" },
  });

  // Create products
  const donutNames = [
    "Glazed", "Chocolate Frosted", "Boston Cream", "Jelly Filled",
    "Old Fashioned", "Maple Bacon", "Apple Cider", "Blueberry Cake",
  ];

  for (const name of donutNames) {
    await prisma.product.upsert({
      where: { id: donutNames.indexOf(name) + 1 },
      update: {},
      create: {
        name,
        categoryId: donutCat.id,
        price: 1.75,
        cost: 0.45,
        active: true,
      },
    });
  }

  const drinkTypes = [
    "Drip Coffee", "Americano", "Latte", "Cappuccino",
    "Cold Brew", "Iced Coffee", "Tea", "Hot Chocolate",
  ];

  for (const name of drinkTypes) {
    await prisma.product.upsert({
      where: { id: donutNames.length + drinkTypes.indexOf(name) + 1 },
      update: {},
      create: {
        name,
        categoryId: drinkCat.id,
        price: name === "Drip Coffee" || name === "Tea" ? 2.5 : 4.5,
        cost: name === "Drip Coffee" || name === "Tea" ? 0.5 : 1.2,
        active: true,
      },
    });
  }

  // Dogels
  await prisma.product.upsert({
    where: { id: 20 },
    update: {},
    create: { name: "Plain Dogel", categoryId: dogelCat.id, price: 3.5, cost: 0.8, active: true },
  });
  await prisma.product.upsert({
    where: { id: 21 },
    update: {},
    create: { name: "Everything Dogel", categoryId: dogelCat.id, price: 3.75, cost: 0.9, active: true },
  });

  // Sandwiches
  await prisma.product.upsert({
    where: { id: 22 },
    update: {},
    create: { name: "Bacon Egg & Cheese", categoryId: sandwichCat.id, price: 5.5, cost: 1.8, active: true },
  });
  await prisma.product.upsert({
    where: { id: 23 },
    update: {},
    create: { name: "Sausage Egg & Cheese", categoryId: sandwichCat.id, price: 5.5, cost: 1.6, active: true },
  });

  // Inventory items
  const inventoryItems = [
    { name: "All-Purpose Flour", category: "BOH" as const, unit: "lb", unitCost: 0.45, parLevel: 50, currentStock: 35, minStock: 15, reorderQty: 50 },
    { name: "Sugar", category: "BOH" as const, unit: "lb", unitCost: 0.55, parLevel: 30, currentStock: 22, minStock: 10, reorderQty: 30 },
    { name: "Espresso Beans", category: "FOH" as const, unit: "lb", unitCost: 14.0, parLevel: 20, currentStock: 12, minStock: 5, reorderQty: 15 },
    { name: "Whole Milk", category: "FOH" as const, unit: "gal", unitCost: 3.5, parLevel: 15, currentStock: 8, minStock: 5, reorderQty: 10 },
    { name: "Oat Milk", category: "FOH" as const, unit: "carton", unitCost: 4.5, parLevel: 8, currentStock: 5, minStock: 3, reorderQty: 6 },
    { name: "Yeast", category: "BOH" as const, unit: "lb", unitCost: 5.0, parLevel: 5, currentStock: 3, minStock: 2, reorderQty: 5 },
    { name: "Vegetable Oil", category: "BOH" as const, unit: "gal", unitCost: 6.0, parLevel: 10, currentStock: 7, minStock: 3, reorderQty: 8 },
    { name: "Chocolate Frosting", category: "BOH" as const, unit: "lb", unitCost: 3.0, parLevel: 10, currentStock: 6, minStock: 3, reorderQty: 8 },
    { name: "Jelly Filling", category: "BOH" as const, unit: "lb", unitCost: 4.0, parLevel: 8, currentStock: 5, minStock: 3, reorderQty: 6 },
    { name: "Bacon", category: "BOH" as const, unit: "lb", unitCost: 8.0, parLevel: 15, currentStock: 10, minStock: 5, reorderQty: 12 },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({ data: item });
  }

  // Some sample data for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sample donut logs
  const products = await prisma.product.findMany({ where: { categoryId: donutCat.id } });
  for (const p of products.slice(0, 5)) {
    await prisma.donutLog.create({
      data: {
        userId: employee1.id,
        productId: p.id,
        made: Math.floor(Math.random() * 40) + 20,
        sold: Math.floor(Math.random() * 30) + 15,
        wasted: Math.floor(Math.random() * 5),
        period: "AM",
        createdAt: today,
      },
    });
  }

  // Sample drink logs
  const drinkProducts = await prisma.product.findMany({ where: { categoryId: drinkCat.id } });
  for (let i = 0; i < 25; i++) {
    const p = drinkProducts[Math.floor(Math.random() * drinkProducts.length)];
    await prisma.drinkLog.create({
      data: {
        userId: employee1.id,
        drinkType: p.name,
        size: ["Small", "Medium", "Large"][Math.floor(Math.random() * 3)],
        milkType: ["Whole", "Oat", "Almond"][Math.floor(Math.random() * 3)],
        espressoShots: Math.random() > 0.5 ? 2 : 1,
        waste: Math.random() > 0.8 ? 1 : 0,
        createdAt: new Date(today.getTime() + i * 20 * 60000),
      },
    });
  }

  // Sample transactions
  for (let i = 0; i < 15; i++) {
    await prisma.transaction.create({
      data: {
        userId: employee1.id,
        totalAmount: Math.round((Math.random() * 25 + 5) * 100) / 100,
        paymentMethod: Math.random() > 0.5 ? "CARD" : "CASH",
        createdAt: new Date(today.getTime() + i * 30 * 60000),
        lines: {
          create: {
            productName: "Half Dozen Mixed",
            quantity: 1,
            unitPrice: 9.5,
            total: 9.5,
          },
        },
      },
    });
  }

  // Sample holidays
  await prisma.holidaySchedule.createMany({
    data: [
      { date: new Date("2025-07-04"), name: "Independence Day", impactLevel: "HIGH" },
      { date: new Date("2025-12-25"), name: "Christmas", impactLevel: "HIGH" },
      { date: new Date("2025-11-27"), name: "Thanksgiving", impactLevel: "HIGH" },
      { date: new Date("2025-02-14"), name: "Valentine's Day", impactLevel: "MEDIUM" },
    ],
    skipDuplicates: true,
  });

  // Sample cleaning tasks
  await prisma.cleaningTask.createMany({
    data: [
      { title: "Espresso Machine Clean", description: "Backflush and clean group heads", frequency: "DAILY", location: "FOH" },
      { title: "Floor Sweep & Mop", description: "Sweep and mop all floors", frequency: "DAILY", location: "FOH" },
      { title: "Fryer Oil Change", description: "Drain and replace fryer oil", frequency: "WEEKLY", location: "BOH" },
      { title: "Deep Clean Prep Area", description: "Sanitize all surfaces and equipment", frequency: "WEEKLY", location: "BOH" },
      { title: "Walk-in Cooler Clean", description: "Clean and organize walk-in cooler", frequency: "MONTHLY", location: "BOH" },
    ],
  });

  // Sample overboard schedule
  for (let i = 1; i <= 14; i++) {
    const obDate = new Date(today);
    obDate.setDate(obDate.getDate() + i);
    if (i % 2 === 0) {
      const ob = await prisma.overboardSchedule.create({
        data: {
          date: obDate,
          status: "SCHEDULED",
          notes: `Overboard run #${i}`,
        },
      });
      await prisma.overboardLine.createMany({
        data: [
          { overboardId: ob.id, productId: 1, quantity: 60, fillings: "Vanilla Cream", toppings: "Glaze" },
          { overboardId: ob.id, productId: 2, quantity: 50, fillings: "Chocolate Cream", toppings: "Chocolate Sprinkles" },
          { overboardId: ob.id, productId: 3, quantity: 40, fillings: "Boston Cream", toppings: "Chocolate Glaze" },
        ],
      });
    }
  }

  console.log("✅ Seed data created successfully!");
  console.log("Users: owner, manager, employee, bob — all use password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });