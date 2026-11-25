"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useShortlist } from "@/lib/shortlist";

export function TopNav() {
  const path = usePathname();
  const sp = useSearchParams();
  const { items } = useShortlist();
  const kind = sp.get("kind");
  const links = [
    { href: "/assistant", label: "Scout assistant", active: path === "/assistant" },
    { href: "/search?kind=sale", label: "Buy", active: path === "/search" && kind === "sale" },
    { href: "/search?kind=rent", label: "Rent", active: path === "/search" && kind !== "sale" },
    { href: "/shortlist", label: `Shortlist${items.length ? ` (${items.length})` : ""}`, active: path === "/shortlist" },
    { href: "/how", label: "How it decides", active: path === "/how" },
  ];
  return (
    <nav className="hidden flex-1 items-center gap-1 md:flex">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn("rounded-full px-3 py-1.5 text-[14px] text-foreground/80 transition-colors duration-200 hover:bg-accent", l.active && "bg-accent font-medium text-primary")}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
