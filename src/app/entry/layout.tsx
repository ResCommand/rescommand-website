"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/employee" className="p-1 rounded-lg hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg">🍩</span>
          <span className="font-bold text-primary text-sm">Duffera Ops</span>
        </div>
      </div>
      <div className="p-4 max-w-lg mx-auto">{children}</div>
    </div>
  );
}