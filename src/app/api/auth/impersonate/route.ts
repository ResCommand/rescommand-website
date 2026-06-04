import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const secret = process.env.NEXTAUTH_SECRET!;
    const decoded = await decode({ token, secret });
    if (!decoded || !decoded.impersonatedBy) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Set the session cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("next-auth.session-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}