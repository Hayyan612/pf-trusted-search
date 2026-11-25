"use client";

import { useState } from "react";
import { ChevronDown, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function HiddenAds({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="gap-0 py-0 shadow-none">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[14px] font-medium">
          <span className="flex items-center gap-2"><EyeOff className="size-4 text-muted-foreground" /> {count} hidden as likely misleading</span>
          <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 px-4 pb-4 motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in">
          <p className="text-[13px] text-muted-foreground">Hidden, not deleted. Open one to see why. You can still contact the agent.</p>
          <div className="grid gap-4">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
