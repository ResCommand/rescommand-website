import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string })?.role;
  if (role === "OWNER") redirect("/owner");
  if (role === "MANAGER") redirect("/manager");
  redirect("/employee");
}