"use client";

import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Opens the docked Scout panel from anywhere on the listing page. */
export function OpenScoutButton({ className }: { className?: string }) {
  return (
    <Button variant="secondary" className={className} onClick={() => window.dispatchEvent(new Event("scout:open"))}>
      <MessageCircleQuestion /> Ask Scout about this flat
    </Button>
  );
}
