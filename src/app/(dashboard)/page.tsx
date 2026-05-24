import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as { role?: string })?.role;
  if (role === "OWNER") redirect("/owner");
  if (role === "MANAGER") redirect("/manager");
  redirect("/employee");
}