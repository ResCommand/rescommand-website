import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// GET /api/module-config — list all module configs
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const configs = await prisma.moduleConfig.findMany({ orderBy: { sortOrder: "asc" } });

  // If no configs exist yet, seed defaults
  if (configs.length === 0) {
    const defaults = [
      { moduleKey: "dashboard", name: "Dashboard", description: "Main dashboard overview", icon: "📊", sortOrder: 0, group: "operations", enabled: true },
      { moduleKey: "production", name: "Production", description: "Daily production targets, prep lists, batch tracking", icon: "🏭", sortOrder: 1, group: "operations", enabled: true },
      { moduleKey: "inventory", name: "Inventory", description: "On-hand counts, par levels, order requests", icon: "📦", sortOrder: 2, group: "operations", enabled: true },
      { moduleKey: "recipes", name: "Recipes", description: "Recipe management with categories and costing", icon: "📋", sortOrder: 3, group: "operations", enabled: true },
      { moduleKey: "sops", name: "SOPs", description: "Standard operating procedures with rich text & PDFs", icon: "📖", sortOrder: 4, group: "operations", enabled: true },
      { moduleKey: "schedule", name: "Schedule", description: "Employee scheduling, availability, time-off requests", icon: "📅", sortOrder: 5, group: "management", enabled: true },
      { moduleKey: "settings", name: "Admin", description: "Team management, permissions, feature toggles", icon: "👥", sortOrder: 6, group: "management", enabled: true },
      { moduleKey: "notifications", name: "Notifications", description: "Send and receive notifications", icon: "🔔", sortOrder: 7, group: "management", enabled: true },
      { moduleKey: "overboards", name: "Menu Planning", description: "Plan menus, track tasks, and manage seasonal items", icon: "🍽️", sortOrder: 8, group: "operations", enabled: true },
      { moduleKey: "espresso", name: "Espresso Dialing", description: "Espresso shot dial-in tracking", icon: "☕", sortOrder: 9, group: "coffee", enabled: false },
      { moduleKey: "roasting", name: "Coffee Roasting", description: "Green coffee inventory, roast profiles, roast logs", icon: "🫘", sortOrder: 10, group: "coffee", enabled: false },
      { moduleKey: "social", name: "Social Media Planner", description: "Plan, schedule, and share social media content with your team", icon: "📱", sortOrder: 10, group: "marketing", enabled: false },
      { moduleKey: "owner", name: "Owner Dashboard", description: "Financial overview and reports", icon: "💰", sortOrder: 11, group: "management", enabled: true },
      { moduleKey: "operations", name: "Operations", description: "Cleaning logs, QR sign-in, daily operations", icon: "🔧", sortOrder: 12, group: "operations", enabled: true },
    ];
    await prisma.moduleConfig.createMany({ data: defaults });
    return NextResponse.json(await prisma.moduleConfig.findMany({ orderBy: { sortOrder: "asc" } }));
  }

  return NextResponse.json(configs);
}

// PUT /api/module-config — toggle module on/off
export async function PUT(request: Request) {
  const { tenantId, role } = await getSessionContext();
  if (role !== "OWNER")
    return NextResponse.json({ error: "Only owners can change module settings" }, { status: 403 });

  const body = await request.json();
  const { moduleKey, enabled } = body;
  if (!moduleKey || typeof enabled !== "boolean")
    return NextResponse.json({ error: "moduleKey and enabled required" }, { status: 400 });

  // Dashboard and Settings can never be disabled
  if (moduleKey === "dashboard" || moduleKey === "settings")
    return NextResponse.json({ error: "This module cannot be disabled" }, { status: 400 });

  const config = await prisma.moduleConfig.update({
    where: { tenantId_moduleKey: { tenantId: 1, moduleKey } },
    data: { enabled },
  });
  return NextResponse.json(config);
}