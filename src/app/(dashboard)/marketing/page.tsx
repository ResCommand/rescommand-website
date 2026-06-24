"use client";

import { useSession } from "next-auth/react";
import { Megaphone, Calendar, Image, BarChart3 } from "lucide-react";

export default function MarketingPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>📣 Marketing</h1>
            <p className="text-gray">Social posts, campaigns, and content scheduling</p>
          </div>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid-4">
        <a href="/social" className="quick-entry-card">
          <div className="icon">💬</div>
          <h3>Social Posts</h3>
          <p>Create & schedule posts</p>
        </a>
        <div className="quick-entry-card" style={{ opacity: 0.5 }}>
          <div className="icon">📅</div>
          <h3>Campaigns</h3>
          <p>Coming soon</p>
        </div>
        <div className="quick-entry-card" style={{ opacity: 0.5 }}>
          <div className="icon">🖼️</div>
          <h3>Content Library</h3>
          <p>Coming soon</p>
        </div>
        <div className="quick-entry-card" style={{ opacity: 0.5 }}>
          <div className="icon">📊</div>
          <h3>Analytics</h3>
          <p>Coming soon</p>
        </div>
      </div>
    </div>
  );
}
