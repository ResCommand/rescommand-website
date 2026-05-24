"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white border-b border-[#DDDDDD] px-5 py-3 flex items-center gap-3">
        <Link href="/employee" className="p-2 -ml-2 rounded-full hover:bg-[#F7F7F7] transition-colors">
          <ArrowLeft className="h-5 w-5 text-[#222222]" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl">🍩</span>
          <span className="font-bold text-[#FF385C] text-sm">Duffers OS</span>
        </div>
      </div>
      <div className="px-5 py-6 max-w-lg mx-auto">{children}</div>
    </div>
  );
}