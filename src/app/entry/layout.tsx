"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="entry-layout">
      <div className="entry-topbar">
        <Link href="/employee"><ArrowLeft size={18} /></Link>
        <h1>Data Entry</h1>
      </div>
      <div className="entry-content">{children}</div>
    </div>
  );
}