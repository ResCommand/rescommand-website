import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// POST /api/platform/setup-admin — Set current user as platform admin
// Only works if no platform admin exists yet (one-time setup)
export async function POST() {
  // Check if any platform admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { isPlatformAdmin: true },
  });

  if (existingAdmin) {
    return NextResponse.json({
      error: "Platform admin already exists",
      adminEmail: existingAdmin.email,
    }, { status: 403 });
  }

  // Must be logged in
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { isPlatformAdmin: true },
  });

  return NextResponse.json({
    success: true,
    email: user.email,
    name: user.name,
    message: "You are now the platform admin. Go to /admin to access the dashboard.",
  });
}