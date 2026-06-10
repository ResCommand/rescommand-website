import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { z } from "zod";

// GET /api/recipes
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where: Record<string, unknown> = { active: true };
  if (category) where.category = category;

  const recipes = await prisma.recipe.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(recipes);
}

// POST /api/recipes — create a new recipe (MANAGER/OWNER only)
const recipeSchema = z.object({
  name: z.string().min(1),
  category: z.string().default("general"),
  description: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.string(),
    unit: z.string(),
  })),
  instructions: z.string().optional(),
  yield: z.string().optional(),
  sortOrder: z.number().default(0),
});

export async function POST(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = recipeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const recipe = await prisma.recipe.create({ data: parsed.data });
  return NextResponse.json(recipe, { status: 201 });
}

// PUT /api/recipes — update a recipe (MANAGER/OWNER only)
const updateRecipeSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  description: z.string().nullable().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.string(),
    unit: z.string(),
  })).optional(),
  instructions: z.string().nullable().optional(),
  yield: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
  active: z.boolean().optional(),
});

export async function PUT(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = updateRecipeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { id, ...data } = parsed.data;
  const recipe = await prisma.recipe.update({ where: { tenantId, id }, data });
  return NextResponse.json(recipe);
}

// DELETE /api/recipes — soft-delete (MANAGER/OWNER only)
const deleteSchema = z.object({ id: z.number() });

export async function DELETE(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.recipe.update({ where: { tenantId, id: parsed.data.id }, data: { active: false } });
  return NextResponse.json({ success: true });
}