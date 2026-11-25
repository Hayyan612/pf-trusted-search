"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/** The ad's own text, with its line breaks, collapsed to a preview like Property Finder's "See full description". */
export function ListingDescription({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 420 || text.split("\n").length > 9;
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="relative">
        <p className={cn("text-[14px] leading-relaxed whitespace-pre-line text-muted-foreground", long && !open && "line-clamp-[9]")}>{text}</p>
        {long && !open && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />}
      </div>
      <CollapsibleContent />
      {long && (
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="mt-3">
            {open ? "Show less" : "See full description"}
            <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
      )}
    </Collapsible>
  );
}
