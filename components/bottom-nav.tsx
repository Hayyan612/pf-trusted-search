"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Sparkles, Heart, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShortlist } from "@/lib/shortlist";

const items = [
  { href: "/", label: "Scout", icon: Sparkles },
  { href: "/search?kind=rent", label: "Search", icon: Search, match: "/search" },
  { href: "/shortlist", label: "Shortlist", icon: Heart },
  { href: "/agent", label: "Agent view", icon: Briefcase },
];

export function BottomNav() {
  const path = usePathname();
  const { items: saved } = useShortlist();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match ? path.startsWith(match) : path === href.split("?")[0];
          return (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground",
                  active && "text-primary",
                )}
              >
                <Icon className="size-5" />
                {label}
                {label === "Shortlist" && saved.length > 0 && (
                  <span className="absolute top-1.5 right-[26%] grid size-4 place-items-center rounded-full bg-[var(--brand)] text-[10px] text-white">
                    {saved.length}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
