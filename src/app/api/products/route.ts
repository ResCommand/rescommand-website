import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const where: Record<string, unknown> = { active: true };
  if (type) {
    const cat = await prisma.productCategory.findFirst({ where: { type: type as "DONUT" | "DRINK" | "DOGEL" | "SANDWICH" | "OTHER" } });
    if (cat) where.categoryId = cat.id;
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}