"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, ToggleLeft, Settings } from "lucide-react";

export default function AdminPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  if (role !== "OWNER" && role !== "PLATFORM_ADMIN") {
    return (
      <div className="page-header">
        <h1>Admin</h1>
        <p className="text-gray">You don&apos;t have access to this area.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>⚙️ Admin</h1>
        <p className="text-gray">Manage your workspace, users, and settings</p>
      </div>

      <div className="grid-3">
        <Link href="/admin/users" className="quick-entry-card" style={{ textAlign: "left", padding: 24 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="stat-icon stat-icon-purple" style={{ margin: 0 }}>👥</div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Team Members</h3>
          </div>
          <p className="text-sm text-gray">Manage users, roles, employee categories, and module access.</p>
        </Link>

        <Link href="/admin/modules" className="quick-entry-card" style={{ textAlign: "left", padding: 24, opacity: 0.6 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="stat-icon stat-icon-blue" style={{ margin: 0 }}>🔧</div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Modules</h3>
          </div>
          <p className="text-sm text-gray">Enable or disable features for your workspace.</p>
        </Link>

        <Link href="/admin/settings" className="quick-entry-card" style={{ textAlign: "left", padding: 24, opacity: 0.6 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="stat-icon stat-icon-green" style={{ margin: 0 }}>⚙️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Settings</h3>
          </div>
          <p className="text-sm text-gray">Branding, preferences, and workspace configuration.</p>
        </Link>
      </div>
    </div>
  );
}
