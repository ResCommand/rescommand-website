import { NextResponse } from "next/server";

// Health check endpoint for deployment monitoring
// Returns 200 when the app is ready to serve traffic
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}