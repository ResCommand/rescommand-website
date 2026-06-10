import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"
import { getTenantId, getSessionContext } from "@/lib/tenant";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

  // Generate unique filename
  const ext = path.extname(file.name) || ".pdf";
  const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const uniqueName = `${base}_${Date.now()}${ext}`;

  // Ensure upload directory exists
  const uploadDir = path.join(process.cwd(), "public", "uploads", "sops");
  await mkdir(uploadDir, { recursive: true });

  // Write file
  const filePath = path.join(uploadDir, uniqueName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/uploads/sops/${uniqueName}`;
  return NextResponse.json({ url, name: file.name });
}