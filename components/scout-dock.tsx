"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ListingScout } from "@/components/listing-scout";
import { AD_QUESTIONS } from "@/lib/ad-answers";
import type { Listing } from "@/lib/data";

const PANEL_W = 420;
const DESKTOP = "(min-width: 1024px)";
const EASE = [0.22, 1, 0.36, 1] as const;

function useDesktop() {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(DESKTOP); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );
}

function Title({ listing }: { listing: Listing }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[var(--brand)] text-white shadow"><Sparkles className="size-4" /></span>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold">Ask Scout about this flat</div>
        <div className="truncate text-[12px] text-muted-foreground">Answers from the ad. If it does not say, Scout asks {listing.agent}.</div>
      </div>
    </div>
  );
}

/**
 * Scout beside the listing. On desktop it docks on the right and the page makes room, so you can read the ad
 * and ask at the same time. On phones it is a bottom sheet. A small teaser stays in the page.
 */
export function ScoutDock({ listing }: { listing: Listing }) {
  const desktop = useDesktop();
  const [open, setOpen] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const ask = (id: string) => setAsked((x) => (x.includes(id) ? x : [...x, id]));
  const openWith = (id?: string) => { if (id) ask(id); setOpen(true); };

  // Other buttons on the page (e.g. the agent card) open the dock with this event.
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener("scout:open", on);
    return () => window.removeEventListener("scout:open", on);
  }, []);

  // Desktop: the page shifts left to make room instead of being covered.
  useEffect(() => {
    const root = document.documentElement;
    root.style.transition = "padding-right 300ms cubic-bezier(0.22,1,0.36,1)";
    root.style.paddingRight = open && desktop ? `${PANEL_W}px` : "";
    return () => { root.style.paddingRight = ""; };
  }, [open, desktop]);

  const panel = <ListingScout listing={listing} bare asked={asked} onAsk={ask} />;

  return (
    <>
      {/* Teaser in the page */}
      <Card className="gap-3 border-primary/25 p-4">
        <Title listing={listing} />
        <div className="flex flex-wrap gap-1.5">
          {AD_QUESTIONS(listing).slice(0, 4).map((d) => (
            <button key={d.id} type="button" onClick={() => openWith(d.id)} className="rounded-full border border-primary/25 px-3 py-1.5 text-[12px] text-primary transition-colors hover:bg-accent">{d.q}</button>
          ))}
          <button type="button" onClick={() => openWith()} className="rounded-full bg-accent px-3 py-1.5 text-[12px] font-medium text-primary hover:bg-accent/70">Negotiation brief</button>
        </div>
      </Card>

      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25, ease: EASE }} className="fixed right-4 bottom-36 z-40 md:bottom-8">
            <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-primary/30 motion-reduce:hidden" />
            <Button size="lg" onClick={() => openWith()} className="rounded-full shadow-lg shadow-primary/30"><Sparkles /> Ask Scout</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: docked side panel, no overlay */}
      <AnimatePresence>
        {open && desktop && (
          <motion.aside
            key="dock"
            initial={{ x: PANEL_W }}
            animate={{ x: 0 }}
            exit={{ x: PANEL_W }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ width: PANEL_W }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col border-l bg-background shadow-2xl"
            aria-label="Ask Scout about this flat"
          >
            <div className="flex items-center justify-between gap-2 border-b p-4">
              <Title listing={listing} />
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close Scout"><X /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{panel}</div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Phone: bottom sheet */}
      {!desktop && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="flex max-h-[88dvh] flex-col gap-0 rounded-t-2xl p-0">
            <SheetHeader className="border-b">
              <SheetTitle className="sr-only">Ask Scout about this flat</SheetTitle>
              <SheetDescription className="sr-only">Answers from the ad, and a negotiation brief.</SheetDescription>
              <Title listing={listing} />
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">{panel}</div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
