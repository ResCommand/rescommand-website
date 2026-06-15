import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const tenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  businessType: z.enum(["DONUT_SHOP", "BAKERY", "CAFE", "RESTAURANT", "BAR", "FOOD_TRUCK"]),
  plan: z.enum(["FREE", "CORE", "OPERATOR"]).default("CORE"),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(6),
  modules: z.array(z.string()).optional(),
  brandName: z.string().optional(),
  theme: z.enum(["dark", "light"]).optional(),
  primaryColor: z.string().optional(),
  teamMembers: z.array(z.object({
    name: z.string(), email: z.string().email(), role: z.enum(["EMPLOYEE", "MANAGER"]).default("EMPLOYEE"),
  })).optional(),
});

// GET /api/tenants — Auto-seed default users if none exist (called on every fresh deploy)
export async function GET() {
  try {
    const existing = await prisma.user.count();
    if (existing > 0) {
      return NextResponse.json({ seeded: false, userCount: existing });
    }

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

    await prisma.tenant.updateMany({ where: { slug: "duffersdonutshop" }, data: { plan: "TEST" } });

    return NextResponse.json({ seeded: true, created: users.length, emails: users.map(u => u.email) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/tenants — Create new tenant (from onboarding wizard)
export async function POST(request: Request) {
  try {
  const body = await request.json();
  const parsed = tenantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Check slug uniqueness
  const existing = await prisma.tenant.findFirst({
    where: { OR: [{ slug: data.slug }, { ...(data.slug ? {} : {}) }] },
  });
  if (existing) {
    return NextResponse.json({ error: "This business URL is already taken. Try a different name." }, { status: 409 });
  }

  // Check if email already exists
  let user = await prisma.user.findUnique({ where: { email: data.ownerEmail } });

  // Create user if doesn't exist
  if (!user) {
    const hash = await bcrypt.hash(data.ownerPassword, 12);
    user = await prisma.user.create({
      data: {
        name: data.ownerName,
        email: data.ownerEmail,
        passwordHash: hash,
        role: "OWNER",
      },
    });
  }

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: data.name,
      slug: data.slug,
      businessType: data.businessType,
      plan: data.plan,
      primaryColor: data.primaryColor || "#1A56DB",
      settings: {
        brandName: data.brandName || data.name,
        theme: data.theme || "dark",
        primaryColor: data.primaryColor || "#1A56DB",
      },
    },
  });

  // Create TenantUser membership
  await prisma.tenantUser.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      role: "OWNER",
      acceptedAt: new Date(),
    },
  });

  // Seed module configs for this tenant
  await seedModuleConfigs(tenant.id, data.businessType, data.modules);

  // Seed business-type templates
  await seedBusinessTemplates(tenant.id, data.businessType);

  // Add team members if provided
  if (data.teamMembers?.length) {
    for (const member of data.teamMembers) {
      let memberUser = await prisma.user.findUnique({ where: { email: member.email } });
      if (!memberUser) {
        const hash = await bcrypt.hash("TempPassword123!", 12);
        memberUser = await prisma.user.create({
          data: {
            name: member.name,
            email: member.email,
            passwordHash: hash,
            role: member.role,
          },
        });
      }
      await prisma.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: memberUser.id,
          role: member.role,
          invitedBy: user.id,
        },
      });
    }
  }

  return NextResponse.json({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    url: `app.rescommand.com`,
  }, { status: 201 });
  } catch (err) {
    console.error("Tenant creation error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// ─── Seed Helpers ──────────────────────────────────────────

async function seedModuleConfigs(tenantId: number, businessType: string, enabledModules?: string[]) {
  const defaults = getModuleDefaults(businessType, enabledModules);
  await prisma.moduleConfig.createMany({
    data: defaults.map(m => ({ ...m, tenantId })),
  });
}

function getModuleDefaults(businessType: string, enabledModules?: string[]) {
  const all = [
    { moduleKey: "dashboard", name: "Dashboard", description: "Main dashboard overview", icon: "📊", sortOrder: 0, group: "operations", enabled: true },
    { moduleKey: "production", name: "Production", description: "Daily production targets, prep lists, batch tracking", icon: "🏭", sortOrder: 1, group: "operations", enabled: true },
    { moduleKey: "inventory", name: "Inventory", description: "On-hand counts, par levels, order requests", icon: "📦", sortOrder: 2, group: "operations", enabled: true },
    { moduleKey: "recipes", name: "Recipes", description: "Recipe management with categories and costing", icon: "📋", sortOrder: 3, group: "operations", enabled: true },
    { moduleKey: "sops", name: "SOPs", description: "Standard operating procedures with rich text & PDFs", icon: "📖", sortOrder: 4, group: "operations", enabled: true },
    { moduleKey: "schedule", name: "Schedule", description: "Employee scheduling, availability, time-off requests", icon: "📅", sortOrder: 5, group: "management", enabled: true },
    { moduleKey: "settings", name: "Admin", description: "Team management, permissions, feature toggles", icon: "👥", sortOrder: 6, group: "management", enabled: true },
    { moduleKey: "notifications", name: "Notifications", description: "Send and receive notifications", icon: "🔔", sortOrder: 7, group: "management", enabled: true },
    { moduleKey: "overboards", name: "Menu Planning", description: "Plan menus, track tasks, manage seasonal items", icon: "🍽️", sortOrder: 8, group: "operations", enabled: true },
    { moduleKey: "espresso", name: "Espresso Dialing", description: "Espresso shot dial-in tracking", icon: "☕", sortOrder: 9, group: "coffee", enabled: businessType === "CAFE" || businessType === "DONUT_SHOP" },
    { moduleKey: "roasting", name: "Coffee Roasting", description: "Green coffee inventory, roast profiles, roast logs", icon: "🫘", sortOrder: 10, group: "coffee", enabled: false },
    { moduleKey: "social", name: "Social Media Planner", description: "Plan, schedule, and share social media content", icon: "📱", sortOrder: 10, group: "marketing", enabled: false },
    { moduleKey: "owner", name: "Owner Dashboard", description: "Financial overview and reports", icon: "💰", sortOrder: 11, group: "management", enabled: true },
    { moduleKey: "operations", name: "Operations", description: "Cleaning logs, QR sign-in, daily operations", icon: "🔧", sortOrder: 12, group: "operations", enabled: true },
  ];

  // Override with user's module selections
  if (enabledModules) {
    return all.map(m => ({ ...m, enabled: enabledModules.includes(m.moduleKey) || ["dashboard", "settings", "notifications"].includes(m.moduleKey) }));
  }

  return all;
}

async function seedBusinessTemplates(tenantId: number, businessType: string) {
  // Seed employee categories based on business type
  const categoryMap: Record<string, Array<{ name: string; color: string }>> = {
    DONUT_SHOP: [
      { name: "Front of House", color: "#3B82F6" },
      { name: "Back of House", color: "#F59E0B" },
      { name: "Chef", color: "#8B5CF6" },
    ],
    BAKERY: [
      { name: "Bakers", color: "#F59E0B" },
      { name: "Front of House", color: "#3B82F6" },
      { name: "Pastry Chef", color: "#8B5CF6" },
    ],
    CAFE: [
      { name: "Baristas", color: "#3B82F6" },
      { name: "Kitchen", color: "#F59E0B" },
      { name: "Manager", color: "#8B5CF6" },
    ],
    RESTAURANT: [
      { name: "Front of House", color: "#3B82F6" },
      { name: "Back of House", color: "#F59E0B" },
      { name: "Chef", color: "#8B5CF6" },
      { name: "Bartender", color: "#059669" },
    ],
    BAR: [
      { name: "Bartenders", color: "#3B82F6" },
      { name: "Barbacks", color: "#F59E0B" },
      { name: "Security", color: "#DC2626" },
    ],
    FOOD_TRUCK: [
      { name: "Kitchen", color: "#F59E0B" },
      { name: "Service", color: "#3B82F6" },
      { name: "Driver", color: "#8B5CF6" },
    ],
  };

  const cats = categoryMap[businessType] || categoryMap.DONUT_SHOP;
  for (let i = 0; i < cats.length; i++) {
    await prisma.employeeCategory.create({
      data: { name: cats[i].name, color: cats[i].color, sortOrder: i, tenantId },
    });
  }

  // Seed product categories based on business type
  const productCatMap: Record<string, Array<{ name: string; type: string }>> = {
    DONUT_SHOP: [
      { name: "Donuts", type: "DONUT" }, { name: "Drinks", type: "DRINK" },
      { name: "Sandwiches", type: "SANDWICH" }, { name: "Merch", type: "OTHER" },
    ],
    BAKERY: [
      { name: "Breads", type: "OTHER" }, { name: "Pastries", type: "OTHER" },
      { name: "Cakes", type: "OTHER" }, { name: "Drinks", type: "DRINK" },
    ],
    CAFE: [
      { name: "Espresso Drinks", type: "DRINK" }, { name: "Brewed Coffee", type: "DRINK" },
      { name: "Pastries", type: "OTHER" }, { name: "Lunch", type: "SANDWICH" },
    ],
    RESTAURANT: [
      { name: "Appetizers", type: "OTHER" }, { name: "Mains", type: "OTHER" },
      { name: "Desserts", type: "OTHER" }, { name: "Drinks", type: "DRINK" },
    ],
    BAR: [
      { name: "Cocktails", type: "DRINK" }, { name: "Beer", type: "DRINK" },
      { name: "Wine", type: "DRINK" }, { name: "Food", type: "OTHER" },
    ],
    FOOD_TRUCK: [
      { name: "Mains", type: "OTHER" }, { name: "Sides", type: "OTHER" },
      { name: "Drinks", type: "DRINK" }, { name: "Add-ons", type: "OTHER" },
    ],
  };

  const productCats = productCatMap[businessType] || productCatMap.DONUT_SHOP;
  for (const cat of productCats) {
    await prisma.productCategory.create({
      data: { name: cat.name, type: cat.type as any, tenantId },
    });
  }

  // Seed recipe categories based on business type
  const recipeCatMap: Record<string, string[]> = {
    DONUT_SHOP: ["Donuts", "Glazes", "Icings", "Fillings"],
    BAKERY: ["Breads", "Pastries", "Cakes", "Cookies"],
    CAFE: ["Coffee", "Espresso", "Pastries", "Sandwiches"],
    RESTAURANT: ["Appetizers", "Mains", "Sauces", "Desserts"],
    BAR: ["Cocktails", "Syrups", "Bar Snacks", "Infusions"],
    FOOD_TRUCK: ["Mains", "Sauces", "Sides", "Marinades"],
  };
  const recipeCats = recipeCatMap[businessType] || recipeCatMap.DONUT_SHOP;
  for (let i = 0; i < recipeCats.length; i++) {
    const cat = recipeCats[i];
    const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + tenantId;
    await prisma.recipeCategory.create({
      data: { name: cat, slug, tenantId },
    });
  }

  // Seed inventory sections
  const sectionMap: Record<string, string[]> = {
    DONUT_SHOP: ["Kitchen - Regular", "Kitchen - Infrequent", "Packaging", "Barista"],
    BAKERY: ["Baking - Regular", "Baking - Infrequent", "Packaging", "Front of House"],
    CAFE: ["Coffee Bar", "Kitchen", "Packaging", "Supplies"],
    RESTAURANT: ["Kitchen - Prep", "Kitchen - Line", "Front of House", "Bar"],
    BAR: ["Bar Stock", "Kitchen", "Supplies", "Glassware"],
    FOOD_TRUCK: ["Kitchen", "Supplies", "Packaging", "Fuel"],
  };

  const sections = sectionMap[businessType] || sectionMap.DONUT_SHOP;
  for (let i = 0; i < sections.length; i++) {
    const slug = sections[i].toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    await prisma.inventorySection.create({
      data: { name: sections[i], slug, sortOrder: i, tenantId },
    });
  }

  // Seed prep items based on business type
  const prepItemMap: Record<string, Array<{ name: string; category: string; shelfLifeHours: number }>> = {
    DONUT_SHOP: [
      { name: "Chocolate Glaze", category: "Glazes", shelfLifeHours: 48 },
      { name: "Vanilla Glaze", category: "Glazes", shelfLifeHours: 48 },
      { name: "Strawberry Icing", category: "Icings", shelfLifeHours: 48 },
      { name: "Maple Icing", category: "Icings", shelfLifeHours: 72 },
      { name: "Cream Filling", category: "Creams", shelfLifeHours: 48 },
      { name: "Custard Filling", category: "Creams", shelfLifeHours: 48 },
      { name: "Strawberry Jam", category: "Jams", shelfLifeHours: 168 },
      { name: "Raspberry Jam", category: "Jams", shelfLifeHours: 168 },
      { name: "Caramel Syrup", category: "Syrups", shelfLifeHours: 336 },
      { name: "Chocolate Syrup", category: "Syrups", shelfLifeHours: 336 },
    ],
    BAKERY: [
      { name: "Pie Dough", category: "Doughs", shelfLifeHours: 72 },
      { name: "Cake Batter", category: "Batters", shelfLifeHours: 24 },
      { name: "Buttercream", category: "Frostings", shelfLifeHours: 72 },
      { name: "Cream Cheese Frosting", category: "Frostings", shelfLifeHours: 48 },
      { name: "Fruit Compote", category: "Fillings", shelfLifeHours: 72 },
      { name: "Custard", category: "Fillings", shelfLifeHours: 48 },
    ],
    CAFE: [
      { name: "Simple Syrup", category: "Syrups", shelfLifeHours: 336 },
      { name: "Vanilla Syrup", category: "Syrups", shelfLifeHours: 336 },
      { name: "Mocha Sauce", category: "Sauces", shelfLifeHours: 168 },
      { name: "Whipped Cream", category: "Dairy", shelfLifeHours: 24 },
      { name: "Cold Brew Concentrate", category: "Coffee", shelfLifeHours: 48 },
    ],
    RESTAURANT: [
      { name: "Mirepoix Prep", category: "Prep", shelfLifeHours: 72 },
      { name: "Marinara Sauce", category: "Sauces", shelfLifeHours: 120 },
      { name: "Dressing - House", category: "Dressings", shelfLifeHours: 72 },
      { name: "Compound Butter", category: "Prep", shelfLifeHours: 168 },
      { name: "Soffritto", category: "Prep", shelfLifeHours: 48 },
    ],
    BAR: [
      { name: "Simple Syrup", category: "Syrups", shelfLifeHours: 336 },
      { name: "Sour Mix", category: "Mixers", shelfLifeHours: 72 },
      { name: "Garnish Prep", category: "Garnishes", shelfLifeHours: 24 },
      { name: "Infused Spirits", category: "Infusions", shelfLifeHours: 336 },
    ],
    FOOD_TRUCK: [
      { name: "Protein Marination", category: "Proteins", shelfLifeHours: 48 },
      { name: "Salsa Prep", category: "Sauces", shelfLifeHours: 72 },
      { name: "Dough Prep", category: "Doughs", shelfLifeHours: 48 },
      { name: "Garnish Prep", category: "Garnishes", shelfLifeHours: 24 },
    ],
  };

  const prepItems = prepItemMap[businessType] || prepItemMap.DONUT_SHOP;
  for (const item of prepItems) {
    await prisma.prepItem.create({
      data: { name: item.name, category: item.category, shelfLifeHours: item.shelfLifeHours, amount: "1 batch", tenantId },
    });
  }
}

// (Original GET handler moved to top of file)