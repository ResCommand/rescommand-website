"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] px-4 h-12 flex items-center gap-3">
        <Link href="/employee" className="p-1.5 -ml-1 rounded-md hover:bg-[#F3F4F6]"><ArrowLeft className="h-4 w-4 text-[#374151]" /></Link>
        <div className="flex items-center gap-1.5"><span className="text-base">🍩</span><span className="text-sm font-semibold text-[#111827]">Duffers OS</span></div>
      </div>
      <div className="px-4 py-5 max-w-md mx-auto">{children}</div>
    </div>
  );
}