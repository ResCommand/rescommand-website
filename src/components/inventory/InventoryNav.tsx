"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Package, ShoppingCart, BarChart3 } from "lucide-react";

const TABS = [
  { href: "/inventory", label: "Count", icon: ClipboardList, exact: true },
  { href: "/inventory/items", label: "Items", icon: Package },
  { href: "/inventory/order-requests", label: "Orders", icon: ShoppingCart },
  { href: "/inventory/valuation", label: "Reports", icon: BarChart3 },
];

export default function InventoryNav() {
  const pathname = usePathname();

  return (
    <nav className="inv-tab-nav" aria-label="Inventory sections">
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inv-tab-item ${isActive ? "inv-tab-active" : ""}`}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
